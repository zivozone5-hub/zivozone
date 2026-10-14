/* ZIVOZONE V1201.0 — Unified lazy Game Loader. */
(()=>{'use strict';
async function load(gameId,{mount=document.body,title,metadata={}}={}){
 const R=window.ZIVOZONE?.GameRegistry,S=window.ZIVOZONE?.GameSession;if(!R||!S)throw new Error('GameLoader: platform not ready');
 await R.load();const game=R.get(gameId);if(!game||game.enabled===false)throw new Error(`GameLoader: game unavailable: ${gameId}`);const session=S.create(game,metadata);
 if(game.type==='flash'){const host=document.createElement('div');host.className='zivo-game-host';host.dataset.sessionId=session.sessionId;host.style.cssText='width:100%;height:100%;min-height:320px';mount.appendChild(host);try{session.iframe=await window.ZIVOZONE.GameAdapters.mountSWF(game,host);S.transition(session,'READY');}catch(e){S.transition(session,'FAILED');host.remove();throw e}}
 else {if(!game.src)throw new Error('GameLoader: native/web game requires src or provider');const bridge=window.ZIVOZONE.GameBridge;if(!bridge)throw new Error('GameLoader: GameBridge unavailable');const launched=bridge.launch({...game,title:title||game.title,mount,sessionId:session.sessionId});session.iframe=launched.iframe;S.transition(session,'READY')}
 return session;
}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.GameLoader=Object.freeze({version:'1201.0',load});
})();
