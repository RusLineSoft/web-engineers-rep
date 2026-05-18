<script setup>
  import UiButton from '~/shared/ui/UiButton.vue';
  var fn = () => {
    console.log('nyaaa~');
  };
</script>
<template>
  <div class="glass-panel menu-container">
    <h2>Новая заметка</h2>
    <form @submit.prevent="fn">
      <div class="input-group">
        <label for="task-name">Task name:</label>
        <input placeholder="task name" id="task-name" type="text" class="glass-input">
      </div>
      <UiButton type="submit">Create a task</UiButton>
    </form>
  </div>
</template>

<style scoped>
div {
  display: grid;
}
input {
  display: inline-block;
}
</style>
