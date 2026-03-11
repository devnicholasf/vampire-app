<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
    <div class="df-modal-card w-full max-w-2xl max-h-[90vh] overflow-y-auto df-scrollbar">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-df-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
            {{ npc ? 'Editar NPC' : 'Criar Novo NPC' }}
          </h3>
          <button @click="$emit('close')" class="df-btn-icon">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form @submit.prevent="handleSave" class="space-y-5">
          <!-- Nome -->
          <div>
            <label class="df-label">Nome do NPC *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="df-input"
              placeholder="Ex: Marcus Ventrue"
            />
          </div>

          <!-- Clã & Geração -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="df-label">Clã *</label>
              <select v-model="form.clan" required class="df-input">
                <option value="">Selecione um clã</option>
                <option v-for="clan in vampireClans" :key="clan" :value="clan">{{ clan }}</option>
              </select>
            </div>
            <div>
              <label class="df-label">Geração *</label>
              <input
                v-model.number="form.generation"
                type="number"
                min="3"
                max="15"
                required
                class="df-input"
                placeholder="Ex: 10"
              />
            </div>
          </div>

          <!-- Status & Seita -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="df-label">Status</label>
              <select v-model="form.status" class="df-input">
                <option value="active">Ativo</option>
                <option value="dead">Morto</option>
                <option value="missing">Desaparecido</option>
                <option value="traitor">Traidor</option>
              </select>
            </div>
            <div>
              <label class="df-label">Seita</label>
              <select v-model="form.sect" class="df-input">
                <option value="">Selecione uma seita</option>
                <option v-for="s in sects" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <!-- Papel na crônica & Pool principal -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="df-label">Papel na Crônica</label>
              <input v-model="form.role" type="text" class="df-input" placeholder="Ex: Príncipe da cidade" />
            </div>
            <div>
              <label class="df-label">Pool Principal</label>
              <input v-model="form.mainPool" type="text" class="df-input" placeholder="Ex: Manipulação + Persuasão (7)" />
            </div>
          </div>

          <!-- Motivação -->
          <div>
            <label class="df-label">Motivação</label>
            <textarea v-model="form.motivation" rows="2" class="df-input resize-none" placeholder="O que move este NPC..."></textarea>
          </div>

          <!-- Segredo -->
          <div>
            <label class="df-label">Segredo</label>
            <textarea v-model="form.secret" rows="2" class="df-input resize-none" placeholder="O que ele esconde..."></textarea>
          </div>

          <!-- Pontos Chave -->
          <div>
            <label class="df-label">Pontos Chave na História</label>
            <div class="space-y-2">
              <div v-for="(point, index) in form.keyPoints" :key="index" class="flex gap-2">
                <input
                  v-model="form.keyPoints[index]"
                  type="text"
                  class="df-input flex-1"
                  :placeholder="index === 0 ? 'Ex: Conhece segredos do Príncipe' : ''"
                />
                <button type="button" @click="removeKeyPoint(index)" class="df-btn-icon flex-shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
              <button type="button" @click="addKeyPoint" class="w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-red hover:text-df-silver transition-colors">
                + Adicionar Ponto Chave
              </button>
            </div>
          </div>

          <!-- Avatar Upload -->
          <div>
            <label class="df-label">Avatar do Personagem</label>

            <!-- Preview -->
            <div v-if="form.photo || previewImage" class="mb-4">
              <div class="flex items-center gap-4">
                <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-df-border-red bg-df-input flex-shrink-0">
                  <img
                    v-if="previewImage || form.photo"
                    :src="previewImage || form.photo"
                    :alt="form.name || 'Preview'"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-white font-medium">Preview do Avatar</p>
                  <p class="text-xs text-df-muted">{{ form.name || 'Nome do NPC' }}</p>
                </div>
                <button type="button" @click="removePhoto" class="df-btn-icon flex-shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>

            <!-- Upload Buttons -->
            <div class="flex gap-3">
              <button type="button" @click="triggerFileUpload" class="df-btn-ghost text-sm flex items-center gap-2 px-4 py-2">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload
              </button>
              <button type="button" @click="toggleUrlInput" class="df-btn-ghost text-sm flex items-center gap-2 px-4 py-2">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                URL
              </button>
            </div>

            <input ref="fileInput" type="file" accept="image/*" @change="handleFileUpload" class="hidden" />

            <div v-if="showUrlInput" class="mt-3 space-y-1">
              <input v-model="form.photo" type="url" class="df-input" placeholder="https://example.com/npc-photo.jpg" @input="previewImage = null" />
              <p class="text-xs text-df-muted">Cole a URL de uma imagem online</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-6 border-t border-df-border-red/50">
            <button type="button" @click="$emit('close')" class="df-btn-ghost px-6 py-2">Cancelar</button>
            <button type="submit" class="df-btn-primary px-6 py-2">{{ npc ? 'Salvar Alterações' : 'Criar NPC' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { NPC } from '~/types'
import { useToast } from '~/composables/useToast'

interface Props { npc?: NPC | null }
const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [npcData: Omit<NPC, 'id' | 'campaignId' | 'createdAt'>]
}>()

const toast = useToast()

const vampireClans = [
  'Ventrue', 'Toreador', 'Tremere', 'Brujah', 'Gangrel', 'Malkavian',
  'Nosferatu', 'Giovanni', 'Lasombra', 'Tzimisce', 'Assamite',
  'Setita', 'Ravnos', 'Caitiff', 'Thin-Blood'
]

const sects = ['Camarilla', 'Sabá', 'Anarquistas', 'Independente']

const form = ref({
  name: '',
  clan: '',
  generation: 10,
  status: 'active' as string,
  sect: '',
  role: '',
  motivation: '',
  secret: '',
  mainPool: '',
  keyPoints: [''],
  photo: ''
})

const fileInput = ref<HTMLInputElement | null>(null)
const previewImage = ref<string | null>(null)
const showUrlInput = ref(false)

watchEffect(() => {
  if (props.npc) {
    form.value = {
      name: props.npc.name,
      clan: props.npc.clan || '',
      generation: props.npc.generation || 10,
      status: props.npc.status || 'active',
      sect: props.npc.sect || '',
      role: props.npc.role || '',
      motivation: props.npc.motivation || '',
      secret: props.npc.secret || '',
      mainPool: props.npc.mainPool || '',
      keyPoints: (props.npc.keyPoints && props.npc.keyPoints.length > 0) ? [...props.npc.keyPoints] : [''],
      photo: props.npc.photo || ''
    }
    previewImage.value = null
    showUrlInput.value = false
  } else {
    form.value = { name: '', clan: '', generation: 10, status: 'active', sect: '', role: '', motivation: '', secret: '', mainPool: '', keyPoints: [''], photo: '' }
    previewImage.value = null
    showUrlInput.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
})

const addKeyPoint = () => { form.value.keyPoints.push('') }
const removeKeyPoint = (index: number) => {
  form.value.keyPoints.splice(index, 1)
  if (form.value.keyPoints.length === 0) form.value.keyPoints.push('')
}

const handleSave = () => {
  const filteredKeyPoints = form.value.keyPoints.filter(p => p.trim() !== '')
  emit('save', {
    name: form.value.name,
    clan: form.value.clan,
    generation: form.value.generation,
    status: form.value.status as any,
    sect: form.value.sect,
    role: form.value.role,
    motivation: form.value.motivation,
    secret: form.value.secret,
    mainPool: form.value.mainPool,
    keyPoints: filteredKeyPoints,
    photo: previewImage.value || form.value.photo,
    updatedAt: new Date()
  })
}

const triggerFileUpload = () => { fileInput.value?.click() }

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { toast.error('Tipo inválido', 'Selecione apenas arquivos de imagem.'); return }
  if (file.size > 5 * 1024 * 1024) { toast.error('Arquivo grande', 'A imagem deve ter no máximo 5MB.'); return }
  const reader = new FileReader()
  reader.onload = (e) => { previewImage.value = e.target?.result as string; form.value.photo = '' }
  reader.readAsDataURL(file)
}

const removePhoto = () => { previewImage.value = null; form.value.photo = ''; if (fileInput.value) fileInput.value.value = '' }
const toggleUrlInput = () => { showUrlInput.value = !showUrlInput.value; if (showUrlInput.value) previewImage.value = null }
const handleImageError = () => { toast.error('Erro de imagem', 'Verifique a URL da imagem.') }
</script>

<style scoped>
.df-modal-card {
  background: var(--df-bg-card, #0a0a1a);
  border: 1px solid var(--df-border-red, #7f1d1d);
  border-radius: 0.75rem;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 0 40px rgba(220,38,38,0.15), inset 0 1px 6px rgba(0,0,0,0.5);
}
.df-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--df-silver, #c0c0d0);
  margin-bottom: 0.5rem;
}
.df-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  background: var(--df-bg-input, #0d0d20);
  color: var(--df-silver, #c0c0d0);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}
.df-input:focus { border-color: var(--df-red, #dc2626); }
.df-input option { background: #0d0d20; color: #c0c0d0; }
.df-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid transparent;
  color: #6b6b80;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.df-btn-icon:hover { color: #dc2626; border-color: #7f1d1d; background: rgba(127,29,29,0.15); }
.df-btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.03em;
  background: linear-gradient(135deg, #991b1b, #7f1d1d); color: #fecaca;
  border: 1px solid #dc2626; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease; box-shadow: 0 0 12px rgba(220,38,38,0.2);
}
.df-btn-primary:hover { background: linear-gradient(135deg, #b91c1c, #991b1b); box-shadow: 0 0 20px rgba(220,38,38,0.4); color: #fff; }
.df-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 500; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.03em;
  background: transparent; color: #6b6b80;
  border: 1px solid #4a4a5a; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease;
}
.df-btn-ghost:hover { border-color: #dc2626; color: #c0c0d0; background: rgba(127,29,29,0.1); }
.df-scrollbar::-webkit-scrollbar { width: 6px; }
.df-scrollbar::-webkit-scrollbar-track { background: #050510; }
.df-scrollbar::-webkit-scrollbar-thumb { background: #7f1d1d; border-radius: 3px; }
.df-scrollbar::-webkit-scrollbar-thumb:hover { background: #991b1b; }
</style>
