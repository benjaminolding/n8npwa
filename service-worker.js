// Cache name
const CACHE_NAME = 'railway-n8n-cache-v1';

// Files to cache
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './ui.js',
  './workflow.js',
  './instructions.js',
  './manifest.json',
  './railway-setup.ps1',
  './railway-setup.sh',
  './railway-setup.bat',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js'
];

// Install event
self.addEventListener('install', event => {
  // Skip waiting to make new service worker active immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Attempt to cache files but don't fail if some aren't available
        return cache.addAll(urlsToCache).catch(err => console.log('Cache error:', err));
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  // Claim control over all clients immediately
  event.waitUntil(clients.claim());
});

// Fetch event - allow all requests during development
self.addEventListener('fetch', event => {
  // Don't intercept websocket connections
  if (event.request.url.startsWith('ws:') || event.request.url.startsWith('wss:')) {
    return;
  }

  // Don't intercept IndexedDB or other local storage requests
  if (event.request.url.includes('idb') || 
      event.request.url.includes('indexeddb')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
