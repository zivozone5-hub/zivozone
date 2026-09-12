/* ZIVOZONE V1085 — PLAYER PROFILE / MOBILE-FIRST PLAYER CENTER
   Uses the existing Firebase player, wallet and result systems. No paid service.
*/
(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const auth=()=>window.ZIVOZONE_AUTH;
  const econ=()=>window.ZIVOZONE_ECONOMY;
  const localPlayer=()=>window.ZIVOZONE_V21?.get?.()||{};
  const cloudUser=()=>auth()?.getUser?.()||null;
  const cloudPlayer=()=>auth()?.getPlayer?.()||null;

  function fmtDate(v){
    try{const d=v?.toDate?v.toDate():new Date(v); if(!Number.isNaN(d.getTime())) return d.toLocaleDateString('ar-JO',{day:'2-digit',month:'short',year:'numeric'});}catch(e){}
    return '—';
  }
  function challengeLabel(id){
    const m={iq:'اختبار الذكاء',science:'العلوم',math:'الرياضيات',memory:'الذاكرة',reaction:'رد الفعل',focus:'التركيز',sports:'الرياضة',football:'كرة القدم',horror:'الغرفة المظلمة',daily:'تحدي اليوم',identity:'من أنا؟',logic:'المنطق',strategy:'الاستراتيجية'};
    return m[String(id||'').toLowerCase()]||String(id||'تجربة ZIVO');
  }
  function merged(){
    const lp=localPlayer(), cp=cloudPlayer()||{}, u=cloudUser()||{};
    return {
      name:cp.name||lp.name||u.displayName||u.name||'لاعب ZIVO',
      email:cp.email||u.email||'',
      age:cp.age||'', level:Number(cp.level??lp.level)||1,
      xp:Number(cp.totalXP??cp.xp??lp.totalXP??lp.xp)||0,
      zivo:Number(econ()?.getWallet?.()?.zivo??econ()?.getWallet?.()?.balance??cp.zivo??cp.coins??0),
      games:Number(cp.gamesPlayed??cp.games??lp.gamesPlayed)||0,
      best:Number(cp.bestScore??cp.best??lp.bestScore)||0,
      streak:Number(cp.bestStreak??cp.streak??lp.bestStreak)||0,
      questions:Number(cp.questionsAnswered??lp.questionsAnswered)||0,
      timeouts:Number(cp.timedOut??lp.timedOut)||0,
      stats:lp.stats||cp.stats||{}
    };
  }
  function avatar(name){return `<div class="z1085-avatar"><span>${esc(String(name||'Z').trim().charAt(0).toUpperCase()||'Z')}</span></div>`}

  async function loadCloudActivity(){
    const u=cloudUser();
    if(!u||String(u.uid||'').startsWith('local_')||!window.firebase?.firestore) return [];
    try{
      const db=window.firebase.firestore();
      const snap=await db.collection('players').doc(u.uid).collection('results').orderBy('createdAt','desc').limit(12).get();
      return snap.docs.map(d=>({id:d.id,...d.data()}));
    }catch(e){return []}
  }

  function localActivity(){
    const p=localPlayer();
    return Array.isArray(p.history)?p.history.slice().reverse().slice(0,12).map(x=>({challengeId:x.challenge,score:x.score,xp:x.xp,createdAt:x.at})):[];
  }

  function renderShell(){
    const p=merged();
    const levelBase=Math.max(100,p.level*100);
    const progress=Math.min(100,Math.round((p.xp%levelBase)/levelBase*100));
    const logged=!!auth()?.isLoggedIn?.();
    const status=logged?'حساب محفوظ سحابيًا':'وضع الزائر — التقدم المحلي فقط';
    return `<div class="z1085-profile-wrap" dir="rtl">
      <div class="z1085-profile-hero">
        <div class="z1085-profile-identity">
          ${avatar(p.name)}
          <div class="z1085-player-copy"><span class="z1085-kicker">ZIVOZONE PLAYER</span><h1>${esc(p.name)}</h1><p>${esc(status)}${p.email?' · '+esc(p.email):''}</p><div class="z1085-level-line"><strong>LEVEL ${p.level}</strong><span>XP ${p.xp}</span></div><div class="z1085-xp"><span style="width:${progress}%"></span></div></div>
        </div>
        <div class="z1085-profile-actions"><button class="btn btn-primary" data-profile-action="wallet">💰 المحفظة</button><button class="btn btn-ghost" data-profile-action="mine">⛏️ التعدين</button>${logged?'<button class="btn btn-ghost" data-profile-action="logout">تسجيل الخروج</button>':'<button class="btn btn-ghost" data-profile-action="login">🔐 حفظ تقدمي</button>'}</div>
      </div>
      <div class="z1085-stat-grid">
        <article><span>LEVEL</span><b>${p.level}</b><small>مستواك الحالي</small></article>
        <article><span>XP</span><b>${p.xp}</b><small>خبرتك المتراكمة</small></article>
        <article class="gold"><span>ZIVO</span><b>🪙 ${p.zivo}</b><small>رصيدك داخل المنصة</small></article>
        <article><span>التحديات</span><b>${p.games}</b><small>جولات مكتملة</small></article>
        <article><span>أفضل نتيجة</span><b>${p.best}</b><small>أعلى أداء</small></article>
        <article><span>STREAK</span><b>🔥 ${p.streak}</b><small>أفضل سلسلة</small></article>
      </div>
      <div class="z1085-profile-grid">
        <section class="z1085-card z1085-activity-card"><div class="z1085-card-head"><div><span class="z1085-kicker">JOURNEY</span><h2>رحلتي داخل ZIVOZONE</h2></div><button class="z1085-refresh" data-profile-action="refresh">↻</button></div><div id="z1085-activity"><div class="z1085-empty">جاري تحميل نشاطك...</div></div></section>
        <aside class="z1085-side">
          <section class="z1085-card"><div class="z1085-card-head"><div><span class="z1085-kicker">ECONOMY</span><h2>اقتصادي</h2></div></div><div class="z1085-balance"><span>رصيد ZIVO</span><strong>🪙 ${p.zivo}</strong></div><div class="z1085-mini-actions"><button data-profile-action="wallet">فتح المحفظة</button><button data-profile-action="mine">التعدين اليومي</button></div></section>
          <section class="z1085-card"><div class="z1085-card-head"><div><span class="z1085-kicker">PROGRESS</span><h2>تقدم اللاعب</h2></div></div><div class="z1085-progress-list"><div><span>الأسئلة</span><b>${p.questions}</b></div><div><span>أفضل سلسلة</span><b>${p.streak}</b></div><div><span>أخطاء/وقت</span><b>${p.timeouts}</b></div></div></section>
        </aside>
      </div>
      <section class="z1085-card z1085-access"><div class="z1085-card-head"><div><span class="z1085-kicker">QUICK ACCESS</span><h2>أدواتي</h2></div><span class="z1085-muted">بدون تكرار</span></div><div class="z1085-tool-grid"><button data-profile-action="challenges">🎯<b>التحديات</b><small>العب وارفع XP</small></button><button data-profile-action="hub">⚡<b>ZIVO HUB</b><small>كل تجاربك</small></button><button data-profile-action="identity">🧠<b>من أنا؟</b><small>نتيجتك الشخصية</small></button><button data-profile-action="achievements">🏅<b>الإنجازات</b><small>شاراتك</small></button></div></section>
      <div class="z1085-save-note">☁️ <strong>تقدمك محفوظ:</strong> عند تسجيل الدخول تُحفظ بيانات اللاعب ونتائج التحديات والرصيد في حسابك. ZIVO عملة افتراضية داخل ZIVOZONE وليست نقودًا.</div>
    </div>`;
  }

  function renderActivity(items){
    const box=$('#z1085-activity');if(!box)return;
    if(!items.length){box.innerHTML='<div class="z1085-empty">لا توجد نتائج مسجلة بعد. ابدأ أول تحدٍ ليظهر هنا.</div>';return}
    box.innerHTML=items.map(x=>{
      const total=Number(x.total||x.questions||10)||10, score=Number(x.score||x.correct||0)||0;
      const pct=Math.round(score/Math.max(1,total)*100);
      return `<div class="z1085-activity-row"><div class="z1085-activity-icon">${pct===100?'💯':'🎯'}</div><div class="z1085-activity-main"><strong>${esc(challengeLabel(x.challengeId||x.challenge||x.gameId))}</strong><span>${score}/${total} · +${Number(x.xp||0)} XP</span></div><div class="z1085-activity-date">${fmtDate(x.createdAt||x.at)}</div></div>`;
    }).join('');
  }

  async function open(){
    let root=$('#z1085-profile');
    if(!root){root=document.createElement('div');root.id='z1085-profile';document.body.appendChild(root);bind(root)}
    root.innerHTML=renderShell();root.classList.add('open');
    const items=localActivity();renderActivity(items);
    const cloud=await loadCloudActivity();
    renderActivity(cloud.length?cloud:items);
    if(location.hash!=='#profile')history.replaceState(null,'','#profile');
  }
  function close(){const r=$('#z1085-profile');if(r)r.classList.remove('open')}
  function route(action){
    if(action==='wallet')return econ()?.open?.();
    if(action==='mine')return econ()?.mine?.();
    if(action==='login')return document.querySelector('#login-btn')?.click();
    if(action==='logout')return auth()?.logout?.();
    if(action==='challenges')return location.hash='#challenges';
    if(action==='identity')return location.hash='#identity';
    if(action==='achievements')return window.ZIVOZONE_V31?.open?.();
    if(action==='hub')return window.ZIVOZONE_V1084?.openHub?.();
    if(action==='refresh')return open();
  }
  function bind(root){
    root.addEventListener('click',e=>{const b=e.target.closest('[data-profile-action]');if(b)route(b.dataset.profileAction)});
    root.addEventListener('click',e=>{if(e.target===root){close()}});
  }
  function wireNavigation(){
    document.querySelectorAll('a[href="#profile"]').forEach(a=>{a.addEventListener('click',e=>{e.preventDefault();open()})});
    document.querySelectorAll('[data-mobile-nav="profile"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();open()}));
  }
  function mount(){
    wireNavigation();
    window.addEventListener('zivozone-auth',()=>{const r=$('#z1085-profile');if(r?.classList.contains('open'))open()});
    window.addEventListener('zivo:player-updated',()=>{const r=$('#z1085-profile');if(r?.classList.contains('open'))open()});
    window.ZIVOZONE_PROFILE={open,close,refresh:open};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
