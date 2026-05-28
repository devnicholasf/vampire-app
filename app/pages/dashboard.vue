<template>
  <div class="df-dashboard min-h-screen relative overflow-hidden">

    <!-- Header -->
    <header class="df-header sticky top-0 z-20">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <!-- Logo/Title -->
        <div class="flex items-center gap-3">
          <div class="df-logo-frame">
            <svg class="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/>
              <path d="M12 2c1.5 3 2 5.5 2 8a6 6 0 01-4 5.6"/>
            </svg>
          </div>
          <div>
            <h1 class="df-brand-title">VAMPIRE: THE MASQUERADE</h1>
            <p class="text-[10px] tracking-widest uppercase df-text-muted">Campaign Manager</p>
          </div>
        </div>

        <!-- User Actions -->
        <div class="flex items-center gap-2">
          <DirectMessages />
          <NotificationsDropdown />
          <UserProfile :user="user" @profile-updated="handleProfileUpdate" />
          <button @click="handleLogout" class="df-btn-ghost ml-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span class="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Decorative top line -->
    <div class="df-top-line"></div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 relative z-10">
      <!-- Title & Actions -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 class="df-page-title flex items-center gap-3">
            <svg class="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
              <path d="M13 19l6-6"/><path d="M16 16l4 4"/>
              <path d="M19 21l2-2"/>
              <path d="M14.5 6.5L18 3l3 3-3.5 3.5"/>
            </svg>
            Minhas Campanhas
          </h2>
          <p class="df-text-muted mt-1">Gerencie suas campanhas como Mestre ou Jogador</p>
        </div>
        <div class="flex gap-3">
          <button @click="navigateToJoin" class="df-btn-outline">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Entrar em Campanha
          </button>
          <button @click="showCreateModal = true" class="df-btn-primary">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nova Campanha
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="campaignLoading" class="text-center py-16">
        <div class="df-spinner"></div>
        <p class="df-text-muted mt-4">Carregando campanhas...</p>
      </div>

      <!-- Campaign Cards -->
      <div v-else-if="campaigns && campaigns.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="df-campaign-card group"
          @click="goToCampaign(campaign)"
          @keydown.enter="goToCampaign(campaign)"
          tabindex="0"
          role="button"
          :aria-label="`Acessar campanha ${campaign.name}`"
        >
          <!-- Corner Decorations -->
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>

          <!-- Card Header -->
          <div class="flex justify-between items-start mb-4">
            <span :class="['df-badge', campaign.masterId === user?.id ? 'df-badge-master' : 'df-badge-player']">
              <svg v-if="campaign.masterId === user?.id" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M5 19a1 1 0 001 1h12a1 1 0 001-1v-1H5v1z"/></svg>
              <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
              {{ campaign.masterId === user?.id ? 'Mestre' : 'Jogador' }}
            </span>

            <div class="flex items-center gap-2">
              <span class="text-[11px] df-text-muted">{{ formatDate(campaign.createdAt) }}</span>
              <button
                v-if="campaign.masterId === user?.id"
                @click.stop="handleDeleteCampaign(campaign)"
                class="df-card-action opacity-0 group-hover:opacity-100"
                title="Deletar campanha"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              </button>
              <button
                v-else
                @click.stop="handleLeaveCampaign(campaign)"
                class="df-card-action opacity-0 group-hover:opacity-100"
                title="Sair da campanha"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>

          <!-- Card Body -->
          <div class="mb-4">
            <h3 class="text-lg font-bold df-card-title group-hover:text-red-400 transition-colors line-clamp-2">
              {{ campaign.name }}
            </h3>
            <p class="df-text-muted text-sm line-clamp-3 leading-relaxed mt-2">
              {{ campaign.description }}
            </p>
          </div>

          <!-- Card Footer -->
          <div class="flex items-center justify-between pt-3 border-t border-[var(--df-border-red)]">
            <div class="flex items-center gap-2 text-xs df-text-muted">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>{{ getLastSessionText(campaign) }}</span>
            </div>
            <svg class="w-5 h-5 df-text-muted group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <div class="df-empty-icon mx-auto mb-6">
          <svg class="w-16 h-16 text-red-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/>
            <path d="M12 2c1.5 3 2 5.5 2 8a6 6 0 01-4 5.6"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold df-card-title mb-2">Nenhuma campanha ainda</h3>
        <p class="df-text-muted mb-6">Crie sua primeira campanha e comece a jogar!</p>
        <button @click="showCreateModal = true" class="df-btn-primary">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Criar Primeira Campanha
        </button>
      </div>
    </main>

    <!-- Toast Container -->
    <ToastContainer />

    <!-- Modal: Create Campaign -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="df-modal-overlay"
        @click.self="showCreateModal = false"
      >
        <div class="df-modal-panel max-w-md w-full">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>

          <div class="flex items-center gap-3 mb-6">
            <div class="df-modal-icon">
              <svg class="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/>
                <path d="M12 2c1.5 3 2 5.5 2 8a6 6 0 01-4 5.6"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-red-400">Nova Campanha</h3>
              <p class="text-sm df-text-muted">Crie sua crônica vampírica</p>
            </div>
          </div>

          <form @submit.prevent="handleCreateCampaign" class="space-y-5">
            <div>
              <label class="df-label">Nome da Campanha <span class="text-red-400">*</span></label>
              <input
                v-model="newCampaign.name"
                type="text"
                required
                placeholder="Ex: Crônicas de Chicago"
                class="df-input"
              />
            </div>
            <div>
              <label class="df-label">Descrição <span class="text-red-400">*</span></label>
              <textarea
                v-model="newCampaign.description"
                required
                rows="4"
                placeholder="Descreva a ambientação, o tema e o que os jogadores podem esperar..."
                class="df-input df-textarea"
              ></textarea>
              <p class="text-xs df-text-muted mt-1">Uma boa descrição atrai os melhores jogadores</p>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="button" @click="showCreateModal = false" class="df-btn-outline flex-1">
                Cancelar
              </button>
              <button type="submit" :disabled="createLoading" class="df-btn-primary flex-1">
                {{ createLoading ? 'Criando...' : 'Criar Campanha' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Delete Campaign -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && campaignToDelete"
        class="df-modal-overlay"
        @click.self="cancelDeleteCampaign"
      >
        <div class="df-modal-panel df-modal-danger max-w-md w-full">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>

          <div class="flex items-center gap-3 mb-6">
            <div class="df-modal-icon df-modal-icon-danger">
              <svg class="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-red-400">Deletar Campanha</h3>
              <p class="text-sm df-text-muted">Esta ação não pode ser desfeita</p>
            </div>
          </div>

          <div class="mb-6">
            <p class="df-text-silver mb-4">Você tem certeza que deseja deletar permanentemente a campanha:</p>
            <div class="df-highlight-box">
              <h4 class="font-bold df-card-title">{{ campaignToDelete.name }}</h4>
              <p class="text-sm df-text-muted mt-1">{{ campaignToDelete.description }}</p>
            </div>
            <p class="text-red-400 text-sm mt-4 font-medium flex items-center gap-1.5">
              <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Todos os NPCs, notas e sessões desta campanha também serão removidos
            </p>
          </div>

          <div class="flex gap-3">
            <button @click="cancelDeleteCampaign" :disabled="deleteLoading" class="df-btn-outline flex-1">
              Cancelar
            </button>
            <button @click="confirmDeleteCampaign" :disabled="deleteLoading" class="df-btn-danger flex-1">
              {{ deleteLoading ? 'Deletando...' : 'Deletar Permanentemente' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Leave Campaign -->
    <Teleport to="body">
      <div
        v-if="showLeaveModal && campaignToLeave"
        class="df-modal-overlay"
        @click.self="cancelLeaveCampaign"
      >
        <div class="df-modal-panel df-modal-warning max-w-md w-full">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>

          <div class="flex items-center gap-3 mb-6">
            <div class="df-modal-icon df-modal-icon-warning">
              <svg class="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
            <div>
              <h3 class="text-xl font-bold text-amber-400">Sair da Campanha</h3>
              <p class="text-sm df-text-muted">Você será removido como jogador</p>
            </div>
          </div>

          <div class="mb-6">
            <p class="df-text-silver mb-4">Você tem certeza que deseja sair da campanha:</p>
            <div class="df-highlight-box">
              <h4 class="font-bold df-card-title">{{ campaignToLeave.name }}</h4>
              <p class="text-sm df-text-muted mt-1">{{ campaignToLeave.description }}</p>
            </div>
            <p class="text-amber-400 text-sm mt-4 font-medium flex items-center gap-1.5">
              <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Sua ficha de personagem será mantida, mas você precisará de um novo convite para voltar
            </p>
          </div>

          <div class="flex gap-3">
            <button @click="cancelLeaveCampaign" :disabled="leaveLoading" class="df-btn-outline flex-1">
              Cancelar
            </button>
            <button @click="confirmLeaveCampaign" :disabled="leaveLoading" class="df-btn-danger flex-1">
              {{ leaveLoading ? 'Saindo...' : 'Sair da Campanha' }}
            </button>
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
import { useRouter, navigateTo } from 'nuxt/app'
import type { Campaign } from '~/types'

// ============================================
// Imports explícitos dos componentes
// ============================================
import UserProfile from '~/components/ui/UserProfile.vue'
import NotificationsDropdown from '~/components/ui/NotificationsDropdown.vue'
import DirectMessages from '~/components/ui/DirectMessages.vue'
import ToastContainer from '~/components/ui/ToastContainer.vue'

// ============================================
// Composables
// ============================================
const { user, logout } = useAuth()
const { campaigns, loading: campaignLoading, loadCampaigns, createCampaign, deleteCampaign, removePlayerFromCampaign } = useCampaign()
const toast = useToast()

// ============================================
// Page Meta
// ============================================
definePageMeta({
  middleware: []
})

// ============================================
// Interfaces
// ============================================
interface CreateCampaignData {
  name: string
  description: string
}

// Estados para modal de confirmação de delete
const showDeleteModal = ref(false)
const campaignToDelete = ref<Campaign | null>(null)
const deleteLoading = ref(false)

// Estados para modal de confirmação de saída (jogador)
const showLeaveModal = ref(false)
const campaignToLeave = ref<Campaign | null>(null)
const leaveLoading = ref(false)

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
const getLastSessionText = (campaign: any) => {
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

// Navegar para página de entrar em campanha
const navigateToJoin = () => {
  navigateTo('/join-campaign')
}

// Ir para campanha
const goToCampaign = async (campaign: any) => {
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
    toast.error('Campo obrigatório', 'O nome da campanha é obrigatório')
    return
  }

  if (newCampaign.value.name.trim().length < 3) {
    toast.error('Nome muito curto', 'O nome deve ter pelo menos 3 caracteres')
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
      toast.success('Bem-vindo!', 'Agora você pode configurar sua campanha como Mestre')
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
const handleDeleteCampaign = (campaign: any) => {
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

// Sair da campanha (jogador)
const handleLeaveCampaign = (campaign: any) => {
  campaignToLeave.value = campaign
  showLeaveModal.value = true
}

const confirmLeaveCampaign = async () => {
  if (!campaignToLeave.value || !user.value) return

  leaveLoading.value = true
  
  try {
    await removePlayerFromCampaign(campaignToLeave.value.id, user.value.id)
    
    toast.success(
      'Você saiu da campanha!', 
      `Você não faz mais parte de "${campaignToLeave.value.name}"`
    )
    
    // Fechar modal e recarregar campanhas
    showLeaveModal.value = false
    campaignToLeave.value = null
    
    // Recarregar lista de campanhas
    await loadCampaigns()
    
  } catch (error: any) {
    console.error('Erro ao sair da campanha:', error)
    toast.error(
      'Erro ao sair da campanha',
      error?.message || 'Não foi possível sair da campanha. Tente novamente.'
    )
  } finally {
    leaveLoading.value = false
  }
}

const cancelLeaveCampaign = () => {
  showLeaveModal.value = false
  campaignToLeave.value = null
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
/* ======================================================
   DARK FANTASY UI  –  Dashboard
   ====================================================== */

/* ─── CSS Custom Properties ─── */
.df-dashboard {
  --df-bg-deep: #050510;
  --df-bg-card: #0a0a1a;
  --df-bg-input: #0d0d20;
  --df-border-red: #7f1d1d;
  --df-border-silver: #4a4a5a;
  --df-accent-red: #dc2626;
  --df-accent-crimson: #991b1b;
  --df-text-silver: #c0c0d0;
  --df-text-gold: #d4a647;
  --df-glow-red: rgba(220, 38, 38, 0.3);

  background: var(--df-bg-deep);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(127, 29, 29, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(220, 38, 38, 0.04) 0%, transparent 50%);
  color: var(--df-text-silver);
}

/* ─── Header ─── */
.df-header {
  background: var(--df-bg-deep);
  border-bottom: 1px solid var(--df-border-red);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5), 0 1px 0 var(--df-border-silver);
}

.df-top-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--df-accent-red), transparent);
  opacity: 0.4;
}

.df-logo-frame {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, var(--df-accent-crimson), #1a0505);
  border: 1px solid var(--df-border-red);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px var(--df-glow-red);
}

.df-brand-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--df-accent-red);
  text-shadow: 0 0 20px var(--df-glow-red);
  letter-spacing: 0.04em;
}

/* ─── Page Title ─── */
.df-page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 0 18px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.6);
}

