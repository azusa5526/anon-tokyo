import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    auth?: boolean;
  }
}

export const constantRoutes: readonly RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/TheHome.vue'),
    name: 'Home',
  },
  {
    path: '/anime',
    component: () => import('@/pages/TheAnime.vue'),
    name: 'Anime',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior() {
    return { top: 0 }; // always scroll to top
  },
});

export default router;
