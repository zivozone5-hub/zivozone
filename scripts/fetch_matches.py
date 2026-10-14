#!/usr/bin/env python3
# ZIVOZONE V1180 — Match Data Engine
# Architecture: Discovery (TheSportsDB) -> Coverage adapters (ESPN) -> Normalizer -> Merge/Dedupe -> Static Store.
# Free-only. No paid API key. Never replaces good data with an empty result.
import json, urllib.request, urllib.error, time, re, os
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"data"/"matches"
OUT.mkdir(parents=True,exist_ok=True)
TZ=ZoneInfo("Asia/Amman")
TODAY=datetime.now(TZ).date()

# Seven previous + today + seven future for browsing. ESPN enrichment is focused on the
# three primary tabs to keep GitHub Actions fast and respectful of free endpoints.
DAYS=[TODAY+timedelta(days=i) for i in range(-7,8)]
PRIMARY_DAYS={TODAY+timedelta(days=i) for i in (-1,0,1)}

LEAGUES=[["fifa.world", "كأس العالم", "🌍"], ["fifa.worldq", "تصفيات كأس العالم", "🌍"], ["fifa.worldq.uefa", "تصفيات كأس العالم - أوروبا", "🇪🇺"], ["fifa.worldq.afc", "تصفيات كأس العالم - آسيا", "🌏"], ["fifa.worldq.caf", "تصفيات كأس العالم - أفريقيا", "🌍"], ["fifa.worldq.conmebol", "تصفيات كأس العالم - أمريكا الجنوبية", "🌎"], ["fifa.cwc", "كأس العالم للأندية", "🌍"], ["fifa.friendly", "مباريات دولية ودية", "🌐"], ["uefa.champions", "دوري أبطال أوروبا", "⭐"], ["uefa.champions_qual", "تصفيات دوري أبطال أوروبا", "⭐"], ["uefa.europa", "الدوري الأوروبي", "🏆"], ["uefa.europa_qual", "تصفيات الدوري الأوروبي", "🏆"], ["uefa.europa.conf", "دوري المؤتمر الأوروبي", "🏆"], ["uefa.europa.conf_qual", "تصفيات دوري المؤتمر الأوروبي", "🏆"], ["uefa.super_cup", "كأس السوبر الأوروبي", "🏆"], ["uefa.euro", "بطولة أمم أوروبا", "🇪🇺"], ["uefa.euroq", "تصفيات أمم أوروبا", "🇪🇺"], ["uefa.nations", "دوري الأمم الأوروبية", "🇪🇺"], ["uefa.euro_u21", "بطولة أوروبا تحت 21 عامًا", "🇪🇺"], ["eng.1", "الدوري الإنجليزي الممتاز", "🏴"], ["eng.2", "دوري البطولة الإنجليزية", "🏴"], ["eng.3", "الدوري الإنجليزي الأول", "🏴"], ["eng.4", "الدوري الإنجليزي الثاني", "🏴"], ["eng.5", "الدوري الوطني الإنجليزي", "🏴"], ["eng.fa", "كأس الاتحاد الإنجليزي", "🏆"], ["eng.league_cup", "كأس الرابطة الإنجليزية", "🏆"], ["eng.trophy", "كأس رابطة الأندية الإنجليزية", "🏆"], ["esp.1", "الدوري الإسباني", "🇪🇸"], ["esp.2", "الدوري الإسباني الدرجة الثانية", "🇪🇸"], ["esp.copa_del_rey", "كأس ملك إسبانيا", "🏆"], ["esp.super_cup", "كأس السوبر الإسباني", "🏆"], ["ger.1", "الدوري الألماني", "🇩🇪"], ["ger.2", "الدوري الألماني الدرجة الثانية", "🇩🇪"], ["ger.dfb_pokal", "كأس ألمانيا", "🏆"], ["ger.super_cup", "كأس السوبر الألماني", "🏆"], ["ita.1", "الدوري الإيطالي", "🇮🇹"], ["ita.2", "الدوري الإيطالي الدرجة الثانية", "🇮🇹"], ["ita.coppa_italia", "كأس إيطاليا", "🏆"], ["ita.super_cup", "كأس السوبر الإيطالي", "🏆"], ["fra.1", "الدوري الفرنسي", "🇫🇷"], ["fra.2", "الدوري الفرنسي الدرجة الثانية", "🇫🇷"], ["fra.coupe_de_france", "كأس فرنسا", "🏆"], ["fra.super_cup", "كأس السوبر الفرنسي", "🏆"], ["ned.1", "الدوري الهولندي", "🇳🇱"], ["ned.2", "الدوري الهولندي الدرجة الثانية", "🇳🇱"], ["ned.cup", "كأس هولندا", "🏆"], ["por.1", "الدوري البرتغالي", "🇵🇹"], ["por.taca.portugal", "كأس البرتغال", "🏆"], ["bel.1", "الدوري البلجيكي", "🇧🇪"], ["aut.1", "الدوري النمساوي", "🇦🇹"], ["gre.1", "الدوري اليوناني", "🇬🇷"], ["tur.1", "الدوري التركي", "🇹🇷"], ["den.1", "الدوري الدنماركي", "🇩🇰"], ["nor.1", "الدوري النرويجي", "🇳🇴"], ["swe.1", "الدوري السويدي", "🇸🇪"], ["sco.1", "الدوري الاسكتلندي الممتاز", "🏴"], ["sco.2", "الدوري الاسكتلندي الدرجة الثانية", "🏴"], ["rus.1", "الدوري الروسي", "🇷🇺"], ["usa.1", "الدوري الأمريكي", "🇺🇸"], ["usa.nwsl", "الدوري الأمريكي للسيدات", "🇺🇸"], ["mex.1", "الدوري المكسيكي", "🇲🇽"], ["bra.1", "الدوري البرازيلي", "🇧🇷"], ["conmebol.libertadores", "كأس ليبرتادوريس", "🏆"], ["conmebol.sudamericana", "كأس سودأمريكانا", "🏆"], ["arg.1", "الدوري الأرجنتيني", "🇦🇷"], ["col.1", "الدوري الكولومبي", "🇨🇴"], ["caf.nations", "كأس أمم أفريقيا", "🌍"], ["caf.nations_qual", "تصفيات كأس أمم أفريقيا", "🌍"], ["caf.champions", "دوري أبطال أفريقيا", "🌍"], ["caf.confed", "كأس الكونفدرالية الأفريقية", "🌍"], ["rsa.1", "الدوري الجنوب أفريقي", "🇿🇦"], ["nga.1", "الدوري النيجيري", "🇳🇬"], ["gha.1", "الدوري الغاني", "🇬🇭"], ["afc.champions", "دوري أبطال آسيا للنخبة", "🌏"], ["afc.cup", "دوري أبطال آسيا 2", "🌏"], ["afc.asian.cup", "كأس آسيا", "🌏"], ["ksa.1", "الدوري السعودي", "🇸🇦"], ["ksa.kings.cup", "كأس خادم الحرمين الشريفين", "🇸🇦"], ["jpn.1", "الدوري الياباني", "🇯🇵"], ["chn.1", "الدوري الصيني", "🇨🇳"], ["ind.1", "الدوري الهندي", "🇮🇳"], ["tha.1", "الدوري التايلندي", "🇹🇭"], ["mys.1", "الدوري الماليزي", "🇲🇾"], ["idn.1", "الدوري الإندونيسي", "🇮🇩"], ["sgp.1", "الدوري السنغافوري", "🇸🇬"], ["aus.1", "الدوري الأسترالي", "🇦🇺"], ["club.friendly", "مباريات ودية للأندية", "⚽"], ["fifa.wwc", "كأس العالم للسيدات", "🌍"], ["fifa.world.u20", "كأس العالم تحت 20 عامًا", "🌍"], ["fifa.world.u17", "كأس العالم تحت 17 عامًا", "🌍"], ["fifa.wworld.u17", "كأس العالم للسيدات تحت 17 عامًا", "🌍"], ["fifa.friendly.w", "مباريات دولية ودية للسيدات", "🌐"], ["fifa.friendly_u21", "مباريات دولية ودية تحت 21 عامًا", "🌐"], ["uefa.wchampions", "دوري أبطال أوروبا للسيدات", "⭐"], ["uefa.weuro", "بطولة أوروبا للسيدات", "🇪🇺"], ["uefa.w.nations", "دوري الأمم الأوروبية للسيدات", "🇪🇺"], ["uefa.euro_u21_qual", "تصفيات أوروبا تحت 21 عامًا", "🇪🇺"], ["uefa.euro.u19", "بطولة أوروبا تحت 19 عامًا", "🇪🇺"], ["eng.charity", "درع المجتمع الإنجليزي", "🏆"], ["eng.w.1", "الدوري الإنجليزي للسيدات", "🏴"], ["eng.w.fa", "كأس الاتحاد الإنجليزي للسيدات", "🏆"], ["esp.w.1", "الدوري الإسباني للسيدات", "🇪🇸"], ["esp.copa_de_la_reina", "كأس ملكة إسبانيا", "🏆"], ["ger.w.1", "الدوري الألماني للسيدات", "🇩🇪"], ["ita.w.1", "الدوري الإيطالي للسيدات", "🇮🇹"], ["fra.w.1", "الدوري الفرنسي للسيدات", "🇫🇷"], ["usa.open", "كأس الولايات المتحدة", "🇺🇸"], ["usa.usl.1", "دوري USL الأمريكي", "🇺🇸"], ["usa.usl.l1", "دوري USL الأمريكي الأول", "🇺🇸"], ["usa.w.usl.1", "الدوري الأمريكي للسيدات", "🇺🇸"], ["usa.ncaa.m.1", "كرة القدم الجامعية الأمريكية للرجال", "🇺🇸"], ["concacaf.champions", "دوري أبطال الكونكاكاف", "🌎"], ["concacaf.leagues.cup", "كأس الدوريات", "🌎"], ["concacaf.gold", "الكأس الذهبية", "🌎"], ["concacaf.nations.league", "دوري أمم الكونكاكاف", "🌎"], ["conmebol.recopa", "كأس ريكوبا سودأمريكانا", "🏆"], ["conmebol.america", "كوبا أمريكا", "🌎"], ["conmebol.america_qual", "تصفيات كوبا أمريكا", "🌎"], ["par.1", "الدوري الباراغوياني", "🇵🇾"], ["per.1", "الدوري البيروفي", "🇵🇪"], ["uru.1", "الدوري الأوروغوياني", "🇺🇾"], ["bol.1", "الدوري البوليفي", "🇧🇴"], ["ecu.1", "الدوري الإكوادوري", "🇪🇨"], ["ven.1", "الدوري الفنزويلي", "🇻🇪"], ["chi.1", "الدوري التشيلي", "🇨🇱"], ["bra.2", "الدوري البرازيلي الدرجة الثانية", "🇧🇷"], ["bra.copa_do_brazil", "كأس البرازيل", "🏆"], ["arg.copa", "كأس الأرجنتين", "🏆"], ["aus.w.1", "الدوري الأسترالي للسيدات", "🇦🇺"], ["jor.1", "الدوري الأردني للمحترفين", "🇯🇴"], ["irq.1", "الدوري العراقي الممتاز", "🇮🇶"], ["qat.1", "الدوري القطري", "🇶🇦"], ["uae.1", "الدوري الإماراتي", "🇦🇪"], ["egy.1", "الدوري المصري الممتاز", "🇪🇬"], ["mar.1", "الدوري المغربي", "🇲🇦"], ["tun.1", "الدوري التونسي", "🇹🇳"], ["alg.1", "الدوري الجزائري", "🇩🇿"]]
LEAGUE_MAP={x[0]:x for x in LEAGUES}

