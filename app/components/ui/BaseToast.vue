<template>
  <div 
    v-show="show"
    :class="toastClasses"
    class="fixed z-50 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden"
    role="alert"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div v-if="icon" class="flex-shrink-0">
          <span class="text-lg">{{ icon }}</span>
        </div>
        
        <div class="ml-3 w-0 flex-1">
          <p v-if="title" class="text-sm font-semibold" :class="titleClasses">
            {{ title }}
          </p>
          <p class="text-sm" :class="messageClasses">
            {{ message }}
          </p>
        </div>

        <div v-if="dismissible" class="ml-4 flex-shrink-0 flex">
          <button
            class="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            @click="dismiss"
          >
            <span class="sr-only">Fechar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Progress bar for auto-dismiss -->
    <div
      v-if="autoDismiss && duration > 0"
      class="h-1 bg-black bg-opacity-20"
    >
      <div
        class="h-full transition-all ease-linear"
        :class="progressBarClasses"
        :style="progressBarStyle"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================
// BaseToast - Sistema de notificações/toasts
// ============================================
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  message: string
  title?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  duration?: number // em milissegundos, 0 = não remove automaticamente
  dismissible?: boolean
  autoDismiss?: boolean
  show?: boolean
}

interface Emits {
  (e: 'dismiss'): void
  (e: 'update:show', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  position: 'top-right',
  duration: 5000,
  dismissible: true,
  autoDismiss: true,
  show: true
})

const emit = defineEmits<Emits>()

const progress = ref(100)
let timer: NodeJS.Timeout | null = null
let progressTimer: NodeJS.Timeout | null = null

const toastClasses = computed(() => {
  const variants = {
    success: 'bg-green-50 border border-green-200',
    error: 'bg-red-50 border border-red-200', 
    warning: 'bg-yellow-50 border border-yellow-200',
    info: 'bg-surface-card border border-border-primary'
  }

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return [
    variants[props.variant],
    positions[props.position]
  ]
})

const titleClasses = computed(() => {
  const variants = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800', 
    info: 'text-text-primary'
  }
  return variants[props.variant]
})

const messageClasses = computed(() => {
  const variants = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-yellow-700',
    info: 'text-text-secondary'
  }
  return variants[props.variant]
})

const progressBarClasses = computed(() => {
  const variants = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-brand-primary'
  }
  return variants[props.variant]
})

const progressBarStyle = computed(() => ({
  width: `${progress.value}%`
}))

const icon = computed(() => {
  const icons = {
    success: '✅',
    error: '❌', 
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[props.variant]
})

const dismiss = () => {
  clearTimers()
  emit('update:show', false)
  emit('dismiss')
}

const clearTimers = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const startAutoDismiss = () => {
  if (!props.autoDismiss || props.duration <= 0) return

  // Timer principal para remover
  timer = setTimeout(dismiss, props.duration)

  // Timer para atualizar barra de progresso
  const interval = 50 // Atualiza a cada 50ms
  const steps = props.duration / interval
  const decrement = 100 / steps

  progressTimer = setInterval(() => {
    progress.value -= decrement
    if (progress.value <= 0) {
      progress.value = 0
      clearInterval(progressTimer!)
    }
  }, interval)
}

onMounted(() => {
  if (props.show) {
    startAutoDismiss()
  }
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style scoped>
/* Animações de entrada/saída */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>