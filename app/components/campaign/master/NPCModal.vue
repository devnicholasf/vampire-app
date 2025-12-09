<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
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

        <!-- Photo URL -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            URL da Foto (temporário)
          </label>
          <input
            v-model="form.photo"
            type="url"
            class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
            placeholder="https://example.com/npc-photo.jpg"
          >
          <p class="text-xs text-text-muted mt-1">
            Futuramente será possível fazer upload de arquivo
          </p>
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
  </div>
</template>

<script setup lang="ts">
import type { NPC } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'

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
    photo: form.value.photo,
    updatedAt: new Date()
  })
}
</script>

<style scoped>
/* Custom scrollbar */
.max-h-[90vh]::-webkit-scrollbar {
  width: 6px;
}

.max-h-[90vh]::-webkit-scrollbar-track {
  background: #120B2E;
}

.max-h-[90vh]::-webkit-scrollbar-thumb {
  background: #2D1B69;
  border-radius: 3px;
}

.max-h-[90vh]::-webkit-scrollbar-thumb:hover {
  background: #4C2B85;
}
</style>