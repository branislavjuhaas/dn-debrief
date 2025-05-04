import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFunctions } from "firebase/functions";
import vue3GoogleLogin from "vue3-google-login";
import { initializeApp } from "firebase/app";
import { createPinia } from "pinia";
import router from "./router.js";
import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

/**
 * Firebase configuration object.
 * @type {Object}
 */
const firebaseConfig = {
  apiKey: "AIzaSyCG1YinvyCiYK2ppM6lNDoO1Jw8PXYToDE",
  authDomain: "dn-cascade.firebaseapp.com",
  databaseURL:
    "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dn-cascade",
  storageBucket: "dn-cascade.appspot.com",
  messagingSenderId: "302805903197",
  appId: "1:302805903197:web:96d3607464b5d0ce38eab4",
  measurementId: "G-8WDZKR0VPT",
};

/**
 * Initialize Firebase with the provided configuration.
 * @type {Object}
 */
const app = initializeApp(firebaseConfig);

// Create a new Pinia store
const pinia = createPinia();

// Create a new Vue app with the router, Pinia store, and Google Login plugin
createApp(App)
  .use(router)
  .use(pinia)
  .use(vue3GoogleLogin, {
    clientId:
      "302805903197-g4r9lvu6dc7qdhcacgvgm53sgjqarr1d.apps.googleusercontent.com",
  })
  .mount("#app");

/**
 * Get Firebase Functions instance and export it.
 * @type {Object}
 */
export const functions = getFunctions(app);

// Get Firebase Analytics instance
export let analytics = null;

/**
 * Initialize Firebase Analytics if it is not already initialized.
 * This function checks if the analytics instance is null and initializes it if so.
 *
 * @function initializeAnalytics
 * @returns {void}
 */
export const initializeAnalytics = () => {
  console.log("Initializing analytics");
  if (!analytics) {
    analytics = getAnalytics(app);
  }
};

// if there is a cookie cookies=true then initialize analytics
if (document.cookie.includes("cookies=true")) {
  initializeAnalytics();
}

/**
 * Initializes Firestore with a persistent local cache.
 *
 * This function dynamically imports the necessary Firestore functions and initializes Firestore
 * with a persistent local cache.
 *
 * @async
 * @function firestoreInitialize
 * @returns {Promise<void>}
 */
const initCaching = async () => {
  const { initializeFirestore, persistentLocalCache } = await import(
    "firebase/firestore"
  );

  // Initialize Firestore with a persistent local cache
  initializeFirestore(app, { localCache: persistentLocalCache({}) });
};

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Letq2oqAAAAAChut_Xa1Xg9AHu_n76VKWt9cTlo"),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true,
});

initCaching();

// Get Firebase Cloud Messaging instance
const messaging = getMessaging(app);

/**
 * Initialize Firebase Cloud Messaging and request permission for notifications.
 * This function handles the entire notification setup process.
 *
 * @async
 * @function initializeMessaging
 * @returns {Promise<void>}
 */
export const initializeMessaging = async () => {
  try {
    // Check if service workers are supported
    if ("serviceWorker" in navigator) {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("Notification permission granted.");

        // Register the service worker
        const swRegistration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          {
            scope: "/",
          },
        );

        console.log("Service worker registered for notifications");

        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;

        // Get previously stored token
        const previousToken = localStorage.getItem("fcmToken");

        // Get FCM token
        const currentToken = await getToken(messaging, {
          vapidKey:
            "BJyctsnZOxfHeEpUPtuIrUjxICEnb9u3vXq9sFCjzFmMIRqy337vB4rWrXvBpS5zl_y8ZAjoRj1V3KdntgQEMws",
          serviceWorkerRegistration: swRegistration,
        });

        if (currentToken) {
          console.log("FCM token:", currentToken);

          // Only save token if it's new or changed
          if (currentToken !== previousToken) {
            console.log("New FCM token generated");
            saveTokenToServer(currentToken);
            localStorage.setItem("fcmToken", currentToken);
          } else {
            console.log("Using existing FCM token");
          }
        } else {
          console.log(
            "No registration token available. Request permission to generate one.",
          );
        }

        // Handle foreground messages with path navigation support
        onMessage(messaging, (payload) => {
          console.log("Message received in foreground:", payload);

          // Create notification for foreground messages
          if (payload.notification) {
            const { title, body } = payload.notification;

            if (!("Notification" in window)) {
              console.log("This browser does not support desktop notification");
              return;
            }

            // IMPORTANT: Use the service worker to show notifications, especially for Android
            if (navigator.serviceWorker.controller) {
              // If we have an active service worker, use it to show the notification
              // This is the proper approach for Android
              const path = payload.data?.path || "/";

              // Send a message to the service worker to show the notification
              navigator.serviceWorker.controller.postMessage({
                type: "SHOW_NOTIFICATION",
                payload: {
                  title: title,
                  options: {
                    body: body,
                    icon: "/icon.svg",
                    badge: "/pwa/icon-192x192.png",
                    tag: payload.data?.tag || "default-tag", // For notification grouping
                    data: {
                      url: path,
                      ...payload.data,
                    },
                  },
                },
              });
            } else {
              // Fallback for browsers where we can use the Notification constructor
              // This won't work on Android when in service worker context
              try {
                // Create a notification that will navigate when clicked
                const notification = new Notification(title, {
                  body: body,
                  icon: "/icon.svg",
                  data: payload.data || {},
                });

                // Handle click on the notification
                notification.onclick = () => {
                  notification.close();

                  // Use router to navigate to the specified path if available
                  const path = payload.data?.path || "/";
                  const formattedPath = path.startsWith("/")
                    ? path
                    : `/${path}`;

                  // Focus window if it's not in focus
                  window.focus();

                  // Use router to navigate
                  if (typeof router !== "undefined" && router.push) {
                    router.push(formattedPath);
                  } else {
                    // Fallback to direct navigation
                    window.location.href = formattedPath;
                  }
                };
              } catch (notificationError) {
                console.error("Error showing notification:", notificationError);
              }
            }
          }
        });
      } else {
        console.log("Unable to get permission to notify.");
      }
    } else {
      console.log("Service workers are not supported by this browser");
    }
  } catch (error) {
    console.error("Error initializing messaging:", error);
  }
};

// Optional test function to verify notifications are working
function testNotification() {
  if (Notification.permission === "granted") {
    new Notification("Test Notification", {
      body: "This is a test notification to verify notifications are working",
      icon: "/icon.svg",
    });
  }
}

/**
 * Saves the FCM token to the server.
 * You can implement this to store the token in your database.
 *
 * @async
 * @function saveTokenToServer
 * @param {string} token - The FCM token
 * @returns {Promise<void>}
 */
const saveTokenToServer = async (token) => {
  const { saveTokenToServer } = await import("./firebase/auth.js");
  try {
    await saveTokenToServer(token);
    console.log("Token saved to server successfully.");
  } catch (error) {
    console.error("Error saving token to server:", error);
  }
};

// Initialize messaging when the application loads
initializeMessaging();

testNotification();
