const SHELL_CACHE = 'quickroom-shell-v1';
const ROOM_CACHE = 'quickroom-room-v1';
const shellUrls = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(shellUrls)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_ASSETS') return;
  const urls = event.data.urls.filter((url) => new URL(url).origin === self.location.origin);
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(urls)));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname.startsWith('/api/room/')) {
    event.respondWith(networkThenLastRoom(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }

  if (request.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith(cacheThenNetwork(request));
  }
});

async function networkThenLastRoom(request) {
  const cache = await caches.open(ROOM_CACHE);
  const cacheKey = new Request(request.url);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(cacheKey, response.clone());
    return response;
  } catch {
    return (await cache.match(cacheKey)) || new Response('Offline', { status: 503 });
  }
}

async function cacheThenNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}
