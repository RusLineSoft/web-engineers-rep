<template>
  <div class="timeline-container glass-panel">
    <!-- Заголовок и управление -->
    <div class="timeline-header">
      <h2>График Проекта</h2>
      <div class="timeline-controls">
        <button class="glass-btn active">Месяц</button>
        <button class="glass-btn">Неделя</button>
      </div>
    </div>
    
    <!-- Таймлайн Задач -->
    <div class="timeline-grid">
      <!-- Рендерим только те задачи, которые не завершены и имеют дедлайн или просто для визуала -->
      <div v-for="task in activeTasks" :key="task._id" class="timeline-row">
        <div class="task-info">
          <span class="dot" :class="task.priority.toLowerCase()"></span>
          <span class="task-title" :title="task.title">{{ task.title }}</span>
        </div>
        
        <!-- Линия времени задачи (прогресс-бар) -->
        <div class="task-bar-wrapper">
          <div class="task-bar glass-panel" :class="task.priority.toLowerCase()" :style="getTimelineStyle(task)">
            <!-- Тултип при наведении -->
            <div class="timeline-tooltip">
              {{ task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Нет дедлайна' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Пустое состояние -->
      <div v-if="activeTasks.length === 0" class="empty-timeline">
        <p>Нет активных задач для отображения на графике</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useKanbanStore, type Task } from '~/stores/kanban';

// Инициализация стора
const kanbanStore = useKanbanStore();

// Оставляем только задачи, которые еще не завершены (например, не в колонке "Done")
const activeTasks = computed(() => {
  return kanbanStore.tasks.filter((task: Task) => {
    // В реальном проекте мы проверяем ID колонки завершенных, тут мы просто берем все
    // Для демо мы покажем все задачи с приоритетом Urgent и High первыми
    return true; 
  }).sort((a, b) => {
    const priMap: Record<string, number> = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    return (priMap[b.priority] ?? 0) - (priMap[a.priority] ?? 0);
  });
});

// Генерация стилей для "Полоски" таймлайна (реальный расчет по датам)
const getTimelineStyle = (task: any) => {
  const now = new Date();
  
  // Если есть реальные даты, пытаемся отрендерить по ним
  if (task.createdAt && task.dueDate) {
    const created = new Date(task.createdAt).getTime();
    const due = new Date(task.dueDate).getTime();
    const current = now.getTime();
    
    // Для демо предположим, что таймлайн показывает текущий месяц
    // Вычисляем проценты на основе времени от создания до дедлайна
    // (Упрощенная формула для наглядности)
    const durationDays = Math.max(1, (due - created) / (1000 * 60 * 60 * 24));
    
    // Делаем ширину зависимой от длительности, но не меньше 15% и не больше 80%
    const width = Math.min(80, Math.max(15, durationDays * 2));
    
    // Смещение зависит от того, как давно задача создана
    const ageDays = Math.max(0, (current - created) / (1000 * 60 * 60 * 24));
    const leftOffset = Math.min(50, ageDays); 
    
    return {
      width: `${width}%`,
      marginLeft: `${leftOffset}%`
    };
  }

  // Фолбек: если дат нет, используем псевдослучайную генерацию для красивого демо
  const seed = task.title.length;
  const leftOffset = (seed * 7) % 30; // Случайный отступ от 0 до 30%
  const width = (seed * 13) % 40 + 20; // Случайная ширина от 20% до 60%
  
  return {
    width: `${width}%`,
    marginLeft: `${leftOffset}%`
  };
};
</script>

<style scoped>
.timeline-container { 
  padding: 32px; 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  gap: 24px; 
}
.timeline-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.timeline-grid { 
  flex: 1; 
  overflow-y: auto; 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

/* Строка с задачей */
.timeline-row { 
  display: grid; 
  grid-template-columns: 250px 1fr; 
  gap: 20px; 
  align-items: center; 
  padding: 16px; 
  border-bottom: 1px solid var(--border-subtle);
  border-radius: 12px;
  transition: var(--transition-fast);
}
.timeline-row:hover {
  background: var(--bg-panel-light);
}

.task-info { 
  font-weight: 600; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  overflow: hidden;
  white-space: nowrap;
}
.task-title {
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Точки приоритета */
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot.urgent { background: #ff0055; box-shadow: 0 0 10px rgba(255, 0, 85, 0.6); }
.dot.high { background: #ff9900; box-shadow: 0 0 10px rgba(255, 153, 0, 0.5); }
.dot.medium { background: #00ccff; }
.dot.low { background: #00ff88; }

/* Прогресс бар задачи */
.task-bar-wrapper {
  width: 100%;
  background: var(--bg-void);
  border-radius: 12px;
  height: 24px;
  display: flex;
  align-items: center;
  padding: 4px;
}

.task-bar { 
  height: 100%; 
  border-radius: 8px; 
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Градиенты для полосок в зависимости от приоритета */
.task-bar.urgent { background: linear-gradient(90deg, #ff0055, #ff3377); }
.task-bar.high { background: linear-gradient(90deg, #ff9900, #ffbb33); }
.task-bar.medium { background: linear-gradient(90deg, #00ccff, #33ddff); }
.task-bar.low { background: linear-gradient(90deg, #00ff88, #33ffaa); }

.task-bar:hover {
  filter: brightness(1.2);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

/* Тултип */
.timeline-tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-void);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
  border: 1px solid var(--border-subtle);
}
.task-bar:hover .timeline-tooltip {
  opacity: 1;
}

.empty-timeline {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
}
</style>
