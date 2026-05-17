import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (authStore.user?.rights !== 1) {
    return navigateTo('/')
  }
})