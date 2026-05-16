<script setup>
import { ref } from 'vue'

const emit = defineEmits(['action', 'created'])

const taskName = ref('')
const description = ref('')
const status = ref('To Do')
const priority = ref('notUrgently')
const selectedTags = ref([])
const deadline = ref(Date.now)

const isLoading = ref(false)
const errorMessage = ref('')

const tags = [
  {
    label: 'Дизайн',
    value: 'design',
    className: 'tag-design'
  },
  {
    label: 'Тестирование',
    value: 'testing',
    className: 'tag-testing'
  },
  {
    label: 'Маркетинг',
    value: 'marketing',
    className: 'tag-marketing'
  },
  {
    label: 'Разработка',
    value: 'development',
    className: 'tag-development'
  },
  {
    label: 'HR-менеджмент',
    value: 'hr-management',
    className: 'tag-hr'
  }
]

const closeWindow = () => {
  emit('action', 'closeNewTask')
}

const toggleTag = (tagValue) => {
  if (selectedTags.value.includes(tagValue)) {
    selectedTags.value = selectedTags.value.filter(tag => tag !== tagValue)
  } else {
    selectedTags.value.push(tagValue)
  }
}

const isTagSelected = (tagValue) => {
  return selectedTags.value.includes(tagValue)
}

const createTask = async () => {
  errorMessage.value = ''

  if (!taskName.value.trim()) {
    errorMessage.value = 'Введите название задачи'
    return
  }

  isLoading.value = true

  try {
    const createdTask = await $fetch('/api/tasks/create', {
      method: 'POST',
      body: {
        taskName: taskName.value.trim(),
        description: description.value.trim(),
        status: status.value,
        priority: priority.value,
        tags: selectedTags.value
      }
    })

    emit('created', createdTask)

    taskName.value = ''
    description.value = ''
    status.value = 'To Do'
    priority.value = 'notUrgently'
    selectedTags.value = []

    closeWindow()
  } catch (error) {
    errorMessage.value = error?.data?.message || 'Ошибка при создании задачи'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="create-task-overlay" @click.self="closeWindow">
    <div class="create-task-modal">
      <div class="modal-header">
        <div>
          <h2>Новая задача</h2>
          <p>Создайте новый стикер для канбан-доски</p>
        </div>

        <button class="close-button" type="button" @click="closeWindow">
          ×
        </button>
      </div>

      <div class="form">
        <div class="input-group">
          <label for="taskName">Задача</label>
          <input
            id="taskName"
            v-model="taskName"
            placeholder="Например: написать заказчику"
            type="text"
          >
        </div>

        <div class="input-group">
          <label for="description">Описание</label>
          <textarea
            id="description"
            v-model="description"
            placeholder="Кратко и понятно"
            rows="3"
          />
        </div>

        <div class="input-group">
          <label for="deadline">Дедлайн</label>
          <input
            id="deadline"
            v-model="deadline"
            type="date"
          >
        </div>

        <div class="form-grid">
          <div class="input-group">
            <label for="status">Статус</label>
            <select id="status" v-model="status">
              <option value="To Do">Нужно сделать</option>
              <option value="In progress">В работе</option>
              <option value="Done">Завершено</option>
            </select>
          </div>

          <div class="input-group">
            <label for="priority">Приоритет</label>
            <select id="priority" v-model="priority">
              <option value="veryUrgent">Очень срочно</option>
              <option value="urgently">Срочно</option>
              <option value="notUrgently">Не срочно</option>
              <option value="noPriority">Не приоритетная задача</option>
            </select>
          </div>
        </div>

        <div class="input-group">
          <label>Тэги</label>

          <div class="tags-list">
            <button
              v-for="tag in tags"
              :key="tag.value"
              type="button"
              class="tag-chip"
              :class="[
                tag.className,
                {
                  'tag-chip-selected': isTagSelected(tag.value)
                }
              ]"
              @click="toggleTag(tag.value)"
            >
              <span class="tag-check">
                ✓
              </span>

              <span>
                {{ tag.label }}
              </span>
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="actions">
          <button class="cancel-button" type="button" @click="closeWindow">
            Отмена
          </button>

          <button
            class="create-button"
            type="button"
            :disabled="isLoading"
            @click="createTask"
          >
            {{ isLoading ? 'Создание...' : 'Создать задачу' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-task-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
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

.create-task-modal {
  width: 100%;
  max-width: 660px;
  padding: 24px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.095);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px);
  animation: modal-in 0.18s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

h2 {
  margin: 0;
  color: #ffffff;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  font-family: 'Breakthrough Bold';
}

p {
  margin: 7px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 14px;
}

.close-button {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.09);
  color: rgba(255, 255, 255, 0.9);
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  transition: 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 80, 110, 0.22);
  color: #ffffff;
  transform: rotate(4deg) scale(1.04);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.input-group {
  position: relative;
}

label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

input,
textarea,
select {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 15px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 15px;
  outline: none;
  background: rgba(255, 255, 255, 0.085);
  color: #ffffff;
  font-size: 15px;
  font-family: inherit;
  transition:
    border-color 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

textarea {
  resize: vertical;
  min-height: 88px;
}

input::placeholder,
textarea::placeholder {
  color: rgba(255, 255, 255, 0.42);
}

input:focus,
textarea:focus,
select:focus {
  border-color: rgba(0, 191, 255, 0.82);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 4px rgba(0, 191, 255, 0.14);
}

option {
  color: #111111;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
}

.tag-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 999px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: pointer;
  user-select: none;
  backdrop-filter: blur(12px);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease;
}

.tag-chip::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.42;
  transition:
    opacity 0.22s ease,
    filter 0.22s ease;
}

