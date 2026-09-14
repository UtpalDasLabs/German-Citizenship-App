/*
 * Offline cache for the study app.
 *
 * The point is not only offline use: an installed app with an active service
 * worker is treated as far more durable by browsers, which is what keeps a
 * learner's progress from being evicted after a few weeks away.
 *
 * Strategy depends on whether a URL is content-addressed:
 *
 *   - HTML and navigations are NETWORK-FIRST. index.html and the per-route
 *     pages keep the same URL across deploys, so serving them cache-first
 *     pins an installed user to whatever build they first cached - forever,
 *     because the cache name never changes either. That is exactly the bug
 *     this file used to have.
 *   - Hashed build output and bundled assets are CACHE-FIRST. Their filenames
 *     contain a content hash, so a new deploy asks for new URLs and an old
 *     entry can never be served in place of a new one.
 *
 * BUILD_ID is rewritten at build time, so a deploy retires the old cache.
 */
const BUILD_ID = 'dev';
const CACHE = `lid-${BUILD_ID}`;

/** Content-addressed paths: safe to serve from cache indefinitely. */
function isImmutable(url) {
  return /\/_expo\/static\//.test(url.pathname) || /\/assets\//.test(url.pathname);
}

function isHtml(request, url) {
  return (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(['./', 'index.html', 'manifest.json']))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isHtml(request, url)) {
    // Network first: a newer deploy must win over a cached page.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((hit) => hit ?? caches.match('index.html')),
        ),
    );
    return;
  }

  if (!isImmutable(url)) {
    // Anything else uncached and not content-addressed: prefer the network,
    // fall back to whatever is stored.
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit;
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => Response.error());
    }),
  );
});
