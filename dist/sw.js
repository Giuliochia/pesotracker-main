self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});

self.addEventListener('push', e => {
  const d = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(d.title || 'Peso Tracker', {
      body: d.body || 'È ora di pesarti!',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'peso-reminder',
    })
  );
});
