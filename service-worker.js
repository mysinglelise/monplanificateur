// Service Worker pour PWA - Network First, pas de cache HTML
const CACHE_NAME = 'mon-planning-v7';
const BASE_PATH = '/monplanificateur';

// Installation : vider l'ancien cache, ne rien mettre en cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activation : nettoyer TOUS les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch : TOUJOURS aller chercher sur le réseau
// Le service worker ne met RIEN en cache
// Cela garantit que Firestore et les données sont toujours frais
self.addEventListener('fetch', (event) => {
  // Laisser le navigateur gérer directement — pas d'interception
  return;
});
