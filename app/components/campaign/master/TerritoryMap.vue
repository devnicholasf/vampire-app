<template>
  <div class="territory-map-root">
    <!-- ── Upload state (no map yet) ── -->
    <div v-if="!mapImage" class="tm-upload-zone">
      <div class="tm-upload-inner" @dragover.prevent="dragActive = true" @dragleave="dragActive = false" @drop.prevent="onDrop" :class="{ 'tm-drag-active': dragActive }">
        <svg class="w-16 h-16 text-df-border-silver opacity-40 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <p class="text-df-silver text-sm font-semibold mb-1">Carregar Mapa da Cidade</p>
        <p class="text-df-muted text-xs mb-4 max-w-xs text-center">
          Arraste uma imagem de mapa aqui ou clique para selecionar. O mapa será usado como base para os territórios da crônica.
        </p>
        <label class="df-btn-primary px-4 py-2 text-sm cursor-pointer">
          <svg class="w-4 h-4 mr-1.5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Selecionar Imagem
          <input type="file" accept="image/*" class="hidden" @change="onFileSelect" />
        </label>
        <div class="mt-3 flex items-center gap-2 w-full max-w-sm">
          <input v-model="urlInput" class="df-input text-xs flex-1" placeholder="Ou cole a URL de um mapa..." @keydown.enter="loadFromUrl" />
          <button v-if="urlInput.trim()" @click="loadFromUrl" class="df-btn-ghost px-2 py-1 text-xs">Carregar</button>
        </div>
      </div>
    </div>

    <!-- ── Map loaded ── -->
    <div v-else>
      <!-- Zone cards (always visible above the map — view & edit modes) -->
      <div v-if="modelValue.length > 0" class="tm-zone-cards-list">
        <div
          v-for="(zone, zi) in modelValue" :key="'zcard' + zi"
          class="tm-zone-card-view"
          :class="{ 'tm-zone-card-view-active': selectedZone === zi }"
          :style="{ borderColor: selectedZone === zi ? zone.color : undefined }"
          @click="selectedZone = selectedZone === zi ? -1 : zi"
        >
          <!-- Row 1: color dot + name + status badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="w-3 h-3 rounded-sm flex-shrink-0" :style="{ background: zone.color }"></span>
            <span class="text-df-gold font-bold text-xs uppercase tracking-wider">{{ zone.name || 'Território' }}</span>
            <span
              class="tm-status-badge-sm"
              :style="{ color: getStatusConf(zone.status).color, background: getStatusConf(zone.status).bg, borderColor: getStatusConf(zone.status).border }"
            >
              {{ getStatusConf(zone.status).emoji }} {{ getStatusConf(zone.status).label }}
            </span>
          </div>

          <!-- ══ View mode: info rows ══ -->
          <template v-if="!editing">
            <!-- Dominant faction -->
            <div v-if="getDominantFaction(zone)" class="flex items-center gap-2 mt-3">
              <span class="text-[10px] text-df-muted">Dominante:</span>
              <span class="text-xs font-bold" :style="{ color: getDominantFaction(zone)!.color }">{{ getDominantFaction(zone)!.faction }}</span>
              <span class="text-[10px] text-df-silver">({{ getDominantFaction(zone)!.percent }}%)</span>
            </div>

            <!-- Segmented influence bar + legend side by side -->
            <div v-if="zone.influences.length > 0" class="flex items-start gap-6 mt-3">
              <div class="tm-seg-bar-wrap flex-1" style="max-width: 50%;">
                <div class="tm-seg-bar">
                  <div
                    v-for="(inf, ii) in [...zone.influences].sort((a, b) => b.percent - a.percent)" :key="'vseg' + ii"
                    class="tm-seg-bar-piece"
                    :class="{ 'tm-seg-bar-piece-dim': hoveredSegment >= 0 && selectedZone === zi && hoveredSegment !== ii }"
                    :style="{ width: inf.percent + '%', background: inf.color }"
                    @mouseenter="selectedZone = zi; hoveredSegment = ii"
                    @mouseleave="hoveredSegment = -1"
                  >
                    <div v-if="hoveredSegment === ii && selectedZone === zi" class="tm-seg-tooltip">
                      <span class="font-bold" :style="{ color: inf.color }">{{ inf.faction || 'Facção' }}</span>
                      <span class="text-df-silver font-bold">{{ inf.percent }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Legend (sorted by percent desc) -->
              <div class="flex flex-col gap-1">
                <div v-for="(inf, ii) in [...zone.influences].sort((a, b) => b.percent - a.percent)" :key="'leg' + ii" class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ background: inf.color }"></span>
                  <span class="text-[10px] font-semibold" :style="{ color: inf.color }">{{ inf.faction || 'Facção' }}</span>
                  <span class="text-[10px] text-df-silver">({{ inf.percent }}%)</span>
                </div>
              </div>
            </div>

            <!-- Description preview -->
            <p v-if="zone.description" class="text-df-muted text-[10px] italic mt-3 line-clamp-2">{{ zone.description }}</p>
          </template>

          <!-- ══ Edit mode: editable fields (expanded when selected) ══ -->
          <div v-if="editing && selectedZone === zi" class="tm-zone-card-body mt-3">
            <div class="space-y-2">
              <div class="flex gap-2 items-center">
                <input v-model="zone.name" class="df-input text-xs flex-1" placeholder="Nome do bairro / distrito..." @click.stop />
                <input v-model="zone.color" type="color" class="w-8 h-8 rounded cursor-pointer border border-df-border-silver bg-transparent flex-shrink-0" @click.stop />
              </div>

              <!-- Status selector -->
              <div @click.stop>
                <h6 class="text-[10px] font-bold text-df-muted uppercase tracking-wider mb-1.5">Estado Político</h6>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="(conf, key) in statusConfig" :key="key"
                    @click.stop="zone.status = key as TerritoryStatus"
                    class="tm-status-option"
                    :class="{ 'tm-status-option-active': zone.status === key }"
                    :style="zone.status === key ? { color: conf.color, background: conf.bg, borderColor: conf.border } : {}"
                  >
                    <span>{{ conf.emoji }}</span>
                    <span class="text-[10px]">{{ conf.label }}</span>
                  </button>
                </div>
              </div>

              <textarea v-model="zone.description" class="df-input text-xs resize-none" rows="2" placeholder="Descrição deste território..." @click.stop />

              <!-- Faction influences -->
              <div class="border-t border-df-border-silver/20 pt-2 mt-2" @click.stop>
                <h6 class="text-[10px] font-bold text-df-gold uppercase tracking-wider mb-2">Influência por Facção</h6>
                <div class="space-y-1.5">
                  <div v-for="(inf, ii) in zone.influences" :key="ii" class="flex items-center gap-2">
                    <input v-model="inf.faction" class="df-input text-xs flex-1" placeholder="Facção..." />
                    <div class="flex items-center gap-1 w-24">
                      <input v-model.number="inf.percent" type="number" min="0" max="100" class="df-input text-xs w-14 text-center" />
                      <span class="text-[10px] text-df-muted">%</span>
                    </div>
                    <input v-model="inf.color" type="color" class="w-6 h-6 rounded cursor-pointer border border-df-border-silver bg-transparent flex-shrink-0" />
                    <button @click.stop="zone.influences.splice(ii, 1)" class="text-df-muted hover:text-df-red transition-colors">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
                <button @click.stop="addInfluence(zi)" class="mt-2 w-full py-1 border border-dashed border-df-border-silver/50 rounded text-df-muted text-[10px] hover:border-df-gold hover:text-df-gold transition-colors">
                  + Facção
                </button>
              </div>

              <button @click.stop="removeZone(zi)" class="mt-2 w-full py-1.5 border border-df-red/40 rounded text-df-red text-xs hover:bg-df-red/10 transition-colors flex items-center justify-center gap-1.5">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Remover Zona
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="tm-toolbar">
        <div class="flex items-center gap-2 flex-wrap">
          <template v-if="editing">
            <button
              @click="drawingMode = drawingMode === 'polygon' ? null : 'polygon'"
              class="tm-tool-btn" :class="{ 'tm-tool-active': drawingMode === 'polygon' }"
              title="Desenhar zona"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>
              <span class="text-[10px]">Zona</span>
            </button>
            <button
              @click="drawingMode = drawingMode === 'rect' ? null : 'rect'"
              class="tm-tool-btn" :class="{ 'tm-tool-active': drawingMode === 'rect' }"
              title="Desenhar retângulo"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              <span class="text-[10px]">Retângulo</span>
            </button>
            <div class="w-px h-6 bg-df-border-silver/40 mx-1"></div>
            <button v-if="currentPolygon.length > 0" @click="cancelDrawing" class="tm-tool-btn" title="Cancelar desenho">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span class="text-[10px]">Cancelar</span>
            </button>
            <button v-if="currentPolygon.length >= 3" @click="finishPolygon" class="tm-tool-btn tm-tool-confirm" title="Finalizar zona">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span class="text-[10px]">Fechar Zona</span>
            </button>
          </template>
        </div>
        <div class="flex items-center gap-2">
          <button @click="zoomIn" class="tm-tool-btn" title="Zoom +"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
          <span class="text-[10px] text-df-muted min-w-[36px] text-center">{{ Math.round(zoom * 100) }}%</span>
          <button @click="zoomOut" class="tm-tool-btn" title="Zoom −"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
          <div class="w-px h-6 bg-df-border-silver/40 mx-1"></div>
          <button v-if="editing" @click="replaceMap" class="tm-tool-btn" title="Trocar mapa">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span class="text-[10px]">Trocar</span>
          </button>
          <button v-if="editing" @click="removeMap" class="tm-tool-btn tm-tool-danger" title="Remover mapa">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            <span class="text-[10px]">Remover</span>
          </button>
          <input v-if="editing" ref="replaceInput" type="file" accept="image/*" class="hidden" @change="onFileSelect" />
        </div>
      </div>

      <!-- Map viewport -->
      <div
        class="tm-viewport"
        ref="viewportRef"
        @wheel.prevent="onWheel"
        @mousedown="onViewportMouseDown"
        @mousemove="onViewportMouseMove"
        @mouseup="onViewportMouseUp"
        @mouseleave="onViewportMouseLeave"
        @click="handleViewportClick"
      >
        <div class="tm-canvas" :style="canvasStyle">
          <!-- Background image -->
          <img :src="mapImage" class="tm-bg-image" draggable="false" @load="onImageLoad" ref="bgImageRef" />

          <!-- SVG overlay for zones -->
          <svg v-if="imgW > 0" class="tm-svg-overlay" :viewBox="`0 0 ${imgW} ${imgH}`" preserveAspectRatio="none">
            <!-- Existing zones -->
            <g v-for="(zone, zi) in modelValue" :key="zi">
              <polygon
                :points="zone.points.map(p => `${p[0]},${p[1]}`).join(' ')"
                :fill="zone.color + '55'"
                :stroke="selectedZone === zi ? '#d4a647' : zone.color"
                :stroke-width="selectedZone === zi ? 3 / zoom : 1.5 / zoom"
                class="tm-zone-polygon"
                :class="{ 'tm-zone-hover': !editing || drawingMode === null, 'tm-zone-war': zone.status === 'war' }"
                @click.stop="onZoneClick(zi, $event)"
                @mouseenter="hoveredZone = zi"
                @mouseleave="hoveredZone = -1"
              />
              <!-- Zone label -->
              <text
                :x="getZoneCenter(zone)[0]"
                :y="getZoneCenter(zone)[1]"
                text-anchor="middle"
                dominant-baseline="central"
                :font-size="14 / zoom"
                fill="white"
                :stroke="'#000'"
                :stroke-width="3 / zoom"
                paint-order="stroke"
                class="tm-zone-label"
                pointer-events="none"
              >
                {{ zone.name || 'Sem nome' }}
              </text>
            </g>

            <!-- Current polygon being drawn -->
            <g v-if="currentPolygon.length > 0">
              <polyline
                :points="[...currentPolygon, ...(mousePos ? [mousePos] : [])].map(p => `${p[0]},${p[1]}`).join(' ')"
                fill="none"
                stroke="#d4a647"
                :stroke-width="2 / zoom"
                stroke-dasharray="6 3"
              />
              <circle v-for="(pt, pi) in currentPolygon" :key="pi"
                :cx="pt[0]" :cy="pt[1]" :r="4 / zoom"
                fill="#d4a647" stroke="#0a0a1a" :stroke-width="1.5 / zoom"
              />
            </g>

            <!-- Rect drawing preview -->
            <rect v-if="drawingMode === 'rect' && rectPreview"
              :x="rectPreview.x"
              :y="rectPreview.y"
              :width="rectPreview.width"
              :height="rectPreview.height"
              fill="#d4a64755"
              stroke="#d4a647"
              :stroke-width="2 / zoom"
              stroke-dasharray="6 3"
            />

            <!-- Dragging vertex handle -->
            <g v-if="editing && selectedZone >= 0 && !drawingMode">
              <circle v-for="(pt, pi) in modelValue[selectedZone]?.points || []" :key="'vh' + pi"
                :cx="pt[0]" :cy="pt[1]" :r="5 / zoom"
                :fill="draggingVertex === pi ? '#fff' : '#d4a647'"
                stroke="#0a0a1a" :stroke-width="1.5 / zoom"
                class="tm-vertex-handle"
                @mousedown.stop="startVertexDrag(pi, $event)"
              />
            </g>
          </svg>
        </div>
      </div>

      <!-- (Zone cards are now unified above the map) -->

      <!-- Hovered zone tooltip (only view mode) -->
      <div v-if="!editing && hoveredZone >= 0 && hoveredZone !== selectedZone && hovZone" class="tm-hover-tooltip" :style="tooltipStyle">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-bold text-xs" :style="{ color: hovZone.color }">{{ hovZone.name || 'Território' }}</span>
          <span class="text-[10px]" :style="{ color: getStatusConf(hovZone.status).color }">{{ getStatusConf(hovZone.status).emoji }} {{ getStatusConf(hovZone.status).label }}</span>
        </div>
        <div v-if="getDominantFaction(hovZone)" class="text-[10px] text-df-silver mb-1">
          <span class="text-df-gold">Domínio:</span> <span :style="{ color: getDominantFaction(hovZone)!.color }">{{ getDominantFaction(hovZone)!.faction }}</span> <span class="text-df-muted">({{ getDominantFaction(hovZone)!.percent }}%)</span>
        </div>
        <div v-if="hovZone.influences.length > 0" class="tm-seg-bar" style="height: 8px;">
          <div v-for="(inf, ii) in [...hovZone.influences].sort((a, b) => b.percent - a.percent)" :key="ii" :style="{ width: inf.percent + '%', background: inf.color }" class="tm-seg-bar-piece"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useToast } from '~/composables/useToast'