AR_ALIASES={
  "English Premier League":"الدوري الإنجليزي الممتاز","English Championship":"دوري البطولة الإنجليزية",
  "English League One":"الدوري الإنجليزي الأول","English League Two":"الدوري الإنجليزي الثاني",
  "English National League":"الدوري الوطني الإنجليزي","Spanish LALIGA":"الدوري الإسباني",
  "Spanish LALIGA 2":"الدوري الإسباني الدرجة الثانية","Spanish Copa del Rey":"كأس ملك إسبانيا",
  "German Bundesliga":"الدوري الألماني","German Bundesliga 2":"الدوري الألماني الدرجة الثانية",
  "Italian Serie A":"الدوري الإيطالي","Italian Serie B":"الدوري الإيطالي الدرجة الثانية",
  "French Ligue 1":"الدوري الفرنسي","French Ligue 2":"الدوري الفرنسي الدرجة الثانية",
  "UEFA Champions League":"دوري أبطال أوروبا","UEFA Europa League":"الدوري الأوروبي",
  "UEFA Conference League":"دوري المؤتمر الأوروبي","UEFA Nations League":"دوري الأمم الأوروبية",
  "FIFA World Cup":"كأس العالم","FIFA Club World Cup":"كأس العالم للأندية",
  "MLS":"الدوري الأمريكي","Mexican Liga BBVA MX":"الدوري المكسيكي",
  "Brazilian Serie A":"الدوري البرازيلي","Argentine Liga Profesional de Futbol":"الدوري الأرجنتيني",
  "Saudi Pro League":"الدوري السعودي","AFC Champions League Elite":"دوري أبطال آسيا للنخبة",
  "AFC Champions League Two":"دوري أبطال آسيا 2","J.League":"الدوري الياباني",
  "Chinese Super League":"الدوري الصيني","Indian Super League":"الدوري الهندي",
  "Australian A-League Men":"الدوري الأسترالي","South African Premiership":"الدوري الجنوب أفريقي",
  "Nigerian Professional League":"الدوري النيجيري","Ghanaian Premier League":"الدوري الغاني",
  "Jordanian Pro League":"الدوري الأردني للمحترفين","Iraqi Premier League":"الدوري العراقي الممتاز",
  "Qatar Stars League":"الدوري القطري","UAE Pro League":"الدوري الإماراتي",
  "Egyptian Premier League":"الدوري المصري الممتاز","Botola Pro":"الدوري المغربي",
  "Tunisian Ligue Professionnelle 1":"الدوري التونسي","Algerian Ligue Professionnelle 1":"الدوري الجزائري",
  "American USL League One":"دوري USL الأمريكي الأول","American USL Championship":"دوري USL الأمريكي",
}

