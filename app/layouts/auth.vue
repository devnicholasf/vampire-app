<template>
  <div class="min-h-screen bg-gradient-atmospheric flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-lg">
      <!-- Main Content Card -->
      <div class="bg-surface-card/80 backdrop-blur-xl border border-border-primary rounded-2xl p-8 shadow-card-vampire animate-fade-in">
        <slot />
      </div>

      <!-- Footer -->
      <div class="text-center mt-6 text-text-muted text-xs">
        <slot name="footer">
          <p>Vampire: The Masquerade &copy; {{ new Date().getFullYear() }} World of Darkness Entertainment</p>
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
