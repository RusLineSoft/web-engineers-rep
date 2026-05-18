<template>
  <aside class="sidebar">
    <!-- Брендовый заголовок в стиле To-do List -->
    <div class="brand-header">
      <div class="logo-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="logo-svg">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </div>
      <div class="brand-info">
        <span class="brand-name">Kanban-board</span>
        <span class="brand-sub">To-do List</span>
      </div>
    </div>

    <!-- Основные разделы навигации -->
    <div class="nav-section">
      <span class="section-title">Основное</span>
      <nav class="nav-links">
        <div v-for="item in navItems" :key="item.view" 
             class="nav-item" :class="{ active: kanbanStore.currentView === item.view }"
             @click="kanbanStore.currentView = item.view">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path :d="item.svgPath" />
            <rect v-if="item.svgRect" v-bind="item.svgRect" />
            <circle v-if="item.svgCircle" v-bind="item.svgCircle" />
          </svg>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </div>
      </nav>
    </div>

    <!-- Динамический список проектов с добавлением в стиле Rodeotask -->
    <div class="nav-section">
      <span class="section-title">Проекты</span>
      <div class="projects-list">
        <div v-for="proj in kanbanStore.projects" :key="proj.name" 
             class="project-item" :class="{ active: proj.isActive }"
             @click="selectProject(proj)">
          <span class="project-indicator" :style="{ borderColor: proj.color }"></span>
          <span class="project-name">{{ proj.name }}</span>
        </div>

        <!-- Поле добавления нового проекта -->
        <div class="add-project-row" v-if="!isCreatingProject">
          <button class="add-project-btn" @click="isCreatingProject = true">
            + Добавить проект
          </button>
        </div>
        <div class="create-project-input" v-else>
          <input type="text" v-model="newProjectName" placeholder="Название..." @keyup.enter="handleCreateProject" />
          <div class="create-project-actions">
            <button class="create-ok" @click="handleCreateProject">✓</button>
            <button class="create-cancel" @click="isCreatingProject = false">✗</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Нижняя панель с авторизованным пользователем -->
    <div class="sidebar-footer">
      <!-- Меню действий с профилем (Выход из аккаунта) -->
      <div v-if="isProfileMenuOpen" class="profile-dropdown glass-panel">
        <div class="profile-option logout" @click="handleLogout">
          <div class="avatar small red">🚪</div>
          <div class="option-info">
            <span class="option-name" style="color: #ff4d4d;">Выйти из аккаунта</span>
            <span class="option-role">Завершить сессию</span>
          </div>
        </div>
      </div>

      <!-- Профиль текущего авторизованного пользователя -->
      <div class="user-profile" @click="isProfileMenuOpen = !isProfileMenuOpen">
        <div class="avatar" :class="authStore.user?.role || 'user'">
          <img v-if="isImageAvatar(authStore.user?.avatar)" :src="getAvatarUrl(authStore.user?.avatar)" class="avatar-image" />
          <span v-else>{{ authStore.user?.avatar || '👤' }}</span>
        </div>
        <div class="user-info">
          <span class="name">{{ authStore.user?.username }}</span>
          <span class="role">{{ authStore.user?.rank || 'Пользователь' }}</span>
        </div>
        <span class="profile-chevron" :class="{ rotated: isProfileMenuOpen }">▲</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useKanbanStore } from '~/stores/kanban';
import { useAuthStore } from '~/stores/auth';

const kanbanStore = useKanbanStore();
const authStore = useAuthStore();

const isCreatingProject = ref(false);
const newProjectName = ref('');
const isProfileMenuOpen = ref(false);

const handleLogout = async () => {
  authStore.logout();
  isProfileMenuOpen.value = false;
  await navigateTo('/login');
};

const isImageAvatar = (avatar?: string) => {
  if (!avatar) return false;
  return avatar.includes('.') || avatar.startsWith('/') || avatar.startsWith('http') || avatar.includes('png') || avatar.includes('jpg');
};

const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return '';
  if (avatar.startsWith('public/')) {
    return avatar.replace('public/', '/');
  }
  return avatar;
};

interface NavItem {
  label: string;
  view: string;
  svgPath: string;
  svgRect?: { x: string; y: string; width: string; height: string; rx: string };
  svgCircle?: { cx: string | number; cy: string | number; r: string | number };
  badge?: string | number;
}

