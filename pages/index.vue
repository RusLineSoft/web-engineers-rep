<script setup>
import { useAuthStore } from '@/stores/auth';
import { ref, onMounted, onUnmounted, watch } from 'vue';

let authStore = useAuthStore();

definePageMeta({
  middleware: ["auth"]
})

useHead({
    title: 'Канбан-доска // Web Engineers',
    meta: [
        { 
            name: 'description', 
            content: 'Страница авторизации для сотрудников компании' 
        },
    ],
});

const taskCount = ref(null);
const notificationCount = ref(null);

let ws = null;

const connectWebSocket = () => {
  if (!authStore.isAuthenticated || !authStore.user?.userId) {
    console.warn('Невозможно подключиться к WebSocket: пользователь не аутентифицирован или нет ID.');
    return;
  }

  ws = new WebSocket('ws://localhost:8080/ws?userId=${authStore.user.userId}'); 

  ws.onopen = () => {
    console.log('WebSocket-соединение установлено.');
  };
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'initialData' || data.type === 'update') {
      taskCount.value = data.tasks;
      notificationCount.value = data.notifications;
    }
  };

  ws.onerror = (error) => {
    console.error('Ошибка WebSocket:', error);
  };

  ws.onclose = (event) => {
    console.log('WebSocket-соединение закрыто:', event.code, event.reason);
    if (!event.wasClean) {
      console.log('Попытка переподключения через 3 секунды...');
      setTimeout(connectWebSocket, 3000); 
    }
  };
};

const disconnectWebSocket = () => {
  if (ws) {
    ws.close(1000, 'Component unmounted');
    ws = null;
  }
};

onMounted(() => {
  connectWebSocket(); 
});

onUnmounted(() => {
  disconnectWebSocket();
});

watch(() => authStore.isAuthenticated, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    disconnectWebSocket();
    connectWebSocket();
  } else if (!newVal && oldVal) {
    disconnectWebSocket();
    taskCount.value = null;
    notificationCount.value = null;
  }
}, { immediate: true });

const handleLogout = () => {
    authStore.logout();
    navigateTo('/login');
};
</script>

<template>
  <aside class="sidebar">

    <div class="profile-card">
      <div class="avatar-wrapper">
        <img :src="authStore.user?.avatar || 'https://via.placeholder.com/64'" alt="Avatar" class="avatar">
        <div class="status-indicator" :class="{'online': authStore.isAuthenticated}"></div>
      </div>
      <div class="profile-info">
        <h2 class="username">{{ authStore.user?.username || 'Гость' }}</h2>
        <span class="rank-badge">{{ authStore.user?.rank || 'Новичок' }}</span>
      </div>
      <button @click="handleLogout" class="logout-btn-profile" title="Выйти из аккаунта">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
      </button>
    </div>

    <nav class="menu">
      <button class="menu-item active">
        <div class="menu-item-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
          <span>Мои задачи</span>
        </div>
        <span v-if="taskCount !== null" class="count-badge">{{ taskCount }}</span>
        <span v-else class="count-badge loading">...</span>
      </button>

      <button class="menu-item">
        <div class="menu-item-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span>Лента событий</span>
        </div>
      </button>

      <button class="menu-item">
        <div class="menu-item-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span>Уведомления</span>
        </div>
        <span v-if="notificationCount !== null" class="count-badge notify">{{ notificationCount }}</span>
        <span v-else class="count-badge notify loading">...</span>
      </button>
    </nav>

    <div class="sidebar-footer">
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  height: 100vh;
  width: 300px;
  background-color: #0f0f12;
  color: #efeff1;
  display: flex;
  flex-direction: column;
  padding: 32px 20px;
  border-right: 1px solid #2d2d35;
  font-family: 'Inter', sans-serif;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 40px;
  transition: transform 0.2s;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b82f6;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2px solid #0f0f12;
  border-radius: 50%;
}

.username {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-badge {
  font-size: 12px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 20px;
}

.logout-btn-profile {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: color 0.2s, background-color 0.2s;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn-profile:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.2);
}

.logout-btn-profile svg {
  display: block;
}

/* Меню */
.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.menu-item.active {
  background: #3b82f6;
  color: #fff;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.count-badge {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 8px;
  color: #fff;
}

.count-badge.notify {
  background: #ef4444;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #2d2d35;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  background: transparent;
  border: 1px solid #3f3f46;
  border-radius: 12px;
  color: #f4f4f5;
  cursor: pointer;
  transition: 0.3s;
}

.logout-btn:hover {
  background: #ef4444;
  border-color: #ef4444;
}
</style>