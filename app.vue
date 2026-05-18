<template>
  <div class="app-layout">
    <Sidebar />
    
    <div class="main-container">
      <Header />
      
      <main class="content-area">
        <NuxtPage />
      </main>
    </div>

    <UiToast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNuxtApp } from '#app';
import Sidebar from '~/widgets/sidebar/ui/Sidebar.vue';
import Header from '~/widgets/header/ui/Header.vue';
import UiToast from '~/shared/ui/UiToast.vue';

const toastRef = ref<InstanceType<typeof UiToast> | null>(null);

onMounted(() => {
  const nuxtApp = useNuxtApp();
  if (nuxtApp.$socket) {
    // @ts-ignore
    nuxtApp.$socket.on('notification:urgent', (data: any) => {
      if (toastRef.value) {
        toastRef.value.showToast({ message: data.message, type: 'urgent' });
      }
    });
  }
});
</script>

<style>
/* Global Layout Styles */
.app-layout {
  display: flex;
  height: 100vh;
  background-color: var(--bg-void);
  overflow: hidden;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 0 40px 40px;
  overflow-y: auto;
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
