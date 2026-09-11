
/* ZIVOZONE V1062 — Royal 4D challenge presentation layer
   Visual-only enhancement. Existing challenge engines and economy APIs remain intact.
*/
(function(){
  'use strict';
  const AS='assets/challenge-4d/';
  const norm=s=>String(s||'').toLowerCase().replace(/[\s_-]+/g,'');
  const visualFor=id=>{
    const n=norm(id);
    if(n.includes('horror')||n.includes('dark')) return AS+'horror.svg';
    if(n.includes('forensic')) return AS+'forensic.svg';
    if(n.includes('football')) return AS+'football.svg';
    if(n.includes('science')) return AS+'science.svg';
    if(n.includes('memory')) return AS+'memory.svg';
    if(n.includes('strategy')) return AS+'strategy.svg';
    if(n.includes('math')) return AS+'math.svg';
    if(n.includes('reaction')||n.includes('speed')) return AS+'reaction.svg';
    if(n.includes('pattern')) return AS+'pattern.svg';
    if(n.includes('focus')) return AS+'focus.svg';
    if(n.includes('probability')) return AS+'probability.svg';
    if(n.includes('daily')) return AS+'daily.svg';
    if(n.includes('logic')||n.includes('iq')) return AS+'logic.svg';
    if(n.includes('whoami')||n.includes('identity')||n.includes('personality')) return AS+'whoami.svg';
    return AS+'logic.svg';
  };
  const accentFor=id=>{
    const n=norm(id);
    if(n.includes('horror')||n.includes('dark'))return'#ff243d';
    if(n.includes('memory'))return'#e95cff';
    if(n.includes('logic')||n.includes('iq'))return'#a35cff';
    if(n.includes('football'))return'#08c5ff';
    if(n.includes('science')||n.includes('forensic'))return'#20dfff';
    if(n.includes('strategy'))return'#ffb62e';
    if(n.includes('math'))return'#ffd447';
    if(n.includes('reaction'))return'#2affae';
    if(n.includes('daily'))return'#ff3e74';
    return'#19cfff';
  };

  function enhanceCards(){
    const box=document.getElementById('challenge-list');
    if(!box)return;
    [...box.querySelectorAll('.challenge-card')].forEach(card=>{
      if(card.classList.contains('z1062-card'))return;
      const btn=card.querySelector('[data-challenge]');
      const id=btn?.dataset?.challenge || card.querySelector('[data-challenge]')?.dataset?.challenge;
      if(!id)return;
      if(id==='horror'){card.classList.add('z1062-card');card.remove();return;}
      const title=card.querySelector('.challenge-copy h3')?.textContent?.trim() || 'تحدي';
      const desc=card.querySelector('.challenge-copy p')?.textContent?.trim() || '';
      const tag=card.querySelector('.card-tag')?.textContent?.trim() || '10 أسئلة';
      card.className='challenge-card z1062-card';
      card.dataset.challenge=id;
      card.style.setProperty('--z1062-accent',accentFor(id));
      card.innerHTML=`
        <div class="z1062-visual">
          <img src="${visualFor(id)}" alt="" loading="lazy" draggable="false">
        </div>
        <div class="z1062-copy">
          <div class="z1062-badges">
            <span class="z1062-badge">▣ ${escapeHtml(tag.replace('· 30s','').trim())}</span>
            <span class="z1062-badge">✦ مستوى ذكي</span>
          </div>
          <h3 class="z1062-title">${escapeHtml(title)}</h3>
          <p class="z1062-desc">${escapeHtml(desc)}</p>
        </div>`;
      // The entire card is the native challenge target.
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click()}});
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
    });
    ensureDarkRoom();
  }
  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function ensureDarkRoom(){
    if(document.getElementById('zivo-dark-room'))return;
    const challenge=document.getElementById('challenges');
    const list=document.getElementById('challenge-list');
    if(!challenge||!list)return;
    const section=document.createElement('section');
    section.id='zivo-dark-room';
    section.setAttribute('aria-label','الغرفة المظلمة');
    section.innerHTML=`
      <div class="section-heading" style="margin:0 0 9px">
        <div>
          <span class="eyebrow" style="color:#ff4455">ZIVOZONE • DARK EXPERIENCE</span>
          <h2 style="color:#fff">الغرفة المظلمة</h2>
          <p class="muted">تجربة مستقلة. لا تنتمي إلى قائمة التحديات العادية.</p>
        </div>
      </div>
      <article class="z1062-horror-card" data-challenge="horror" role="button" tabindex="0" aria-label="ادخل الغرفة المظلمة">
        <img src="${AS}horror.svg" alt="" draggable="false">
        <div class="z1062-horror-content">
          <div class="z1062-horror-kicker">DARK ROOM • PSYCHOLOGICAL EXPERIENCE</div>
          <h3 class="z1062-horror-title">الغرفة المظلمة</h3>
          <p class="z1062-horror-text">أنت البطل داخل القصة. الصوت والضوء والأسئلة تتغير مع تقدمك. لا توجد إجابات صحيحة أو خاطئة داخل هذه التجربة.</p>
          <span class="z1062-horror-enter">ادخل إذا كنت مستعدًا</span>
        </div>
      </article>`;
    list.insertAdjacentElement('beforebegin',section);
    const card=section.querySelector('.z1062-horror-card');
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click()}});
  }

  function moveEconomy(){
    const economy=document.getElementById('zivo-v101-economy');
    const actions=document.querySelector('.topbar .top-actions');
    if(!economy||!actions)return;
    if(economy.parentElement!==actions) actions.appendChild(economy);
  }

  function topbarPolish(){
    const h=document.querySelector('.topbar');if(!h)return;
    h.classList.add('z1062-topbar');
    if(!document.getElementById('z1062-menu')){
      const b=document.createElement('button');
      b.id='z1062-menu';b.type='button';b.className='z1062-menu';b.setAttribute('aria-label','القائمة');
      b.innerHTML='☰';
      b.onclick=()=>{
        const nav=h.querySelector('.main-nav');
        if(nav)nav.classList.toggle('z1062-mobile-open');
      };
      h.insertBefore(b,h.firstElementChild);
    }
  }

  function apply(){
    enhanceCards();moveEconomy();topbarPolish();
  }
  let queued=false;
  const schedule=()=>{
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;apply()});
  };
  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('load',()=>setTimeout(schedule,350));
  const mo=new MutationObserver(schedule);
  mo.observe(document.body,{childList:true,subtree:true});
})();
