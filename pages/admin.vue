<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

definePageMeta({
  middleware: ['admin']
})

useHead({
  title: 'Админ-панель // Web Engineers'
})

const authStore = useAuthStore()

const users = ref([])
const loading = ref(false)
const creating = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = ref({
  username: '',
  email: '',
  password: '',
  rank: 'Сотрудник',
  rights: 0,
  telegram: '',
  phone: '',
  company: 'Web Engineers'
})

const adminsCount = computed(() => {
  return users.value.filter(user => user.rights === 1 && !user.isBlocked).length
})

const employeesCount = computed(() => {
  return users.value.filter(user => user.rights !== 1).length
})

const blockedCount = computed(() => {
  return users.value.filter(user => user.isBlocked).length
})

const loadUsers = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch('/api/admin/users', {
      query: {
        adminUserId: authStore.user.userId
      }
    })

    users.value = res.users || []
  } catch (error) {
    errorMessage.value = error?.data?.message || 'Не удалось загрузить пользователей'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    password: '',
    rank: 'Сотрудник',
    rights: 0,
    telegram: '',
    phone: '',
    company: 'Web Engineers'
  }
}

const createUser = async () => {
  creating.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await $fetch('/api/admin/users/create', {
      method: 'POST',
      body: {
        ...form.value,
        adminUserId: authStore.user.userId
      }
    })

    users.value = [res.user, ...users.value]
    successMessage.value = `Пользователь ${res.user.username} создан. ID: ${res.user.userId}`

    resetForm()
  } catch (error) {
    errorMessage.value = error?.data?.message || 'Не удалось создать пользователя'
  } finally {
    creating.value = false
  }
}

const toggleBlockUser = async (user) => {
  const nextBlockedState = !user.isBlocked

  const confirmText = nextBlockedState
    ? `Заблокировать пользователя ${user.username}?`
    : `Разблокировать пользователя ${user.username}?`

  if (!confirm(confirmText)) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await $fetch(`/api/admin/users/${user.userId}/block`, {
      method: 'PATCH',
      body: {
        adminUserId: authStore.user.userId,
        isBlocked: nextBlockedState
      }
    })

    const index = users.value.findIndex(item => item.userId === user.userId)

    if (index !== -1) {
      users.value[index] = res.user
    }

    successMessage.value = nextBlockedState
      ? `Пользователь ${user.username} заблокирован`
      : `Пользователь ${user.username} разблокирован`
  } catch (error) {
    errorMessage.value = error?.data?.message || 'Не удалось изменить статус пользователя'
  }
}

const goBack = () => {
  navigateTo('/')
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="admin-page">
    <header class="topbar">
      <div>
        <h1>Админ-панель</h1>
        <p>Регистрация и управление пользователями</p>
      </div>

      <button class="back-btn" type="button" @click="goBack">
        Вернуться на доску
      </button>
    </header>

    <section class="stats">
      <div class="stat-card">
        <span>Всего пользователей</span>
        <strong>{{ users.length }}</strong>
      </div>

      <div class="stat-card">
        <span>Администраторов</span>
        <strong>{{ adminsCount }}</strong>
      </div>

      <div class="stat-card">
        <span>Сотрудников</span>
        <strong>{{ employeesCount }}</strong>
      </div>

      <div class="stat-card danger">
        <span>Заблокировано</span>
        <strong>{{ blockedCount }}</strong>
      </div>
    </section>

    <div v-if="errorMessage" class="alert error">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="alert success">
      {{ successMessage }}
    </div>

    <main class="grid">
      <section class="panel">
        <div class="panel-header">
          <h2>Создать пользователя</h2>
          <p>Системные поля будут сгенерированы автоматически</p>
        </div>

        <form class="form" @submit.prevent="createUser">
          <label>
            <span>Имя и фамилия</span>
            <input
              v-model="form.username"
              type="text"
              placeholder="Иван Петров"
              required
            >
          </label>

          <label>
            <span>Email</span>
            <input
              v-model="form.email"
              type="email"
              placeholder="ivan@company.ru"
              required
            >
          </label>

          <label>
            <span>Пароль</span>
            <input
              v-model="form.password"
              type="password"
              placeholder="Пароль для входа"
              required
            >
          </label>

          <label>
            <span>Должность / ранг</span>
            <input
              v-model="form.rank"
              type="text"
              placeholder="Сотрудник"
            >
          </label>

          <label>
            <span>Права</span>
            <select v-model.number="form.rights">
              <option :value="0">Пользователь</option>
              <option :value="1">Администратор</option>
            </select>
          </label>

          <label>
            <span>Telegram</span>
            <input
              v-model="form.telegram"
              type="text"
              placeholder="@username"
            >
          </label>

          <label>
            <span>Телефон</span>
            <input
              v-model="form.phone"
              type="text"
              placeholder="+7..."
            >
          </label>

          <label>
            <span>Компания</span>
            <input
              v-model="form.company"
              type="text"
              placeholder="Web Engineers"
            >
          </label>

          <button class="create-btn" type="submit" :disabled="creating">
            {{ creating ? 'Создание...' : 'Создать пользователя' }}
          </button>
        </form>
      </section>

      <section class="panel users-panel">
        <div class="panel-header">
          <h2>Пользователи</h2>
          <p>Блокировка и просмотр зарегистрированных аккаунтов</p>
        </div>

        <div v-if="loading" class="loading">
          Загрузка пользователей...
        </div>

        <div v-else class="users-list">
          <div
            v-for="user in users"
            :key="user.userId"
            class="user-card"
            :class="{ blocked: user.isBlocked }"
          >
            <div class="user-main">
              <img :src="user.avatar" :alt="user.username" class="avatar">

              <div class="user-info">
                <div class="name-row">
                  <h3>{{ user.username }}</h3>

                  <span v-if="user.rights === 1" class="role admin">
                    Админ
                  </span>

                  <span v-else class="role">
                    Пользователь
                  </span>

                  <span v-if="user.isBlocked" class="role blocked-label">
                    Заблокирован
                  </span>
                </div>

                <div class="meta">
                  <span>ID: {{ user.userId }}</span>
                  <span>{{ user.email }}</span>
                  <span>{{ user.rank }}</span>
                </div>

                <div class="meta muted">
                  <span>{{ user.company || 'Компания не указана' }}</span>
                  <span>{{ user.phone || 'Телефон не указан' }}</span>
                  <span>{{ user.telegram || 'Telegram не указан' }}</span>
                </div>
              </div>
            </div>

            <button
              class="block-btn"
              :class="{ unblock: user.isBlocked }"
              type="button"
              :disabled="user.userId === authStore.user.userId"
              @click="toggleBlockUser(user)"
            >
              {{ user.isBlocked ? 'Разблокировать' : 'Заблокировать' }}
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 28px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 34%),
    radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.16), transparent 38%),
    #080b12;
  color: #fff;
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

