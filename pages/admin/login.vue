<template>
  <div class="admin-login-container">
    <div class="glass-card login-card">
      <div class="login-header">
        <h2>Вход в панель управления</h2>
        <p>Доступ только для администраторов и разработчиков</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Секретный ключ (Email)</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="example@admin.com" 
            required 
            class="glass-input" 
          />
        </div>

        <div class="form-group">
          <label>Пароль</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            class="glass-input" 
          />
        </div>

        <button type="submit" class="glass-btn primary">
          Войти в панель управления
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from '#app';

const email = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = () => {
  // Имитация авторизации для демонстрации
  if (email.value && password.value) {
    router.push('/admin');
  }
};
</script>

<style scoped>
.admin-login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: radial-gradient(circle at center, #1e1b4b 0%, #09090b 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
  background-color: rgba(36, 40, 50, 1);
  background-image: linear-gradient(
    139deg,
    rgba(36, 40, 50, 1) 0%,
    rgba(36, 40, 50, 1) 0%,
    rgba(37, 28, 40, 1) 100%
  );
  border: 1px solid #27282f;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 0.9rem;
  color: var(--text-muted, #a1a1aa);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e4e4e7;
}

.glass-input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 14px 16px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
}

.glass-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.25);
  background: rgba(255, 255, 255, 0.05);
}

.glass-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.glass-btn.primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

.glass-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(139, 92, 246, 0.4);
}
</style>

<!--
Страница входа в админ-панель. Полностью изолирована от клиента. 
Спроектирована в темном стекломорфизме с размытием заднего плана и неоновым свечением при фокусе.
-->
