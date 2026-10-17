// Fernweh: Service Worker, damit Android das Spiel als App installieren kann.
// Alles kommt immer frisch aus dem Netz, damit Updates sofort ankommen. Nur ohne Netz hilft der Zwischenspeicher.
const C='fernweh';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  // Seiten immer beim Server nachfragen (ohne Browser-Zwischenspeicher), damit neue Versionen sofort ankommen.
  const req=e.request.mode==='navigate'?fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}):fetch(e.request);
  e.respondWith(req.then(r=>{const c=r.clone();caches.open(C).then(k=>k.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});
