const CACHE_NAME = "mission-poland-v3";
const OFFLINE_URL = "/";

const ASSETS_TO_CACHE = [
  "/",
  "/today",
  "/analytics",
  "/youtube",
  "/software",
  "/finance",
  "/poland",
  "/identities",
  "/parking",
  "/audit",
  "/settings",
  "/manifest.json",
  "/favicon.ico"
];

// Install: Cache critical navigation routes & shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("Pre-caching assets error", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Friendly recovery page if Lovable preview session expired and no cache exists
function createAuthExpiredResponse() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Session Expired — Mission Poland</title>
  <style>
    body {
      margin: 0;
      background: #09090b;
      color: #f4f4f5;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      max-width: 440px;
      border: 1px solid #27272a;
      background: #18181b;
      border-radius: 12px;
      padding: 32px 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 {
      font-size: 20px;
      color: #ef4444;
      margin: 0 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    p {
      font-size: 13px;
      color: #a1a1aa;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: #ef4444;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      text-decoration: none;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      margin: 4px;
    }
    .btn-secondary {
      background: #27272a;
      color: #e4e4e7;
    }
    .btn:hover {
      filter: brightness(1.1);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚠️ Offline or Session Expired</h1>
    <p>
      Please check your network connection or sign in again to continue.
    </p>
    <button class="btn" onclick="window.location.reload()">Reload App</button>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Fetch: Stale-While-Revalidate caching strategy with network fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // For app navigation and static assets on same origin
  if (url.origin === location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            }

            // If server returns 401/403 (e.g. Lovable preview session expired)
            if (networkResponse.status === 401 || networkResponse.status === 403) {
              return cache.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return cache.match(OFFLINE_URL).then((offlineResponse) => {
                  return offlineResponse || createAuthExpiredResponse();
                });
              });
            }

            return networkResponse;
          })
          .catch(() => {
            return cache.match(event.request).then((cachedResponse) => {
              return cachedResponse || cache.match(OFFLINE_URL) || createAuthExpiredResponse();
            });
          });
      })
    );
    return;
  }

  // Default network fetch with offline cache fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push Notifications Event Handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "MISSION POLAND — Deep Work Reminder";
  const options = {
    body: data.body || "16-Hour Focus Window Active. Execute Today's Identity Loop.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/today",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/today";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
