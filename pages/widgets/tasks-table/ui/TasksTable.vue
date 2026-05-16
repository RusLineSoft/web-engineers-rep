<script setup>
  import { ref } from 'vue';
  import { CreateTaskBtn } from '~/pages/feature/create-task-btn';
  import { CheckTaskBtn } from '~/pages/feature/check-task-btn';
  import { CreateTaskMenu } from '~/pages/feature/create-task-menu';

  var isOpen = ref(false);
  var handleMenu = () => {
    isOpen.value = !isOpen.value;
  };
</script>

<template>
  <article>
    <h1>title</h1>
    <section>
      <CheckTaskBtn />
      <CreateTaskBtn @click="handleMenu" />
      <Teleport v-if="isOpen" to="body">
        <CreateTaskMenu />
      </Teleport>
    </section>
  </article>
</template>
