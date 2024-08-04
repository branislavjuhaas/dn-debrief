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
    component: () => import("./views/user/Auth.vue"),
    meta: { title: "Prihlásenie", anonymousOnly: true },
  },
  {
    path: "/auth/register",
    name: "Register",
    component: () => import("./views/user/Register.vue"),
    meta: { title: "Registrácia", anonymousOnly: true },
  },
  {
    path: "/auth/forgot",
    name: "Forgot",
    component: () => import("./views/user/Forgot.vue"),
    meta: { title: "Obnovenie hesla", anonymousOnly: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("./views/user/Profile.vue"),
    meta: { title: "Profil", requiresAuth: true },
  },
  {
    path: "/profile/edit",
    name: "Edit",
    component: () => import("./views/user/Edit.vue"),
    meta: { title: "Zmena hesla", requiresAuth: true },
  },
  {
    path: "/join",
    name: "Join",
    component: () => import("./views/user/Join.vue"),
    meta: { title: "Registrácia do SDA", requiresAuth: true },
  },
  {
    path: "/manage",
    name: "Manage",
    component: () => import("./views/management/Manage.vue"),
    meta: { title: "Panel správy", requiresAuth: true },
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("./views/Privacy.vue"),
    meta: { title: "Ochrana osobných údajov" },
  },
  {
    path: "/pay",
    name: "Pay",
    component: () => import("./views/Pay.vue"),
    meta: { title: "Platba" },
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
