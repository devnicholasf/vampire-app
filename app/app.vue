<template>
  <div class="min-h-screen bg-gradient-atmospheric text-text-primary">
    <NuxtPage />
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import ToastContainer from '~/components/ui/ToastContainer.vue'
</script>

<style>
body {
  @apply text-text-primary font-cinzel;
  background: linear-gradient(180deg, #000000 0%, #0A061F 50%, #120B2E 100%);
  min-height: 100vh;
}

* {
  font-family: 'Cinzel', serif;
}
</style>
