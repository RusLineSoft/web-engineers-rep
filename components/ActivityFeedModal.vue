<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  logs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}

const typeMap = {
  'task-created': {
    label: 'Создание задачи',
    class: 'type-green'
  },
  'task-updated': {
    label: 'Изменение задачи',
    class: 'type-blue'
  },
  'task-deleted': {
    label: 'Удаление задачи',
    class: 'type-red'
  },
  'task-status-changed': {
    label: 'Статус задачи',
    class: 'type-purple'
  },
  'task-taken': {
    label: 'Взятие задачи',
    class: 'type-green'
  },
  'task-refused': {
    label: 'Отказ от задачи',
    class: 'type-orange'
  },
  'task-assigned': {
    label: 'Назначение',
    class: 'type-purple'
  },
  'task-unassigned': {
    label: 'Снятие',
    class: 'type-orange'
  },
  'user-login': {
    label: 'Вход',
    class: 'type-green'
  },
  'user-logout': {
    label: 'Выход',
    class: 'type-red'
  },
  'page-action': {
    label: 'Действие',
    class: 'type-blue'
  }
}

const sortedLogs = computed(() => {
  return [...props.logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const getTypeLabel = (type) => {
  return typeMap[type]?.label || type
}

const getTypeClass = (type) => {
  return typeMap[type]?.class || 'type-blue'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div v-if="modelValue" class="overlay" @click.self="close">
    <div class="modal">
      <div class="header">
        <div>
          <h2>Лента событий</h2>
          <p>Все действия пользователей на доске</p>
        </div>

        <button class="close-btn" type="button" @click="close">
          ×
        </button>
      </div>

      <div v-if="sortedLogs.length" class="feed">
        <div
          v-for="log in sortedLogs"
          :key="log._id"
          class="feed-item"
        >
          <div class="left">
            <img
              v-if="log.actor?.avatar"
              :src="log.actor.avatar"
              :alt="log.actor.username"
              class="avatar"
            >

            <div v-else class="avatar-placeholder">
              ?
            </div>
          </div>

          <div class="body">
            <div class="top-line">
              <span class="badge" :class="getTypeClass(log.type)">
                {{ getTypeLabel(log.type) }}
              </span>

              <span class="date">
                {{ formatDate(log.createdAt) }}
              </span>
            </div>

            <div class="title">
              {{ log.title }}
            </div>

            <div class="message">
              {{ log.message }}
            </div>

            <div class="details">
              <span v-if="log.actor">
                Автор: <b>{{ log.actor.username }}</b>
              </span>

              <span v-if="log.targetUser">
                Получатель: <b>{{ log.targetUser.username }}</b>
              </span>

              <span v-if="log.taskName">
                Задача: <b>{{ log.taskName }}</b>
              </span>

              <span v-if="log.taskId">
                ID: <b>{{ log.taskId }}</b>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        Событий пока нет
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
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 35%),
    radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.18), transparent 40%),
    rgba(4, 8, 18, 0.68);
  backdrop-filter: blur(12px);
}

.modal {
  width: 100%;
  max-width: 900px;
  max-height: 84vh;
  overflow: hidden;
  padding: 24px;
  border-radius: 26px;
  background: rgba(15, 15, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
  color: #fff;
  font-size: 28px;
  font-weight: 800;
}

p {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.62);
}

.close-btn {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.22);
}

.feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(84vh - 120px);
  overflow-y: auto;
  padding-right: 6px;
}

.feed-item {
  display: flex;
  gap: 14px;
  padding: 15px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.left {
  flex: 0 0 auto;
}

.avatar,
.avatar-placeholder {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}

.avatar {
  object-fit: cover;
}

.avatar-placeholder {
  display: grid;
  place-items: center;
  background: #334155;
  color: #fff;
  font-weight: 800;
}

.body {
  min-width: 0;
  flex: 1;
}

.top-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.badge {
  display: inline-flex;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.type-green {
  color: #bbf7d0;
  background: rgba(34, 197, 94, 0.16);
}

.type-blue {
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.18);
}

.type-red {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.18);
}

.type-orange {
  color: #fed7aa;
  background: rgba(249, 115, 22, 0.18);
}

.type-purple {
  color: #ddd6fe;
  background: rgba(139, 92, 246, 0.18);
}

.date {
  color: rgba(255, 255, 255, 0.42);
  font-size: 12px;
}

.title {
  color: #fff;
  font-weight: 800;
  margin-bottom: 5px;
}

.message {
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.45;
  word-break: break-word;
}

.details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 12px;
}

.details b {
  color: rgba(255, 255, 255, 0.78);
}

.empty {
  padding: 34px 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.65);
}
</style>