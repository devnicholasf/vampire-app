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
        <!-- Logo/Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center p-2">
            <img 
              src="/ankh-symbol.svg" 
              alt="Ankh Symbol" 
              class="w-full h-full text-white filter-white"
              style="filter: brightness(0) invert(1);"
            />
          </div>
          <div>
            <h1 class="text-xl font-bold text-red-500">VAMPIRE: THE MASQUERADE</h1>
            <p class="text-xs text-text-muted">Campaign Manager</p>
          </div>
        </div>

        <!-- User Actions -->
        <div class="flex items-center gap-2">
          <!-- Direct Messages -->
          <DirectMessages />
          
          <!-- Notifications -->
          <NotificationsDropdown />
          
          <!-- User Profile -->
          <UserProfile :user="user" @profile-updated="handleProfileUpdate" />
          
          <!-- Logout -->
          <BaseButton variant="ghost" @click="handleLogout" size="sm" class="ml-2">
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
        <BaseButton variant="primary" @click="showCreateModal = true" class="flex items-center gap-2">
          <span>🎲</span>
          Nova Campanha
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
          class="bg-surface-card p-6 rounded-vampire border border-border hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 cursor-pointer group"
          @click="goToCampaign(campaign.id)"
          @keydown.enter="goToCampaign(campaign.id)"
          tabindex="0"
          role="button"
          :aria-label="`Acessar campanha ${campaign.name}`"
        >
          <!-- Header do Card -->
          <div class="flex justify-between items-start mb-4">
            <BaseBadge
              :variant="isMaster(campaign) ? 'primary' : 'secondary'"
              :iconLeft="isMaster(campaign) ? '👑' : '🎭'"
              size="sm"
              class="flex-shrink-0"
            >
              {{ isMaster(campaign) ? 'Mestre' : 'Jogador' }}
            </BaseBadge>
            
            <div class="text-right">
              <div class="text-xs text-text-muted">
                {{ formatDate(campaign.createdAt) }}
              </div>
            </div>
          </div>

          <!-- Conteúdo Principal -->
          <div class="mb-4">
            <h3 class="text-xl font-bold text-text-primary mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
              {{ campaign.name }}
            </h3>
            <p class="text-text-muted text-sm line-clamp-3 leading-relaxed">
              {{ campaign.description }}
            </p>
          </div>

          <!-- Footer do Card -->
          <div class="flex items-center justify-between pt-4 border-t border-border-secondary">
            <div class="flex items-center gap-2 text-xs text-text-secondary">
              <span>📅</span>
              <span>Última sessão: Há 3 dias</span>
            </div>
            
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4 text-text-muted group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
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
          <!-- Header -->
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span class="text-2xl">🎲</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-red-400">Nova Campanha</h3>
              <p class="text-sm text-text-muted">Crie sua crônica vampírica</p>
            </div>
          </div>

          <form @submit.prevent="handleCreateCampaign" class="space-y-6">
            <!-- Nome -->
            <div>
              <label class="block text-text-secondary text-sm font-medium mb-2">
                Nome da Campanha *
              </label>
              <input
                v-model="newCampaign.name"
                type="text"
                required
                placeholder="Ex: Crônicas de Chicago"
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <!-- Descrição -->
            <div>
              <label class="block text-text-secondary text-sm font-medium mb-2">
                Descrição *
              </label>
              <textarea
                v-model="newCampaign.description"
                required
                rows="4"
                placeholder="Descreva a ambientação, o tema e o que os jogadores podem esperar desta campanha..."
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors resize-none"
              ></textarea>
              <p class="text-xs text-text-muted mt-1">
                Uma boa descrição atrai os melhores jogadores
              </p>
            </div>

            <!-- Botões -->
            <div class="flex gap-3 pt-4">
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
                {{ createLoading ? 'Criando...' : 'Criar Campanha' }}
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
// Vue imports
// ============================================
import { ref, computed, onMounted } from 'vue'

// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import UserProfile from '~/components/ui/UserProfile.vue'
import NotificationsDropdown from '~/components/ui/NotificationsDropdown.vue'
import DirectMessages from '~/components/ui/DirectMessages.vue'

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
    masterId: 'current-user', // Este usuário será o mestre
    createdAt: new Date('2024-12-01')
  },
  {
    id: '2',
    name: 'Noites de Berlin',
    description: 'Explore os segredos da cidade dividida durante a Guerra Fria vampírica.',
    masterId: 'other-user', // Este usuário não é o mestre
    createdAt: new Date('2024-11-15')
  }
])

// Verificar se usuário é mestre
const isMaster = (campaign: Campaign) => {
  // O usuário que cria a campanha sempre será mestre
  return campaign.masterId === user.value?.id || campaign.id === '1' // Campanha 1 para demo
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
  console.log('Dashboard: Clique na campanha detectado')
  console.log('Dashboard: Navegando para campanha:', id)
  
  try {
    // Usar router.push em vez de navigateTo
    const router = useRouter()
    await router.push(`/campaign/${id}/master`)
    console.log('Dashboard: Navegação concluída')
  } catch (error) {
    console.error('Dashboard: Erro na navegação:', error)
  }
}

// Criar campanha
const handleCreateCampaign = async () => {
  createLoading.value = true
  
  try {
    // Garantir que o usuário está logado antes de criar campanha
    if (!user.value?.id) {
      throw new Error('Usuário não está logado')
    }
    
    // Simular criação
    const newId = Date.now().toString()
    const newCamp: Campaign = {
      id: newId,
      name: newCampaign.value.name,
      description: newCampaign.value.description,
      masterId: user.value.id, // O criador sempre será mestre
      createdAt: new Date()
    }
    
    campaigns.value.push(newCamp)
    
    createLoading.value = false
    showCreateModal.value = false
    newCampaign.value = { name: '', description: '' }
    
    console.log('Nova campanha criada:', newCamp)
    console.log('Usuário criador (mestre):', user.value.id)
    
  } catch (error) {
    console.error('Erro ao criar campanha:', error)
    createLoading.value = false
  }
}

// Logout
const handleLogout = async () => {
  await logout()
  await navigateTo('/login')
}

// Handle profile update
const handleProfileUpdate = (updatedUser: any) => {
  console.log('Perfil atualizado:', updatedUser)
  // TODO: Update user in global state
  // user.value = updatedUser
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth hover animations */
.group:hover .group-hover\:text-red-400 {
  color: rgb(248 113 113);
}

.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Card hover effects */
.bg-surface-card {
  background: linear-gradient(145deg, rgba(30, 30, 46, 0.8), rgba(30, 30, 46, 0.6));
  backdrop-filter: blur(10px);
}
</style>
