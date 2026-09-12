/* ZIVOZONE V1086 CLEAN CORE — command navigation */
(()=>{'use strict';
 const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
 const go=id=>{const el=q('#'+id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
 const call=(obj,method='open')=>{try{window.ZIVOZONE_INTERNAL?.[obj]?.[method]?.();return true}catch(e){console.warn('Z86 action',obj,e);return false}};
 const action=a=>{
   if(a==='home'){go('home');return}
   if(a==='challenges'){ if(call('v39'))return; go('challenges');return }
   if(a==='sports'){go('sports'); return}
   if(a==='profile'){ if(call('v37'))return; if(window.ZIVOZONE_PLAYER?.open)window.ZIVOZONE_PLAYER.open(); else go('profile'); return }
   if(a==='wallet'){ if(window.ZIVOZONE_ECONOMY?.open)window.ZIVOZONE_ECONOMY.open(); else call('v26'); return }
   if(a==='store'){ if(call('v26')){setTimeout(()=>{const b=document.querySelector('#v26-overlay [data-tab="shop"]');b?.click()},80)} return }
   if(a==='leaderboard'){ if(call('v29'))return; if(call('v26')){setTimeout(()=>document.querySelector('#v26-overlay [data-tab="board"]')?.click(),80)} return }
   if(a==='achievements'){call('v31');return}
   if(a==='daily'){call('v32');return}
   if(a==='missions'){call('v34');return}
   if(a==='level'){call('v35');return}
   if(a==='identity'){ if(window.ZIVOZONE_START_CHALLENGE&&false){}; document.querySelector('[data-action="open-identity"]')?.click(); return }
   if(a==='ai'){document.querySelector('[data-action="open-ai"]')?.click();return}
   if(a==='matches'){go('sports');setTimeout(()=>q('#fixture-list')?.scrollIntoView({behavior:'smooth',block:'center'}),250);return}
 };
 function syncStats(){
   const p=window.ZIVOZONE_INTERNAL?.v21?.get?.()||window.ZIVOZONE_INTERNAL?.v30?.get?.()||window.ZIVOZONE_PLAYER?.get?.()||{};
   const econ=window.ZIVOZONE_ECONOMY?.getWallet?.()||{};
   const xp=Number(p.xp??p.totalXP??0)||0, level=Number(p.level)||1, zivo=Number(econ.zivo??econ.balance??p.zivo??p.coins??0)||0, streak=Number(econ.streak??p.streak??p.bestStreak??0)||0;
   q('#z86-xp')&&(q('#z86-xp').textContent=xp.toLocaleString()); q('#z86-zivo')&&(q('#z86-zivo').textContent=Number.isInteger(zivo)?zivo.toLocaleString():zivo.toFixed(2)); q('#z86-streak')&&(q('#z86-streak').textContent=streak); q('#z86-level')&&(q('#z86-level').textContent=level); q('#z86-side-zivo')&&(q('#z86-side-zivo').textContent=(Number.isInteger(zivo)?zivo:zivo.toFixed(2))+' ZIVO');
   const pct=Math.min(100,Math.max(0,(xp%Math.max(100,level*100))/Math.max(100,level*100)*100)); q('#z86-xp-fill')&&(q('#z86-xp-fill').style.width=pct+'%');
   const cloud=navigator.onLine?'● Cloud Online':'● Cloud Offline'; q('#z86-cloud')&&(q('#z86-cloud').textContent=cloud);
 }
 function newsPreview(){const src=q('#news-list'),box=q('#z86-news-preview');if(!src||!box)return;const cards=[...src.querySelectorAll('article')].slice(0,3);if(cards.length)box.innerHTML=cards.map(c=>`<div>${(c.querySelector('h3')?.textContent||c.textContent||'').trim().slice(0,150)}</div>`).join('')}
 function fixturePreview(){const src=q('#fixture-list'),box=q('#z86-fixture-preview');if(!src||!box)return;const cards=[...src.querySelectorAll('article')].slice(0,2);if(cards.length)box.innerHTML=cards.map(c=>`<div class="z86-fixture-row">${(c.textContent||'').trim().slice(0,120)}</div>`).join('')}
 function bind(){
   qa('[data-z86-action]').forEach(b=>{b.addEventListener('click',e=>{e.preventDefault();action(b.dataset.z86Action)})});
   qa('[data-z86-nav]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();const a=b.dataset.z86Nav;qa('.z86-nav').forEach(x=>x.classList.toggle('active',x===b));action(a)}));
   qa('.z86-premium').forEach(b=>b.addEventListener('click',()=>action('profile')));
   ['zivozone-result','zivozone-reward','zivozone-progress','zivozone-cloud-synced','zivozone-auth'].forEach(ev=>window.addEventListener(ev,()=>{syncStats();setTimeout(newsPreview,300);setTimeout(fixturePreview,300)}));
   setTimeout(()=>{syncStats();newsPreview();fixturePreview()},900); setInterval(syncStats,4000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
 window.ZIVOZONE_V1086_UI={action,syncStats};
})();
