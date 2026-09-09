/* ZIVOZONE FIXTURE CENTER V13
   Free client-side fixture aggregation using public ESPN scoreboards + JFA official links.
*/
(() => {
  'use strict';
  const leagues = [
    {id:'uefa.champions', name:{ar:'دوري أبطال أوروبا',en:'UEFA Champions League',zh:'欧洲冠军联赛',hi:'यूईएफए चैंपियंस लीग',es:'Champions League'}, icon:'⭐'},
    {id:'eng.1', name:{ar:'الدوري الإنجليزي',en:'Premier League',zh:'英超',hi:'प्रीमियर लीग',es:'Premier League'}, icon:'🏴'},
    {id:'esp.1', name:{ar:'الدوري الإسباني',en:'LaLiga',zh:'西甲',hi:'ला लीगा',es:'LaLiga'}, icon:'🇪🇸'},
    {id:'ita.1', name:{ar:'الدوري الإيطالي',en:'Serie A',zh:'意甲',hi:'सीरी ए',es:'Serie A'}, icon:'🇮🇹'},
    {id:'ger.1', name:{ar:'الدوري الألماني',en:'Bundesliga',zh:'德甲',hi:'बुंडेसलीगा',es:'Bundesliga'}, icon:'🇩🇪'},
    {id:'fra.1', name:{ar:'الدوري الفرنسي',en:'Ligue 1',zh:'法甲',hi:'लीग 1',es:'Ligue 1'}, icon:'🇫🇷'}
  ];
  const jfa='https://www.jfa.jo/match_schedule_tourn.php?id=1&title=%D8%AC%D8%AF%D9%88%D9%84%20%D8%A7%D9%84%D9%85%D8%A8%D8%A7%D8%B1%D9%8A%D8%A7%D8%AA';
  const esc=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  const locale=l=>l==='ar'?'ar-JO':l==='zh'?'zh-CN':l==='hi'?'hi-IN':l==='es'?'es-ES':'en-US';
  const label=(l,lang)=>l.name[lang]||l.name.en;
  async function fetchLeague(l,days=14){
    const now=new Date(); const to=new Date(now.getTime()+days*86400000);
    const fmt=d=>d.toISOString().slice(0,10).replaceAll('-','');
    const url=`https://site.api.espn.com/apis/site/v2/sports/soccer/${l.id}/scoreboard?dates=${fmt(now)}-${fmt(to)}`;
    const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error('fixture'); const d=await r.json();
    return (d.events||[]).map(e=>({id:e.id,name:e.name,date:e.date,status:e.status?.type?.description||'',state:e.status?.type?.state||'',home:e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='home')?.team?.displayName||'',away:e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='away')?.team?.displayName||'',homeScore:e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='home')?.score,awayScore:e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='away')?.score,league:l}));
  }
  const AR={'Barcelona':'برشلونة','Feyenoord':'فينورد','VfB Stuttgart':'شتوتغارت','Viking':'فيكينغ','Viking FK':'فيكينغ','Liverpool':'ليفربول','Atletico Madrid':'أتلتيكو مدريد','Atlético de Madrid':'أتلتيكو مدريد','Napoli':'نابولي','Arsenal':'أرسنال','Paris Saint Germain':'باريس سان جيرمان','Paris Saint-Germain':'باريس سان جيرمان','Slovan Bratislava':'سلوفان براتيسلافا','Sporting CP':'سبورتينغ لشبونة','Galatasaray':'غلطة سراي','Chelsea':'تشيلسي','Leeds United':'ليدز يونايتد','Al Kholood':'الخلود','Al Shabab':'الشباب','Al Fateh':'الفتح','Al Diriyah':'الدرعية','Al Nassr':'النصر','Abha':'أبها','Rangers':'رينجرز','St. Mirren':'سانت ميرين','St. Johnstone':'سانت جونستون','Celtic':'سلتيك'};
  const arTeam=x=>AR[x]||x;
  const todayMatches=[['دوري أبطال أوروبا','برشلونة','فينورد','19:45','⭐'],['دوري أبطال أوروبا','شتوتغارت','فيكينغ','19:45','⭐'],['دوري أبطال أوروبا','ليفربول','أتلتيكو مدريد','22:00','⭐'],['دوري أبطال أوروبا','نابولي','أرسنال','22:00','⭐'],['دوري أبطال أوروبا','باريس سان جيرمان','سلوفان براتيسلافا','22:00','⭐'],['دوري أبطال أوروبا','سبورتينغ لشبونة','غلطة سراي','22:00','⭐'],['كأس الرابطة الإنجليزية','تشيلسي','ليدز يونايتد','22:00','🏆'],['الدوري السعودي','الخلود','الشباب','18:55','🇸🇦'],['الدوري السعودي','الفتح','الدرعية','21:00','🇸🇦'],['الدوري السعودي','النصر','أبها','21:00','🇸🇦'],['الدوري الإسكتلندي','رينجرز','سانت ميرين','21:45','🏴'],['الدوري الإسكتلندي','سانت جونستون','سلتيك','22:00','🏴']];
  async function loadToday(box,lang='ar'){if(!box)return;box.innerHTML=todayMatches.map(m=>`<article class="sports-card today-match-card"><div class="news-live-top"><span class="match-icon">${m[4]}</span><span class="card-tag">${esc(m[0])}</span></div><div class="today-match-time">${esc(m[3])} — 9 سبتمبر 2026</div><h3><span class="arabic-team">${esc(m[1])}</span> <span class="versus">VS</span> <span class="arabic-team">${esc(m[2])}</span></h3><p class="muted">المباراة مجدولة — تابع الحالة من مركز المباريات.</p></article>`).join('')}
  async function load(box,lang='ar'){
    if(!box)return;
    box.innerHTML=`<article class="sports-card loading-card"><div class="spinner"></div><h3>⚽ ${esc(window.zivoT?.('fixtureCenter')||'Match Center')}</h3><p>${esc(window.zivoT?.('loader')||'Loading...')}</p></article>`;
    const settled=await Promise.allSettled(leagues.map(l=>fetchLeague(l)));
    let items=[]; settled.forEach(r=>{if(r.status==='fulfilled')items.push(...r.value)});
    items.sort((a,b)=>new Date(a.date)-new Date(b.date));
    const seen=new Set();items=items.filter(x=>{if(seen.has(x.id))return false;seen.add(x.id);return true}).slice(0,36);
    const featured=items.filter(x=>x.league.id==='uefa.champions').sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
    const alert=document.querySelector('#match-alert');
    if(alert&&featured){const d=new Date(featured.date),mins=(d-Date.now())/60000;const title=mins<=180&&mins>=-150?'🔴 MATCH ALERT':'⭐ NEXT CHAMPIONS LEAGUE';alert.hidden=false;alert.innerHTML=`<div><span class="match-alert-kicker">${title}</span><strong>${esc(featured.home)} <span>VS</span> ${esc(featured.away)}</strong><small>${esc(d.toLocaleString(locale(lang),{dateStyle:'medium',timeStyle:'short'}))}</small></div><span class="match-alert-note">${esc(window.zivoT?.('matchAlertText')||'تابع الموعد والتفاصيل من مركز المباريات.')}</span>`;}
    const cards=items.map(x=>{const d=new Date(x.date);const live=x.state==='in';const final=x.state==='post';const time=d.toLocaleString(locale(lang),{dateStyle:'medium',timeStyle:'short'});const score=(x.homeScore!=null&&x.awayScore!=null)?`<strong>${esc(x.homeScore)} - ${esc(x.awayScore)}</strong>`:'';return `<article class="sports-card fixture-card ${live?'fixture-live':''}"><div class="news-live-top"><span class="match-icon">${x.league.icon}</span><span class="card-tag ${live?'live-dot':''}">${esc(label(x.league,lang))}</span></div><h3>${esc(arTeam(x.home))} <span class="versus">VS</span> ${esc(arTeam(x.away))}</h3><p>${esc(time)}</p><div class="fixture-status">${live?'🔴 LIVE':final?'🏁 '+(window.zivoT?.('finished')||'Finished'):'⏱ '+(window.zivoT?.('upcoming')||'Upcoming')} ${score}</div></article>`}).join('');
    const jordan=`<article class="sports-card jordan-fixture-card"><div class="match-icon">🇯🇴</div><span class="card-tag">${esc(window.zivoT?.('jordanFootballNews')||'Jordan Football')}</span><h3>${esc(window.zivoT?.('jordanSchedule')||'Jordan Pro League')}</h3><p>${esc(window.zivoT?.('jordanScheduleText')||'Official upcoming fixtures and kick-off times from the Jordan Football Association.')}</p><a class="btn btn-ghost" href="${jfa}" target="_blank" rel="noopener noreferrer">${esc(window.zivoT?.('officialSchedule')||'Official schedule')}</a></article>`;
    box.innerHTML=(cards||'')+jordan;
  }
  window.ZIVOZONE_FIXTURES={load,loadToday};
})();
