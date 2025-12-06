<template>
  <div class="min-h-screen bg-gradient-vampire">
    <!-- Header -->
    <header class="bg-surface border-b border-border">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-primary">🧛 Vampire RPG</h1>
        <div class="flex items-center gap-4">
          <span class="text-text-secondary">{{ user?.username }}</span>
          <BaseButton variant="ghost" @click="handleLogout" size="sm">
            Sair
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Título e botão -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-3xl font-bold text-text-primary mb-2">Minhas Campanhas</h2>
          <p class="text-text-secondary">Gerencie suas campanhas como Mestre ou Jogador</p>
        </div>
        <BaseButton variant="primary" @click="showCreateModal = true">
          + Nova Campanha
        </BaseButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="text-text-muted mt-4">Carregando campanhas...</p>
      </div>

      <!-- Campanhas -->
      <div v-else-if="campaigns && campaigns.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="bg-surface p-6 rounded-lg border border-border hover:border-border-focus hover:shadow-card-hover transition-all duration-300 cursor-pointer"
          @click="goToCampaign(campaign.id)"
        >
          <!-- Badge de Mestre/Jogador -->
          <div class="flex justify-between items-start mb-4">
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                isMaster(campaign) 
                  ? 'bg-primary text-primary-contrast' 
                  : 'bg-transparent text-primary border border-primary'
              ]"
            >
              {{ isMaster(campaign) ? '👑 Mestre' : '🎭 Jogador' }}
            </span>
          </div>

          <!-- Nome e Descrição -->
          <h3 class="text-xl font-semibold text-text-primary mb-2">{{ campaign.name }}</h3>
          <p class="text-text-muted text-sm mb-4 line-clamp-2">{{ campaign.description }}</p>

          <!-- Info -->
          <div class="flex items-center gap-4 text-xs text-text-muted">
            <span>{{ campaign.players.length }} jogadores</span>
            <span>•</span>
            <span>{{ formatDate(campaign.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">🎲</div>
        <h3 class="text-xl font-semibold text-text-primary mb-2">Nenhuma campanha ainda</h3>
        <p class="text-text-muted mb-6">Crie sua primeira campanha e comece a jogar!</p>
        <BaseButton variant="primary" @click="showCreateModal = true">
          Criar Primeira Campanha
        </BaseButton>
      </div>
    </main>

    <!-- Modal de Criar Campanha -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
        @click.self="showCreateModal = false"
      >
        <div class="bg-surface-dark border border-border rounded-lg p-8 max-w-md w-full">
          <h3 class="text-2xl font-bold text-primary mb-6">Nova Campanha</h3>

          <form @submit.prevent="handleCreateCampaign" class="space-y-4">
            <!-- Nome -->
            <div>
              <label class="block text-text-secondary mb-2">Nome da Campanha</label>
              <input
                v-model="newCampaign.name"
                type="text"
                required
                class="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-border-focus"
                placeholder="Ex: Crônicas de Chicago"
              />
            </div>

            <!-- Descrição -->
            <div>
              <label class="block text-text-secondary mb-2">Descrição</label>
              <textarea
                v-model="newCampaign.description"
                required
                rows="4"
                class="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:border-border-focus"
                placeholder="Descreva a ambientação e o tema da campanha..."
              ></textarea>
            </div>

            <!-- Botões -->
            <div class="flex gap-3">
              <BaseButton
                type="button"
                variant="ghost"
                class="flex-1"
                @click="showCreateModal = false"
              >
                Cancelar
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                class="flex-1"
                :disabled="createLoading"
              >
                {{ createLoading ? 'Criando...' : 'Criar' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Auto-importado pelo Nuxt
import type { Campaign, CreateCampaignData } from '~/types'

definePageMeta({
  // @ts-ignore - Middleware auto-importado pelo Nuxt
  middleware: 'auth'
})

// @ts-ignore - Auto-importado pelo Nuxt
const { user, logout } = useAuth()
// @ts-ignore - Auto-importado pelo Nuxt
const { campaigns, loading, fetchUserCampaigns, createCampaign } = useCampaign()
const router = useRouter()

const showCreateModal = ref(false)
const createLoading = ref(false)
const newCampaign = ref<CreateCampaignData>({
  name: '',
  description: ''
})

// Buscar campanhas ao montar
onMounted(() => {
  fetchUserCampaigns()
})

// Verificar se usuário é mestre
const isMaster = (campaign: Campaign) => {
  return campaign.masterId === user.value?.id
}

// Formatar data
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Ir para campanha
const goToCampaign = (id: string) => {
  router.push(`/campaign/${id}`)
}

// Criar campanha
const handleCreateCampaign = async () => {
  createLoading.value = true
  const result = await createCampaign(newCampaign.value)
  createLoading.value = false

  if (result.success && result.data) {
    showCreateModal.value = false
    newCampaign.value = { name: '', description: '' }
    router.push(`/campaign/${result.data.id}`)
  }
}

// Logout
const handleLogout = async () => {
  await logout()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
