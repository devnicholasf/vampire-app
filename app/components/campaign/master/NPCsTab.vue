<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">NPCs da Campanha</h3>
      <BaseButton variant="primary" size="sm" @click="createNPC">
        + Criar NPC
      </BaseButton>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4 mx-auto"></div>
      <p class="text-text-muted">Carregando NPCs...</p>
    </div>
    
    <!-- NPCs Grid -->
    <div v-else-if="npcs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="npc in npcs" 
        :key="npc.id"
        class="bg-surface-card p-6 rounded-lg border border-primary hover:border-accent transition-colors relative group"
      >
        <!-- Delete Button -->
        <BaseButton 
          variant="ghost" 
          size="sm" 
          @click="confirmDeleteNPC(npc)"
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-600 hover:text-white"
        >
          🗑️
        </BaseButton>
        
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
          <div class="flex flex-wrap gap-2">
            <BaseButton variant="ghost" size="sm" @click="editNPC(npc)">
              ✏️ Editar
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="viewDetails(npc)">
              👁️ Ver Detalhes
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="openSheet(npc)">
              📋 Ficha
            </BaseButton>
          </div>
          <BaseButton 
            variant="ghost" 
            size="sm" 
            @click="addToGame(npc)"
            :class="isGameLive ? 'text-accent hover:bg-accent hover:text-white' : 'text-text-muted'"
            :disabled="!isGameLive"
          >
            🎲 {{ isGameLive ? 'Usar no Jogo' : 'Jogo Inativo' }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="text-center py-12">
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

    <!-- NPC Sheet Modal -->
    <NPCSheet
      v-if="viewingSheet"
      :npc="viewingSheet"
      @close="closeSheet"
      @save="saveNPCSheet"
    />

    <!-- Delete NPC Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click="closeDeleteModal"
    >
      <div
        class="bg-surface-card p-6 rounded-lg border-2 border-primary max-w-sm mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-text-primary">Deletar NPC</h3>
        <p class="text-text-muted mb-6">
          Tem certeza que deseja deletar <strong>{{ npcToDelete?.name }}</strong>?
        </p>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="ghost" @click="closeDeleteModal">
            Cancelar
          </BaseButton>
          <BaseButton variant="danger" @click="executeDeleteNPC">
            Deletar
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { NPC } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import NPCModal from '~/components/campaign/master/NPCModal.vue'
import NPCDetailsModal from '~/components/campaign/master/NPCDetailsModal.vue'
import NPCSheet from '~/components/campaign/master/NPCSheet.vue'

// Props
interface Props {
  campaignId: string
}

const props = defineProps<Props>()

// Usar composable de campanha e jogo ao vivo
const { campaignNPCs: npcs, loadCampaignNPCs, createNPC: createNPCInCampaign, updateNPC, deleteNPC, subscribeToNPCs, loading } = useCampaign()
const { addNPCToGame, isGameLive } = useLiveGame()
const toast = useToast()

// Estados locais para UI
const showCreateModal = ref(false)
const editingNPC = ref<NPC | null>(null)
const viewingNPC = ref<NPC | null>(null)
const viewingSheet = ref<NPC | null>(null)

// Delete confirmation states
const showDeleteModal = ref(false)
const npcToDelete = ref<NPC | null>(null)

// Subscription para real-time updates
let npcSubscription: any = null

// Carregar NPCs quando componente for montado
onMounted(async () => {
  await loadCampaignNPCs(props.campaignId)
  
  // Ativar subscrição para tempo real
  npcSubscription = subscribeToNPCs(props.campaignId)
})

// Limpar subscrição quando componente for desmontado
onUnmounted(() => {
  if (npcSubscription) {
    npcSubscription.unsubscribe()
  }
})

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

const openSheet = (npc: NPC) => {
  viewingSheet.value = npc
}

const closeModal = () => {
  showCreateModal.value = false
  editingNPC.value = null
}

const closeDetailsModal = () => {
  viewingNPC.value = null
}

const closeSheet = () => {
  viewingSheet.value = null
}

const saveNPC = async (npcData: any) => {
  try {
    if (editingNPC.value) {
      // Update existing NPC
      await updateNPC(editingNPC.value.id, npcData)
      toast.success('NPC atualizado!', `${npcData.name} foi atualizado com sucesso`)
    } else {
      // Create new NPC
      await createNPCInCampaign({
        campaignId: props.campaignId,
        ...npcData
      })
      toast.success('NPC criado!', `${npcData.name} foi adicionado à campanha`)
    }
  } catch (error: any) {
    console.error('Erro ao salvar NPC:', error)
    toast.error('Erro ao salvar NPC', error?.message || 'Tente novamente')
  }
  
  closeModal()
}

const saveNPCSheet = async (npcData: any) => {
  try {
    await updateNPC(npcData.id, npcData)
    toast.success('Ficha salva!', 'Ficha do NPC foi atualizada com sucesso')
  } catch (error: any) {
    console.error('Erro ao salvar ficha do NPC:', error)
    toast.error('Erro ao salvar ficha', error?.message || 'Tente novamente')
  }
  closeSheet()
}

const addToGame = async (npc: NPC) => {
  if (!isGameLive.value) {
    toast.error('Jogo inativo', 'Nenhum jogo está ativo no momento')
    return
  }
  
  try {
    await addNPCToGame(npc, true) // true = visível para jogadores
    toast.success('NPC adicionado!', `${npc.name} entrou no jogo ao vivo`)
  } catch (error: any) {
    console.error('Erro ao adicionar NPC ao jogo:', error)
    toast.error('Erro ao adicionar ao jogo', error?.message || 'Tente novamente')
  }
}

const confirmDeleteNPC = (npc: NPC) => {
  npcToDelete.value = npc
  showDeleteModal.value = true
}

const executeDeleteNPC = async () => {
  if (npcToDelete.value) {
    try {
      await deleteNPC(npcToDelete.value.id)
      toast.success('NPC removido!', `${npcToDelete.value.name} foi removido da campanha`)
    } catch (error: any) {
      console.error('Erro ao deletar NPC:', error)
      toast.error('Erro ao remover NPC', error?.message || 'Tente novamente')
    }
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  npcToDelete.value = null
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
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>