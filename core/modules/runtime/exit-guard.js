/* ZIVOZONE V1200 — ONE UNIFIED EXIT / RETURN GUARD
   Resilient across route changes, re-renders and mobile navigation.
*/
(()=>{'use strict';
const ID='zivo-exit-guard';
const esc=window.ZIVOZONE_ESC;
const t=k=>{try{return window.zivoT?window.zivoT(k):(window.ZIVOZONE_I18N?.tr?.(k)||k)}catch(_){return k}};
const DEFAULT='هل أنت متأكد من مغادرة الموقع؟ سيتم إنهاء التجربة الحالية والعودة إلى الموقع.';
const EXIT_URL='https://www.google.com/';
function cleanupUI(){
 document.body.classList.remove('zivo-challenge-active','zivo-puzzle-active','zivo-beauty-active','horror-active','zivo-darkroom-active','zivo-dark-cinematic','zivo-cinematic-active','zivo-player-home-open','zivo-nav-open');
 document.body.style.removeProperty('overflow');
 document.body.removeAttribute('data-room-theme');
 document.querySelectorAll('.zivo-puzzle-room,.zbr-root,.zivo-challenge-runner,.zivo-challenge-core,.zivo-cinematic-entry').forEach(x=>{x.classList.remove('active','show','exit');});
 const core=document.getElementById('zivo-challenge-core'); if(core) core.innerHTML='';
 const modal=document.getElementById('modal-root'); if(modal){modal.innerHTML='';modal.setAttribute('aria-hidden','true');}
 const player=document.querySelector('.zph-overlay'); if(player) player.classList.remove('open');
 document.querySelectorAll('[aria-hidden="false"]').forEach(x=>{if(x.classList.contains('zph-overlay'))x.classList.remove('open')});
 try{window.ZIVOZONE_AUDIO?.stopChallenge?.()}catch(_){}
 try{window.ZIVOZONE_DARKROOM?.stop?.()}catch(_){}
 try{window.ZIVOZONE?.Challenges?.close?.()}catch(_){}
 try{window.ZIVOZONE?.ExitGuard?.ensure?.()}catch(_){}
}
function request(onConfirm,message=DEFAULT){
 const old=document.getElementById(ID);if(old)return;
 const m=document.createElement('div');m.id=ID;m.className='zivo-exit-guard';m.dir='rtl';
 m.innerHTML=`<div class="zivo-exit-card zivo-exit-cinematic" role="dialog" aria-modal="true" aria-labelledby="zivo-exit-title">
 <div class="zivo-exit-portal"><span>◈</span><i></i><b>بوابة المغادرة</b></div>
 <span class="zivo-exit-kicker">ZIVOZONE // EXIT GUARD</span>
 <h2 id="zivo-exit-title">هل أنت متأكد من مغادرة الموقع؟</h2>
 <p>${esc(message)}</p>
 <div class="zivo-exit-quote">«إذا غادرت الآن، ستنتهي التجربة الحالية.»</div>
 <div class="zivo-exit-actions"><button type="button" class="zivo-exit-stay">البقاء</button><button type="button" class="zivo-exit-yes">نعم، متابعة الخروج</button></div></div>`;
 document.body.appendChild(m);
 const close=()=>{m.remove();document.removeEventListener('keydown',escKey)};
 const escKey=e=>{if(e.key==='Escape')close()};
 m.querySelector('.zivo-exit-stay').onclick=close;
 m.querySelector('.zivo-exit-yes').onclick=()=>{close();cleanupUI();onConfirm?.()};
 m.addEventListener('click',e=>{if(e.target===m)close()});
 document.addEventListener('keydown',escKey);
 setTimeout(()=>m.querySelector('.zivo-exit-stay')?.focus(),20);
}
function goHome(){
 cleanupUI();
 try{window.__ZIVO_UNIFIED_EXIT?.()}catch(_){}
 const old=location.hash;
 if(old==='#home') window.dispatchEvent(new CustomEvent('zivozone-home-reset'));
 else location.hash='#home';
 setTimeout(()=>{window.dispatchEvent(new CustomEvent('zivozone-home-reset'));window.scrollTo?.({top:0,behavior:'instant'});},0);
}
function fullExit(){request(()=>{try{location.href=EXIT_URL}catch(_){window.open?.(EXIT_URL,'_self')}},'سيتم إنهاء التجربة الحالية ومغادرة موقع ZIVOZONE نهائياً.')}
function immersive(){return document.body.classList.contains('zivo-challenge-active')||document.body.classList.contains('zivo-puzzle-active')||document.body.classList.contains('zivo-beauty-active')}
/* V1230.81 — this used to auto-inject a persistent "⏻ Exit site" button into the main nav on
   every page, whose only action (fullExit(), below) is to confirm-dialog the visitor away to
   https://www.google.com/. Flagged in the 2026-10-11 review as unusual for a website (most sites
   don't put a button in their own nav whose job is to send visitors elsewhere) and not something a
   visitor has real use for; removed the injection here and the one static copy in index.html
   itself. fullExit()/request()/cleanupUI() stay as-is — they're the shared confirm-dialog/cleanup
   machinery other in-room "leave this room" actions reuse (via goHome()), this just stops the
   site-wide button that specifically pointed off-site. */
function ensure(){}
function bind(){
 ensure();
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-confirm-exit],.zivo-full-exit,[data-zivo-exit],.zivo-exit-button');if(!b)return;
  e.preventDefault();e.stopPropagation();
  if(b.classList.contains('zivo-full-exit')){fullExit();return}
  const href=b.getAttribute('href'),action=b.dataset.confirmExit||b.dataset.zivoExit;
  request(()=>{if(action==='close')return;if(href)location.href=href;else goHome()},b.dataset.exitMessage||DEFAULT);
 },true);
 ['hashchange','pageshow','popstate'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(ensure,0)));
 new MutationObserver(()=>ensure()).observe(document.body,{childList:true,subtree:true});
}
window.ZIVOZONE=window.ZIVOZONE||{};
window.ZIVOZONE.ExitGuard=Object.freeze({open:request,isImmersive:immersive,goHome,fullExit,ensure});
window.ZIVOZONE_EXIT_GUARD=window.ZIVOZONE.ExitGuard;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();