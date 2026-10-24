import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const routes = [
  {
    path: "/",
    component: () => import("../view/Home.vue"),
    meta: {
      requiresAuth: true,
      title: (auth) => `Dashboard SIA | ${auth.fullname}`,
    },
  },
  {
    path: "/aktifitas",
    component: () => import("../view/aktifitas.vue"),
    meta: {
      requiresAuth: true,
      title: (auth) => `Manajemen Aktifitas | ${auth.fullname}`,
    },
  },
  {
    path: "/login",
    component: () => import("../components/LoginModals.vue"),
    meta: { title: "SIA Login" },
  },
  {
    path: "/stok",
    component: () => import("../view/stok.vue"),
    meta: {
      requiresAuth: true,
      title: (auth) => `Manajemen Stok | ${auth.fullname}`,
    },
  },
  {
    path: "/stok/histori",
    component: () => import("../view/histori.vue"),
    meta: {
      requiresAuth: true,
      title: (auth) => `Histori Stok | ${auth.fullname}`,
    },
  },
  {
    path: "/profil",
    component: () => import("../view/profil.vue"),
    meta: {
      requiresAuth: true,
      title: (auth) => `Profil ${auth.fullname}`,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../components/404notFound.vue"),
    meta: { title: "404 Not Found" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;

    return { top: 0, behavior: "smooth" };
  },
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  const auth = useAuthStore();
  const expired = localStorage.getItem("expiredTime");
  if (typeof to.meta.title === "function") {
    document.title = to.meta.title(auth);
  } else {
    document.title = to.meta.title || "SIA";
  }

  if (auth.username && expired) {
    if (Date.now() > Number(expired)) {
      localStorage.removeItem("username");
      localStorage.removeItem("expiredTime");
      next("/");
    }
  }
  if (to.meta.requiresAuth && !auth.username) {
    next("/login");
  }

  next();
});

router.afterEach(() => {
  NProgress.done();
});
export default router;
