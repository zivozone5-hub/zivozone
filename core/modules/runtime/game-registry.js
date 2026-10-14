/* ZIVOZONE V1201.0 — Unified Game Registry. Single source of truth for games. */
(()=>{'use strict';
const state={manifest:null,games:new Map(),ready:false};
const norm=v=>String(v??'').trim();
const validGame=g=>g&&/^[a-zA-Z0-9._:-]{1,100}$/.test(norm(g.gameId))&&norm(g.room)&&norm(g.type)&&norm(g.engine)&&norm(g.version);
async function load(url='/games/manifest.json'){
  if(state.ready)return state.manifest;
  const r=await fetch(`${url}${url.includes('?')?'&':'?'}v=1197.1`,{cache:'no-store'});
  if(!r.ok)throw new Error(`GameRegistry: manifest HTTP ${r.status}`);
  const m=await r.json();
  if(!m||!Array.isArray(m.games))throw new Error('GameRegistry: invalid manifest');
  state.games.clear();
  for(const g of m.games){if(!validGame(g))continue;if(state.games.has(g.gameId))throw new Error(`GameRegistry: duplicate gameId ${g.gameId}`);state.games.set(g.gameId,Object.freeze({...g}));}
  state.manifest=Object.freeze({...m,games:[...state.games.values()]});state.ready=true;
  window.dispatchEvent(new CustomEvent('zivozone:game-registry-ready',{detail:{count:state.games.size,version:m.platformVersion||'unknown'}}));
  return state.manifest;
}
function get(id){return state.games.get(norm(id))||null}
function list(filter={}){return [...state.games.values()].filter(g=>Object.entries(filter).every(([k,v])=>v===undefined||g[k]===v))}
function register(g){if(!validGame(g))throw new Error('GameRegistry: invalid game');if(state.games.has(g.gameId))throw new Error(`GameRegistry: duplicate gameId ${g.gameId}`);state.games.set(g.gameId,Object.freeze({...g}));return state.games.get(g.gameId)}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.GameRegistry=Object.freeze({version:'1201.0',load,get,list,register,isReady:()=>state.ready});
})();
