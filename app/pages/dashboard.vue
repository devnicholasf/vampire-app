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
          <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center p-1.5">
            <img 
              src="/ankh-symbol.svg" 
              alt="Ankh Symbol" 
              class="w-6 h-6 text-white filter-white"
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
      <div v-if="campaignLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p class="text-text-muted mt-4">Carregando campanhas...</p>
      </div>

      <!-- Campanhas -->
      <div v-else-if="campaigns && campaigns.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="bg-surface-card p-6 rounded-vampire border border-border hover:border-red-500 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 cursor-pointer group"
          @click="goToCampaign(campaign)"
          @keydown.enter="goToCampaign(campaign)"
          tabindex="0"
          role="button"
          :aria-label="`Acessar campanha ${campaign.name}`"
        >
          <!-- Header do Card -->
          <div class="flex justify-between items-start mb-4">
            <BaseBadge
              :variant="campaign.masterId === user?.id ? 'primary' : 'secondary'"
              :iconLeft="campaign.masterId === user?.id ? '👑' : '🎭'"
              size="sm"
              class="flex-shrink-0"
            >
              {{ campaign.masterId === user?.id ? 'Mestre' : 'Jogador' }}
            </BaseBadge>
            
            <div class="flex items-center gap-2">
              <div class="text-right">
                <div class="text-xs text-text-muted">
                  {{ formatDate(campaign.createdAt) }}
                </div>
              </div>
              
              <!-- Botão deletar (só para mestres) -->
              <button
                v-if="campaign.masterId === user?.id"
                @click.stop="handleDeleteCampaign(campaign)"
                class="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Deletar campanha"
              >
                🗑️
              </button>
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
              <span>{{ getLastSessionText(campaign) }}</span>
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

    <!-- Toast Container -->
    <ToastContainer />

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

    <!-- Modal de Confirmação de Delete -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && campaignToDelete"
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
        @click.self="cancelDeleteCampaign"
      >
        <div class="bg-surface border border-red-500 rounded-vampire p-8 max-w-md w-full">
          <!-- Header -->
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span class="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-text-primary">Deletar Campanha</h3>
              <p class="text-text-muted text-sm">Esta ação não pode ser desfeita</p>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="mb-6">
            <p class="text-text-secondary mb-4">
              Você tem certeza que deseja deletar permanentemente a campanha:
            </p>
            <div class="bg-surface-dark p-4 rounded-lg border border-border">
              <h4 class="font-semibold text-text-primary">{{ campaignToDelete.name }}</h4>
              <p class="text-sm text-text-muted mt-1">{{ campaignToDelete.description }}</p>
            </div>
            <p class="text-red-400 text-sm mt-4 font-medium">
              ⚠️ Todos os NPCs, notas e sessões desta campanha também serão removidos
            </p>
          </div>

          <!-- Botões -->
          <div class="flex gap-3">
            <BaseButton
              variant="ghost"
              class="flex-1"
              @click="cancelDeleteCampaign"
              :disabled="deleteLoading"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              variant="danger"
              class="flex-1"
              @click="confirmDeleteCampaign"
              :disabled="deleteLoading"
            >
              {{ deleteLoading ? 'Deletando...' : 'Deletar Permanentemente' }}
            </BaseButton>
          </div>
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
import ToastContainer from '~/components/ui/ToastContainer.vue'

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
const { campaigns, loading: campaignLoading, loadCampaigns, createCampaign, deleteCampaign } = useCampaign()
const toast = useToast()

// Estados para modal de confirmação de delete
const showDeleteModal = ref(false)
const campaignToDelete = ref<Campaign | null>(null)
const deleteLoading = ref(false)

// Debug
onMounted(async () => {
  console.log('Dashboard montado!')
  console.log('Usuário:', user.value)
  
  // Carregar campanhas do usuário
  if (user.value) {
    await loadCampaigns()
  }
})

const showCreateModal = ref(false)
const createLoading = ref(false)
const newCampaign = ref<CreateCampaignData>({
  name: '',
  description: ''
})



// Formatar data
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Calcular tempo decorrido desde a última sessão
const getLastSessionText = (campaign: Campaign) => {
  // TODO: Futuramente, buscar sessões reais da tabela campaign_sessions
  // e mostrar quando foi a última sessão de jogo ao vivo
  // Por enquanto, mostra informações baseadas na criação da campanha
  
  const now = new Date()
  const campaignAge = now.getTime() - new Date(campaign.createdAt).getTime()
  const minutesOld = Math.floor(campaignAge / (1000 * 60))
  const hoursOld = Math.floor(campaignAge / (1000 * 60 * 60))
  const daysOld = Math.floor(campaignAge / (1000 * 60 * 60 * 24))
  
  // Se a campanha foi criada há menos de 5 minutos, mostrar que é nova
  if (minutesOld < 5) {
    return 'Campanha recém-criada ✨'
  }
  
  // Se foi criada há menos de 1 hora, mostrar em minutos
  if (minutesOld < 60) {
    return `Criada há ${minutesOld} minuto${minutesOld !== 1 ? 's' : ''}`
  }
  
  // Se foi criada hoje, mostrar em horas
  if (hoursOld < 24) {
    return `Criada há ${hoursOld} hora${hoursOld !== 1 ? 's' : ''}`
  }
  
  // Se foi criada há poucos dias, mostrar em dias
  if (daysOld <= 30) {
    return `Criada há ${daysOld} dia${daysOld !== 1 ? 's' : ''}`
  }
  
  // Para campanhas muito antigas sem sessões
  return 'Nenhuma sessão realizada'
}

