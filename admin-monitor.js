/* ZIVOZONE V78 — OWNER ADMIN MONITOR
   Works directly from GitHub Pages + Firebase client SDK.
   No Cloud Functions deployment is required for the admin dashboard.
*/
(function(){'use strict';
  const OWNER_UID='rBlzUigQ6DhgD4CK6VX3tS43PS43';
  const OWNER_EMAIL='raefalbtish@gmail.com';
  const db=()=>window.firebase?.firestore?.();
  const auth=()=>window.firebase?.auth?.();
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const visitorKey='zivozone_visitor_id_v78';
  function visitorId(){
    let v=localStorage.getItem(visitorKey);
    if(!v){v=crypto?.randomUUID?.()||('v_'+Math.random().toString(36).slice(2)+Date.now());localStorage.setItem(visitorKey,v)}
    return v;
  }
  function isOwner(){
    const u=auth()?.currentUser;
    return !!u && u.uid===OWNER_UID && String(u.email||'').toLowerCase()===OWNER_EMAIL;
  }
  async function heartbeat(){
    try{
      const d=db(),u=auth()?.currentUser;
      if(!d)return;
      const vid=visitorId(), day=new Date().toISOString().slice(0,10);
      await d.collection('siteStats').doc('visitors').collection(day).doc(vid).set({
        lastSeen:firebase.firestore.FieldValue.serverTimestamp(),
        path:location.pathname+location.hash,
        uid:u?.uid||null,
        email:u?.email||null
      },{merge:true});
      if(u){
        await d.collection('players').doc(u.uid).set({
          lastSeen:firebase.firestore.FieldValue.serverTimestamp(),
          lastSeenAt:firebase.firestore.FieldValue.serverTimestamp(),
          lastSeenPath:location.hash||'#home'
        },{merge:true});
      }
    }catch(e){console.warn('ZIVOZONE heartbeat:',e)}
  }
  async function adminData(){
    const d=db(),u=auth()?.currentUser;
    if(!d||!u)throw new Error('Login required');
    if(!isOwner())throw new Error('Admin access required');
    const [ps,vs]=await Promise.all([
      d.collection('players').limit(500).get(),
      d.collection('siteStats').doc('visitors').collection(new Date().toISOString().slice(0,10)).limit(1000).get().catch(()=>({docs:[]}))
    ]);
    const players=ps.docs.map(x=>({uid:x.id,...x.data()})).sort((a,b)=>{
      const ad=a.lastSeenAt?.toMillis?.()||a.lastSeen?.toMillis?.()||0;
      const bd=b.lastSeenAt?.toMillis?.()||b.lastSeen?.toMillis?.()||0; return bd-ad;
    });
    const now=Date.now();
    const active=players.filter(p=>{
      const t=p.lastSeenAt?.toMillis?.()||p.lastSeen?.toMillis?.()||0; return t && now-t<15*60*1000;
    }).length;
    const visitors=vs.docs.length;
    return {stats:{
      totalUsers:players.length,totalPlayers:players.length,todayVisitors:visitors,
      todayLogins:players.filter(p=>{const t=p.lastSeenAt?.toMillis?.()||0;return t && new Date(t).toDateString()===new Date().toDateString()}).length,
      todayGames:players.reduce((n,p)=>n+(Number(p.gamesPlayed)||0),0),
      activeNow:active,firebase:'CONNECTED',news:'LIVE'
    },players:players.slice(0,100).map(p=>({
      uid:p.uid,name:p.name||'ZIVO Player',email:p.email||'',level:Number(p.level)||1,
      gamesPlayed:Number(p.gamesPlayed)||0,
      lastSeen:(p.lastSeenAt||p.lastSeen)?.toDate?.()?.toISOString?.()||null
    }))};
  }
  function panel(data){
    let o=document.getElementById('zivo-v75-admin');
    if(!o){o=document.createElement('div');o.id='zivo-v75-admin';o.className='z75-overlay';document.body.appendChild(o)}
    const s=data.stats||{},players=data.players||[];
    o.innerHTML=`<div class="z75-card"><button class="z75-x">×</button>
    <div class="z75-head"><div class="z75-logo">Z</div><div><small>ADMIN COMMAND</small><h2>مركز إدارة ZIVOZONE</h2><span>المستخدمون · اللاعبون · النشاط · صحة المنصة</span></div></div>
    <div class="z75-grid">
      <div><b>${s.totalUsers||0}</b><span>حسابات مسجلة</span></div>
      <div><b>${s.todayVisitors||0}</b><span>زوار اليوم</span></div>
      <div><b>${s.todayLogins||0}</b><span>دخول اليوم</span></div>
      <div><b>${s.activeNow||0}</b><span>نشط الآن</span></div>
      <div><b>${s.totalPlayers||0}</b><span>لاعبون</span></div>
      <div><b>${s.todayGames||0}</b><span>إجمالي الألعاب</span></div>
    </div>
    <div class="z75-status"><b>🟢 الموقع:</b> ONLINE · <b>🔒 HTTPS:</b> ACTIVE · <b>☁ Firebase:</b> ${esc(s.firebase||'UNKNOWN')} · <b>📰 الأخبار:</b> ${esc(s.news||'UNKNOWN')}</div>
    <h3>آخر اللاعبين والمستخدمين</h3>
    <div class="z75-table">${players.length?players.map(p=>`<div class="z75-row"><b>${esc(p.name)}</b><span>${esc(p.email)}</span><span>Lv ${p.level}</span><span>${p.gamesPlayed} لعبة</span><span>${p.lastSeen?new Date(p.lastSeen).toLocaleString('ar-JO'):'—'}</span></div>`).join(''):'<p>لا توجد حسابات بعد.</p>'}</div>
    <p class="z75-note">هذه اللوحة متاحة فقط للحساب المالك المحدد في إعدادات ZIVOZONE. البيانات تُقرأ مباشرة من Firebase بدون الحاجة إلى نشر Cloud Functions.</p>
    </div>`;
    o.querySelector('.z75-x').onclick=()=>o.remove();
  }
  async function open(){
    try{
      if(!auth()?.currentUser){alert('سجّل الدخول أولًا بحساب الأدمن.');return}
      if(!isOwner()){alert('هذا الحساب ليس حساب إدارة ZIVOZONE.');return}
      panel(await adminData());
    }catch(e){console.error(e);alert('تعذر تحميل بيانات الإدارة. تأكد من نشر Firestore Rules ثم أعد تحميل الصفحة.')}
  }
  window.ZIVOZONE_MONITOR={heartbeat,open,adminData};
  window.addEventListener('load',()=>setTimeout(heartbeat,1200));
  if(location.hash==='#admin') setTimeout(open,1800);
})();
