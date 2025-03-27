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

// Helper function to check if a request should be handled by our service worker
const shouldHandleRequest = (request) => {
  // Only handle GET requests
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);

  // Only handle HTTP(S) requests
  if (!url.protocol.startsWith('http')) return false;

  // Only handle requests within our app's scope
  const scope = self.registration.scope;
  if (!url.href.startsWith(scope) && !ASSETS_TO_CACHE.includes(url.href)) {
    return false;
  }

  return true;
};

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip handling if request doesn't meet our criteria
  if (!shouldHandleRequest(event.request)) {
    return; // Let the browser handle it normally
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        // Clone the request for the fetch call
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Add to cache in the background
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('Cache put failed:', error);
                }
              })
              .catch(error => {
                console.warn('Cache open failed:', error);
              });

            return response;
          })
          .catch(error => {
            console.warn('Fetch failed:', error);
            throw error;
          });
      })
      .catch(error => {
        console.warn('Cache match failed:', error);
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
