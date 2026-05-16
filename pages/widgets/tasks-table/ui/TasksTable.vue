<script setup>
  import { ref } from 'vue';
  import { CreateTaskBtn } from '~/pages/feature/create-task-btn';
  import { CheckTaskBtn } from '~/pages/feature/check-task-btn';
  import { CreateTaskMenu } from '~/pages/feature/create-task-menu';
  import { GetStorageKeys } from '..';
  import { TaskMenu } from '~/pages/feature/task-menu';

  var handleTaskDescription = ref(null)
  var handleCreatorTask = ref(false)

  var toggleTaskMenu = (key) => handleTaskDescription.value = handleTaskDescription.value === key ? null : key;
</script>

<template>
  <article>
    <h1>title</h1>
    <section>
      <CreateTaskBtn
        @click="handleCreatorTask = !handleCreatorTask"
      />
      <CheckTaskBtn
        v-for="key in GetStorageKeys()"
        :key="key"
        :taskName="key"
        @click="toggleTaskMenu(key)"
      />
      <Teleport to="body">
        <CreateTaskMenu v-if="handleCreatorTask" />
        <TaskMenu 
          v-else-if="handleTaskDescription !== null"
          :title="handleTaskDescription"
          @close="handleTaskDescription = null"
        />
      </Teleport>
    </section>
  </article>
</template>
