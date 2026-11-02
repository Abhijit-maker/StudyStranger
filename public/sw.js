// Service Worker for Study Stranger PWA
const CACHE_NAME = 'study-stranger-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/robots.txt',
  '/sitemap.xml'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache error during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip chrome-extension/api requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Do not cache API routes or firestore requests directly in SW cache
  if (url.pathname.startsWith('/api') || url.hostname.includes('firestore') || url.hostname.includes('googleapis')) {
    return;
  }

  // Network first with cache fallback strategy
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
        });
      })
  );
});

// ==========================================
// PWA NOTIFICATION EVENT LISTENERS
// ==========================================

// Handle Notification Click (Deep linking into app)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  let targetUrl = notificationData.url || '/';

  // Handle interactive action buttons
  if (event.action === 'action_test') {
    targetUrl = '/?action=mock_test';
  } else if (event.action === 'action_mentor') {
    targetUrl = '/?action=live_mentor';
  } else if (event.action === 'action_dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            client.navigate(targetUrl);
          } else {
            client.postMessage({ type: 'NAVIGATE_TO', url: targetUrl, payload: notificationData });
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle Push notifications from server / Web Push
self.addEventListener('push', (event) => {
  let data = {
    title: 'Study Stranger 🎓',
    body: 'তোমার জন্য নতুন স্টাডি নোটিফিকেশন এসেছে!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    url: '/'
  };

  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    vibrate: [150, 80, 150],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'action_test', title: '📝 মক টেস্ট শুরু' },
      { action: 'action_mentor', title: '🎙️ AI মেন্টর' }
    ],
    tag: data.tag || 'study-stranger-alert',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle messages from the active webpage to trigger notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || 'Study Stranger', {
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [150, 75, 150],
      actions: [
        { action: 'action_test', title: '📝 টেস্ট দাও' },
        { action: 'action_mentor', title: '🎙️ AI সাথে কথা' }
      ],
      ...options
    });
  }
});

