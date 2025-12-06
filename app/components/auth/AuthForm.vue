<template>
  <div class="space-y-6">
    <!-- Título -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-text-primary mb-2">
        {{ title }}
      </h2>
      <p class="text-text-secondary text-sm">
        {{ subtitle }}
      </p>
    </div>

    <!-- Mensagem de erro global -->
    <div
      v-if="globalError"
      class="p-4 bg-error/10 border border-error rounded-vampire text-error-light text-sm animate-slide-up"
      role="alert"
    >
      <div class="flex items-center">
        <span class="text-lg mr-2">⚠️</span>
        <span>{{ globalError }}</span>
      </div>
    </div>

    <!-- Slot para o formulário -->
    <slot />

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-border"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-surface text-text-muted">ou</span>
      </div>
    </div>

    <!-- Link adicional -->
    <div class="text-center">
      <p class="text-text-secondary text-sm">
        {{ linkText }}
        <NuxtLink
          :to="linkTo"
          class="text-secondary hover:text-secondary-light font-semibold transition-colors"
        >
          {{ linkLabel }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  globalError?: string | null
  linkText?: string
  linkTo?: string
  linkLabel?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Bem-vindo de volta',
  subtitle: 'Entre para acessar suas campanhas',
  globalError: null,
  linkText: 'Não tem uma conta?',
  linkTo: '/register',
  linkLabel: 'Criar conta'
})
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
  animation: slide-up 0.3s ease-out;
}
</style>