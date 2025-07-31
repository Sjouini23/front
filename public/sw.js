self.addEventListener('install', (event) => {
  console.log('✅ SW installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ SW activé');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin static assets
  const isSameOrigin = url.origin === self.location.origin;
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|svg|woff2?|ttf|eot|otf|json)$/.test(url.pathname);

  if (
    event.request.method === 'GET' &&
    isSameOrigin &&
    isStaticAsset
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then((networkResponse) =>
            caches.open('static-cache').then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
          )
          .catch((error) => {
            console.error('❌ Fetch failed:', error);
            return new Response('Offline or fetch error', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
      })
    );
  }

  // All other requests go through normally (especially HTML and API)
});
