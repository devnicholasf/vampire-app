<template>
  <div class="space-y-5">

    <!-- ── Cabeçalho ── -->
    <div class="flex items-center justify-between">
      <h3 class="df-section-title text-xl flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        Mídia da Campanha
      </h3>
      <button class="df-btn-upload" @click="showUploadModal = true">
        <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Upload
      </button>
    </div>

    <!-- ── Sub-abas ── -->
    <div class="df-tabs-nav">
      <nav class="flex">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['df-tab', activeCategory === cat.id ? 'df-tab-active' : '']"
          @click="activeCategory = cat.id"
        >
          <component :is="cat.icon" class="w-4 h-4" />
          {{ cat.label }}
          <span v-if="countByType(cat.id) > 0" class="ml-1 px-1.5 py-0.5 rounded" style="background:rgba(127,29,29,0.3);color:#f87171;font-size:10px;font-weight:700;">
            {{ countByType(cat.id) }}
          </span>
        </button>
      </nav>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="df-spinner"></div>
    </div>

    <!-- ── Erro ── -->
    <div v-else-if="fetchError" class="text-center py-12">
      <svg class="w-10 h-10 mx-auto mb-3" style="color:#7f1d1d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p class="text-sm" style="color:#f87171;">{{ fetchError }}</p>
      <button class="mt-3 text-xs underline" style="color:#6b6b7b;" @click="loadFiles">Tentar novamente</button>
    </div>

    <!-- ── Grid de arquivos ── -->
    <div v-else-if="filteredFiles.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      <div
        v-for="file in filteredFiles"
        :key="file.path"
        class="df-media-card rounded-lg border overflow-hidden"
        style="background:#0a0a1a; border-color:#2d1515;"
      >

        <!-- ── Imagem ── -->
        <template v-if="file.type === 'image'">
          <div
            class="aspect-square overflow-hidden cursor-pointer"
            style="background:#060610;"
            @click="lightboxFile = file"
          >
            <img :src="file.url" :alt="file.name" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
          </div>
          <div class="p-2">
            <p class="text-xs font-medium truncate" style="color:#c4c4d4;" :title="file.name">{{ file.name }}</p>
            <p class="text-[11px] mt-0.5" style="color:#4a4a5a;">{{ file.sizeLabel }}</p>
            <div class="flex items-center justify-between mt-2">
              <button class="df-btn-view" @click="lightboxFile = file">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Visualizar
              </button>
              <button class="df-btn-delete" title="Excluir" @click="askDelete(file)">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </template>

        <!-- ── Áudio ── -->
        <template v-else-if="file.type === 'audio'">
          <div class="flex items-center justify-center py-5" style="background:#060610;">
            <svg class="w-10 h-10" style="color:#7f1d1d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <div class="p-2">
            <p class="text-xs font-medium truncate" style="color:#c4c4d4;" :title="file.name">{{ file.name }}</p>
            <p class="text-[11px] mt-0.5 mb-2" style="color:#4a4a5a;">{{ file.sizeLabel }}</p>
            <audio :src="file.url" controls class="df-audio-player w-full" style="color-scheme:dark;"></audio>
            <div class="flex justify-end mt-2">
              <button class="df-btn-delete" title="Excluir" @click="askDelete(file)">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </template>

        <!-- ── Documento ── -->
        <template v-else>
          <div class="flex items-center justify-center py-5" style="background:#060610;">
            <svg class="w-10 h-10" style="color:#7f1d1d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="p-2">
            <p class="text-xs font-medium truncate" style="color:#c4c4d4;" :title="file.name">{{ file.name }}</p>
            <p class="text-[11px] mt-0.5" style="color:#4a4a5a;">{{ file.sizeLabel }}</p>
            <div class="flex items-center justify-between mt-2">
              <button class="df-btn-view" @click="openDocViewer(file)">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Abrir
              </button>
              <button class="df-btn-delete" title="Excluir" @click="askDelete(file)">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>

    <!-- ── Estado vazio ── -->
    <div v-else class="text-center py-16">
      <svg class="w-14 h-14 mx-auto mb-4" style="color:rgba(127,29,29,0.3)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <p class="text-sm font-medium" style="color:#6b6b7b;">Nenhum {{ currentCategory?.label.toLowerCase() }} enviado</p>
      <p class="text-xs mt-1 mb-5" style="color:#4a4a5a;">Faça upload para usar na sessão ao vivo</p>
      <button class="df-btn-upload" @click="showUploadModal = true">
        <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Fazer Upload
      </button>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- Modal de Upload                                        -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.8); backdrop-filter:blur(3px);"
      @click.self="closeUploadModal"
    >
      <div class="w-full max-w-md rounded-lg border" style="background:#0a0a1a; border-color:#7f1d1d; box-shadow:0 8px 40px rgba(0,0,0,0.8);">

        <!-- Header do modal -->
        <div class="flex items-center justify-between px-5 py-4 border-b" style="border-color:#2d1515;">
          <h3 class="text-sm font-semibold uppercase tracking-wider" style="color:#d4a647;">Upload de Arquivo</h3>
          <button class="df-modal-close" @click="closeUploadModal">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Seletor de tipo -->
          <div>
            <p class="text-xs uppercase tracking-wider mb-2" style="color:#9b9bbb;">Selecione o tipo</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="df-type-btn"
                :class="uploadCategory === cat.id ? 'df-type-btn-active' : ''"
                @click="uploadCategory = cat.id; clearFile()"
              >
                <component :is="cat.icon" class="w-5 h-5 mb-1" />
                <span class="text-xs">{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- Drop zone -->
          <div
            class="relative rounded-lg border-2 border-dashed p-7 text-center cursor-pointer transition-all"
            :style="isDragging ? 'border-color:#dc2626; background:rgba(127,29,29,0.1);' : 'border-color:#4a4a5a; background:#060610;'"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInput?.click()"
          >
            <input ref="fileInput" type="file" :accept="acceptedTypes" class="hidden" @change="onFileChange" />
            <div v-if="!selectedFile">
              <svg class="w-9 h-9 mx-auto mb-2" style="color:#6b6b80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p class="text-sm" style="color:#b0b0c8;">Arraste ou clique para selecionar</p>
              <p class="text-xs mt-1" style="color:#8080a0;">{{ acceptedTypesLabel }}</p>
            </div>
            <div v-else class="flex items-center gap-3 text-left">
              <svg class="w-7 h-7 shrink-0" style="color:#d4a647" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium truncate" style="color:#c4c4d4;">{{ selectedFile.name }}</p>
                <p class="text-xs" style="color:#9b9bbb;">{{ formatSize(selectedFile.size) }}</p>
              </div>
              <button class="shrink-0 p-1 rounded" style="color:#4a4a5a;" @click.stop="clearFile()">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Erro -->
          <p v-if="uploadError" class="text-xs" style="color:#f87171;">{{ uploadError }}</p>

          <!-- Progress -->
          <div v-if="uploading">
            <div class="h-1 rounded-full overflow-hidden" style="background:#2d1515;">
              <div class="h-full rounded-full" style="background:linear-gradient(90deg,#b91c1c,#dc2626); width:100%; animation:progress-pulse 1.5s ease-in-out infinite;"></div>
            </div>
            <p class="text-xs mt-1 text-center" style="color:#9b9bbb;">Enviando...</p>
          </div>

          <!-- Ações -->
          <div class="flex justify-end gap-2 pt-1">
            <button class="df-btn-ghost" @click="closeUploadModal">Cancelar</button>
            <button
              class="df-btn-primary-sm"
              :disabled="!selectedFile || uploading"
              :style="(!selectedFile || uploading) ? 'opacity:0.5;cursor:not-allowed;' : ''"
              @click="uploadFile"
            >
              <svg v-if="uploading" style="width:13px;height:13px;animation:spin 1s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
              {{ uploading ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- Lightbox de imagem                                     -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div
      v-if="lightboxFile"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.92); backdrop-filter:blur(4px);"
      @click.self="lightboxFile = null"
    >
      <div class="relative max-w-5xl w-full">
        <button
          class="absolute -top-10 right-0 df-modal-close"
          @click="lightboxFile = null"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <img
          :src="lightboxFile.url"
          :alt="lightboxFile.name"
          class="max-w-full max-h-[85vh] mx-auto rounded-lg object-contain"
          style="box-shadow:0 8px 60px rgba(0,0,0,0.9);"
        />
        <p class="text-center text-xs mt-3" style="color:#6b6b7b;">{{ lightboxFile.name }} — {{ lightboxFile.sizeLabel }}</p>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- Visualizador de documento                              -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div
      v-if="docFile"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.88); backdrop-filter:blur(3px);"
      @click.self="docFile = null; docContent = null; docLoading = false"
    >
      <div class="w-full max-w-4xl rounded-lg border flex flex-col" style="height:82vh; background:#0a0a1a; border-color:#7f1d1d; box-shadow:0 8px 40px rgba(0,0,0,0.8);">
        <div class="flex items-center justify-between px-4 py-3 border-b shrink-0" style="border-color:#2d1515;">
          <div class="flex items-center gap-2 min-w-0">
            <svg class="w-4 h-4 shrink-0" style="color:#d4a647" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="text-sm font-medium truncate" style="color:#c4c4d4;">{{ docFile.name }}</span>
          </div>
          <button class="df-modal-close df-modal-close--light ml-4 shrink-0" @click="docFile = null; docContent = null; docLoading = false">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <!-- Carregando TXT -->
        <div v-if="docLoading" class="flex-1 flex items-center justify-center" style="background:#0a0a1a;">
          <div class="df-spinner"></div>
        </div>
        <!-- Texto TXT decodificado (UTF-8 correto) -->
        <pre
          v-else-if="docContent !== null"
          class="flex-1 w-full overflow-auto p-5 text-sm rounded-b-lg df-doc-pre"
        >{{ docContent }}</pre>
        <!-- PDF e outros: iframe -->
        <iframe
          v-else
          :src="docFile.url"
          class="flex-1 w-full rounded-b-lg"
          style="border:none; background:#fff;"
        ></iframe>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- Modal de confirmação de exclusão                       -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div
      v-if="fileToDelete"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.8); backdrop-filter:blur(3px);"
      @click.self="fileToDelete = null"
    >
      <div class="w-full max-w-sm rounded-lg border" style="background:#0a0a1a; border-color:#7f1d1d; box-shadow:0 8px 40px rgba(0,0,0,0.8);">
        <div class="px-5 py-4 border-b" style="border-color:#2d1515;">
          <h3 class="text-sm font-semibold uppercase tracking-wider" style="color:#d4a647;">Excluir Arquivo</h3>
        </div>
        <div class="p-5">
          <p class="text-sm mb-5" style="color:#c4c4d4;">Deseja excluir <strong style="color:#fff;">{{ fileToDelete.name }}</strong>? Esta ação não pode ser desfeita.</p>
          <div class="flex justify-end gap-2">
            <button class="df-btn-ghost" @click="fileToDelete = null">Cancelar</button>
            <button
              class="df-btn-primary-sm"
              :disabled="deleting"
              :style="deleting ? 'opacity:0.5;cursor:not-allowed;' : ''"
              @click="confirmDelete"
            >
              <svg v-if="deleting" style="width:13px;height:13px;animation:spin 1s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
              {{ deleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import type { FunctionalComponent } from 'vue'
import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'
import { useToast } from '~/composables/useToast'

const props = defineProps<{ campaignId: string }>()

const config   = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
const BUCKET   = 'campaign-media'
const toast    = useToast()

interface MediaFile {
  path: string
  name: string
  type: 'image' | 'audio' | 'document'
  url: string
  size: number
  sizeLabel: string
}

const loading    = ref(false)
const fetchError = ref<string | null>(null)
const files      = ref<MediaFile[]>([])
const activeCategory  = ref<'image' | 'audio' | 'document'>('image')
const uploadCategory  = ref<'image' | 'audio' | 'document'>('image')

const showUploadModal = ref(false)
const selectedFile    = ref<File | null>(null)
const fileInput       = ref<HTMLInputElement | null>(null)
const isDragging      = ref(false)
const uploading       = ref(false)
const uploadError     = ref<string | null>(null)

const lightboxFile = ref<MediaFile | null>(null)
const docFile      = ref<MediaFile | null>(null)
const docContent   = ref<string | null>(null)
const docLoading   = ref(false)
const fileToDelete = ref<MediaFile | null>(null)
const deleting     = ref(false)

// ── SVG Icon Components ──
const IconImage: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
    h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
    h('polyline', { points: '21 15 16 10 5 21' })
  ])

