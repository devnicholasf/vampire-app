<template>
  <BaseModal
    v-model:show="showModal"
    title="Adicionar Evento à Timeline"
    size="lg"
    @close="resetForm"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Tipo de Evento -->
      <div>
        <label class="block text-sm font-medium text-text-primary mb-2">
          Tipo de Evento
        </label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            v-for="type in eventTypes"
            :key="type.id"
            type="button"
            :class="getEventTypeClasses(type.id)"
            @click="form.type = type.id"
          >
            <span class="mr-1">{{ type.icon }}</span>
            {{ type.name }}
          </button>
        </div>
      </div>

      <!-- Título -->
      <div>
        <label for="title" class="block text-sm font-medium text-text-primary mb-1">
          Título do Evento
        </label>
        <BaseInput
          id="title"
          v-model="form.title"
          placeholder="Ex: Emboscada no beco"
          required
          :error="errors.title"
        />
      </div>

      <!-- Descrição -->
      <div>
        <label for="description" class="block text-sm font-medium text-text-primary mb-1">
          Descrição
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          class="w-full px-3 py-2 bg-surface border border-border-primary rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
          placeholder="Descreva o que aconteceu neste evento..."
          required
        ></textarea>
      </div>

      <!-- Sessão -->
      <div>
        <label for="session" class="block text-sm font-medium text-text-primary mb-1">
          Sessão
        </label>
        <BaseInput
          id="session"
          v-model.number="form.session"
          type="number"
          min="1"
          placeholder="Número da sessão"
          required
          :error="errors.session"
        />
      </div>

      <!-- Participantes (opcional) -->
      <div>
        <label class="block text-sm font-medium text-text-primary mb-1">
          Participantes (opcional)
        </label>
        <div class="flex flex-wrap gap-2">
          <BaseBadge
            v-for="participant in form.participants"
            :key="participant.id"
            variant="primary"
            size="sm"
          >
            {{ participant.name }}
            <button
              type="button"
              class="ml-1 text-xs hover:text-red-300"
              @click="removeParticipant(participant.id)"
            >
              ✕
            </button>
          </BaseBadge>
          
          <button
            type="button"
            class="text-xs text-brand-primary hover:text-brand-secondary"
            @click="showParticipantSelector = !showParticipantSelector"
          >
            + Adicionar
          </button>
        </div>
        
        <!-- Selector de participantes -->
        <div v-if="showParticipantSelector" class="mt-2 space-y-1">
          <button
            v-for="player in availableParticipants"
            :key="player.id"
            type="button"
            class="block w-full text-left px-2 py-1 text-sm hover:bg-surface-card-hover rounded"
            @click="addParticipant(player)"
          >
            {{ player.name }} ({{ player.type }})
          </button>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <BaseButton
          variant="ghost"
          @click="showModal = false"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          :disabled="!isFormValid || loading"
          @click="handleSubmit"
        >
          {{ loading ? 'Criando...' : 'Criar Evento' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
// ============================================
// AddEventModal - Modal para criar eventos da timeline
// ============================================
import { ref, computed } from 'vue'
import type { TimelineEventType, TimelineEvent } from '~/types'
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'

interface Props {
  show: boolean
  campaignId: string
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'eventCreated', event: TimelineEvent): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const loading = ref(false)
const showParticipantSelector = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({
  type: 'roleplay' as TimelineEventType,
  title: '',
  description: '',
  session: 1,
  participants: [] as Array<{ id: string; name: string; type: string }>
})

const eventTypes = [
  { id: 'combat', name: 'Combate', icon: '⚔️' },
  { id: 'roleplay', name: 'Roleplay', icon: '🎭' },
  { id: 'discovery', name: 'Descoberta', icon: '🔍' },
  { id: 'social', name: 'Social', icon: '💬' },
  { id: 'investigation', name: 'Investigação', icon: '🕵️' },
  { id: 'travel', name: 'Viagem', icon: '🗺️' },
  { id: 'other', name: 'Outro', icon: '📝' }
] as const

// Mock participants (later this will come from campaign data)
const availableParticipants = ref([
  { id: '1', name: 'Marcus Ventrue', type: 'Jogador' },
  { id: '2', name: 'Elena Toreador', type: 'Jogador' },
  { id: '3', name: 'Viktor Tremere', type: 'NPC' },
  { id: '4', name: 'Dante Nosferatu', type: 'NPC' }
])

const isFormValid = computed(() => {
  return form.value.title.trim() !== '' && 
         form.value.description.trim() !== '' &&
         form.value.session > 0
})

const getEventTypeClasses = (typeId: string) => {
  const isSelected = form.value.type === typeId
  return [
    'px-3 py-2 text-sm rounded-md border transition-all',
    isSelected 
      ? 'bg-brand-primary text-black border-brand-primary'
      : 'bg-surface border-border-primary text-text-primary hover:bg-surface-card-hover'
  ]
}

const addParticipant = (participant: any) => {
  if (!form.value.participants.find(p => p.id === participant.id)) {
    form.value.participants.push(participant)
  }
  showParticipantSelector.value = false
}

const removeParticipant = (participantId: string) => {
  const index = form.value.participants.findIndex(p => p.id === participantId)
  if (index > -1) {
    form.value.participants.splice(index, 1)
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Título é obrigatório'
  }
  
  if (!form.value.description.trim()) {
    errors.value.description = 'Descrição é obrigatória'
  }
  
  if (form.value.session < 1) {
    errors.value.session = 'Sessão deve ser maior que 0'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      campaignId: props.campaignId,
      authorId: 'current-user-id', // This would come from auth
      type: form.value.type,
      title: form.value.title,
      description: form.value.description,
      session: form.value.session,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    emit('eventCreated', newEvent)
    showModal.value = false
    resetForm()
  } catch (error) {
    console.error('Erro ao criar evento:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    type: 'roleplay',
    title: '',
    description: '',
    session: 1,
    participants: []
  }
  errors.value = {}
  showParticipantSelector.value = false
}
</script>