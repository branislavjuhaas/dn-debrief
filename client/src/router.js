import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Error from "./views/Error.vue";
import Auth from "./views/Auth.vue";
import Create from "./views/Create.vue";
import User from "./views/User.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/users/auth",
    name: "Auth",
    component: Auth,
  },
  {
    path: "/users/create",
    name: "Create",
    component: Create,
  },
  {
    path: "/users/:id",
    name: "User",
    component: User,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: Error,
    props: { code: 404 },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