.tag-chip:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.28);
  color: #ffffff;
}

.tag-chip:hover::before {
  opacity: 0.62;
}

.tag-chip-selected {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.48);
  transform: translateY(-2px) scale(1.03);
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.28),
    0 0 22px rgba(255, 255, 255, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.tag-chip-selected::before {
  opacity: 1;
  filter: saturate(1.75) brightness(1.22);
}

.tag-check {
  display: grid;
  width: 0;
  height: 20px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 13px;
  opacity: 0;
  transition:
    width 0.18s ease,
    opacity 0.18s ease;
}

.tag-chip-selected .tag-check {
  width: 20px;
  opacity: 1;
}

.tag-design::before {
  background: linear-gradient(135deg, rgba(0, 210, 255, 0.55), rgba(120, 80, 255, 0.5));
}

.tag-testing::before {
  background: linear-gradient(135deg, rgba(255, 90, 190, 0.55), rgba(255, 190, 80, 0.5));
}

.tag-marketing::before {
  background: linear-gradient(135deg, rgba(255, 70, 110, 0.58), rgba(255, 150, 0, 0.5));
}

.tag-development::before {
  background: linear-gradient(135deg, rgba(0, 255, 170, 0.55), rgba(0, 125, 255, 0.5));
}

.tag-hr::before {
  background: linear-gradient(135deg, rgba(176, 105, 255, 0.58), rgba(255, 100, 165, 0.5));
}

.error-message {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(255, 90, 90, 0.28);
  background: rgba(255, 70, 70, 0.13);
  color: #ffc0c0;
  font-size: 14px;
  font-weight: 600;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 4px;
}

.cancel-button,
.create-button {
  min-height: 44px;
  padding: 12px 18px;
  border: 0;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.cancel-button {
  background: rgba(255, 255, 255, 0.09);
  color: #ffffff;
}

.cancel-button:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
}

.create-button {
  background: linear-gradient(135deg, #00bfff, #6a5cff);
  color: #ffffff;
  box-shadow: 0 14px 32px rgba(84, 107, 255, 0.34);
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 38px rgba(84, 107, 255, 0.43);
}

.create-button:disabled {
  opacity: 0.68;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 720px) {
  .create-task-overlay {
    padding: 16px;
  }

  .create-task-modal {
    padding: 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .cancel-button,
  .create-button {
    width: 100%;
  }
}
</style>