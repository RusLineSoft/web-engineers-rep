<template>
  <div class="dashboard-page">
    <!-- Минималистичная подшапка с фильтрами по референсу Sapphire UI -->
    <div class="board-sub-header">
      <div class="view-title">
        <h2>{{ getCurrentViewLabel(kanbanStore.currentView) }}</h2>
      </div>
      <div class="filter-group">
        <button v-for="p in priorities" 
                :key="p.value" 
                :class="{ active: kanbanStore.filterPriority === p.value }"
                @click="kanbanStore.filterPriority = p.value">
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Разделы навигации по вкладкам -->
    <div class="view-content" v-if="kanbanStore.currentView === 'Dashboard'">
      <DashboardStats />
      <div class="section-divider">
        <h3>Обзор спринта</h3>
      </div>
      <TasksTable />
    </div>

    <div class="view-content" v-else-if="kanbanStore.currentView === 'Board'">
      <TasksTable />
    </div>

    <div class="view-content" v-else-if="kanbanStore.currentView === 'Timeline'">
       <Timeline />
    </div>

    <div class="view-content" v-else-if="kanbanStore.currentView === 'Team'">
       <Team />
    </div>

    <div class="view-content mocked-view" v-else-if="kanbanStore.currentView === 'Settings'">
       <div class="glass-panel placeholder-card">
          <h3>Настройки проекта</h3>
          <div class="setting-item">
             <label>Название проекта</label>
             <input type="text" value="Hologram App" class="glass-input" />
          </div>
       </div>
    </div>

    <CreateTaskModal 
      v-model="kanbanStore.isTaskModalOpen" 
      :columns="kanbanStore.columns" 
      @created="kanbanStore.fetchBoard()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useKanbanStore } from '~/stores/kanban';
import { useNuxtApp } from '#app';
import TasksTable from '~/widgets/tasks-table/ui/TasksTable.vue';
import DashboardStats from '~/widgets/dashboard-stats/ui/DashboardStats.vue';
import CreateTaskModal from '~/features/create-task/ui/CreateTaskModal.vue';
import Timeline from '~/widgets/timeline/ui/Timeline.vue';
import Team from '~/widgets/team/ui/Team.vue';

const kanbanStore = useKanbanStore();
const nuxtApp = useNuxtApp();

const totalTasks = computed(() => kanbanStore.tasks.length);

const priorities = [
  { label: 'Все', value: 'All' },
  { label: 'Срочно', value: 'Urgent' },
  { label: 'Высокий', value: 'High' },
  { label: 'Средний', value: 'Medium' },
  { label: 'Низкий', value: 'Low' }
];

const getCurrentViewLabel = (view: string) => {
  const views: Record<string, string> = {
    Dashboard: 'Дашборд',
    Board: 'Рабочая доска',
    Timeline: 'Таймлайн',
    Team: 'Команда',
    Settings: 'Настройки'
  };
  return views[view] || view;
};

onMounted(async () => {
  await kanbanStore.fetchBoard();
  
  if (nuxtApp.$socket) {
    // @ts-ignore
    nuxtApp.$socket.connect();
    // @ts-ignore
    kanbanStore.initSocket(nuxtApp.$socket);
  }
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.board-sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 8px;
}

.view-title h2 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: #f4f4f5;
}

.filter-group {
  display: flex;
  background: #18181b;
  border: 1px solid #27272a;
  padding: 3px;
  border-radius: 8px;
}

.filter-group button {
  background: none;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #71717a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-group button:hover {
  color: #f4f4f5;
}

.filter-group button.active {
  background: #27272a;
  color: #f4f4f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.welcome-text h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 8px;
}

.welcome-text p {
  color: var(--text-dim);
  margin: 0;
}

.glass-btn {
  padding: 12px 24px;
  border-radius: 14px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-panel-light);
  color: var(--text-main);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: var(--transition-fast);
}

.glass-btn.primary {
  background: var(--accent-primary);
  border: none;
  box-shadow: 0 4px 20px rgba(157, 0, 255, 0.4);
}

.view-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-divider {
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 12px;
  margin-top: 16px;
}

.section-divider h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  opacity: 0.9;
}

.placeholder-card {
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.timeline-mock {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, var(--bg-panel-light) 25%, var(--accent-primary) 50%, var(--bg-panel-light) 75%);
  border-radius: 12px;
  opacity: 0.3;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 400px;
  text-align: left;
}

.glass-input {
  background: var(--bg-panel-light);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 10px;
  color: white;
}
</style>