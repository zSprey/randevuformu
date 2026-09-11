// Service Worker for randevuformu.com PWA & Push Notifications
const CACHE_NAME = "rf-cache-v1";
const OFFLINE_URLS = ["/dashboard"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Push notification event listener
self.addEventListener("push", (event) => {
  let data = {
    title: "Yeni Randevu Bildirimi! 🎉",
    body: "Sisteminizde yeni bir müşteri randevusu oluşturuldu.",
    url: "/dashboard",
    icon: "/icon.png",
    badge: "/icon.png",
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: data.badge || "/icon.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/dashboard",
    },
    actions: [
      { action: "open_dashboard", title: "Paneli Aç" },
      { action: "dismiss", title: "Kapat" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event listener
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes("/dashboard") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
