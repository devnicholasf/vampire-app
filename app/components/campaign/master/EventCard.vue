<template>
  <div class="ev-item" :class="isSecret ? 'ev-item--secret' : ''">
    <!-- Title + type badge -->
    <div class="flex items-start justify-between gap-2 mb-1">
      <p class="text-sm font-semibold text-white leading-tight">{{ title }}</p>
      <span
        class="shrink-0 text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
        :style="`color: ${typeColor}; border-color: ${typeColor}44; background: ${typeColor}11`"
      >
        <span
          class="inline-flex items-center justify-center w-4 h-4 rounded-full"
          :style="`background:${typeColor}22; box-shadow: inset 0 0 0 1px ${typeColor}66;`"
        >
          <svg
            class="w-2.5 h-2.5 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect v-if="typeIcon === 'book'" x="6" y="5" width="12" height="14" rx="2" />

            <path v-else-if="typeIcon === 'sword'" d="M12 4l3 3-3 3-3-3 3-3zm-1.3 6.7h2.6V20h-2.6v-9.3z" />

            <path v-else-if="typeIcon === 'users'" d="M8 13a3 3 0 110-6 3 3 0 010 6zm8 0a3 3 0 110-6 3 3 0 010 6zM5 19a3 3 0 013-3h0a3 3 0 013 3H5zm8 0a3 3 0 013-3h0a3 3 0 013 3h-6z" />

            <path v-else-if="typeIcon === 'search'" d="M10.5 4a6.5 6.5 0 014.98 10.67l3.92 3.91-1.41 1.42-3.92-3.92A6.5 6.5 0 1110.5 4z" />

            <path v-else-if="typeIcon === 'skull'" d="M12 4a7 7 0 00-7 7v2a3 3 0 003 3v3h8v-3a3 3 0 003-3v-2a7 7 0 00-7-7zm-2 8a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z" />

            <path v-else-if="typeIcon === 'droplet'" d="M12 3c3 4 6 7 6 10a6 6 0 11-12 0c0-3 3-6 6-10z" />

            <path v-else-if="typeIcon === 'zap'" d="M13.5 3L5 13h5l-1.5 8L19 11h-5.5L13.5 3z" />

            <path v-else-if="typeIcon === 'flag'" d="M6 4h2v16H6V4zm2 1h9l-2 3 2 3H8V5z" />

            <path v-else-if="typeIcon === 'moon'" d="M16.8 15.8A7 7 0 018.2 7.2a8 8 0 108.6 8.6z" />

            <circle v-else cx="12" cy="12" r="6" />
          </svg>
        </span>
        <span>{{ typeLabelUpper }}</span>
      </span>
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

    <!-- Involved characters avatars -->
    <div v-if="playerAvatars?.length" class="mt-2 flex justify-end">
      <div class="flex items-center -space-x-2">
        <img
          v-for="(avatarUrl, idx) in playerAvatars"
          :key="`${avatarUrl}-${idx}`"
          :src="avatarUrl"
          :alt="`Avatar do personagem ${idx + 1}`"
          class="w-7 h-7 rounded-full object-cover border border-[#0a0a1a] shadow-sm"
          loading="lazy"
        >
      </div>
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
  playerAvatars?: string[]
  npcIds?: string[]
}>()

const typeColor = computed(() =>
  EVENT_TYPE_CONFIG[props.type as EventType]?.color ?? '#4a4a5a'
)

const typeLabel = computed(() =>
  EVENT_TYPE_CONFIG[props.type as EventType]?.label ?? props.type
)

const typeLabelUpper = computed(() => typeLabel.value.toUpperCase())

const typeIcon = computed(() =>
  EVENT_TYPE_CONFIG[props.type as EventType]?.icon ?? 'circle'
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
