#!/usr/bin/env python3
"""V1229 Phase-1 gate: trust, privacy and account-security invariants.

Static checks only (stdlib + node for i18n). Run:  python3 scripts/qa_phase1_trust.py
Exit code 1 if any invariant is broken, so it can sit in CI next to verify_site.py.
"""
import glob, json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
rd = lambda p: (ROOT / p).read_text(encoding="utf-8")
fails = []
def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok: fails.append(name)

auth, events, shell, cfg, rules = (rd(p) for p in (
    "core/modules/auth.js", "core/events.js", "core/modules/runtime/app-shell.js", "core/config.js", "firestore.rules"))
index = rd("index.html")
stories = sorted(glob.glob(str(ROOT / "stories/*/index.html")))

# --- accounts: cloud-only, no plaintext credentials -------------------------------------------
check("no local-account fallback in auth.js", "localAccounts" not in auth and "local_" not in auth.replace("startsWith('local_')", ""))
check("legacy zivozone_accounts is only ever removed", len(re.findall(r"zivozone_accounts", auth)) == 1 and "removeItem('zivozone_accounts')" in auth)
check("password never written to storage", not re.search(r"(localStorage|sessionStorage)\.setItem\([^\n]*password", auth, re.I))

# --- age gate ----------------------------------------------------------------------------------
m = re.search(r"MIN_AGE:\s*(\d+)", cfg)
check("MIN_AGE configured and >= 13", bool(m) and int(m.group(1)) >= 13, m.group(0) if m else "missing")
check("register form uses MIN_AGE and is not pre-filled", 'min="${MIN_AGE}"' in shell and 'value="18"' not in shell and 'min="5"' not in shell)
check("auth.js enforces MIN_AGE", "age<MIN_AGE" in auth)

# --- consent is opt-in --------------------------------------------------------------------------
check("analytics allowed only when consent === 'granted'", re.search(r"function analyticsAllowed\(\)\s*\{\s*return getConsent\(\) === 'granted';", events) is not None)
check("guest telemetry gated by consent", "!analyticsConsent()" in auth)
_tg = re.search(r"async function trackGuest\(\)\{(.*?)\n  \}\n", auth, re.S)
check("guest telemetry does not read siteStats (rules forbid it)", bool(_tg) and ".get()" not in _tg.group(1))
check("consent banner mounted + footer reset wired", "mountConsent" in shell and "zivo-consent-footer" in shell)

# --- real legal pages ---------------------------------------------------------------------------
sm = rd("sitemap.xml")
for slug in ("privacy", "terms"):
    p = ROOT / slug / "index.html"
    ok = p.exists() and f'rel="canonical" href="https://zivozone.com/{slug}/"' in p.read_text(encoding="utf-8")
    check(f"/{slug}/ page exists with canonical", ok)
    check(f"/{slug}/ in sitemap", f"https://zivozone.com/{slug}/" in sm)
    check(f"/{slug}/ linked from index + all {len(stories)} story pages", all(f'href="/{slug}/"' in rd(str(Path(s).relative_to(ROOT))) for s in stories + [str(ROOT / "index.html")]))
check("old terms modal removed", "ZIVOZONE_OPEN_TERMS" not in shell + index and "zivo-terms-footer" not in index)
check("service worker never serves legal pages stale", "LEGAL_ROUTE" in rd("sw.js"))

# --- Firestore rules ----------------------------------------------------------------------------
check("admin requires verified email", "email_verified == true" in rules)
check("wallet/ledger/mining tied to same transaction (lastMiningAt == request.time)", rules.count("lastMiningAt == request.time") >= 4, str(rules.count("lastMiningAt == request.time")))
check("new player docs cannot start with a balance", "get('zivo', 0) == 0" in rules and "get('coins', 0) == 0" in rules)
check("event logs have fixed shape", "hasOnly(['event','meta','createdAt'])" in rules and "hasOnly(['event','meta','createdAt','uid'])" in rules)
check("guest visitor writes are size-bounded", all(x in rules for x in ("userAgent.size() <= 180", "referrer.size() <= 200", "visitorId.size() <= 64")))

