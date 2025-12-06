<template>
  <div class="min-h-screen bg-gradient-atmospheric text-text-primary">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// App principal - apenas roteamento
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
