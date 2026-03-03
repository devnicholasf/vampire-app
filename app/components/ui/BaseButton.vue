<template>
  <button 
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2 inline-block animate-spin">⟳</span>
    <span v-if="iconLeft" class="mr-2">{{ iconLeft }}</span>
    <slot />
    <span v-if="iconRight" class="ml-2">{{ iconRight }}</span>
  </button>
</template>

<script setup lang="ts">
// Vue 3 imports
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

const buttonClasses = computed(() => {
  const base = [
    'font-semibold',
    'rounded-vampire',
    'transition-all',
    'duration-300',
    'transform',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-offset-background',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:transform-none',
    'inline-flex',
    'items-center',
    'justify-center',
  ]
  
  const variants = {
    primary: [
      'bg-gradient-to-br',
      'from-[#991b1b]',
      'to-[#450a0a]',
      'hover:from-[#b91c1c]',
      'hover:to-[#7f1d1d]',
      'text-red-300',
      'hover:text-white',
      'border',
      'border-[#7f1d1d]',
      'hover:shadow-[0_0_16px_rgba(220,38,38,0.4)]',
      'hover:scale-105',
      'focus:ring-red-800',
      'uppercase',
      'tracking-wider',
      'transition-all',
      'duration-300',
      'ease-in-out',
    ],
    secondary: [
      'bg-secondary',
      'hover:bg-secondary-700',
      'hover:brightness-110',
      'text-white',
      'shadow-glow-purple',
      'hover:scale-105',
      'focus:ring-secondary',
      'transition-all',
      'duration-300',
      'ease-in-out',
    ],
    ghost: [
      'bg-transparent',
      'hover:bg-surface-hover',
      'hover:brightness-110',
      'text-text-secondary',
      'hover:text-text-primary',
      'border',
      'border-border-primary',
      'hover:border-secondary',
      'transition-all',
      'duration-300',
      'ease-in-out',
    ],
    danger: [
      'bg-red-600',
      'hover:bg-red-500',
      'hover:brightness-110',
      'text-white',
      'shadow-glow-red',
      'hover:shadow-glow-red-hover',
      'hover:scale-105',
      'focus:ring-red-400',
      'transition-all',
      'duration-300',
      'ease-in-out',
    ],
    outline: [
      'bg-transparent',
      'border-2',
      'border-red-600',
      'text-red-600',
      'hover:bg-red-600',
      'hover:text-white',
      'hover:brightness-110',
      'hover:scale-105',
      'focus:ring-red-400',
      'transition-all',
      'duration-300',
      'ease-in-out',
    ],
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  const width = props.fullWidth ? 'w-full' : ''
  
  return [
    ...base,
    ...variants[props.variant],
    sizes[props.size],
    width,
  ]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
