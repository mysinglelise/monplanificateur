// Service Worker pour PWA
const CACHE_NAME = 'mon-planning-v6';
const BASE_PATH = '/monplanificateur';

// Installation : mettre en cache les ressources statiques uniquement
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        BASE_PATH + '/',
        BASE_PATH + '/index.html',
        BASE_PATH + '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyer les anciens caches
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

// Fetch : laisser passer TOUTES les requêtes externes (Firebase, Firestore, CDN...)
// Ne mettre en cache que les fichiers locaux de l'app
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Laisser passer sans interception :
  // - Firebase / Firestore
  // - Google APIs
  // - CDN externes (unpkg, tailwind, fonts...)
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
    return; // pas d'interception — le navigateur gère directement
  }

  // Pour les fichiers locaux : réseau d'abord, cache en fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