def http_json(url, timeout=18, retries=2):
    last=None
    for attempt in range(retries+1):
        try:
            req=urllib.request.Request(url,headers={
                "User-Agent":"ZIVOZONE-MatchCenter/1180 (+https://zivozone.com)",
                "Accept":"application/json,text/plain,*/*",
            })
            with urllib.request.urlopen(req,timeout=timeout) as r:
                if r.status != 200: raise RuntimeError(f"HTTP {r.status}")
                return json.loads(r.read().decode("utf-8","replace"))
        except Exception as e:
            last=e
            if attempt<retries: time.sleep(0.6*(attempt+1))
    raise last

def arabic_league(name):
    name=(name or "").strip()
    return AR_ALIASES.get(name,name if re.search(r"[\u0600-\u06ff]",name) else "بطولة كرة القدم")

def norm_text(v):
    return re.sub(r"[^\w\u0600-\u06ff]+","",str(v or "").lower())

def fingerprint(x):
    return (x.get("dateKey",""), *sorted([norm_text(x.get("home")),norm_text(x.get("away"))]))

def normalize_tsdb(e, day):
    league_raw=e.get("strLeague") or "بطولة كرة القدم"
    league=arabic_league(league_raw)
    ts=e.get("strTimestamp")
    dt=ts or f"{e.get('dateEvent') or day.isoformat()}T{e.get('strTime') or '00:00:00'}Z"
    s=str(e.get("strStatus") or e.get("strProgress") or "").lower()
    if re.search(r"post|final|finished|ended",s): st="FINISHED"
    elif re.search(r"live|progress",s): st="LIVE"
    elif "half" in s: st="HALFTIME"
    else: st="UPCOMING"
    return {
      "id":"tsdb-"+str(e.get("idEvent") or fingerprint({"dateKey":day.isoformat(),"home":e.get("strHomeTeam"),"away":e.get("strAwayTeam")})),
      "league":{"id":"tsdb-"+str(e.get("idLeague") or league_raw),"key":"tsdb-"+str(e.get("idLeague") or league_raw),"ar":league,"icon":"⚽"},
      "leagueName":league,"leagueRaw":league_raw,"leagueKey":"tsdb-"+str(e.get("idLeague") or league_raw),
      "date":dt,"dateKey":day.isoformat(),"home":e.get("strHomeTeam") or "الفريق المضيف","away":e.get("strAwayTeam") or "الفريق الضيف",
      "homeShort":e.get("strHomeTeam") or "المضيف","awayShort":e.get("strAwayTeam") or "الضيف",
      "homeLogo":e.get("strHomeTeamBadge") or "","awayLogo":e.get("strAwayTeamBadge") or "",
      "homeScore":e.get("intHomeScore"),"awayScore":e.get("intAwayScore"),"status":st,
      "statusText":e.get("strStatus") or ({"LIVE":"مباشر","HALFTIME":"استراحة","FINISHED":"انتهت","UPCOMING":"قادمة"}.get(st,"قادمة")),
      "venue":e.get("strVenue") or "","city":e.get("strCity") or "","broadcast":[],
      "source":"TheSportsDB","sourceLeagueId":str(e.get("idLeague") or ""), "summaryUrl":("https://www.thesportsdb.com/event/"+str(e.get("idEvent"))) if e.get("idEvent") else ""
    }

