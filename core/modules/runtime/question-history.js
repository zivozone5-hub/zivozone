/* ZIVOZONE — question-history.js
   Per-player question history store
   Extracted verbatim from the former core/runtime.js monolith (V1180 refactor). No logic changed.
*/
/* ============================================================
   ZIVOZONE V42 — CLOUD QUESTION HISTORY + CLEAN NAV
   Additive compatibility layer; never replaces Firebase/Auth.
============================================================ */
(function(){
  'use strict';

  const LOCAL='zivozone_v41_question_history';
  const CLOUD='zivozone_question_history_v42';

  function localRead(){
    try{return JSON.parse(localStorage.getItem(LOCAL)||'{}')}catch(e){return{}}
  }
  function localWrite(v){
    try{localStorage.setItem(LOCAL,JSON.stringify(v))}catch(e){}
  }

  function getUser(){
    try{
      const u=window.ZIVOZONE_AUTH?.getUser?.();
      if(u) return u;
    }catch(e){}
    try{
      return window.firebase?.auth?.().currentUser||null;
    }catch(e){}
    return null;
  }

  async function cloudRead(){
    const u=getUser();
    if(!u)return null;
    try{
      const db=window.firebase?.firestore?.();
      if(db){
        const snap=await db.collection('users').doc(u.uid).collection('zivozone').doc('questionHistory').get();
        return snap.exists ? (snap.data()?.history||{}) : null;
      }
    }catch(e){}
    return null;
  }

  async function cloudWrite(history){
    const u=getUser();
    if(!u)return false;
    try{
      const db=window.firebase?.firestore?.();
      if(db){
        await db.collection('users').doc(u.uid).collection('zivozone').doc('questionHistory')
          .set({history,updatedAt:new Date().toISOString()},{merge:true});
        return true;
      }
    }catch(e){}
    return false;
  }

  async function sync(){
    const cloud=await cloudRead();
    if(cloud){
      const local=localRead();
      localWrite(Object.assign({},local,cloud));
      return cloud;
    }
    return localRead();
  }

  async function record(pack,index){
    const h=localRead(), key='pack:'+pack;
    const arr=Array.isArray(h[key])?h[key]:[];
    if(!arr.includes(index))arr.push(index);
    h[key]=arr;
    localWrite(h);
    await cloudWrite(h);
    return h;
  }

  async function clear(){
    localWrite({});
    const u=getUser();
    try{
      const db=window.firebase?.firestore?.();
      if(u&&db) await db.collection('users').doc(u.uid).collection('zivozone').doc('questionHistory').set({history:{},updatedAt:new Date().toISOString()});
    }catch(e){}
  }

  function expose(){
    window.ZIVOZONE_V42={sync,record,clear,getUser};
  }

  /* Prevent accidental duplicate launchers from previous additive releases. */
  function clean(){
    const selectors=['#v37-open','#v38-open','#v39-open'];
    selectors.forEach(sel=>{
      const nodes=[...document.querySelectorAll(sel)];
      nodes.slice(1).forEach(n=>n.remove());
    });
  }

  expose();
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{clean();sync()});
  }else{clean();sync()}

  window.addEventListener('online',()=>sync());
})();
