import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    isAuthenticated: false, 
  }),
  actions: {
    login(userData:any) {
      this.user = userData; 
      this.isAuthenticated = true;
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
    },
    checkAuth() {
      if (this.isAuthenticated) {
        return true;
      } else {
        return false;
      }
    },
  },
  persist: true
});