export interface TerritoryInfluence {
  faction: string
  percent: number
  color: string
}

export type TerritoryStatus = 'stable' | 'contested' | 'war' | 'abandoned'

export interface TerritoryZone {
  name: string
  color: string
  description: string
  status: TerritoryStatus
  points: number[][] // [[x,y], [x,y], ...]
  influences: TerritoryInfluence[]
}

const statusConfig: Record<TerritoryStatus, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  stable:     { label: 'Estável',     emoji: '🟢', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.4)' },
  contested:  { label: 'Contestado',  emoji: '🟡', color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.4)' },
  war:        { label: 'Em Guerra',   emoji: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.4)' },
  abandoned:  { label: 'Abandonado',  emoji: '⚫', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.4)' }
}

const getStatusConf = (s: TerritoryStatus) => statusConfig[s] || statusConfig.stable
const getDominantFaction = (zone: TerritoryZone) => {
  if (zone.influences.length === 0) return null
  return [...zone.influences].sort((a, b) => b.percent - a.percent)[0]
}

interface Props {
  modelValue: TerritoryZone[]
  mapImage: string
  editing: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [zones: TerritoryZone[]]
  'update:mapImage': [src: string]
}>()

const toast = useToast()

// ── Refs ──
const viewportRef = ref<HTMLDivElement | null>(null)
const bgImageRef = ref<HTMLImageElement | null>(null)
const replaceInput = ref<HTMLInputElement | null>(null)

