<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const searchQuery = ref('')
const searchResults = ref([])
const assignPopup = ref({
  visible: false,
  x: 0,
  y: 0,
  taskId: null
})

const { data: tasksData, refresh } = await useAsyncData('tasks', () => $fetch('/api/tasks'))
const tasks = computed(() => tasksData.value?.tasks || [])

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

const columns = computed(() => ({
  'To Do': tasks.value.filter(t => t.status === 'To Do'),
  'In progress': tasks.value.filter(t => t.status === 'In progress'),
  'Done': tasks.value.filter(t => t.status === 'Done')
}))

let tasksEventSource = null

const connectTasksRealtime = () => {
  if (!authStore.user?.userId) return

  tasksEventSource = new EventSource(`/api/realtime/tasks?userId=${authStore.user.userId}`)

  tasksEventSource.onmessage = async () => {
    await refresh()
  }

  tasksEventSource.onerror = () => {
    if (tasksEventSource) {
      tasksEventSource.close()
      tasksEventSource = null
    }
    setTimeout(connectTasksRealtime, 3000)
  }
}

const takeTask = async (taskId) => {
  await $fetch(`/api/tasks/${taskId}/take`, {
    method: 'POST',
    body: { userId: authStore.user.userId }
  })
}

const refuseTask = async (taskId) => {
  await $fetch(`/api/tasks/${taskId}/unassign`, {
    method: 'POST',
    body: { userId: authStore.user.userId }
  })
}

const deleteTask = async (taskId) => {
  if (!confirm('Удалить задачу?')) return

  await $fetch(`/api/tasks/${taskId}/delete`, {
    method: 'DELETE'
  })
}

const openAssignPopup = (event, taskId) => {
  assignPopup.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    taskId
  }
  searchQuery.value = ''
  searchResults.value = []
}

const searchUsers = async () => {
  const res = await $fetch('/api/users/search', {
    query: { q: searchQuery.value }
  })
  searchResults.value = res.users
}

const assignUser = async (userId) => {
  await $fetch(`/api/tasks/${assignPopup.value.taskId}/assign`, {
    method: 'POST',
    body: {
      targetUserId: userId
    }
  })
  assignPopup.value.visible = false
}

const onDrop = async (event, status) => {
  const taskId = Number(event.dataTransfer.getData('taskId'))

  await $fetch(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: { status }
  })
}

const onDragStart = (event, taskId) => {
  event.dataTransfer.setData('taskId', taskId)
}

const isAssignedToMe = (task) => {
  return (task.assignedUsers || []).some(u => u.userId === authStore.user?.userId)
}

onMounted(() => {
  connectTasksRealtime()
})

onUnmounted(() => {
  if (tasksEventSource) tasksEventSource.close()
})
</script>

<template>
  <div class="kanban-board">
    <div
      class="kanban-column"
      v-for="(items, status) in columns"
      :key="status"
      @dragover.prevent
      @drop="onDrop($event, status)"
    >
      <h3 class="kanban-title">
        {{ status === 'To Do' ? 'Нужно сделать' : status === 'In progress' ? 'В работе' : 'Завершено' }}
      </h3>

      <div class="kanban-list">
        <div
          v-for="task in items"
          :key="task.taskId"
          class="task-sticker"
          draggable="true"
          @dragstart="onDragStart($event, task.taskId)"
        >
          <div class="task-header">
            <h4>{{ task.taskName }}</h4>
            <span class="priority-badge" :class="priorityMap[task.priority]?.class">
              {{ priorityMap[task.priority]?.label || task.priority }}
            </span>
          </div>

          <p class="description">{{ task.description }}</p>

          <div class="tags">
            <span v-for="tag in task.tags" :key="tag" class="tag">{{ tag }}</span>
            <span class="tag">
              {{ new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </span>
          </div>

          <div class="deadline">
            Создано: {{ new Date(task.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </div>

          <div class="assigned-users" v-if="task.assignedUsers?.length">
            <img
              v-for="user in task.assignedUsers"
              :key="user.userId"
              :src="user.avatar"
              :alt="user.username"
              class="assigned-avatar"
              :title="user.username"
            />
          </div>

          <div class="task-actions">
            <button
              v-if="!isAssignedToMe(task)"
              @click="takeTask(task.taskId)"
              class="take-btn"
            >
              Взять задачу
            </button>

            <button
              v-else
              @click="refuseTask(task.taskId)"
              class="refuse-btn"
            >
              Отказаться
            </button>

            <button
              v-if="authStore.user?.rights === 1"
              @click="openAssignPopup($event, task.taskId)"
              class="assign-btn"
            >
              Назначить пользователя
            </button>

            <button
              v-if="authStore.user?.rights === 1"
              @click="deleteTask(task.taskId)"
              class="delete-btn"
            >
              Удалить задачу
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="assignPopup.visible"
      class="assign-popup"
      :style="{ left: assignPopup.x + 'px', top: assignPopup.y + 'px' }"
    >
      <input
        v-model="searchQuery"
        @input="searchUsers"
        placeholder="Введите фамилию и имя..."
        class="search-input"
      />

      <div class="search-results">
        <div v-for="user in searchResults" :key="user.userId" class="search-user">
          <img :src="user.avatar" class="search-avatar" />
          <span>{{ user.username }}</span>
          <button @click="assignUser(user.userId)">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  padding-inline: 20px;
  width: 100%;
  max-width: 100%;
  justify-content: center;
  margin-inline: 2vh;
  gap: 1vh;
  width: 90%;
  flex-wrap: wrap;
  overflow-x: auto;
  box-sizing: border-box;
}

.kanban-column {
  min-width: 320px;
  max-width: 100%;
  flex: 1 1 320px;
  background: #0f0f12;
  border: 1px solid #2d2d35;
  border-radius: 16px;
  padding: 16px;
  color: #efeff1;
  box-sizing: border-box;
}

.kanban-title {
  font-size: 18px;
  margin: 0 0 16px;
  font-weight: 700;
}

.kanban-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.task-sticker {
  background: #17171c;
  border: 1px solid #2d2d35;
  border-radius: 16px;
  padding: 14px;
  cursor: grab;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  min-width: 0;
}

.task-sticker:active {
  cursor: grabbing;
}

.task-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.task-header h4 {
  margin: 0;
  min-width: 0;
  word-break: break-word;
}

.description {
  word-break: break-word;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
}

.tag {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.deadline {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 10px;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.take-btn,
.assign-btn,
.refuse-btn,
.delete-btn {
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
}

.take-btn {
  background: #3b82f6;
  color: #fff;
}

.refuse-btn {
  background: #ef4444;
  color: #fff;
}

.assign-btn {
  background: #8b5cf6;
  color: #fff;
}

.delete-btn {
  background: #991b1b;
  color: #fff;
}

.assigned-users {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.assign-popup {
  position: fixed;
  z-index: 9999;
  width: 280px;
  background: #0f0f12;
  border: 1px solid #2d2d35;
  border-radius: 14px;
  padding: 12px;
  box-sizing: border-box;
}

.search-input {
  width: 100%;
  background: #17171c;
  border: 1px solid #2d2d35;
  color: #fff;
  border-radius: 10px;
  padding: 10px;
  outline: none;
  box-sizing: border-box;
}

.search-results {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
}

.search-user {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  background: #17171c;
  padding: 8px;
  border-radius: 10px;
}

.search-avatar,
.assigned-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
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
</style>
