/* ZIVOZONE — engagement.js
   Account-scoped active-time engagement tracker
   Extracted verbatim from the former core/runtime.js monolith (V1180 refactor). No logic changed.
*/
/* ============================================================
   ZIVOZONE V85 — ACCOUNT-SCOPED ENGAGEMENT
   Active visible time per signed-in user; idle sessions do not count.
============================================================ */
(function(){'use strict';
  const IDLE=90*1000,TIER=10*60,BASE='zivozone_engagement_v85';
  const uid=()=>window.firebase?.auth?.()?.currentUser?.uid||'guest';
  const key=()=>`${BASE}:${uid()}`;
  const read=()=>{try{return JSON.parse(localStorage.getItem(key())||'{}')}catch(e){return{}}};
  const write=v=>{try{localStorage.setItem(key(),JSON.stringify(v))}catch(e){}};
  let s={activeSeconds:0,lastTick:Date.now(),lastActivity:Date.now(),claimedTiers:0,lastSync:0,...read()};
  const activity=()=>{s.lastActivity=Date.now()};
  ['pointermove','pointerdown','keydown','touchstart','scroll'].forEach(e=>addEventListener(e,activity,{passive:true}));
  function tick(){const now=Date.now();const dt=Math.max(0,Math.min(15,(now-(s.lastTick||now))/1000));s.lastTick=now;if(document.visibilityState==='visible'&&now-s.lastActivity<=IDLE){s.activeSeconds+=dt;write(s)}}
  function activeMinutes(){return Math.floor(s.activeSeconds/60)}
  function claimableBonus(){return Math.max(0,Math.min(10,Math.floor(s.activeSeconds/TIER)-Number(s.claimedTiers||0)))}
  function markBonusClaimed(n){s.claimedTiers=Math.min(10,(Number(s.claimedTiers)||0)+Math.max(0,Number(n)||0));write(s)}
  /* V1229.12 — COST FIX: sync() writes 2 Firestore documents and was called on every single
     visibilitychange (switching tabs back and forth — a very common pattern, easily tens of times per
     session) with no throttle at all, on top of the already-throttled touchSession() writes (1229.10).
     The engagement counter it updates is a coarse "active minutes" stat, not something that needs
     second-level freshness, so repeated calls within SYNC_MIN_INTERVAL_MS of the last real write are
     now no-ops — activeSeconds keeps accumulating locally (tick(), unaffected) regardless; only the
     Firestore write is throttled. force=true always writes, kept for a future explicit "flush now" need. */
  const SYNC_MIN_INTERVAL_MS = 60*1000;
  async function sync(force){
    if(!force && Date.now()-(s.lastSync||0) < SYNC_MIN_INTERVAL_MS) return false;
    const u=window.firebase?.auth?.()?.currentUser,d=window.firebase?.firestore?.();if(!u||!d)return false;try{const now=d.FieldValue?.serverTimestamp?d.FieldValue.serverTimestamp():firebase.firestore.FieldValue.serverTimestamp();await Promise.all([d.collection('users').doc(u.uid).set({engagement:{activeSeconds:Math.floor(s.activeSeconds),activeMinutes:activeMinutes(),updatedAt:now}},{merge:true}),d.collection('players').doc(u.uid).set({activeSeconds:Math.floor(s.activeSeconds),activeMinutes:activeMinutes(),engagementUpdatedAt:now},{merge:true})]);s.lastSync=Date.now();write(s);return true}catch(e){return false}}
  function reset(){s={activeSeconds:0,lastTick:Date.now(),lastActivity:Date.now(),claimedTiers:0,lastSync:0};write(s)}
  window.ZIVOZONE_ENGAGEMENT={activeSeconds:()=>Math.floor(s.activeSeconds),activeMinutes,claimableBonus,markBonusClaimed,sync,reset};
  setInterval(tick,5000);addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')activity();sync()});addEventListener('online',()=>sync(true));  /* reconnecting after being offline: worth flushing promptly, so force past the throttle explicitly rather than relying on the Event object's truthiness */addEventListener('zivozone-auth',()=>{s={activeSeconds:0,lastTick:Date.now(),lastActivity:Date.now(),claimedTiers:0,lastSync:0,...read()};sync(true)});setTimeout(()=>sync(true),2500);
})();
