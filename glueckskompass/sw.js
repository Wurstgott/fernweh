/* Glückskompass: Offline-Nutzung.
   Die Seite selbst kommt immer zuerst aus dem Netz (network-first), damit die Selbst-Aktualisierung
   über den BUILD-Stempel weiter funktioniert. Nur ohne Netz antwortet der Cache.
   Schriften, Icons und Manifest ändern sich selten und kommen zuerst aus dem Cache (cache-first). */
const CACHE = "gk-static-20261019-1651";
const PAGE = "gk-page-20261019-1651";
const STATIC = ["manifest.json", "lehrkraefte.html", "apple-touch-icon.png", "icon-192.png", "icon-512.png",
  "fonts/fraunces.woff", "fonts/fraunces-italic.woff", "fonts/literata.woff", "fonts/literata-italic.woff", "fonts/figtree.woff"];
const scope = () => self.registration.scope; // z. B. https://…/glueckskompass/

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(STATIC.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    try { const r = await fetch(scope(), { cache: "reload" }); if (r.ok) await (await caches.open(PAGE)).put(scope(), r); } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keep = [CACHE, PAGE];
    for (const k of await caches.keys()) if (k.startsWith("gk-") && !keep.includes(k)) await caches.delete(k); // nur eigene Caches, nie die anderer Apps auf derselben Domain
    await self.clients.claim();
  })());
});

function isPage(req, url) {
  const s = new URL(scope());
  return url.origin === s.origin && (url.pathname === s.pathname || url.pathname === s.pathname + "index.html");
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // fremde Seiten (Quellen, Kalender) nie anfassen

  if (isPage(req, url)) {
    // network-first: frische Seite, bei Erfolg als Offline-Kopie ablegen
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        if (r && r.ok && r.type === "basic") { const copy = r.clone(); e.waitUntil(caches.open(PAGE).then(c => c.put(scope(), copy))); }
        return r;
      } catch (err) {
        const hit = await caches.match(scope(), { cacheName: PAGE, ignoreSearch: true });
        if (hit) return hit;
        throw err;
      }
    })());
    return;
  }

  // andere Seiten im Ordner (z. B. lehrkraefte.html): network-first unter ihrer eigenen Adresse
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try { const r = await fetch(req); if (r && r.ok && r.type === "basic") { const copy = r.clone(); e.waitUntil(caches.open(PAGE).then(c => c.put(req, copy))); } return r; }
      catch (err) { const hit = await caches.match(req, { cacheName: PAGE, ignoreSearch: true }); if (hit) return hit; throw err; }
    })());
    return;
  }

  // cache-first für alles andere aus dem App-Ordner (Schriften, Icons, Manifest)
  e.respondWith((async () => {
    const hit = await caches.match(req, { cacheName: CACHE, ignoreSearch: true });
    if (hit) return hit;
    const r = await fetch(req);
    if (r && r.ok && r.type === "basic") { const copy = r.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(req, copy))); }
    return r;
  })());
});
