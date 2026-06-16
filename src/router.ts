import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import DashboardPage from "./pages/DashboardPage.vue";
import UsersPage from "./pages/UsersPage.vue";
import PostsPage from "./pages/PostsPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardPage,
    meta: { title: "Performance Dashboard" },
  },
  {
    path: "/users",
    name: "users",
    component: UsersPage,
    meta: { title: "Users Registry" },
  },
  {
    path: "/posts",
    name: "posts",
    component: PostsPage,
    meta: { title: "Posts Repository" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
