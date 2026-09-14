/* ============================================================
   ZIVOZONE V1095 — PLAYER CORE
   Canonical player state adapter.
   Goal: one player-facing source of truth while preserving legacy APIs.
============================================================ */
(function(){
  'use strict';
  const KEY='zivozone_player_core_v1095';
  const VERSION='v1095';
  const DEFAULT={uid:null,name:'ZIVO Player',email:'',age:null,level:1,xp:0,zivo:0,coins:0,wins:0,gamesPlayed:0,games:0,bestScore:0,bestStreak:0,streak:0,questionsAnswered:0,timedOut:0,stats:{intelligence:0,speed:0,focus:0,memory:0,courage:0},history:[],daily:{date:'',done:false},language:'ar',schemaVersion:VERSION};
  const clone=()=>JSON.parse(JSON.stringify(DEFAULT));
  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  function read(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');return p&&typeof p==='object'?normalize(p):null}catch(e){return null}}
  function write(p){try{localStorage.setItem(KEY,JSON.stringify(normalize(p)));return true}catch(e){return false}}
  function normalize(input){
    const p=Object.assign(clone(),input||{});
    p.level=Math.max(1,Math.min(100,Math.floor(num(p.level,1))));
    p.xp=Math.max(0,num(p.xp));
    p.zivo=Math.max(0,num(p.zivo,num(p.coins)));
    p.coins=p.zivo;
    p.gamesPlayed=Math.max(0,Math.floor(num(p.gamesPlayed,num(p.games))));p.games=p.gamesPlayed;
    p.bestScore=Math.max(0,num(p.bestScore));p.bestStreak=Math.max(0,num(p.bestStreak));p.streak=Math.max(0,num(p.streak));
    p.questionsAnswered=Math.max(0,Math.floor(num(p.questionsAnswered)));
    p.timedOut=Math.max(0,Math.floor(num(p.timedOut)));
    p.stats=Object.assign({},DEFAULT.stats,p.stats||{});
    p.history=Array.isArray(p.history)?p.history.slice(-50):[];
    p.daily=Object.assign({},DEFAULT.daily,p.daily||{});
    p.schemaVersion=VERSION;
    return p;
  }
  function fromLegacy(){
    const candidates=[];
    try{candidates.push(JSON.parse(localStorage.getItem('zivozone_player_v17')||'null'))}catch(e){}
    try{candidates.push(JSON.parse(localStorage.getItem('zivozone_v21_progress')||'null'))}catch(e){}
    try{candidates.push(JSON.parse(localStorage.getItem('zivozone_v29_profile')||'null'))}catch(e){}
    const auth=window.ZIVOZONE_AUTH?.getPlayer?.(); if(auth)candidates.push(auth);
    const best=candidates.filter(Boolean).sort((a,b)=>(num(b.xp,b.totalXP)-num(a.xp,a.totalXP)))[0]||{};
    const p=normalize({uid:best.uid||best.id||null,name:best.name||best.displayName,email:best.email||'',age:best.age,
      level:best.level,xp:num(best.xp,best.totalXP),zivo:num(best.zivo,best.coins),coins:num(best.coins,best.zivo),
      wins:best.wins,gamesPlayed:num(best.gamesPlayed,best.games),games:num(best.games,best.gamesPlayed),bestScore:best.bestScore,
      bestStreak:best.bestStreak,streak:best.streak,questionsAnswered:best.questionsAnswered,timedOut:best.timedOut,
      stats:best.stats,history:best.history,daily:best.daily,language:best.language});
    write(p);return p;
  }
  function get(){return read()||fromLegacy()}
  function merge(patch){const p=normalize(Object.assign({},get(),patch||{}));write(p);window.dispatchEvent(new CustomEvent('zivo:player-core-updated',{detail:p}));return p}
  async function syncCloud(p){
    try{if(window.ZIVOZONE_AUTH?.savePlayerProgress)return await window.ZIVOZONE_AUTH.savePlayerProgress(p)}catch(e){console.warn('V1095 player sync:',e)}
    return false;
  }
  async function setProgress(patch){const p=merge(patch);await syncCloud(p);return p}
  function snapshot(){const p=get();return Object.freeze(JSON.parse(JSON.stringify(p)))}
  function record(result){
    const r=result||{}, score=Math.max(0,num(r.score)), xp=Math.max(0,num(r.xp)), timed=Math.max(0,Math.floor(num(r.timedOut))),
      streak=Math.max(0,num(r.bestStreak,r.streak)), questions=Math.max(0,Math.floor(num(r.total,r.questions)));
    const p=get();p.xp+=xp;p.level=Math.max(1,Math.min(100,Math.floor(Math.sqrt(p.xp/25))+1));p.gamesPlayed++;p.games=p.gamesPlayed;
    p.questionsAnswered+=questions;p.timedOut+=timed;p.bestScore=Math.max(p.bestScore,score);p.bestStreak=Math.max(p.bestStreak,streak);p.streak=Math.max(p.streak,streak);
    p.history.push({at:new Date().toISOString(),challenge:String(r.challengeId||r.challenge||r.id||'challenge'),score,xp,streak,timedOut:timed});p.history=p.history.slice(-50);
    write(p);window.dispatchEvent(new CustomEvent('zivozone:player-core-recorded',{detail:p}));return p;
  }
  function migrate(){const existing=read();if(existing)return existing;return fromLegacy()}
  window.ZIVOZONE_PLAYER_CORE={version:VERSION,get,snapshot,merge,setProgress,record,migrate,KEY};
  // Compatibility: legacy player readers now resolve to the canonical record.
  const oldPlayer=window.ZIVOZONE_PLAYER||{};
  window.ZIVOZONE_PLAYER=Object.assign({},oldPlayer,{get,snapshot,save:p=>merge(p),record,version:VERSION});
  if(window.ZIVOZONE_V21){
    window.ZIVOZONE_V21.get=get;
    window.ZIVOZONE_V21.record=async r=>{const p=record(r);await syncCloud(p);return p};
    window.ZIVOZONE_V21.sync=async()=>syncCloud(get());
  }
  if(window.ZIVOZONE_AUTH){
    const originalGet=window.ZIVOZONE_AUTH.getPlayer;
    window.ZIVOZONE_AUTH.getPlayer=()=>{
      const cloudPlayer=originalGet?.();
      if(cloudPlayer){merge(cloudPlayer);}
      return get();
    };
  }
  migrate();
})();
