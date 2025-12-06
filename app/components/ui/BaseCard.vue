<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Header -->
    <div
      v-if="$slots.header || title"
      class="px-6 py-4 border-b border-border"
    >
      <slot name="header">
        <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
      </slot>
    </div>

    <!-- Body -->
    <div :class="bodyClasses">
      <slot />
    </div>

    <!-- Footer -->
    <div
      v-if="$slots.footer"
      class="px-6 py-4 border-t border-border"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  padding?: boolean
  hoverable?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: true,
  hoverable: false,
  clickable: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => {
  const base = [
    'rounded-vampire',
    'transition-all',
    'duration-300',
  ]

  // Variants
  const variants = {
    default: [
      'bg-surface',
      'border',
      'border-border',
    ],
    elevated: [
      'bg-surface',
      'shadow-card',
      'border',
      'border-border/50',
    ],
    outlined: [
      'bg-transparent',
      'border-2',
      'border-border-focus/30',
    ],
    glass: [
      'bg-surface/40',
      'backdrop-blur-sm',
      'border',
      'border-border/50',
    ],
  }

  // Interactive states
  const interactive = []
  if (props.hoverable) {
    interactive.push(
      'hover:border-border-focus/50',
      'hover:shadow-card-hover',
      'hover:-translate-y-1'
    )
  }
  if (props.clickable) {
    interactive.push('cursor-pointer')
  }

  return [
    ...base,
    ...variants[props.variant],
    ...interactive,
  ]
})

const bodyClasses = computed(() => {
  return props.padding ? 'p-6' : ''
})

const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>
