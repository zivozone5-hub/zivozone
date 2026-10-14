/* ZIVOZONE V1201.0 — Unified Game Platform facade for external games and internal providers. */
(()=>{'use strict';
async function recordProviderResult({gameId,room='puzzle',version='1.0.0',score,correct,total,duration=0,completed=false,timedOut=false}={}){
 const S=window.ZIVOZONE?.GameSession,V=window.ZIVOZONE?.GameResultValidator;if(!S||!V)throw new Error('GamePlatform: validator/session unavailable');
 const game={gameId:String(gameId||''),room:String(room),version:String(version)};if(!game.gameId)throw new Error('GamePlatform: gameId required');
 const session=S.create(game,{provider:true});S.transition(session,'READY');S.transition(session,'STARTED');
 try{const result=V.validate({sessionId:session.sessionId,gameId:game.gameId,room:game.room,score,correct,total,duration,completed,timedOut,version:game.version},session,game);S.transition(session,result.completed?'COMPLETED':result.timedOut?'TIMEOUT':'FAILED');return result}catch(e){S.remove(session.sessionId);throw e}
}
async function init(){try{return await window.ZIVOZONE?.GameRegistry?.load?.()}catch(e){console.warn('GamePlatform registry:',e);return null}}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.GamePlatform=Object.freeze({version:'1201.0',init,recordProviderResult});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})();
