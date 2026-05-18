import { useAuthStore } from '~/stores/auth';

/**
 * Глобальный middleware авторизации для защиты маршрутов.
 * Автоматически перенаправляет неавторизованных пользователей на страницу входа
 * и предотвращает доступ авторизованных пользователей к странице логина.
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // Если пользователь не авторизован и пытается перейти на любой защищенный маршрут (кроме /login)
  if (!authStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }

  // Если пользователь уже авторизован и пытается перейти на страницу авторизации (/login)
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/');
  }
});
