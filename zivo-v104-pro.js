
/* ZIVOZONE V104 — Functional luxury command center + challenge polish */
(()=>{'use strict';
const ADMIN='raefalbtish@gmail.com';
const AICON={daily:'⚡',iq:'🧠',logic:'♟️',math:'∑',science:'⚗️',football:'⚽',memory:'◈',strategy:'♜',reaction:'◉',forensic:'🔎',horror:'◉',identity:'✦'};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const auth=()=>window.firebase?.auth?.(),db=()=>window.firebase?.firestore?.();
const owner=()=>String(auth()?.currentUser?.email||'').toLowerCase()===ADMIN;
const ms=v=>v?.toMillis?.()||Date.parse(v)||Number(v)||0;
const fmt=v=>v?new Date(v).toLocaleString('ar-JO',{dateStyle:'medium',timeStyle:'short'}):'—';

function beautifyChallenges(){
 $$('#challenge-list .challenge-card').forEach(card=>{
   if(card.classList.contains('z104-challenge-card'))return;
   card.classList.add('z104-challenge-card');
   const btn=$('[data-challenge]',card),id=btn?.dataset.challenge||'challenge';
   const visual=$('.challenge-visual',card);
   if(visual){
     visual.className='z104-challenge-icon';
     visual.innerHTML=`<span>${AICON[id]||'✦'}</span>`;
     visual.removeAttribute('src');
   }
   const tag=$('.card-tag',card);
   if(tag){tag.classList.add('z104-challenge-badge');tag.textContent=`${id==='horror'?'∞':'10'} أسئلة · مستوى ذكي`;}
 });
}

async function getUsers(){
 const d=db();if(!d||!owner())throw Error('غير مصرح');
 const [us,ps]=await Promise.all([d.collection('users').limit(250).get(),d.collection('players').limit(250).get()]);
 const users=us.docs.map(x=>({uid:x.id,...x.data()})).filter(u=>String(u.email||'').toLowerCase()!==ADMIN);
 const players=ps.docs.map(x=>({uid:x.id,...x.data()})).filter(p=>String(p.email||'').toLowerCase()!==ADMIN);
 const pm=new Map(players.map(p=>[p.uid,p]));
 const rows=users.map(u=>{const p=pm.get(u.uid)||{};return {uid:u.uid,name:u.name||p.name||'ZIVO Player',email:u.email||p.email||'',level:Number(p.level??u.level??1),xp:Number(p.xp??u.xp??0),zivo:Number(u.zivo??p.zivo??u.coins??p.coins??0),games:Number(p.gamesPlayed??u.gamesPlayed??0),last:ms(u.lastSeenAt||p.lastSeenAt||u.updatedAt||p.updatedAt),path:u.lastSeenPath||p.lastSeenPath||'#home',created:ms(u.createdAt||p.createdAt),terms:u.termsVersion||'—'}});
 let activities=[], miningTotal=0, miningCount=0, challengeCount=0;
 await Promise.all(rows.slice(0,40).map(async r=>{
   try{
    const [ac,wl,mi,lg,res]=await Promise.all([
      d.collection('users').doc(r.uid).collection('activity').limit(8).get(),
      d.collection('users').doc(r.uid).collection('zivozone').doc('wallet').get(),
      d.collection('users').doc(r.uid).collection('zivozone').doc('mining').get(),
      d.collection('users').doc(r.uid).collection('zivozone').doc('wallet').collection('ledger').limit(25).get(),
      d.collection('players').doc(r.uid).collection('results').limit(30).get()
    ]);
    ac.docs.forEach(x=>activities.push({uid:r.uid,name:r.name,...x.data(),time:ms(x.data()?.createdAt)}));
    lg.docs.forEach(x=>{if(x.data()?.type==='daily_mining'){miningTotal+=Number(x.data()?.amount)||0;miningCount++;}});
    challengeCount+=res.size;
    if(wl.exists)r.zivo=Number(wl.data()?.zivo??r.zivo)||0;
    r.nextMiningAt=ms(mi.data()?.nextMiningAt);
   }catch(e){}
 }));
 activities.sort((a,b)=>b.time-a.time);
 const now=Date.now(),today=new Date();today.setHours(0,0,0,0);
 const active=rows.filter(r=>r.last&&now-r.last<=10*60*1000).length;
 const todayUsers=rows.filter(r=>r.last>=today.getTime()).length;
 return {rows,activities:activities.slice(0,80),stats:{users:rows.length,players:players.length,active,today:todayUsers,games:rows.reduce((n,r)=>n+r.games,0),zivo:rows.reduce((n,r)=>n+r.zivo,0),miningTotal,miningCount,challengeCount,online:navigator.onLine}};
}

function renderAdmin(data){
 let o=$('#z104-admin-overlay');
 if(!o){o=document.createElement('div');o.id='z104-admin-overlay';o.className='z104-admin-overlay';document.body.appendChild(o)}
 const s=data.stats,r=data.rows,a=data.activities;
 const k=(v,n,h)=>`<div class="z104-kpi"><b>${esc(v)}</b><span>${esc(n)}</span><em>${esc(h)}</em></div>`;
 const users=r.length?r.map(x=>`<div class="z104-user"><b>${esc(x.name)}</b><span>${esc(x.email)}</span><span>Lv ${x.level}</span><span>${x.xp} XP</span><span>🪙 ${x.zivo.toFixed(2)}</span><span>${x.games}</span><span class="${x.last&&Date.now()-x.last<600000?'z104-online':''}">${x.last?fmt(x.last):'—'}</span></div>`).join(''):`<div class="z104-act">لا توجد حسابات لاعبين بعد.</div>`;
 const acts=a.length?a.map(x=>`<div class="z104-act"><b>${esc(x.name||'مستخدم')}</b><span>${esc(x.event||x.type||'نشاط داخل المنصة')}</span><small>${esc(x.meta?.path||x.path||'')} · ${fmt(x.time)}</small></div>`).join(''):`<div class="z104-act">لا يوجد نشاط مسجل.</div>`;
 const max=Math.max(1,s.users,s.games,s.miningCount,s.challengeCount);
 o.innerHTML=`<div class="z104-admin-shell" dir="rtl">
  <header class="z104-head"><div class="z104-mark">Z</div><div><small>PRIVATE OWNER COMMAND CENTER</small><h2>غرفة إدارة ZIVOZONE</h2><p>المالك والمدير: رائف البطوش · ${ADMIN}</p></div><div class="z104-live"><i></i> LIVE MONITORING</div><button class="z104-close" aria-label="إغلاق">×</button></header>
  <main class="z104-body">
   <section class="z104-kpis">${k(s.users,'المستخدمون','حسابات اللاعبين فقط')}${k(s.active,'نشط الآن','آخر 10 دقائق')}${k(s.today,'دخلوا اليوم','آخر ظهور')}${k(s.games,'إجمالي الألعاب','كل الحسابات')}${k(s.zivo.toFixed(2),'إجمالي ZIVO','رصيد افتراضي')}${k(s.challengeCount,'محاولات التحديات','نتائج محفوظة')}</section>
   <section class="z104-grid">
    <div class="z104-panel"><div class="z104-panel-head"><div><h3>👥 المستخدمون — مراقبة مباشرة</h3><small>الاسم · البريد · المستوى · XP · ZIVO · الألعاب · آخر ظهور</small></div><button class="z104-refresh">↻ تحديث</button></div><div class="z104-table"><div class="z104-user head"><b>الاسم</b><span>البريد</span><span>Lv</span><span>XP</span><span>ZIVO</span><span>ألعاب</span><span>آخر ظهور</span></div>${users}</div></div>
    <aside class="z104-panel"><div class="z104-panel-head"><div><h3>⚡ آخر النشاط</h3><small>سجل تشغيلي من Firestore</small></div></div><div class="z104-activity">${acts}</div></aside>
   </section>
   <section class="z104-bottom">
    <div class="z104-panel"><div class="z104-panel-head"><div><h3>📊 مؤشرات المنصة</h3><small>قراءة سريعة للاستخدام والاقتصاد</small></div></div><div class="z104-bars">
      <div class="z104-bar"><span>المستخدمون</span><div class="z104-track"><div class="z104-fill" style="width:${Math.min(100,s.users/max*100)}%"></div></div><b>${s.users}</b></div>
      <div class="z104-bar"><span>الألعاب</span><div class="z104-track"><div class="z104-fill" style="width:${Math.min(100,s.games/max*100)}%"></div></div><b>${s.games}</b></div>
      <div class="z104-bar"><span>التحديات</span><div class="z104-track"><div class="z104-fill" style="width:${Math.min(100,s.challengeCount/max*100)}%"></div></div><b>${s.challengeCount}</b></div>
      <div class="z104-bar"><span>عمليات التعدين</span><div class="z104-track"><div class="z104-fill" style="width:${Math.min(100,s.miningCount/max*100)}%"></div></div><b>${s.miningCount}</b></div>
    </div></div>
    <div class="z104-panel"><div class="z104-panel-head"><div><h3>🛰️ صحة النظام</h3><small>الحالة التشغيلية</small></div></div><div class="z104-status"><div>Firebase<b>CONNECTED</b></div><div>Hosting<b>ONLINE</b></div><div>Admin<b>OWNER ONLY</b></div><div>ZIVO<b>VIRTUAL ONLY</b></div><div>Mining<b>24H COOLDOWN</b></div><div>Mining issued<b>${s.miningTotal.toFixed(2)} ZIVO</b></div></div></div>
   </section>
  </main>
 </div>`;
 $('.z104-close',o).onclick=()=>o.remove();
 $('.z104-refresh',o).onclick=async e=>{e.currentTarget.disabled=true;e.currentTarget.textContent='جارٍ…';try{renderAdmin(await getUsers())}catch(err){e.currentTarget.textContent='خطأ'}};
}

async function openAdmin(){if(!owner())return;try{renderAdmin(await getUsers())}catch(e){console.error(e);alert('تعذر تحميل بيانات الإدارة. تحقق من اتصال Firebase وقواعد Firestore.')}}

let bootBound=false;
function bind(){
 const btn=$('#login-btn');
 if(owner()&&btn){
   btn.textContent='👑 ADMIN';btn.classList.add('z104-admin-name');btn.setAttribute('aria-label','غرفة إدارة ZIVOZONE');
 }
 beautifyChallenges();
 if(bootBound)return;
 bootBound=true;
 const firebaseAuth=auth();
 if(firebaseAuth?.onAuthStateChanged){
   firebaseAuth.onAuthStateChanged(()=>setTimeout(()=>{
     const b=$('#login-btn');
     if(owner()&&b){b.textContent='👑 ADMIN';b.classList.add('z104-admin-name');b.setAttribute('aria-label','غرفة إدارة ZIVOZONE');}
   },100));
 }
}
document.addEventListener('click',e=>{
 const b=e.target.closest('#login-btn');
 if(b&&owner()){e.preventDefault();e.stopImmediatePropagation();openAdmin();return;}
},true);
// V105.2 stability: do not attach a MutationObserver here. The previous observer
// repeatedly re-ran bind(), which created new Firebase auth listeners and timers
// whenever challenge cards/news/UI were rendered. That could saturate the main
// thread and make Chrome report "Page Unresponsive".
window.addEventListener('zivozone-auth',()=>setTimeout(bind,300));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
window.ZIVOZONE_V104={openAdmin};
})();
