const CACHE='zivozone-shell-v1227';
const APP_CODE=/\.(?:js|css)(?:\?.*)?$/i;
const HTML=/\.html(?:\?.*)?$/i;
const LIVE=/\/data\/(?:matches\/|news\.json)/i;
const CONTENT=/\/data\/(?:health|stories)\//i;
const STORY_ROUTE=/^\/stories(?:\/|$)/i;
const SHELL=[
  '/',
  '/index.html',
  '/core/styles/index.css?v=1227.0',
  '/core/styles/core.css?v=1227.0',
  '/core/styles/forensic-case.css?v=1227.0',
  '/core/styles/puzzle-room.css?v=1227.0',
  '/core/styles/beauty-room.css?v=1227.0',
  '/core/styles/player-hub.css?v=1227.0',
  '/core/styles/rooms.css?v=1227.0',
  '/zivo-ai.js?v=1227.0',
  '/core/config.js?v=1227.0',
  '/core/events.js?v=1227.0',
  '/core/state.js?v=1227.0',
  '/core/modules/question-bank.js?v=1227.0',
  '/core/modules/question-bank-expansion.js?v=1227.0',
  '/core/modules/content-integrity.js?v=1227.0',
  '/core/modules/audio.js?v=1227.0',
  '/core/modules/runtime/i18n.js?v=1227.0',
  '/core/modules/runtime/ads.js?v=1227.0',
  '/core/modules/auth.js?v=1227.0',
  '/core/modules/runtime/router.js?v=1227.0',
  '/core/modules/runtime/seo.js?v=1227.0',
  '/core/modules/runtime/share.js?v=1227.0',
  '/core/modules/runtime/app-shell.js?v=1227.0',
  '/core/modules/runtime/dedupe.js?v=1227.0',
  '/core/modules/runtime/question-history.js?v=1227.0',
  '/core/modules/runtime/server-adapter.js?v=1227.0',
  '/core/modules/runtime/exit-guard.js?v=1227.0',
  '/core/modules/runtime/game-registry.js?v=1227.0',
  '/core/modules/runtime/game-session.js?v=1227.0',
  '/core/modules/runtime/game-validator.js?v=1227.0',
  '/core/modules/runtime/game-telemetry.js?v=1227.0',
  '/core/modules/runtime/game-adapters.js?v=1227.0',
  '/core/modules/runtime/game-loader.js?v=1227.0',
  '/core/modules/runtime/game-bridge.js?v=1227.0',
  '/core/modules/runtime/game-platform.js?v=1227.0',
  '/core/modules/runtime/engagement.js?v=1227.0',
  '/core/modules/runtime/live-hud.js?v=1227.0',
  '/core/modules/match-center.js?v=1227.0',
  '/core/modules/player.js?v=1227.0',
  '/core/modules/economy.js?v=1227.0',
  '/core/modules/forensic-case-core.js?v=1227.0',
  '/core/modules/challenges.js?v=1227.0',
  '/core/modules/puzzle-room.js?v=1227.0',
  '/core/modules/cloud.js?v=1227.0',
  '/core/modules/achievements.js?v=1227.0',
  '/core/modules/daily.js?v=1227.0',
  '/core/modules/competition.js?v=1227.0',
  '/core/modules/missions.js?v=1227.0',
  '/core/modules/player-hub.js?v=1227.0',
  '/core/modules/news.js?v=1227.0',
  '/core/modules/admin.js?v=1227.0',
  '/core/modules/chat.js?v=1227.0',
  '/core/modules/ui.js?v=1227.0',
  '/core/app.js?v=1227.0',
  '/core/modules/beauty-room.js?v=1227.0',
  '/core/boot.js?v=1227.0',
  '/core/modules/rooms.js?v=1227.0',
  '/assets/icons/zivo-192.png',
  '/assets/icons/zivo-512.png',
  '/manifest.webmanifest'
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
async function staleWhileRevalidate(request){
  const c=await caches.open(CACHE),hit=await c.match(request);
  const net=fetch(request).then(res=>{if(res.ok)c.put(request,res.clone());return res}).catch(()=>null);
  return hit||(await net)||new Response('',{status:504});
}
self.addEventListener('fetch',event=>{
  const u=new URL(event.request.url);if(event.request.method!=='GET'||u.origin!==location.origin)return;
  if(HTML.test(u.pathname)||u.pathname==='/'||APP_CODE.test(u.pathname)){event.respondWith(networkFirst(event.request));return}
  if(LIVE.test(u.pathname)){event.respondWith(networkFirst(event.request));return}
  if(CONTENT.test(u.pathname)){event.respondWith(staleWhileRevalidate(event.request));return}
  if(STORY_ROUTE.test(u.pathname)){event.respondWith(networkFirst(event.request));return}
  if(u.pathname==='/stories'||u.pathname==='/health'||u.pathname==='/challenges'||u.pathname.startsWith('/health/')||u.pathname.startsWith('/challenges/')){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return}
  event.respondWith(cacheFirst(event.request));
});
