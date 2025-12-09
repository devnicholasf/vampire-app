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
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'

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

// Methods
const refreshStats = () => {
  console.log('Atualizando estatísticas dos jogadores...')
}

const kickPlayer = (playerId: string) => {
  if (confirm('Tem certeza que deseja remover este jogador?')) {
    players.value = players.value.filter(p => p.id !== playerId)
  }
}

const invitePlayer = () => {
  if (inviteEmail.value) {
    console.log('Convidando jogador:', inviteEmail.value)
    // Future: Send invitation
    alert(`Convite enviado para ${inviteEmail.value}`)
    inviteEmail.value = ''
  }
}

// Expose count for parent
defineExpose({
  count: computed(() => players.value.length)
})
</script>