const IconAudio: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M9 18V5l12-2v13' }),
    h('circle', { cx: '6', cy: '18', r: '3' }),
    h('circle', { cx: '18', cy: '16', r: '3' })
  ])

const IconDocument: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' }),
    h('polyline', { points: '14 2 14 8 20 8' }),
    h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
    h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
    h('polyline', { points: '10 9 9 9 8 9' })
  ])

const categories = [
  { id: 'image'    as const, label: 'Imagens',    icon: IconImage },
  { id: 'audio'    as const, label: 'Música',     icon: IconAudio },
  { id: 'document' as const, label: 'Documentos', icon: IconDocument },
]

const acceptMap = {
  image:    'image/jpeg,image/png,image/webp,image/gif',
  audio:    'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac',
  document: 'application/pdf,text/plain',
}
const acceptLabelMap = {
  image:    'JPG, PNG, WEBP, GIF — máx. 10 MB',
  audio:    'MP3, WAV, OGG, FLAC — máx. 50 MB',
  document: 'PDF, TXT — máx. 20 MB',
}
const maxSizeMap = {
  image:    10 * 1024 * 1024,
  audio:    50 * 1024 * 1024,
  document: 20 * 1024 * 1024,
}

const acceptedTypes      = computed(() => acceptMap[uploadCategory.value])
const acceptedTypesLabel = computed(() => acceptLabelMap[uploadCategory.value])
const currentCategory    = computed(() => categories.find(c => c.id === activeCategory.value))
const filteredFiles      = computed(() => files.value.filter(f => f.type === activeCategory.value))
const countByType        = (type: string) => files.value.filter(f => f.type === type).length

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const inferType = (name: string): MediaFile['type'] => {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg','jpeg','png','webp','gif'].includes(ext)) return 'image'
  if (['mp3','wav','ogg','flac','m4a','aac'].includes(ext)) return 'audio'
  return 'document'
}

