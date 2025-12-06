<template>
  <span :class="badgeClasses">
    <span v-if="iconLeft" class="mr-1">{{ iconLeft }}</span>
    <slot />
    <span v-if="iconRight" class="ml-1">{{ iconRight }}</span>
  </span>
</template>

<script setup lang="ts">
// ============================================
// BaseBadge - Componente de badge reutilizável
// ============================================

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  iconLeft?: string
  iconRight?: string
  pulse?: boolean
  glow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'sm',
  rounded: 'md',
  pulse: false,
  glow: false
})

// ============================================
// Computed Properties
// ============================================
const badgeClasses = computed(() => {
  const base = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-all',
    'duration-200',
    'whitespace-nowrap'
  ]

  // Size classes
  const sizes = {
    xs: ['px-1.5', 'py-0.5', 'text-xs'],
    sm: ['px-2', 'py-1', 'text-xs'],
    md: ['px-2.5', 'py-1.5', 'text-sm'],
    lg: ['px-3', 'py-2', 'text-base']
  }

  // Rounded classes
  const rounded = {
    none: ['rounded-none'],
    sm: ['rounded-sm'],
    md: ['rounded'],
    lg: ['rounded-lg'],
    full: ['rounded-full']
  }

  // Variant classes
  const variants = {
    primary: [
      'bg-red-600',
      'text-white',
      'border',
      'border-red-600',
      'hover:bg-red-500',
      'hover:border-red-500'
    ],
    secondary: [
      'bg-purple-600',
      'text-white', 
      'border',
      'border-purple-600',
      'hover:bg-purple-500',
      'hover:border-purple-500'
    ],
    success: [
      'bg-green-600',
      'text-white',
      'border',
      'border-green-600',
      'hover:bg-green-500',
      'hover:border-green-500'
    ],
    warning: [
      'bg-yellow-600',
      'text-white',
      'border',
      'border-yellow-600',
      'hover:bg-yellow-500',
      'hover:border-yellow-500'
    ],
    error: [
      'bg-red-700',
      'text-white',
      'border',
      'border-red-700',
      'hover:bg-red-600',
      'hover:border-red-600'
    ],
    info: [
      'bg-blue-600',
      'text-white',
      'border',
      'border-blue-600',
      'hover:bg-blue-500',
      'hover:border-blue-500'
    ],
    ghost: [
      'bg-transparent',
      'text-text-muted',
      'border',
      'border-border-primary',
      'hover:bg-surface-hover',
      'hover:text-text-primary'
    ],
    outline: [
      'bg-transparent',
      'text-red-400',
      'border',
      'border-red-400',
      'hover:bg-red-400',
      'hover:text-white'
    ]
  }

  // Additional effects
  const effects = []
  
  if (props.pulse) {
    effects.push('animate-pulse')
  }
  
  if (props.glow) {
    if (props.variant === 'primary') {
      effects.push('shadow-lg', 'shadow-red-500/50')
    } else if (props.variant === 'secondary') {
      effects.push('shadow-lg', 'shadow-purple-500/50')
    } else if (props.variant === 'success') {
      effects.push('shadow-lg', 'shadow-green-500/50')
    } else {
      effects.push('shadow-lg', 'shadow-gray-500/50')
    }
  }

  return [
    ...base,
    ...sizes[props.size],
    ...rounded[props.rounded],
    ...variants[props.variant],
    ...effects
  ]
})
</script>

<style scoped>
/* Custom animations for badges */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}
</style>