import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { title: "Domov" },
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import("./views/Auth.vue"),
    meta: { title: "Prihlásenie" },
  },
  {
    path: "/auth/register",
    name: "Register",
    component: () => import("./views/Register.vue"),
    meta: { title: "Registrácia" },
  },
  {
    path: "/:pathMatch(.*)*", // 404
    name: "404",
    component: () => import("./views/Error.vue"),
    props: { code: 404 },
    meta: { title: "404 Stránka nenájdená" },
  },
];

const router = createRouter({ history: createWebHistory(), routes });

export default router;
