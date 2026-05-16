<script setup>
  import { SquareBtn } from '~/pages/shared';
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
