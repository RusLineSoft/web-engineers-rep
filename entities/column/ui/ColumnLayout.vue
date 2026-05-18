<template>
  <div 
    class="column-layout"
    :class="{ 'wip-limit-exceeded': isWipExceeded }"
    @dragover.prevent
    @drop="onDrop"
  >
    <!-- Заголовок колонки по референсу Hologram -->
    <div class="column-header">
      <div class="header-main">
        <span class="status-indicator" :class="circleClass">
          <!-- Галочка для готовых задач -->
          <svg v-if="circleClass === 'circle-done'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="check-svg">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <h3 class="column-title">{{ column.title }}</h3>
        <span class="task-count">{{ tasks.length }}</span>
      </div>
      
      <!-- Умная кнопка быстрого добавления новой задачи -->
      <button v-if="kanbanStore.canCreateOrDeleteTasks" class="quick-add-btn" @click="openCreateModal">+</button>
    </div>

    <!-- Список задач -->
    <div class="column-tasks">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useKanbanStore } from '~/stores/kanban';

const props = defineProps({
  column: { type: Object as any, required: true },
  tasks: { type: Array as any, default: () => [] }
});

const emit = defineEmits(['drop-task']);
const kanbanStore = useKanbanStore();

// Логика индикатора статуса по референсу Hologram
const circleClass = computed(() => {
  const t = props.column.title.toLowerCase();
  if (t.includes('бэклог')) return 'circle-backlog';
  if (t.includes('выполнению')) return 'circle-todo';
  if (t.includes('работе')) return 'circle-work';
  if (t.includes('ревью')) return 'circle-review';
  if (t.includes('готово')) return 'circle-done';
  return 'circle-default';
});

// Логика лимита задач в работе (WIP Limit)
const wipLimit = computed(() => {
  if (props.column.title.toLowerCase().includes('progress') || props.column.title.toLowerCase() === 'в работе') {
    return 5;
  }
  return null;
});

const isWipExceeded = computed(() => wipLimit.value !== null && props.tasks.length > wipLimit.value);

const onDrop = (event: DragEvent) => {
  const taskId = event.dataTransfer?.getData('taskId');
  if (taskId) {
    emit('drop-task', taskId, props.column._id);
  }
};

const openCreateModal = () => {
  kanbanStore.isTaskModalOpen = true;
};
</script>

<style scoped>
.column-layout {
  min-width: 300px;
  flex: 1;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 12px;
  background-color: #0c0c0e;
  border-radius: 12px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Стилизация индикаторов кругов по референсу */
.circle-backlog {
  border: 2px solid #52525b;
}

.circle-todo {
  border: 2px solid #f59e0b;
}

.circle-work {
  border: 2px solid #06b6d4;
  background: rgba(6, 180, 212, 0.2);
}

.circle-review {
  border: 2px solid #a855f7;
  background: rgba(168, 85, 247, 0.2);
}

.circle-done {
  background: #22c55e;
  border: 2px solid #22c55e;
  color: white;
}

.circle-default {
  border: 2px solid #71717a;
}

.check-svg {
  width: 9px;
  height: 9px;
}

.column-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #f4f4f5;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.task-count {
  font-size: 0.75rem;
  font-weight: 700;
  background: #18181b;
  color: #71717a;
  padding: 2px 6px;
  border-radius: 10px;
}

.quick-add-btn {
  background: transparent;
  border: none;
  color: #52525b;
  font-size: 1.2rem;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s ease;
}

.quick-add-btn:hover {
  color: #f4f4f5;
}

.column-tasks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
}

/* Стили WIP лимита */
.wip-limit-exceeded {
  border: 1px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.05);
}
</style>
