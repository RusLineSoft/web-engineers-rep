<template>
  <div class="admin-dashboard-container">
    <!-- СТИЛИЗОВАННЫЙ БОКОВОЙ САЙДБАР (GLASSMORPHISM) -->
    <div class="admin-sidebar card">
      <div class="logo">
        <h2>Kanban-board Admin</h2>
        <span class="version-tag">Панель управления v1.5.0</span>
      </div>
      
      <ul class="list">
        <li 
          v-for="tab in tabs" 
          :key="tab.id"
          class="element" 
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="lucide-icon" />
          <p class="label">{{ tab.name }}</p>
        </li>
      </ul>
      
      <div class="separator"></div>
      
      <ul class="list">
        <li class="element exit">
          <NuxtLink to="/" class="exit-link">
            <svg
              class="lucide lucide-log-out"
              stroke-linejoin="round"
              stroke-linecap="round"
              stroke-width="2"
              fill="none"
              viewBox="0 0 24 24"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span class="label">Вернуться на доску</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- ГЛАВНАЯ ОБЛАСТЬ АДМИНКИ -->
    <div class="admin-main">
      <header class="admin-header glass-panel">
        <div class="header-title-section">
          <h1>Панель управления</h1>
          <p class="subtitle">Управление учетными записями, правами и сессиями сотрудников</p>
        </div>
        <div class="admin-profile" v-if="authStore.user">
          <span class="role-badge">{{ authStore.user.rank || 'Администратор' }}</span>
          <div class="avatar admin-avatar">{{ authStore.user.avatar || '👑' }}</div>
          <span class="admin-name">{{ authStore.user.username }}</span>
        </div>
      </header>

      <div class="admin-content">
        <!-- Вкладка: Сотрудники -->
        <div v-if="activeTab === 'staff'" class="table-card card-glow-style">
          <div class="card-header">
            <div class="header-text">
              <h3>Доступ сотрудников</h3>
              <p class="table-subtitle">Всего участников в базе данных: {{ staff.length }}</p>
            </div>
            <button class="action-btn" @click="isCreateModalOpen = true">
              ➕ Создать пользователя
            </button>
          </div>

          <div class="table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Имя сотрудника</th>
                  <th>Роль (Права)</th>
                  <th>Доступ к системе</th>
                  <th>Дата регистрации</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in staff" :key="user.userId">
                  <td>
                    <div class="user-cell">
                      <div class="table-avatar" :style="{ background: getAvatarBg(user.rights) }">
                        <img v-if="isImageAvatar(user.avatar)" :src="getAvatarUrl(user.avatar)" class="avatar-image" />
                        <span v-else>{{ user.avatar || '👤' }}</span>
                      </div>
                      <div class="user-info-text">
                        <span class="name">{{ user.username }}</span>
                        <span class="email-subtext">{{ user.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-pill" :class="getRoleClass(user.rights)">
                      {{ getRoleLabel(user.rights) }}
                    </span>
                  </td>
                  <td>
                    <span class="status-indicator granted">
                      <span class="dot-indicator"></span>
                      Активен (Разрешен)
                    </span>
                  </td>
                  <td class="time-cell">{{ formatDate(user.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Вкладка: Системные логи -->
        <div v-else-if="activeTab === 'logs'" class="table-card card-glow-style">
          <div class="card-header">
            <div class="header-text">
              <h3>Системные логи и события</h3>
              <p class="table-subtitle">Анализ очередей сообщений RabbitMQ и веб-сокетов в реальном времени</p>
            </div>
            <button class="action-btn secondary" @click="clearLogs">Очистить логи</button>
          </div>

          <div class="logs-console">
            <div v-for="(log, idx) in systemLogs" :key="idx" class="log-line" :class="log.type">
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-source">[{{ log.source }}]</span>
              <span class="log-msg">{{ log.message }}</span>
            </div>
          </div>
        </div>

        <!-- Вкладка: Безопасность -->
        <div v-else-if="activeTab === 'security'" class="table-card card-glow-style">
          <div class="card-header">
            <div class="header-text">
              <h3>Безопасность и API Ключи</h3>
              <p class="table-subtitle">Конфигурация секретов сессии и шифрования базы данных</p>
            </div>
          </div>

          <div class="security-grid">
            <div class="security-item glass-input-group">
              <label>MongoDB URI</label>
              <input type="text" value="mongodb://127.0.0.1:27017/Kanban" disabled class="glass-input-disabled" />
            </div>
            <div class="security-item glass-input-group">
              <label>RabbitMQ Server</label>
              <input type="text" value="amqp://localhost (Events Asserted)" disabled class="glass-input-disabled" />
            </div>
            <div class="security-item glass-input-group">
              <label>WebSocket Server Status</label>
              <div class="status-box active">
                <span class="pulse-dot"></span>
                Слушает на порту 3000 (global.__io активен)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ -->
    <div v-if="isCreateModalOpen" class="modal-overlay" @click.self="isCreateModalOpen = false">
      <div class="modal-content card-glow-style">
        <div class="modal-header">
          <h3>Создание нового пользователя</h3>
          <button class="close-btn" @click="isCreateModalOpen = false">×</button>
        </div>
        
        <form @submit.prevent="handleCreateUser" class="user-form">
          <div class="form-group">
            <label>Имя пользователя</label>
            <input type="text" v-model="newUserForm.username" placeholder="Например, Артем Разработчик" required class="glass-input" />
          </div>
          
          <div class="form-group">
            <label>Электронная почта (Email)</label>
            <input type="email" v-model="newUserForm.email" placeholder="example@company.com" required class="glass-input" />
          </div>
          
          <div class="form-group">
            <label>Пароль доступа</label>
            <input type="password" v-model="newUserForm.password" placeholder="Минимум 6 символов" required class="glass-input" />
          </div>

          <div class="form-group-grid">
            <div class="form-group">
              <label>Должность (Rank)</label>
              <input type="text" v-model="newUserForm.rank" placeholder="Разработчик (Dev)" class="glass-input" />
            </div>
            <div class="form-group">
              <label>Telegram</label>
              <input type="text" v-model="newUserForm.telegram" placeholder="@username" class="glass-input" />
            </div>
          </div>

          <div class="form-group-grid">
            <div class="form-group">
              <label>Уровень прав доступа</label>
              <select v-model="newUserForm.rights" class="glass-select">
                <option :value="1">1 — Чтение (User)</option>
                <option :value="2">2 — Разработчик (Dev)</option>
                <option :value="3">3 — Администратор (Admin)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Аватар (Emoji)</label>
              <input type="text" v-model="newUserForm.avatar" placeholder="👤, 💻, 👑, 🚀" class="glass-input" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="action-btn secondary" @click="isCreateModalOpen = false">Отмена</button>
            <button type="submit" class="action-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Создание...' : 'Создать пользователя' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const activeTab = ref('staff');
const staff = ref<any[]>([]);
const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);

const newUserForm = reactive({
  username: '',
  email: '',
  password: '',
  rank: 'Разработчик (Dev)',
  telegram: '',
  rights: 2,
  avatar: '💻'
});

// Загрузка пользователей из API
const fetchUsers = async () => {
  try {
    const data = await $fetch<any[]>('/api/users');
    staff.value = data;
  } catch (err) {
    console.error('Ошибка загрузки пользователей:', err);
  }
};

// Создание пользователя через API
const handleCreateUser = async () => {
  isSubmitting.value = true;
  try {
    const response = await $fetch('/api/users', {
      method: 'POST',
      body: newUserForm
    });
    if (response && response.success) {
      await fetchUsers();
      isCreateModalOpen.value = false;
      // Очистка формы
      newUserForm.username = '';
      newUserForm.email = '';
      newUserForm.password = '';
      newUserForm.rank = 'Разработчик (Dev)';
      newUserForm.telegram = '';
      newUserForm.rights = 2;
      newUserForm.avatar = '💻';
    }
  } catch (err: any) {
    alert(err.statusMessage || 'Произошла ошибка при создании пользователя');
  } finally {
    isSubmitting.value = false;
  }
};

// Защита и проверка прав при монтировании
onMounted(async () => {
  if (!authStore.isAuthenticated || authStore.user?.rights !== 3) {
    await navigateTo('/login');
    return;
  }
  await fetchUsers();
});

// Кастомные SVG иконки из Lucide для Сайдбара
const UsersIcon = {
  render() {
    return h('svg', {
      class: 'lucide lucide-users-round',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      fill: 'none',
      viewBox: '0 0 24 24',
      height: '19',
      width: '19',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', { d: 'M18 21a8 8 0 0 0-16 0' }),
      h('circle', { r: '5', cy: '8', cx: '10' }),
      h('path', { d: 'M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3' })
    ]);
  }
};

const LogsIcon = {
  render() {
    return h('svg', {
      class: 'lucide lucide-scroll',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      fill: 'none',
      viewBox: '0 0 24 24',
      height: '19',
      width: '19',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
      h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
      h('polyline', { points: '10 9 9 9 8 9' })
    ]);
  }
};

const SecurityIcon = {
  render() {
    return h('svg', {
      class: 'lucide lucide-shield',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      fill: 'none',
      viewBox: '0 0 24 24',
      height: '19',
      width: '19',
      xmlns: 'http://www.w3.org/2000/svg'
    }, [
      h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
    ]);
  }
};

const tabs = [
  { id: 'staff', name: 'Сотрудники', icon: UsersIcon },
  { id: 'logs', name: 'Системные логи', icon: LogsIcon },
  { id: 'security', name: 'Безопасность', icon: SecurityIcon }
];

const getAvatarBg = (rights: number) => {
  if (rights === 3) return 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)';
  if (rights === 2) return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
  return 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)';
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

const getRoleClass = (rights: number) => {
  if (rights === 3) return 'admin';
  if (rights === 2) return 'developer';
  return 'user';
};

const getRoleLabel = (rights: number) => {
  if (rights === 3) return 'Владелец (Admin)';
  if (rights === 2) return 'Разработчик (Dev)';
  return 'Чтение (User)';
};

const formatDate = (dateStr: any) => {
  if (!dateStr) return 'Недавно';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const systemLogs = ref([
  { time: '15:52:02', source: 'Database', type: 'info', message: 'Монго подключена успешно к базе "Kanban"' },
  { time: '15:52:03', source: 'RabbitMQ', type: 'info', message: 'Канал событий kanban_events успешно инициализирован' },
  { time: '15:53:15', source: 'Socket.io', type: 'success', message: 'Пользователь Влад подключился к комнате "workspace"' },
  { time: '15:54:22', source: 'HTTP API', type: 'warning', message: 'PUT /api/tasks/6a086638725a14313c67ba28 - Задача успешно перенесена' },
  { time: '15:55:01', source: 'Worker', type: 'info', message: 'Воркер RabbitMQ обработал событие обновления доски' }
]);

const clearLogs = () => {
  systemLogs.value = [];
};
</script>

<style scoped>
.admin-dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #09090b;
  color: #fff;
  font-family: inherit;
}

/* СТИЛИЗАЦИЯ САЙДБАРА ПО РЕФЕРЕНСУ (1:1 ГРАДИЕНТ И РАЗМЕТКА) */
.card {
  width: 280px;
  background-color: rgba(36, 40, 50, 1);
  background-image: linear-gradient(
    139deg,
    rgba(36, 40, 50, 1) 0%,
    rgba(37, 28, 40, 1) 100%
  );
  border-right: 1px solid #27282f;
  padding: 32px 0px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(20px);
}

.logo {
  padding: 0px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logo h2 {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.logo .version-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: #71717a;
  letter-spacing: 0.5px;
}

.card .separator {
  border-top: 1.5px solid #42434a;
  margin: 8px 0;
}

.card .list {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0px 14px;
  margin: 0;
}

.card .list .element {
  display: flex;
  align-items: center;
  color: #7e8590;
  gap: 12px;
  transition: all 0.3s ease-out;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.card .list .element .lucide-icon {
  width: 19px;
  height: 19px;
  transition: all 0.3s ease-out;
  stroke: #7e8590;
}

.card .list .element .label {
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
}

/* Эффект наведения и активного состояния из референса */
.card .list .element:hover,
.card .list .element.active {
  background-color: #5353ff;
  color: #ffffff;
  transform: translate(1px, -1px);
}

.card .list .element:hover .lucide-icon,
.card .list .element.active .lucide-icon {
  stroke: #ffffff;
}

.card .list .element:active {
  transform: scale(0.99);
}

/* Стилизация специальной нижней кнопки выхода по референсу */
.card .list .element.exit {
  padding: 0;
}

.card .list .element.exit .exit-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #bd89ff;
  text-decoration: none;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.3s ease-out;
}

.card .list .element.exit .exit-link svg {
  stroke: #bd89ff;
}

.card .list .element.exit:hover .exit-link {
  background-color: rgba(56, 45, 71, 0.836);
  transform: translate(1px, -1px);
}

/* СТИЛИЗАЦИЯ ГЛАВНОЙ СЕТКИ */
.admin-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: #09090b;
}

.admin-header {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: rgba(15, 15, 20, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.header-title-section h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.header-title-section .subtitle {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin: 2px 0 0 0;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-badge {
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #c084fc;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #8b5cf6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
}

.admin-name {
  font-weight: 600;
  font-size: 0.95rem;
}

/* КОНТЕНТ */
.admin-content {
  padding: 40px;
  flex-grow: 1;
  background: radial-gradient(circle at top right, #1a1635 0%, #09090b 70%);
}

/* Применение градиентного фона референса к карточке таблицы */
.table-card {
  padding: 32px;
  background-color: rgba(36, 40, 50, 1);
  background-image: linear-gradient(
    139deg,
    rgba(36, 40, 50, 0.8) 0%,
    rgba(37, 28, 40, 0.8) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  backdrop-filter: blur(25px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.card-header h3 {
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
}

.card-header .table-subtitle {
  font-size: 0.85rem;
  color: #a1a1aa;
  margin: 4px 0 0 0;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  background: linear-gradient(135deg, #5353ff 0%, #3b3be6 100%);
  color: #fff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(83, 83, 255, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(83, 83, 255, 0.45);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: none;
  color: #a1a1aa;
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* ТАБЛИЦА */
.table-wrapper {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  padding: 18px;
  color: #7e8590;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1.5px solid #27282f;
}

.admin-table td {
  padding: 20px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.95rem;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.table-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  font-size: 1.15rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info-text {
  display: flex;
  flex-direction: column;
}

.user-info-text .name {
  font-weight: 700;
  color: #ffffff;
}

.user-info-text .email-subtext {
  font-size: 0.75rem;
  color: #7e8590;
  margin-top: 2px;
}

.role-pill {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-block;
}

.role-pill.admin {
  background: rgba(236, 72, 153, 0.1);
  color: #f472b6;
}

.role-pill.developer {
  background: rgba(6, 180, 212, 0.1);
  color: #22d3ee;
}

.role-pill.user {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.status-indicator {
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.status-indicator .dot-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.status-indicator.granted {
  color: #10b981;
}

.status-indicator.granted .dot-indicator {
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
}

.time-cell {
  color: #7e8590;
  font-weight: 500;
}

/* КОНСОЛЬ ЛОГОВ */
.logs-console {
  background: #050507;
  border: 1px solid #27282f;
  border-radius: 16px;
  padding: 24px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  line-height: 1.7;
  max-height: 480px;
  overflow-y: auto;
  box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.8);
}

.log-line {
  margin-bottom: 8px;
  display: flex;
  gap: 12px;
}

.log-line.info { color: #a1a1aa; }
.log-line.success { color: #10b981; }
.log-line.warning { color: #fbbf24; }

.log-time { color: #5353ff; font-weight: 700; }
.log-source { color: #bd89ff; font-weight: 700; }

/* БЕЗОПАСНОСТЬ */
.security-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.glass-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.glass-input-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #7e8590;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.glass-input-disabled {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #27282f;
  border-radius: 12px;
  padding: 14px 16px;
  color: #a1a1aa;
  font-size: 0.95rem;
  cursor: not-allowed;
}

.status-box {
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #10b981;
  font-weight: 700;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 10px #10b981;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* МОДАЛЬНЫЕ ОКНА И ФОРМЫ (GLASSMORPHISM) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 540px;
  background-color: rgba(36, 40, 50, 0.95);
  background-image: linear-gradient(
    139deg,
    rgba(36, 40, 50, 0.95) 0%,
    rgba(37, 28, 40, 0.95) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
}

.close-btn {
  background: transparent;
  border: none;
  color: #7e8590;
  font-size: 1.8rem;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.user-form {
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
  font-size: 0.75rem;
  font-weight: 700;
  color: #7e8590;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.glass-input, .glass-select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #27282f;
  border-radius: 12px;
  padding: 12px 14px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.glass-input:focus, .glass-select:focus {
  border-color: #5353ff;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 8px rgba(83, 83, 255, 0.3);
}

.form-group-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 20px;
}
</style>
