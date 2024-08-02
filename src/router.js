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
    meta: { title: "Prihlásenie", anonymousOnly: true },
  },
  {
    path: "/auth/register",
    name: "Register",
    component: () => import("./views/Register.vue"),
    meta: { title: "Registrácia", anonymousOnly: true },
  },
  {
    path: "/auth/forgot",
    name: "Forgot",
    component: () => import("./views/Forgot.vue"),
    meta: { title: "Obnovenie hesla", anonymousOnly: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("./views/Profile.vue"),
    meta: { title: "Profil", requiresAuth: true },
  },
  {
    path: "/profile/edit",
    name: "Edit",
    component: () => import("./views/Edit.vue"),
    meta: { title: "Zmena hesla", requiresAuth: true },
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("./views/Privacy.vue"),
    meta: { title: "Ochrana osobných údajov" },
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