// Ir para campanha
const goToCampaign = async (campaign: Campaign) => {
  console.log('Dashboard: Clique na campanha detectado')
  console.log('Dashboard: Navegando para campanha:', campaign.id)
  
  try {
    // Verificar se é mestre ou jogador
    const isMaster = campaign.masterId === user.value?.id
    const route = isMaster ? 'master' : 'player'
    
    console.log(`Dashboard: Usuário é ${isMaster ? 'mestre' : 'jogador'}`)
    console.log(`Dashboard: Navegando para /campaign/${campaign.id}/${route}`)
    
    // Usar navigateTo em vez de router.push para evitar conflitos
    await navigateTo(`/campaign/${campaign.id}/${route}`)
    
    console.log(`Dashboard: Navegação concluída para visão de ${route}`)
  } catch (error) {
    console.error('Dashboard: Erro na navegação:', error)
  }
}

// Criar campanha
const handleCreateCampaign = async () => {
  if (!newCampaign.value.name.trim()) {
    toast.warning('Campo obrigatório', 'O nome da campanha é obrigatório')
    return
  }

  if (newCampaign.value.name.trim().length < 3) {
    toast.warning('Nome muito curto', 'O nome deve ter pelo menos 3 caracteres')
    return
  }

  createLoading.value = true
  
  try {
    console.log('Dashboard: Iniciando criação de campanha:', {
      name: newCampaign.value.name.trim(),
      description: newCampaign.value.description.trim()
    })

    const campaign = await createCampaign({
      name: newCampaign.value.name.trim(),
      description: newCampaign.value.description.trim() || ''
    })
    
    console.log('Dashboard: Campanha criada com sucesso:', campaign)
    
    // Resetar formulário e fechar modal
    newCampaign.value = {
      name: '',
      description: ''
    }
    showCreateModal.value = false
    
    toast.success(
      'Campanha criada!', 
      `"${campaign.name}" foi criada com código ${campaign.inviteCode}`
    )
    
    // Navegar automaticamente para a campanha como mestre
    setTimeout(async () => {
      const router = useRouter()
      await router.push(`/campaign/${campaign.id}/master`)
      toast.info('Bem-vindo!', 'Agora você pode configurar sua campanha como Mestre')
    }, 1500) // Delay para mostrar o toast de sucesso
    
  } catch (error: any) {
    console.error('Dashboard: Erro detalhado ao criar campanha:', {
      error,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    })
    
    let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.'
    
    // Mensagens mais específicas baseadas no erro
    if (error?.message?.includes('não autenticado')) {
      errorMessage = 'Sessão expirada. Faça login novamente.'
    } else if (error?.message?.includes('duplicate key') || error?.message?.includes('already exists')) {
      errorMessage = 'Já existe uma campanha com este nome. Escolha outro nome.'
    } else if (error?.message?.includes('permission denied') || error?.code === '42501') {
      errorMessage = 'Você não tem permissão para criar campanhas. Contate o suporte.'
    } else if (error?.message?.includes('invalid input') || error?.code === '22P02') {
      errorMessage = 'Dados fornecidos são inválidos. Verifique os campos.'
    } else if (error?.message?.includes('connection') || error?.message?.includes('network')) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
    } else if (error?.message?.includes('timeout')) {
      errorMessage = 'A operação demorou muito. Tente novamente.'
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    toast.error(
      'Erro ao criar campanha', 
      errorMessage
      // Remover persistência - vai desaparecer automaticamente após 8 segundos
    )
  } finally {
    createLoading.value = false
  }
}

// Deletar campanha
const handleDeleteCampaign = (campaign: Campaign) => {
  campaignToDelete.value = campaign
  showDeleteModal.value = true
}

const confirmDeleteCampaign = async () => {
  if (!campaignToDelete.value) return

  deleteLoading.value = true
  
  try {
    await deleteCampaign(campaignToDelete.value.id)
    
    toast.success(
      'Campanha deletada!', 
      `"${campaignToDelete.value.name}" foi removida permanentemente`
    )
    
    // Fechar modal
    showDeleteModal.value = false
    campaignToDelete.value = null
    
  } catch (error: any) {
    console.error('Erro ao deletar campanha:', error)
    toast.error(
      'Erro ao deletar campanha',
      error?.message || 'Não foi possível deletar a campanha. Tente novamente.'
      // Remover persistência - vai desaparecer automaticamente após 8 segundos
    )
  } finally {
    deleteLoading.value = false
  }
}

const cancelDeleteCampaign = () => {
  showDeleteModal.value = false
  campaignToDelete.value = null
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
