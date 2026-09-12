/* ZIVOZONE V1081 — PLAYER PROFILE + WALLET SAFE UI
   Additive to V1080/V1073. No payment processor or Billing added.
*/
(function(){
'use strict';
const PROFILE_KEY='zivozone_player_profile_v1081';
const LEDGER_KEY='zivozone_wallet_ledger_v1081';

function getProfile(){
  let p={};
  try{p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch(e){}
  const core=window.ZIVOZONE_CORE?.player?.()||{};
  return {
    name:p.name||localStorage.getItem('zivo_name')||'ZIVO Player',
    photo:p.photo||localStorage.getItem('zivo_photo')||'',
    level:Number(core.level)||Number(p.level)||1,
    xp:Number(core.xp)||Number(p.xp)||0,
    zivo:Number(core.zivo)||Number(p.zivo)||0,
    streak:Number(core.streak)||Number(p.streak)||0,
    games:Number(core.games)||0,
    best:Number(core.best)||0
  };
}
function ledger(){
  try{return JSON.parse(localStorage.getItem(LEDGER_KEY)||'[]')}catch(e){return []}
}
function addLedger(type,amount,label){
  const a=ledger(); a.unshift({type,amount:Number(amount)||0,label,date:new Date().toISOString()});
  localStorage.setItem(LEDGER_KEY,JSON.stringify(a.slice(0,100)));
}
function setProfile(p){localStorage.setItem(PROFILE_KEY,JSON.stringify(p))}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function render(){
 const p=getProfile(), l=ledger();
 const avatar=p.photo?`<img src="${esc(p.photo)}" alt="صورة اللاعب">`:`<span>⚽</span>`;
 const rows=l.length?l.slice(0,8).map(x=>`<div class="v1081-row"><span>${esc(x.label)}</span><b>${x.amount>0?'+':''}${x.amount} ZIVO</b></div>`).join(''):`<div class="v1081-empty">لا توجد عمليات مسجلة بعد</div>`;
 return `<div class="v1081-modal" dir="rtl"><div class="v1081-card">
 <button class="v1081-x" aria-label="إغلاق">×</button>
 <div class="v1081-profile">
  <div class="v1081-avatar">${avatar}</div>
  <div><small>ZIVOZONE PLAYER</small><h2>${esc(p.name)}</h2><div class="v1081-level">LEVEL ${p.level}</div></div>
 </div>
 <div class="v1081-stats">
  <div><small>XP</small><b>${p.xp}</b></div><div><small>ZIVO</small><b>🪙 ${p.zivo}</b></div>
  <div><small>STREAK</small><b>🔥 ${p.streak}</b></div><div><small>CHALLENGES</small><b>${p.games}</b></div>
 </div>
 <div class="v1081-tabs"><button class="active" data-tab="profile">👤 ملفي</button><button data-tab="wallet">💰 المحفظة</button><button data-tab="store">🛒 المتجر</button></div>
 <section data-pane="profile"><h3>📊 إحصائياتي</h3><div class="v1081-statline"><span>أفضل نتيجة</span><b>${p.best||0}</b></div><div class="v1081-statline"><span>المستوى</span><b>${p.level}</b></div><div class="v1081-statline"><span>XP</span><b>${p.xp}</b></div></section>
 <section data-pane="wallet" style="display:none"><h3>💰 محفظة ZIVO</h3><div class="v1081-balance">🪙 ${p.zivo} <small>ZIVO</small></div><div class="v1081-ledger">${rows}</div></section>
 <section data-pane="store" style="display:none"><h3>🛒 متجر ZIVO</h3><div class="v1081-notice">المتجر مجهّز كواجهة فقط في هذه النسخة. لا يتم خصم أو إضافة أموال حقيقية، ولا يوجد دفع حقيقي حتى نربط مزود دفع آمن من جهة الخادم.</div><div class="v1081-pack"><b>100 ZIVO</b><span>قريبًا</span></div><div class="v1081-pack"><b>500 ZIVO</b><span>قريبًا</span></div><div class="v1081-pack"><b>1,200 ZIVO</b><span>قريبًا</span></div></section>
 </div></div>`;
}
function open(){
 let o=document.getElementById('v1081-player');
 if(!o){o=document.createElement('div');o.id='v1081-player';document.body.appendChild(o);
  o.addEventListener('click',e=>{
   if(e.target===o||e.target.closest('.v1081-x')){o.classList.remove('open');return}
   const t=e.target.closest('[data-tab]'); if(t){
    o.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));t.classList.add('active');
    o.querySelectorAll('[data-pane]').forEach(x=>x.style.display=x.dataset.pane===t.dataset.tab?'block':'none');
   }
  });
 }
 o.innerHTML=render();o.classList.add('open');
}
function mount(){
 if(document.getElementById('v1081-profile-launch'))return;
 const b=document.createElement('button');b.id='v1081-profile-launch';b.className='v1081-launch';b.textContent='👤 ملف اللاعب';b.onclick=open;document.body.appendChild(b);
}
window.ZIVOZONE_PLAYER={open,getProfile,addLedger,setProfile};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