// ── Map state ──
const imgW = ref(0)
const imgH = ref(0)
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const urlInput = ref('')
const dragActive = ref(false)

// ── Drawing ──
const drawingMode = ref<'polygon' | 'rect' | null>(null)
const currentPolygon = ref<number[][]>([])
const rectStart = ref<number[] | null>(null)
const mousePos = ref<number[] | null>(null)

// ── Selection ──
const selectedZone = ref(-1)
const hoveredZone = ref(-1)
const tooltipPos = ref({ x: 0, y: 0 })
const hoveredSegment = ref(-1)

// ── Pan ──
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0, px: 0, py: 0 })
const didDrag = ref(false)

// ── Vertex drag ──
const draggingVertex = ref(-1)
const vertexDragStart = ref({ mx: 0, my: 0, ox: 0, oy: 0 })

// ── Computed ──
const canvasStyle = computed(() => ({
  transform: `translate(${panX.value}px, ${panY.value}px) scale(${zoom.value})`,
  transformOrigin: '0 0',
  width: imgW.value + 'px',
  height: imgH.value + 'px'
}))

const tooltipStyle = computed(() => ({
  left: tooltipPos.value.x + 'px',
  top: tooltipPos.value.y + 'px'
}))

const selZone = computed(() => {
  const idx = selectedZone.value
  return idx >= 0 ? props.modelValue[idx] : undefined
})

