/* ZIVOZONE V1201.0 — Game adapters. SWF uses Ruffle only; Adobe Flash is never used. */
(()=>{'use strict';
let rufflePromise=null;
const RUFFLE_URL=window.ZIVOZONE_RUFFLE_URL||'https://unpkg.com/@ruffle-rs/ruffle/ruffle.js';
async function loadRuffle(){if(rufflePromise)return rufflePromise;rufflePromise=new Promise((resolve,reject)=>{if(window.RufflePlayer)return resolve(window.RufflePlayer.newest());const s=document.createElement('script');s.src=RUFFLE_URL;s.async=true;s.onload=()=>window.RufflePlayer?resolve(window.RufflePlayer.newest()):reject(new Error('Ruffle loaded without API'));s.onerror=()=>reject(new Error('Ruffle compatibility layer failed to load'));document.head.appendChild(s)});return rufflePromise}
async function mountSWF(game,mount){if(String(game.asset||'').toLowerCase().endsWith('.swf')===false)throw new Error('SWF adapter: invalid asset');const u=new URL(game.asset,location.href);if(u.origin!==location.origin)throw new Error('SWF adapter: asset must be same-origin');const st=await fetch(u,{method:'HEAD',cache:'no-store'});if(!st.ok)throw new Error('SWF adapter: asset missing');const player=await loadRuffle();const el=player.createPlayer();el.style.width='100%';el.style.height='100%';el.setAttribute('aria-label',game.title||game.gameId);mount.appendChild(el);if(typeof el.load==='function')await el.load(u.href);else throw new Error('SWF adapter: player API unavailable');return el}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.GameAdapters=Object.freeze({version:'1201.0',loadRuffle,mountSWF});
})();
