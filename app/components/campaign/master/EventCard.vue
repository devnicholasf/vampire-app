<template>
  <div class="ev-item" :class="isSecret ? 'ev-item--secret' : ''">
    <!-- Title + type badge -->
    <div class="flex items-start justify-between gap-2 mb-1">
      <p class="text-sm font-semibold text-white leading-tight">{{ title }}</p>
      <span
        class="shrink-0 text-xs px-2 py-0.5 rounded-full border"
        :style="`color: ${typeColor}; border-color: ${typeColor}44; background: ${typeColor}11`"
      >{{ typeLabel }}</span>
    </div>

    <!-- Description -->
    <p v-if="description" class="text-xs text-white/75 mb-1.5 leading-relaxed">{{ description }}</p>

    <!-- Meta row -->
    <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs" style="color: rgba(100,100,120,0.9)">
      <span v-if="location" class="flex items-center gap-1">
        <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {{ location }}
      </span>
      <span v-if="ingameDate" class="flex items-center gap-1">
        <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {{ ingameDate }}
      </span>
      <span v-if="occurredAt" class="flex items-center gap-1">
        <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ formattedDate }}
      </span>
      <span v-if="isSecret" class="text-red-500 flex items-center gap-1">
        <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        Secreto
      </span>
    </div>

    <!-- Involved characters -->
    <div v-if="playerNames?.length || npcIds?.length" class="flex flex-wrap gap-1 mt-2">
      <span
        v-for="name in playerNames"
        :key="name"
        class="text-xs px-2 py-0.5 rounded-full bg-blue-900/20 text-blue-400 border border-blue-900/30"
      >{{ name }}</span>
      <span
        v-for="id in npcIds"
        :key="id"
        class="text-xs px-2 py-0.5 rounded-full bg-purple-900/20 text-purple-400 border border-purple-900/30"
      >NPC: {{ id.slice(0, 8) }}…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EVENT_TYPE_CONFIG, type EventType } from '~/composables/useEvents'

const props = defineProps<{
  title: string
  description?: string | null
  type: string
  occurredAt?: Date | string | null
  location?: string | null
  ingameDate?: string | null
  isSecret?: boolean
  playerNames?: string[]
  npcIds?: string[]
}>()

const typeColor = computed(() =>
  EVENT_TYPE_CONFIG[props.type as EventType]?.color ?? '#4a4a5a'
)

const typeLabel = computed(() =>
  EVENT_TYPE_CONFIG[props.type as EventType]?.label ?? props.type
)

const formattedDate = computed(() => {
  if (!props.occurredAt) return ''
  const d = props.occurredAt instanceof Date
    ? props.occurredAt
    : new Date(props.occurredAt as string)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(d)
})
</script>

<style scoped>
.ev-item {
  background: #0f0c22;
  border: 1px solid rgba(127, 29, 29, 0.35);
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s, background 0.2s;
}
.ev-item:hover {
  border-color: rgba(212, 166, 71, 0.4);
  background: #130f28;
}
.ev-item--secret {
  border-color: rgba(220, 38, 38, 0.4);
  background: rgba(80, 10, 10, 0.35);
}
</style>
