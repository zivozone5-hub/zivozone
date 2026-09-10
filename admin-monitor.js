/* ZIVOZONE V80 — OWNER ADMIN COMMAND CENTER */
(function(){'use strict';
 const OWNER_UID='rBlzUigQ6DhgD4CK6VX3tS43PS43',OWNER_EMAIL='raefalbtish@gmail.com';
 const auth=()=>window.firebase?.auth?.(),db=()=>window.firebase?.firestore?.(),fn=()=>window.firebase?.functions?.();
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function owner(){const u=auth()?.currentUser;return !!u&&u.uid===OWNER_UID&&String(u.email||'').toLowerCase()===OWNER_EMAIL}
 async function bootstrap(){
   if(!owner())throw new Error('هذا الحساب ليس مالك ZIVOZONE');
   try{const r=await fn().httpsCallable('zivoBootstrapAdmin')({}); if(r?.data?.ok){await auth().currentUser.getIdToken(true);return true}}catch(e){console.warn('admin bootstrap',e)}
   return false;
 }
 async function heartbeat(){
   try{if(fn())await fn().httpsCallable('zivoHeartbeat')({path:location.pathname+location.hash});}catch(e){console.warn('heartbeat',e)}
 }
 async function data(){
   if(!owner())throw new Error('Admin access required');
   try{const r=await fn().httpsCallable('zivoAdminOverview')({});return r.data}catch(e){
     const d=db();
     const ps=await d.collection('players').limit(500).get();
     const players=ps.docs.map(x=>({uid:x.id,...x.data()}));
     const now=Date.now();
     return {stats:{totalUsers:players.length,totalPlayers:players.length,todayVisitors:0,todayLogins:0,todayGames:players.reduce((n,p)=>n+(Number(p.gamesPlayed)||0),0),activeNow:players.filter(p=>{const t=p.lastSeenAt?.toMillis?.()||p.lastSeen?.toMillis?.()||0;return t&&now-t<15*60*1000}).length,firebase:'CONNECTED',news:'LIVE'},players:players.slice(0,100).map(p=>({uid:p.uid,name:p.name||'ZIVO Player',email:p.email||'',level:Number(p.level)||1,gamesPlayed:Number(p.gamesPlayed)||0,zivo:Number(p.coins)||0,lastSeen:(p.lastSeenAt||p.lastSeen)?.toDate?.()?.toISOString?.()||null}))};
   }
 }
 function render(x){
   let o=document.getElementById('zivo-v80-admin');if(!o){o=document.createElement('div');o.id='zivo-v80-admin';o.className='z80-overlay';document.body.appendChild(o)}
   const s=x.stats||{},p=x.players||[];
   o.innerHTML=`<div class="z80-card"><button class="z80-x">×</button><div class="z80-head"><div class="z80-logo">Z</div><div><small>OWNER COMMAND CENTER</small><h2>مركز إدارة ZIVOZONE</h2><span>المستخدمون · النشاط · الألعاب · الاقتصاد · صحة المنصة</span></div></div><div class="z80-grid">${[['حسابات',s.totalUsers],['لاعبون',s.totalPlayers],['زوار اليوم',s.todayVisitors],['دخول اليوم',s.todayLogins],['نشط الآن',s.activeNow],['ألعاب اليوم',s.todayGames]].map(a=>`<div><b>${Number(a[1])||0}</b><span>${a[0]}</span></div>`).join('')}</div><div class="z80-status">🟢 الموقع ONLINE · ☁️ Firebase ${esc(s.firebase||'UNKNOWN')} · 📰 الأخبار ${esc(s.news||'UNKNOWN')} · 🔐 OWNER VERIFIED</div><h3>المستخدمون واللاعبون</h3><div class="z80-table">${p.length?p.map(a=>`<div class="z80-row"><b>${esc(a.name)}</b><span>${esc(a.email)}</span><span>Lv ${a.level}</span><span>🪙 ${Number(a.zivo)||0}</span><span>${Number(a.gamesPlayed)||0} لعبة</span><span>${a.lastSeen?new Date(a.lastSeen).toLocaleString('ar-JO'):'—'}</span></div>`).join(''):'<p>لا توجد حسابات بعد.</p>'}</div><p class="z80-note">لوحة المالك تعتمد على صلاحية الخادم. الرصيد ZIVO والمكافآت تُدار من الخادم وليس من المتصفح.</p></div>`;
   o.querySelector('.z80-x').onclick=()=>o.remove();
 }
 async function open(){
   try{if(!auth()?.currentUser){alert('سجّل الدخول أولًا بحساب المالك.');return}if(!owner()){alert('هذا الحساب ليس حساب إدارة ZIVOZONE.');return}await bootstrap();render(await data())}catch(e){console.error(e);alert('تعذر تحميل لوحة الإدارة. يجب نشر Firebase Functions ثم إعادة تحميل الموقع.')}
 }
 function mount(){if(!owner())return;if(!document.getElementById('z80-admin-open')){const b=document.createElement('button');b.id='z80-admin-open';b.className='z80-admin-open';b.textContent='👑 الإدارة';b.onclick=open;document.body.appendChild(b)}}
 window.ZIVOZONE_MONITOR={open,heartbeat,adminData:data};
 window.addEventListener('load',()=>setTimeout(()=>{heartbeat();mount()},1200));
 window.addEventListener('zivozone-auth',()=>setTimeout(()=>{heartbeat();mount()},500));
 if(location.hash==='#admin')setTimeout(open,2200);
})();
