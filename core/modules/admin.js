/* ZIVOZONE V1188 — OWNER OPERATIONS CENTER */
(()=>{'use strict';
 const ADMIN=()=>String(window.ZIVOZONE_CONFIG?.ADMIN_EMAIL_NORMALIZED||'').trim().toLowerCase();
 const auth=()=>window.firebase?.auth?.(),db=()=>window.firebase?.firestore?.();
 const owner=()=>String(auth()?.currentUser?.email||'').trim().toLowerCase()===ADMIN();
 const esc=window.ZIVOZONE_ESC;
 const ms=v=>v?.toMillis?.()||(typeof v==='string'?Date.parse(v)||0:Number(v)||0);
 const fmt=v=>v?new Date(v).toLocaleString('ar-JO',{dateStyle:'medium',timeStyle:'short'}):'—';
 const safe=async(fn,fall)=>{try{return await fn()}catch(e){console.warn('Admin Core',e);return fall}};
 // V1230.71 — traffic-source + device breakdown. referrer/userAgent are already written per guest
 // visitor doc (core/modules/auth.js trackGuest()) and already fetched by collect(); this just reads
 // them, no new Firestore cost.
 const SOURCE_LABELS={direct:'🔗 رابط مباشر',whatsapp:'💬 واتساب',facebook:'🔵 فيسبوك',instagram:'📸 إنستغرام',twitter:'✖️ تويتر/X',tiktok:'🎵 تيك توك',telegram:'✈️ تيليغرام',google:'🔍 جوجل (بحث)',youtube:'▶️ يوتيوب',other:'🌐 مصدر آخر'};
 function classifySource(ref){
  const r=String(ref||'').trim().toLowerCase();
  if(!r||r==='direct')return 'direct';
  if(r.includes('wa.me')||r.includes('whatsapp'))return 'whatsapp';
  if(r.includes('facebook.')||r.includes('fb.me')||r.includes('l.facebook'))return 'facebook';
  if(r.includes('instagram.'))return 'instagram';
  if(r.includes('t.co')||r.includes('twitter.')||r.includes('x.com'))return 'twitter';
  if(r.includes('tiktok.'))return 'tiktok';
  if(r.includes('t.me')||r.includes('telegram.'))return 'telegram';
  if(r.includes('youtube.')||r.includes('youtu.be'))return 'youtube';
  if(r.includes('google.'))return 'google';
  return 'other';
 }
 const DEVICE_LABELS={mobile:'📱 موبايل',tablet:'📱 تابلت',desktop:'💻 كمبيوتر',unknown:'❔ غير معروف'};
 function classifyDevice(ua){
  const u=String(ua||'');
  if(!u)return 'unknown';
  if(/ipad|tablet|playbook|silk/i.test(u))return 'tablet';
  if(/iphone|ipod|mobi|android.*mobile/i.test(u))return 'mobile';
  return 'desktop';
 }
 function classifyBrowser(ua){
  const u=String(ua||'');
  if(!u)return '—';
  if(/edg\//i.test(u))return 'Edge';
  if(/opr\/|opera/i.test(u))return 'Opera';
  if(/samsungbrowser/i.test(u))return 'Samsung Internet';
  if(/firefox|fxios/i.test(u))return 'Firefox';
  if(/crios|chrome/i.test(u))return 'Chrome';
  if(/safari/i.test(u))return 'Safari';
  return 'أخرى';
 }
 // V1230.18 — fanoutLimit bounds the expensive per-user detail fan-out (6 extra reads per user).
 // A forgotten-open admin tab used to re-run the FULL 80-user fan-out (~14,000 reads) every 20 seconds —
 // enough to exhaust the entire Spark-plan daily quota (50,000 reads) in roughly a minute. The periodic
 // auto-refresh now passes a small fanoutLimit (or 0 to skip per-user detail entirely and just refresh
 // the cheap summary queries); a manual "↻ تحديث" click or the initial open still gets the full detail.
 // V1230.127 — collect() is now a thin wrapper over collectCore()/collectFanout() below. The split lets
 // open() paint the cheap 6-query summary (users/visitors/chat/bans/errors) immediately, then quietly
 // fill in the expensive per-user fan-out (activity/ledger/mining/challenge detail) once it resolves —
 // instead of the whole panel blocking behind up to ~480 extra reads before anything is visible.
 async function fetchRaw(){
  const d=db();
  return Promise.all([
   safe(()=>d.collection('users').limit(500).get(),null),safe(()=>d.collection('players').limit(500).get(),null),
   safe(()=>{const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman'}).format(new Date());return d.collection('siteStats').doc('visitors').collection(day).limit(1000).get()},null),
   safe(()=>d.collection('publicChat').orderBy('createdAt','desc').limit(80).get(),null),safe(()=>d.collection('publicChatBans').limit(500).get(),null),
   // V1230.68 — recent client-side error reports (core/modules/runtime/error-tracker.js).
   safe(()=>d.collection('errorLogs').orderBy('createdAt','desc').limit(100).get(),null)
  ]).then(([us,ps,vis,chat,bans,errs])=>({us,ps,vis,chat,bans,errs}));
 }
 function buildBase(raw){
  const {us,ps,vis,chat,bans,errs}=raw;
  const users=(us?.docs||[]).map(x=>({uid:x.id,...x.data()})).filter(x=>String(x.email||'').toLowerCase()!==ADMIN());
  const players=(ps?.docs||[]).map(x=>({uid:x.id,...x.data()})).filter(x=>String(x.email||'').toLowerCase()!==ADMIN());
  const pm=new Map(players.map(p=>[p.uid,p]));
  const visitorRows=(vis?.docs||[]).map(x=>({id:x.id,...x.data()})).sort((a,b)=>ms(b.lastSeenAt)-ms(a.lastSeenAt));
  const rows=users.map(u=>{const p=pm.get(u.uid)||{};return {uid:u.uid,name:u.name||p.name||'ZIVO Player',email:u.email||p.email||'',level:+(p.level??1)||1,xp:+(p.xp??0)||0,zivo:+(u.zivo??p.zivo??u.coins??p.coins??0)||0,games:+(p.gamesPlayed??0)||0,wins:+(p.wins??0)||0,last:ms(u.lastSeenAt||p.lastSeenAt||u.updatedAt||p.updatedAt),path:u.lastSeenPath||p.lastSeenPath||'#home'}}).sort((a,b)=>b.last-a.last);
  const routeCounts={};visitorRows.forEach(v=>{const k=v.lastSeenPath||'#home';routeCounts[k]=(routeCounts[k]||0)+1});rows.forEach(r=>{const k=r.path||'#home';routeCounts[k]=(routeCounts[k]||0)+1});
  // Source/device breakdown is computed only from visitorRows (guest telemetry docs) — those are
  // the only docs carrying referrer/userAgent; registered `users` rows don't record either field.
  const sourceCounts={},deviceCounts={};visitorRows.forEach(v=>{const src=classifySource(v.referrer);sourceCounts[src]=(sourceCounts[src]||0)+1;const dev=classifyDevice(v.userAgent);deviceCounts[dev]=(deviceCounts[dev]||0)+1});
  const errors=(errs?.docs||[]).map(x=>({id:x.id,...x.data()})).sort((a,b)=>ms(b.createdAt)-ms(a.createdAt));
  return {rows,visitorRows,routeCounts,sourceCounts,deviceCounts,errors,chat:(chat?.docs||[]).map(x=>({id:x.id,...x.data()})),bans:(bans?.docs||[]).map(x=>({id:x.id,...x.data()})),visCount:vis?.size||0};
 }
 async function applyFanout(rows,fanoutLimit){
  const d=db();let activity=[],ledgerTotal=0,miningCount=0,challengeCount=0,perfectCount=0;
  await Promise.all(rows.slice(0,Math.max(0,fanoutLimit)).map(async r=>{const base=d.collection('users').doc(r.uid),pb=d.collection('players').doc(r.uid);const [ac,wl,mi,lg,res,att]=await Promise.all([
   safe(()=>base.collection('activity').limit(15).get(),null),safe(()=>base.collection('zivozone').doc('wallet').get(),null),safe(()=>base.collection('zivozone').doc('mining').get(),null),safe(()=>base.collection('zivozone').doc('wallet').collection('ledger').limit(50).get(),null),safe(()=>pb.collection('results').limit(50).get(),null),safe(()=>pb.collection('attempts').limit(30).get(),null)]);
   ac?.docs.forEach(x=>activity.push({uid:r.uid,name:r.name,...x.data(),time:ms(x.data()?.createdAt)}));if(wl?.exists)r.zivo=+(wl.data()?.zivo??r.zivo)||0;(lg?.docs||[]).forEach(x=>{const a=+x.data()?.amount||0;ledgerTotal+=a;if(x.data()?.type==='daily_mining')miningCount++;if(x.data()?.type==='challenge_reward')perfectCount++});challengeCount+=(res?.size||0)+(att?.size||0);r.nextMiningAt=ms(mi?.data()?.nextMiningAt);
  }));
  activity.sort((a,b)=>b.time-a.time);
  return {activity:activity.slice(0,120),ledgerTotal,miningCount,challengeCount,perfectCount};
 }
 function finalize(base,fanout,partial){
  const now=Date.now(),dayStart=new Date();dayStart.setHours(0,0,0,0);const rows=base.rows,visitorRows=base.visitorRows;
  // V1230.72 — "متصل الآن" combines signed-in users AND guest visitors (unlike the older `active`
  // KPI, which only ever counted registered users) — both sets are already fetched above, so this
  // costs nothing extra. The quick-refresh button below recomputes just this number on demand.
  const liveNow=rows.filter(r=>r.last&&now-r.last<=600000).length+visitorRows.filter(v=>{const t=ms(v.lastSeenAt);return t&&now-t<=600000}).length;
  return {rows,visitors:visitorRows,activity:fanout.activity,routeCounts:base.routeCounts,chat:base.chat,bans:base.bans,errors:base.errors,
   stats:{users:rows.length,visitors:base.visCount,active:rows.filter(r=>r.last&&now-r.last<=600000).length,today:rows.filter(r=>r.last>=dayStart.getTime()).length,games:rows.reduce((n,r)=>n+r.games,0),wins:rows.reduce((n,r)=>n+r.wins,0),zivo:rows.reduce((n,r)=>n+r.zivo,0),ledgerTotal:fanout.ledgerTotal,miningCount:fanout.miningCount,perfectCount:fanout.perfectCount,challengeCount:fanout.challengeCount,errors:base.errors.length,sourceCounts:base.sourceCounts,deviceCounts:base.deviceCounts,liveNow,domain:location.hostname,refreshedAt:Date.now(),partial:!!partial}};
 }
 async function collectCore(){
  if(!owner())throw Error('ADMIN ONLY');const d=db();if(!d)throw Error('Firebase unavailable');
  const base=buildBase(await fetchRaw());
  const out=finalize(base,{activity:[],ledgerTotal:0,miningCount:0,challengeCount:0,perfectCount:0},true);
  out._base=base;return out;
 }
 async function collectFanout(core,fanoutLimit=80){
  if(!owner())throw Error('ADMIN ONLY');if(!db())throw Error('Firebase unavailable');
  const base=core?._base;if(!base)return core;
  const fanout=await applyFanout(base.rows,fanoutLimit);
  const out=finalize(base,fanout,false);out._base=base;return out;
 }
 async function collect(fanoutLimit=80){
  const core=await collectCore();
  if(fanoutLimit<=0)return core;
  return collectFanout(core,fanoutLimit);
 }
 // V1230.127 — static, zero-Firestore-cost read of the version/changelog file. Loaded once per
 // open() alongside collectCore() so the "آخر تحديثات الموقع" panel is ready on the very first paint.
 let changelogList=[];
 async function loadChangelog(){
  try{const res=await fetch('/data/changelog.json',{cache:'no-store'});changelogList=res.ok?await res.json():[]}catch(_){changelogList=[]}
 }
 // V1230.72 — cheap on-demand refresh for just the "متصل الآن" count: 2 queries (users + today's
 // visitors) instead of collect()'s full 6-way fan-out, and zero per-user detail reads. Meant for a
 // manual "⚡" click or a tight 60s loop while the panel is open, without re-running the expensive parts.
 async function collectActiveNow(){
  if(!owner())throw Error('ADMIN ONLY');const d=db();if(!d)throw Error('Firebase unavailable');
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman'}).format(new Date());
  const [us,vis]=await Promise.all([safe(()=>d.collection('users').limit(500).get(),null),safe(()=>d.collection('siteStats').doc('visitors').collection(day).limit(1000).get(),null)]);
  const now=Date.now();
  const usersActive=(us?.docs||[]).filter(x=>{const data=x.data();if(String(data.email||'').toLowerCase()===ADMIN())return false;const last=ms(data.lastSeenAt||data.updatedAt);return last&&now-last<=600000}).length;
  const guestsActive=(vis?.docs||[]).filter(x=>{const last=ms(x.data()?.lastSeenAt);return last&&now-last<=600000}).length;
  return usersActive+guestsActive;
 }
 // V1230.70 — client-side search/sort/export for the users panel. No new reads: everything
 // operates on the already-fetched `rows` from the last collect(), so typing in the search box
 // or switching sort order never touches Firebase.
 let lastData=null,searchQuery='',sortKey='last-desc';
 const SORT_OPTS=[['last-desc','آخر ظهور (الأحدث)'],['last-asc','آخر ظهور (الأقدم)'],['level-desc','المستوى (الأعلى)'],['level-asc','المستوى (الأدنى)'],['zivo-desc','ZIVO (الأعلى)'],['zivo-asc','ZIVO (الأدنى)'],['games-desc','الألعاب (الأكثر)'],['name-asc','الاسم (أ-ي)']];
 function filterSort(rows){
  let out=rows||[];
  if(searchQuery.trim()){const q=searchQuery.trim().toLowerCase();out=out.filter(u=>u.name.toLowerCase().includes(q)||u.email.toLowerCase().includes(q))}
  const [key,dir]=sortKey.split('-');const mul=dir==='asc'?1:-1;
  out=[...out].sort((a,b)=>key==='name'?mul*String(a.name).localeCompare(String(b.name),'ar'):mul*((a[key]||0)-(b[key]||0)));
  return out;
 }
 function buildUsersRowsHtml(rows){
  const filtered=filterSort(rows);
  if(!filtered.length)return `<div class="zac-empty">${searchQuery.trim()?'لا نتائج مطابقة للبحث.':'لا يوجد مستخدمون.'}</div>`;
  return filtered.map(u=>`<div class="zac-user"><b>${esc(u.name)}</b><span>${esc(u.email)}</span><span>Lv ${u.level}</span><span>${u.xp} XP</span><span>🪙 ${u.zivo.toFixed(2)}</span><span>${u.games}</span><span>${u.wins}</span><span>${u.last?fmt(u.last):'—'}</span><span>${esc(u.path)}</span></div>`).join('');
 }
 function refreshUsersList(){const box=document.querySelector('.zac-users .zac-user-rows');if(box&&lastData)box.innerHTML=buildUsersRowsHtml(lastData.rows)}
 // V1230.88 — real-time "live visitors" feed: replaces the old poll-only guests panel (which only
 // ever updated on a manual click or the 15-minute background refresh) with a genuine Firestore
 // onSnapshot listener on today's visitors collection, scoped to the admin tab being open. A guest
 // who visits for even one second already writes exactly one trackGuest() doc on load (core/modules/
 // auth.js) — this just means the admin SEES that write the instant it happens instead of up to 15
 // minutes later. "غادر" (left) is computed purely client-side from how long ago lastSeenAt was —
 // no extra Firestore reads for that part, just a 3s re-paint of already-held data.
 const LIVE_WINDOW_MS=20000,ARRIVE_FLASH_MS=4000;
 let visitorsUnsub=null,visitorsTickTimer=0;
 const liveVisitorsDocs=new Map(),justArrived=new Set();
 function guestRowHtml(g){
  const now=Date.now(),last=ms(g.lastSeenAt),isLive=!!last&&(now-last)<=LIVE_WINDOW_MS;
  const flash=justArrived.has(g.id)?' zac-flash-in':'';
  return `<div class="zac-activity zac-guest${flash}"><b>${isLive?'🟢 متصل الآن':'⚪ غادر'} · ${esc(SOURCE_LABELS[classifySource(g.referrer)]||g.referrer||'')}</b><span>${esc(g.lastSeenPath||'#home')} · ${esc(DEVICE_LABELS[classifyDevice(g.userAgent)])} ${esc(classifyBrowser(g.userAgent))}</span><small>${esc(g.language||'ar')} · ${fmt(last)}</small></div>`;
 }
 function renderGuestsLive(){
  const box=document.getElementById('zac-guests-list');if(!box)return;
  const docs=[...liveVisitorsDocs.values()].sort((a,b)=>ms(b.lastSeenAt)-ms(a.lastSeenAt));
  box.innerHTML=docs.length?docs.map(guestRowHtml).join(''):'<div class="zac-empty">لا يوجد زوار الآن.</div>';
 }
 function stopVisitorsLive(){if(visitorsUnsub){try{visitorsUnsub()}catch(_){}visitorsUnsub=null}if(visitorsTickTimer){clearInterval(visitorsTickTimer);visitorsTickTimer=0}liveVisitorsDocs.clear();justArrived.clear()}
 function startVisitorsLive(){
  if(!owner()||!db())return;
  stopVisitorsLive();
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Amman'}).format(new Date());
  try{
   visitorsUnsub=db().collection('siteStats').doc('visitors').collection(day).orderBy('lastSeenAt','desc').limit(50)
    .onSnapshot(snap=>{
     snap.docChanges().forEach(ch=>{
      const id=ch.doc.id,data={id,...ch.doc.data()};
      liveVisitorsDocs.set(id,data);
      if(ch.type==='added'){justArrived.add(id);setTimeout(()=>{justArrived.delete(id);renderGuestsLive()},ARRIVE_FLASH_MS)}
     });
     renderGuestsLive();
    },err=>console.warn('Live visitors listener:',err));
  }catch(e){console.warn('Live visitors listener setup:',e)}
  visitorsTickTimer=setInterval(renderGuestsLive,3000); // repaint live/غادر status with zero new reads
 }
 function csvCell(v){v=String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
 function exportUsersCsv(){
  if(!lastData)return;
  const rows=filterSort(lastData.rows);
  const head=['الاسم','البريد','المستوى','XP','ZIVO','الألعاب','الفوز','آخر ظهور','المسار'];
  const lines=[head.map(csvCell).join(',')];
  rows.forEach(u=>lines.push([u.name,u.email,u.level,u.xp,u.zivo.toFixed(2),u.games,u.wins,u.last?fmt(u.last):'',u.path].map(csvCell).join(',')));
  const blob=new Blob(['﻿'+lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`zivozone-users-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 }
 function render(x){
  lastData=x;
  let o=document.getElementById('zivo-admin-core');if(!o){o=document.createElement('div');o.id='zivo-admin-core';o.className='zivo-admin-core';document.body.appendChild(o)}
  const s=x.stats,r=x.rows,v=x.visitors||[],a=x.activity,max=Math.max(1,s.users,s.games,s.challengeCount,s.miningCount),routes=x.routeCounts||{},banned=new Set((x.bans||[]).map(b=>b.id));
  const k=(val,n,h)=>`<div class="zac-kpi"><b>${esc(val)}</b><span>${esc(n)}</span><small>${esc(h)}</small></div>`;
  const users=buildUsersRowsHtml(r);
  const sortOptsHtml=SORT_OPTS.map(([v,l])=>`<option value="${v}"${v===sortKey?' selected':''}>${esc(l)}</option>`).join('');
  const guests=v.slice(0,40).map(g=>`<div class="zac-activity"><b>زائر · ${esc(SOURCE_LABELS[classifySource(g.referrer)]||g.referrer||'')}</b><span>${esc(g.lastSeenPath||'#home')} · ${esc(DEVICE_LABELS[classifyDevice(g.userAgent)])} ${esc(classifyBrowser(g.userAgent))}</span><small>${esc(g.language||'ar')} · ${fmt(ms(g.lastSeenAt))}</small></div>`).join('')||'<div class="zac-empty">لا يوجد زوار اليوم.</div>';
  const sourceHtml=Object.entries(s.sourceCounts||{}).sort((a,b)=>b[1]-a[1]).map(([src,n])=>`<div class="zac-activity"><b>${esc(SOURCE_LABELS[src]||src)}</b><span>${n} زائر اليوم</span></div>`).join('')||'<div class="zac-empty">لا توجد بيانات مصدر اليوم.</div>';
  const deviceHtml=Object.entries(s.deviceCounts||{}).sort((a,b)=>b[1]-a[1]).map(([dev,n])=>`<div class="zac-activity"><b>${esc(DEVICE_LABELS[dev]||dev)}</b><span>${n} زائر اليوم</span></div>`).join('')||'<div class="zac-empty">لا توجد بيانات أجهزة اليوم.</div>';
  const acts=a.map(v=>`<div class="zac-activity"><b>${esc(v.name||'مستخدم')}</b><span>${esc(v.event||v.type||'نشاط')}</span><small>${esc(v.meta?.path||v.path||'#home')} · ${fmt(v.time)}</small></div>`).join('')||'<div class="zac-empty">لا يوجد نشاط محفوظ.</div>';
  const errs=(x.errors||[]).slice(0,60).map(e=>`<div class="zac-activity"><b>${esc(e.type||'error')}</b><span>${esc((e.message||'').slice(0,160))}</span><small>${esc(e.url||'')} · ${esc(e.appVersion||'')} · ${fmt(ms(e.createdAt))}</small></div>`).join('')||'<div class="zac-empty">لا توجد أخطاء مسجّلة.</div>';
  const chat=(x.chat||[]).map(m=>{const isB=banned.has(m.authorUid);return `<article class="zac-chat-row"><div><b>${esc(m.displayName||'زائر')}</b><p>${esc(m.text||'')}</p><small>${esc(m.authorUid||'')} · ${fmt(ms(m.createdAt))}</small></div><div class="zac-chat-actions"><button data-chat-ban="${esc(m.authorUid||'')}" class="${isB?'unban':''}">${isB?'فك الحظر':'حظر'}</button></div></article>`}).join('')||'<div class="zac-empty">لا توجد رسائل.</div>';
  // V1230.127 — error visibility: a top-of-panel alert (danger when errors exist, calm when not)
  // plus a distinctly-styled KPI tile, instead of the error count looking like every other neutral KPI.
  const errAlert=s.errors>0
   ?`<div class="zac-alert zac-alert-danger"><span class="zac-alert-dot"></span><b>${esc(s.errors)} خطأ مسجّل</b><span>آخر الأخطاء الحقيقية المرصودة من أجهزة الزوار</span><a href="#zac-errors-panel" class="zac-alert-link">عرض التفاصيل ↓</a></div>`
   :`<div class="zac-alert zac-alert-ok"><span class="zac-alert-dot"></span><b>لا توجد أخطاء مسجّلة</b><span>الموقع يعمل دون أعطال مرصودة من الزوار</span></div>`;
  const errKpi=s.errors>0?`<div class="zac-kpi zac-kpi-danger"><b>${esc(s.errors)}</b><span>أخطاء مسجّلة</span><small>آخر 100 خطأ حقيقي</small></div>`:k(s.errors,'أخطاء مسجّلة','آخر 100 خطأ حقيقي');
  // V1230.127 — version/changelog panel: static file read, zero Firestore cost, so it's always
  // ready even on the very first (fast) paint before the per-user fan-out resolves.
  const appVersion=esc(window.ZIVOZONE_CONFIG?.APP_VERSION||'—');
  const changelogHtml=changelogList.length?changelogList.slice(0,8).map(c=>`<div class="zac-activity"><b>v${esc(c.version)}</b><span>${esc(c.summary||'')}</span><small>${esc(c.date||'')}</small></div>`).join(''):'<div class="zac-empty">لا يوجد سجل تحديثات.</div>';
  const partialNote=s.partial?`<small class="zac-partial-note">⏳ جاري تحميل تفاصيل إضافية (النشاط والتعدين والمحافظ)…</small>`:'';
  o.innerHTML=`<div class="zac-shell" dir="rtl"><header class="zac-head"><div class="zac-brand">Z</div><div><small>OWNER OPERATIONS • ZIVOZONE CORE</small><h2>مركز التحكم الإداري</h2><p>${esc(ADMIN())}</p></div><div class="zac-live">● LIVE MONITORING</div><button class="zac-close">×</button></header><main class="zac-body">
  ${errAlert}${partialNote}
  <section class="zac-kpis"><div class="zac-kpi zac-kpi-live"><button class="zac-quick-refresh" id="zac-quick-refresh" title="تحديث سريع لعدد المتصلين الآن">⚡</button><b id="zac-live-now-val">${esc(s.liveNow)}</b><span>متصل الآن</span><small id="zac-live-now-time">يشمل الزوار · ${fmt(s.refreshedAt)}</small></div>${k(s.users,'المستخدمون','حسابات غير إدارية')}${k(s.visitors,'زوار اليوم','مسجلون وغير مسجلين')}${k(s.active,'نشط الآن (مسجلون)','آخر 10 دقائق')}${k(s.today,'نشط اليوم','آخر ظهور')}${k(s.games,'إجمالي الألعاب','Player data')}${k(s.challengeCount,'محاولات التحديات','Results + attempts')}${k(s.miningCount,'عمليات التعدين','Ledger')}${k(s.zivo.toFixed(2),'إجمالي ZIVO','Virtual economy')}${errKpi}</section>
  <section class="zac-grid"><section class="zac-panel"><div class="zac-title"><div><h3>👥 المستخدمون</h3><small>الحساب · المستوى · XP · ZIVO · الألعاب · آخر صفحة</small></div><div class="zac-user-controls"><input type="search" class="zac-user-search" id="zac-user-search" placeholder="بحث بالاسم أو الإيميل..." value="${esc(searchQuery)}"><select class="zac-user-sort" id="zac-user-sort">${sortOptsHtml}</select><button class="zac-export" id="zac-user-export">⬇️ تصدير CSV</button><button class="zac-refresh">↻ تحديث</button></div></div><div class="zac-users"><div class="zac-user head"><b>الاسم</b><span>البريد</span><span>Lv</span><span>XP</span><span>ZIVO</span><span>ألعاب</span><span>فوز</span><span>آخر ظهور</span><span>المسار</span></div><div class="zac-user-rows">${users}</div></div></section><section class="zac-panel"><div class="zac-title"><div><h3>👀 الزوار المباشر <span class="zac-live-dot" title="بث مباشر">●</span></h3><small>يظهر الزائر فور دخوله الموقع ويتحوّل لـ «غادر» تلقائيًا دون تحديث الصفحة</small></div></div><div class="zac-activities" id="zac-guests-list">${guests}</div></section></section>
  <section class="zac-grid"><section class="zac-panel"><div class="zac-title"><div><h3>⚡ النشاط التشغيلي</h3><small>آخر الأحداث</small></div></div><div class="zac-activities">${acts}</div></section><section class="zac-panel"><div class="zac-title"><div><h3>🛰️ صحة المنصة</h3><small>الحالة الحالية</small></div></div><div class="zac-health"><div>Firebase<b>${db()?'CONNECTED':'OFFLINE'}</b></div><div>Hosting<b>${navigator.onLine?'ONLINE':'OFFLINE'}</b></div><div>Domain<b>${esc(s.domain)}</b></div><div>Ledger ZIVO<b>${s.ledgerTotal.toFixed(2)}</b></div><div>Perfect rewards<b>${s.perfectCount}</b></div><div>آخر تحديث<b>${fmt(s.refreshedAt)}</b></div></div></section></section>
  <section class="zac-panel"><div class="zac-title"><div><h3 id="zac-errors-panel">🐞 الأخطاء الحقيقية</h3><small>مرصودة من أجهزة الزوار الفعلية (أحدث 100)</small></div></div><div class="zac-activities">${errs}</div></section>
  <section class="zac-panel"><div class="zac-title"><div><h3>💬 الدردشة العامة</h3><small>مراقبة وحظر فوري للزوار والمستخدمين المجهولين</small></div></div><div class="zac-chat-list">${chat}</div></section>
  <section class="zac-panel"><div class="zac-title"><div><h3>📊 مؤشرات الاستخدام</h3><small>قراءة تشغيلية سريعة</small></div></div><div class="zac-bars">${[['المستخدمون',s.users],['الألعاب',s.games],['التحديات',s.challengeCount],['التعدين',s.miningCount]].map(([n,val])=>`<div><span>${n}</span><i><em style="width:${Math.min(100,val/max*100)}%"></em></i><b>${val}</b></div>`).join('')}</div></section>
  <section class="zac-panel"><div class="zac-title"><div><h3>🧭 خريطة الحركة</h3><small>أكثر المسارات زيارة</small></div></div><div class="zac-activities">${Object.entries(routes).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([path,n])=>`<div class="zac-activity"><b>${esc(path)}</b><span>${n} زيارة/جلسة</span></div>`).join('')||'<div class="zac-empty">لا توجد حركة كافية.</div>'}</div></section>
  <section class="zac-grid bottom"><section class="zac-panel"><div class="zac-title"><div><h3>📡 مصدر الزوار</h3><small>من وين إجا زوار اليوم</small></div></div><div class="zac-activities">${sourceHtml}</div></section><section class="zac-panel"><div class="zac-title"><div><h3>📱 الجهاز والمتصفح</h3><small>موبايل، تابلت أو كمبيوتر — زوار اليوم</small></div></div><div class="zac-activities">${deviceHtml}</div></section></section>
  <section class="zac-panel"><div class="zac-title"><div><h3>📦 آخر تحديثات الموقع</h3><small>الإصدار الحالي: v${appVersion}</small></div></div><div class="zac-activities">${changelogHtml}</div></section>
  </main></div>`;
  o.querySelector('.zac-close').onclick=close;o.querySelector('.zac-refresh').onclick=async e=>{e.currentTarget.disabled=true;try{render(await collect(80))}finally{e.currentTarget.disabled=false}};
  const searchEl=o.querySelector('#zac-user-search');if(searchEl)searchEl.oninput=e=>{searchQuery=e.target.value;refreshUsersList()};
  const sortEl=o.querySelector('#zac-user-sort');if(sortEl)sortEl.onchange=e=>{sortKey=e.target.value;refreshUsersList()};
  const exportEl=o.querySelector('#zac-user-export');if(exportEl)exportEl.onclick=exportUsersCsv;
  const quickEl=o.querySelector('#zac-quick-refresh');if(quickEl)quickEl.onclick=()=>quickRefreshLiveNow(quickEl);
  if(visitorsUnsub)renderGuestsLive(); // full re-renders rebuild #zac-guests-list from scratch; resync it immediately from already-held live data instead of waiting for the next snapshot/tick
 }
 // V1230.72 — updates just the "متصل الآن" KPI's two text nodes in place; never touches the rest
 // of the DOM, so it doesn't disturb the search box, sort choice, or scroll position mid-use.
 async function quickRefreshLiveNow(btn){
  if(btn)btn.disabled=true;
  try{
   const n=await collectActiveNow();
   const val=document.getElementById('zac-live-now-val'),time=document.getElementById('zac-live-now-time');
   if(val)val.textContent=String(n);
   if(time)time.textContent=`يشمل الزوار · ${fmt(Date.now())}`;
  }catch(e){console.warn('Quick refresh:',e)}
  finally{if(btn)btn.disabled=false}
 }
 async function moderate(uid,ban){if(!owner()||!db()||!uid)return;const ref=db().collection('publicChatBans').doc(uid);if(ban)await ref.set({uid,createdAt:firebase.firestore.FieldValue.serverTimestamp(),reason:'admin'});else await ref.delete();}
 function close(){document.getElementById('zivo-admin-core')?.remove();document.body.classList.remove('zivo-admin-open');clearInterval(timer);clearInterval(fastTimer);stopVisitorsLive()}
 // V1230.69 — scalability audit: collect(0)'s own summary queries (users/players/visitors/chat/
 // bans/errorLogs, all capped at 500-1000 docs each) can themselves cost up to ~2,680 reads per
 // call once those collections are actually near their limits at real scale. At the old 5-minute
 // auto-refresh, a dashboard tab left open all day could reach ~770K reads/day — well past the
 // Spark plan's 50,000/day free quota — even though this fan-out already skips the expensive
 // 6-reads-per-user detail loop (fanoutLimit=0). Widened to 15 minutes, a cheap, safe reduction
 // (~3x fewer background reads) that keeps "live-ish" monitoring without needing to change what
 // each refresh actually queries. If real traffic ever approaches those collection limits, the next
 // real fix is giving the BACKGROUND refresh its own smaller limits (e.g. visitors/bans don't need
 // 500-1000 documents just to show summary counts) — not implemented now, to avoid touching a
 // working dashboard's query shape without a concrete need in front of it yet.
 let timer=0,fastTimer=0;
 // V1230.127 — shown the instant open() is called, before any Firestore read resolves, so the
 // admin never faces a blank panel while the (potentially slow, fan-out-heavy) first collect runs.
 function renderSkeleton(){
  let o=document.getElementById('zivo-admin-core');if(!o){o=document.createElement('div');o.id='zivo-admin-core';o.className='zivo-admin-core';document.body.appendChild(o)}
  o.innerHTML=`<div class="zac-shell" dir="rtl"><header class="zac-head"><div class="zac-brand">Z</div><div><small>OWNER OPERATIONS • ZIVOZONE CORE</small><h2>مركز التحكم الإداري</h2><p>${esc(ADMIN())}</p></div><button class="zac-close">×</button></header><main class="zac-body"><div class="zac-skel-wrap"><div class="zac-skel-spinner"></div><p>جاري تحميل بيانات الموقع…</p></div></main></div>`;
  o.querySelector('.zac-close').onclick=close;
 }
 // V1230.72 — a separate, much tighter 60s loop that ONLY refreshes the "متصل الآن" KPI via the
 // cheap 2-query collectActiveNow() (see above) — distinct from `timer`'s full 15-minute collect(0)
 // refresh, so "live-ish" headcount doesn't require widening the expensive refresh's own interval.
 // V1230.127 — open() now paints in two phases: the cheap collectCore() summary renders first
 // (fast, usually well under a second), then collectFanout() quietly fills in the expensive
 // per-user detail and re-renders once it resolves — instead of blocking the whole panel on it.
 async function open(){
  if(!owner()){alert('هذا الحساب ليس حساب الإدارة.');return}
  document.body.classList.add('zivo-admin-open');
  renderSkeleton();
  try{
   const [core]=await Promise.all([collectCore(),loadChangelog()]);
   render(core);startVisitorsLive();
   collectFanout(core,80).then(full=>{if(document.getElementById('zivo-admin-core'))render(full)}).catch(e=>console.warn('Admin fan-out refresh:',e));
   clearInterval(timer);timer=setInterval(async()=>{if(document.getElementById('zivo-admin-core'))try{render(await collect(0))}catch(_){}},900000);
   clearInterval(fastTimer);fastTimer=setInterval(()=>{if(document.getElementById('zivo-admin-core'))quickRefreshLiveNow(null)},60000);
  }catch(e){console.error(e);alert('تعذر تحميل مركز الإدارة. تحقق من Firebase Rules.')}
 }
 function bind(){const b=document.getElementById('login-btn');if(b&&owner()){b.textContent='👑 ADMIN';b.setAttribute('aria-label','مركز التحكم الإداري')}}
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-chat-ban]');if(!b)return;e.preventDefault();try{const isB=b.classList.contains('unban');await moderate(b.dataset.chatBan,!isB);render(await collect())}catch(err){console.warn('Chat moderation:',err)}},true);
 document.addEventListener('click',e=>{const b=e.target.closest('#login-btn');if(b&&owner()){e.preventDefault();e.stopImmediatePropagation();open()}},true);
 window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.Admin=Object.freeze({open,collect});window.ZIVOZONE_MONITOR=Object.freeze({open,adminData:collect});window.addEventListener('zivozone-auth',()=>setTimeout(bind,300));if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
