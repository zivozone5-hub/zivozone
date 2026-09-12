/* ZIVOZONE V1084 — CLEAN UNIFIED PLAYER EXPERIENCE
   One visible navigation system. Existing challenge, wallet, mining and profile APIs are reused.
*/
(function(){
'use strict';
const $=s=>document.querySelector(s);
const user=()=>{try{return window.firebase?.auth?.()?.currentUser||null}catch(e){return null}};
const economy=()=>window.ZIVOZONE_ECONOMY;
const player=()=>window.ZIVOZONE_PLAYER?.get?.()||{};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function toast(msg){let x=$('#z1084-toast');if(!x){x=document.createElement('div');x.id='z1084-toast';x.className='z1084-toast';document.body.appendChild(x)}x.textContent=msg;x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),2600)}
function scrollTo(id){const el=$(id);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',id)}}
function openWallet(){if(economy()?.open){economy().open();return}toast('المحفظة متاحة بعد تسجيل الدخول.');$('#login-btn')?.click()}
function mine(){if(economy()?.mine){economy().mine();return}$('#login-btn')?.click()}
function openHub(){
 let o=$('#z1084-hub');
 if(!o){o=document.createElement('div');o.id='z1084-hub';o.className='z1084-overlay';o.dir='rtl';document.body.appendChild(o);o.addEventListener('click',e=>{
   if(e.target===o||e.target.closest('[data-close-hub]')){o.classList.remove('open');return}
   const b=e.target.closest('[data-hub-route]');if(!b)return;const route=b.dataset.hubRoute;o.classList.remove('open');
   if(route==='challenges')scrollTo('#challenges');
   else if(route==='identity')scrollTo('#identity');
   else if(route==='dark'){window.ZIVOZONE_DARKROOM_V19?.start?.(); if(!window.ZIVOZONE_DARKROOM_V19?.isActive?.()) toast('افتح الغرفة المظلمة من التحديات الخاصة.');}
   else if(route==='ranking')window.ZIVOZONE_V29?.open?.();
   else if(route==='achievements')window.ZIVOZONE_V31?.open?.();
   else if(route==='missions')window.ZIVOZONE_V34?.open?.();
 });}
 o.innerHTML=`<div class="z1084-hub-card">
  <div class="z1084-head"><div><span class="z1084-kicker">ZIVOZONE HUB</span><h2>مركز عالمك</h2><p>التجارب الأساسية في مكان واحد — بدون أزرار مكررة.</p></div><button data-close-hub class="z1084-close">×</button></div>
  <div class="z1084-hub-grid">
   <button data-hub-route="challenges"><b>🎯 التحديات</b><small>المنطق · الذاكرة · الرياضة · السرعة</small></button>
   <button data-hub-route="dark"><b>🌑 الغرفة المظلمة</b><small>التجربة الخاصة الأكثر تميزًا</small></button>
   <button data-hub-route="identity"><b>🧠 من أنا؟</b><small>اختبار شخصيتك داخل ZIVOZONE</small></button>
   <button data-hub-route="ranking"><b>🏆 التصنيف</b><small>قارن أفضل نتائجك باللاعبين</small></button>
   <button data-hub-route="achievements"><b>🏅 الإنجازات</b><small>الشارات والتقدم الذي جمعته</small></button>
   <button data-hub-route="missions"><b>🔥 المهام</b><small>أهداف قصيرة تدفعك للعودة</small></button>
  </div>
  <div class="z1084-hub-note">💡 <b>الاقتصاد خارج الـHub عمدًا:</b> ملف اللاعب والمحفظة والتعدين أدوات يومية، لذلك لها وصول مباشر وواضح.</div>
 </div>`;
 o.classList.add('open');
}
function profile(){if(window.ZIVOZONE_PROFILE?.open)return window.ZIVOZONE_PROFILE.open();scrollTo('#profile')}
function renderBar(){
 const p=player(), w=economy()?.getWallet?.()||{};
 const name=(p.name||user()?.displayName||'لاعب ZIVO').trim();
 const bal=Number(w.zivo??w.balance??p.zivo??0);
 document.querySelectorAll('[data-z1084-name]').forEach(x=>x.textContent=name);
 document.querySelectorAll('[data-z1084-balance]').forEach(x=>x.textContent=`${bal%1?bal.toFixed(2):bal} ZIVO`);
 const lv=$('[data-z1084-level]');if(lv)lv.textContent=`LEVEL ${Number(p.level)||1}`;
}
function mount(){
 // Remove any leftover legacy launchers from older builds.
 ['v1080-launch','v1081-profile-launch','v1083-dock','v1083-profile-modal'].forEach(id=>document.getElementById(id)?.remove());
 const old=$('#zivo-v101-economy'); if(old) old.classList.add('z1084-legacy-economy');
 // Desktop compact player/economy bar.
 if(!$('#z1084-bar')){
  const bar=document.createElement('div');bar.id='z1084-bar';bar.dir='rtl';bar.innerHTML=`
   <button class="z1084-bar-profile" data-z1084-profile><span class="z1084-mini-avatar">⚽</span><span><b data-z1084-name>لاعب ZIVO</b><small data-z1084-level>LEVEL 1</small></span></button>
   <button class="z1084-bar-btn wallet" data-z1084-wallet>💰 <span data-z1084-balance>0 ZIVO</span></button>
   <button class="z1084-bar-btn mine" data-z1084-mine>⛏️ التعدين</button>
   <button class="z1084-bar-btn hub" data-z1084-hub>⚡ ZIVO HUB</button>`;
  document.body.appendChild(bar);
  bar.querySelector('[data-z1084-profile]').onclick=profile;
  bar.querySelector('[data-z1084-wallet]').onclick=openWallet;
  bar.querySelector('[data-z1084-mine]').onclick=mine;
  bar.querySelector('[data-z1084-hub]').onclick=openHub;
 }
 if(!$('#z1084-mobile')){
  const nav=document.createElement('nav');nav.id='z1084-mobile';nav.dir='rtl';nav.innerHTML=`
   <button data-z1084-profile>👤<span>ملفي</span></button>
   <button data-z1084-wallet>💰<span>المحفظة</span></button>
   <button data-z1084-mine>⛏️<span>التعدين</span></button>
   <button data-z1084-hub>⚡<span>ZIVO HUB</span></button>`;
  document.body.appendChild(nav);
  nav.querySelectorAll('[data-z1084-profile]').forEach(b=>b.onclick=profile);
  nav.querySelectorAll('[data-z1084-wallet]').forEach(b=>b.onclick=openWallet);
  nav.querySelectorAll('[data-z1084-mine]').forEach(b=>b.onclick=mine);
  nav.querySelectorAll('[data-z1084-hub]').forEach(b=>b.onclick=openHub);
 }
 renderBar();
 window.addEventListener('zivozone-auth',()=>setTimeout(renderBar,250));
 window.addEventListener('zivo:player-updated',renderBar);
 setInterval(renderBar,10000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.ZIVOZONE_V1084={openHub,openWallet,mine,profile};
})();
