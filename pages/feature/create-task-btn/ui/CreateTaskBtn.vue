<script setup>
  import { SquareBtn } from '~/pages/shared';
</script>

<template>
  <SquareBtn>
    <span class="decorative__plus">+</span>
    <span>Создать задачу</span>
  </SquareBtn>
</template>

<style scoped>
span {
  display: block;
}
.decorative__plus {
  font-size: 67px;
}
</style>