const hovZone = computed(() => {
  const idx = hoveredZone.value
  return idx >= 0 ? props.modelValue[idx] : undefined
})

const rectPreview = computed(() => {
  if (!rectStart.value || !mousePos.value) return null
  const rs = rectStart.value
  const mp = mousePos.value
  return {
    x: Math.min(rs[0] ?? 0, mp[0] ?? 0),
    y: Math.min(rs[1] ?? 0, mp[1] ?? 0),
    width: Math.abs((mp[0] ?? 0) - (rs[0] ?? 0)),
    height: Math.abs((mp[1] ?? 0) - (rs[1] ?? 0))
  }
})

// ── Image loading ──
const onImageLoad = (e: Event) => {
  const img = e.target as HTMLImageElement
  imgW.value = img.naturalWidth
  imgH.value = img.naturalHeight
  fitToViewport()
}

const fitToViewport = () => {
  if (!viewportRef.value || imgW.value === 0) return
  const vw = viewportRef.value.clientWidth
  const vh = viewportRef.value.clientHeight
  const scaleX = vw / imgW.value
  const scaleY = vh / imgH.value
  zoom.value = Math.min(scaleX, scaleY, 1) * 0.95
  panX.value = (vw - imgW.value * zoom.value) / 2
  panY.value = (vh - imgH.value * zoom.value) / 2
}

