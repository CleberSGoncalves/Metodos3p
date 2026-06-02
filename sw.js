const CACHE_NAME = 'cache-reformas-3p-v2.0.3';

// Install event - force immediate activation
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate event - delete ALL old offline caches to free users from stuck versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheKeys => {
      return Promise.all(
        cacheKeys.map(key => {
          console.log('[ServiceWorker] Removing old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - ALWAYS go to the network (Online Only)
self.addEventListener('fetch', event => {
  // We provide a basic fetch handler to satisfy PWA install requirements,
  // but we DO NOT cache anything anymore. The app is strictly online and always updated.
  event.respondWith(fetch(event.request));
});
