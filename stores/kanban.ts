import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

/**
 * Интерфейс, описывающий колонку Kanban-доски.
 */
export interface Column {
  _id: string;
  title: string;
  order: number;
}

/**
 * Интерфейс, описывающий элемент чеклиста в задаче.
 */
export interface ChecklistItem {
  title: string;
  isCompleted: boolean;
}

/**
 * Интерфейс, описывающий задачу на Kanban-доске.
 */
export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  column: string | Column;
  project?: string;
  tags?: string[];
  assignee?: string;
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt?: string;
  checklist?: ChecklistItem[];
}

/**
 * Описание интерфейса веб-сокет соединения для типизации экшенов.
 */
export interface SocketConnection {
  on(event: string, callback: (...args: any[]) => void): void;
}

/**
 * Глобальное хранилище Pinia для управления состоянием Kanban-доски.
 * Обеспечивает реактивность данных, фильтрацию задач и интеграцию с сокетами.
 */
export const useKanbanStore = defineStore('kanban', () => {
  // Состояние хранилища (State)
  const tasks = ref<Task[]>([]);
  const columns = ref<Column[]>([]);
  
  // Состояния пользовательского интерфейса
  const isTaskModalOpen = ref(false);
  const currentView = ref('Dashboard');
  
  // Фильтрация и поиск
  const searchQuery = ref('');
  const filterPriority = ref('All');
  const locale = ref('ru');
  
  // Проекты и темы оформления
  const projects = ref<{ name: string; color: string; isActive: boolean }[]>([
    { name: 'Kanban-board', color: '#8b5cf6', isActive: true }
  ]);
  const isDarkMode = ref(true);

  const addProject = (name: string, color: string) => {
    projects.value.forEach(p => p.isActive = false);
    projects.value.push({ name, color, isActive: true });
  };
  
  // Ролевая модель доступа пользователей
  const currentUserRole = ref<'owner' | 'dev' | 'user'>('owner');
  const canCreateOrDeleteTasks = computed(() => currentUserRole.value === 'owner');

  /**
   * Асинхронный экшен для загрузки колонок и задач с бэкенда.
   * Выполняет параллельные HTTP-запросы для оптимизации времени загрузки.
   */
  const fetchBoard = async (): Promise<void> => {
    try {
      const [colsRes, tasksRes] = await Promise.all([
        $fetch<Column[]>('/api/columns').catch(() => []),
        $fetch<Task[]>('/api/tasks').catch(() => [])
      ]);
      columns.value = colsRes;
      tasks.value = tasksRes;
    } catch (err) {
      console.error('Ошибка при загрузке доски:', err);
    }
  };

  /**
   * Экшен для перемещения задачи в другую колонку с оптимистичным обновлением UI.
   * @param taskId Уникальный идентификатор задачи.
   * @param newColumnId Идентификатор целевой колонки.
   */
  const moveTask = async (taskId: string, newColumnId: string): Promise<void> => {
    // Ограничение перемещения в Бэклог для сотрудников (role === 'user')
    const authStore = useAuthStore();
    if (authStore.user?.role === 'user') {
      const targetColumn = columns.value.find(c => c._id === newColumnId);
      if (targetColumn) {
        const title = targetColumn.title.toLowerCase();
        if (title.includes('бэклог') || title.includes('backlog')) {
          alert('Сотрудникам запрещено перемещать задачи в Бэклог!');
          return;
        }
      }
    }

    const task = tasks.value.find(t => t._id === taskId);
    let originalColumn: string | Column | undefined;

    if (task) {
      originalColumn = task.column;
      const targetColumn = columns.value.find(c => c._id === newColumnId);
      if (targetColumn) {
        task.column = targetColumn;
      }
    }

    try {
      await $fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: { column: newColumnId }
      });
    } catch (err) {
      console.error('Ошибка при перемещении задачи. Откат изменений...', err);
      if (task && originalColumn) {
        task.column = originalColumn;
      }
      await fetchBoard();
    }
  };

  /**
   * Инициализация подписок WebSocket для синхронизации изменений в реальном времени.
   * @param socket Инстанс веб-сокет соединения.
   */
  const initSocket = (socket: SocketConnection): void => {
    socket.on('task:created', (newTask: Task) => {
      const col = columns.value.find(c => c._id === (typeof newTask.column === 'object' ? newTask.column._id : newTask.column));
      if (col) {
        newTask.column = col;
      }
      tasks.value.push(newTask);
    });

    socket.on('task:updated', (updatedTask: Task) => {
      const idx = tasks.value.findIndex(t => t._id === updatedTask._id);
      if (idx !== -1) {
        const col = columns.value.find(c => c._id === (typeof updatedTask.column === 'object' ? updatedTask.column._id : updatedTask.column));
        if (col) {
          updatedTask.column = col;
        }
        const taskToUpdate = tasks.value[idx];
        if (taskToUpdate) {
          Object.assign(taskToUpdate, updatedTask);
        }
      }
    });

    socket.on('task:deleted', ({ id }: { id: string }) => {
      tasks.value = tasks.value.filter(t => t._id !== id);
    });
  };

  /**
   * Возвращает отфильтрованный список задач для указанной колонки.
   * @param columnId Идентификатор колонки.
   */
  const getTasksByColumn = (columnId: string): Task[] => {
    const activeProject = projects.value.find(p => p.isActive);
    const activeProjectName = activeProject ? activeProject.name : 'Kanban-board';

    return tasks.value.filter(t => {
      // 1. Фильтрация по проекту
      const taskProject = t.project || 'Kanban-board';
      if (taskProject !== activeProjectName) {
        return false;
      }

      // 2. Фильтрация по колонке
      const taskColId = typeof t.column === 'object' ? t.column._id : t.column;
      if (taskColId !== columnId) {
        return false;
      }

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) {
          return false;
        }
      }

      if (filterPriority.value !== 'All' && t.priority !== filterPriority.value) {
        return false;
      }

      return true;
    });
  };

  return {
    tasks,
    columns,
    isTaskModalOpen,
    currentView,
    searchQuery,
    filterPriority,
    locale,
    currentUserRole,
    canCreateOrDeleteTasks,
    projects,
    isDarkMode,
    addProject,
    fetchBoard,
    moveTask,
    initSocket,
    getTasksByColumn
  };
});
