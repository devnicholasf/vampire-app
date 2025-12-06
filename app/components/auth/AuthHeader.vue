<template>
  <div class="text-center mb-8 animate-fade-in">
    <h1 class="text-4xl font-bold mb-2 whitespace-nowrap">
      <span class="text-primary font-semibold">Vampire: The Masquerade</span>
    </h1>
    <p class="text-text-secondary text-sm">
      {{ subtitle }}
    </p>
    <div class="mt-2 text-xs text-text-muted italic">
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  subtitle?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: 'Sistema de Gerenciamento de Campanhas',
  description: 'World of Darkness • Vampire: The Masquerade'
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.whitespace-nowrap {
  white-space: nowrap;
}
</style>