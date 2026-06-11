const CACHE_NAME = 'atrack-offline-v1';
const PRE_CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/favicon.ico',
];

// On installation, cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Intelligent Pre-Caching core resources...');
      return cache.addAll(PRE_CACHE_RESOURCES).catch((err) => {
        console.warn('[Service Worker] Failed to pre-cache some assets. Continuing...', err);
      });
    })
  );
  self.skipWaiting();
});

// Clean obsolete caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Cleared obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept fetch events with cache fallback strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Exclude non-GET requests and external API or authentication calls
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }

  // Network-First with Cache-Fallback for page shells and index
  if (request.headers.get('accept')?.includes('text/html') || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then((fallback) => {
            return fallback || caches.match('/');
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for bundled assets, CSS, images, etc.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Silent catch for offline fetch attempt failures
        });

      return cachedResponse || fetchPromise;
    })
  );
});
