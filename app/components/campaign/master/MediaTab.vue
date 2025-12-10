<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">Mídia da Campanha</h3>
      <BaseButton variant="primary" size="sm" @click="showUploadModal = true">
        📁 Upload de Arquivo
      </BaseButton>
    </div>
    
    <!-- Media Categories -->
    <div class="flex space-x-4 border-b border-border-primary">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="[
          'py-2 px-4 font-medium text-sm transition-colors border-b-2',
          activeCategory === category.id
            ? 'border-accent text-accent'
            : 'border-transparent text-text-muted hover:text-text-primary'
        ]"
        @click="activeCategory = category.id"
      >
        <span class="mr-2">{{ category.icon }}</span>
        {{ category.label }}
      </button>
    </div>

    <!-- Media Grid -->
    <div v-if="filteredMedia.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div 
        v-for="media in filteredMedia" 
        :key="media.id"
        class="bg-surface-card rounded-lg border border-primary hover:border-accent transition-colors overflow-hidden"
      >
        <!-- Preview -->
        <div class="aspect-square bg-surface flex items-center justify-center">
          <img 
            v-if="media.type === 'image'" 
            :src="media.thumbnail || media.url" 
            :alt="media.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="text-3xl">
            {{ getMediaIcon(media.type) }}
          </div>
        </div>

        <!-- Info -->
        <div class="p-3">
          <h4 class="font-medium text-text-primary text-sm truncate">{{ media.name }}</h4>
          <p class="text-xs text-text-muted">{{ formatFileSize(media.size) }}</p>
          
          <!-- Actions -->
          <div class="flex justify-between items-center mt-2">
            <BaseButton variant="ghost" size="sm" @click="useInGame(media)">
              🎮 Usar
            </BaseButton>
            <div class="flex space-x-1">
              <BaseButton variant="ghost" size="sm" @click="downloadMedia(media)">
                ⬇️
              </BaseButton>
              <BaseButton variant="ghost" size="sm" @click="deleteMedia(media.id)">
                🗑️
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">📁</div>
      <h4 class="text-lg font-semibold text-text-primary mb-2">
        {{ activeCategory === 'all' ? 'Nenhum arquivo' : `Nenhum ${getCategoryLabel(activeCategory)}` }}
      </h4>
      <p class="text-text-muted mb-6">Faça upload de arquivos para usar na sua campanha</p>
      <BaseButton variant="primary" @click="showUploadModal = true">
        📁 Fazer Upload
      </BaseButton>
    </div>

    <!-- Upload Modal (Placeholder) -->
    <div 
      v-if="showUploadModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showUploadModal = false"
    >
      <div class="bg-surface-card rounded-lg border border-primary p-6 w-full max-w-lg">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold text-text-primary">Upload de Arquivo</h3>
          <BaseButton variant="ghost" size="sm" @click="showUploadModal = false">
            ✕
          </BaseButton>
        </div>

        <div class="text-center py-8">
          <div class="text-4xl mb-4">🚧</div>
          <p class="text-text-muted mb-4">Sistema de upload será implementado com Supabase</p>
          <p class="text-sm text-text-secondary">
            Suportará: Imagens, Áudio, PDFs, Mapas
          </p>
        </div>

        <div class="flex justify-end">
          <BaseButton variant="ghost" @click="showUploadModal = false">
            Fechar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Delete Media Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click="closeDeleteModal"
    >
      <div
        class="bg-surface-card p-6 rounded-lg border-2 border-primary max-w-sm mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-text-primary">Deletar Arquivo</h3>
        <p class="text-text-muted mb-6">
          Tem certeza que deseja deletar <strong>{{ mediaToDelete?.name }}</strong>?
        </p>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="ghost" @click="closeDeleteModal">
            Cancelar
          </BaseButton>
          <BaseButton variant="danger" @click="confirmDeleteMedia">
            Deletar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <BaseToast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="hideToast"
      class="fixed top-4 right-4 z-[10000]"
    />
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseToast from '~/components/ui/BaseToast.vue'

// Props
interface Props {
  campaignId: string
}

const props = defineProps<Props>()

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'audio' | 'document' | 'map'
  url: string
  thumbnail?: string
  size: number
  createdAt: Date
}

// Reactive data
const showUploadModal = ref(false)
const activeCategory = ref('all')

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)

// Confirmation modal states
const showDeleteModal = ref(false)
const mediaToDelete = ref<MediaFile | null>(null)

// Mock data
const mediaFiles = ref<MediaFile[]>([
  {
    id: '1',
    name: 'Mansão Vampírica.jpg',
    type: 'image',
    url: '/mock/mansion.jpg',
    size: 2048576,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Música Ambiente - Taverna.mp3',
    type: 'audio',
    url: '/mock/tavern.mp3',
    size: 5242880,
    createdAt: new Date()
  }
])

const categories = [
  { id: 'all', label: 'Todos', icon: '📁' },
  { id: 'image', label: 'Imagens', icon: '🖼️' },
  { id: 'audio', label: 'Áudio', icon: '🎵' },
  { id: 'document', label: 'Documentos', icon: '📄' },
  { id: 'map', label: 'Mapas', icon: '🗺️' }
]

// Computed
const filteredMedia = computed(() => {
  if (activeCategory.value === 'all') {
    return mediaFiles.value
  }
  return mediaFiles.value.filter(media => media.type === activeCategory.value)
})

// Methods
const getMediaIcon = (type: string) => {
  const icons = {
    image: '🖼️',
    audio: '🎵',
    document: '📄',
    map: '🗺️'
  }
  return icons[type as keyof typeof icons] || '📁'
}

const getCategoryLabel = (categoryId: string) => {
  const category = categories.find(c => c.id === categoryId)
  return category?.label.toLowerCase() || 'arquivo'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const useInGame = (media: MediaFile) => {
  console.log('Usando mídia no jogo:', media.name)
  showToastMessage(`${media.name} foi adicionado à sessão atual!`, 'success')
}

const downloadMedia = (media: MediaFile) => {
  console.log('Download:', media.name)
  // Future: Implement download
  showToastMessage('Download iniciado', 'info')
}

const deleteMedia = (mediaId: string) => {
  const media = mediaFiles.value.find(m => m.id === mediaId)
  if (media) {
    mediaToDelete.value = media
    showDeleteModal.value = true
  }
}

const confirmDeleteMedia = () => {
  if (mediaToDelete.value) {
    mediaFiles.value = mediaFiles.value.filter(m => m.id !== mediaToDelete.value!.id)
    showToastMessage(`${mediaToDelete.value.name} foi removido`, 'success')
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  mediaToDelete.value = null
}

const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const hideToast = () => {
  showToast.value = false
}
</script>