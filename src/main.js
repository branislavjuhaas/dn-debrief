import { createApp } from "vue";
import { createPinia } from "pinia";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import "./style.css";
import App from "./App.vue";
import router from "./router.js";
import vue3GoogleLogin from "vue3-google-login";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(pinia)
  .use(vue3GoogleLogin, {
    clientId:
      "302805903197-g4r9lvu6dc7qdhcacgvgm53sgjqarr1d.apps.googleusercontent.com",
  })
  .mount("#app");

export const functions = getFunctions(app);
