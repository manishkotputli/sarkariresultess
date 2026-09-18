'use strict';

const CACHE_NAME = 'sarkari-resultess-web-v1';

const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/admin_assets/img/logo.png'
];

/**
 * INSTALL
 */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});


/**
 * ACTIVATE
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
 * FETCH
 *
 * Website ke liye:
 * Network First
 * Offline hone par cached version
 */
self.addEventListener('fetch', event => {

    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);

    // Sirf same-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    // Admin ko Web SW se completely exclude karo
    if (url.pathname.startsWith('/admin')) {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                if (response.ok) {

                    const responseClone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });
                }

                return response;
            })

            .catch(() => {

                return caches.match(event.request)
                    .then(cachedResponse => {

                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // Navigation request ke liye homepage fallback
                        if (event.request.mode === 'navigate') {
                            return caches.match('/');
                        }

                        return new Response(
                            'You are currently offline.',
                            {
                                status: 503,
                                headers: {
                                    'Content-Type': 'text/plain; charset=utf-8'
                                }
                            }
                        );
                    });

            })
    );
});