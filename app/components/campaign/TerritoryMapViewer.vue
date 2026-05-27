<template>
  <div class="territory-map-viewer">
    <!-- SVG Map with zones (read-only, no percentages) -->
    <div class="relative bg-[#0a0a1a] rounded-lg overflow-hidden" style="aspect-ratio: 16/9;">
      <svg
        v-if="imgW > 0 && imgH > 0"
        ref="svgEl"
        class="w-full h-full cursor-grab active:cursor-grabbing"
        :viewBox="`0 0 ${imgW} ${imgH}`"
        preserveAspectRatio="none"
        @mousedown="startPan"
        @mousemove="onPan"
        @mouseup="endPan"
        @mouseleave="endPan"
        @wheel.prevent="onWheel"
      >
        <!-- Map background image -->
        <image
          v-if="mapImageUrl"
          :href="mapImageUrl"
          x="0"
          y="0"
          :width="imgW"
          :height="imgH"
          preserveAspectRatio="none"
        />

        <!-- Territory zones -->
        <g v-for="(zone, zi) in territories" :key="'zone' + zi">
          <!-- Zone polygon -->
          <polygon
            :points="zone.points.map(p => `${p[0]},${p[1]}`).join(' ')"
            :fill="getZoneFillColor(zone)"
            :stroke="getZoneStrokeColor(zone)"
            :stroke-width="3 / zoom"
            :class="['tm-zone-hover', { 'tm-zone-war': zone.status === 'war' }]"
            @mouseenter="hoveredZone = zi"
            @mouseleave="hoveredZone = -1"
          />

          <!-- Zone label (name only) -->
          <text
            :x="getZoneCenter(zone)[0]"
            :y="getZoneCenter(zone)[1]"
            text-anchor="middle"
            :font-size="14 / zoom"
            :font-weight="700"
            fill="#d4a647"
            class="tm-zone-label pointer-events-none"
            style="text-shadow: 0 0 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)"
          >
            {{ zone.name || 'Território' }}
          </text>
        </g>
      </svg>
      
      <!-- Loading state -->
      <div v-else class="w-full h-full flex items-center justify-center">
        <p class="text-sm text-[#6b6b7b]">Carregando mapa...</p>
      </div>

      <!-- Tooltip on hover -->
      <div
        v-if="hoveredZone >= 0 && territories[hoveredZone]"
        class="absolute bottom-4 left-4 bg-[#0d0d20] border border-[#7f1d1d] rounded-lg p-3 pointer-events-none"
        style="box-shadow: 0 4px 16px rgba(0,0,0,0.6);"
      >
        <p class="text-df-gold font-bold text-sm mb-1">{{ territories[hoveredZone].name }}</p>
        <div class="flex items-center gap-2 text-xs">
          <span :style="{ color: getStatusConf(territories[hoveredZone].status).color }">
            {{ getStatusConf(territories[hoveredZone].status).emoji }}
            {{ getStatusConf(territories[hoveredZone].status).label }}
          </span>
        </div>
      </div>

      <!-- Zoom controls -->
      <div class="absolute top-4 right-4 flex flex-col gap-2">
        <button @click="zoomIn" class="tm-tool-btn bg-[#0d0d20] hover:bg-[#1a1a2e] border border-[#4a4a5a]">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button @click="zoomOut" class="tm-tool-btn bg-[#0d0d20] hover:bg-[#1a1a2e] border border-[#4a4a5a]">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button @click="resetView" class="tm-tool-btn bg-[#0d0d20] hover:bg-[#1a1a2e] border border-[#4a4a5a]">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

export interface TerritoryZone {
  name: string
  color: string
  description: string
  status: 'stable' | 'contested' | 'war' | 'abandoned'
  points: number[][]
  influences: Array<{ faction: string; percent: number; color: string }>
}

interface Props {
  territories: TerritoryZone[]
  mapImageUrl: string
}

const props = defineProps<Props>()

// Image dimensions (detected on load)
const imgW = ref(0)
const imgH = ref(0)

// Zoom and pan
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

// Hover state
const hoveredZone = ref(-1)

// Load image dimensions
const loadImageDimensions = () => {
  if (!props.mapImageUrl) {
    console.log('🗺️ No map image URL provided')
    return
  }
  
  const img = new Image()
  img.onload = () => {
    imgW.value = img.naturalWidth
    imgH.value = img.naturalHeight
    console.log('🗺️ Map image dimensions loaded:', imgW.value, 'x', imgH.value)
  }
  img.onerror = () => {
    console.error('🗺️ Failed to load map image:', props.mapImageUrl)
  }
  img.src = props.mapImageUrl
}

// Watch for map image URL changes
watch(() => props.mapImageUrl, () => {
  loadImageDimensions()
}, { immediate: true })

// Load on mount
onMounted(() => {
  loadImageDimensions()
})

// Status configuration
const statusConfig = {
  stable:     { label: 'Estável',     emoji: '🟢', color: '#22c55e' },
  contested:  { label: 'Contestado',  emoji: '🟡', color: '#eab308' },
  war:        { label: 'Em Guerra',   emoji: '🔴', color: '#ef4444' },
  abandoned:  { label: 'Abandonado',  emoji: '⚪', color: '#6b7280' }
}

const getStatusConf = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.stable
}

// Get dominant faction color for zone fill
const getDominantFaction = (zone: TerritoryZone) => {
  if (zone.influences.length === 0) return null
  return [...zone.influences].sort((a, b) => b.percent - a.percent)[0]
}

const getZoneFillColor = (zone: TerritoryZone) => {
  const dominant = getDominantFaction(zone)
  if (!dominant) return 'rgba(107, 114, 128, 0.25)'
  
  const hex = dominant.color
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, 0.4)`
}

const getZoneStrokeColor = (zone: TerritoryZone) => {
  const dominant = getDominantFaction(zone)
  return dominant ? dominant.color : '#6b7280'
}

// Calculate zone center for label
const getZoneCenter = (zone: TerritoryZone) => {
  if (zone.points.length === 0) return [imgW.value / 2, imgH.value / 2]
  const sumX = zone.points.reduce((acc, p) => acc + p[0], 0)
  const sumY = zone.points.reduce((acc, p) => acc + p[1], 0)
  return [sumX / zone.points.length, sumY / zone.points.length]
}

// Zoom controls
const zoomIn = () => {
  zoom.value = Math.min(zoom.value * 1.2, 5)
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value / 1.2, 0.5)
}

const resetView = () => {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}

const onWheel = (e: WheelEvent) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// Pan controls
const startPan = (e: MouseEvent) => {
  isPanning.value = true
  panStart.value = { x: e.clientX - pan.value.x, y: e.clientY - pan.value.y }
}

const onPan = (e: MouseEvent) => {
  if (!isPanning.value) return
  pan.value = {
    x: e.clientX - panStart.value.x,
    y: e.clientY - panStart.value.y
  }
}

const endPan = () => {
  isPanning.value = false
}
</script>

<style scoped>
.territory-map-viewer {
  width: 100%;
}

.tm-tool-btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #c4c4d4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-tool-btn:hover {
  color: #fff;
  border-color: #d4a647 !important;
}

.tm-zone-hover {
  cursor: pointer;
  transition: opacity 0.2s;
}

.tm-zone-hover:hover {
  opacity: 0.85;
  filter: brightness(1.2);
}

.tm-zone-war {
  animation: zone-war-pulse 1.2s ease-in-out infinite;
}

@keyframes zone-war-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.12; }
}

.tm-zone-label {
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
}
</style>