// ── File handling ──
const processImage = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.success('Formato inválido', 'Por favor, selecione uma imagem (JPG, PNG, etc.)')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    emit('update:mapImage', reader.result as string)
    selectedZone.value = -1
    nextTick(() => fitToViewport())
  }
  reader.readAsDataURL(file)
}

const onFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processImage(file)
  ;(e.target as HTMLInputElement).value = ''
}

const onDrop = (e: DragEvent) => {
  dragActive.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processImage(file)
}

const loadFromUrl = () => {
  const url = urlInput.value.trim()
  if (!url) return
  // Validate it looks like a URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    toast.success('URL inválida', 'Insira uma URL começando com http:// ou https://')
    return
  }
  emit('update:mapImage', url)
  urlInput.value = ''
  selectedZone.value = -1
  nextTick(() => fitToViewport())
}

const replaceMap = () => {
  replaceInput.value?.click()
}

const removeMap = () => {
  emit('update:mapImage', '')
  emit('update:modelValue', [])
  selectedZone.value = -1
  hoveredZone.value = -1
  imgW.value = 0
  imgH.value = 0
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  toast.success('Mapa Removido', 'O mapa da cidade foi removido.')
}

// ── Zoom ──
const zoomIn = () => { zoom.value = Math.min(zoom.value * 1.2, 5) }
const zoomOut = () => { zoom.value = Math.max(zoom.value / 1.2, 0.1) }

const onWheel = (e: WheelEvent) => {
  const factor = e.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.1, Math.min(5, zoom.value * factor))
  // Zoom toward cursor:
  if (viewportRef.value) {
    const rect = viewportRef.value.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    panX.value = mx - (mx - panX.value) * (newZoom / zoom.value)
    panY.value = my - (my - panY.value) * (newZoom / zoom.value)
  }
  zoom.value = newZoom
}

// ── Coordinate conversion ──
const screenToImage = (clientX: number, clientY: number): number[] => {
  if (!viewportRef.value) return [0, 0]
  const rect = viewportRef.value.getBoundingClientRect()
  const sx = clientX - rect.left
  const sy = clientY - rect.top
  const ix = (sx - panX.value) / zoom.value
  const iy = (sy - panY.value) / zoom.value
  return [Math.round(ix), Math.round(iy)]
}

