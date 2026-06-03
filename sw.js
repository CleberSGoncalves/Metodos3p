const CACHE_NAME = 'cache-reformas-3p-v3.0.6';

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

// Fetch event - ALWAYS go to the network and BYPASS browser HTTP cache
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET ou não são HTTP
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  // Aplica o bypass de cache APENAS para os arquivos do nosso próprio domínio
  if (event.request.url.includes(self.location.origin)) {
    const bypassCacheReq = new Request(event.request.url, {
      method: 'GET',
      headers: event.request.headers,
      mode: event.request.mode === 'navigate' ? 'navigate' : 'same-origin',
      credentials: event.request.credentials,
      cache: 'no-store' // Força ida ao servidor para nossos arquivos HTML/JS/CSS
    });

    event.respondWith(
      fetch(bypassCacheReq).catch(err => {
        console.warn('[SW] Falha na rede para', event.request.url);
        throw err;
      })
    );
    return;
  }

  // Para APIs externas (Google, Hotmart, Unsplash, CDNs), repassa a requisição original intacta!
  event.respondWith(fetch(event.request));
});
