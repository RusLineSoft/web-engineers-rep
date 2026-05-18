<template>
  <div class="task-card">
    <!-- Шапка карточки по референсу Hologram -->
    <div class="card-header">
      <div class="header-badges">
        <!-- Теги в виде стильных пилюль -->
        <span class="tag-pill" :class="getTagClass(tag)" v-for="tag in task.tags" :key="tag">
          {{ tag }}
        </span>
        <!-- Приоритет в виде индикатора с точкой -->
        <span class="priority-pill" :class="task.priority.toLowerCase()">
          <span class="priority-dot"></span>
          {{ getPriorityLabel(task.priority) }}
        </span>
      </div>
      
      <!-- Системные действия -->
      <button v-if="authStore.user?.role === 'admin'" class="more-btn">•••</button>
    </div>

    <!-- Заголовок и описание задачи -->
    <h3 class="task-title">{{ task.title }}</h3>
    <p class="task-description" v-if="task.description">{{ task.description }}</p>

    <!-- Срок выполнения по референсу (Срок: дата) -->
    <div class="task-due-date" v-if="task.dueDate || task.deadline">
      Срок: {{ formatDate(task.dueDate || task.deadline) }}
    </div>

    <!-- Подвал карточки: Аватары исполнителей слева, статистика справа -->
    <div class="card-footer">
      <div class="avatar-group">
        <div class="assignee-avatar" :class="task.assignee ? 'has-user' : 'no-user'">
          {{ getInitials(task.assignee || 'JD') }}
        </div>
      </div>
      
      <!-- Чеклист прогресс в стиле Hologram -->
      <div class="task-meta" v-if="task.checklist && task.checklist.length > 0">
        <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4" />
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
        <span class="meta-text">
          {{ task.checklist.filter((i: any) => i.isCompleted).length }}/{{ task.checklist.length }}
        </span>
      </div>
    </div>

    <!-- Кнопка "Взять задачу" для роли 'user' в стиле glassmorphism -->
    <button 
      v-if="authStore.user?.role === 'user' && isTodoColumn" 
      @click="takeTask" 
      class="take-task-btn"
    >
      🎯 Взять задачу
    </button>

    <!-- Кнопка "Отказаться" для роли 'user' в стиле glassmorphism (для задач в работе) -->
    <button 
      v-if="authStore.user?.role === 'user' && isInProgressColumn" 
      @click="refuseTask" 
      class="refuse-task-btn"
    >
      ❌ Отказаться
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useKanbanStore } from '~/stores/kanban';

const props = defineProps({
  task: {
    type: Object as any,
    required: true
  }
});

const authStore = useAuthStore();
const kanbanStore = useKanbanStore();

const isTodoColumn = computed(() => {
  const col = typeof props.task.column === 'object' && props.task.column !== null
    ? props.task.column 
    : kanbanStore.columns.find(c => c._id === props.task.column);
  
  console.log('[DEBUG] TaskCard:', props.task.title, 'colRaw:', props.task.column, 'colResolved:', col, 'columnsInStore:', kanbanStore.columns);
  
  if (!col) return false;
  
  const title = col.title.toLowerCase();
  return title.includes('бэклог') || title.includes('к выполнению') || title.includes('todo') || title.includes('to do');
});

const inProgressColumn = computed(() => {
  return kanbanStore.columns.find(c => {
    const title = c.title.toLowerCase();
    return title.includes('в работе') || title.includes('in progress');
  });
});

const isInProgressColumn = computed(() => {
  const col = typeof props.task.column === 'object' && props.task.column !== null
    ? props.task.column 
    : kanbanStore.columns.find(c => c._id === props.task.column);
  
  if (!col) return false;
  
  const title = col.title.toLowerCase();
  return title.includes('в работе') || title.includes('in progress');
});

const takeTask = async (event: MouseEvent) => {
  event.stopPropagation(); // Предотвращаем открытие модального окна деталей задачи
  const targetCol = inProgressColumn.value;
  if (targetCol) {
    await kanbanStore.moveTask(props.task._id, targetCol._id);
  }
};

const refuseTask = async (event: MouseEvent) => {
  event.stopPropagation(); // Предотвращаем открытие деталей
  
  // Ищем колонку "К выполнению" или "Todo"
  const toDoColumn = kanbanStore.columns.find(c => {
    const title = c.title.toLowerCase();
    return title.includes('выполнению') || title.includes('todo') || title.includes('to do');
  });
  
  if (toDoColumn) {
    try {
      await $fetch(`/api/tasks/${props.task._id}`, {
        method: 'PUT',
        body: { 
          column: toDoColumn._id,
          assignee: 'Не назначен'
        }
      });
      await kanbanStore.fetchBoard();
    } catch (err) {
      console.error('Ошибка при отказе от задачи:', err);
    }
  }
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    Low: 'Низкий',
    Medium: 'Средний',
    High: 'Высокий',
    Urgent: 'Срочно'
  };
  return labels[priority] || priority;
};

const getTagClass = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('design') || t.includes('дизайн')) return 'tag-green';
  if (t.includes('daily') || t.includes('арт')) return 'tag-purple';
  if (t.includes('hackathon') || t.includes('хакатон')) return 'tag-cyan';
  return 'tag-orange';
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const months = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
</script>

<style scoped>
.task-card {
  background-color: #18181b;
  border: 1px solid #27272a;
  border-radius: 10px;
  padding: 14px;
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

.task-card:active {
  cursor: grabbing;
}

.task-card:hover {
  border-color: #3f3f46;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.tag-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

/* Расцветки тегов по референсу */
.tag-green {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.tag-purple {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.tag-cyan {
  background: rgba(6, 180, 212, 0.1);
  color: #06b6d4;
}

.tag-orange {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.priority-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #a1a1aa;
  background: #27272a;
  padding: 2px 6px;
  border-radius: 4px;
}

.priority-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #a1a1aa;
}

/* Приоритеты */
.priority-pill.urgent .priority-dot { background: #ef4444; }
.priority-pill.high .priority-dot { background: #f59e0b; }
.priority-pill.medium .priority-dot { background: #06b6d4; }
.priority-pill.low .priority-dot { background: #22c55e; }

.more-btn {
  background: transparent;
  border: none;
  color: #71717a;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
}

.more-btn:hover {
  color: #f4f4f5;
}

.task-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.4;
  color: #f4f4f5;
}

.task-description {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #71717a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-due-date {
  font-size: 0.7rem;
  color: #52525b;
  font-weight: 600;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  border-top: 1px solid #1f1f23;
  padding-top: 8px;
}

.avatar-group {
  display: flex;
  align-items: center;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #18181b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
}

.assignee-avatar.has-user {
  background: #27272a;
  color: #f4f4f5;
}

.assignee-avatar.no-user {
  background: #27272a;
  color: #71717a;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #71717a;
}

.meta-icon {
  width: 12px;
  height: 12px;
}

.meta-text {
  font-size: 0.7rem;
  font-weight: 700;
}
.take-task-btn {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.4) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #93c5fd;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;
  text-align: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.take-task-btn:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.6) 100%);
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.take-task-btn:active {
  transform: translateY(0);
}

.refuse-task-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.4) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  margin-top: 8px;
  text-align: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.refuse-task-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.6) 100%);
  border-color: #ef4444;
  color: white;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.refuse-task-btn:active {
  transform: translateY(0);
}
</style>
