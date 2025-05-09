import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./scripts/router.ts";
import "./style.css";
import { createPinia } from "pinia";

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");
