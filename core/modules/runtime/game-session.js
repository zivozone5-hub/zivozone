/* ZIVOZONE V1201.0 — Unified Game Session */
(()=>{'use strict';
const sessions=new Map();
const id=()=>`gs_${Date.now().toString(36)}_${crypto?.randomUUID?.().slice(0,8)||Math.random().toString(36).slice(2,10)}`;
function create(game,meta={}){const session={sessionId:id(),gameId:game.gameId,room:game.room,state:'LOADING',startedAt:null,completedAt:null,resultReceived:false,iframe:null,meta:{...meta}};sessions.set(session.sessionId,session);return session}
function get(sessionId){return sessions.get(String(sessionId))||null}
function transition(s,next){const allowed={LOADING:['READY','FAILED','CLOSED'],READY:['STARTED','CLOSED','FAILED'],STARTED:['PLAYING','COMPLETED','FAILED','TIMEOUT','CLOSED'],PLAYING:['PAUSED','COMPLETED','FAILED','TIMEOUT','CLOSED'],PAUSED:['PLAYING','CLOSED','FAILED'],COMPLETED:['CLOSED'],FAILED:['CLOSED'],TIMEOUT:['CLOSED'],CLOSED:[]};if(!allowed[s.state]?.includes(next))return false;s.state=next;if(next==='STARTED')s.startedAt=Date.now();if(['COMPLETED','FAILED','TIMEOUT','CLOSED'].includes(next))s.completedAt=Date.now();return true}
function remove(sessionId){sessions.delete(String(sessionId))}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.GameSession=Object.freeze({version:'1201.0',create,get,transition,remove,count:()=>sessions.size});
})();
