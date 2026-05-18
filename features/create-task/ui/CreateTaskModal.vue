<template>
  <UiModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Создать задачу">
    <form @submit.prevent="handleSubmit" class="task-form">
      <div class="form-group">
        <label>Название задачи</label>
        <input 
          v-model="form.title" 
          type="text" 
          placeholder="Например: Настроить RabbitMQ..." 
          required 
          class="glass-input" 
        />
      </div>

      <div class="form-group">
        <label>Описание</label>
        <textarea 
          v-model="form.description" 
          placeholder="Детальное описание задачи..." 
          class="glass-input"
        ></textarea>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Приоритет</label>
          <select v-model="form.priority" class="glass-input">
            <option value="Low">Низкий</option>
            <option value="Medium">Средний</option>
            <option value="High">Высокий</option>
            <option value="Urgent">Срочно</option>
          </select>
        </div>

        <div class="form-group">
          <label>Колонка</label>
          <select v-model="form.column" class="glass-input" required>
            <option v-for="col in columns" :key="col._id" :value="col._id">
              {{ col.title }}
            </option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Исполнитель</label>
          <input 
            v-model="form.assignee" 
            type="text" 
            placeholder="Имя (например: Влад)" 
            class="glass-input" 
          />
        </div>
        <div class="form-group">
          <label>Дедлайн</label>
          <input 
            v-model="form.deadline" 
            type="date" 
            class="glass-input" 
          />
        </div>
      </div>

      <div class="form-actions">
        <UiButton type="button" variant="secondary" @click="handleCancel">
          Отмена
        </UiButton>
        <UiButton type="submit" :loading="loading">
          Создать
        </UiButton>
      </div>
    </form>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import UiModal from '~/shared/ui/UiModal.vue';
import UiButton from '~/shared/ui/UiButton.vue';
import { useSounds } from '~/shared/lib/useSounds';
import { useKanbanStore } from '~/stores/kanban';

const props = defineProps({
  modelValue: Boolean,
  columns: { type: Array as any, required: true }
});

const emit = defineEmits(['update:modelValue', 'created']);

const sounds = useSounds();
const loading = ref(false);
const form = reactive({
  title: '',
  description: '',
  priority: 'Medium',
  column: '',
  assignee: '',
  deadline: ''
});

// Установка колонки по умолчанию
watch(() => props.columns, (newCols) => {
  if (newCols?.length && !form.column) {
    form.column = newCols[0]._id;
  }
}, { immediate: true });

const handleCancel = () => {
  sounds.play('click');
  emit('update:modelValue', false);
};

const handleSubmit = async () => {
  sounds.play('click');
  loading.value = true;
  try {
    const kanbanStore = useKanbanStore();
    const activeProject = kanbanStore.projects.find(p => p.isActive);
    const activeProjectName = activeProject ? activeProject.name : 'Hologram App';

    const task = await $fetch('/api/tasks', {
      method: 'POST',
      body: { 
        ...form,
        project: activeProjectName,
        tags: [form.priority.toUpperCase()]
      }
    });
    emit('created', task);
    emit('update:modelValue', false);
    
    // Сброс формы
    form.title = '';
    form.description = '';
    form.priority = 'Medium';
    form.assignee = '';
    form.deadline = '';
  } catch (err) {
    console.error('Ошибка при создании задачи:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dim);
}

.glass-input {
  background: var(--bg-panel-light);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: var(--transition-fast);
}

.glass-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 10px rgba(157, 0, 255, 0.2);
}

textarea.glass-input {
  min-height: 100px;
  resize: vertical;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}
</style>
