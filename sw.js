const CACHE_NAME = 'v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html'
];

// Install Event: Assets cachen und Service Worker sofort aktivieren
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Alte Caches zuverlässig löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache First, Fallback to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Wenn im Cache vorhanden, direkt ausliefern
      if (cachedResponse) {
        return cachedResponse;
      }
      // Andernfalls Netzwerkabfrage
      return fetch(event.request).catch(() => {
        // Fallback für Single Page Apps bei komplettem Offline-Zustand
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
