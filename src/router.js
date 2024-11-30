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
    path: "/profile/:uid",
    name: "User",
    component: () => import("./views/management/User.vue"),
    meta: { title: "Profil používateľa", requiresAuth: true },
  },
  {
    path: "/join",
    name: "Join",
    component: () => import("./views/user/Join.vue"),
    meta: { title: "Registrácia do SDA", requiresAuth: true },
  },
  {
    path: "/join/verify",
    name: "Verify",
    component: () => import("./views/user/Verify.vue"),
    meta: { title: "Overenie účtu" },
  },
  {
    path: "/manage",
    name: "Manage",
    component: () => import("./views/management/Manage.vue"),
    meta: { title: "Panel správy", requiresAuth: true },
  },
  {
    path: "/manage/users",
    name: "Users",
    component: () => import("./views/management/Users.vue"),
    props: { filter: false },
    meta: {
      title: "Správa používateľov",
      requiresAuth: true,
      roles: ["developer", "admin", "cap"],
    },
  },
  {
    path: "/manage/clubs/:filter",
    name: "UsersFilter",
    component: () => import("./views/management/Users.vue"),
    props: { filter: true },
    meta: {
      title: "Správa používateľov",
      requiresAuth: true,
      roles: ["developer", "admin", "cap", "coach"],
    },
  },
  {
    path: "/manage/clubs",
    name: "Clubs",
    component: () => import("./views/management/Clubs.vue"),
    meta: {
      title: "Správa klubov",
      requiresAuth: true,
      roles: ["developer", "admin", "cap"],
    },
  },
  {
    path: "/manage/route",
    name: "Route",
    component: () => import("./views/management/RouteManager.vue"),
    meta: {
      title: "Presmerovanie na stránku",
      requiresAuth: true,
      roles: ["developer"],
    },
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () => import("./views/Privacy.vue"),
    meta: { title: "Ochrana osobných údajov" },
  },
  {
    path: "/message",
    name: "Message",
    component: () => import("./views/Message.vue"),
    meta: { title: "Správa" },
  },
  {
    path: "/message/join",
    name: "JoinMessage",
    component: () => import("./views/Message.vue"),
    props: {
      title: "Potvrdenie registrácie do SDA",
      message:
        "Ďakujeme za registráciu do SDA. Prosím, over svoju registráciu použitím odkazu, ktorý sme poslali na tvoj e-mail alebo e-mail tvojho zákonného zástupcu. Ak si tento e-mail neobdržal, skontroluj priečinok s nevyžiadanou poštou. Pre pokračovanie zvoľ pre teba relevantnú možnosť platby!",
      buttons: [
        {
          text: "Som člen JDL SDA",
          path: "/pay?subject=Registracia&subacc=registráciu%20do%20SDA&amount=20",
        },
        {
          text: "Som nový člen SDA",
          path: "/pay?subject=Registracia&subacc=registráciu%20do%20SDA&amount=8",
        },
        {
          text: "Predlžujem svoje členstvo v SDA",
          path: "/pay?subject=Registracia&subacc=registráciu%20do%20SDA&amount=5",
        },
        { text: "Platbu riešim na klube", path: "/" },
      ],
    },
    meta: { title: "Správa" },
  },
  {
    path: "/pay",
    name: "Pay",
    component: () => import("./views/Pay.vue"),
    meta: { title: "Platba" },
  },
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: () => import("./views/Error.vue"),
    props: { code: 401 },
    meta: { title: "401 Neautorizovaný prístup" },
  },
  {
    path: "/about",
    name: "About",
    component: () => import("./views/About.vue"),
    meta: { title: "O systéme" },
  },
  {
    path: "/juhaas",
    redirect: (to) => {
      window.location.href = "https://juhaas.eu";
      return { name: "Home" };
    },
  },
  {
    path: "/manage/terminal",
    name: "Terminal",
    component: () => import("./views/management/Terminal.vue"),
    meta: {
      title: "Console",
      requiresAuth: true,
      roles: ["developer"],
    },
  },
  {
    path: "/manage/messages",
    name: "Messages",
    component: () => import("./views/management/Messages.vue"),
    meta: {
      title: "Správa obsahu",
      requiresAuth: true,
      roles: ["developer", "admin"],
    },
  },
  {
    path: "/awards",
    name: "Awards",
    component: () => import("./views/Awards.vue"),
    meta: { title: "Prehľad ocenení", requiresAuth: true },
  },
  {
    path: "/awards/:id",
    name: "Award",
    component: () => import("./views/Award.vue"),
    meta: { title: "Detail ocenenia", requiresAuth: true },
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
