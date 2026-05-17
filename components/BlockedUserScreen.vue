<template>
  <div class="blocked-page">
    <div class="card">
      <div class="icon">
        !
      </div>

      <h1>Аккаунт заблокирован</h1>

      <p>
        Ваш аккаунт был заблокирован администратором.
        Вы можете войти в систему, но доступ к рабочей доске ограничен.
      </p>

      <button type="button" @click="logout">
        Выйти из аккаунта
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  navigateTo('/login')
}
</script>

<style scoped>
.blocked-page {
  width: 100%;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 36%),
    radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.16), transparent 40%),
    #080b12;
  box-sizing: border-box;
}

.card {
  width: 100%;
  max-width: 520px;
  padding: 34px;
  border-radius: 28px;
  background: rgba(15, 15, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  text-align: center;
  color: #fff;
}

.icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.18);
  color: #fecaca;
  font-size: 42px;
  font-weight: 900;
}

h1 {
  margin: 0 0 12px;
  font-size: 30px;
}

p {
  margin: 0 0 24px;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.55;
}

button {
  border: 0;
  border-radius: 14px;
  padding: 12px 18px;
  color: #fff;
  background: #ef4444;
  cursor: pointer;
  font-weight: 800;
}
</style>