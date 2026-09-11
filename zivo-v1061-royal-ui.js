/* ZIVOZONE V1061 — Royal 4D UI layer. Functional challenge/economy engines are preserved. */
(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const loc=o=>typeof o==='string'?o:(o?.ar||o?.en||'');
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function relocateEconomy(){
    const economy=$('#zivo-v101-economy'), header=document.querySelector('header.topbar');
    if(!economy||!header||economy.parentElement===header)return;
    header.insertBefore(economy,document.querySelector('.top-actions'));
    economy.dataset.v1061Relocated='1';
  }

  function renderDarkRoom(){
    const host=$('#dark-room-launcher');
    if(!host)return;
    const bank=window.ZIVOZONE_CHALLENGES?.horror;
    if(!bank){host.innerHTML='';return}
    if(host.dataset.v1061Ready)return;
    host.innerHTML=`<article class="z61-horror-card" role="button" tabindex="0" aria-label="الغرفة المظلمة — دخول التجربة"><span class="z61-horror-pulse" aria-hidden="true"></span><div class="z61-horror-content"><span class="z61-horror-kicker">DARK ROOM · PSYCHOLOGICAL EXPERIENCE</span><h2>الغرفة المظلمة</h2><p>تجربة مستقلة خارج مركز التحديات. لا تدخل إلا إذا كنت مستعدًا لمواجهة المجهول.</p><button type="button" class="z61-horror-enter">دخول الغرفة المظلمة</button></div></article>`;
    const go=()=>{try{window.startGame?.('horror')}catch(e){console.warn('Dark Room launch',e)}};
    host.querySelector('.z61-horror-card').addEventListener('click',e=>{if(e.target.closest('a,input,select,textarea'))return;go()});
    host.querySelector('.z61-horror-card').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
    host.dataset.v1061Ready='1';
  }

  function detachHorrorFromChallengeList(){
    const cards=document.querySelectorAll('#challenge-list .challenge-card');
    cards.forEach(card=>{
      const trigger=card.querySelector('[data-challenge],[data-game]');
      const id=card.dataset.challenge||trigger?.dataset.challenge||trigger?.dataset.game;
      if(id==='horror')card.remove();
    });
  }

  function bindFullCards(){
    document.querySelectorAll('#challenge-list .challenge-card').forEach(card=>{
      const trigger=card.querySelector('[data-challenge],[data-game]');
      const id=card.dataset.challenge||trigger?.dataset.challenge||trigger?.dataset.game;
      if(!id||id==='horror'||card.dataset.v1061Bound)return;
      card.dataset.v1061Bound='1';card.dataset.challenge=id;card.setAttribute('role','button');card.tabIndex=0;
      trigger?.classList.add('z58-hidden-launcher');
      if(trigger){trigger.setAttribute('aria-hidden','true');trigger.tabIndex=-1;}
      const go=()=>{try{window.ZIVOZONE_V20?.start?.(id)||window.startGame?.(id)||trigger?.click()}catch(e){try{trigger?.click()}catch(_){}}};
      card.addEventListener('click',e=>{if(e.target.closest('a,input,select,textarea,label,.z58-hidden-launcher'))return;go()});
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
    });
  }

  function apply(){
    relocateEconomy();
    renderDarkRoom();
    detachHorrorFromChallengeList();
    bindFullCards();
  }
  function boot(){setTimeout(apply,80);setTimeout(apply,450);setTimeout(apply,1200)}
  document.addEventListener('DOMContentLoaded',boot);
  ['zivozone-auth','zivozone-language','zivozone-result'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(apply,150)));
  window.addEventListener('hashchange',()=>setTimeout(apply,100));
  window.ZIVOZONE_V1061={apply,renderDarkRoom};
})();
