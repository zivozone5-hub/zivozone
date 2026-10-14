/* ZIVOZONE V1201.0 — CANONICAL GAME BRIDGE / ONE GAME PLATFORM ENTRY */
(()=>{'use strict';
const VERSION='1197.1';
const sessions=new Map();
const safeId=v=>String(v||'').replace(/[^a-zA-Z0-9._:-]/g,'').slice(0,100);
const finite=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const emit=(type,detail)=>window.dispatchEvent(new CustomEvent(type,{detail}));
function originFor(u,requested){if(!requested||requested==='self'||requested==='*')return u.origin;return String(requested)}
function close(id){const s=sessions.get(id);if(!s)return false;const gs=window.ZIVOZONE?.GameSession?.get?.(id);if(gs)window.ZIVOZONE.GameSession.transition(gs,'CLOSED');s.iframe?.remove();sessions.delete(id);window.ZIVOZONE?.GameSession?.remove?.(id);emit('zivozone-game-closed',{sessionId:id,gameId:s.gameId});return true}
function send(s,type,payload={}){try{s.iframe?.contentWindow?.postMessage({zivozone:'GAME_BRIDGE',type,sessionId:s.id,gameId:s.gameId,version:VERSION,...payload},s.targetOrigin)}catch(e){emit('zivozone-game-error',{sessionId:s.id,gameId:s.gameId,error:String(e?.message||e)})}}
function onMessage(e){const d=e.data;if(!d||d.zivozone!=='GAME_BRIDGE'||typeof d.type!=='string')return;const id=String(d.sessionId||''),s=sessions.get(id);if(!s||e.source!==s.iframe?.contentWindow||e.origin!==s.allowedOrigin)return;
 const gs=window.ZIVOZONE?.GameSession?.get?.(id);
 if(d.type==='zivo:game:ready'){if(gs)window.ZIVOZONE.GameSession.transition(gs,'READY');send(s,'zivo:host:start');if(gs)window.ZIVOZONE.GameSession.transition(gs,'STARTED');emit('zivozone-game-ready',{sessionId:id,gameId:s.gameId,room:s.room});return}
 if(d.type==='zivo:game:start'){if(gs&&gs.state==='READY')window.ZIVOZONE.GameSession.transition(gs,'STARTED');emit('zivozone-game-start',{sessionId:id,gameId:s.gameId,room:s.room});return}
 if(d.type==='zivo:game:progress'){emit('zivozone-game-progress',{sessionId:id,gameId:s.gameId,room:s.room,progress:Math.max(0,Math.min(100,finite(d.progress,0)))});return}
 if(d.type==='zivo:game:result'&&!s.resultReceived){s.resultReceived=true;const duration=gs?.startedAt?Math.max(0,Date.now()-gs.startedAt):0;const raw={sessionId:id,gameId:s.gameId,room:s.room,score:finite(d.score),correct:finite(d.correct),total:finite(d.total),duration,completed:d.completed===true,timedOut:d.timedOut===true||Number(d.timedOut)===1,version:String(d.version||s.gameVersion)};try{const result=window.ZIVOZONE.GameResultValidator.validate(raw,gs,s.game);if(gs)window.ZIVOZONE.GameSession.transition(gs,result.completed?'COMPLETED':result.timedOut?'TIMEOUT':'FAILED');emit('zivozone-result',result);emit('zivozone-game-result',result)}catch(err){s.resultReceived=false;emit('zivozone-game-error',{sessionId:id,gameId:s.gameId,error:String(err?.message||err)})}return}
 if(d.type==='zivo:game:close')close(id);
 if(d.type==='zivo:game:error')emit('zivozone-game-error',{sessionId:id,gameId:s.gameId,error:String(d.error||'Game error')});
}
function launch(o={}){const gameId=safeId(o.gameId||'mini-game'),src=String(o.src||'').trim();if(!src)throw Error('GameBridge: src is required');const u=new URL(src,location.href);if(!['http:','https:'].includes(u.protocol))throw Error('GameBridge: invalid protocol');const allowedOrigin=originFor(u,o.allowedOrigin);if(allowedOrigin!==u.origin)throw Error('GameBridge: allowedOrigin must match game origin');
 const id=safeId(o.sessionId)||`gs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;const game={gameId,room:String(o.room||'unknown'),version:String(o.gameVersion||o.version||'1.0.0')};let gs=window.ZIVOZONE?.GameSession?.get?.(id);if(!gs&&window.ZIVOZONE?.GameSession){gs=window.ZIVOZONE.GameSession.create(game,{bridge:true})}
 const frame=document.createElement('iframe');frame.className='zivo-mini-game-frame';frame.title=String(o.title||gameId);frame.setAttribute('allow','fullscreen; autoplay');frame.setAttribute('referrerpolicy','no-referrer');frame.setAttribute('sandbox',String(o.sandbox||'allow-scripts allow-same-origin'));(o.mount||document.body).appendChild(frame);
 const rec={id,gameId,room:game.room,gameVersion:game.version,game,iframe:frame,allowedOrigin,targetOrigin:allowedOrigin,resultReceived:false};sessions.set(id,rec);if(gs)gs.iframe=frame;
 frame.src=u.href;frame.addEventListener('load',()=>{if(gs&&gs.state==='LOADING')window.ZIVOZONE.GameSession.transition(gs,'READY');send(rec,'zivo:host:init')},{once:true});
 return{sessionId:id,iframe:frame,close:()=>close(id),pause:()=>send(rec,'zivo:host:pause'),resume:()=>send(rec,'zivo:host:resume'),start:()=>send(rec,'zivo:host:start')};
}
window.addEventListener('message',onMessage);
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.GameBridge=Object.freeze({version:VERSION,launch,close,sessions:()=>sessions.size});
window.dispatchEvent(new CustomEvent('zivozone:module-ready',{detail:{module:'game-platform',version:VERSION}}));
})();
