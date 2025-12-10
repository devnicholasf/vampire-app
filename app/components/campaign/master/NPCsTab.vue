<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">NPCs da Campanha</h3>
      <BaseButton variant="primary" size="sm" @click="createNPC">
        + Criar NPC
      </BaseButton>
    </div>
    
    <!-- NPCs Grid -->
    <div v-if="npcs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="npc in npcs" 
        :key="npc.id"
        class="bg-surface-card p-6 rounded-lg border border-primary hover:border-accent transition-colors"
      >
        <!-- NPC Avatar/Photo -->
        <div class="flex items-center mb-4">
          <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center mr-4">
            <img 
              v-if="npc.photo" 
              :src="npc.photo" 
              :alt="npc.name"
              class="w-full h-full rounded-full object-cover"
            />
            <span v-else class="text-2xl">🎭</span>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-text-primary">{{ npc.name }}</h4>
            <p class="text-sm text-accent">{{ npc.clan }}</p>
            <p class="text-xs text-text-muted">Geração {{ npc.generation }}</p>
          </div>
        </div>

        <!-- Bio (truncated) -->
        <div class="mb-4">
          <p class="text-sm text-text-secondary line-clamp-3">
            {{ npc.bio || 'Sem biografia definida' }}
          </p>
        </div>

        <!-- Key Points -->
        <div v-if="npc.keyPoints && npc.keyPoints.length > 0" class="mb-4">
          <h5 class="text-xs font-medium text-text-muted mb-2">PONTOS CHAVE:</h5>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="point in npc.keyPoints.slice(0, 3)" 
              :key="point"
              class="inline-block px-2 py-1 bg-secondary rounded text-xs text-white"
            >
              {{ point }}
            </span>
            <span 
              v-if="npc.keyPoints.length > 3"
              class="inline-block px-2 py-1 bg-surface rounded text-xs text-text-muted"
            >
              +{{ npc.keyPoints.length - 3 }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center pt-4 border-t border-border-dark">
          <div class="flex space-x-2">
            <BaseButton variant="ghost" size="sm" @click="editNPC(npc)">
              ✏️ Editar
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="viewDetails(npc)">
              👁️ Ver Detalhes
            </BaseButton>
          </div>
          <BaseButton 
            variant="ghost" 
            size="sm" 
            @click="addToGame(npc)"
            class="text-accent hover:bg-accent hover:text-white"
          >
            🎲 Usar no Jogo
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">🎭</div>
      <h4 class="text-lg font-semibold text-text-primary mb-2">Nenhum NPC criado</h4>
      <p class="text-text-muted mb-6">Crie seu primeiro NPC para começar a popular sua campanha</p>
      <BaseButton variant="primary" @click="createNPC">
        + Criar Primeiro NPC
      </BaseButton>
    </div>

    <!-- NPC Creation/Edit Modal -->
    <NPCModal
      v-if="showCreateModal || editingNPC"
      :npc="editingNPC"
      @close="closeModal"
      @save="saveNPC"
    />

    <!-- NPC Details Modal -->
    <NPCDetailsModal
      v-if="viewingNPC"
      :npc="viewingNPC"
      @close="closeDetailsModal"
      @edit="editNPC"
      @add-to-game="addToGame"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NPC } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import NPCModal from '~/components/campaign/master/NPCModal.vue'
import NPCDetailsModal from '~/components/campaign/master/NPCDetailsModal.vue'

// Props
interface Props {
  campaignId: string
}

const props = defineProps<Props>()

// Reactive data
const npcs = ref<NPC[]>([])

const showCreateModal = ref(false)
const editingNPC = ref<NPC | null>(null)
const viewingNPC = ref<NPC | null>(null)

// Methods
const createNPC = () => {
  showCreateModal.value = true
}

const editNPC = (npc: NPC) => {
  editingNPC.value = npc
  showCreateModal.value = true
}

const viewDetails = (npc: NPC) => {
  viewingNPC.value = npc
}

const closeModal = () => {
  showCreateModal.value = false
  editingNPC.value = null
}

const closeDetailsModal = () => {
  viewingNPC.value = null
}

const saveNPC = (npcData: Omit<NPC, 'id' | 'campaignId' | 'createdAt'>) => {
  const npc: NPC = {
    id: editingNPC.value?.id || `npc_${Date.now()}`,
    campaignId: props.campaignId,
    ...npcData,
    createdAt: editingNPC.value?.createdAt || new Date(),
    updatedAt: new Date()
  }

  if (editingNPC.value) {
    // Update existing
    const index = npcs.value.findIndex(n => n.id === editingNPC.value!.id)
    if (index !== -1) {
      npcs.value[index] = npc
    }
  } else {
    // Create new
    npcs.value.push(npc)
  }

  closeModal()
}

const addToGame = (npc: NPC) => {
  console.log('Adicionando NPC ao jogo:', { name: npc.name, photo: npc.photo })
  alert(`${npc.name} foi adicionado ao jogo! (apenas nome e foto serão visíveis aos jogadores)`)
}

// Expose data to parent if needed
defineExpose({
  npcs
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>