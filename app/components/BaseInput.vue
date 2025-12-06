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
        :type="type"
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
        v-bind="$attrs"
      />

      <!-- Icon Right -->
      <div
        v-if="$slots.iconRight || iconRight || error"
        class="absolute right-3 top-1/2 -translate-y-1/2"
        :class="error ? 'text-error' : 'text-text-muted'"
      >
        <slot name="iconRight">
          <span v-if="error">⚠️</span>
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
  </div>
</template>

<script setup lang="ts">
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
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

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
  if (props.iconRight || slots.iconRight || props.error || props.loading) {
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

  return [
    ...base,
    sizes[props.size],
    ...iconPadding,
    ...stateStyles,
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
