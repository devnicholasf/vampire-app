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
import { ref } from 'vue'
import type { NPC } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import NPCModal from '~/components/campaign/master/NPCModal.vue'
import NPCDetailsModal from '~/components/campaign/master/NPCDetailsModal.vue'
import BaseToast from '~/components/ui/BaseToast.vue'

// Props
interface Props {
  campaignId: string
}

const props = defineProps<Props>()

// NPCs mock data
const npcs = ref<NPC[]>([
  {
    id: '1',
    name: 'Vampiro Ancião',
    type: 'Antagonista', 
    photo: '/npcs/vampire-elder.jpg',
    campaignId: props.campaignId,
    clan: 'Ventrue',
    generation: 7,
    bio: 'Um vampiro antigo e poderoso que controla parte da cidade. Ex-nobre português do século XVIII.',
    keyPoints: ['Dominação', 'Presença', 'Fortitude', 'Política'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Bartender Joe',
    type: 'Informante',
    photo: '/npcs/bartender.jpg',
    campaignId: props.campaignId,
    clan: 'Nosferatu',
    generation: 9,
    bio: 'Conhece todos os segredos da cidade e está disposto a compartilhá-los... por um preço. Ex-detetive abraçado nos anos 80.',
    keyPoints: ['Ofuscação', 'Animalismo', 'Informações', 'Contatos'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Madame Clarissa',
    type: 'Aliada',
    photo: '/npcs/madame-clarissa.jpg',
    campaignId: props.campaignId,
    clan: 'Toreador',
    generation: 8,
    bio: 'Proprietária de uma galeria de arte, conhece muitos segredos da sociedade vampíresca. Artista renomada abraçada na Belle Époque.',
    keyPoints: ['Auspícios', 'Presença', 'Arte', 'Sociedade'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

const showCreateModal = ref(false)
const editingNPC = ref<NPC | null>(null)
const viewingNPC = ref<NPC | null>(null)

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)

// Delete confirmation states
const showDeleteModal = ref(false)
const npcToDelete = ref<NPC | null>(null)

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

const saveNPC = (npcData: any) => {
  if (editingNPC.value) {
    // Update existing NPC
    const index = npcs.value.findIndex(n => n.id === editingNPC.value!.id)
    if (index !== -1) {
      npcs.value[index] = {
        ...npcs.value[index],
        ...npcData,
        updatedAt: new Date()
      }
    }
  } else {
    // Create new NPC
    const newNPC: NPC = {
      id: `npc-${Date.now()}`,
      campaignId: props.campaignId,
      ...npcData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    npcs.value.push(newNPC)
  }

  closeModal()
}

const addToGame = (npc: NPC) => {
  console.log('Adicionando NPC ao jogo live:', { 
    id: npc.id,
    name: npc.name, 
    photo: npc.photo,
    type: npc.type
  })
  
  // Simular adição ao jogo live - apenas mostrar nome e foto aos jogadores
  showToastMessage(`${npc.name} foi adicionado ao jogo live! Os jogadores verão apenas nome e foto.`, 'success')
}

const confirmDeleteNPC = (npc: NPC) => {
  npcToDelete.value = npc
  showDeleteModal.value = true
}

const executeDeleteNPC = () => {
  if (npcToDelete.value) {
    npcs.value = npcs.value.filter(n => n.id !== npcToDelete.value!.id)
    showToastMessage(`${npcToDelete.value.name} foi removido`, 'success')
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

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>