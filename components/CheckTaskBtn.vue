<script setup>
  var props = defineProps({
    taskName: {
      type: String,
      required: true,
      default: 'ГДЕ ИМЯ ТАСКИ?!?!',
    }
  });
</script>
<template>
  <SquareBtn>
  <span>{{ props.taskName }}</span>
  </SquareBtn>
</template>
