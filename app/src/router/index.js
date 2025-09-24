import { createWebHistory, createRouter } from "vue-router";
import LoginView from "../pages/LoginView.vue";
import PanelView from "../pages/PanelView.vue";

const routes = [
  { path: "/", component: LoginView },
  { path: "/panel", component: PanelView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _, next) => {
  if (!to.meta.requiresAuth) return next();

  const res = await fetch('/api/auth/keepSession', {
    credentials: "include",
  });

  if (res.ok) {
    next();
  } else {
    next("/");
  }
});

export default router;
