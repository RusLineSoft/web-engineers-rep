<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="ui-toast glass-panel"
        :class="toast.type"
      >
        <div class="toast-content">
          <span class="icon">🔔</span>
          <span class="message">{{ toast.message }}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const toasts = ref<{ id: number, message: string, type: string }[]>([]);
let nextId = 0;

interface ToastOptions {
  message: string;
  type?: string;
  duration?: number;
}

const showToast = (options: ToastOptions) => {
  const id = nextId++;
  toasts.value.push({ id, message: options.message, type: options.type || 'info' });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, options.duration || 5000);
};

// Expose so parent can access
defineExpose({ showToast });
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
  pointer-events: none;
}

.ui-toast {
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  border-left: 4px solid var(--accent-cyan);
}

.ui-toast.urgent {
  border-left: 4px solid #ff0055;
  background: rgba(40, 10, 20, 0.8);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  font-size: 1.2rem;
}

.message {
  font-weight: 500;
  font-size: 0.95rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
