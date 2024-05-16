import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./firebase";

createApp(App).use(router).use(pinia).mount("#app");
