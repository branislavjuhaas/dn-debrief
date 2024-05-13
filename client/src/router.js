import { createRouter, createWebHistory} from "vue-router";
import Home from "./views/Home.vue";
import Error from "./views/Error.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: Error,
        props: { code: 404 },
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;