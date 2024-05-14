import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

createApp(App).use(router).mount("#app");

/**
 * Firebase configuration object.
 * This object contains all the necessary details to initialize and connect to your Firebase project.
 * Replace these details with your Firebase project's specific details.
 * @type {Object}
 * @property {string} apiKey - Your Firebase API key.
 * @property {string} authDomain - Your Firebase Auth domain.
 * @property {string} databaseURL - The URL to your Firebase database.
 * @property {string} projectId - Your Firebase project ID.
 * @property {string} storageBucket - The name of your Firebase storage bucket.
 * @property {string} messagingSenderId - Your Firebase messaging sender ID.
 * @property {string} appId - Your Firebase app ID.
 * @property {string} measurementId - Your Firebase measurement ID.
 */
const firebaseConfig = {
  apiKey: "AIzaSyCG1YinvyCiYK2ppM6lNDoO1Jw8PXYToDE",
  authDomain: "dn-cascade.firebaseapp.com",
  databaseURL:
    "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dn-cascade",
  storageBucket: "dn-cascade.appspot.com",
  messagingSenderId: "302805903197",
  appId: "1:302805903197:web:2ee45c6fa39d6a8d38eab4",
  measurementId: "G-B8SP329TX6",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