# --- i18n: new keys are REAL translations in all 7 languages ------------------------------------
js = r"""
const fs=require('fs');global.window=global;global.dispatchEvent=()=>{};global.CustomEvent=function(){};
global.document={addEventListener(){},documentElement:{setAttribute(){},style:{}},querySelectorAll(){return[]},getElementById(){return null},querySelector(){return null},body:{}};
global.localStorage={getItem(){return null},setItem(){}};global.navigator={language:'ar'};
(0,eval)(fs.readFileSync('core/modules/runtime/i18n.js','utf8'));
const T=ZIVOZONE_I18N.T,keys=Object.keys(T.ar),tx=v=>/[A-Za-z\u0600-\u06FF]{4,}/.test(String(v));
const need=['footerTerms','footerPrivacy','footerConsent','consentTitle','consentText','consentAccept','consentDecline','termsAgree'];
const out={missing:[],fr_eq_en:[],fa_eq_ar:[],age:[]};
for(const l of ['ar','en','zh','hi','es','fr','fa'])for(const k of need)if(!T[l][k])out.missing.push(l+'.'+k);
for(const k of need){if(T.fr[k]===T.en[k])out.fr_eq_en.push(k);if(T.fa[k]===T.ar[k])out.fa_eq_ar.push(k)}
for(const l of ['ar','en','zh','hi','es'])if(!/13/.test(T[l].ageError))out.age.push(l);
out.cov={fr:keys.filter(k=>T.fr[k]===T.en[k]&&tx(T.fr[k])&&T.fr[k]!=='ZIVOZONE').length,fa:keys.filter(k=>T.fa[k]===T.ar[k]&&tx(T.fa[k])&&T.fa[k]!=='ZIVOZONE').length,total:keys.length};
console.log(JSON.stringify(out));
"""
r = subprocess.run(["node", "-e", js], cwd=ROOT, capture_output=True, text=True)
try:
    o = json.loads(r.stdout.strip().splitlines()[-1])
    check("all new i18n keys exist in 7 languages", not o["missing"], ",".join(o["missing"]))
    check("fr/fa new keys are real translations (not copies of en/ar)", not o["fr_eq_en"] and not o["fa_eq_ar"], f'{o["fr_eq_en"]} {o["fa_eq_ar"]}')
    check("ageError mentions the minimum age in every language", not o["age"], ",".join(o["age"]))
    print(f'INFO fr keys still copied from English: {o["cov"]["fr"]}/{o["cov"]["total"]} · fa keys still copied from Arabic: {o["cov"]["fa"]}/{o["cov"]["total"]}  (Phase 4)')
except Exception as e:
    check("i18n probe ran", False, (r.stderr or r.stdout)[:200])

# --- identifiers: nothing used-but-undefined (V1228 shipped closeModal() undefined => login form dead) ----------
r2 = subprocess.run(["node", "--expose-internals", "scripts/qa_undefined_identifiers.js"], cwd=ROOT, capture_output=True, text=True)
if r2.returncode == 2:
    print("WARN  undefined-identifier gate skipped (node --expose-internals unavailable)")
else:
    check("no undeclared identifiers (closeModal-class bugs)", r2.returncode == 0, r2.stdout.strip().splitlines()[0] if r2.stdout.strip() else r2.stderr[:120])

# --- honesty: no claim of server-side protection / "real wallet" until a trusted backend exists -----------------
_i18n = rd("core/modules/runtime/i18n.js")
_claims = ["محمية على مستوى خادم", "تمر عبر خادم", "protected at the ZIVOZONE server", "passes through the ZIVOZONE server", "A real wallet", "محفظة حقيقية"]
check("no false 'server-protected / real wallet' claims in the UI text", not [c for c in _claims if c in _i18n], str([c for c in _claims if c in _i18n]))

# --- one version everywhere ---------------------------------------------------------------------
v = re.search(r"\?v=(\d+\.\d+)", index).group(1)
check("config.js, stories and sw.js share the release version",
      f"APP_VERSION: '{v}'" in cfg and all(f"?v={v}" in Path(s).read_text(encoding="utf-8") and not re.search(r"\?v=(?!%s)" % re.escape(v), Path(s).read_text(encoding="utf-8")) for s in stories) and f"?v={v}" in rd("sw.js"), v)

print("\n%d check(s) failed" % len(fails) if fails else "\nALL PHASE-1 CHECKS PASSED")
sys.exit(1 if fails else 0)
