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
 * Simple FCM initialization
 * - Checks for permission only once
 * - Registers the service worker
 * - Gets an FCM token
 * - No database storage
 */
export const initializeMessaging = async () => {
  // Skip if notifications or service workers are not supported
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    console.log("Notifications or service workers not supported");
    return;
  }

  try {
    // Register service worker first
    const swReg = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );
    console.log("Service worker registered successfully");

    // Request permission only if not already granted or denied
    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);
    }

    // Only proceed if permission is granted
    if (Notification.permission === "granted") {
      try {
        // Get FCM token (but don't store it)
        const token = await getToken(messaging, {
          vapidKey:
            "BJyctsnZOxfHeEpUPtuIrUjxICEnb9u3vXq9sFCjzFmMIRqy337vB4rWrXvBpS5zl_y8ZAjoRj1V3KdntgQEMws",
          serviceWorkerRegistration: swReg,
        });

        if (token) {
          console.log("FCM token received successfully");
        } else {
          console.log("No FCM token received");
        }
      } catch (error) {
        console.error("Error getting FCM token:", error);
      }
    }
  } catch (error) {
    console.error("Error setting up notifications:", error);
  }
};

// Start the messaging initialization process
initializeMessaging();
