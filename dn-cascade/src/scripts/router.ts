import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";
import platform from "./platform.ts";

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = `${platform.name} - ${to.meta.title}`;
});
