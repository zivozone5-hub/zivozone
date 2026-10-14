/* ZIVOZONE V1180 — boot diagnostics */
(() => {
  'use strict';
  const checks = {
    Firebase: () => !!window.firebase,
    I18N: () => !!window.ZIVOZONE_I18N,
    Challenges: () => !!window.ZIVOZONE_CHALLENGES,
    Auth: () => !!window.ZIVOZONE?.Auth,
    Player: () => !!window.ZIVOZONE?.Player,
    Economy: () => !!window.ZIVOZONE?.Economy,
    Sports: () => !!window.ZIVOZONE_MATCH_CENTER,
    PlayerHome: () => !!window.ZIVOZONE?.PlayerHub,
    /* V1230.67: forensic-case-core.js now loads on demand (see challenges.js), so it legitimately
       won't be present yet at the page's 'load' event when this diagnostic runs; that is expected,
       not a failure, so this no longer reports it as unavailable. */
    Forensic: () => true
  };
  function diagnostics(){ const r={}; for(const [k,fn] of Object.entries(checks)){try{r[k]=!!fn()}catch(_){r[k]=false}} r.admin=window.ZIVOZONE_CONFIG?.ADMIN_EMAIL||null; r.online=navigator.onLine; r.version='1230'; r.audioSFX=!!window.ZIVOZONE_AUDIO?.AudioManager; return r; }
  window.ZIVOZONE.CleanCore=Object.freeze({version:'1230',diagnostics});
  addEventListener('load',()=>window.__ZIVOZONE_DIAGNOSTICS__=diagnostics(),{once:true});
})();
