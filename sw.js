const CACHE='zivozone-shell-v1180';
const SHELL=[
  '/', '/index.html',
  '/core/styles/index.css?v=1180.0','/core/styles/core.css?v=1180.0','/core/styles/player-hub.css?v=1180.0','/core/styles/forensic-case.css?v=1180.0',
  '/core/config.js?v=1180.0','/core/events.js?v=1180.0','/core/state.js?v=1180.0','/core/app.js?v=1180.0','/core/boot.js?v=1180.0',
  '/core/modules/question-bank.js?v=1180.0','/core/modules/auth.js?v=1180.0','/core/modules/challenges.js?v=1180.0','/core/modules/player.js?v=1180.0','/core/modules/economy.js?v=1180.0',
  '/core/modules/admin.js?v=1180.0','/core/modules/player-hub.js?v=1180.0','/core/modules/news.js?v=1180.0','/core/modules/match-center.js?v=1180.0','/core/modules/forensic-case-core.js?v=1180.0',
  '/core/modules/runtime/i18n.js?v=1180.0','/core/modules/runtime/audio.js?v=1180.0','/core/modules/runtime/ads.js?v=1180.0','/core/modules/runtime/app-shell.js?v=1180.0',
  '/core/modules/runtime/dedupe.js?v=1180.0','/core/modules/runtime/question-history.js?v=1180.0','/core/modules/runtime/server-adapter.js?v=1180.0',
  '/core/modules/runtime/engagement.js?v=1180.0','/core/modules/runtime/live-hud.js?v=1180.0',
  '/core/modules/daily.js?v=1180.0','/core/modules/competition.js?v=1180.0','/core/modules/missions.js?v=1180.0','/core/modules/cloud.js?v=1180.0','/core/modules/achievements.js?v=1180.0','/core/modules/ui.js?v=1180.0',
  '/zivo-ai.js?v=1180.0',
  '/assets/forensic-cinema/entry.svg','/manifest.webmanifest'
];
const dynamicPath=p=>p.includes('/data/matches/')||p.endsWith('/data/news.json');
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(err=>console.warn('ZIVOZONE cache install:',err)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('zivozone-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(dynamicPath(u.pathname)){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(async res=>{if(res.ok){const c=await caches.open(CACHE);await c.put(e.request,res.clone())}return res}).catch(()=>caches.match(e.request)));
    return;
  }
  if(u.origin!==location.origin)return;
  if(u.pathname.endsWith('/index.html')||u.pathname==='/' ){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{if(res.ok){caches.open(CACHE).then(c=>c.put(e.request,res.clone()))}return res}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(async res=>{if(res.ok){const c=await caches.open(CACHE);await c.put(e.request,res.clone())}return res}).catch(()=>caches.match('/'))));
});