/* ─── Buttons ─── */
.df-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, var(--df-accent-crimson), #450a0a);
  border: 1px solid var(--df-border-red);
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.df-btn-primary:hover {
  background: linear-gradient(135deg, #b91c1c, #7f1d1d);
  box-shadow: 0 0 16px var(--df-glow-red);
  color: #fff;
}
.df-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.df-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: 1px solid var(--df-border-silver);
  color: var(--df-text-silver);
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.df-btn-outline:hover {
  border-color: var(--df-accent-red);
  color: #fca5a5;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.15);
}
.df-btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.df-btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #991b1b, #450a0a);
  border: 1px solid #ef4444;
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.df-btn-danger:hover {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.4);
  color: white;
}
.df-btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.df-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  color: var(--df-text-silver);
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.df-btn-ghost:hover {
  color: var(--df-accent-red);
  border-color: var(--df-border-red);
  background: rgba(127, 29, 29, 0.1);
}

/* ─── Campaign Card ─── */
.df-campaign-card {
  position: relative;
  background: var(--df-bg-card);
  border: 1px solid var(--df-border-red);
  box-shadow:
    0 0 0 1px var(--df-border-silver),
    inset 0 1px 6px rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s;
}
.df-campaign-card:hover {
  border-color: var(--df-accent-red);
  box-shadow:
    0 0 0 1px var(--df-accent-red),
    0 0 24px var(--df-glow-red),
    inset 0 1px 6px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

/* Card Corner Decorations */
.df-card-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 2;
  pointer-events: none;
}
.df-card-corner::before,
.df-card-corner::after {
  content: '';
  position: absolute;
  background: var(--df-accent-crimson);
  transition: background 0.3s;
}
.df-card-corner::before { width: 16px; height: 1px; }
.df-card-corner::after  { width: 1px;  height: 16px; }

