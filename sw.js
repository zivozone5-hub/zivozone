const CACHE='zivozone-shell-v1082-0';
const SHELL=['/','/index.html','/manifest.webmanifest','/zivozone-core-v1082.css','/zivozone-core-v1082.js','/zivo-ai.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('zivozone-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
 if(new URL(r.url).pathname==='/'||new URL(r.url).pathname==='/index.html'){event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match('/index.html')));return;}
 event.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});}return res;}).catch(()=>caches.match(r)));
});
