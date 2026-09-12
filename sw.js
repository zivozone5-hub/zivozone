const CACHE='zivozone-shell-v1063-1';
const SHELL=['/','/index.html','/manifest.webmanifest','/styles.css','/zivozone-runtime.js','/zivo-global-core.js','/zivo-v103-pro.css','/zivo-v103-pro.js','/zivo-v104-pro.css','/zivo-v104-pro.js','/zivo-v105-luxury.css','/zivo-v105-luxury.js','/zivo-v1062-royal.css','/zivo-v1062-royal.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('zivozone-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
 if(new URL(r.url).pathname==='/'||new URL(r.url).pathname==='/index.html'){event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match('/index.html')));return;}
 event.respondWith(fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});}return res;}).catch(()=>caches.match(r)));
});
