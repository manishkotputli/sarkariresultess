'use strict';

const CACHE_NAME = 'sarkari-resultess-admin-v1';

const STATIC_ASSETS = [
    '/admin-manifest.json',
    '/admin_assets/img/logo.png'
];

/**
 * Install
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});


/**
 * Activate
 */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});


/**
 * Fetch
 *
 * Admin pages:
 * Network first
 * Fallback to cache if network unavailable
 */
self.addEventListener('fetch', event => {

    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);

    // Sirf /admin/ requests handle karo
    if (!url.pathname.startsWith('/admin/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {

                // Successful response ko cache karo
                if (response.ok) {
                    const responseClone = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});