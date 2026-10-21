// ── Y8 App Service Worker v3 ─────────────────────────────────────────────────
// Version bump = cache bust + update notification to all open tabs
const SW_VERSION   = 'v3';
const CACHE_NAME   = `y8-app-${SW_VERSION}`;
const OFFLINE_URL  = '/';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install: cache core assets, then WAIT (do not skip waiting)
// skipWaiting is deferred until the user confirms the update via the banner.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS).catch(() => {}))
    // NOTE: no self.skipWaiting() here — the update banner handles activation
  );
});

// ── Activate: delete all old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('y8-app-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Message: handle commands from the page
self.addEventListener('message', event => {
  // Update banner triggers this to activate the waiting SW immediately
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Page can request the current SW version
  if (event.data?.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
  }
});

// ── Fetch: network-first with cache fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip API calls, cross-origin requests
  if (url.pathname.startsWith('/api/') ||
      url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request)
          .then(r => r || caches.match('/'))
      )
  );
});

// ── Push: display push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {
    title: 'Y8',
    body: 'New update available',
    icon: '/icons/icon-192.png',
  };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

// ── Notification click: open URL or focus the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const match = clients.find(c => c.url === target && 'focus' in c);
      if (match) return match.focus();
      return self.clients.openWindow(target);
    })
  );
});
