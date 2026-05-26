<template>
  <div>
    <label class="df-label mb-2">Avatar do Personagem</label>
    
    <!-- Preview -->
    <div v-if="previewUrl" class="df-preview-container">
      <img :src="previewUrl" :alt="name" class="df-preview-image" />
      <button
        type="button"
        @click="clearImage"
        class="df-preview-remove"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      </button>
      <div class="df-preview-overlay">
        <div class="text-sm font-semibold">{{ name || 'Nome do NPC' }}</div>
      </div>
    </div>

    <!-- Dropzone -->
    <div
      v-else
      @click="triggerUpload"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      class="df-dropzone"
      :class="{ 'df-dropzone-dragging': isDragging }"
    >
      <svg class="w-12 h-12 text-df-gold mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/>
        <circle cx="12" cy="10" r="2" fill="currentColor"/>
      </svg>
      <div class="text-sm font-semibold text-white mb-1">Avatar do Vampiro</div>
      <div class="text-xs text-df-muted mb-3">Arraste uma imagem ou clique para selecionar</div>
      <div class="text-[10px] text-df-muted">JPG, PNG ou WEBP • Máx 5MB</div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileSelect"
      class="hidden"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  name: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 
  'update:modelValue': [value: string]
  'error': [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const previewUrl = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  previewUrl.value = newVal
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    emit('error', 'Apenas arquivos de imagem são permitidos')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    emit('error', 'A imagem deve ter no máximo 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    previewUrl.value = result
    emit('update:modelValue', result)
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  previewUrl.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.df-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--df-text-gold, #d4a647);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.df-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed var(--df-border-silver, #4a4a5a);
  border-radius: 0.75rem;
  background: var(--df-bg-input, #0d0d20);
  cursor: pointer;
  transition: all 0.3s ease;
}

.df-dropzone:hover {
  border-color: var(--df-red, #dc2626);
  background: var(--df-bg-card, #0a0a1a);
  box-shadow: 0 0 16px rgba(220, 38, 38, 0.15);
}

.df-dropzone-dragging {
  border-color: var(--df-red, #dc2626);
  background: rgba(220, 38, 38, 0.1);
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
  transform: scale(1.02);
}

.df-preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 2px solid var(--df-red, #dc2626);
  background: var(--df-bg-input, #0d0d20);
}

.df-preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.df-preview-remove {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(220, 38, 38, 0.5);
  border-radius: 0.5rem;
  color: var(--df-red, #dc2626);
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.df-preview-remove:hover {
  background: rgba(220, 38, 38, 0.2);
  color: white;
}

.df-preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  color: white;
}
</style>
