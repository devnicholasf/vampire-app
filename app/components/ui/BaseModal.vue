<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Overlay -->
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="handleBackdropClick"
      ></div>

      <!-- Modal Content -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      
      <div
        :class="[modalClasses, panelClass]"
        class="inline-block align-bottom bg-surface-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle"
      >
        <!-- Header -->
        <div v-if="$slots.header || title" class="bg-surface border-b border-border-primary px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <slot name="header">
                <h3 class="text-lg leading-6 font-semibold text-text-primary">
                  {{ title }}
                </h3>
                <p v-if="subtitle" class="text-sm text-text-muted">{{ subtitle }}</p>
              </slot>
            </div>
            <BaseButton
              v-if="closable"
              variant="ghost"
              size="sm"
              @click="close"
              class="text-text-muted hover:text-text-primary"
            >
              ✕
            </BaseButton>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-4">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="bg-surface border-t border-border-primary px-6 py-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================
// BaseModal - Modal reutilizável
// ============================================
import { computed, watch } from 'vue'

interface Props {
  show: boolean
  title?: string
  subtitle?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  closable?: boolean
  closeOnBackdrop?: boolean
  panelClass?: string
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  panelClass: ''
})

const panelClass = computed(() => props.panelClass)

const emit = defineEmits<Emits>()

const modalClasses = computed(() => {
  const sizes = {
    'xs': 'sm:max-w-xs',
    'sm': 'sm:max-w-sm',
    'md': 'sm:max-w-md',
    'lg': 'sm:max-w-lg',
    'xl': 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    'full': 'sm:max-w-full mx-4'
  }

  return [
    'w-full',
    sizes[props.size]
  ]
})

const close = () => {
  emit('update:show', false)
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

// Lock/unlock body scroll
watch(() => props.show, (newValue) => {
  if (process.client) {
    if (newValue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
/* Animações específicas do modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>