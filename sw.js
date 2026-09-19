const CACHE='zivozone-shell-v1197.6';
const APP_CODE=/\.(?:js|css)(?:\?.*)?$/i;
const HTML=/\.html(?:\?.*)?$/i;
const DATA=/\/data\/(?:matches\/|news\.json)/i;
const SHELL=[
  '/', '/index.html',
  '/core/styles/index.css?v=1197.6','/core/styles/core.css?v=1197.6','/core/styles/player-hub.css?v=1197.6','/core/styles/forensic-case.css?v=1197.6','/core/styles/puzzle-room.css?v=1197.6','/core/styles/beauty-room.css?v=1197.6',
  '/core/config.js?v=1197.6','/core/events.js?v=1197.6','/core/state.js?v=1197.6','/core/app.js?v=1197.6','/core/boot.js?v=1197.6',
  '/core/modules/question-bank.js?v=1197.6','/core/modules/auth.js?v=1197.6','/core/modules/challenges.js?v=1197.6','/core/modules/player.js?v=1197.6','/core/modules/economy.js?v=1197.6',
  '/core/modules/admin.js?v=1197.6','/core/modules/player-hub.js?v=1197.6','/core/modules/news.js?v=1197.6','/core/modules/match-center.js?v=1197.6','/core/modules/forensic-case-core.js?v=1197.6',
  '/core/modules/runtime/i18n.js?v=1197.6','/core/modules/runtime/audio.js?v=1197.6','/core/modules/runtime/ads.js?v=1197.6','/core/modules/runtime/app-shell.js?v=1197.6',
  '/core/modules/runtime/dedupe.js?v=1197.6','/core/modules/runtime/question-history.js?v=1197.6','/core/modules/runtime/server-adapter.js?v=1197.6','/core/modules/runtime/exit-guard.js?v=1197.6',
  '/core/modules/runtime/game-registry.js?v=1197.6','/core/modules/runtime/game-session.js?v=1197.6','/core/modules/runtime/game-validator.js?v=1197.6','/core/modules/runtime/game-telemetry.js?v=1197.6','/core/modules/runtime/game-adapters.js?v=1197.6','/core/modules/runtime/game-loader.js?v=1197.6','/core/modules/runtime/game-bridge.js?v=1197.6','/core/modules/runtime/game-platform.js?v=1197.6',
  '/core/modules/runtime/engagement.js?v=1197.6','/core/modules/runtime/live-hud.js?v=1197.6',
  '/core/modules/daily.js?v=1197.6','/core/modules/competition.js?v=1197.6','/core/modules/missions.js?v=1197.6','/core/modules/cloud.js?v=1197.6','/core/modules/achievements.js?v=1197.6','/core/modules/ui.js?v=1197.6','/core/modules/puzzle-room.js?v=1197.6','/core/modules/beauty-room.js?v=1197.6','/zivo-ai.js?v=1197.6','/assets/forensic-cinema/entry.svg','/manifest.webmanifest'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(err=>console.warn('ZIVOZONE cache install:',err)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('zivozone-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function networkFirst(request){
  try{const res=await fetch(request,{cache:'no-store'});if(res.ok){const c=await caches.open(CACHE);await c.put(request,res.clone())}return res}catch(_){return caches.match(request).then(hit=>hit||caches.match('/index.html'))}
}
async function cacheFirst(request){
  const hit=await caches.match(request);if(hit)return hit;
  try{const res=await fetch(request);if(res.ok){const c=await caches.open(CACHE);await c.put(request,res.clone())}return res}catch(_){return caches.match('/index.html')}
}
self.addEventListener('fetch',event=>{
  const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==location.origin)return;
  if(HTML.test(u.pathname)||u.pathname==='/'||APP_CODE.test(u.pathname)){event.respondWith(networkFirst(event.request));return}
  if(DATA.test(u.pathname)){event.respondWith(networkFirst(event.request));return}
  event.respondWith(cacheFirst(event.request));
});
