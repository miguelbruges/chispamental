// Cache mínimo para permitir instalación (PWA) y carga rápida en visitas repetidas.
const CACHE = "chispamental-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./assets/css/tokens.css",
  "./assets/css/mascot.css",
  "./assets/css/components.css",
  "./assets/js/app.js",
  "./assets/js/mascot.js",
  "./assets/js/effects.js",
  "./assets/js/progression.js",
  "./assets/js/engine/quiz.js",
  "./assets/js/engine/memory.js",
  "./assets/js/engine/timer.js",
  "./assets/js/content/questions.js",
  "./assets/js/content/generators.js",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Cache-first para lo propio (rápido y offline), red directa para todo lo demás (fuentes, etc).
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return res;
        })
    )
  );
});
