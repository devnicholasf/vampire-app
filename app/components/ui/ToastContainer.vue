<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'relative rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ease-in-out overflow-hidden',
            toastClasses[toast.type]
          ]"
        >
          <!-- Progress bar para toasts temporários -->
          <div
            v-if="!toast.persistent && toast.duration"
            :class="[
              'absolute top-0 left-0 h-1 transition-all ease-linear',
              progressBarClasses[toast.type]
            ]"
            :style="{
              width: '100%',
              animation: `toast-progress ${toast.duration}ms linear forwards`
            }"
          ></div>

          <div class="p-4 pr-12">
            <!-- Header com ícone -->
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <component 
                  :is="iconComponents[toast.type]" 
                  :class="[
                    'w-6 h-6',
                    iconClasses[toast.type]
                  ]"
                />
              </div>
              
              <div class="flex-1">
                <!-- Título -->
                <p :class="[
                  'font-semibold text-sm leading-5',
                  titleClasses[toast.type]
                ]">
                  {{ toast.title }}
                </p>
                
                <!-- Mensagem -->
                <p 
                  v-if="toast.message" 
                  :class="[
                    'mt-1 text-sm leading-4',
                    messageClasses[toast.type]
                  ]"
                >
                  {{ toast.message }}
                </p>
              </div>
            </div>
          </div>

          <!-- Botão fechar -->
          <button
            @click="removeToast(toast.id)"
            :class="[
              'absolute top-2 right-2 p-1.5 rounded-md transition-colors',
              closeButtonClasses[toast.type]
            ]"
            aria-label="Fechar notificação"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { toasts, removeToast } = useToast()

// Ícones como strings SVG ou componentes
const iconComponents = {
  success: 'CheckCircleIcon',
  error: 'XCircleIcon',
  warning: 'ExclamationTriangleIcon',
  info: 'InformationCircleIcon'
}

// Classes para diferentes tipos de toast
const toastClasses = {
  success: 'bg-green-50/95 border-green-200 shadow-green-100/50',
  error: 'bg-red-50/95 border-red-200 shadow-red-100/50',
  warning: 'bg-yellow-50/95 border-yellow-200 shadow-yellow-100/50',
  info: 'bg-blue-50/95 border-blue-200 shadow-blue-100/50'
}

const progressBarClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500'
}

const iconClasses = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600'
}

const titleClasses = {
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-yellow-900',
  info: 'text-blue-900'
}

const messageClasses = {
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-yellow-700',
  info: 'text-blue-700'
}

const closeButtonClasses = {
  success: 'text-green-500 hover:bg-green-100 hover:text-green-700',
  error: 'text-red-500 hover:bg-red-100 hover:text-red-700',
  warning: 'text-yellow-500 hover:bg-yellow-100 hover:text-yellow-700',
  info: 'text-blue-500 hover:bg-blue-100 hover:text-blue-700'
}

// Componentes de ícones simplificados
const CheckCircleIcon = {
  template: `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const XCircleIcon = {
  template: `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const ExclamationTriangleIcon = {
  template: `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  `
}

const InformationCircleIcon = {
  template: `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}
</script>

<style scoped>
/* Animações dos toasts */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Animação da barra de progresso */
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>