.df-campaign-card:hover .df-card-corner::before,
.df-campaign-card:hover .df-card-corner::after {
  background: var(--df-accent-red);
}

.df-card-corner-tl { top: -1px; left: -1px; }
.df-card-corner-tl::before { top: 0; left: 0; }
.df-card-corner-tl::after  { top: 0; left: 0; }

.df-card-corner-tr { top: -1px; right: -1px; }
.df-card-corner-tr::before { top: 0; right: 0; }
.df-card-corner-tr::after  { top: 0; right: 0; }

.df-card-corner-bl { bottom: -1px; left: -1px; }
.df-card-corner-bl::before { bottom: 0; left: 0; }
.df-card-corner-bl::after  { bottom: 0; left: 0; }

.df-card-corner-br { bottom: -1px; right: -1px; }
.df-card-corner-br::before { bottom: 0; right: 0; }
.df-card-corner-br::after  { bottom: 0; right: 0; }

.df-card-title {
  color: var(--df-text-silver);
}

.df-card-action {
  padding: 0.375rem;
  color: var(--df-text-silver);
  border-radius: 0.25rem;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.df-card-action:hover {
  color: var(--df-accent-red);
  border-color: var(--df-border-red);
  background: rgba(127, 29, 29, 0.15);
}

/* ─── Badges ─── */
.df-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: 0.25rem;
  border: 1px solid;
}
.df-badge-master {
  background: rgba(220, 38, 38, 0.1);
  border-color: var(--df-accent-crimson);
  color: #fca5a5;
}
.df-badge-player {
  background: rgba(74, 74, 90, 0.2);
  border-color: var(--df-border-silver);
  color: var(--df-text-silver);
}