// ── Viewport mouse handlers ──
const onViewportMouseDown = (e: MouseEvent) => {
  didDrag.value = false
  if (e.button === 1 || (e.button === 0 && (!props.editing || !drawingMode.value))) {
    // Pan
    isPanning.value = true
    panStart.value = { x: e.clientX, y: e.clientY, px: panX.value, py: panY.value }
    return
  }
}

const onViewportMouseMove = (e: MouseEvent) => {
  // Update tooltip position (fixed, follows cursor)
  tooltipPos.value = { x: e.clientX + 16, y: e.clientY - 10 }

  if (isPanning.value) {
    didDrag.value = true
    panX.value = panStart.value.px + (e.clientX - panStart.value.x)
    panY.value = panStart.value.py + (e.clientY - panStart.value.y)
    return
  }

  // Vertex dragging
  if (draggingVertex.value >= 0 && selectedZone.value >= 0) {
    const pt = screenToImage(e.clientX, e.clientY)
    const zone = props.modelValue[selectedZone.value]
    if (zone && zone.points[draggingVertex.value]) {
      zone.points[draggingVertex.value] = pt
      emit('update:modelValue', [...props.modelValue])
    }
    return
  }

  // Update mouse position for drawing preview
  if (drawingMode.value) {
    mousePos.value = screenToImage(e.clientX, e.clientY)
  }
}

const onViewportMouseUp = (e: MouseEvent) => {
  if (isPanning.value) {
    isPanning.value = false
    return
  }
  if (draggingVertex.value >= 0) {
    draggingVertex.value = -1
    return
  }
}

const onViewportMouseLeave = (e: MouseEvent) => {
  hoveredZone.value = -1
  onViewportMouseUp(e)
}

// ── SVG click (for drawing) ──
const onZoneClick = (zi: number, e: MouseEvent) => {
  if (drawingMode.value) {
    // If in drawing mode, treat as canvas click
    onCanvasClick(e)
    return
  }
  selectedZone.value = selectedZone.value === zi ? -1 : zi
}

// We need to handle clicks on the canvas (img) for drawing
const onCanvasClick = (e: MouseEvent) => {
  if (!props.editing || !drawingMode.value) return

  const pt = screenToImage(e.clientX, e.clientY)

  if (drawingMode.value === 'polygon') {
    currentPolygon.value.push(pt)
  } else if (drawingMode.value === 'rect') {
    if (!rectStart.value) {
      rectStart.value = pt
    } else {
      // Finish rect
      const rs = rectStart.value
      const x1 = Math.min(rs[0] ?? 0, pt[0] ?? 0)
      const y1 = Math.min(rs[1] ?? 0, pt[1] ?? 0)
      const x2 = Math.max(rs[0] ?? 0, pt[0] ?? 0)
      const y2 = Math.max(rs[1] ?? 0, pt[1] ?? 0)
      if (Math.abs(x2 - x1) > 10 && Math.abs(y2 - y1) > 10) {
        createZone([[x1, y1], [x2, y1], [x2, y2], [x1, y2]])
      }
      rectStart.value = null
      mousePos.value = null
    }
  }
}

// Intercept clicks on the background image
const onBgClick = (e: MouseEvent) => {
  onCanvasClick(e)
}

// ── Drawing helpers ──
const finishPolygon = () => {
  if (currentPolygon.value.length >= 3) {
    createZone([...currentPolygon.value])
  }
  currentPolygon.value = []
  mousePos.value = null
}

const cancelDrawing = () => {
  currentPolygon.value = []
  rectStart.value = null
  mousePos.value = null
}

