<template>
  <UiModal :model-value="!!task" @update:model-value="handleClose" :title="task?.title || 'Детали задачи'">
    <div v-if="task" class="task-details">
      <!-- Статус и приоритет -->
      <div class="details-grid">
        <div class="details-section">
          <label>Статус</label>
          <div class="status-badge glass-panel">{{ currentColumnName }}</div>
        </div>
        <div class="details-section">
          <label>Приоритет</label>
          <div class="priority-pill" :class="task.priority.toLowerCase()">
            {{ getPriorityLabel(task.priority) }}
          </div>
        </div>
      </div>

      <!-- ОПИСАНИЕ -->
      <div class="details-section">
        <label>Описание</label>
        <div class="description-text">
          {{ task.description || 'Описание отсутствует.' }}
        </div>
      </div>

      <!-- ЧЕКЛИСТ (ПОДЗАДАЧИ) -->
      <div class="details-section">
        <label>Чеклист</label>
        <div class="checklist-container">
          <div v-for="(item, idx) in task.checklist" :key="idx" class="checklist-item">
            <input type="checkbox" :checked="item.isCompleted" @change="toggleChecklistItem(idx)" />
            <span :class="{ completed: item.isCompleted }">{{ item.title }}</span>
          </div>
          <!-- Добавление подзадач разрешено только администратору -->
          <div v-if="authStore.user?.role === 'admin'" class="add-checklist-item">
            <input v-model="newItemTitle" type="text" placeholder="Добавить подзадачу..." @keyup.enter="addChecklistItem" class="glass-input small" />
          </div>
        </div>
      </div>

      <!-- ИСПОЛНИТЕЛЬ И ДАТЫ -->
      <div class="details-grid">
        <div class="details-section">
          <label>Исполнитель</label>
          <div class="assignee-info">
            <div class="avatar small">{{ task.assignee?.charAt(0) || '?' }}</div>
            <span>{{ task.assignee || 'Не назначен' }}</span>
          </div>
        </div>
        <div class="details-section">
          <label>Создано</label>
          <div class="date-text">{{ formatDate(task.createdAt) }}</div>
        </div>
      </div>

      <div class="details-footer">
        <!-- Удаление доступно только администратору -->
        <UiButton v-if="authStore.user?.role === 'admin'" variant="secondary" @click="handleDelete" class="delete-btn">
          Удалить задачу
        </UiButton>
        <UiButton @click="handleClose">
          Закрыть
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import UiModal from '~/shared/ui/UiModal.vue';
import UiButton from '~/shared/ui/UiButton.vue';
import { useKanbanStore } from '~/stores/kanban';
import { useAuthStore } from '~/stores/auth';
import { useSounds } from '~/shared/lib/useSounds';

const props = defineProps({
  task: { type: Object as any, default: null }
});

const emit = defineEmits(['close', 'deleted']);
const kanbanStore = useKanbanStore();
const authStore = useAuthStore();
const sounds = useSounds();

const newItemTitle = ref('');

const currentColumnName = computed(() => {
  if (!props.task) return '';
  const colId = typeof props.task.column === 'object' ? props.task.column._id : props.task.column;
  const col = kanbanStore.columns.find(c => c._id === colId);
  return col?.title || 'Unknown';
});

const formatDate = (date: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleString();
};

const handleClose = () => {
  sounds.play('click');
  emit('close');
};

/**
 * Управление чеклистом
 */
const toggleChecklistItem = async (index: number) => {
  const updatedChecklist = [...(props.task.checklist || [])];
  updatedChecklist[index].isCompleted = !updatedChecklist[index].isCompleted;
  
  if (updatedChecklist[index].isCompleted) sounds.play('success');
  else sounds.play('click');

  await updateTask({ checklist: updatedChecklist });
};

const addChecklistItem = async () => {
  if (!newItemTitle.value.trim()) return;
  
  const updatedChecklist = [...(props.task.checklist || [])];
  updatedChecklist.push({ title: newItemTitle.value, isCompleted: false });
  
  sounds.play('click');
  newItemTitle.value = '';
  await updateTask({ checklist: updatedChecklist });
};

const getPriorityLabel = (priority: string) => {
  const priMap: Record<string, string> = {
    Low: 'Низкий',
    Medium: 'Средний',
    High: 'Высокий',
    Urgent: 'Срочно'
  };
  return priMap[priority] || priority;
};

