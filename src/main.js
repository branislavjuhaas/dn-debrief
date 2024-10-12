import { getAnalytics } from "firebase/analytics";
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
export const analytics = getAnalytics(app);
