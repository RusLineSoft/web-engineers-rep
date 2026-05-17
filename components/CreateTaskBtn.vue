<script setup>
  var props = defineProps({
    text: {
      default: 'Создать задачу',
    }
  })
</script>

<template>
  <SquareBtn>
    <span class="decorative__plus">+</span>
    <span>{{ props.text }}</span>
  </SquareBtn>
</template>

<style scoped>
span {
  display: block;
  font-family: 'Breakthrough Bold';
}
.decorative__plus {
  font-size: 20px;
  width: 20px; 
  height: 20px;
}
</style>
