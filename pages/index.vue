<script setup>
import { useAuthStore } from '@/stores/auth'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const authStore = useAuthStore()

//definePageMeta({
 // middleware: ['auth']
//})

useHead({
  title: 'Канбан-доска // Web Engineers',
  meta: [
    {
      name: 'description',
      content: 'Страница авторизации для сотрудников компании'
    }
  ]
})

const isToggledPageLayout = ref(false)

const userData = ref(null)
const newTaskWindow = ref(false)

const taskCount = computed(() => userData.value?.tasksCount ?? null)
const notificationCount = computed(() => userData.value?.notification ?? null)

let meEventSource = null

const connectMeRealtime = () => {
  if (!authStore.user?.userId) return

  meEventSource = new EventSource(`/api/realtime/me?userId=${authStore.user.userId}`)

  meEventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)

    if (data.type === 'initial' || data.type === 'user-updated') {
      userData.value = data.user
    }
  }

  meEventSource.onerror = () => {
    if (meEventSource) {
      meEventSource.close()
      meEventSource = null
    }
    setTimeout(connectMeRealtime, 3000)
  }
}

const handleLogout = () => {
  authStore.logout()
  navigateTo('/login')
}

const newTask = () => {
  newTaskWindow.value = true
}

const closeNewTask = () => {
  newTaskWindow.value = false
}

const handleMenuAction = (actionType) => {
  if (actionType === 'closeNewTask') {
    newTaskWindow.value = false
  }
}

onMounted(() => {
  connectMeRealtime()
})

onUnmounted(() => {
  if (meEventSource) meEventSource.close()
})
</script>

<template>
  <div class="page-layout">
    <aside class="sidebar" v-if="isToggledPageLayout">
      <button @click="isToggledPageLayout = !isToggledPageLayout" class="toggle-aside">toggle aside</button>
      <div class="profile-card">
        <div class="avatar-wrapper">
          <img :src="userData?.avatar || 'https://via.placeholder.com/64'" alt="Avatar" class="avatar">
          <div class="status-indicator" :class="{ online: authStore.isAuthenticated }"></div>
        </div>

        <div class="profile-info">
          <h2 class="username">{{ userData?.username || 'Загрузка...' }}</h2>
          <span class="rank-badge">{{ userData?.rank || '...' }}</span>
        </div>

        <button @click="handleLogout" class="logout-btn-profile" title="Выйти из аккаунта">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" x2="9" y1="12" y2="12"/>
          </svg>
        </button>
      </div>

      <nav class="menu">
        <button class="menu-item active">
          <div class="menu-item-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/>
            </svg>
            <span>Мои задачи</span>
          </div>
          <span v-if="taskCount !== null" class="count-badge">{{ taskCount }}</span>
          <span v-else class="count-badge loading">...</span>
        </button>

        <button class="menu-item">
          <div class="menu-item-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span>Лента событий</span>
          </div>
        </button>

        <button class="menu-item">
          <div class="menu-item-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            <span>Уведомления</span>
          </div>
          <span v-if="notificationCount !== null" class="count-badge notify">{{ notificationCount }}</span>
          <span v-else class="count-badge notify loading">...</span>
        </button>
      </nav>

      <div class="sidebar-footer"></div>
    </aside>


    <aside class="page-layout__toggled" v-else-if="!isToggledPageLayout">
      <div @click="isToggledPageLayout = !isToggledPageLayout" class="toggle-btn">=</div>
    </aside>


    <section class="content">
      <div class="content-top">
        <CreateTaskBtn @click="newTask()" />
      </div>

      <KanbanBoard />
    </section>

    <CreateTaskMenu v-if="newTaskWindow" @action="handleMenuAction" />
  </div>
</template>

<style scoped>
.toggle-aside {
  display: inline-block;
  margin-block: 16px;
}

.toggle-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 4vh;
  aspect-ratio: 1;
  margin-inline: auto;
  margin-top: 10px;
  background-color: #191919;
  border-radius: 4px;

  cursor: pointer;
}
.toggle-btn:hover {
  background-color: #292929;
}

.page-layout {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: hidden;
}

.page-layout__toggled {
  width: 6vh;
  height: 100vh;
  background-color: #0f0f12;
  border-right: 1px solid #2d2d35;
}

.sidebar {
  display: flex;
  height: 100vh;
  width: 100vh;
  flex: 0 0 300px;
  background-color: #0f0f12;
  color: #efeff1;
  flex-direction: column;
  padding: 2vh;
  border-right: 1px solid #2d2d35;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.content {
  width: 100%;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

.content-top {
  padding: 20px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 40px;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b82f6;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2px solid #0f0f12;
  border-radius: 50%;
}

.username {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-badge {
  font-size: 12px;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 20px;
}

.logout-btn-profile {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.menu-item.active {
  background: #3b82f6;
  color: #fff;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}

.count-badge {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: 8px;
  color: #fff;
}

.count-badge.notify {
  background: #ef4444;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #2d2d35;
}
</style>
