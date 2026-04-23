<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['btn-base', `btn-${variant}`, `btn-${size}`, { 'btn-full': fullWidth }]"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner">⟳</span>
    <span v-if="iconLeft" class="btn-icon-left">{{ iconLeft }}</span>
    <slot />
    <span v-if="iconRight" class="btn-icon-right">{{ iconRight }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  iconLeft?: string
  iconRight?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* ── Base ── */
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
  outline: none;
  position: relative;
  white-space: nowrap;
  font-family: inherit;
}
.btn-base:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ── Sizes ── */
.btn-sm  { padding: 0.375rem 0.75rem;  font-size: 0.75rem;  }
.btn-md  { padding: 0.625rem 1.25rem;  font-size: 0.875rem; }
.btn-lg  { padding: 0.875rem 2rem;     font-size: 1rem;     }
.btn-full { width: 100%; }

/* ── Primary ── */
.btn-primary {
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
  border-color: #b91c1c;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  box-shadow: 0 2px 10px rgba(127, 29, 29, 0.5);
}
.btn-primary:not(:disabled):hover {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  border-color: #dc2626;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.55);
  transform: scale(1.04);
}
.btn-primary:not(:disabled):active {
  transform: scale(0.98);
}

/* ── Ghost ── */
.btn-ghost {
  background: transparent;
  border-color: #4a4a5a;
  color: #9b9bbb;
}
.btn-ghost:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #9b9bbb;
  color: #ffffff;
}

/* ── Danger ── */
.btn-danger {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.3);
}
.btn-danger:not(:disabled):hover {
  background: #ef4444;
  border-color: #ef4444;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
  transform: scale(1.04);
}

/* ── Outline ── */
.btn-outline {
  background: transparent;
  border: 2px solid #dc2626;
  color: #dc2626;
}
.btn-outline:not(:disabled):hover {
  background: #dc2626;
  color: #ffffff;
  transform: scale(1.04);
}

/* ── Secondary ── */
.btn-secondary {
  background: #4c2b85;
  border-color: #4c2b85;
  color: #ffffff;
}
.btn-secondary:not(:disabled):hover {
  background: #5d35a0;
  transform: scale(1.04);
}

/* ── Spinner ── */
.btn-spinner {
  display: inline-block;
  margin-right: 0.5rem;
  animation: btn-spin 1s linear infinite;
}
@keyframes btn-spin { to { transform: rotate(360deg); } }

.btn-icon-left  { margin-right: 0.5rem; }
.btn-icon-right { margin-left: 0.5rem; }
</style>
