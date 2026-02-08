import { useAuthStore } from "@/stores/auth.store";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/map",
    name: "Map",
    component: () => import("@/views/MapView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/AuthView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isFullyAuthed) {
    return { path: "/" };
  }
});

export default router;
