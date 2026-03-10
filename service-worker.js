// Service Worker pour PWA
const CACHE_NAME = 'mon-planning-v18';
const BASE_PATH = '/monplanificateur';

self.addEventListener('install', (event) => {
  // Vider tous les caches existants à l'installation
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .then(() => caches.open(CACHE_NAME).then(cache => cache.addAll([
      BASE_PATH + '/',
      BASE_PATH + '/index.html',
      BASE_PATH + '/apprentissage.html',
      BASE_PATH + '/recap.html',
      BASE_PATH + '/manifest.json'
    ])))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('unpkg.com') ||
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    !url.hostname.includes('mysinglelise.github.io')
  ) {
    return;
  }

  // Réseau d'abord, cache en fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
