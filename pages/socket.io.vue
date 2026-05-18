<template>
  <div></div>
</template>

<script setup>
// This page exists only to silence the "No match found" warning for /socket.io/
// The actual request is intercepted by the Socket.io server plugin.
definePageMeta({
  layout: false
});
</script>