const loadFiles = async () => {
  loading.value    = true
  fetchError.value = null
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(props.campaignId, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })
    if (error) throw error
    files.value = (data ?? [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => {
        const path = `${props.campaignId}/${f.name}`
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
        return {
          path,
          name: f.name,
          type: inferType(f.name),
          url: urlData.publicUrl,
          size: f.metadata?.size ?? 0,
          sizeLabel: formatSize(f.metadata?.size ?? 0),
        }
      })
  } catch (e: any) {
    fetchError.value = e?.message ?? 'Erro ao carregar arquivos.'
  } finally {
    loading.value = false
  }
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) setFile(input.files[0])
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

const setFile = (file: File) => {
  uploadError.value = null
  if (file.size > maxSizeMap[uploadCategory.value]) {
    uploadError.value = `Arquivo muito grande. Máximo: ${formatSize(maxSizeMap[uploadCategory.value])}`
    return
  }
  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  uploadError.value  = null
  if (fileInput.value) fileInput.value.value = ''
}

const closeUploadModal = () => {
  showUploadModal.value = false
  clearFile()
}

const uploadFile = async () => {
  if (!selectedFile.value) return
  uploading.value   = true
  uploadError.value = null
  const file     = selectedFile.value
  // Keep original filename, only strip characters that break storage paths
  const safeName = file.name.replace(/[\/\\#?%]/g, '_')
  const path     = `${props.campaignId}/${safeName}`
  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: true })
    if (error) throw error
    toast.success('Upload concluído', `${file.name} enviado com sucesso.`)
    closeUploadModal()
    await loadFiles()
    activeCategory.value = inferType(file.name)
  } catch (e: any) {
    uploadError.value = e?.message ?? 'Erro ao enviar arquivo.'
  } finally {
    uploading.value = false
  }
}

