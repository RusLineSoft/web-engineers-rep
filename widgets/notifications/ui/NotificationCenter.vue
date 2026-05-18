<template>
  <div class="notifications-dropdown glass-panel" v-if="isOpen">
    <div class="dropdown-header">
      <h3>Уведомления</h3>
      <button class="text-btn" @click.stop="clearNotifications">Прочитать все</button>
    </div>
    <div class="notifications-list">
      <div v-for="notif in mockNotifications" :key="notif.id" class="notif-item">
        <div class="notif-icon">{{ notif.type === 'update' ? '🔄' : '💬' }}</div>
        <div class="notif-body">
          <p class="notif-text">{{ notif.text }}</p>
          <span class="notif-time">{{ notif.time }}</span>
        </div>
      </div>
      <div v-if="mockNotifications.length === 0" class="empty-state">
        Нет новых уведомлений
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useKanbanStore } from '~/stores/kanban';

const props = defineProps({
  isOpen: Boolean
});

const kanbanStore = useKanbanStore();

const mockNotifications = [
  { id: 1, text: 'Задача обновлена', type: 'update', time: '2 мин. назад' },
  { id: 2, text: 'Новый комментарий', type: 'comment', time: '1 ч. назад' }
];

const clearNotifications = () => {
  // Логика очистки
};
</script>

<style scoped>
.notifications-dropdown {
  position: absolute;
  top: 70px;
  right: 0;
  width: 320px;
  max-height: 480px;
  z-index: 9999;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  background: rgba(15, 15, 20, 0.95);
  backdrop-filter: blur(30px);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 12px;
}

.dropdown-header h3 { margin: 0; font-size: 1.1rem; font-weight: 800; }

.text-btn {
  background: none;
  border: none;
  color: var(--accent-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: var(--transition-fast);
}

.text-btn:hover { background: rgba(0, 229, 255, 0.1); }

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
}

.notif-item {
  display: flex;
  gap: 14px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: var(--transition-normal);
}

.notif-item:hover { 
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(157, 0, 255, 0.3);
  transform: scale(1.02);
}

.notif-icon { 
  font-size: 1.4rem; 
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
}

.notif-body { display: flex; flex-direction: column; gap: 2px; }

.notif-text { margin: 0; font-size: 0.9rem; font-weight: 600; color: var(--text-main); }

.notif-time { font-size: 0.75rem; color: var(--text-dim); }

.empty-state { text-align: center; color: var(--text-dim); padding: 40px 20px; font-size: 0.9rem; }
</style>
