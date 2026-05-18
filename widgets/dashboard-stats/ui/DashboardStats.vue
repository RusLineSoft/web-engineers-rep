<template>
  <div class="dashboard-stats">
    <!-- Прогресс Спринта -->
    <div class="stat-card glass-panel progress-card">
      <div class="stat-header">
        <h3>Прогресс спринта</h3>
        <span class="tag-badge">Активен</span>
      </div>
      <div class="progress-container">
        <svg viewBox="0 0 36 36" class="circular-chart">
          <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path class="circle" :stroke-dasharray="progress + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <text x="18" y="20.35" class="percentage">{{ progress }}%</text>
        </svg>
      </div>
      <div class="progress-details">
        <div class="p-item">
          <span class="p-val">{{ doneCount }}</span>
          <span class="p-lbl">Завершено</span>
        </div>
        <div class="p-item">
          <span class="p-val">{{ totalCount }}</span>
          <span class="p-lbl">Всего задач</span>
        </div>
      </div>
    </div>

    <!-- Плотность Колонок -->
    <div class="stat-card glass-panel distribution-card">
      <div class="stat-header">
        <h3>Плотность колонок</h3>
      </div>
      <div class="dist-list">
        <div v-for="col in kanbanStore.columns" :key="col._id" class="dist-item">
          <div class="dist-info">
            <span class="dist-title">{{ col.title }}</span>
            <span class="dist-count">{{ kanbanStore.getTasksByColumn(col._id).length }}</span>
          </div>
          <div class="dist-bar-wrapper">
            <div class="dist-bar-fill" :style="{ width: getPercentage(col._id) + '%', background: getColColor(col.title) }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Обзор Спринта (3 стеклянные динамические карточки) -->
    <div class="stat-card glass-panel sprint-overview-card">
      <div class="stat-header">
        <h3>Обзор спринта</h3>
        <span class="tag-badge violet">Высокий</span>
      </div>
      <div class="mini-cards-grid">
        <div class="mini-card glass-panel cyan-border">
          <span class="mini-val">{{ inProgressCount }}</span>
          <span class="mini-lbl">Задач в работе</span>
        </div>
        <div class="mini-card glass-panel purple-border">
          <span class="mini-val">{{ doneCount }}</span>
          <span class="mini-lbl">Завершено</span>
        </div>
        <div class="mini-card glass-panel green-border">
          <span class="mini-val">{{ progress }}%</span>
          <span class="mini-lbl">Эффективность</span>
        </div>
      </div>
    </div>

    <!-- Здоровье Проекта -->
    <div class="stat-card glass-panel health-card">
      <div class="stat-header">
        <h3>Здоровье проекта</h3>
        <span class="tag-badge cyan">Стабильно</span>
      </div>
      <div class="health-visual">
        <div class="gauge-container">
          <div class="gauge-fill" :style="{ transform: 'rotate(' + (progress * 1.8 - 90) + 'deg)' }"></div>
          <div class="gauge-cover"></div>
        </div>
        <div class="health-label">{{ progress > 70 ? 'Отлично' : 'Стабильно' }}</div>
      </div>
    </div>

    <!-- Ближайшие Дедлайны -->
    <div class="stat-card glass-panel team-card">
      <div class="stat-header">
        <h3>Ближайшие дедлайны</h3>
      </div>
      <div class="deadline-list">
        <div class="deadline-item" v-for="task in upcomingTasks" :key="task._id">
          <div class="deadline-icon">&#9200;</div>
          <div class="deadline-info">
            <span class="d-title">{{ task.title }}</span>
            <span class="d-time">{{ task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '' }}</span>
          </div>
        </div>
        <div v-if="upcomingTasks.length === 0" class="empty-state">
           Нет критических дедлайнов
        </div>
      </div>
    </div>

    <!-- Последняя Активность -->
    <div class="stat-card glass-panel activity-card">
      <div class="stat-header">
        <h3>Последняя активность</h3>
      </div>
      <div class="activity-list">
        <div v-for="task in activeProjectTasks.slice(-3).reverse()" :key="task._id" class="activity-item">
          <div class="activity-icon glass-panel">✓</div>
          <div class="activity-content">
            <p><strong>{{ task.title }}</strong></p>
            <span>{{ task.updatedAt ? new Date(task.updatedAt).toLocaleTimeString() : new Date().toLocaleTimeString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useKanbanStore } from '~/stores/kanban';

const kanbanStore = useKanbanStore();

const activeProjectTasks = computed(() => {
  const activeProject = kanbanStore.projects.find(p => p.isActive);
  const activeProjectName = activeProject ? activeProject.name : 'Hologram App';
  return kanbanStore.tasks.filter(t => (t.project || 'Hologram App') === activeProjectName);
});

// Статистика задач
const totalCount = computed(() => activeProjectTasks.value.length);
const doneCount = computed(() => {
  const doneCol = kanbanStore.columns.find(c => c.title.toLowerCase().includes('done') || c.title.toLowerCase().includes('готово'));
  return doneCol ? kanbanStore.getTasksByColumn(doneCol._id).length : 0;
});

const inProgressCount = computed(() => {
  const progressCol = kanbanStore.columns.find(c => c.title.toLowerCase().includes('progress') || c.title.toLowerCase().includes('работе'));
  return progressCol ? kanbanStore.getTasksByColumn(progressCol._id).length : 0;
});

// Общий прогресс спринта
const progress = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((doneCount.value / totalCount.value) * 100);
});

