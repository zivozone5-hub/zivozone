/* ZIVOZONE — live-hud.js
   Live in-challenge HUD updates
   V1180 refactor: repointed to window.ZIVOZONE.Player (the canonical
   profile source, defined in core/modules/player.js) instead of the
   old ZIVOZONE_V21 shadow tracker. V21 computed level/XP with a
   different formula than the real profile, so this HUD could show a
   different level in-challenge than the one shown on the profile
   screen — same underlying result, now genuinely one source of truth.
   See CHANGELOG_V1180_REFACTOR.md.
============================================================ */
(function(){
  function mount(){
    if(document.getElementById('zivo-v21-hud'))return;
    const el=document.createElement('aside');
    el.id='zivo-v21-hud';el.className='zivo-v21-hud';
    el.innerHTML='<div><span>LEVEL</span><b id="v21-level">1</b></div><div><span>XP</span><b id="v21-xp">0</b></div><div><span>BEST</span><b id="v21-best">0</b></div>';
    document.body.appendChild(el);
    refresh();
  }
  function refresh(){
    const p=window.ZIVOZONE?.Player?.get?.()||{};
    const l=document.getElementById('v21-level'),x=document.getElementById('v21-xp'),b=document.getElementById('v21-best');
    if(l)l.textContent=p.level||1;if(x)x.textContent=p.xp||0;if(b)b.textContent=p.bestScore||0;
  }
  window.addEventListener('zivozone-progress',refresh);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
