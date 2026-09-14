/*
 * Offline cache for the study app.
 *
 * The point is not only offline use: an installed app with an active service
 * worker is treated as far more durable by browsers, which is what keeps a
 * learner's progress from being evicted after a few weeks away.
 *
 * Strategy: precache the shell on install, then serve same-origin GETs
 * cache-first (the bundle and question images never change without a new
 * deploy, which brings a new cache name with it).
 */
const VERSION = 'lid-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(['.', 'index.html', 'manifest.json'])).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request)
        .then((response) => {
          // Only cache real, complete responses.
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          // Navigation offline with nothing cached: fall back to the shell.
          if (request.mode === 'navigate') return caches.match('index.html');
          return Response.error();
        });
    }),
  );
});
