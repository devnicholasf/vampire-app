<template>
  <div class="min-h-screen bg-gradient-atmospheric relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Header -->
    <header class="bg-surface border-b border-border relative z-10">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-red-400">🧛 Vampire RPG</h1>
        <div class="flex items-center gap-4">
          <span class="text-text-secondary">{{ user?.username }}</span>
          <BaseButton variant="ghost" @click="handleLogout" size="sm">
            Sair
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 relative z-10">
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
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p class="text-text-muted mt-4">Carregando campanhas...</p>
      </div>

      <!-- Campanhas -->
      <div v-else-if="campaigns && campaigns.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="bg-surface p-6 rounded-vampire border border-border hover:border-red-500 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          @click="goToCampaign(campaign.id)"
        >
          <!-- Badge de Mestre/Jogador -->
          <div class="flex justify-between items-start mb-4">
            <BaseBadge
              :variant="isMaster(campaign) ? 'primary' : 'outline'"
              :iconLeft="isMaster(campaign) ? '👑' : '🎭'"
              size="sm"
            >
              {{ isMaster(campaign) ? 'Mestre' : 'Jogador' }}
            </BaseBadge>
          </div>

          <!-- Nome e Descrição -->
          <h3 class="text-xl font-semibold text-text-primary mb-2">{{ campaign.name }}</h3>
          <p class="text-text-muted text-sm mb-4 line-clamp-2">{{ campaign.description }}</p>

          <!-- Info -->
          <div class="flex items-center gap-4 text-xs text-text-muted">
            <span>Criada em {{ formatDate(campaign.createdAt) }}</span>
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
        <div class="bg-surface border border-border rounded-vampire p-8 max-w-md w-full">
          <h3 class="text-2xl font-bold text-red-400 mb-6">Nova Campanha</h3>

          <form @submit.prevent="handleCreateCampaign" class="space-y-4">
            <!-- Nome -->
            <div>
              <label class="block text-text-secondary mb-2">Nome da Campanha</label>
              <input
                v-model="newCampaign.name"
                type="text"
                required
                class="w-full px-4 py-3 bg-surface border border-border rounded-vampire text-text-primary focus:outline-none focus:border-red-500"
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
                class="w-full px-4 py-3 bg-surface border border-border rounded-vampire text-text-primary focus:outline-none focus:border-red-500"
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
// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'

interface Campaign {
  id: string
  name: string
  description: string
  masterId: string
  createdAt: Date
}

interface CreateCampaignData {
  name: string
  description: string
}

definePageMeta({
  middleware: []
})

const { user, logout } = useAuth()

// Debug
onMounted(() => {
  console.log('Dashboard montado!')
  console.log('Usuário:', user.value)
  console.log('Token:', localStorage.getItem('auth_token'))
})

const showCreateModal = ref(false)
const createLoading = ref(false)
const loading = ref(false)
const newCampaign = ref<CreateCampaignData>({
  name: '',
  description: ''
})

// Dados mock de campanhas
const campaigns = ref<Campaign[]>([
  {
    id: '1',
    name: 'Crônicas de Chicago',
    description: 'Uma campanha sombria nas ruas de Chicago onde os Ventrue dominam a política vampírica local.',
    masterId: user.value?.id || 'user-1',
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    name: 'Noites de Berlin',
    description: 'Explore os segredos da cidade dividida durante a Guerra Fria vampírica.',
    masterId: 'other-user',
    createdAt: new Date('2024-11-15')
  }
])

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
const goToCampaign = async (id: string) => {
  console.log('Navegando para campanha:', id)
  await navigateTo(`/campaign/${id}`)
}

// Criar campanha
const handleCreateCampaign = async () => {
  createLoading.value = true
  
  // Simular criação
  const newId = Date.now().toString()
  const newCamp: Campaign = {
    id: newId,
    name: newCampaign.value.name,
    description: newCampaign.value.description,
    masterId: user.value?.id || 'user-1',
    createdAt: new Date()
  }
  
  campaigns.value.push(newCamp)
  
  createLoading.value = false
  showCreateModal.value = false
  newCampaign.value = { name: '', description: '' }
}

// Logout
const handleLogout = async () => {
  await logout()
  await navigateTo('/login')
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
