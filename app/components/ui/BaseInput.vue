<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium mb-2 transition-colors"
      :class="[
        error ? 'text-error' : 'text-text-secondary',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      {{ label }}
      <span v-if="required" class="text-error ml-1">*</span>
    </label>

    <!-- Input Wrapper -->
    <div class="relative">
      <!-- Icon Left -->
      <div
        v-if="$slots.iconLeft || iconLeft"
        class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        :class="error ? 'text-error' : 'text-text-muted'"
      >
        <slot name="iconLeft">
          <span>{{ iconLeft }}</span>
        </slot>
      </div>

      <!-- Input Field -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readOnly"
        :required="required"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="detectCapsLock"
        v-bind="$attrs"
      />

      <!-- Icon Right -->
      <div
        v-if="$slots.iconRight || iconRight || error || showPasswordToggle"
        class="absolute right-3 top-1/2 -translate-y-1/2"
        :class="error ? 'text-error' : 'text-text-muted'"
      >
        <slot name="iconRight">
          <!-- Password Toggle -->
          <button
            v-if="showPasswordToggle"
            type="button"
            @click="togglePasswordVisibility"
            class="hover:text-text-primary transition-colors duration-200 focus:outline-none"
            :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
          >
            <span v-if="showPassword">👁️</span>
            <span v-else>👁️‍🗨️</span>
          </button>
          <!-- Error Icon -->
          <span v-else-if="error">⚠️</span>
          <!-- Custom Icon -->
          <span v-else-if="iconRight">{{ iconRight }}</span>
        </slot>
      </div>

      <!-- Loading Spinner -->
      <div
        v-if="loading"
        class="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <div class="w-5 h-5 border-2 border-border-focus border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>

    <!-- Helper Text / Error Message -->
    <p
      v-if="helperText || error"
      class="mt-2 text-sm transition-colors"
      :class="error ? 'text-error' : 'text-text-muted'"
    >
      {{ error || helperText }}
    </p>

    <!-- CAPS LOCK Warning -->
    <div
      v-if="showCapsWarning"
      class="mt-2 flex items-center space-x-2 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-400/30 rounded-lg px-3 py-2 animate-fade-in"
    >
      <span>🔒</span>
      <span class="font-medium">CAPS LOCK está ativado</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue 3 imports
import { ref, computed, useSlots } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  label?: string
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  loading?: boolean
  iconLeft?: string
  iconRight?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  variant: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const slots = useSlots()
const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)

// ID único e estável para evitar hydration mismatch
let idCounter = 0
const generateId = () => `input-${++idCounter}-${Date.now()}`
const inputId = process.client ? generateId() : 'input-ssr'

// Password visibility
const showPassword = ref(false)
const showPasswordToggle = computed(() => props.type === 'password')
const actualType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

// CAPS LOCK detection
const capsLockOn = ref(false)
const showCapsWarning = computed(() => {
  return capsLockOn.value && isFocused.value && (props.type === 'password' || props.type === 'email')
})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const detectCapsLock = (event: KeyboardEvent) => {
  capsLockOn.value = event.getModifierState('CapsLock')
}

// Classes dinâmicas
const inputClasses = computed(() => {
  const base = [
    'w-full',
    'bg-surface',
    'border-2',
    'rounded-vampire',
    'font-medium',
    'transition-all',
    'duration-200',
    'placeholder:text-text-muted',
    'focus:outline-none',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ]

  // Size
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  }

  // Icons padding
  const iconPadding = []
  if (props.iconLeft || slots.iconLeft) {
    iconPadding.push('pl-10')
  }
  if (props.iconRight || slots.iconRight || props.error || props.loading || showPasswordToggle.value) {
    iconPadding.push('pr-10')
  }

  // State styles
  const stateStyles = []
  if (props.error) {
    stateStyles.push(
      'border-error',
      'text-error-light',
      'focus:border-error',
      'focus:ring-2',
      'focus:ring-error/20'
    )
  } else if (isFocused.value) {
    stateStyles.push(
      'border-border-focus',
      'text-text-primary',
      'focus:border-border-focus',
      'focus:ring-2',
      'focus:ring-border-focus/20',
      'shadow-glow-red'
    )
  } else {
    stateStyles.push(
      'border-border',
      'text-text-primary',
      'hover:border-border-light',
      'focus:border-border-focus',
      'focus:ring-2',
      'focus:ring-border-focus/20'
    )
  }

  // Variant
  if (props.variant === 'filled') {
    stateStyles.push('bg-surface-dark')
  }

  // Normalize text case - prevent all caps
  const textStyles = ['normal-case']

  return [
    ...base,
    sizes[props.size],
    ...iconPadding,
    ...stateStyles,
    ...textStyles,
  ]
})

// Handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
