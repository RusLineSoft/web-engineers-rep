<template>
  <div class="team-container glass-panel">
    <!-- Заголовок команды -->
    <div class="team-header">
      <h2>Участники проекта</h2>
      <button class="glass-btn primary">
        <span class="plus">+</span> Пригласить
      </button>
    </div>

    <!-- Грид участников -->
    <div class="team-grid">
      <!-- Итерируемся по уникальным участникам, которые есть в задачах (либо заглушкам) -->
      <div v-for="member in teamMembers" :key="member.name" class="member-card glass-panel">
        <div class="member-header">
          <div class="avatar-wrapper">
            <div class="avatar" :style="{ background: member.color }">{{ getInitials(member.name) }}</div>
            <div class="status-indicator" :class="{ online: member.isOnline }"></div>
          </div>
          <div class="info">
            <h3>{{ member.name }}</h3>
            <p>{{ member.role }}</p>
          </div>
        </div>

        <div class="member-stats">
          <div class="stat-box">
            <span class="stat-value">{{ member.activeTasks }}</span>
            <span class="stat-label">В работе</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">{{ member.completedTasks }}</span>
            <span class="stat-label">Завершено</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useKanbanStore, type Task } from '~/stores/kanban';

const kanbanStore = useKanbanStore();

// Утилита для получения инициалов
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

// Вычисляем статистику команды на основе реальных задач из Store

const teamMembers = computed(() => {
  // Собираем всех уникальных исполнителей из задач
  const assignees = new Set<string>();
  kanbanStore.tasks.forEach((task: Task) => {
    if (task.assignee) assignees.add(task.assignee);
  });

  // Добавим пару дефолтных, если задач мало
  if (assignees.size === 0) {
    assignees.add('John Doe');
    assignees.add('Alice Smith');
  }

  // Роли и цвета для красоты
  const roles = ['Frontend Developer', 'Backend Lead', 'Product Designer', 'QA Engineer', 'DevOps'];
  const colors = [
    'linear-gradient(135deg, #00b4d8, #0077b6)',
    'linear-gradient(135deg, #ff9f43, #ff6b6b)',
    'linear-gradient(135deg, #00d68f, #00b4d8)',
    'linear-gradient(135deg, #f0c929, #ff9f43)'
  ];

  return Array.from(assignees).map((name, index) => {
    // Считаем задачи конкретного пользователя
    const userTasks = kanbanStore.tasks.filter((t: Task) => t.assignee === name);
    // Для демо считаем, что колонка "Done" или "Completed" это завершенные
    const completed = userTasks.filter((t: Task) => typeof t.column === 'object' ? t.column.title?.toLowerCase().includes('done') : false).length;
    const active = userTasks.length - completed;

    return {
      name,
      role: roles[index % roles.length],
      color: colors[index % colors.length],
      isOnline: Math.random() > 0.5, // Фейковый онлайн-статус
      activeTasks: active || Math.floor(Math.random() * 5), // Заглушка если 0
      completedTasks: completed || Math.floor(Math.random() * 20)
    };
  });
});
</script>

<style scoped>
.team-container { 
  padding: 32px; 
  height: 100%;
}
.team-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 32px; 
}
.team-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
  gap: 24px; 
}

/* Карточка участника */
.member-card { 
  padding: 24px; 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
  transition: var(--transition-normal); 
  border-radius: 16px;
}
.member-card:hover { 
  transform: translateY(-5px); 
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

/* Верхняя часть карточки (Аватар + Имя) */
.member-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-wrapper {
  position: relative;
}

.avatar { 
  width: 64px; 
  height: 64px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 1.25rem; 
  font-weight: 800; 
  color: white; 
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: var(--text-muted);
  border: 2px solid var(--bg-panel-light);
  border-radius: 50%;
  transition: all 0.3s ease;
}
.status-indicator.online {
  background: #00ff88;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
}

.info h3 { 
  margin: 0; 
  font-size: 1.2rem; 
  color: var(--text-main);
}
.info p { 
  margin: 4px 0 0; 
  color: var(--text-muted); 
  font-size: 0.9rem; 
}

/* Статистика задач */
.member-stats {
  display: flex;
  gap: 12px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
}
.stat-box {
  flex: 1;
  background: var(--bg-void);
  padding: 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-primary);
}
.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-dim);
  font-weight: 600;
}
</style>
