import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./scripts/router.ts";
import "./style.css";
import { createPinia } from "pinia";
import { initializeApp } from "firebase/app";

const pinia = createPinia();

// Your web app's Firebase configuration
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

createApp(App).use(router).use(pinia).mount("#app");
