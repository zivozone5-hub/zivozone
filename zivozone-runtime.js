/* ZIVOZONE V1086 — minimal runtime bootstrap */
(()=>{'use strict';
window.addEventListener('error',e=>console.error('ZIVOZONE runtime error:',e.error||e.message),{once:true});
window.addEventListener('load',()=>{if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{});},{once:true});
})();
