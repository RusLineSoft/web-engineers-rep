<script setup>
  import { SquareMenu } from '~/pages/shared';
  var fn = () => {
    console.log('nyaaa~');
  };
</script>
<template>
  <SquareMenu title="Новая заметка">
    <form @submit.prevent="fn">
      <div>
        <label for="task-name">Task name:</label>
        <input placeholder="task name" id="task-name" type="text">
      </div>
      <button type="submit">Create a task</button>
    </form>
  </SquareMenu>
</template>

<style scoped>
div {
  display: grid;
}
input {
  display: inline-block;
}
</style>
