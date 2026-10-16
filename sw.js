// Fernweh: Service Worker, damit Android das Spiel als App installieren kann.
// Alles kommt immer frisch aus dem Netz, damit Updates sofort ankommen. Nur ohne Netz hilft der Zwischenspeicher.
const C='fernweh';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(k=>k.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});
