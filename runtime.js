/* ZIVOZONE RUNTIME 49 — safe shared primitives */
(() => {
  'use strict';
  const VERSION='49.0-runtime';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  async function fetchJSON(url,{timeout=9000,cache='no-store',fallback=null}={}){
    const controller=typeof AbortController==='function'?new AbortController():null;
    const timer=controller?setTimeout(()=>controller.abort(),timeout):null;
    try{
      const r=await fetch(url,{cache,signal:controller?.signal,headers:{Accept:'application/json'}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      return await r.json();
    }catch(e){console.warn('[ZIVOZONE runtime]',url,e);return fallback}
    finally{if(timer)clearTimeout(timer)}
  }
  function safeText(v,fallback='غير متوفر حاليًا'){
    if(v===undefined||v===null||v==='')return fallback;
    if(typeof v==='object')return fallback;
    return String(v);
  }
  window.ZIVOZONE_RUNTIME={VERSION,fetchJSON,safeText,clamp};
})();