const navItems: NavItem[] = [
  { label: 'Дашборд', view: 'Dashboard', svgPath: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { label: 'Доска', view: 'Board', svgPath: 'M9 11l3 3L22 4', svgRect: { x: '3', y: '3', width: '18', height: '18', rx: '2' } },
  { label: 'Таймлайн', view: 'Timeline', svgPath: 'M12 8v4l3 3', svgCircle: { cx: '12', cy: '12', r: '10' } },
  { label: 'Команда', view: 'Team', svgPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', svgCircle: { cx: '9', cy: '7', r: '4' } },
  { label: 'Настройки', view: 'Settings', svgPath: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }
];

const selectProject = (project: any) => {
  kanbanStore.projects.forEach(p => p.isActive = (p.name === project.name));
};

const handleCreateProject = () => {
  const name = newProjectName.value.trim();
  if (name) {
    const colors = ['#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#3b82f6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)] || '#3b82f6';
    kanbanStore.addProject(name, randomColor);
    newProjectName.value = '';
    isCreatingProject.value = false;
  }
};

</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(9, 9, 11, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 24px 16px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 32px;
}

.logo-box {
  width: 36px;
  height: 36px;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}

.logo-svg {
  width: 100%;
  height: 100%;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f4f4f5;
}

.brand-sub {
  font-size: 0.7rem;
  color: #71717a;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #52525b;
  padding-left: 12px;
  margin-bottom: 4px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #a1a1aa;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: #f4f4f5;
  background: #18181b;
}

.nav-item.active {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
  font-weight: 600;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.nav-label {
  font-size: 0.85rem;
}

.badge {
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #a1a1aa;
  transition: all 0.2s ease;
}

.project-item:hover, .project-item.active {
  color: #f4f4f5;
  background: #18181b;
}

.project-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid transparent;
}

.project-name {
  font-size: 0.85rem;
}

.add-project-row {
  padding: 4px 12px;
}

.add-project-btn {
  background: transparent;
  border: none;
  color: #52525b;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.add-project-btn:hover {
  color: #f4f4f5;
}

.create-project-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
}

.create-project-input input {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 6px;
  color: #f4f4f5;
  font-size: 0.75rem;
  padding: 4px 8px;
  width: 100%;
  outline: none;
}

.create-project-actions {
  display: flex;
  gap: 4px;
}

.create-project-actions button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 4px;
  transition: color 0.2s ease;
}

.create-ok { color: #22c55e; }
.create-cancel { color: #ef4444; }

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.theme-toggle {
  display: flex;
  background: #18181b;
  border: 1px solid #27272a;
  padding: 2px;
  border-radius: 8px;
}

.theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #71717a;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 0;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.theme-btn.active {
  background: #27272a;
  color: #f4f4f5;
}

.theme-icon {
  width: 14px;
  height: 14px;
}

.profile-dropdown {
  position: absolute;
  bottom: 64px;
  left: 0;
  width: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 50;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.profile-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.profile-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.profile-option.active {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.2);
}

.option-info {
  display: flex;
  flex-direction: column;
}

.option-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #f4f4f5;
}

.option-role {
  font-size: 0.6rem;
  color: #71717a;
}

.profile-chevron {
  font-size: 0.55rem;
  color: #71717a;
  margin-left: auto;
  transition: transform 0.25s ease;
}

.profile-chevron.rotated {
  transform: rotate(180deg);
}

.avatar.small {
  width: 24px;
  height: 24px;
  font-size: 0.65rem;
  border-radius: 6px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: #18181b;
  border: 1px solid #27272a;
  transition: border-color 0.2s ease, background 0.2s ease;
  cursor: pointer;
}

.user-profile:hover {
  background: #202024;
  border-color: #3f3f46;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  border: 1px solid transparent;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar.owner {
  background: rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
  color: #a78bfa;
}

.avatar.dev {
  background: rgba(6, 180, 212, 0.15);
  border-color: #06b6d4;
  color: #22d3ee;
}

.avatar.user {
  background: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  color: #fbbf24;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f4f4f5;
}

.role {
  font-size: 0.65rem;
  color: #71717a;
}
</style>
