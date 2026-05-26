<template>
  <div class="fixed top-4 right-4 z-[10000] flex flex-col gap-3 pointer-events-none">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
      move-class="transition-transform duration-300"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto"
      >
        <div
          :class="getToastClasses(toast.type)"
          class="relative max-w-md w-full shadow-2xl rounded-lg overflow-hidden backdrop-blur-sm"
          role="alert"
        >
          <div class="p-5">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div :class="getIconBgClasses(toast.type)" class="w-12 h-12 rounded-full flex items-center justify-center">
                  <span class="text-2xl">{{ getIcon(toast.type) }}</span>
                </div>
              </div>
              
              <div class="flex-1 pt-1">
                <p v-if="toast.message" class="text-base font-bold mb-1" :class="getTitleClasses(toast.type)">
                  {{ toast.message }}
                </p>
                <p class="text-sm leading-relaxed" :class="getMessageClasses(toast.type)">
                  {{ toast.title }}
                </p>
              </div>

              <div class="flex-shrink-0">
                <button
                  :class="getCloseButtonClasses(toast.type)"
                  class="p-1.5 rounded-md transition-all duration-200 hover:scale-110"
                  @click="removeToast(toast.id)"
                >
                  <span class="sr-only">Fechar</span>
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-1.5 bg-black bg-opacity-10">
            <div
              :key="`progress-${toast.id}`"
              class="h-full progress-bar-animated"
              :class="getProgressBarClasses(toast.type)"
              :style="{ '--duration': `${toast.duration || 4000}ms` }"
            ></div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()

const getToastClasses = (type: string) => {
  const variants: Record<string, string> = {
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400',
    error: 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400',
    warning: 'bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400',
    info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400'
  }
  return variants[type] || variants.info
}

const getIconBgClasses = (type: string) => {
  const variants: Record<string, string> = {
    success: 'bg-green-500 bg-opacity-20',
    error: 'bg-red-500 bg-opacity-20',
    warning: 'bg-red-500 bg-opacity-20',
    info: 'bg-blue-500 bg-opacity-20'
  }
  return variants[type] || variants.info
}

const getTitleClasses = (type: string) => {
  const variants: Record<string, string> = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-red-900',
    info: 'text-blue-900'
  }
  return variants[type] || variants.info
}

const getMessageClasses = (type: string) => {
  const variants: Record<string, string> = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-red-800',
    info: 'text-blue-800'
  }
  return variants[type] || variants.info
}

const getCloseButtonClasses = (type: string) => {
  const variants: Record<string, string> = {
    success: 'text-green-600 hover:bg-green-200',
    error: 'text-red-600 hover:bg-red-200',
    warning: 'text-red-600 hover:bg-red-200',
    info: 'text-blue-600 hover:bg-blue-200'
  }
  return variants[type] || variants.info
}

const getProgressBarClasses = (type: string) => {
  const variants: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-red-600',
    info: 'bg-blue-600'
  }
  return variants[type] || variants.info
}

const getIcon = (type: string) => {
  const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.progress-bar-animated {
  width: 100%;
  animation: toast-progress var(--duration, 4000ms) linear forwards;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>