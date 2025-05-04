// This is the main service worker used by Vite PWA
// Import Workbox core library to use caching strategies and route handling
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js",
);

// Don't let workbox handle the Firebase messaging service worker
self.skipWaiting();

// Precise cache handling through cache control headers
workbox.core.clientsClaim();

// This will be replaced by Vite PWA with precacheManifest
self.__precacheManifest = [].concat(self.__WB_MANIFEST || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

// Ensure that navigation requests are handled by index.html
// This enables SPA routing (Vue Router) to work properly
workbox.routing.registerRoute(
  ({ request }) => request.mode === "navigate",
  new workbox.strategies.NetworkFirst({
    cacheName: "navigation-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

// Create a custom handler for notification clicks within this service worker
// This ensures compatibility with firebase-messaging-sw.js
self.addEventListener("notificationclick", (event) => {
  // Check if the notification belongs to this service worker
  // If it doesn't contain firebase messaging data, handle it here
  if (!event.notification.data || !event.notification.data.firebase) {
    console.log("[main-sw.js] Handling notification click");

    event.notification.close();

    // Extract target path, defaulting to home
    const targetPath = event.notification.data?.path || "/";
    const formattedPath = targetPath.startsWith("/")
      ? targetPath
      : `/${targetPath}`;
    const urlToOpen = new URL(formattedPath, self.registration.scope).href;

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          // Focus an existing window if available
          for (const client of clientList) {
            if (client.url.includes(urlToOpen) && "focus" in client) {
              return client.focus();
            }
          }

          // Otherwise, open a new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        }),
    );
  }
});
