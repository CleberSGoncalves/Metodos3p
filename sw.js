const CACHE_NAME = 'reformas-3p-v9';
const ASSETS_TO_CACHE = [
  'index.html?v=2.0.0',
  'style.css?v=2.0.0',
  'manifest.json?v=2.0.0',
  'js/supabase.js?v=2.0.0',
  'js/app.js?v=2.0.0',
  'js/database.js?v=2.0.0',
  'js/financeiro.js?v=2.0.0',
  'js/decisao.js?v=2.0.0',
  'js/conteudos.js?v=2.0.0',
  'js/paywall.js?v=2.0.0',
  'icon-192.png',
  'icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;600;700;800&display=swap'
];

// Install event - caching basic shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching offline assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleaning old caches if present
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheKeys => {
      return Promise.all(
        cacheKeys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serving assets from network first, falling back to cache if offline
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip handling browser extensions or non-http protocols
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If the request succeeded and it's a valid 200 response, cache it
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed (offline), try to get from cache
        return caches.match(event.request);
      })
  );
});
