/* ZIVOZONE V1197.2 — Result validation. No reward fields are accepted. */
(()=>{'use strict';
const finite=n=>Number.isFinite(Number(n));
const int=(n,min,max)=>Number.isInteger(Number(n))&&Number(n)>=min&&Number(n)<=max;
const seen=new Set();
function validate(input,session,game){
  if(!session||!game)throw new Error('GameResultValidator: unknown session');
  const d=input||{};
  const result={sessionId:String(d.sessionId||session.sessionId),gameId:String(d.gameId||''),room:String(d.room||game.room),score:Number(d.score),correct:Number(d.correct),total:Number(d.total),duration:Number(d.duration||0),completed:d.completed===true,timedOut:d.timedOut===true||Number(d.timedOut)===1,version:String(d.version||game.version)};
  if(result.sessionId!==session.sessionId||result.gameId!==game.gameId||result.room!==game.room)throw new Error('GameResultValidator: session/game mismatch');
  if(!finite(result.total)||!finite(result.correct)||!finite(result.score)||!finite(result.duration)||!int(result.total,1,10000)||!int(result.correct,0,result.total)||!int(result.score,0,100000)||result.duration<0||result.duration>86400000)throw new Error('GameResultValidator: invalid numeric result');
  if(result.timedOut&&result.completed)throw new Error('GameResultValidator: timeout cannot be completed');
  if(!result.completed&&!result.timedOut)throw new Error('GameResultValidator: result is not final');
  if(seen.has(result.sessionId))throw new Error('GameResultValidator: duplicate final result');
  seen.add(result.sessionId);
  const out=Object.freeze({...result,perfect:result.completed&&!result.timedOut&&result.correct===result.total});
  window.dispatchEvent(new CustomEvent('zivozone:validated-game-result',{detail:out}));
  return out;
}
function forget(sessionId){seen.delete(String(sessionId))}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.GameResultValidator=Object.freeze({version:'1201.0',validate,forget});
})();