const zoneColors = ['#3b82f6', '#dc2626', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#f97316']
let nextColorIndex = 0

const createZone = (points: number[][]) => {
  const color = zoneColors[nextColorIndex % zoneColors.length] ?? '#3b82f6'
  nextColorIndex++
  const newZone: TerritoryZone = {
    name: '',
    color,
    description: '',
    status: 'stable',
    points,
    influences: []
  }
  const updated = [...props.modelValue, newZone]
  emit('update:modelValue', updated)
  selectedZone.value = updated.length - 1
  drawingMode.value = null
  toast.success('Zona Criada', 'Defina o nome e as facções com influência.')
}

const removeZone = (zi: number) => {
  const updated = props.modelValue.filter((_, i) => i !== zi)
  emit('update:modelValue', updated)
  selectedZone.value = -1
}

const addInfluence = (zi: number) => {
  if (props.modelValue[zi]) {
    props.modelValue[zi].influences.push({ faction: '', percent: 0, color: '#6b7280' })
    emit('update:modelValue', [...props.modelValue])
  }
}

// ── Vertex drag ──
const startVertexDrag = (pi: number, e: MouseEvent) => {
  draggingVertex.value = pi
  e.preventDefault()
}

// ── Zone center (for labels) ──
const getZoneCenter = (zone: TerritoryZone): number[] => {
  if (zone.points.length === 0) return [0, 0]
  let cx = 0, cy = 0
  for (const p of zone.points) { cx += (p[0] ?? 0); cy += (p[1] ?? 0) }
  return [cx / zone.points.length, cy / zone.points.length]
}

// We need to listen clicks on the SVG overlay for drawing
// The SVG sits on top of the image, so clicks go there
// We handle it by using @click.self on the SVG? No, let's use a transparent rect
// Actually, we'll add click to the viewport and check
// Let me refactor: use a click handler on the viewport that checks if we're in draw mode

// Attach click to viewport for drawing (only fire on left click, single click)
const handleViewportClick = (e: MouseEvent) => {
  if (e.button !== 0) return
  if (didDrag.value) return
  if (!props.editing || !drawingMode.value) return
  onCanvasClick(e)
}
</script>

<style scoped>
.territory-map-root {
  position: relative;
}

/* ═══ Upload Zone ═══ */
.tm-upload-zone {
  padding: 2rem 1rem;
}
.tm-upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2px dashed #4a4a5a;
  border-radius: 0.75rem;
  background: #0d0d20;
  transition: all 0.3s ease;
}
.tm-drag-active {
  border-color: #d4a647;
  background: rgba(212, 166, 71, 0.05);
}

/* ═══ Toolbar ═══ */
.tm-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tm-tool-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 0.375rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  color: #6b6b80;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 42px;
}
.tm-tool-btn:hover {
  color: #c0c0d0;
  border-color: #4a4a5a;
  background: rgba(74, 74, 90, 0.15);
}
.tm-tool-active {
  color: #d4a647 !important;
  border-color: #d4a647 !important;
  background: rgba(212, 166, 71, 0.1) !important;
}
.tm-tool-confirm {
  color: #22c55e !important;
  border-color: #22c55e !important;
  background: rgba(34, 197, 94, 0.1) !important;
}
.tm-tool-danger {
  color: #ef4444 !important;
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
}
.tm-tool-danger:hover {
  background: rgba(239, 68, 68, 0.2) !important;
}

/* ═══ Viewport ═══ */
.tm-viewport {
  position: relative;
  width: 100%;
  height: 450px;
  overflow: hidden;
  border: 1px solid #4a4a5a;
  border-radius: 0.5rem;
  background: #050510;
  cursor: grab;
}
.tm-viewport:active {
  cursor: grabbing;
}
.tm-canvas {
  position: absolute;
  top: 0;
  left: 0;
}
.tm-bg-image {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
}
.tm-svg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.tm-zone-polygon {
  pointer-events: all;
  cursor: pointer;
  transition: opacity 0.2s;
}
.tm-zone-hover:hover {
  opacity: 0.85;
  filter: brightness(1.2);
}
/* GTA San Andreas war zone blinking */
@keyframes zone-war-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.12; }
}
.tm-zone-war {
  animation: zone-war-pulse 1.2s ease-in-out infinite;
}
.tm-zone-label {
  user-select: none;
  -webkit-user-select: none;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tm-vertex-handle {
  cursor: move;
  pointer-events: all;
  transition: fill 0.15s;
}
.tm-vertex-handle:hover {
  fill: #fff;
}

/* ═══ Detail Panel ═══ */
.tm-detail-panel {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.5rem;
}

/* ═══ Zones List (edit mode) ═══ */
.tm-zones-list {
  margin-top: 0.75rem;
}
.tm-zone-card {
  border: 1px solid #4a4a5a;
  border-radius: 0.5rem;
  background: #0d0d20;
  overflow: hidden;
  transition: border-color 0.2s;
}
.tm-zone-card-active {
  border-color: #d4a647;
}
.tm-zone-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.625rem 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  text-align: left;
  transition: background 0.15s;
}
.tm-zone-card-header:hover {
  background: rgba(74, 74, 90, 0.15);
}
.tm-zone-card-body {
  padding: 0 0.75rem 0.75rem;
  border-top: 1px solid #4a4a5a30;
}

