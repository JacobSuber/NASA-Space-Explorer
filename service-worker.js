/* NASA Space Explorer LevelUp — installable PWA service worker.
 * A cache-first app shell and network-first NASA APOD API response caching.
 * Paths are relative to registration scope, so GitHub Pages repo paths work.
 */
const VERSION = 'nasa-explorer-pwa-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const API_CACHE = `${VERSION}-nasa-api`;
const API_PREFIX = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic/';
const APP_SHELL = [
  './', './index.html', './style.css', './js/dateRange.js', './js/script.js',
  './js/pwa.js', './manifest.json', './img/favicon.svg',
  './img/icon-192.png', './img/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(APP_SHELL.map(path => new URL(path, self.registration.scope).href));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('nasa-explorer-pwa-') && key !== SHELL_CACHE && key !== API_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function appShellCacheFirst(request) {
  const cached = await caches.match(request, {cacheName: SHELL_CACHE});
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    // A navigation to the app can still load the saved shell offline.
    if (request.mode === 'navigate') {
      const cache = await caches.open(SHELL_CACHE);
      const fallback = await cache.match(new URL('./index.html', self.registration.scope));
      if (fallback) return fallback;
    }
    throw error;
  }
}

async function nasaNetworkFirst(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const live = await fetch(request);
    if (!live.ok) throw new Error(`NASA returned ${live.status}`);
    // Only cache usable responses, not errors. Browser quota may disallow storage.
    await cache.put(request, live.clone()).catch(() => {});
    return live;
  } catch (error) {
    const saved = await cache.match(request);
    if (saved) {
      const clients = await self.clients.matchAll({type:'window',includeUncontrolled:true});
      clients.forEach(client => client.postMessage({type:'APOD_OFFLINE_FALLBACK'}));
      return saved;
    }
    throw error;
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.href.startsWith(API_PREFIX)) {
    event.respondWith(nasaNetworkFirst(request));
    return;
  }
  // Only intercept our own app files; other origins continue normally.
  if (url.origin === self.location.origin && url.pathname.startsWith(new URL(self.registration.scope).pathname)) {
    event.respondWith(appShellCacheFirst(request));
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(self.registration.scope));
});
