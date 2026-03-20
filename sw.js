/**
 * SplitGasto 2026 - Service Worker v3.0 ULTIMATE
 * ESTRATEGIA:
 *   - HTML pages: Network-first SIEMPRE (sin intercepción de navegación)
 *   - Assets estáticos (JS/CSS/icons): Cache-first
 *   - Navegación: nunca redirige, siempre sirve la página solicitada
 */

const CACHE_NAME = 'splitgasto-v4-2026';
const CACHE_ASSETS = [
  '/engine/router.js',
  '/engine/global.css',
  '/favicon.svg',
  '/manifest.json',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_ASSETS).catch(e => console.warn('[SW] asset cache fail:', e)))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: limpia cachés viejos ───────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar GET del mismo origen
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // ── HTML pages: Network-first ──────────────────────────────────────────
  // Siempre intenta la red primero; si falla (offline) sirve desde caché
  if (request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/engine/resilience.html')))
    );
    return;
  }

  // ── Otros assets: Cache-first ──────────────────────────────────────────
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});

// ─── Push Notifications ────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'SplitGasto', body: 'Nueva notificación' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/dashboard.html' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/dashboard.html'));
});