def tsdb_day(day):
    try:
        data=http_json(f"https://www.thesportsdb.com/api/v1/json/123/eventsday.php?s=Soccer&d={day.isoformat()}")
        return [normalize_tsdb(e,day) for e in (data.get("events") or [])]
    except Exception as e:
        print("TSDB",day,"FAILED",e)
        return []

def normalize_espn(e, lid, ar, icon, day):
    c=(e.get("competitions") or [{}])[0]
    comps=c.get("competitors") or []
    h=next((x for x in comps if x.get("homeAway")=="home"),{})
    a=next((x for x in comps if x.get("homeAway")=="away"),{})
    t=(e.get("status") or {}).get("type") or {}
    st="FINISHED" if t.get("state")=="post" else ("LIVE" if t.get("state")=="in" else "UPCOMING")
    if t.get("name","").lower().find("halftime")>=0: st="HALFTIME"
    teamh=h.get("team") or {}; teama=a.get("team") or {}
    return {
      "id":"espn-"+str(e.get("id")),"league":{"id":lid,"key":lid,"ar":ar,"icon":icon},
      "leagueName":ar,"leagueRaw":ar,"leagueKey":lid,"date":e.get("date"),
      "dateKey":day.isoformat(),"home":teamh.get("displayName") or "الفريق المضيف","away":teama.get("displayName") or "الفريق الضيف",
      "homeShort":teamh.get("shortDisplayName") or teamh.get("displayName") or "المضيف",
      "awayShort":teama.get("shortDisplayName") or teama.get("displayName") or "الضيف",
      "homeLogo":teamh.get("logo") or "","awayLogo":teama.get("logo") or "",
      "homeScore":h.get("score"),"awayScore":a.get("score"),"status":st,
      "statusText":t.get("detail") or ({"LIVE":"مباشر","HALFTIME":"استراحة","FINISHED":"انتهت","UPCOMING":"قادمة"}.get(st,"قادمة")),
      "venue":(c.get("venue") or {}).get("fullName") or "","city":((c.get("venue") or {}).get("address") or {}).get("city") or "",
      "broadcast":[n for b in (c.get("broadcasts") or []) for n in (b.get("names") or [])][:3],
      "source":"ESPN","sourceLeagueId":lid,"summaryUrl":f"https://site.api.espn.com/apis/site/v2/sports/soccer/{lid}/summary?event={e.get('id')}"
    }

