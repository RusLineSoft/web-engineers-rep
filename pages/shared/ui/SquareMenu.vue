<script setup>
  var props = defineProps({
    title: {
      type: String,
      required: false,
      default: ''
    }
  })

</script>

<template>
  <article>
    <h2>{{ props.title }}</h2>
    <section>
      <slot />
    </section>
  </article>
</template>

<style scoped>
article {
  width: 20%;
  height: 500px;
  background-color: #292929;
}
</style>
