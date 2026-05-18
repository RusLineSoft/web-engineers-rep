<template>
  <header class="app-header">
    <!-- Логотип или заголовок рабочего пространства -->
    <div class="header-left">
      <span class="header-workspace-title">Kanban-board</span>
    </div>

    <!-- Умный поиск по задачам в абсолютном центре -->
    <div class="search-bar">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input type="text" placeholder="Поиск задач..." v-model="kanbanStore.searchQuery" />
    </div>

    <div class="header-right">
      <!-- Группа аватаров участников -->
      <div class="avatar-group">
        <div class="team-avatar" style="background-color: #8b5cf6">В</div>
        <div class="team-avatar" style="background-color: #06b6d4">А</div>
        <div class="team-avatar" style="background-color: #22c55e">И</div>
      </div>

      <!-- Создание задачи -->
      <button v-if="authStore.user?.role === 'admin'" class="create-btn" @click="kanbanStore.isTaskModalOpen = true">
        Создать задачу
      </button>

      <!-- Кнопка уведомлений -->
      <div class="icon-btn" :class="{ 'has-notif': unreadCount > 0 }" @click="isNotifOpen = !isNotifOpen">
        <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <div class="badge" v-if="unreadCount > 0"></div>
        <NotificationCenter :is-open="isNotifOpen" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useKanbanStore } from '~/stores/kanban';
import { useAuthStore } from '~/stores/auth';
import NotificationCenter from '~/widgets/notifications/ui/NotificationCenter.vue';

const kanbanStore = useKanbanStore();
const authStore = useAuthStore();
const unreadCount = computed(() => kanbanStore.tasks.length);
const isNotifOpen = ref(false);
</script>

<style scoped>
.app-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgba(9, 9, 11, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-workspace-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 8px 16px;
  width: 320px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-bar:focus-within {
  width: 380px;
  border-color: var(--accent-primary);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
}

.search-icon {
  width: 14px;
  height: 14px;
  color: var(--text-dim);
}

.search-bar input {
  background: transparent;
  border: none;
  color: var(--text-main);
  outline: none;
  font-size: 0.8rem;
  width: 100%;
}

.search-bar input::placeholder {
  color: var(--text-dim);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  justify-content: flex-end;
}

.avatar-group {
  display: flex;
  align-items: center;
}

.team-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid var(--bg-panel);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  margin-left: -6px;
}

.team-avatar:first-child {
  margin-left: 0;
}

.create-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  border: none;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-btn:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.55);
}

.create-btn:active {
  transform: translateY(0.5px);
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-panel-light);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  position: relative;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.icon-btn:hover {
  color: var(--text-main);
  background: var(--bg-panel);
}

.bell-icon {
  width: 16px;
  height: 16px;
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  background: var(--accent-danger);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-danger);
}
</style>
