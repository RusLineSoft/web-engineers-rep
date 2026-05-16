<script setup>
  var props = defineProps({
    title: {
      type: String,
      required: true,
    },
  });
</script>
<template>
  <SquareMenu :title="props.title">{{ GetValuesStorage(props.title) }}</SquareMenu>
</template>