const openDocViewer = async (file: MediaFile) => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const isTxt = ext === 'txt'
  docContent.value = null
  docLoading.value = isTxt
  docFile.value = file
  if (isTxt) {
    try {
      const res = await fetch(file.url)
      const buf = await res.arrayBuffer()
      try {
        docContent.value = new TextDecoder('utf-8', { fatal: true }).decode(buf)
      } catch {
        docContent.value = new TextDecoder('windows-1252').decode(buf)
      }
    } catch { /* fallback to iframe */ }
    docLoading.value = false
  }
}

const askDelete = (file: MediaFile) => { fileToDelete.value = file }

const confirmDelete = async () => {
  if (!fileToDelete.value) return
  deleting.value = true
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([fileToDelete.value.path])
    if (error) throw error
    toast.success('Arquivo excluído', `${fileToDelete.value.name} removido.`)
    files.value = files.value.filter(f => f.path !== fileToDelete.value!.path)
    fileToDelete.value = null
  } catch (e: any) {
    toast.error('Erro ao excluir', e?.message ?? 'Tente novamente.')
  } finally {
    deleting.value = false
  }
}

onMounted(loadFiles)
</script>

<style scoped>
@keyframes spin           { to { transform: rotate(360deg); } }
@keyframes progress-pulse { 0%,100% { opacity:1; } 50% { opacity:.6; } }

