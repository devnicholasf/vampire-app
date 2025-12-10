<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-surface-card rounded-lg border border-primary p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-text-primary">
          {{ npc ? 'Editar NPC' : 'Criar Novo NPC' }}
        </h3>
        <BaseButton variant="ghost" size="sm" @click="$emit('close')">
          ✕
        </BaseButton>
      </div>

      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- Nome -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Nome do NPC *
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
            placeholder="Ex: Marcus Ventrue"
          >
        </div>

        <!-- Clã -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Clã *
          </label>
          <select
            v-model="form.clan"
            required
            class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="">Selecione um clã</option>
            <option v-for="clan in vampireClans" :key="clan" :value="clan">
              {{ clan }}
            </option>
          </select>
        </div>

        <!-- Geração -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Geração *
          </label>
          <input
            v-model.number="form.generation"
            type="number"
            min="3"
            max="15"
            required
            class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
            placeholder="Ex: 10"
          >
        </div>

        <!-- Bio -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Biografia
          </label>
          <textarea
            v-model="form.bio"
            rows="4"
            class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
            placeholder="Descreva a história e personalidade do NPC..."
          ></textarea>
        </div>

        <!-- Pontos Chave -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Pontos Chave na História
          </label>
          <div class="space-y-2">
            <div 
              v-for="(point, index) in form.keyPoints" 
              :key="index"
              class="flex gap-2"
            >
              <input
                v-model="form.keyPoints[index]"
                type="text"
                class="flex-1 px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
                placeholder="Ex: Conhece segredos do Príncipe"
              >
              <BaseButton 
                variant="ghost" 
                size="sm" 
                @click="removeKeyPoint(index)"
                type="button"
              >
                🗑️
              </BaseButton>
            </div>
            <BaseButton 
              variant="ghost" 
              size="sm" 
              @click="addKeyPoint"
              type="button"
              class="w-full border-dashed border-2 border-primary text-text-muted"
            >
              + Adicionar Ponto Chave
            </BaseButton>
          </div>
        </div>

        <!-- Avatar Upload -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Avatar do Personagem
          </label>
          
          <!-- Preview da imagem -->
          <div v-if="form.photo || previewImage" class="mb-4">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-primary bg-surface">
                <img 
                  v-if="previewImage || form.photo" 
                  :src="previewImage || form.photo" 
                  :alt="form.name || 'Preview'" 
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                >
                <div v-else class="w-full h-full flex items-center justify-center text-text-muted text-2xl">
                  🎭
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm text-text-primary font-medium">Preview do Avatar</p>
                <p class="text-xs text-text-muted">{{ form.name || 'Nome do NPC' }}</p>
              </div>
              <BaseButton 
                v-if="form.photo || previewImage"
                variant="ghost" 
                size="sm" 
                @click="removePhoto"
                type="button"
              >
                🗑️
              </BaseButton>
            </div>
          </div>

          <!-- Upload de arquivo -->
          <div class="space-y-3">
            <div class="flex gap-3">
              <BaseButton 
                variant="primary" 
                size="sm" 
                @click="triggerFileUpload"
                type="button"
                class="flex items-center gap-2"
              >
                📁 Upload de Foto
              </BaseButton>
              <BaseButton 
                variant="ghost" 
                size="sm" 
                @click="toggleUrlInput"
                type="button"
                class="!bg-purple-600 !border-purple-600 !text-white transition-all duration-200 hover:!bg-purple-700 hover:!border-purple-700 hover:!text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
              >
                🌐 URL da Imagem
              </BaseButton>
            </div>

            <!-- Input de arquivo escondido -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="hidden"
            >

            <!-- Input de URL (opcional) -->
            <div v-if="showUrlInput" class="space-y-2">
              <input
                v-model="form.photo"
                type="url"
                class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
                placeholder="https://example.com/npc-photo.jpg"
                @input="previewImage = null"
              >
              <p class="text-xs text-text-muted">
                Cole a URL de uma imagem online
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-border-dark">
          <BaseButton variant="ghost" @click="$emit('close')" type="button">
            Cancelar
          </BaseButton>
          <BaseButton variant="primary" type="submit">
            {{ npc ? 'Salvar Alterações' : 'Criar NPC' }}
          </BaseButton>
        </div>
      </form>
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
import { ref, watchEffect } from 'vue'
import type { NPC } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseToast from '~/components/ui/BaseToast.vue'

