const CACHE_NAME = 'railway-n8n-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './AppImages/android/android-launchericon-192-192.png',
  './AppImages/android/android-launchericon-512-512.png',
  'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
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
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Only handle HTTP(S) requests
  if (!event.request.url.startsWith('http')) {
    return; // Let the browser handle non-HTTP requests normally
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request.clone())
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response before caching
            const responseToCache = response.clone();

            // Add to cache in the background
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
                  .catch(error => console.error('Cache put error:', error));
              })
              .catch(error => console.error('Cache open error:', error));

            return response;
          })
          .catch(error => {
            console.error('Fetch error:', error);
            throw error;
          });
      })
      .catch(error => {
        console.error('Cache match error:', error);
        return fetch(event.request);
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: './AppImages/android/android-launchericon-192-192.png',
    badge: './AppImages/android/android-launchericon-192-192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Railway n8n Setup', options)
  );
});
