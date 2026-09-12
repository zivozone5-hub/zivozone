
/* ZIVOZONE V1083 — player/economy bridge
   Keeps V1073/V1080 systems and connects visible UI to the existing Firebase wallet/mining APIs.
*/
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const user=()=>{try{return window.firebase?.auth?.()?.currentUser||null}catch(e){return null}};
const economy=()=>window.ZIVOZONE_ECONOMY;
function localProfile(){
  try{return JSON.parse(localStorage.getItem('zivozone_player_v17')||'{}')}catch(e){return {}}
}
function photo(){
  const p=localProfile();
  return p.photo||localStorage.getItem('zivo_photo')||'';
}
function profileName(){
  const p=localProfile(),u=user();
  return p.name||u?.displayName||localStorage.getItem('zivo_name')||'ZIVO Player';
}
function metrics(){
  const p=localProfile(), w=economy()?.getWallet?.()||{};
  return {
    level:Number(p.level)||1,xp:Number(p.totalXP??p.xp)||0,games:Number(p.gamesPlayed??p.games)||0,
    best:Number(p.bestScore??p.best)||0,streak:Number(p.bestStreak??p.streak)||0,zivo:Number(w.zivo??w.balance)||0,
    nextMiningAt:Number(w.nextMiningAt)||0
  };
}
function fmt(ms){
  const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;
  return [h,m,sec].map((x,i)=>i===0?String(x).padStart(2,'0'):String(x).padStart(2,'0')).join(':');
}
function avatarMarkup(){
  const p=photo();
  return p?`<img src="${esc(p)}" alt="صورة اللاعب">`:'⚽';
}
function openHub(){
  document.getElementById('v1080-launch')?.click();
}
function openWallet(){
  if(economy()?.open) economy().open();
  else document.getElementById('z101-wallet-open')?.click();
}
function mine(){
  economy()?.mine?.();
}
function openProfile(){
  let o=document.getElementById('v1083-profile-modal');
  if(!o){
    o=document.createElement('div');o.id='v1083-profile-modal';o.className='v1083-overlay';
    o.innerHTML='<div class="v1083-card" dir="rtl"></div>';
    document.body.appendChild(o);
    o.addEventListener('click',e=>{
      if(e.target===o||e.target.closest('.v1083-close'))o.classList.remove('open');
      const a=e.target.closest('[data-v1083-action]');
      if(!a)return;
      const act=a.dataset.v1083Action;
      if(act==='wallet'){o.classList.remove('open');openWallet()}
      if(act==='mine'){mine()}
      if(act==='hub'){o.classList.remove('open');openHub()}
    });
  }
  renderProfile(o);
  o.classList.add('open');
}
function renderProfile(o){
  const m=metrics(), left=Math.max(0,m.nextMiningAt-Date.now());
  const mineText=!user()?'تسجيل الدخول أولًا':left<=0?'متاح الآن':fmt(left);
  const mineDisabled=!user()||left>0;
  const w=economy()?.getWallet?.()||{}, ledger=Array.isArray(w.ledger)?w.ledger.slice(0,6):[];
  const ledgerHtml=ledger.length?ledger.map(x=>`<div class="v1083-ledger-row"><span>${esc(x.label||x.type||'معاملة')}</span><b>${Number(x.amount)>0?'+':''}${Number(x.amount)||0} ZIVO</b></div>`).join(''):'<div class="v1083-sub">لا توجد معاملات بعد.</div>';
  o.querySelector('.v1083-card').innerHTML=`
    <div class="v1083-head">
      <div class="v1083-player"><div class="v1083-avatar">${avatarMarkup()}</div><div>
        <span class="v1083-kicker">ZIVOZONE PLAYER</span><h2 class="v1083-title">${esc(profileName())}</h2>
        <div class="v1083-sub">LEVEL ${m.level} · ملف اللاعب ومركز الاقتصاد</div>
      </div></div>
      <button class="v1083-close">×</button>
    </div>
    <div class="v1083-metrics">
      <div class="v1083-metric"><small>LEVEL</small><b>${m.level}</b></div>
      <div class="v1083-metric"><small>XP</small><b>${m.xp}</b></div>
      <div class="v1083-metric"><small>ZIVO</small><b>🪙 ${m.zivo}</b></div>
      <div class="v1083-metric"><small>STREAK</small><b>🔥 ${m.streak}</b></div>
    </div>
    <div class="v1083-grid">
      <button class="v1083-action gold" data-v1083-action="wallet"><b>💰 المحفظة</b><small>الرصيد وسجل كل عمليات ZIVO</small></button>
      <button class="v1083-action green" data-v1083-action="mine"><b>⛏️ التعدين اليومي</b><small>${mineText} · +0.50 ZIVO كل 24 ساعة</small></button>
      <button class="v1083-action blue" data-v1083-action="hub"><b>⚡ ZIVO HUB</b><small>التحديات والغرفة المظلمة ومن أنا والإنجازات</small></button>
      <button class="v1083-action"><b>🏆 أفضل نتيجة</b><small>${m.best}</small></button>
    </div>
    <div class="v1083-mining"><div class="ico">⛏️</div><div><h3>نظام التعدين</h3><p>نقرة واحدة عند توفرها، ثم قفل 24 ساعة. المكافأة تدخل محفظة ZIVO.</p></div>
      <button class="v1083-mine-btn" ${mineDisabled?'disabled':''} data-v1083-action="mine">${mineText==='متاح الآن'?'+0.50 ZIVO':'⏱ '+mineText}</button>
    </div>
    <div class="v1083-ledger"><div class="v1083-kicker">RECENT WALLET ACTIVITY</div>${ledgerHtml}</div>
  `;
}
function mountDock(){
  if(document.getElementById('v1083-dock'))return;
  const d=document.createElement('nav');d.id='v1083-dock';d.className='v1083-dock';d.dir='rtl';
  d.innerHTML=`
    <button class="profile">👤 <span>ملفي</span></button>
    <button class="wallet">💰 <span>المحفظة</span><span class="v1083-balance-mini">0</span></button>
    <button class="mine">⛏️ <span>التعدين</span></button>
    <button class="hub">⚡ <span>ZIVO HUB</span></button>`;
  document.body.appendChild(d);
  d.querySelector('.profile').onclick=openProfile;
  d.querySelector('.wallet').onclick=openWallet;
  d.querySelector('.mine').onclick=mine;
  d.querySelector('.hub').onclick=openHub;
}
function sync(){
  const m=metrics(),b=document.querySelector('.v1083-balance-mini');if(b)b.textContent=`${m.zivo} ZIVO`;
  const old=document.getElementById('v1081-profile-launch');
  if(old){old.style.display='flex';old.textContent='👤 ملف اللاعب';old.onclick=openProfile}
  const o=document.getElementById('v1083-profile-modal');
  if(o?.classList.contains('open'))renderProfile(o);
}
function boot(){
  mountDock();sync();
  window.addEventListener('zivozone-auth',()=>setTimeout(sync,250));
  window.addEventListener('zivozone-badge',sync);
  window.addEventListener('zivo:player-updated',sync);
  setInterval(sync,30000);
  setInterval(()=>{const o=document.getElementById('v1083-profile-modal');if(o?.classList.contains('open'))renderProfile(o)},1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
