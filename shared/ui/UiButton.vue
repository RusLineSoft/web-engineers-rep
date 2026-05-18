<template>
  <button class="ui-button" :class="[variant]">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary' // 'primary' | 'secondary'
  }
});
</script>

<style scoped>
.ui-button {
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
  border: none;
  font-family: inherit;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ui-button.primary {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(157, 0, 255, 0.3);
}
.ui-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(157, 0, 255, 0.5);
}

.ui-button.secondary {
  background: var(--bg-panel-light);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
}
.ui-button.secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--accent-secondary);
}
</style>
