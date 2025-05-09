import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./scripts/router.ts";
import "./style.css";

createApp(App).use(router).mount("#app");
