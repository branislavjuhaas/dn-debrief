// Firebase messaging service worker for background notifications
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js",
);

// Firebase configuration
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
    "[firebase-messaging-sw.js] Received background message",
    payload,
  );

  const notificationTitle = payload.notification.title || "Notification";
  const notificationOptions = {
    body: payload.notification.body || "",
    icon: "/icon.svg",
    badge: "/pwa/icon-192x192.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click:", event);

  event.notification.close();

  // Get the path to navigate to
  const targetPath = event.notification.data?.path || "/";

  // Ensure the path starts with a forward slash
  const formattedPath = targetPath.startsWith("/")
    ? targetPath
    : `/${targetPath}`;

  // Get base URL from scope
  const baseUrl = self.registration.scope;
  const urlToOpen = new URL(formattedPath, baseUrl).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check for an existing window with the target URL
        for (const client of clientList) {
          if (client.url.includes(formattedPath) && "focus" in client) {
            return client.focus();
          }
        }

        // Open a new window if needed
        return clients.openWindow(urlToOpen);
      }),
  );
});
