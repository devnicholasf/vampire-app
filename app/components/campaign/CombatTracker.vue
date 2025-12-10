<template>
  <div class="combat-tracker space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold text-text-primary">Combat Tracker</h3>
      <div class="flex space-x-2">
        <BaseButton
          v-if="!isCombatActive"
          variant="primary"
          size="sm"
          @click="startCombat"
        >
          ⚔️ Iniciar Combate
        </BaseButton>
        <BaseButton
          v-else
          variant="danger"
          size="sm"
          @click="endCombat"
        >
          🏁 Finalizar Combate
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="showAddParticipant = true"
          :disabled="isCombatActive && currentTurn > 0"
        >
          + Adicionar
        </BaseButton>
      </div>
    </div>

    <!-- Combat Status -->
    <div v-if="isCombatActive" class="bg-surface-card border border-primary rounded-lg p-4">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-text-muted">Rodada Atual</p>
          <p class="text-2xl font-bold text-brand-primary">{{ currentRound }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-text-muted">Turno Atual</p>
          <p class="text-lg font-semibold text-text-primary">
            {{ currentParticipant?.name || 'Aguardando...' }}
          </p>
        </div>
        <div class="flex space-x-2">
          <BaseButton
            variant="primary"
            size="sm"
            @click="nextTurn"
            :disabled="participants.length === 0"
          >
            ⏭️ Próximo
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            @click="previousTurn"
            :disabled="currentTurn === 0 && currentRound === 1"
          >
            ⏪ Anterior
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Participants List -->
    <div class="space-y-3">
      <div v-if="participants.length === 0" class="text-center py-8">
        <div class="text-4xl mb-2">⚔️</div>
        <h3 class="text-lg font-semibold text-text-primary mb-1">Nenhum participante</h3>
        <p class="text-text-muted">Adicione personagens e NPCs para começar o combate</p>
      </div>

      <div
        v-for="(participant, index) in sortedParticipants"
        :key="participant.id"
        :class="getParticipantClasses(index)"
        class="flex items-center justify-between p-4 rounded-lg border transition-all"
      >
        <div class="flex items-center space-x-4">
          <!-- Initiative Order -->
          <div class="text-center">
            <div class="w-8 h-8 rounded-full bg-brand-primary text-black font-bold flex items-center justify-center text-sm">
              {{ index + 1 }}
            </div>
            <div class="text-xs text-text-muted mt-1">Init: {{ participant.initiative }}</div>
          </div>

          <!-- Character Info -->
          <div>
            <h4 class="font-semibold text-text-primary">{{ participant.name }}</h4>
            <div class="flex items-center space-x-2 text-sm text-text-muted">
              <span>{{ participant.isNPC ? 'NPC' : 'Jogador' }}</span>
              <span v-if="participant.clan">• {{ participant.clan }}</span>
            </div>
          </div>

          <!-- Health/Status -->
          <div v-if="participant.health !== undefined" class="flex items-center space-x-2">
            <div class="text-sm">
              <span class="text-text-muted">Saúde:</span>
              <span :class="getHealthClasses(participant.health ?? 0, participant.maxHealth ?? 0)">
                {{ participant.health ?? 0 }}/{{ participant.maxHealth ?? 0 }}
              </span>
            </div>
          </div>

          <!-- Status Effects -->
          <div v-if="participant.statusEffects && participant.statusEffects.length > 0" class="flex space-x-1">
            <BaseBadge
              v-for="effect in participant.statusEffects"
              :key="effect"
              variant="warning"
              size="xs"
            >
              {{ effect }}
            </BaseBadge>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center space-x-2">
          <!-- Health Controls -->
          <div v-if="participant.health !== undefined" class="flex items-center space-x-1">
            <button
              class="w-6 h-6 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
              @click="adjustHealth(participant.id, 1)"
              title="Curar 1"
            >
              +
            </button>
            <button
              class="w-6 h-6 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
              @click="adjustHealth(participant.id, -1)"
              title="Dano 1"
            >
              -
            </button>
          </div>

          <!-- Edit Initiative -->
          <BaseButton
            variant="ghost"
            size="sm"
            @click="editInitiative(participant.id)"
            :disabled="isCombatActive"
          >
            ✏️
          </BaseButton>

          <!-- Remove -->
          <BaseButton
            variant="ghost"
            size="sm"
            @click="removeParticipant(participant.id)"
            :disabled="isCombatActive && currentTurn > 0"
            class="text-red-400 hover:text-red-300"
          >
            🗑️
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Add Participant Modal -->
    <BaseModal
      v-model:show="showAddParticipant"
      title="Adicionar Participante"
      size="md"
    >
      <form @submit.prevent="addParticipant" class="space-y-4">
        <BaseInput
          v-model="newParticipant.name"
          label="Nome"
          placeholder="Nome do personagem/NPC"
          required
        />

        <div>
          <label class="block text-sm font-medium text-text-primary mb-1">Tipo</label>
          <div class="flex space-x-4">
            <label class="flex items-center">
              <input
                v-model="newParticipant.isNPC"
                type="radio"
                :value="false"
                class="mr-2"
              />
              Jogador
            </label>
            <label class="flex items-center">
              <input
                v-model="newParticipant.isNPC"
                type="radio"
                :value="true"
                class="mr-2"
              />
              NPC
            </label>
          </div>
        </div>

        <BaseInput
          v-model.number="newParticipant.initiative"
          label="Iniciativa"
          type="number"
          min="0"
          required
        />

        <BaseInput
          v-model.number="newParticipant.health"
          label="Saúde Atual"
          type="number"
          min="0"
        />

        <BaseInput
          v-model.number="newParticipant.maxHealth"
          label="Saúde Máxima"
          type="number"
          min="1"
        />
      </form>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="ghost" @click="showAddParticipant = false">
            Cancelar
          </BaseButton>
          <BaseButton variant="primary" @click="addParticipant">
            Adicionar
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
// ============================================
// CombatTracker - Sistema de combate para RPG
// ============================================
import { ref, computed } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import BaseModal from '~/components/ui/BaseModal.vue'

interface CombatParticipant {
  id: string
  name: string
  initiative: number
  isNPC: boolean
  health?: number
  maxHealth?: number
  clan?: string
  statusEffects?: string[]
}

interface Props {
  campaignId: string
}

const props = defineProps<Props>()

const participants = ref<CombatParticipant[]>([])
const isCombatActive = ref(false)
const currentRound = ref(1)
const currentTurn = ref(0)
const showAddParticipant = ref(false)

const newParticipant = ref({
  name: '',
  initiative: 10,
  isNPC: false,
  health: 10,
  maxHealth: 10
})

// Computed
const sortedParticipants = computed(() => {
  return [...participants.value].sort((a, b) => b.initiative - a.initiative)
})

const currentParticipant = computed(() => {
  if (!isCombatActive.value || participants.value.length === 0) return null
  return sortedParticipants.value[currentTurn.value % sortedParticipants.value.length]
})

// Methods
const getParticipantClasses = (index: number) => {
  const isCurrentTurn = isCombatActive.value && (currentTurn.value % sortedParticipants.value.length) === index
  
  return [
    isCurrentTurn
      ? 'bg-brand-primary/20 border-brand-primary shadow-md'
      : 'bg-surface-card border-border-primary hover:border-border-secondary'
  ]
}

const getHealthClasses = (current: number, max: number) => {
  const percentage = (current / max) * 100
  
  if (percentage > 75) return 'text-green-400'
  if (percentage > 50) return 'text-yellow-400'
  if (percentage > 25) return 'text-orange-400'
  return 'text-red-400'
}

const startCombat = () => {
  if (participants.value.length === 0) {
    alert('Adicione participantes antes de iniciar o combate')
    return
  }
  
  isCombatActive.value = true
  currentRound.value = 1
  currentTurn.value = 0
}

const endCombat = () => {
  isCombatActive.value = false
  currentRound.value = 1
  currentTurn.value = 0
}

const nextTurn = () => {
  if (!isCombatActive.value) return
  
  currentTurn.value++
  
  // Se chegou ao fim da rodada, incrementa rodada
  if (currentTurn.value >= sortedParticipants.value.length) {
    currentRound.value++
    currentTurn.value = 0
  }
}

const previousTurn = () => {
  if (!isCombatActive.value) return
  
  if (currentTurn.value === 0 && currentRound.value > 1) {
    currentRound.value--
    currentTurn.value = sortedParticipants.value.length - 1
  } else if (currentTurn.value > 0) {
    currentTurn.value--
  }
}

const addParticipant = () => {
  if (!newParticipant.value.name.trim()) return
  
  const participant: CombatParticipant = {
    id: Date.now().toString(),
    name: newParticipant.value.name.trim(),
    initiative: newParticipant.value.initiative,
    isNPC: newParticipant.value.isNPC,
    health: newParticipant.value.health,
    maxHealth: newParticipant.value.maxHealth
  }
  
  participants.value.push(participant)
  
  // Reset form
  newParticipant.value = {
    name: '',
    initiative: 10,
    isNPC: false,
    health: 10,
    maxHealth: 10
  }
  
  showAddParticipant.value = false
}

const removeParticipant = (id: string) => {
  const index = participants.value.findIndex(p => p.id === id)
  if (index > -1) {
    participants.value.splice(index, 1)
  }
}

const adjustHealth = (id: string, amount: number) => {
  const participant = participants.value.find(p => p.id === id)
  if (participant && participant.health !== undefined) {
    participant.health = Math.max(0, Math.min(participant.maxHealth || 10, participant.health + amount))
  }
}

const editInitiative = (id: string) => {
  const participant = participants.value.find(p => p.id === id)
  if (participant) {
    const newInit = prompt(`Nova iniciativa para ${participant.name}:`, participant.initiative.toString())
    if (newInit && !isNaN(parseInt(newInit))) {
      participant.initiative = parseInt(newInit)
    }
  }
}
</script>