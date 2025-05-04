// Firebase messaging service worker for background notifications
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js",
);

// Firebase configuration matching your main.js
firebase.initializeApp({
  apiKey: "AIzaSyCG1YinvyCiYK2ppM6lNDoO1Jw8PXYToDE",
  authDomain: "dn-cascade.firebaseapp.com",
  databaseURL:
    "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dn-cascade",
  storageBucket: "dn-cascade.appspot.com",
  messagingSenderId: "302805903197",
  appId: "1:302805903197:web:96d3607464b5d0ce38eab4",
  measurementId: "G-8WDZKR0VPT",
});

// Initialize Firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification.title || "Notification";
  const notificationOptions = {
    body: payload.notification.body || "",
    icon: "/icon.svg",
    badge: "/pwa/icon-192x192.png",
    tag: payload.data?.tag || "default-tag", // Group similar notifications
    renotify: true, // Notify even if using the same tag
    actions: [],
    // Android specific properties
    requireInteraction: true, // Keep the notification until user interacts with it
    // Pass both the direct path and any data from the payload
    data: {
      url: payload.data?.path || "/",
      ...payload.data,
    },
  };

  // Check if we need to add actions
  if (payload.data?.actionText && payload.data?.actionPath) {
    notificationOptions.actions = [
      {
        action: "open-action",
        title: payload.data.actionText,
      },
    ];
  }

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle messages from the main app (foreground notifications)
self.addEventListener("message", (event) => {
  console.log(
    "[firebase-messaging-sw.js] Message received from main script:",
    event.data,
  );

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data.payload;

    // Use the service worker's showNotification method
    self.registration
      .showNotification(title, options)
      .then(() =>
        console.log(
          "[firebase-messaging-sw.js] Notification shown successfully",
        ),
      )
      .catch((error) =>
        console.error(
          "[firebase-messaging-sw.js] Error showing notification:",
          error,
        ),
      );
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click: ", event);

  event.notification.close();

  // Check if a specific action was clicked
  let targetPath = "/";
  if (event.action === "open-action" && event.notification.data?.actionPath) {
    targetPath = event.notification.data.actionPath;
  } else {
    // Use the standard path if no specific action was clicked
    targetPath =
      event.notification.data?.url || event.notification.data?.path || "/";
  }

  // Ensure the path starts with a forward slash
  const formattedPath = targetPath.startsWith("/")
    ? targetPath
    : `/${targetPath}`;

  // Extract the base URL from current scope
  const baseUrl = self.registration.scope;

  // Create the full URL to navigate to
  const urlToOpen = new URL(formattedPath, baseUrl).href;

  console.log("[firebase-messaging-sw.js] Opening URL: ", urlToOpen);

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        const matchingClient = clientList.find(
          (client) =>
            // If the client URL starts with our base URL and contains our path
            client.url.startsWith(baseUrl) &&
            // Either we want the root path and the client is at the base URL with no path
            ((formattedPath === "/" && new URL(client.url).pathname === "/") ||
              // Or the client URL contains our target path
              (formattedPath !== "/" && client.url.includes(formattedPath))),
        );

        // If we found a matching client, focus it
        if (matchingClient && "focus" in matchingClient) {
          return matchingClient.focus();
        }

        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Self claim the service worker to ensure it's activated immediately
self.addEventListener("install", function (event) {
  console.log("[firebase-messaging-sw.js] Service worker installed");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  console.log("[firebase-messaging-sw.js] Service worker activated");
  event.waitUntil(self.clients.claim());
});
