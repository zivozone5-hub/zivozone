/* ZIVOZONE V1080 — CORE PLAYER HUB
   Additive layer: preserves V1073 systems and unifies the player-facing experience.
   No Billing / Functions / external paid API required.
*/
(function(){
  'use strict';
  const KEY='zivozone_v1080_achievements';
  const DAILY='zivozone_v1080_daily';

  const BADGES=[
    ['first_challenge','🎯','أول تحدي','أكمل أول تحدٍ'],
    ['perfect','💯','علامة كاملة','حقق 10/10 في تحدٍ'],
    ['streak7','🔥','أسبوع كامل','وصل إلى 7 أيام متتالية'],
    ['dark_room','🌑','ناجي الظلام','أكمل تجربة الغرفة المظلمة'],
    ['identity','🧠','مستكشف الذات','أكمل من أنا؟'],
    ['miner','⛏️','المعدّن','نفّذ أول عملية تعدين']
  ];

  function read(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  function player(){
    const p=window.ZIVOZONE_V21?.get?.()||{};
    const e=window.ZIVOZONE_ECONOMY?.getWallet?.()||{};
    return {
      level:Number(p.level)||1,xp:Number(p.xp)||0,games:Number(p.games)||0,
      best:Number(p.bestScore)||0,streak:Number(e.streak||p.streak)||0,
      zivo:Number(e.zivo||e.balance)||0
    };
  }
  function achievements(){return read(KEY,{earned:[],stats:{perfect:0,dark:0,identity:0,mining:0}})}
  function award(id){
    const a=achievements();
    if(!a.earned.includes(id)){a.earned.push(id);write(KEY,a);window.dispatchEvent(new CustomEvent('zivozone-badge',{detail:{id}}));return true}
    return false;
  }
  function observe(e){
    const d=e?.detail||{};
    if(d.score===100 || (Number(d.correct)===10 && Number(d.total||10)===10))award('perfect');
    if(d.challenge || d.gameId) award('first_challenge');
    const id=String(d.challenge||d.gameId||d.id||'').toLowerCase();
    if(id.includes('horror')||id.includes('dark')){award('dark_room');}
    if(id.includes('who')||id.includes('identity')){award('identity');}
  }
  ['zivozone-result','zivozone-progress','zivozone:game-complete','zivozone:challenge-result','zivozone:progress-updated'].forEach(n=>window.addEventListener(n,e=>observe(e),true));

  function daily(){
    const d=new Date().toISOString().slice(0,10);
    const s=read(DAILY,{date:null,done:false});
    return {date:d,done:s.date===d&&s.done===true};
  }

  function render(){
    const p=player(),a=achievements(),d=daily();
    const levelBase=Math.max(100,Math.round((p.level||1)*100));
    const progress=Math.min(100,Math.round((p.xp%levelBase)/levelBase*100));
    const earned=new Set(a.earned);
    const badgeHtml=BADGES.map(b=>`<div class="v1080-badge ${earned.has(b[0])?'earned':''}" title="${b[3]}"><span>${b[1]}</span><small>${b[2]}</small></div>`).join('');
    return `<div class="v1080-head"><div><span class="v1080-kicker">ZIVOZONE CORE</span><h2>رحلة اللاعب</h2><p>كل نشاطك في مكان واحد.</p></div><button class="v1080-close" aria-label="إغلاق">×</button></div>
      <div class="v1080-stats">
        <div><small>LEVEL</small><b>${p.level}</b></div><div><small>XP</small><b>${p.xp}</b></div>
        <div><small>ZIVO</small><b>🪙 ${p.zivo}</b></div><div><small>STREAK</small><b>🔥 ${p.streak}</b></div>
      </div>
      <div class="v1080-progress"><span style="width:${progress}%"></span></div>
      <div class="v1080-grid">
        <button data-hub="#challenges">🎯<strong>التحديات</strong><small>تحدي اليوم والمركز</small></button>
        <button data-hub="#identity">🧠<strong>من أنا؟</strong><small>اكتشف نتيجتك</small></button>
        <button data-hub="#dark">🌑<strong>الغرفة المظلمة</strong><small>تجربة خاصة</small></button>
        <button data-mine>⛏️<strong>التعدين</strong><small>${d.done?'تم اليوم':'متاح من نظام الاقتصاد'}</small></button>
        <button data-wallet>💰<strong>المحفظة</strong><small>${p.zivo} ZIVO</small></button>
        <button data-hub="#profile">👤<strong>ملفي</strong><small>إحصائيات اللاعب</small></button>
        <button data-module="level">📈<strong>مستواي</strong><small>XP والتقدم</small></button>
        <button data-module="ranking">🏆<strong>التصنيف</strong><small>ترتيب اللاعبين</small></button>
        <button data-module="daily">🔥<strong>تحدي اليوم</strong><small>تحدٍ متجدد</small></button>
        <button data-module="achievements">🏅<strong>إنجازاتي</strong><small>الشارات والجوائز</small></button>
      </div>
      <section class="v1080-section"><div class="v1080-section-title"><h3>🎖️ إنجازاتك</h3><span>${a.earned.length}/${BADGES.length}</span></div><div class="v1080-badges">${badgeHtml}</div></section>
      <section class="v1080-section"><div class="v1080-section-title"><h3>🏆 التنافس</h3></div><div class="v1080-competition"><button data-hub="#challenges">⚡ ابدأ تحديًا</button><button data-hub="#profile">🏆 افتح ملفي</button></div></section>`;
  }

  function open(){
    let o=document.getElementById('v1080-hub');
    if(!o){
      o=document.createElement('div');o.id='v1080-hub';o.className='v1080-overlay';
      o.innerHTML='<div class="v1080-card" dir="rtl"></div>';
      document.body.appendChild(o);
      o.addEventListener('click',e=>{
        if(e.target===o||e.target.closest('.v1080-close')){o.classList.remove('open');return}
        const b=e.target.closest('[data-hub]');
        if(b){o.classList.remove('open');document.querySelector(b.dataset.hub)?.scrollIntoView({behavior:'smooth',block:'start'});return}
        if(e.target.closest('[data-wallet]')){window.ZIVOZONE_ECONOMY?.open?.();return}
        if(e.target.closest('[data-mine]')){window.ZIVOZONE_ECONOMY?.mine?.();return}
        const mod=e.target.closest('[data-module]')?.dataset.module;
        if(mod){
          const map={level:'ZIVOZONE_V35',ranking:'ZIVOZONE_V29',daily:'ZIVOZONE_V32',achievements:'ZIVOZONE_V31'};
          const api=window[map[mod]];
          o.classList.remove('open');
          if(api?.open){api.open();return}
          if(mod==='ranking'){document.querySelector('#sports')?.scrollIntoView({behavior:'smooth'});}
        }
      });
    }
    o.querySelector('.v1080-card').innerHTML=render();
    o.classList.add('open');
  }

  function mountButton(){
    if(document.getElementById('v1080-launch'))return;
    const b=document.createElement('button');
    b.id='v1080-launch';b.className='v1080-launch';
    b.type='button';b.innerHTML='⚡ <span>ZIVO HUB</span>';
    b.onclick=open;
    document.body.appendChild(b);
  }

  window.ZIVOZONE_CORE={open,player,achievements,award};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountButton);else mountButton();
  window.addEventListener('zivozone-progress',()=>{});
  window.addEventListener('zivozone-badge',()=>{});
})();
