<template>
  <div 
    v-show="show"
    :class="toastClasses"
    class="fixed z-50 max-w-md w-full shadow-2xl rounded-lg pointer-events-auto overflow-hidden transform transition-all duration-300 backdrop-blur-sm"
    role="alert"
  >
    <div class="p-5">
      <div class="flex items-start gap-4">
        <div v-if="icon" class="flex-shrink-0">
          <div :class="iconBgClasses" class="w-12 h-12 rounded-full flex items-center justify-center">
            <span class="text-2xl">{{ icon }}</span>
          </div>
        </div>
        
        <div class="flex-1 pt-1">
          <p v-if="title" class="text-base font-bold mb-1" :class="titleClasses">
            {{ title }}
          </p>
          <p class="text-sm leading-relaxed" :class="messageClasses">
            {{ message }}
          </p>
        </div>

        <div v-if="dismissible" class="flex-shrink-0">
          <button
            :class="closeButtonClasses"
            class="p-1.5 rounded-md transition-all duration-200 hover:scale-110"
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
      class="h-1.5 bg-black bg-opacity-10"
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
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400',
    error: 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400', 
    warning: 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400',
    info: 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400'
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

const iconBgClasses = computed(() => {
  const variants = {
    success: 'bg-green-500 bg-opacity-20',
    error: 'bg-red-500 bg-opacity-20',
    warning: 'bg-red-500 bg-opacity-20',
    info: 'bg-red-500 bg-opacity-20'
  }
  return variants[props.variant]
})

const closeButtonClasses = computed(() => {
  const variants = {
    success: 'text-green-600 hover:bg-green-200',
    error: 'text-red-600 hover:bg-red-200',
    warning: 'text-red-600 hover:bg-red-200',
    info: 'text-red-600 hover:bg-red-200'
  }
  return variants[props.variant]
})

const titleClasses = computed(() => {
  const variants = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-red-900', 
    info: 'text-red-900'
  }
  return variants[props.variant]
})

const messageClasses = computed(() => {
  const variants = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-red-800',
    info: 'text-red-800'
  }
  return variants[props.variant]
})

const progressBarClasses = computed(() => {
  const variants = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-red-600',
    info: 'bg-red-600'
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