def espn_day(day):
    # Only the primary 3 days are enriched by ESPN. TSDB remains the all-league discovery source.
    if day not in PRIMARY_DAYS: return []
    ds=day.strftime("%Y%m%d")
    out=[]
    def one(item):
        lid,ar,icon=item
        try:
            d=http_json(f"https://site.api.espn.com/apis/site/v2/sports/soccer/{lid}/scoreboard?dates={ds}",timeout=12,retries=1)
            return [normalize_espn(e,lid,ar,icon,day) for e in (d.get("events") or [])]
        except Exception: return []
    with ThreadPoolExecutor(max_workers=24) as ex:
        fs=[ex.submit(one,x) for x in LEAGUES]
        for f in as_completed(fs):
            try: out.extend(f.result())
            except Exception: pass
    return out

def merge(rows):
    by={}
    for x in rows:
        k=fingerprint(x)
        if k not in by:
            by[k]=x
            continue
        a=by[k]
        # Prefer the record with logos, venue and explicit status, but retain the richest fields.
        for field in ("homeLogo","awayLogo","venue","city","broadcast","summaryUrl","homeScore","awayScore"):
            if (not a.get(field)) and x.get(field): a[field]=x[field]
        if x.get("status") in ("LIVE","HALFTIME","FINISHED") and a.get("status")=="UPCOMING": a["status"]=x["status"]
        if x.get("statusText") and a.get("status")!="UPCOMING": a["statusText"]=x["statusText"]
        a["source"]="ESPN + TheSportsDB"
    return sorted(by.values(),key=lambda x:x.get("date") or "")

# Read previous static data first. This prevents a temporary provider outage from blanking the site.
old={}
for f in OUT.glob("*.json"):
    if f.name in ("index.json","manifest.json"): continue
    try:
        obj=json.loads(f.read_text(encoding="utf-8"))
        old[f.stem]=obj.get("matches") or []
    except Exception: pass


