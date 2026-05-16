<script setup>
  import { reactive } from 'vue';
  import { SquareMenu } from '~/pages/shared';
  import { SetItemStorage } from '..';

  var TaskData = reactive({
    title: '',
    description: '',
  })
</script>

<template>
  <SquareMenu title="Новая заметка">
    <form @submit.prevent="SetItemStorage(TaskData.title, TaskData.description)">
      <div>
        <label for="task-name">Task name:</label>
        <input v-model="TaskData.title" placeholder="name" id="task-name" type="text">
      </div>
      <div>
        <label for="task-description">Task description:</label>
        <input v-model="TaskData.description" placeholder="description" id="task-description" type="text">
      </div>
      <button type="submit">Create a task</button>
    </form>
  </SquareMenu>
</template>

<style scoped>
div {
  display: grid;
}
</style>
