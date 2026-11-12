/* Service worker — offline support for the app shell.
 *
 * Security notes:
 *  - Only handles same-origin GET requests. It never touches (or caches) cross-origin
 *    traffic such as the optional Open-Meteo weather call.
 *  - Network-first: you always get the latest deployed version when online; the cache is
 *    only a fallback when offline. No stale-code surprises after you push an update.
 *  - Old caches are deleted on activate. Bump CACHE_VERSION if you ever rename files.
 */
const CACHE_VERSION = 'v3';
const CACHE = 'sub2h-shell-' + CACHE_VERSION;
const SHELL = [
  './', 'index.html', 'styles.css', 'app.js', 'theme-init.js', 'manifest.webmanifest',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'fonts/inter-latin-wght-normal.woff2', 'fonts/oswald-latin-wght-normal.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never intercept third-party requests

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
      )
  );
});
