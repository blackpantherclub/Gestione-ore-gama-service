const CACHE_NAME = 'gama-service-v1';
const ASSETS = [
  './',
  './index.html',
  './operaio.html',
  './admin.html',
  './carburante.html',
  './furgoni.html',
  './registrati.html',
  './recupera-password.html',
  './css/style.css',
  './js/firebase-config.js',
  './img/logo.png',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/apple-touch-icon.png',
  './img/favicon.ico',
  './img/favicon.png'
];

// Installazione: metti in cache le risorse principali
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Attivazione: pulisci cache vecchie
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback cache
self.addEventListener('fetch', e => {
  // Ignora richieste Firebase (sempre online)
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('anthropic') ||
      e.request.url.includes('emailjs') ||
      e.request.url.includes('cdnjs') ||
      e.request.url.includes('jsdelivr')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Aggiorna cache con risposta fresca
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
