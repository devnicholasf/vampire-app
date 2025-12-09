<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">Sistema de Combate</h3>
      <div class="space-x-2">
        <BaseButton variant="ghost" size="sm" @click="resetCombat">
          🔄 Resetar
        </BaseButton>
        <BaseButton 
          variant="primary" 
          size="sm" 
          @click="toggleCombat"
          :class="combatActive ? 'bg-red-600' : ''"
        >
          {{ combatActive ? '⏹️ Parar Combate' : '⚔️ Iniciar Combate' }}
        </BaseButton>
      </div>
    </div>
    
    <!-- Combat Status -->
    <div v-if="combatActive" class="bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-red-400">Combate Ativo</h4>
          <p class="text-sm text-text-muted">Turno {{ currentTurn }} - {{ currentInitiative?.name || 'Aguardando' }}</p>
        </div>
        <BaseButton variant="ghost" size="sm" @click="nextTurn">
          ➡️ Próximo Turno
        </BaseButton>
      </div>
    </div>

    <!-- Initiative Order -->
    <div v-if="combatActive && combatants.length > 0" class="bg-surface-card rounded-lg border border-primary p-4">
      <h4 class="font-medium text-text-primary mb-4">Ordem de Iniciativa</h4>
      <div class="space-y-2">
        <div 
          v-for="(combatant, index) in sortedCombatants" 
          :key="combatant.id"
          :class="[
            'flex items-center justify-between p-2 rounded',
            index === currentInitiativeIndex ? 'bg-accent bg-opacity-20 border border-accent' : 'bg-surface'
          ]"
        >
          <div class="flex items-center space-x-3">
            <span class="text-sm font-mono">{{ combatant.initiative }}</span>
            <span class="font-medium">{{ combatant.name }}</span>
            <span class="text-xs text-text-muted">({{ combatant.type }})</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-text-muted">HP: {{ combatant.health }}</span>
            <BaseButton variant="ghost" size="sm" @click="editCombatant(combatant)">
              ✏️
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="removeCombatant(combatant.id)">
              ❌
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Combatant -->
    <div class="bg-surface-card rounded-lg border border-primary p-4">
      <h4 class="font-medium text-text-primary mb-4">
        {{ combatActive ? 'Adicionar ao Combate' : 'Preparar Combatentes' }}
      </h4>
      
      <form @submit.prevent="addCombatant" class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          v-model="newCombatant.name"
          type="text"
          placeholder="Nome"
          required
          class="px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
        >
        <select
          v-model="newCombatant.type"
          class="px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
        >
          <option value="player">Jogador</option>
          <option value="npc">NPC</option>
          <option value="enemy">Inimigo</option>
        </select>
        <input
          v-model.number="newCombatant.initiative"
          type="number"
          placeholder="Iniciativa"
          required
          class="px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
        >
        <BaseButton variant="primary" type="submit">
          Adicionar
        </BaseButton>
      </form>
    </div>

    <!-- Placeholder for future features -->
    <div class="bg-surface-card p-6 rounded-lg border border-primary">
      <h4 class="font-medium text-text-primary mb-3">Recursos Futuros</h4>
      <ul class="text-sm text-text-muted space-y-1">
        <li>• Sistema de rolagem de dados integrado</li>
        <li>• Cálculo automático de dano</li>
        <li>• Efeitos de status e condições</li>
        <li>• Histórico de ações do combate</li>
        <li>• Integração com fichas dos personagens</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'

// Props
interface Props {
  campaignId: string
}

const props = defineProps<Props>()

interface Combatant {
  id: string
  name: string
  type: 'player' | 'npc' | 'enemy'
  initiative: number
  health: number
  maxHealth: number
}

// Reactive data
const combatActive = ref(false)
const currentTurn = ref(1)
const currentInitiativeIndex = ref(0)
const combatants = ref<Combatant[]>([])

const newCombatant = ref({
  name: '',
  type: 'npc' as const,
  initiative: 0
})

// Computed
const sortedCombatants = computed(() => {
  return [...combatants.value].sort((a, b) => b.initiative - a.initiative)
})

const currentInitiative = computed(() => {
  return sortedCombatants.value[currentInitiativeIndex.value]
})

// Methods
const toggleCombat = () => {
  if (!combatActive.value && combatants.value.length === 0) {
    alert('Adicione pelo menos um combatente antes de iniciar o combate!')
    return
  }
  
  combatActive.value = !combatActive.value
  if (combatActive.value) {
    currentTurn.value = 1
    currentInitiativeIndex.value = 0
  }
}

const resetCombat = () => {
  if (confirm('Tem certeza que deseja resetar o combate?')) {
    combatActive.value = false
    currentTurn.value = 1
    currentInitiativeIndex.value = 0
    combatants.value = []
  }
}

const nextTurn = () => {
  currentInitiativeIndex.value++
  if (currentInitiativeIndex.value >= sortedCombatants.value.length) {
    currentInitiativeIndex.value = 0
    currentTurn.value++
  }
}

const addCombatant = () => {
  const combatant: Combatant = {
    id: `combatant_${Date.now()}`,
    name: newCombatant.value.name,
    type: newCombatant.value.type,
    initiative: newCombatant.value.initiative,
    health: 10, // Default
    maxHealth: 10
  }

  combatants.value.push(combatant)
  
  // Reset form
  newCombatant.value = {
    name: '',
    type: 'npc',
    initiative: 0
  }
}

const editCombatant = (combatant: Combatant) => {
  // Future: Open edit modal
  console.log('Editing combatant:', combatant)
}

const removeCombatant = (id: string) => {
  combatants.value = combatants.value.filter(c => c.id !== id)
}
</script>