/* ─── Título: sem cor local para igualar outras tabs ─── */
.df-section-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: #c0c0d0;
}

/* ─── Botão upload primário ─── */
.df-btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 5px;
  border: 1px solid #b91c1c;
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(127,29,29,0.4);
}
.df-btn-upload:hover { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); }

/* ─── Sub-tabs ─── */
.df-tabs-nav {
  border-bottom: 1px solid #7f1d1d;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.df-tabs-nav::-webkit-scrollbar { height: 0; }
.df-tab {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid transparent;
  font-weight: 600; font-size: 0.875rem; color: #d4a647;
  cursor: pointer; transition: all 0.2s; background: transparent;
  border-top: none; border-left: none; border-right: none; white-space: nowrap;
}
.df-tab:hover { color: #e8c06a; border-bottom-color: #d4a647; }
.df-tab-active { color: #dc2626 !important; border-bottom-color: #dc2626 !important; text-shadow: 0 0 12px rgba(220,38,38,0.5); }

/* ─── Cards de media ─── */
.df-media-card { transition: border-color 0.2s; }
.df-media-card:hover { border-color: #7f1d1d !important; }

/* ─── Botão visualizar/abrir ─── */
.df-btn-view {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; padding: 3px 8px;
  border-radius: 4px; border: 1px solid #4a4a5a;
  color: #d4a647; background: transparent;
  cursor: pointer; transition: all 0.2s;
}
.df-btn-view:hover { border-color: #d4a647; background: rgba(212,166,71,0.08); }

/* ─── Botão excluir ─── */
.df-btn-delete {
  padding: 4px; border-radius: 4px; border: none;
  background: transparent; color: #4a4a5a; cursor: pointer; transition: color 0.2s;
}
.df-btn-delete:hover { color: #f87171; }

/* ─── Audio player ─── */
.df-audio-player {
  width: 100%;
  height: 36px;
  border-radius: 6px;
  background: #0d0d20;
  border: 1px solid #2d1515;
  accent-color: #d4a647;
  box-sizing: border-box;
  display: block;
}
.df-audio-player::-webkit-media-controls-panel {
  background: #0d0d20;
}
.df-audio-player::-webkit-media-controls-play-button,
.df-audio-player::-webkit-media-controls-timeline,
.df-audio-player::-webkit-media-controls-volume-slider {
  accent-color: #d4a647;
}

/* ─── Modal close button ─── */
.df-modal-close {
  padding: 4px; border-radius: 4px; border: none;
  background: transparent; color: #4a4a5a; cursor: pointer; transition: color 0.2s;
}
.df-modal-close:hover { color: #c4c4d4; }
.df-modal-close--light { color: #c4c4d4; }
.df-modal-close--light:hover { color: #ffffff; }

/* ─── Botões do modal ─── */
.df-btn-ghost {
  padding: 8px 16px; border-radius: 5px;
  border: 1px solid #4a4a5a; background: transparent;
  color: #9b9bbb; font-size: 0.75rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.df-btn-ghost:hover { border-color: #6b6b7b; color: #c4c4d4; }

.df-btn-primary-sm {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 5px;
  border: 1px solid #b91c1c;
  background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
  color: #fff; font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer;
  transition: all 0.2s;
}
.df-btn-primary-sm:hover:not(:disabled) { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); }

/* ─── Seletor de tipo no modal ─── */
.df-type-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 12px 8px; border-radius: 6px;
  border: 1px solid #4a4a5a; background: transparent;
  color: #6b6b7b; cursor: pointer; transition: all 0.2s;
}
.df-type-btn:hover { border-color: #7f1d1d; color: #c4c4d4; background: rgba(127,29,29,0.1); }
.df-type-btn-active {
  border-color: #b91c1c !important;
  background: rgba(127,29,29,0.2) !important;
  color: #c4c4d4 !important;
}

/* ─── Doc pre viewer ─── */
.df-doc-pre {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.82rem;
  line-height: 1.7;
  color: #e8e8f4;
  background: #0a0a1a;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ─── Spinner ─── */
.df-spinner {
  display: inline-block;
  width: 48px; height: 48px;
  border: 2px solid #7f1d1d;
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
