/**
 * SplitGasto 2026 - Service Worker v5.0 PLATINUM
 * ESTRATEGIA: Network-first para HTML, Cache-first para assets
 * CACHE: splitgasto-v5-2026 — bumped para invalidar caches anteriores
 */

const CACHE_NAME = 'splitgasto-v5-2026';
const STATIC_ASSETS = [
    'engine/router.js',
    'engine/global.css',
    'favicon.svg',
    'manifest.json',
    'icons/icon-72.png',
    'icons/icon-96.png',
    'icons/icon-128.png',
    'icons/icon-144.png',
    'icons/icon-192.png',
    'icons/icon-512.png'
];

// ── Install: pre-cache static assets ───────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('[SW] Some assets failed to cache:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// ── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: network-first for HTML, cache-first for assets ──────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) return;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    const isHTMLPage = (
        request.mode === 'navigate' ||
        request.headers.get('accept')?.includes('text/html') ||
        url.pathname.endsWith('.html') ||
        url.pathname === '/' ||
        url.pathname === ''
    );

    if (isHTMLPage) {
        // Network-first for HTML: always get latest version
        event.respondWith(
            fetch(request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            }).catch(() => {
                return caches.match(request).then(cached => {
                    return cached || caches.match('dashboard.html');
                });
            })
        );
    } else {
        // Cache-first for static assets
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
    }
});

// ── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    event.waitUntil(
        self.registration.showNotification(data.title || 'SplitGasto', {
            body: data.body || 'Nueva notificación',
            icon: 'icons/icon-192.png',
            badge: 'favicon.svg',
            data: { url: data.url || 'dashboard.html' }
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || 'dashboard.html')
    );
});
