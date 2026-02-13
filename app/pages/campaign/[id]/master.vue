<template>
  <div class="min-h-screen bg-gradient-vampire text-text-primary">
    <!-- Header -->
    <header class="bg-surface-card border-b border-primary mt-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between min-h-16">
          <div class="flex items-center">
            <BaseButton
              variant="ghost"
              size="sm"
              @click="goBackToDashboard"
              class="mr-4 p-2"
              title="Voltar ao Dashboard"
            >
              ←
            </BaseButton>
            <div>
              <h1 class="text-xl font-bold">{{ campaign?.name || 'Carregando...' }}</h1>
              <!-- Código de convite -->
              <div v-if="campaign && campaign.inviteCode" class="flex items-center gap-2 mt-1 text-sm">
                <span class="text-text-secondary">Código de convite:</span>
                <div class="flex items-center gap-2 bg-surface-dark px-3 py-1 rounded-md border border-border cursor-pointer hover:bg-surface-dark/80 transition-colors" 
                     @click="copyInviteCode(campaign.inviteCode)"
                     title="Clique para copiar código de convite">
                  <code class="font-mono font-bold text-accent">{{ campaign.inviteCode }}</code>
                  <!-- Ícone de copiar (dois retângulos sobrepostos) -->
                  <svg class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <BaseButton variant="primary" size="sm" @click="goToLiveGame">
              🎲 Entrar no Jogo
            </BaseButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="localLoading || (!campaign && !error)" class="flex items-center justify-center min-h-96">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <h2 class="text-2xl font-bold text-red-400 mb-4">Erro ao carregar campanha</h2>
        <p class="text-text-muted mb-6">{{ error }}</p>
        <BaseButton variant="primary" @click="goBackToDashboard">
          Voltar ao Dashboard
        </BaseButton>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="campaign" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Campaign Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-surface-card rounded-lg p-6 border border-primary">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">👥</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-text-muted">Jogadores</p>
              <div class="flex items-baseline">
                <p class="text-2xl font-bold text-text-primary">{{ playersCount }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-surface-card rounded-lg p-6 border border-primary">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">📖</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-text-muted">Sessões</p>
              <div class="flex items-baseline">
                <p class="text-2xl font-bold text-text-primary">{{ sessionCount }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-surface-card rounded-lg p-6 border border-primary">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">⚡</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-text-muted">Eventos</p>
              <div class="flex items-baseline">
                <p class="text-2xl font-bold text-text-primary">{{ eventsCount }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-surface-card rounded-lg p-6 border border-primary">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <span class="text-2xl">🎭</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-text-muted">NPCs</p>
              <div class="flex items-baseline">
                <p class="text-2xl font-bold text-text-primary">{{ npcsCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="border-b border-primary mb-8">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              currentTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-accent'
            ]"
            @click="currentTab = tab.id"
          >
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Players Tab -->
        <PlayersTab 
          v-if="currentTab === 'players'" 
          :campaign="campaign"
          :campaign-id="campaignId"
          ref="playersTabRef"
          @refresh="refreshCampaignData"
        />

        <!-- NPCs Tab -->
        <NPCsTab 
          v-if="currentTab === 'npcs'" 
          :campaign-id="campaignId"
          ref="npcsTabRef"
        />

        <!-- Notes Tab -->
        <NotesTab 
          v-if="currentTab === 'notes'" 
          :campaign-id="campaignId"
          ref="notesTabRef"
        />

        <!-- Settings Tab -->
        <SettingsTab 
          v-if="currentTab === 'settings'" 
          :campaign="campaign"
          :campaign-id="campaignId"
        />

        <!-- Media Tab -->
        <MediaTab 
          v-if="currentTab === 'media'" 
          :campaign-id="campaignId"
        />
      </div>
    </div>
    
    <!-- Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'nuxt/app'
import type { Campaign } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import ToastContainer from '~/components/ui/ToastContainer.vue'

// Import tab components
import PlayersTab from '~/components/campaign/master/PlayersTab.vue'
import NPCsTab from '~/components/campaign/master/NPCsTab.vue'
import NotesTab from '~/components/campaign/master/NotesTab.vue'
import SettingsTab from '~/components/campaign/master/SettingsTab.vue'
import MediaTab from '~/components/campaign/master/MediaTab.vue'

// Import composables
const { success: toastSuccess, error: toastError } = useToast()
const { getCampaignById, loading, error: campaignError } = useCampaign()

// Define the middleware for this page
definePageMeta({
  layout: false
})

// Reactive data
const route = useRoute()
const router = useRouter()
const campaignId = route.params.id as string

const campaign = ref<Campaign | null>(null)
const error = ref<string | null>(null)
const localLoading = ref(false)
const currentTab = ref('players')

// Tab refs for accessing child data
const playersTabRef = ref()
const npcsTabRef = ref()
const notesTabRef = ref()

// Mock data for now (will be removed when using real components)
const sessions = ref<any[]>([])
const events = ref<any[]>([])

// Computed properties using refs from child components
const playersCount = computed(() => playersTabRef.value?.count || 0)
const sessionCount = computed(() => sessions.value.length)
const eventsCount = computed(() => events.value.length || notesTabRef.value?.count || 0)
const npcsCount = computed(() => npcsTabRef.value?.npcs?.length || 0)

// Tabs configuration
const tabs = ref([
  { id: 'players', label: 'Jogadores', icon: '👥' },
  { id: 'npcs', label: 'NPCs', icon: '🎭' },
  { id: 'notes', label: 'Anotações', icon: '📝' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
  { id: 'media', label: 'Mídia', icon: '📁' }
])

// Methods
const refreshCampaignData = async () => {
  console.log('🔄 MASTER.VUE: Recarregando dados da campanha...')
  try {
    const campaignData = await getCampaignById(campaignId)
    
    if (campaignData) {
      campaign.value = {
        id: campaignData.id,
        name: campaignData.name,
        description: campaignData.description,
        masterId: campaignData.master_id,
        inviteCode: campaignData.invite_code,
        players: (campaignData.campaign_players || []).map((player: any) => ({
          id: player.user_id,
          name: player.character_name,
          email: `User: ${player.user_id.substring(0, 8)}...`,
          role: player.role,
          joinedAt: new Date(player.joined_at)
        })),
        createdAt: new Date(campaignData.created_at),
        updatedAt: new Date(campaignData.updated_at),
        isPremium: campaignData.is_premium || false
      } as any
      
      ;(campaign.value as any).campaign_players = campaignData.campaign_players || []
      console.log('✅ MASTER.VUE: Dados recarregados com sucesso')
    }
  } catch (err) {
    console.error('❌ MASTER.VUE: Erro ao recarregar dados:', err)
  }
}

const goBackToDashboard = () => {
  router.push('/dashboard')
}

const goToLiveGame = () => {
  router.push(`/campaign/${campaignId}/live`)
}

// Copiar código de convite
const copyInviteCode = async (inviteCode: string) => {
  try {
    await navigator.clipboard.writeText(inviteCode)
    toastSuccess('Código copiado!', `Código ${inviteCode} copiado para a área de transferência`)
  } catch (error) {
    // Fallback para browsers mais antigos
    const textArea = document.createElement('textarea')
    textArea.value = inviteCode
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    toastSuccess('Código copiado!', `Código ${inviteCode} copiado para a área de transferência`)
  }
}

// Initialize campaign data
onMounted(async () => {
  console.log('🎯 MASTER.VUE: Página master montada!')
  console.log('🎯 MASTER.VUE: Campaign ID:', campaignId)
  
  localLoading.value = true
  error.value = null
  
  try {
    console.log('🎯 MASTER.VUE: Carregando campanha:', campaignId)
    
    // Buscar dados reais da campanha do Supabase
    const campaignData = await getCampaignById(campaignId)
    
    console.log('🎯 MASTER.VUE: Dados da campanha carregados:', campaignData)
    
    if (campaignData) {
      // Mapear dados do Supabase para o formato esperado
      campaign.value = {
        id: campaignData.id,
        name: campaignData.name,
        description: campaignData.description,
        masterId: campaignData.master_id,
        inviteCode: campaignData.invite_code,
        players: (campaignData.campaign_players || []).map((player: any) => ({
          id: player.user_id,
          name: player.character_name,
          email: `User: ${player.user_id.substring(0, 8)}...`, // Placeholder pois não temos email
          role: player.role,
          joinedAt: new Date(player.joined_at)
        })),
        createdAt: new Date(campaignData.created_at),
        updatedAt: new Date(campaignData.updated_at),
        isPremium: campaignData.is_premium || false
      } as any // Usar any para incluir campaign_players do Supabase
      
      // Adicionar campaign_players original
      ;(campaign.value as any).campaign_players = campaignData.campaign_players || []
      
      console.log('🎯 MASTER.VUE: Campanha mapeada:', campaign.value)
      console.log('🎯 MASTER.VUE: Jogadores encontrados:', (campaign.value as any).campaign_players)
    }
    
    // Mock data initialization para sessões (pode ser substituído depois)
    sessions.value = [
      {
        id: '1',
        campaignId: campaignId,
        name: 'Sessão 1 - O Despertar',
        date: new Date('2024-01-15'),
        duration: 180,
        notes: 'Primeira sessão da campanha',
        playersPresent: []
      }
    ]
    
    console.log('🎯 MASTER.VUE: Dados carregados com sucesso')
    
  } catch (err) {
    console.error('🎯 MASTER.VUE: Error loading campaign:', err)
    error.value = 'Não foi possível carregar a campanha'
  } finally {
    localLoading.value = false
  }
})
</script>