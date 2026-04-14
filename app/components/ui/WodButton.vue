<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :class="buttonClasses"
    :title="tooltip"
    @click="handleClick"
  >
    <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center relative overflow-hidden">
      <span class="text-white font-bold text-lg tracking-wide font-serif relative z-10 flex items-center">
        W<sub class="text-xs -ml-0.5">o</sub>D
      </span>
      <div class="absolute inset-0 bg-gradient-to-br from-transparent via-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  </a>
</template>

<script setup lang="ts">
// ============================================
// WodButton - Botão World of Darkness
// ============================================

interface Props {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  url?: string
  tooltip?: string
  variant?: 'default' | 'subtle'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
  size: 'md',
  url: 'https://www.paradoxinteractive.com/games/world-of-darkness/products/tabletop-roleplaying/vampire-the-masquerade',
  tooltip: 'Visite o site oficial do World of Darkness',
  variant: 'default'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// ============================================
// Computed Properties
// ============================================
const buttonClasses = computed(() => {
  const base = [
    'fixed',
    'rounded-full',
    'flex',
    'items-center',
    'justify-center',
    'shadow-2xl',
    'transition-all',
    'duration-300',
    'hover:scale-110',
    'group',
    'z-50'
  ]

  // Position classes
  const positions = {
    'bottom-right': ['bottom-6', 'right-6'],
    'bottom-left': ['bottom-6', 'left-6'],
    'top-right': ['top-6', 'right-6'],
    'top-left': ['top-6', 'left-6']
  }

  // Size classes
  const sizes = {
    sm: ['w-12', 'h-12'],
    md: ['w-16', 'h-16'],
    lg: ['w-20', 'h-20']
  }

  // Variant classes
  const variants = {
    default: [
      'bg-gradient-to-br',
      'from-red-600',
      'to-red-700',
      'hover:from-red-500',
      'hover:to-red-600',
      'shadow-red-900/50',
      'hover:shadow-red-900/70'
    ],
    subtle: [
      'bg-gradient-to-br',
      'from-red-800/80',
      'to-red-900/80',
      'hover:from-red-700/90',
      'hover:to-red-800/90',
      'shadow-red-950/30',
      'hover:shadow-red-950/50',
      'backdrop-blur-sm'
    ]
  }

  return [
    ...base,
    ...positions[props.position],
    ...sizes[props.size],
    ...variants[props.variant]
  ]
})

// ============================================
// Methods
// ============================================
const handleClick = (event: MouseEvent) => {
  emit('click', event)
  
  // Analytics tracking (optional)
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', 'click', {
      event_category: 'external_link',
      event_label: 'world_of_darkness_official',
      value: 1
    })
  }
}
</script>