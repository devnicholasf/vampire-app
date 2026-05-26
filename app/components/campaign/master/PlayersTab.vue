<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="df-section-title text-xl flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        Gerenciar Jogadores
      </h3>
      <span class="text-sm text-df-muted">{{ players.length }} jogador(es)</span>
    </div>

    <!-- Players List -->
    <div class="space-y-4">
      <div
        v-for="player in players"
        :key="player.user_id"
        class="df-card group hover:border-df-red/40 transition-all duration-300"
      >
        <div class="df-card-corner df-card-corner-tl"></div>
        <div class="df-card-corner df-card-corner-tr"></div>
        <div class="df-card-corner df-card-corner-bl"></div>
        <div class="df-card-corner df-card-corner-br"></div>

        <div class="relative z-10 flex items-center gap-4">
          <!-- Avatar -->
          <div class="w-14 h-14 rounded-full border-2 border-df-border-red bg-df-input flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              v-if="player.sheet?.avatar"
              :src="player.sheet.avatar"
              :alt="player.character_name || 'Jogador'"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-df-red font-bold text-lg">
              {{ getInitials(player.character_name || player.name || '?') }}
            </span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h4 class="text-lg font-bold text-white truncate">
              {{ player.character_name || 'Sem nome' }}
            </h4>
            <div class="flex flex-wrap items-center gap-3 mt-1">
              <span v-if="player.sheet?.clan" class="text-sm text-df-red font-medium">
                {{ player.sheet.clan }}
              </span>
              <span v-if="player.sheet?.generation" class="text-xs text-df-muted">
                {{ player.sheet.generation }}ª Geração
              </span>
            </div>
          </div>

          <!-- Quick Stats -->
          <div v-if="player.sheet" class="hidden md:flex items-center gap-4 text-center flex-shrink-0">
            <div>
              <p class="text-xs text-df-muted">Fome</p>
              <p class="text-lg font-bold text-df-red">{{ player.sheet.hunger ?? 1 }}</p>
            </div>
            <div>
              <p class="text-xs text-df-muted">Human.</p>
              <p class="text-lg font-bold text-df-silver">{{ player.sheet.humanity ?? 7 }}</p>
            </div>
            <div>
              <p class="text-xs text-df-muted">Vontade</p>
              <p class="text-lg font-bold text-df-silver">{{ player.sheet.willpower ?? 3 }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <BaseButton variant="ghost" size="sm" @click="viewPlayerSheet(player)" title="Ver ficha">
              <svg class="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Ver Ficha
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="kickPlayer(player.user_id)" title="Remover jogador">
              <svg class="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
              Remover
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="players.length === 0" class="df-card text-center py-12">
        <svg class="w-16 h-16 text-df-border-red mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        <p class="text-df-silver mb-2">Nenhum jogador na campanha</p>
        <p class="text-df-muted text-sm">Convide jogadores usando o código de convite ou o formulário abaixo.</p>
      </div>
    </div>

    <!-- Invite Section -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>

      <div class="relative z-10">
        <h4 class="df-section-title text-lg flex items-center gap-2 mb-4">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Convidar Jogador
        </h4>
        <div class="flex gap-3 items-end">
          <div class="flex-1">
            <BaseInput
              v-model="inviteEmail"
              type="email"
              placeholder="email@exemplo.com"
              size="md"
            />
          </div>
          <BaseButton variant="primary" @click="invitePlayer" :disabled="inviteLoading">
            <svg v-if="!inviteLoading" class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <svg v-else class="w-4 h-4 mr-1 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.3"/><path d="M12 2a10 10 0 019.8 8" stroke-linecap="round"/></svg>
            {{ inviteLoading ? 'Enviando...' : 'Convidar' }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Kick Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showKickModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]"
        @click="closeKickModal"
      >
        <div
          class="df-card max-w-sm mx-4 w-full"
          style="--df-bg-deep: #050510; --df-bg-card: #0a0a1a; --df-border-red: #7f1d1d; --df-accent-red: #dc2626; --df-text-silver: #c0c0d0; --df-text-gold: #d4a647; --df-text-muted: #6b6b80;"
          @click.stop
        >
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>

          <div class="relative z-10 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-red-500/50 bg-red-500/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Remover Jogador</h3>
            <p class="text-df-muted mb-6">
              Tem certeza que deseja remover <strong class="text-df-silver">{{ playerToKick?.name }}</strong> da campanha? Esta ação não pode ser desfeita.
            </p>
            <div class="flex justify-center gap-3">
              <button @click="closeKickModal" class="df-btn-ghost px-6 py-2">
                Cancelar
              </button>
              <button @click="confirmKickPlayer" class="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg border border-red-500 transition-all font-medium">
                <svg class="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                Remover
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notification -->
    <Teleport to="body">
      <BaseToast
        v-if="showToast"
        :message="toastMessage"
        :variant="toastType"
        @dismiss="hideToast"
        class="fixed top-4 right-4 z-[10000]"
        style="--df-bg-deep: #050510; --df-bg-card: #0a0a1a; --df-border-red: #7f1d1d; --df-accent-red: #dc2626; --df-text-silver: #c0c0d0; --df-text-gold: #d4a647; --df-text-muted: #6b6b80;"
      />
    </Teleport>

    <!-- Player Sheet Modal -->
    <Teleport to="body">
      <PlayerSheet
        v-if="viewingPlayerSheet"
        :player="viewingPlayerSheet"
        :campaign-id="props.campaignId"
        :canEdit="false"
        @close="closePlayerSheet"
        @save="savePlayerSheet"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Campaign } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
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
  'update:count': [count: number]
}>()

// Use real players from campaign_players
const players = computed(() => {
  console.log('Campaign data:', props.campaign)
  const raw = props.campaign as any
  console.log('Campaign players:', raw?.campaign_players)
  return raw?.campaign_players || []
})

// Watch players to update count
watch(players, (newPlayers) => {
  emit('update:count', newPlayers.length)
}, { immediate: true })

const inviteEmail = ref('')
const inviteLoading = ref(false)

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)

// Confirmation modal states
const showKickModal = ref(false)
const playerToKick = ref<{ id: string; name: string } | null>(null)

// Player sheet modal state
const viewingPlayerSheet = ref<any>(null)

// Helpers
const getInitials = (name: string): string => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

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
  const player = players.value.find((p: any) => p.user_id === playerId)
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

const invitePlayer = async () => {
  const email = inviteEmail.value.trim()
  
  if (!email) {
    showToastMessage('Digite um email para convidar.', 'warning')
    return
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showToastMessage('Formato de email inválido.', 'error')
    return
  }

  inviteLoading.value = true

  try {
    const { sendCampaignInvite } = useCampaign()
    const result = await sendCampaignInvite(props.campaignId, email)

    if (result.success) {
      showToastMessage(result.message, 'success')
      inviteEmail.value = ''
    } else {
      showToastMessage(result.message, 'error')
    }
  } catch (error: any) {
    console.error('Erro ao convidar jogador:', error)
    showToastMessage(error.message || 'Erro ao enviar convite.', 'error')
  } finally {
    inviteLoading.value = false
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