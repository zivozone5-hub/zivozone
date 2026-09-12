/* ZIVOZONE V1086 — FOUNDATION / SINGLE NAVIGATION SYSTEM
   Keeps challenges, Dark Room, identity, player profile, wallet and mining.
   Removes duplicate launchers and makes the mobile path the primary UX.
*/
(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const auth=()=>window.ZIVOZONE_AUTH;
  const economy=()=>window.ZIVOZONE_ECONOMY;
  const player=()=>auth()?.getPlayer?.()||window.ZIVOZONE_V21?.get?.()||{};
  const user=()=>auth()?.getUser?.()||window.firebase?.auth?.()?.currentUser||null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function go(hash){
    if(hash==='#profile') return window.ZIVOZONE_PROFILE?.open?.();
    if(hash==='#hub') return window.ZIVOZONE_V1086?.openHub?.();
    if(hash==='#wallet') return economy()?.open?.();
    if(hash==='#mine') return economy()?.mine?.();
    if(hash==='#dark') return startDark();
    location.hash=hash;
    const el=$(hash); if(el) setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }
  function startDark(){
    if(window.ZIVOZONE_V20?.start){window.ZIVOZONE_V20.start('horror');return true;}
    if(window.ZIVOZONE_DARKROOM_V19?.start){window.ZIVOZONE_DARKROOM_V19.start();return true;}
    return false;
  }
  function openHub(){
    let o=$('#z86-hub');
    if(!o){
      o=document.createElement('div');o.id='z86-hub';o.className='z1084-overlay';o.dir='rtl';
      document.body.appendChild(o);
      o.addEventListener('click',e=>{
        if(e.target===o||e.target.closest('[data-z86-close]')){o.classList.remove('open');return}
        const b=e.target.closest('[data-z86-route]');if(!b)return;
        o.classList.remove('open');go(b.dataset.z86Route);
      });
    }
    o.innerHTML=`<div class="z1084-hub-card z86-hub-card">
      <div class="z1084-head"><div><span class="z1084-kicker">ZIVOZONE HUB</span><h2>مركز عالمك</h2><p>كل التجارب الأساسية في مكان واحد — بدون تكرار.</p></div><button data-z86-close class="z1084-close">×</button></div>
      <div class="z1084-hub-grid">
        <button data-z86-route="#challenges"><b>🎯 التحديات</b><small>المنطق · الذاكرة · الرياضة · السرعة</small></button>
        <button data-z86-route="#dark"><b>🌑 الغرفة المظلمة</b><small>تجربة نفسية سينمائية كاملة الشاشة</small></button>
        <button data-z86-route="#identity"><b>🧠 من أنا؟</b><small>اكتشف نتيجتك الشخصية</small></button>
        <button data-z86-route="#profile"><b>👤 ملفي</b><small>رحلتك ونتائجك وتقدمك</small></button>
        <button data-z86-route="#sports"><b>🏆 الرياضة</b><small>الأخبار والمباريات والبيانات</small></button>
        <button data-z86-route="#ai"><b>🤖 ZIVO AI</b><small>المساعد الذكي</small></button>
      </div>
      <div class="z1084-hub-note">💡 المحفظة والتعدين في الوصول اليومي المباشر، بينما الـHub مخصص لاكتشاف التجارب والتنقل بينها.</div>
    </div>`;
    o.classList.add('open');
  }
  function updateAccount(){
    const b=$('#login-btn'); if(!b)return;
    const u=user(),p=player();
    const logged=!!(auth()?.isLoggedIn?.()||u);
    const name=String(p?.name||u?.displayName||u?.name||'لاعب ZIVO').trim();
    const admin=auth()?.isAdmin?.()||String(u?.email||'').toLowerCase()==='raefalbtish@gmail.com';
    b.classList.toggle('z86-account',logged);
    b.textContent=admin?'👑 ADMIN':logged?`👤 ${name}`:'🔐 إنشاء حساب / دخول';
    b.title=admin?'غرفة إدارة ZIVOZONE':logged?'فتح ملف اللاعب':'تسجيل الدخول أو إنشاء حساب';
    if(logged) b.onclick=()=>admin?location.hash='#admin':go('#profile');
  }
  function menuSheet(){
    let o=$('#z86-menu-sheet');
    if(!o){
      o=document.createElement('div');o.id='z86-menu-sheet';o.dir='rtl';
      o.innerHTML=`<div class="z86-menu-card"><div class="z86-menu-head"><div><small class="z1084-kicker">ZIVOZONE</small><h2>التنقل السريع</h2></div><button class="z86-menu-close">×</button></div><div class="z86-menu-grid">
        <button data-route="#home">⌂ الرئيسية<small>الواجهة الرئيسية</small></button>
        <button data-route="#challenges">🎯 التحديات<small>مركز الألعاب</small></button>
        <button data-route="#identity">🧠 من أنا؟<small>اختبار الشخصية</small></button>
        <button data-route="#ai">🤖 ZIVO AI<small>المساعد الذكي</small></button>
        <button data-route="#sports">⚽ الرياضة<small>الأخبار والمباريات</small></button>
        <button data-route="#profile">👤 ملفي<small>تقدمك الكامل</small></button>
      </div></div>`;
      document.body.appendChild(o);
      o.addEventListener('click',e=>{
        if(e.target===o||e.target.closest('.z86-menu-close')){o.classList.remove('open');return}
        const b=e.target.closest('[data-route]');if(!b)return;o.classList.remove('open');go(b.dataset.route);
      });
    }
    o.classList.add('open');
  }
  function confirmLogout(){
    let o=$('#z86-logout');
    if(!o){
      o=document.createElement('div');o.id='z86-logout';o.dir='rtl';
      o.innerHTML=`<div class="z86-logout-card"><div class="z86-logout-icon">🥺</div><h2>لحظة... رايح تترك ZIVOZONE؟</h2><p>رحلتك، نقاطك وذكريات تحدياتك مستنيتك هون.<br>إذا كنت محتاج استراحة، خذها وارجع لنا لاحقًا 💙</p><div class="z86-logout-actions"><button class="stay">ابقَ معي</button><button class="leave">تسجيل الخروج</button></div></div>`;
      document.body.appendChild(o);
      o.addEventListener('click',async e=>{
        if(e.target===o||e.target.closest('.stay')){o.classList.remove('open');return}
        if(e.target.closest('.leave')){o.classList.remove('open');await auth()?.logout?.();updateAccount();}
      });
    }
    o.classList.add('open');
  }
  function interceptLogout(){
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-profile-action="logout"]');
      if(!b)return;
      e.preventDefault();e.stopImmediatePropagation();confirmLogout();
    },true);
  }
  function cleanLegacy(){
    ['z1084-bar','z1084-mobile','v1080-launch','v1081-profile-launch','v1083-dock','zivo-v101-economy','zivo-global-wallet','zivo-v85-open','zivo-v85-economy','zivo-v81-open','zivo-v81-economy','zivo-v80-open','zivo-v87-quickdock','z80-admin-open','v26-open','z25-wallet-btn','zivo-v24-balance'].forEach(id=>document.getElementById(id)?.remove());
    $('#mobile-more')?.remove();$('#mobile-tools')?.remove();
  }
  function utility(){
    if(!$('#z86-utility')){
      const bar=document.createElement('div');bar.id='z86-utility';bar.dir='rtl';bar.innerHTML=`
        <button class="z86-profile" data-z86="profile"><span class="z86-mini-avatar">⚽</span><span class="z86-mini-copy"><b data-z86-name>لاعب ZIVO</b><small data-z86-level>LEVEL 1</small></span></button>
        <button class="z86-wallet" data-z86="wallet">💰 المحفظة <span data-z86-balance>0 ZIVO</span></button>
        <button class="z86-mine" data-z86="mine">⛏️ التعدين</button>
        <button class="z86-hub" data-z86="hub">⚡ ZIVO HUB</button>`;
      document.body.appendChild(bar);
      bar.addEventListener('click',e=>{const b=e.target.closest('[data-z86]');if(!b)return;go('#'+b.dataset.z86)});
    }
    if(!$('#z86-mobile-dock')){
      const nav=document.createElement('nav');nav.id='z86-mobile-dock';nav.dir='rtl';nav.innerHTML=`<button data-z86="profile">👤<span>ملفي</span></button><button data-z86="wallet">💰<span>المحفظة</span></button><button data-z86="mine">⛏️<span>التعدين</span></button><button data-z86="hub">⚡<span>ZIVO HUB</span></button>`;
      document.body.appendChild(nav);nav.addEventListener('click',e=>{const b=e.target.closest('[data-z86]');if(b)go('#'+b.dataset.z86)});
    }
    if(!$('#z86-menu')){
      const b=document.createElement('button');b.id='z86-menu';b.type='button';b.innerHTML='☰';b.setAttribute('aria-label','فتح قائمة التنقل');b.onclick=menuSheet;
      $('.topbar')?.appendChild(b);
    }
    $('#z86-utility [data-z86="profile"]')?.setAttribute('title','ملف اللاعب');
  }
  function renderUtility(){
    const p=player(),w=economy()?.getWallet?.()||{};
    const name=String(p?.name||user()?.displayName||user()?.name||'لاعب ZIVO').trim();
    const level=Number(p?.level)||1,bal=Number(w.zivo??w.balance??p?.zivo??0);
    $$('[data-z86-name]').forEach(x=>x.textContent=name);$$('[data-z86-level]').forEach(x=>x.textContent=`LEVEL ${level}`);$$('[data-z86-balance]').forEach(x=>x.textContent=`${bal%1?bal.toFixed(2):bal} ZIVO`);
  }
  function patchProfileLogout(){
    if(window.ZIVOZONE_PROFILE?.open){/* interceptor handles the button */}
  }
  function mount(){
    cleanLegacy();utility();menuSheet();updateAccount();renderUtility();interceptLogout();
    window.addEventListener('zivozone-auth',()=>setTimeout(()=>{updateAccount();renderUtility()},120));
    window.addEventListener('zivo:player-updated',renderUtility);
    window.addEventListener('zivozone-cloud-synced',renderUtility);
    setInterval(()=>{updateAccount();renderUtility()},5000);
  }
  window.ZIVOZONE_V1086={openHub,startDark,openWallet:()=>economy()?.open?.(),mine:()=>economy()?.mine?.(),profile:()=>window.ZIVOZONE_PROFILE?.open?.(),confirmLogout};
  /* Compatibility for V1085's existing HUB route. */
  window.ZIVOZONE_V1084=Object.assign(window.ZIVOZONE_V1084||{},{openHub,openWallet:()=>economy()?.open?.(),mine:()=>economy()?.mine?.(),profile:()=>window.ZIVOZONE_PROFILE?.open?.()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
