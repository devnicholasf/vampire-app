<template>
  <div 
    class="timeline-item relative"
    :class="{ 
      'pb-8': !isLast,
      'opacity-75 hover:opacity-100': !isFirst,
      'transform scale-105': isFirst 
    }"
  >
    <!-- Timeline Line -->
    <div 
      v-if="!isLast"
      class="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-red-500 to-transparent"
    ></div>

    <!-- Event Card -->
    <div class="flex items-start gap-4">
      <!-- Event Icon -->
      <div 
        class="flex-shrink-0 w-12 h-12 rounded-full bg-surface flex items-center justify-center border-2 relative z-10"
        :class="eventIconClasses"
      >
        <span class="text-lg">{{ eventIcon }}</span>
      </div>

      <!-- Event Content -->
      <div class="flex-1 bg-surface-card border border-border-primary rounded-lg p-4 hover:border-red-500 transition-all duration-300">
        <!-- Header -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h4 class="text-lg font-semibold text-text-primary">{{ event.title }}</h4>
            <div class="flex items-center gap-4 text-sm text-text-muted">
              <span class="flex items-center gap-1">
                <span>{{ eventTypeLabel }}</span>
              </span>
              <span v-if="event.session" class="flex items-center gap-1">
                📅 Sessão {{ event.session }}
              </span>
              <span class="flex items-center gap-1">
                🕒 {{ formatDate(event.createdAt) }}
              </span>
              <span v-if="event.author" class="flex items-center gap-1">
                👤 {{ event.author.username }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="canEdit" class="flex items-center gap-1 ml-4">
            <BaseButton
              variant="ghost"
              size="sm"
              @click="$emit('edit', event)"
              class="!p-1 !min-w-0"
            >
              ✏️
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="$emit('delete', event.id)"
              class="!p-1 !min-w-0 hover:!bg-red-600"
            >
              🗑️
            </BaseButton>
          </div>
        </div>

        <!-- Description -->
        <div class="text-text-secondary leading-relaxed">
          <p v-if="!isExpanded && event.description.length > 200">
            {{ event.description.substring(0, 200) }}...
            <button 
              @click="isExpanded = true"
              class="text-red-400 hover:text-red-300 ml-1 font-medium"
            >
              ver mais
            </button>
          </p>
          <p v-else>
            {{ event.description }}
            <button 
              v-if="event.description.length > 200"
              @click="isExpanded = false"
              class="text-red-400 hover:text-red-300 ml-1 font-medium"
            >
              ver menos
            </button>
          </p>
        </div>

        <!-- Event Tags -->
        <div v-if="event.type || event.session" class="flex items-center gap-2 mt-3">
          <BaseBadge
            :variant="getEventVariant(event.type)"
            size="xs"
            :iconLeft="eventIcon"
          >
            {{ eventTypeLabel }}
          </BaseBadge>
          
          <BaseBadge
            v-if="event.session"
            variant="ghost"
            size="xs"
            iconLeft="📅"
          >
            Sessão {{ event.session }}
          </BaseBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimelineEvent } from '~/types'

// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'

// ============================================
// Timeline Item Component - Item individual da timeline
// ============================================

interface Props {
  event: TimelineEvent
  index: number
  canEdit: boolean
  isFirst: boolean
  isLast: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [event: TimelineEvent]
  delete: [eventId: string]
}>()

// Local state
const isExpanded = ref(false)

// ============================================
// Computed Properties
// ============================================
const eventIcon = computed(() => {
  const icons = {
    combat: '⚔️',
    roleplay: '🎭', 
    discovery: '🔍',
    social: '👥',
    investigation: '🕵️',
    travel: '🚶',
    other: '📝'
  }
  return icons[props.event.type] || '📝'
})

const eventTypeLabel = computed(() => {
  const labels = {
    combat: 'Combate',
    roleplay: 'Roleplay',
    discovery: 'Descoberta', 
    social: 'Social',
    investigation: 'Investigação',
    travel: 'Viagem',
    other: 'Outro'
  }
  return labels[props.event.type] || 'Evento'
})

const eventIconClasses = computed(() => {
  const classes = {
    combat: 'border-red-500 bg-red-500/20 text-red-400',
    roleplay: 'border-purple-500 bg-purple-500/20 text-purple-400',
    discovery: 'border-yellow-500 bg-yellow-500/20 text-yellow-400',
    social: 'border-blue-500 bg-blue-500/20 text-blue-400',
    investigation: 'border-green-500 bg-green-500/20 text-green-400',
    travel: 'border-orange-500 bg-orange-500/20 text-orange-400',
    other: 'border-gray-500 bg-gray-500/20 text-gray-400'
  }
  return classes[props.event.type] || classes.other
})

const eventTypeClasses = computed(() => {
  const classes = {
    combat: 'bg-red-500/20 text-red-400 border border-red-500',
    roleplay: 'bg-purple-500/20 text-purple-400 border border-purple-500',
    discovery: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500',
    social: 'bg-blue-500/20 text-blue-400 border border-blue-500',
    investigation: 'bg-green-500/20 text-green-400 border border-green-500',
    travel: 'bg-orange-500/20 text-orange-400 border border-orange-500',
    other: 'bg-gray-500/20 text-gray-400 border border-gray-500'
  }
  return classes[props.event.type] || classes.other
})

// ============================================
// Methods
// ============================================
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEventVariant = (type: string) => {
  const variants: Record<string, 'error' | 'primary' | 'secondary' | 'ghost' | 'outline' | 'success' | 'warning' | 'info'> = {
    combat: 'error',
    roleplay: 'secondary',
    discovery: 'warning',
    social: 'info',
    investigation: 'success',
    travel: 'info',
    other: 'ghost'
  }
  return variants[type] || 'ghost'
}
</script>

<style scoped>
.timeline-item {
  position: relative;
  transition: all 0.3s ease;
}

.timeline-item:hover {
  transform: translateX(4px);
}

/* Animation for new events */
.timeline-item.new-event {
  animation: slideInFromLeft 0.5s ease-out;
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>