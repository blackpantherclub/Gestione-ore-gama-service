const CACHE_NAME = 'gama-v3';
const SCOPE = '/Gestione-ore-gama-service/';

const ASSETS = [
  SCOPE,
  SCOPE + 'index.html',
  SCOPE + 'operaio.html',
  SCOPE + 'admin.html',
  SCOPE + 'carburante.html',
  SCOPE + 'furgoni.html',
  SCOPE + 'registrati.html',
  SCOPE + 'recupera-password.html',
  SCOPE + 'css/style.css',
  SCOPE + 'js/firebase-config.js',
  SCOPE + 'js/pwa-install.js',
  SCOPE + 'img/logo.png',
  SCOPE + 'img/favicon.ico',
  SCOPE + 'img/favicon.png',
  SCOPE + 'icon-192.png',
  SCOPE + 'icon-512.png',
  SCOPE + 'apple-touch-icon.png',
  SCOPE + 'manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.warn('[SW] Cache parziale:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin + SCOPE)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