// Ближайшие дедлайны (сортировка по дате)
const upcomingTasks = computed(() => {
  return [...activeProjectTasks.value]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);
});

// Плотность колонок
const getPercentage = (colId: string) => {
  if (totalCount.value === 0) return 0;
  return (kanbanStore.getTasksByColumn(colId).length / totalCount.value) * 100;
};

const getColColor = (title: string) => {
  const tStr = title.toLowerCase();
  if (tStr.includes('todo') || tStr.includes('надо')) return 'var(--text-dim)';
  if (tStr.includes('progress') || tStr.includes('работе')) return 'var(--accent-primary)';
  if (tStr.includes('done') || tStr.includes('готово')) return 'var(--accent-secondary)';
  return 'var(--accent-tertiary)';
};
</script>

<style scoped>
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-header {
  margin-bottom: 16px;
}

.stat-header h3 {
  font-size: 1rem;
  opacity: 0.8;
}

.tag-badge {
  background: rgba(0, 229, 255, 0.1);
  color: var(--accent-secondary);
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

/* Circular Chart */
.progress-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circular-chart {
  display: block;
  margin: 10px auto;
  max-width: 140px;
  max-height: 140px;
}

.circle-bg {
  fill: none;
  stroke: var(--bg-panel-light);
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke: var(--accent-primary);
  transition: stroke-dasharray 1s ease;
}

.percentage {
  fill: var(--text-main);
  font-family: inherit;
  font-size: 0.5rem;
  font-weight: 800;
  text-anchor: middle;
}

.progress-details {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-subtle);
}

.p-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.p-val { font-size: 1.2rem; font-weight: 800; }
.p-lbl { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; }

/* Distribution List */
.dist-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dist-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dist-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
}

.dist-bar-wrapper {
  height: 6px;
  background: var(--bg-panel-light);
  border-radius: 10px;
  overflow: hidden;
}

.dist-bar-fill {
  height: 100%;
  transition: width 1s ease;
}

.velocity-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100px;
  gap: 8px;
  padding: 10px 0;
}
.mini-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.mini-card {
  padding: 8px 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.02);
  transition: transform 0.2s, box-shadow 0.2s;
}

.mini-card:hover {
  transform: translateY(-2px);
}

.cyan-border {
  border: 1px solid rgba(0, 229, 255, 0.2) !important;
  box-shadow: 0 4px 15px rgba(0, 229, 255, 0.05);
}
.cyan-border .mini-val { color: #00e5ff; text-shadow: 0 0 10px rgba(0, 229, 255, 0.4); }

.purple-border {
  border: 1px solid rgba(157, 0, 255, 0.2) !important;
  box-shadow: 0 4px 15px rgba(157, 0, 255, 0.05);
}
.purple-border .mini-val { color: #9d00ff; text-shadow: 0 0 10px rgba(157, 0, 255, 0.4); }

.green-border {
  border: 1px solid rgba(0, 255, 136, 0.2) !important;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.05);
}
.green-border .mini-val { color: #00ff88; text-shadow: 0 0 10px rgba(0, 255, 136, 0.4); }

.mini-val {
  font-size: 1.3rem;
  font-weight: 800;
}

.mini-lbl {
  font-size: 0.8rem;
  color: var(--text-dim);
  font-weight: 600;
}

.tag-badge.violet { background: rgba(157, 0, 255, 0.1); color: var(--accent-primary); }
.tag-badge.cyan { background: rgba(0, 229, 255, 0.1); color: var(--accent-secondary); }

/* Health Gauge */
.health-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
}
.gauge-container {
  position: relative;
  width: 130px;
  height: 65px;
  background: var(--bg-panel-light);
  border-radius: 100px 100px 0 0;
  overflow: hidden;
}
.gauge-fill {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  transform-origin: center top;
  transition: transform 1s ease;
}
.gauge-cover {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 45px;
  background: var(--bg-void);
  border-radius: 100px 100px 0 0;
}
.health-label {
  font-size: 1rem;
  font-weight: 800;
  color: var(--accent-secondary);
  margin-top: 4px;
}

/* Deadlines */
.deadline-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deadline-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-panel-light);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
}

.deadline-icon { font-size: 1.2rem; }
.deadline-info { display: flex; flex-direction: column; }
.d-title { font-size: 0.9rem; font-weight: 600; }
.d-time { font-size: 0.7rem; color: var(--text-dim); }

.empty-state {
  text-align: center;
  color: var(--text-dim);
  padding: 20px;
  font-size: 0.9rem;
}
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.activity-item {
  display: flex;
  gap: 12px;
  align-items: center;
}
.activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  color: var(--accent-secondary);
}
.activity-content p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-main);
}
.activity-content span {
  font-size: 0.75rem;
  color: var(--text-dim);
}
</style>