h1 {
  margin: 0;
  font-size: 34px;
  font-weight: 900;
}

.topbar p,
.panel-header p {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.58);
}

.back-btn {
  border: 0;
  border-radius: 14px;
  padding: 12px 16px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  font-weight: 800;
}

.back-btn:hover {
  background: rgba(59, 130, 246, 0.28);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(15, 15, 18, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card span {
  color: rgba(255, 255, 255, 0.58);
  font-size: 13px;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 30px;
}

.stat-card.danger strong {
  color: #fca5a5;
}

.alert {
  margin-bottom: 16px;
  padding: 13px 16px;
  border-radius: 14px;
  font-weight: 700;
}

.alert.error {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.16);
}

.alert.success {
  color: #bbf7d0;
  background: rgba(34, 197, 94, 0.16);
}

.grid {
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  gap: 18px;
}

.panel {
  padding: 20px;
  border-radius: 24px;
  background: rgba(15, 15, 18, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header {
  margin-bottom: 18px;
}

.panel-header h2 {
  margin: 0;
  font-size: 22px;
}

.form {
  display: grid;
  gap: 13px;
}

label {
  display: grid;
  gap: 7px;
}

label span {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  font-weight: 700;
}

input,
select {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.12);
  outline: none;
  border-radius: 14px;
  padding: 12px 13px;
  background: rgba(255, 255, 255, 0.065);
  color: #fff;
}

select option {
  color: #111827;
}

input:focus,
select:focus {
  border-color: rgba(59, 130, 246, 0.8);
}

.create-btn {
  margin-top: 4px;
  border: 0;
  border-radius: 14px;
  padding: 13px 16px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  font-weight: 900;
}

.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.users-panel {
  min-width: 0;
}

.loading {
  color: rgba(255, 255, 255, 0.65);
}

.users-list {
  display: grid;
  gap: 12px;
  max-height: calc(100vh - 270px);
  overflow-y: auto;
  padding-right: 6px;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.user-card.blocked {
  border-color: rgba(239, 68, 68, 0.28);
  background: rgba(239, 68, 68, 0.075);
}

.user-main {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex: 0 0 auto;
}

.user-info {
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

h3 {
  margin: 0;
  font-size: 17px;
}

.role {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.16);
}

.role.admin {
  color: #ddd6fe;
  background: rgba(139, 92, 246, 0.2);
}

.role.blocked-label {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.2);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px 13px;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
}

.meta.muted {
  color: rgba(255, 255, 255, 0.42);
}

.block-btn {
  flex: 0 0 auto;
  border: 0;
  border-radius: 13px;
  padding: 10px 13px;
  color: #fff;
  background: #ef4444;
  cursor: pointer;
  font-weight: 800;
}

.block-btn.unblock {
  background: #22c55e;
}

.block-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 1050px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }

  .users-list {
    max-height: none;
  }
}

@media (max-width: 640px) {
  .admin-page {
    padding: 18px;
  }

  .topbar {
    flex-direction: column;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .user-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .block-btn {
    width: 100%;
  }
}
</style>