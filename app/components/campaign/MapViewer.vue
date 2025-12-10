<template>
  <div class="map-viewer bg-surface-card rounded-lg border border-border-primary">
    <!-- Header -->
    <div class="p-4 border-b border-border-primary">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-text-primary flex items-center gap-2">
          <span>🗺️</span>
          Visualizador de Mapas
        </h3>
        
        <div class="flex items-center gap-2">
          <BaseBadge
            v-if="currentMap"
            variant="primary"
            size="sm"
            :iconLeft="currentMap.type === 'battle' ? '⚔️' : '🌍'"
          >
            {{ currentMap.type === 'battle' ? 'Mapa de Batalha' : 'Mapa Regional' }}
          </BaseBadge>
          
          <BaseButton
            v-if="isMaster"
            variant="ghost"
            size="sm"
            @click="showMapLibrary = true"
          >
            📁 Biblioteca
          </BaseButton>
          
          <BaseButton
            v-if="isMaster && currentMap"
            variant="primary"
            size="sm"
            @click="shareWithPlayers"
          >
            👁️ Mostrar aos Jogadores
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Map Content -->
    <div class="relative">
      <!-- Empty State -->
      <div v-if="!currentMap" class="text-center py-16">
        <div class="text-6xl mb-4">🗺️</div>
        <h3 class="text-xl font-semibold text-text-primary mb-2">Nenhum mapa selecionado</h3>
        <p class="text-text-muted mb-4">
          {{ isMaster ? 'Selecione um mapa da biblioteca para exibir' : 'O mestre ainda não compartilhou nenhum mapa' }}
        </p>
        <BaseButton
          v-if="isMaster"
          variant="primary"
          @click="showMapLibrary = true"
        >
          📁 Abrir Biblioteca
        </BaseButton>
      </div>

      <!-- Map Display -->
      <div v-else class="relative group">
        <div class="relative overflow-hidden" :style="{ height: mapHeight + 'px' }">
          <img
            :src="currentMap.url"
            :alt="currentMap.name"
            class="w-full h-full object-contain bg-black"
            :style="{
              transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
              transformOrigin: 'center center'
            }"
            @mousedown="startPanning"
            @mousemove="handlePanning"
            @mouseup="stopPanning"
            @mouseleave="stopPanning"
            @wheel="handleZoom"
          />

          <!-- Zoom Controls -->
          <div class="absolute top-4 right-4 flex flex-col gap-2 opacity-75 group-hover:opacity-100 transition-opacity">
            <BaseButton
              variant="secondary"
              size="sm"
              @click="zoomIn"
              class="w-8 h-8 p-0 text-lg"
            >
              +
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              @click="zoomOut"
              class="w-8 h-8 p-0 text-lg"
            >
              −
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              @click="resetView"
              class="w-8 h-8 p-0 text-xs"
            >
              ⌂
            </BaseButton>
          </div>

          <!-- Map Info -->
          <div class="absolute bottom-4 left-4 bg-black bg-opacity-75 rounded-lg p-3 text-white">
            <h4 class="font-semibold">{{ currentMap.name }}</h4>
            <p v-if="currentMap.description" class="text-sm text-gray-300 mt-1">
              {{ currentMap.description }}
            </p>
            <div class="text-xs text-gray-400 mt-2">
              Zoom: {{ Math.round(zoom * 100) }}%
            </div>
          </div>

          <!-- Players Markers (if battle map) -->
          <div
            v-if="currentMap.type === 'battle'"
            v-for="marker in playerMarkers"
            :key="marker.id"
            class="absolute w-8 h-8 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer z-10"
            :style="{
              left: marker.x + 'px',
              top: marker.y + 'px',
              transform: `scale(${zoom})`
            }"
            @click="selectMarker(marker)"
            :title="marker.name"
          >
            {{ marker.name.charAt(0) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Map Library Modal -->
    <BaseModal
      v-model:show="showMapLibrary"
      title="Biblioteca de Mapas"
      size="xl"
    >
      <div class="space-y-4">
        <!-- Upload Section -->
        <div v-if="isMaster" class="border-b border-border-primary pb-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold">Enviar Novo Mapa</h4>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleMapUpload"
            />
            <BaseButton
              variant="primary"
              size="sm"
              @click="fileInput?.click()"
            >
              📤 Upload
            </BaseButton>
          </div>
        </div>

        <!-- Maps Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="map in availableMaps"
            :key="map.id"
            class="border border-border-primary rounded-lg overflow-hidden hover:border-brand-primary transition-colors cursor-pointer"
            @click="selectMap(map)"
          >
            <div class="aspect-video bg-black">
              <img
                :src="map.thumbnail || map.url"
                :alt="map.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-3">
              <h5 class="font-medium text-text-primary">{{ map.name }}</h5>
              <p v-if="map.description" class="text-sm text-text-muted mt-1 line-clamp-2">
                {{ map.description }}
              </p>
              <div class="flex items-center justify-between mt-2">
                <BaseBadge
                  :variant="map.type === 'battle' ? 'error' : 'info'"
                  size="xs"
                  :iconLeft="map.type === 'battle' ? '⚔️' : '🌍'"
                >
                  {{ map.type === 'battle' ? 'Batalha' : 'Regional' }}
                </BaseBadge>
                <span class="text-xs text-text-muted">
                  {{ formatDate(map.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
// ============================================
// MapViewer - Visualizador de mapas para RPG
// ============================================
import { ref, computed, onUnmounted } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import BaseModal from '~/components/ui/BaseModal.vue'

interface MapData {
  id: string
  name: string
  description?: string
  url: string
  thumbnail?: string
  type: 'regional' | 'battle'
  createdAt: Date
  width?: number
  height?: number
}

interface PlayerMarker {
  id: string
  name: string
  x: number
  y: number
  color?: string
}

interface Props {
  campaignId: string
  isMaster?: boolean
  initialMap?: MapData | null
}

const props = withDefaults(defineProps<Props>(), {
  isMaster: false,
  initialMap: null
})

const emit = defineEmits<{
  mapChanged: [map: MapData | null]
  markerMoved: [marker: PlayerMarker]
}>()

// State
const currentMap = ref<MapData | null>(props.initialMap)
const showMapLibrary = ref(false)
const mapHeight = ref(600)
const fileInput = ref<HTMLInputElement | null>(null)

// Map Controls
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastPanPosition = ref({ x: 0, y: 0 })

// Player Markers
const playerMarkers = ref<PlayerMarker[]>([
  { id: '1', name: 'Marcus', x: 100, y: 150 },
  { id: '2', name: 'Elena', x: 120, y: 180 }
])

// Mock available maps
const availableMaps = ref<MapData[]>([
  {
    id: '1',
    name: 'Taverna do Javali Dourado',
    description: 'Interior da taverna principal da cidade',
    url: '/maps/tavern-interior.jpg',
    type: 'battle',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Mapa de Chicago',
    description: 'Vista geral da cidade para navegação',
    url: '/maps/chicago-overview.jpg',
    type: 'regional',
    createdAt: new Date('2024-01-10')
  }
])

// Map Controls
const zoomIn = () => {
  zoom.value = Math.min(zoom.value * 1.2, 3)
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value / 1.2, 0.5)
}

const resetView = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

const handleZoom = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.5, Math.min(3, zoom.value * delta))
}

const startPanning = (event: MouseEvent) => {
  isPanning.value = true
  lastPanPosition.value = { x: event.clientX, y: event.clientY }
}

const handlePanning = (event: MouseEvent) => {
  if (!isPanning.value) return
  
  const deltaX = event.clientX - lastPanPosition.value.x
  const deltaY = event.clientY - lastPanPosition.value.y
  
  panX.value += deltaX / zoom.value
  panY.value += deltaY / zoom.value
  
  lastPanPosition.value = { x: event.clientX, y: event.clientY }
}

const stopPanning = () => {
  isPanning.value = false
}

// Map Management
const selectMap = (map: MapData) => {
  currentMap.value = map
  resetView()
  showMapLibrary.value = false
  emit('mapChanged', map)
}

const shareWithPlayers = () => {
  if (currentMap.value) {
    // TODO: Implement real-time sharing
    console.log('Sharing map with players:', currentMap.value.name)
    
    // Simulate notification
    alert(`Mapa "${currentMap.value.name}" compartilhado com os jogadores!`)
  }
}

const handleMapUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // TODO: Implement real upload
  console.log('Uploading map:', file.name)
  
  // Simulate upload
  const newMap: MapData = {
    id: Date.now().toString(),
    name: file.name.replace(/\.[^/.]+$/, ""),
    url: URL.createObjectURL(file),
    type: 'regional',
    createdAt: new Date()
  }
  
  availableMaps.value.unshift(newMap)
}

// Player Markers
const selectMarker = (marker: PlayerMarker) => {
  console.log('Selected marker:', marker.name)
  // TODO: Show marker details or allow editing
}

// Utils
const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}

// Cleanup
onUnmounted(() => {
  // Cleanup object URLs if any
  availableMaps.value.forEach(map => {
    if (map.url.startsWith('blob:')) {
      URL.revokeObjectURL(map.url)
    }
  })
})
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Smooth zoom transitions */
.map-viewer img {
  transition: transform 0.1s ease-out;
}
</style>