<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">Gerenciar Jogadores</h3>
      <BaseButton variant="ghost" size="sm" @click="refreshStats">
        🔄 Atualizar
      </BaseButton>
    </div>
    
    <div class="grid gap-4">
      <div 
        v-for="player in players" 
        :key="player.id"
        class="bg-surface-card p-4 rounded-lg border border-primary"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-text-primary">{{ player.name }}</p>
            <p class="text-text-muted text-sm">{{ player.email }}</p>
          </div>
          <div class="flex space-x-2">
            <BaseButton variant="ghost" size="sm">
              📊 Ver Ficha
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="kickPlayer(player.id)">
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
      :type="toastType"
      @close="hideToast"
      class="fixed top-4 right-4 z-[10000]"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseToast from '~/components/ui/BaseToast.vue'

// Props
interface Props {
  campaignId: string
}

const props = defineProps<Props>()

// Mock data
const players = ref([
  { id: '1', name: 'João Silva', email: 'joao@example.com' },
  { id: '2', name: 'Maria Santos', email: 'maria@example.com' }
])

const inviteEmail = ref('')

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)

// Confirmation modal states
const showKickModal = ref(false)
const playerToKick = ref<{ id: string; name: string } | null>(null)

// Methods
const refreshStats = () => {
  console.log('Atualizando estatísticas dos jogadores...')
}

const kickPlayer = (playerId: string) => {
  const player = players.value.find(p => p.id === playerId)
  if (player) {
    playerToKick.value = { id: playerId, name: player.name }
    showKickModal.value = true
  }
}

const confirmKickPlayer = () => {
  if (playerToKick.value) {
    players.value = players.value.filter(p => p.id !== playerToKick.value!.id)
    showToastMessage(`${playerToKick.value.name} foi removido da campanha`, 'success')
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