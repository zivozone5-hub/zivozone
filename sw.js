const CACHE='zivozone-shell-v1229';
const APP_CODE=/\.(?:js|css)(?:\?.*)?$/i;
const HTML=/\.html(?:\?.*)?$/i;
const LIVE=/\/data\/(?:matches\/|news\.json)/i;
const CONTENT=/\/data\/(?:health|stories)\//i;
const STORY_ROUTE=/^\/stories(?:\/|$)/i;
const LEGAL_ROUTE=/^\/(?:privacy|terms)(?:\/|$)/i;
const SHELL=[
  '/',
  '/index.html',
  '/core/styles/index.css?v=1229.8',
  '/core/styles/core.css?v=1229.8',
  '/core/styles/forensic-case.css?v=1229.8',
  '/core/styles/puzzle-room.css?v=1229.8',
  '/core/styles/beauty-room.css?v=1229.8',
  '/core/styles/player-hub.css?v=1229.8',
  '/core/styles/rooms.css?v=1229.8',
  '/zivo-ai.js?v=1229.8',
  '/dist/app.bundle.js?v=1229.8',
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
  if(STORY_ROUTE.test(u.pathname)||LEGAL_ROUTE.test(u.pathname)){event.respondWith(networkFirst(event.request));return}
  if(u.pathname==='/stories'||u.pathname==='/health'||u.pathname==='/challenges'||u.pathname.startsWith('/health/')||u.pathname.startsWith('/challenges/')){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return}
  event.respondWith(cacheFirst(event.request));
});