const updateTask = async (data: any) => {
  try {
    const updated = await $fetch<any>(`/api/tasks/${props.task._id}`, {
      method: 'PUT',
      body: data
    });
    // Локальное обновление в хранилище для мгновенного отклика (оффлайн-фоллбэк)
    const idx = kanbanStore.tasks.findIndex(t => t._id === updated._id);
    if (idx !== -1) {
      const col = kanbanStore.columns.find(c => c._id === (typeof updated.column === 'object' ? updated.column._id : updated.column));
      if (col) updated.column = col;
      // Сохраняем реактивную ссылку на объект
      Object.assign(kanbanStore.tasks[idx], updated);
    }
  } catch (err) {
    console.error('Ошибка при обновлении задачи:', err);
  }
};

const handleDelete = async () => {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    sounds.play('drop');
    try {
      await $fetch(`/api/tasks/${props.task._id}`, { method: 'DELETE' });
      kanbanStore.tasks = kanbanStore.tasks.filter(t => t._id !== props.task._id);
      emit('deleted', props.task._id);
      emit('close');
    } catch (err) {
      console.error('Ошибка при удалении задачи:', err);
    }
  }
};

const currentProfileName = computed(() => {
  const roleNameMap: Record<string, string> = {
    owner: 'Владислав',
    dev: 'Артем',
    user: 'Пользователь'
  };
  return roleNameMap[kanbanStore.currentUserRole] || 'Артем';
});

const assignToMe = async () => {
  sounds.play('success');
  await updateTask({ assignee: currentProfileName.value });
};
</script>

<style scoped>
.task-details { display: flex; flex-direction: column; gap: 24px; }

.details-section label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-secondary);
}

.description-text {
  background: var(--bg-panel-light);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  line-height: 1.6;
  color: var(--text-main);
  min-height: 60px;
}

.checklist-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.02);
  padding: 16px;
  border-radius: 12px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
}

.checklist-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.checklist-item span.completed {
  text-decoration: line-through;
  color: var(--text-dim);
}

.glass-input.small {
  padding: 8px 12px;
  font-size: 0.85rem;
  width: 100%;
  margin-top: 8px;
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar.small {
  width: 28px;
  height: 28px;
  background: var(--accent-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
}

.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.priority-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}
.priority-pill.urgent { background: #ff0055; color: white; box-shadow: 0 0 15px rgba(255, 0, 85, 0.4); }
.priority-pill.high { background: #ff9900; color: white; }
.priority-pill.medium { background: var(--accent-secondary); color: var(--bg-void); }
.priority-pill.low { background: var(--bg-panel-light); color: var(--text-dim); }

.date-text { font-size: 0.9rem; color: var(--text-muted); }

.details-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn { color: #ff4d4d; border-color: rgba(255, 77, 77, 0.2); }
.delete-btn:hover { background: rgba(255, 77, 77, 0.1); border-color: #ff4d4d; }

.assign-me-btn {
  background: linear-gradient(135deg, #00e5ff 0%, #008ad4 100%) !important;
  color: #09090b !important;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3) !important;
}
.assign-me-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 229, 255, 0.45) !important;
}
</style>

<style scoped>
.task-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.details-section label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-secondary);
}

.description-text {
  background: var(--bg-panel-light);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  line-height: 1.6;
  color: var(--text-main);
  min-height: 80px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.priority-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}
.priority-pill.urgent { background: #ff0055; color: white; box-shadow: 0 0 15px rgba(255, 0, 85, 0.4); }
.priority-pill.high { background: #ff9900; color: white; }
.priority-pill.medium { background: var(--accent-secondary); color: var(--bg-void); }
.priority-pill.low { background: var(--bg-panel-light); color: var(--text-dim); }

.date-text {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.details-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-btn {
  color: #ff4d4d;
  border-color: rgba(255, 77, 77, 0.2);
}
.delete-btn:hover {
  background: rgba(255, 77, 77, 0.1);
  border-color: #ff4d4d;
}

/* Красивые стили чек-листа в стиле Hologram / Glassmorphism */
.checklist-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #fff;
  transition: all 0.2s ease;
}

.checklist-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1.5px solid #27282f;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  accent-color: #8b5cf6;
}

.checklist-item span {
  font-weight: 500;
  color: #e4e4e7;
}

.checklist-item span.completed {
  text-decoration: line-through;
  color: #71717a;
}

.add-checklist-item {
  margin-top: 8px;
  width: 100%;
}

.add-checklist-item .glass-input.small {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #27282f;
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.add-checklist-item .glass-input.small::placeholder {
  color: #71717a;
}

.add-checklist-item .glass-input.small:focus {
  border-color: #8b5cf6;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.3);
}
</style>