/* ═══ Influence bars ═══ */
.tm-influence-row {
  padding: 0.25rem 0;
}
.tm-influence-bar-bg {
  width: 100%;
  height: 6px;
  background: #1a1a2e;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(74, 74, 90, 0.19);
}
.tm-influence-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
  min-width: 0;
}
.tm-total-bar {
  display: flex;
  gap: 0;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(74, 74, 90, 0.3);
  margin-top: 0.5rem;
  background: #1a1a2e;
}
.tm-total-bar-segment {
  height: 100%;
  min-width: 0;
  transition: width 0.4s ease;
}

/* ═══ Status Badge ═══ */
.tm-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  border: 1px solid;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.625rem;
}

/* ═══ Zone Cards List (view mode) ═══ */
.tm-zone-cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.tm-zone-card-view {
  padding: 0.75rem 1rem;
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.tm-zone-card-view:hover {
  border-color: #6b6b80;
  background: #0d0d28;
}
.tm-zone-card-view-active {
  background: #0f0f28;
}

/* ═══ Status Badge Small (inline) ═══ */
.tm-status-badge-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  border: 1px solid;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ═══ Segmented Bar ═══ */
.tm-seg-bar-wrap {
  position: relative;
}
.tm-seg-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: visible;
  border: 1px solid rgba(74, 74, 90, 0.3);
  background: #1a1a2e;
}
.tm-seg-bar-piece {
  position: relative;
  height: 100%;
  min-width: 2px;
  transition: opacity 0.25s ease, filter 0.25s ease;
  cursor: pointer;
}
.tm-seg-bar-piece:first-child {
  border-radius: 4px 0 0 4px;
}
.tm-seg-bar-piece:last-child {
  border-radius: 0 4px 4px 0;
}
.tm-seg-bar-piece:only-child {
  border-radius: 4px;
}
.tm-seg-bar-piece-dim {
  opacity: 0.3;
  filter: grayscale(0.4);
}

/* ═══ Segmented Bar Tooltip ═══ */
.tm-seg-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.5rem;
  background: #0d0d20;
  border: 1px solid #7f1d1d;
  border-radius: 0.375rem;
  font-size: 0.65rem;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
  pointer-events: none;
  z-index: 20;
}
.tm-seg-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #7f1d1d;
}

/* ═══ Conflict Badge ═══ */
.tm-conflict-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #fca5a5;
  background: rgba(127, 29, 29, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.3);
}

/* ═══ Status Option (edit mode) ═══ */
.tm-status-option {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #4a4a5a;
  border-radius: 0.375rem;
  background: transparent;
  color: #6b6b80;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;
}
.tm-status-option:hover {
  border-color: #c0c0d0;
  color: #c0c0d0;
  background: rgba(74, 74, 90, 0.15);
}
.tm-status-option-active {
  font-weight: 700;
}

/* ═══ Hover tooltip ═══ */
.tm-hover-tooltip {
  position: fixed;
  z-index: 50;
  background: #0d0d20;
  border: 1px solid #7f1d1d;
  border-radius: 0.375rem;
  padding: 0.375rem 0.625rem;
  min-width: 120px;
  max-width: 200px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

/* ═══ Inputs (inherit from parent) ═══ */
.df-input {
  width: 100%;
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.375rem;
  padding: 0.375rem 0.625rem;
  color: #c0c0d0;
  transition: border-color 0.2s;
}
.df-input:focus { outline: none; border-color: #dc2626; }
.df-input::placeholder { color: #6b6b80; }

.df-btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
  background: linear-gradient(135deg, #991b1b, #7f1d1d); color: #fecaca;
  border: 1px solid #dc2626; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease; box-shadow: 0 0 12px rgba(220,38,38,0.2);
}
.df-btn-primary:hover { background: linear-gradient(135deg, #b91c1c, #991b1b); box-shadow: 0 0 20px rgba(220,38,38,0.4); color: #fff; }

.df-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em;
  background: transparent; color: #6b6b80;
  border: 1px solid #4a4a5a; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease;
}
.df-btn-ghost:hover { border-color: #dc2626; color: #c0c0d0; background: rgba(127,29,29,0.1); }
</style>
