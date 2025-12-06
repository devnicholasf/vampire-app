<template>
  <div class="timeline-container">
    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-2">
      <BaseBadge
        :variant="selectedType === null ? 'primary' : 'ghost'"
        size="sm"
        class="cursor-pointer"
        @click="selectedType = null"
      >
        Todos ({{ events.length }})
      </BaseBadge>
      
      <BaseBadge
        v-for="type in eventTypes"
        :key="type.id"
        :variant="selectedType === type.id ? 'primary' : 'ghost'"
        size="sm"
        :iconLeft="type.icon"
        class="cursor-pointer"
        @click="selectedType = type.id"
      >
        {{ type.name }} ({{ getEventCountByType(type.id) }})
      </BaseBadge>
    </div>

    <!-- Session Filter -->
    <div v-if="sessionNumbers.length > 1" class="mb-6">
      <label class="text-sm text-text-muted mb-2 block">Filtrar por sessão:</label>
      <select 
        v-model="selectedSession"
        class="bg-surface border border-border-primary rounded px-3 py-1 text-text-primary"
      >
        <option :value="null">Todas as sessões</option>
        <option 
          v-for="session in sessionNumbers" 
          :key="session"
          :value="session"
        >
          Sessão {{ session }}
        </option>
      </select>
    </div>

    <!-- Timeline -->
    <div class="space-y-4">
      <!-- Empty State -->
      <div v-if="filteredEvents.length === 0" class="text-center py-12">
        <div class="text-4xl mb-2">📜</div>
        <h3 class="text-lg font-semibold text-text-primary mb-1">Nenhum evento encontrado</h3>
        <p class="text-text-muted">
          {{ selectedType || selectedSession ? 'Tente ajustar os filtros' : 'A história ainda está por ser escrita...' }}
        </p>
      </div>

      <!-- Timeline Items -->
      <TimelineItem
        v-for="(event, index) in filteredEvents"
        :key="event.id"
        :event="event"
        :index="index"
        :can-edit="canEdit"
        :is-first="index === 0"
        :is-last="index === filteredEvents.length - 1"
        @edit="handleEditEvent"
        @delete="handleDeleteEvent"
      />
    </div>

    <!-- Loading More -->
    <div v-if="loadingMore" class="text-center py-6">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
      <p class="text-text-muted mt-2">Carregando mais eventos...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimelineEvent, TimelineEventType } from '~/types'

// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import TimelineItem from '~/components/campaign/TimelineItem.vue'

// ============================================
// Timeline Component - Lista de eventos da campanha
// ============================================

interface Props {
  campaignId: string
  canEdit: boolean
}

const props = defineProps<Props>()

// Mock composable for now (will be implemented with backend)
const events = ref<TimelineEvent[]>([])
const loading = ref(false)
const loadingMore = ref(false)

// Mock methods
const fetchEvents = async () => {
  console.log('Fetching events for campaign:', props.campaignId)
  // Simulate loading
  events.value = []
}

const deleteEvent = async (eventId: string) => {
  console.log('Deleting event:', eventId)
  events.value = events.value.filter(e => e.id !== eventId)
}

const filterByType = (type: TimelineEventType) => {
  return events.value.filter(event => event.type === type)
}

const filterBySession = (session: number) => {
  return events.value.filter(event => event.session === session)
}

// Filters
const selectedType = ref<TimelineEventType | null>(null)
const selectedSession = ref<number | null>(null)

// Event types for filtering
const eventTypes = [
  { id: 'combat', name: 'Combate', icon: '⚔️' },
  { id: 'roleplay', name: 'Roleplay', icon: '🎭' },
  { id: 'discovery', name: 'Descoberta', icon: '🔍' },
  { id: 'social', name: 'Social', icon: '👥' },
  { id: 'investigation', name: 'Investigação', icon: '🕵️' },
  { id: 'travel', name: 'Viagem', icon: '🚶' },
  { id: 'other', name: 'Outro', icon: '📝' }
] as const

// ============================================
// Computed Properties
// ============================================
const filteredEvents = computed(() => {
  let filtered = [...events.value]

  if (selectedType.value) {
    filtered = filterByType(selectedType.value)
  }

  if (selectedSession.value) {
    filtered = filtered.filter(event => event.session === selectedSession.value)
  }

  // Sort by creation date (newest first)
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const sessionNumbers = computed(() => {
  const sessions = events.value
    .map((event: TimelineEvent) => event.session)
    .filter((session: number | undefined) => session !== undefined && session !== null)
    .filter((session: number | undefined, index: number, arr: (number | undefined)[]) => arr.indexOf(session) === index)
    .sort((a: number | undefined, b: number | undefined) => (a || 0) - (b || 0))
  
  return sessions.filter((s): s is number => typeof s === 'number')
})

// ============================================
// Methods
// ============================================
const getEventCountByType = (type: TimelineEventType) => {
  return events.value.filter((event: TimelineEvent) => event.type === type).length
}

const handleEditEvent = (event: TimelineEvent) => {
  // Emit to parent or open edit modal
  console.log('Edit event:', event)
  // TODO: Implement edit functionality
}

const handleDeleteEvent = async (eventId: string) => {
  if (confirm('Tem certeza que deseja deletar este evento?')) {
    try {
      await deleteEvent(eventId)
    } catch (error) {
      console.error('Erro ao deletar evento:', error)
    }
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
  await fetchEvents()
})

// Watch for campaign changes
watch(() => props.campaignId, async (newId) => {
  if (newId) {
    await fetchEvents()
  }
})
</script>

<style scoped>
.timeline-container {
  max-width: 100%;
}
</style>