// Props
interface Props {
  npc?: NPC | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [npcData: Omit<NPC, 'id' | 'campaignId' | 'createdAt'>]
}>()

// Vampire clans
const vampireClans = [
  'Ventrue', 'Toreador', 'Tremere', 'Brujah', 'Gangrel', 'Malkavian',
  'Nosferatu', 'Giovanni', 'Lasombra', 'Tzimisce', 'Assamite', 
  'Setita', 'Ravnos', 'Caitiff', 'Thin-Blood'
]

// Form data
const form = ref({
  name: '',
  clan: '',
  generation: 10,
  bio: '',
  keyPoints: [''],
  photo: ''
})

// Upload states
const fileInput = ref<HTMLInputElement | null>(null)
const previewImage = ref<string | null>(null)
const showUrlInput = ref(false)

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)

// Initialize form with existing NPC data
watchEffect(() => {
  if (props.npc) {
    form.value = {
      name: props.npc.name,
      clan: props.npc.clan || '',
      generation: props.npc.generation || 10,
      bio: props.npc.bio || '',
      keyPoints: (props.npc.keyPoints && props.npc.keyPoints.length > 0) ? [...props.npc.keyPoints] : [''],
      photo: props.npc.photo || ''
    }
    // Limpar preview quando carregando NPC existente
    previewImage.value = null
    showUrlInput.value = false
  } else {
    // Reset form for new NPC
    form.value = {
      name: '',
      clan: '',
      generation: 10,
      bio: '',
      keyPoints: [''],
      photo: ''
    }
    // Limpar estados de upload
    previewImage.value = null
    showUrlInput.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
})

// Methods
const addKeyPoint = () => {
  form.value.keyPoints.push('')
}

const removeKeyPoint = (index: number) => {
  form.value.keyPoints.splice(index, 1)
  if (form.value.keyPoints.length === 0) {
    form.value.keyPoints.push('')
  }
}

const handleSave = () => {
  const filteredKeyPoints = form.value.keyPoints.filter(point => point.trim() !== '')
  
  emit('save', {
    name: form.value.name,
    clan: form.value.clan,
    generation: form.value.generation,
    bio: form.value.bio,
    keyPoints: filteredKeyPoints,
    photo: previewImage.value || form.value.photo,
    updatedAt: new Date()
  })
}

// Upload methods
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      showToastMessage('Por favor, selecione apenas arquivos de imagem.', 'error')
      return
    }
    
    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToastMessage('A imagem deve ter no máximo 5MB.', 'error')
      return
    }
    
    // Criar preview da imagem
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string
      form.value.photo = '' // Limpar URL se houver
      showToastMessage('Imagem carregada com sucesso!', 'success')
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  previewImage.value = null
  form.value.photo = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const toggleUrlInput = () => {
  showUrlInput.value = !showUrlInput.value
  if (showUrlInput.value) {
    previewImage.value = null // Limpar preview quando trocar para URL
  }
}

const handleImageError = () => {
  // Se a imagem falhar ao carregar, mostrar placeholder
  showToastMessage('Erro ao carregar a imagem. Verifique a URL.', 'error')
}

const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  // Auto-hide após 4 segundos
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const hideToast = () => {
  showToast.value = false
}
</script>

<style scoped>
/* Custom scrollbar */
.max-h-\[90vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[90vh\]::-webkit-scrollbar-track {
  background: #120B2E;
}

.max-h-\[90vh\]::-webkit-scrollbar-thumb {
  background: #2D1B69;
  border-radius: 3px;
}

.max-h-\[90vh\]::-webkit-scrollbar-thumb:hover {
  background: #4C2B85;
}
</style>