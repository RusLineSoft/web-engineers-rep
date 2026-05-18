<template>
  <div class="kanban-board-container">
    <div class="board-columns-wrapper">
      <div class="columns-scroll-container">
        <ColumnLayout 
          v-for="col in kanbanStore.columns" 
          :key="col._id" 
          :column="col"
          :tasks="kanbanStore.getTasksByColumn(col._id)"
          @drop-task="handleDrop"
        >
          <TaskCard 
            v-for="task in kanbanStore.getTasksByColumn(col._id)" 
            :key="task._id" 
            :task="task"
            draggable="true"
            @dragstart="onDragStart($event, task._id)"
            @click="openTaskDetails(task)"
          />
        </ColumnLayout>
      </div>
    </div>

    <!-- Modals -->
    <CreateTaskModal 
      v-model="kanbanStore.isTaskModalOpen" 
      :columns="kanbanStore.columns" 
      @created="fetchData"
    />

    <TaskDetailsModal 
      :task="selectedTask"
      @close="selectedTask = null"
      @deleted="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useKanbanStore } from '~/stores/kanban';
import DashboardStats from '~/widgets/dashboard-stats/ui/DashboardStats.vue';
import ColumnLayout from '~/entities/column/ui/ColumnLayout.vue';
import TaskCard from '~/entities/task/ui/TaskCard.vue';
import CreateTaskModal from '~/features/create-task/ui/CreateTaskModal.vue';
import TaskDetailsModal from '~/features/task-details/ui/TaskDetailsModal.vue';
import { useSounds } from '~/shared/lib/useSounds';

const kanbanStore = useKanbanStore();
const sounds = useSounds();
const selectedTask = ref<any>(null);

const fetchData = async () => {
  await kanbanStore.fetchBoard();
};

const onDragStart = (event: DragEvent, taskId: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('taskId', taskId);
    event.dataTransfer.effectAllowed = 'move';
  }
};

const handleDrop = async (taskId: string, columnId: string) => {
  const targetCol = kanbanStore.columns.find(c => c._id === columnId);
  if (targetCol?.title.toLowerCase().includes('done')) {
    sounds.play('success');
  } else {
    sounds.play('drop');
  }
  await kanbanStore.moveTask(taskId, columnId);
};

const openTaskDetails = (task: any) => {
  selectedTask.value = task;
};

onMounted(fetchData);
</script>

<style scoped>
.kanban-board-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -1px;
}

.board-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  transition: var(--transition-fast);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.action-btn.primary {
  background: var(--accent-primary);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(157, 0, 255, 0.4);
}

.board-columns-wrapper {
  margin: 0 -40px;
  padding: 0 40px;
  overflow-x: auto;
  width: calc(100% + 80px);
}

.columns-scroll-container {
  display: flex;
  gap: 24px;
  padding-bottom: 24px;
  min-height: 600px;
  width: 100%;
}
</style>
