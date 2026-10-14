/* ZIVOZONE — server-adapter.js
   Server submission adapter + retry queue
   Extracted verbatim from the former core/runtime.js monolith (V1180 refactor). No logic changed.
*/
/* ============================================================
   ZIVOZONE V46 — SERVER ENGINE ADAPTER
   Browser = attempt sender only.
   Trusted backend = score/reward authority.
============================================================ */
(function(){
  'use strict';

  const FN_NAME='completeGameAttempt';
  const LOCAL_QUEUE='zivozone_v46_attempt_queue';

  function authUser(){
    try{return window.firebase?.auth?.()?.currentUser||null}catch(e){return null}
  }
  function functions(){
    try{return window.firebase?.functions?.()||null}catch(e){return null}
  }
  function readQ(){try{return JSON.parse(localStorage.getItem(LOCAL_QUEUE)||'[]')}catch(e){return[]}}
  function writeQ(q){try{localStorage.setItem(LOCAL_QUEUE,JSON.stringify(q.slice(-20)))}catch(e){}}

  function cleanAttempt(x){
    x=x||{};
    return {
      challengeId:String(x.challengeId||x.id||'challenge').slice(0,80),
      attemptId:String(x.attemptId||((crypto?.randomUUID?.())||Date.now()+'-'+Math.random())).slice(0,100),
      answers:Array.isArray(x.answers)?x.answers.slice(0,100).map(v=>String(v).slice(0,200)):[],
      total:Math.max(0,Math.min(100,Number(x.total)||0)),
      correct:Math.max(0,Math.min(100,Number(x.correct)||0)),
      score:Math.max(0,Math.min(100,Number(x.score)||0)),
      startedAt:String(x.startedAt||'').slice(0,40),
      submittedAt:new Date().toISOString()
    };
  }

  async function submit(attempt){
    const u=authUser();
    const payload=cleanAttempt(attempt);
    if(!u){
      const q=readQ();q.push(payload);writeQ(q);
      return {accepted:false,queued:true,reason:'not-authenticated'};
    }

    const fn=functions();
    if(fn){
      try{
        const callable=fn.httpsCallable(FN_NAME);
        const res=await callable(payload);
        return {accepted:true,server:true,data:res?.data||{}};
      }catch(e){
        /* If the function is not deployed yet, do not fabricate a score. */
        if(e?.code==='functions/not-found'||e?.code==='functions/unavailable'||e?.code==='functions/internal'){
          const q=readQ();q.push(payload);writeQ(q);
          return {accepted:false,queued:true,reason:e.code};
        }
        return {accepted:false,queued:false,reason:e?.code||'server-rejected'};
      }
    }

    const endpoint=window.ZIVOZONE_CONFIG?.scoreEndpoint||'';
    if(endpoint){
      try{
        const token=await u.getIdToken();
        const res=await fetch(endpoint,{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
          body:JSON.stringify(payload)
        });
        if(!res.ok)throw new Error('HTTP '+res.status);
        return {accepted:true,server:true,data:await res.json().catch(()=>({}))};
      }catch(e){
        const q=readQ();q.push(payload);writeQ(q);
        return {accepted:false,queued:true,reason:e.message||'endpoint-failed'};
      }
    }

    return {accepted:false,queued:true,reason:'server-not-configured'};
  }

  async function flush(){
    const u=authUser();if(!u)return {flushed:0};
    const q=readQ();if(!q.length)return {flushed:0};
    const keep=[];let done=0;
    for(const item of q){
      const res=await submit(item);
      if(res.accepted)done++;else keep.push(item);
    }
    writeQ(keep);
    return {flushed:done,remaining:keep.length};
  }

  window.ZIVOZONE_V46={submit,flush,pending:()=>readQ().length};
  window.addEventListener('online',()=>flush());
})();