# Verified emergency fallback. Only real scheduled/reported fixtures are used.
# It prevents a provider outage from publishing an empty Match Center.
FALLBACK=[{'id': 'jfa-jor1-20260919-shabab-hussein', 'date': '2026-09-19T19:00:00+03:00', 'dateKey': '2026-09-19', 'leagueId': 'jor.1', 'leagueName': 'الدوري الأردني للمحترفين', 'leagueKey': 'jor.1', 'league': {'id': 'jor.1', 'key': 'jor.1', 'ar': 'الدوري الأردني للمحترفين', 'icon': '🇯🇴'}, 'home': 'شباب الأردن', 'away': 'الحسين', 'homeShort': 'شباب الأردن', 'awayShort': 'الحسين', 'homeLogo': '', 'awayLogo': '', 'homeScore': None, 'awayScore': None, 'status': 'UPCOMING', 'statusText': 'قادمة', 'venue': 'ستاد الملك عبد الله', 'city': 'عمّان', 'broadcast': [], 'source': 'JFA', 'sourceUrl': 'https://www.jfa.jo/match_schedule_tourn.php?id=1&title=جدول المباريات'}, {'id': 'jfa-jor1-20260920-baqaa-faisaly', 'date': '2026-09-20T19:00:00+03:00', 'dateKey': '2026-09-20', 'leagueId': 'jor.1', 'leagueName': 'الدوري الأردني للمحترفين', 'leagueKey': 'jor.1', 'league': {'id': 'jor.1', 'key': 'jor.1', 'ar': 'الدوري الأردني للمحترفين', 'icon': '🇯🇴'}, 'home': 'البقعة', 'away': 'الفيصلي', 'homeShort': 'البقعة', 'awayShort': 'الفيصلي', 'homeLogo': '', 'awayLogo': '', 'homeScore': None, 'awayScore': None, 'status': 'UPCOMING', 'statusText': 'قادمة', 'venue': 'ستاد عمان الدولي', 'city': 'عمّان', 'broadcast': [], 'source': 'JFA', 'sourceUrl': 'https://www.jfa.jo/match_schedule_tourn.php?id=1&title=جدول المباريات'}, {'id': 'jfa-shield-20260919-arabi-jazira', 'date': '2026-09-19T17:00:00+03:00', 'dateKey': '2026-09-19', 'leagueId': 'jor.shield', 'leagueName': 'درع الاتحاد الأردني', 'leagueKey': 'jor.shield', 'league': {'id': 'jor.shield', 'key': 'jor.shield', 'ar': 'درع الاتحاد الأردني', 'icon': '🇯🇴'}, 'home': 'العربي', 'away': 'الجزيرة', 'homeShort': 'العربي', 'awayShort': 'الجزيرة', 'homeLogo': '', 'awayLogo': '', 'homeScore': None, 'awayScore': None, 'status': 'UPCOMING', 'statusText': 'قادمة', 'venue': '', 'city': 'عمّان', 'broadcast': [], 'source': 'JFA', 'sourceUrl': 'https://jfa.jo/tourn.php?id=2&idcat=6&idsubcat=29&title=JFA-Shield'}, {'id': 'laliga-20260919-sevilla-barcelona', 'date': '2026-09-19T22:00:00+03:00', 'dateKey': '2026-09-19', 'leagueId': 'esp.1', 'leagueName': 'الدوري الإسباني', 'leagueKey': 'esp.1', 'league': {'id': 'esp.1', 'key': 'esp.1', 'ar': 'الدوري الإسباني', 'icon': '🇪🇸'}, 'home': 'Sevilla', 'away': 'Barcelona', 'homeShort': 'Sevilla', 'awayShort': 'Barcelona', 'homeLogo': '', 'awayLogo': '', 'homeScore': None, 'awayScore': None, 'status': 'UPCOMING', 'statusText': 'قادمة', 'venue': 'Estadio Ramón Sánchez Pizjuán', 'city': 'إشبيلية', 'broadcast': [], 'source': 'Verified fallback', 'sourceUrl': 'https://www.fotmob.com/en-GB/matches/sevilla-vs-barcelona/2de86m'}, {'id': 'epl-20260919-brighton-arsenal', 'date': '2026-09-19T17:00:00+03:00', 'dateKey': '2026-09-19', 'leagueId': 'eng.1', 'leagueName': 'الدوري الإنجليزي الممتاز', 'leagueKey': 'eng.1', 'league': {'id': 'eng.1', 'key': 'eng.1', 'ar': 'الدوري الإنجليزي الممتاز', 'icon': '🏴'}, 'home': 'Brighton & Hove Albion', 'away': 'Arsenal', 'homeShort': 'Brighton', 'awayShort': 'Arsenal', 'homeLogo': '', 'awayLogo': '', 'homeScore': 3, 'awayScore': 0, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': '', 'city': '', 'broadcast': [], 'source': 'Verified fallback', 'sourceUrl': 'https://www.theguardian.com/football/live/2026/sep/19/brighton-arsenal-newcastle-hull-more-football-clockwatch-live'}, {'id': 'epl-20260919-newcastle-hull', 'date': '2026-09-19T17:00:00+03:00', 'dateKey': '2026-09-19', 'leagueId': 'eng.1', 'leagueName': 'الدوري الإنجليزي الممتاز', 'leagueKey': 'eng.1', 'league': {'id': 'eng.1', 'key': 'eng.1', 'ar': 'الدوري الإنجليزي الممتاز', 'icon': '🏴'}, 'home': 'Newcastle United', 'away': 'Hull City', 'homeShort': 'Newcastle', 'awayShort': 'Hull', 'homeLogo': '', 'awayLogo': '', 'homeScore': 2, 'awayScore': 1, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': '', 'city': '', 'broadcast': [], 'source': 'Verified fallback', 'sourceUrl': 'https://www.theguardian.com/football/live/2026/sep/19/brighton-arsenal-newcastle-hull-more-football-clockwatch-live'}, {'id': 'epl-20260919-everton-ipswich', 'date': '2026-09-19T17:00:00+03:00', 'dateKey': '2026-09-19', 'leagueId': 'eng.1', 'leagueName': 'الدوري الإنجليزي الممتاز', 'leagueKey': 'eng.1', 'league': {'id': 'eng.1', 'key': 'eng.1', 'ar': 'الدوري الإنجليزي الممتاز', 'icon': '🏴'}, 'home': 'Everton', 'away': 'Ipswich Town', 'homeShort': 'Everton', 'awayShort': 'Ipswich', 'homeLogo': '', 'awayLogo': '', 'homeScore': 1, 'awayScore': 0, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': '', 'city': '', 'broadcast': [], 'source': 'Verified fallback', 'sourceUrl': 'https://www.theguardian.com/football/live/2026/sep/19/brighton-arsenal-newcastle-hull-more-football-clockwatch-live'}, {'id': 'epl-20260919-tottenham-villa', 'date': '2026-09-19T14:30:00+03:00', 'dateKey': '2026-09-19', 'leagueId': 'eng.1', 'leagueName': 'الدوري الإنجليزي الممتاز', 'leagueKey': 'eng.1', 'league': {'id': 'eng.1', 'key': 'eng.1', 'ar': 'الدوري الإنجليزي الممتاز', 'icon': '🏴'}, 'home': 'Tottenham Hotspur', 'away': 'Aston Villa', 'homeShort': 'Tottenham', 'awayShort': 'Aston Villa', 'homeLogo': '', 'awayLogo': '', 'homeScore': 2, 'awayScore': 3, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': 'Tottenham Hotspur Stadium', 'city': 'London', 'broadcast': [], 'source': 'Verified fallback', 'sourceUrl': 'https://www.theguardian.com/football/live/2026/sep/19/tottenham-v-aston-villa-live'}, {'id': 'jfa-jor1-20260918-arabi-jazira', 'date': '2026-09-18T18:00:00+03:00', 'dateKey': '2026-09-18', 'leagueId': 'jor.1', 'leagueName': 'الدوري الأردني للمحترفين', 'leagueKey': 'jor.1', 'league': {'id': 'jor.1', 'key': 'jor.1', 'ar': 'الدوري الأردني للمحترفين', 'icon': '🇯🇴'}, 'home': 'العربي', 'away': 'الجزيرة', 'homeShort': 'العربي', 'awayShort': 'الجزيرة', 'homeLogo': '', 'awayLogo': '', 'homeScore': 0, 'awayScore': 0, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': 'ملعب البترا', 'city': 'عمّان', 'broadcast': [], 'source': 'JFA verified', 'sourceUrl': 'https://www.jfa.jo/tourn.php?id=1&idcat=6&idsubcat=16&title=Compotions'}, {'id': 'jfa-jor1-20260918-wehdat-ramtha', 'date': '2026-09-18T20:30:00+03:00', 'dateKey': '2026-09-18', 'leagueId': 'jor.1', 'leagueName': 'الدوري الأردني للمحترفين', 'leagueKey': 'jor.1', 'league': {'id': 'jor.1', 'key': 'jor.1', 'ar': 'الدوري الأردني للمحترفين', 'icon': '🇯🇴'}, 'home': 'الوحدات', 'away': 'الرمثا', 'homeShort': 'الوحدات', 'awayShort': 'الرمثا', 'homeLogo': '', 'awayLogo': '', 'homeScore': 1, 'awayScore': 0, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': 'ستاد الملك عبد الله', 'city': 'عمّان', 'broadcast': [], 'source': 'JFA verified', 'sourceUrl': 'https://jfa.com.jo/tourn.php?id=1&idcat=6&idsubcat=16&title=Jordanian-PRO-League'}, {'id': 'epl-20260918-brentford-chelsea', 'date': '2026-09-18T22:00:00+03:00', 'dateKey': '2026-09-18', 'leagueId': 'eng.1', 'leagueName': 'الدوري الإنجليزي الممتاز', 'leagueKey': 'eng.1', 'league': {'id': 'eng.1', 'key': 'eng.1', 'ar': 'الدوري الإنجليزي الممتاز', 'icon': '🏴'}, 'home': 'Brentford', 'away': 'Chelsea', 'homeShort': 'Brentford', 'awayShort': 'Chelsea', 'homeLogo': '', 'awayLogo': '', 'homeScore': 0, 'awayScore': 3, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': '', 'city': '', 'broadcast': [], 'source': 'Verified fallback', 'sourceUrl': 'https://sba7sport.com/match-times-today/?match_date=2026-09-18'}, {'id': 'laliga-20260918-espanyol-elche', 'date': '2026-09-18T22:00:00+03:00', 'dateKey': '2026-09-18', 'leagueId': 'esp.1', 'leagueName': 'الدوري الإسباني', 'leagueKey': 'esp.1', 'league': {'id': 'esp.1', 'key': 'esp.1', 'ar': 'الدوري الإسباني', 'icon': '🇪🇸'}, 'home': 'Espanyol', 'away': 'Elche', 'homeShort': 'Espanyol', 'awayShort': 'Elche', 'homeLogo': '', 'awayLogo': '', 'homeScore': 3, 'awayScore': 1, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': '', 'city': '', 'broadcast': [], 'source': 'Verified fallback', 'sourceUrl': 'https://sba7sport.com/match-times-today/?match_date=2026-09-18'}, {'id': 'bundesliga-20260918-bayern-union', 'date': '2026-09-18T21:30:00+03:00', 'dateKey': '2026-09-18', 'leagueId': 'ger.1', 'leagueName': 'الدوري الألماني', 'leagueKey': 'ger.1', 'league': {'id': 'ger.1', 'key': 'ger.1', 'ar': 'الدوري الألماني', 'icon': '🇩🇪'}, 'home': 'Bayern Munich', 'away': 'Union Berlin', 'homeShort': 'Bayern', 'awayShort': 'Union Berlin', 'homeLogo': '', 'awayLogo': '', 'homeScore': 0, 'awayScore': 7, 'status': 'FINISHED', 'statusText': 'انتهت', 'venue': '', 'city': '', 'broadcast': [], 'source': 'Verified fallback', 'sourceUrl': 'https://sba7sport.com/match-times-today/?match_date=2026-09-18'}]
results={d.isoformat():[] for d in DAYS}
with ThreadPoolExecutor(max_workers=8) as ex:
    fs={ex.submit(tsdb_day,d):d for d in DAYS}
    for f,d in fs.items():
        try: results[d.isoformat()].extend(f.result())
        except Exception: pass

# ESPN enrichment for yesterday/today/tomorrow only.
for d in sorted(PRIMARY_DAYS):
    results[d.isoformat()].extend(espn_day(d))

written=[]
total=0
updated=0
for d in DAYS:
    key=d.isoformat()
    merged=merge(results.get(key,[]))
    old_rows=old.get(key,[])
    if not merged and old_rows:
        merged=old_rows
    if not merged and not (OUT/f"{key}.json").exists():
        # Do not publish an empty snapshot for a day we have never populated.
        continue
    path=OUT/f"{key}.json"
    payload={"version":"1197","date":key,"timezone":"Asia/Amman","matches":merged}
    text=json.dumps(payload,ensure_ascii=False,indent=2)
    if not path.exists() or path.read_text(encoding='utf-8')!=text:
        path.write_text(text,encoding='utf-8'); updated+=1
    written.append(path.name); total+=len(merged)

# If all providers returned zero and there is no usable previous snapshot, fail the job.
if total==0:
    for row in FALLBACK:
        results.setdefault(row["dateKey"], []).append(row)
    total=0
    written=[]
    for d in DAYS:
        key=d.isoformat()
        merged=merge(results.get(key,[]))
        if not merged: continue
        path=OUT/f"{key}.json"
        path.write_text(json.dumps({"version":"1197","date":key,"timezone":"Asia/Amman","matches":merged},ensure_ascii=False,indent=2),encoding="utf-8")
        written.append(path.name)
        total += len(merged)
    if total==0:
        raise SystemExit('لا توجد بيانات مباريات صالحة؛ تم إيقاف النشر لحماية آخر نسخة ناجحة.')

manifest={"version":"1197","generatedAt":datetime.now(TZ).isoformat(),"timezone":"Asia/Amman",
           "days":written,"totalMatches":total,"providers":["TheSportsDB discovery","ESPN enrichment"],
           "coverage":"بيانات محفوظة + تحديث مباشر للمباريات المتاحة، مع الحفاظ على آخر لقطة ناجحة عند تعطل المصدر."}
(OUT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
(OUT/"index.json").write_text(json.dumps({"version":"1197","generatedAt":manifest["generatedAt"],"timezone":"Asia/Amman",
    "totalMatches":total,"files":written,"provider":"TheSportsDB + ESPN merged","note":"لا يتم استبدال آخر بيانات ناجحة ببيانات فارغة."},ensure_ascii=False,indent=2),encoding="utf-8")
print(json.dumps({**manifest,"updatedFiles":updated},ensure_ascii=False,indent=2))
