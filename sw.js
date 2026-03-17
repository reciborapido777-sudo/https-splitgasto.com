/**
 * SplitGasto 2026 - Service Worker v1.0 Gold
 * PWA: Cache-first para assets estáticos, network-first para datos
 */

const CACHE_NAME = 'splitgasto-v2-2026';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/games.html',
  '/game-roulette.html',
  '/game-cards.html',
  '/game-coin.html',
  '/game-darts.html',
  '/add-expense.html',
  '/create-group.html',
  '/groups.html',
  '/activity.html',
  '/analytics.html',
  '/profile.html',
  '/membership.html',
  '/rankings.html',
  '/settings.html',
  '/notifications.html',
  '/split.html',
  '/vault.html',
  '/scanner.html',
  '/security.html',
  '/receipt-view.html',
  '/liquidation.html',
  '/manual.html',
  '/success.html',
  '/support.html',
  '/legal.html',
  '/investors.html',
  '/onboarding.html',
  '/auth-login.html',
  '/auth-register.html',
  '/engine/router.js',
  '/engine/global.css',
  '/engine/resilience.html',
  '/favicon.svg',
  '/manifest.json'
];

// ─── Install: Pre-cache all static assets ─────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing SplitGasto v2.0...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to cache:', err);
      });
    }).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// ─── Activate: Clean old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating SplitGasto v2.0...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch: Cache-first for static, network-first for API ─────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (CDN fonts, Tailwind, etc.) - let them go through
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but also update in background
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse;
      }

      // Not in cache: fetch from network
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache the new response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback
        return caches.match('/engine/resilience.html');
      });
    })
  );
});

// ─── Background Sync (placeholder for future API sync) ────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-expenses') {
    console.log('[SW] Background sync: expenses');
  }
});

// ─── Push Notifications (placeholder) ─────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: 'SplitGasto',
    body: 'Tienes una nueva notificación',
    icon: '/favicon.svg'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