/* ─── Text Helpers ─── */
.df-text-muted {
  color: #6b6b80;
}
.df-text-silver {
  color: var(--df-text-silver);
}

/* ─── Spinner ─── */
.df-spinner {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 2px solid var(--df-border-red);
  border-top-color: var(--df-accent-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Empty State ─── */
.df-empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid var(--df-border-red);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(127, 29, 29, 0.05);
  box-shadow: 0 0 30px rgba(220, 38, 38, 0.1);
}

/* ─── Modal ─── */
.df-modal-overlay {
  --df-bg-deep: #050510;
  --df-bg-card: #0a0a1a;
  --df-bg-input: #0d0d20;
  --df-border-red: #7f1d1d;
  --df-border-silver: #4a4a5a;
  --df-accent-red: #dc2626;
  --df-accent-crimson: #991b1b;
  --df-text-silver: #c0c0d0;
  --df-text-gold: #d4a647;
  --df-glow-red: rgba(220, 38, 38, 0.3);

  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  color: var(--df-text-silver);
}

.df-modal-panel {
  position: relative;
  background: var(--df-bg-deep);
  border: 2px solid var(--df-border-red);
  box-shadow:
    0 0 0 1px var(--df-border-silver),
    0 0 40px rgba(220, 38, 38, 0.12);
  border-radius: 0.75rem;
  padding: 2rem;
}
.df-modal-danger {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px var(--df-border-silver),
    0 0 40px rgba(239, 68, 68, 0.15);
}
.df-modal-warning {
  border-color: #d97706;
  box-shadow:
    0 0 0 1px var(--df-border-silver),
    0 0 40px rgba(217, 119, 6, 0.12);
}

.df-modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid var(--df-border-red);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.df-modal-icon-danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}
.df-modal-icon-warning {
  background: rgba(217, 119, 6, 0.1);
  border-color: #d97706;
}

/* ─── Form Elements ─── */
.df-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--df-text-silver);
  margin-bottom: 0.5rem;
}

.df-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: var(--df-bg-input);
  border: 1px solid var(--df-border-red);
  border-radius: 0.375rem;
  color: var(--df-text-silver);
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.df-input::placeholder {
  color: #4a4a5a;
}
.df-input:focus {
  border-color: var(--df-accent-red);
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
}

.df-textarea {
  resize: none;
}

/* ─── Highlight Box (in modals) ─── */
.df-highlight-box {
  background: var(--df-bg-card);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--df-border-red);
}

/* ─── Line Clamp Utilities ─── */
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

/* ─── Scrollbar ─── */
.df-dashboard::-webkit-scrollbar { width: 6px; }
.df-dashboard::-webkit-scrollbar-track { background: var(--df-bg-deep); }
.df-dashboard::-webkit-scrollbar-thumb { background: var(--df-border-red); border-radius: 3px; }
.df-dashboard::-webkit-scrollbar-thumb:hover { background: var(--df-accent-red); }
</style>
