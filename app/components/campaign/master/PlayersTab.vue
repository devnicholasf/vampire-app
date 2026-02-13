<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">Gerenciar Jogadores</h3>
    </div>
    
    <div class="grid gap-4">
      <div 
        v-for="player in players" 
        :key="player.user_id"
        class="bg-surface-card p-4 rounded-lg border border-primary"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-text-primary">{{ player.character_name || 'Sem nome' }}</p>
            <p class="text-text-muted text-sm">{{ player.role || 'player' }}</p>
          </div>
          <div class="flex space-x-2">
            <BaseButton variant="ghost" size="sm" @click="viewPlayerSheet(player)">
              📊 Ver Ficha
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="kickPlayer(player.user_id)">
              ❌ Remover
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Player Section -->
    <div class="bg-surface-card p-4 rounded-lg border border-primary">
      <h4 class="font-medium text-text-primary mb-3">Convidar Jogador</h4>
      <div class="flex gap-2">
        <input
          v-model="inviteEmail"
          type="email"
          placeholder="email@exemplo.com"
          class="flex-1 px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
        >
        <BaseButton variant="primary" @click="invitePlayer">
          Convidar
        </BaseButton>
      </div>
    </div>

    <!-- Kick Player Confirmation Modal -->
    <div
      v-if="showKickModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click="closeKickModal"
    >
      <div
        class="bg-surface-card p-6 rounded-lg border-2 border-primary max-w-sm mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-text-primary">Remover Jogador</h3>
        <p class="text-text-muted mb-6">
          Tem certeza que deseja remover <strong>{{ playerToKick?.name }}</strong> da campanha?
        </p>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="ghost" @click="closeKickModal">
            Cancelar
          </BaseButton>
          <BaseButton variant="danger" @click="confirmKickPlayer">
            Remover
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <BaseToast
      v-if="showToast"
      :message="toastMessage"
      :variant="toastType"
      @dismiss="hideToast"
      class="fixed top-4 right-4 z-[10000]"
    />

    <!-- Player Sheet Modal -->
    <PlayerSheet
      v-if="viewingPlayerSheet"
      :player="viewingPlayerSheet"
      :canEdit="false"
      @close="closePlayerSheet"
      @save="savePlayerSheet"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Campaign } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseToast from '~/components/ui/BaseToast.vue'
import PlayerSheet from '~/components/campaign/PlayerSheet.vue'

// Props
interface Props {
  campaignId: string
  campaign?: Campaign | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  refresh: []
}>()

// Use real players from campaign_players
const players = computed(() => {
  console.log('Campaign data:', props.campaign)
  console.log('Campaign players:', props.campaign?.campaign_players)
  return props.campaign?.campaign_players || []
})

const inviteEmail = ref('')

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)

// Confirmation modal states
const showKickModal = ref(false)
const playerToKick = ref<{ id: string; name: string } | null>(null)

// Player sheet modal state
const viewingPlayerSheet = ref<any>(null)

// Methods
const viewPlayerSheet = (player: any) => {
  viewingPlayerSheet.value = player
}

const closePlayerSheet = () => {
  viewingPlayerSheet.value = null
}

const savePlayerSheet = async (playerData: any) => {
  try {
    const { savePlayerSheet: saveToDB } = useCampaign()
    
    console.log('Salvando ficha do jogador (Mestre):', playerData)
    
    // Salvar no Supabase
    await saveToDB(props.campaignId, playerData.user_id, playerData.sheet)
    
    showToastMessage('Ficha do jogador atualizada!', 'success')
  } catch (error: any) {
    console.error('Erro ao salvar ficha:', error)
    showToastMessage('Erro ao salvar ficha: ' + error.message, 'error')
  }
  closePlayerSheet()
}

const kickPlayer = (playerId: string) => {
  const player = players.value.find(p => p.user_id === playerId)
  if (player) {
    playerToKick.value = { id: playerId, name: player.character_name || player.name || 'Jogador' }
    showKickModal.value = true
  }
}

const confirmKickPlayer = async () => {
  if (playerToKick.value) {
    try {
      const { removePlayerFromCampaign } = useCampaign()
      
      // Remover jogador
      await removePlayerFromCampaign(props.campaignId, playerToKick.value.id)
      
      showToastMessage(`${playerToKick.value.name} foi removido da campanha`, 'success')
      
      // Emitir evento para o pai recarregar os dados
      emit('refresh')
    } catch (error: any) {
      console.error('Erro ao remover jogador:', error)
      showToastMessage(`Erro ao remover jogador: ${error.message}`, 'error')
    }
  }
  closeKickModal()
}

const closeKickModal = () => {
  showKickModal.value = false
  playerToKick.value = null
}

const invitePlayer = () => {
  if (inviteEmail.value) {
    console.log('Convidando jogador:', inviteEmail.value)
    // Future: Send invitation
    showToastMessage(`Convite enviado para ${inviteEmail.value}`, 'success')
    inviteEmail.value = ''
  }
}

// Expose count for parent
defineExpose({
  count: computed(() => players.value.length)
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