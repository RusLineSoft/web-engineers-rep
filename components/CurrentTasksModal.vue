<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}

const priorityMap = {
  noPriority: {
    label: 'Неприоритетная задача',
    class: 'priority-noPriority'
  },
  notUrgently: {
    label: 'Не срочно',
    class: 'priority-notUrgently'
  },
  urgently: {
    label: 'Срочно',
    class: 'priority-urgently'
  },
  veryUrgent: {
    label: 'Очень срочно',
    class: 'priority-veryUrgent'
  }
}

const statusMap = {
  'To Do': 'Нужно сделать',
  'In progress': 'В работе',
  Done: 'Завершено'
}
</script>

<template>
  <div v-if="modelValue" class="overlay" @click.self="close">
    <div class="modal">
      <div class="header">
        <div>
          <h2>Мои задачи</h2>
          <p>Список задач, на которые вы назначены</p>
        </div>

        <button class="close-btn" type="button" @click="close">
          ×
        </button>
      </div>

      <div v-if="tasks.length" class="tasks-list">
        <div
          v-for="task in tasks"
          :key="task.taskId"
          class="task-card"
        >
          <div class="task-top">
            <h3>{{ task.taskName }}</h3>

            <span
              class="priority-badge"
              :class="priorityMap[task.priority]?.class"
            >
              {{ priorityMap[task.priority]?.label || task.priority }}
            </span>
          </div>

          <div class="task-meta">
            <span class="status">
              {{ statusMap[task.status] || task.status }}
            </span>

            <span v-if="task.deadline" class="date">
              Дедлайн:
              {{ new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </span>
          </div>

          <div v-if="task.tags?.length" class="tags">
            <span
              v-for="tag in task.tags"
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>

          <div v-if="task.createdAt" class="created">
            Создано:
            {{ new Date(task.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </div>
        </div>
      </div>

      <div v-else class="empty">
        У вас пока нет текущих задач
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(0, 191, 255, 0.16), transparent 35%),
    radial-gradient(circle at bottom right, rgba(128, 90, 255, 0.18), transparent 40%),
    rgba(4, 8, 18, 0.62);
  backdrop-filter: blur(12px);
}

.modal {
  width: 100%;
  max-width: 760px;
  max-height: 82vh;
  overflow: hidden;
  padding: 24px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.095);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
}

p {
  margin: 7px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 14px;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.09);
  color: rgba(255, 255, 255, 0.9);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(255, 80, 110, 0.22);
  color: #ffffff;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(82vh - 110px);
  overflow-y: auto;
  padding-right: 6px;
}

.task-card {
  padding: 16px;
  border-radius: 18px;
  background: rgba(15, 15, 18, 0.74);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.task-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.task-top h3 {
  margin: 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  word-break: break-word;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.status,
.date {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 12px;
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.15);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.tag {
  background: rgba(139, 92, 246, 0.15);
  color: #c4b5fd;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.created {
  font-size: 12px;
  color: #94a3b8;
}

.empty {
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 34px 0;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.priority-noPriority {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.priority-notUrgently {
  background: linear-gradient(135deg, #facc15, #eab308);
  color: #1f2937;
}

.priority-urgently {
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.priority-veryUrgent {
  background: linear-gradient(135deg, #991b1b, #dc2626);
}

@media (max-width: 720px) {
  .overlay {
    padding: 16px;
  }

  .modal {
    padding: 20px;
  }

  .task-top {
    flex-direction: column;
  }
}
</style>