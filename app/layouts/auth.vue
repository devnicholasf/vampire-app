<template>
  <div class="min-h-screen bg-gradient-vampire flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Logo/Header -->
      <AuthHeader />

      <!-- Main Content Card -->
      <BaseCard variant="glass" class="animate-slide-up backdrop-blur-xl">
        <slot />
      </BaseCard>

      <!-- Footer -->
      <div class="text-center mt-6 text-text-muted text-sm">
        <slot name="footer">
          <p> Vampire: The Masquerade é uma propriedade da World of Darkness Entertainment. Conteúdo não oficial {{ new Date().getFullYear() }}&copy;</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout específico para páginas de autenticação
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out 0.2s both;
}
</style>
