/* ============================================================
   ZIVOZONE V23 — SMART CHALLENGE INTELLIGENCE
   Additive layer. Works with V20/V21/V22 and never touches Dark Room.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_v23_metrics';
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{"sessions":0,"answered":0,"timeouts":0,"correct":0,"byChallenge":{}}')}catch(e){return {sessions:0,answered:0,timeouts:0,correct:0,byChallenge:{}}}}
  function write(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}}
  function record(d){
    const x=read();x.sessions+=(d.session?1:0);x.answered+=Number(d.answered)||0;x.correct+=Number(d.correct)||0;x.timeouts+=Number(d.timeouts)||0;
    const id=d.challenge||'unknown';x.byChallenge[id]=x.byChallenge[id]||{sessions:0,correct:0,answered:0,timeouts:0};
    const c=x.byChallenge[id];c.sessions+=(d.session?1:0);c.correct+=Number(d.correct)||0;c.answered+=Number(d.answered)||0;c.timeouts+=Number(d.timeouts)||0;write(x);return x;
  }
  function get(){return read()}
  function snapshot(){
    const x=read(), accuracy=x.answered?Math.round(x.correct/x.answered*100):0;
    return {sessions:x.sessions,answered:x.answered,correct:x.correct,timeouts:x.timeouts,accuracy};
  }
  window.ZIVOZONE_V23={record,get,snapshot};
})();
