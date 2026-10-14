/* ZIVOZONE — dedupe.js
   Question de-duplication across sessions
   Extracted verbatim from the former core/runtime.js monolith (V1180 refactor). No logic changed.
*/
/* ============================================================
   ZIVOZONE V41 — UI DEDUPLICATION + SMART QUESTION ROTATION
============================================================ */
(function(){
  'use strict';

  /* Player-specific question rotation:
     keeps a local history and avoids repeats when the same pack is replayed.
     It does not replace the existing challenge engine or alter its answers.
  */
  const HIST='zivozone_v41_question_history';
  function read(){
    try{return JSON.parse(localStorage.getItem(HIST)||'{}')}catch(e){return{}}
  }
  function save(v){
    try{localStorage.setItem(HIST,JSON.stringify(v))}catch(e){}
  }
  function shuffled(ids){
    return ids.map((v,i)=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  }
  function prepareBank(){
    const bank=window.ZIVOZONE_CHALLENGES;
    if(!bank)return;
    Object.keys(bank).forEach(id=>{
      const item=bank[id];
      if(!item||!Array.isArray(item.questions)||item.special)return;
      if(item._v41Prepared)return;
      const original=item.questions.slice();
      Object.defineProperty(item,'_v41Original',{value:original,writable:false,configurable:false});
      item._v41Prepared=true;
      item._v41HistoryKey='pack:'+id;
    });
  }
  function rotate(id){
    const bank=window.ZIVOZONE_CHALLENGES;
    if(!bank||!bank[id]||!Array.isArray(bank[id].questions))return;
    const item=bank[id], original=item._v41Original||item.questions.slice();
    const hist=read(), key='pack:'+id, used=Array.isArray(hist[key])?hist[key]:[];
    const indices=original.map((_,i)=>i);
    let fresh=indices.filter(i=>!used.includes(i));
    if(!fresh.length){fresh=indices;hist[key]=[]}
    fresh=shuffled(fresh);
    item.questions=fresh.map(i=>original[i]);
    hist[key]=fresh.slice(0,Math.min(used.length+fresh.length,original.length));
    if(hist[key].length>=original.length)hist[key]=fresh.slice();
    save(hist);
  }

  function install(){
    prepareBank();
    window.ZIVOZONE_V41={
        rotate,
      resetHistory:function(){try{localStorage.removeItem(HIST)}catch(e){}},
      historyKey:HIST
    };
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install);
  }else install();

  window.addEventListener('zivozone-challenge-open',function(e){
    if(e&&e.detail&&e.detail.id)rotate(e.detail.id);
  });
})();
