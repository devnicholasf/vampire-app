<template>
  <div class="min-h-screen bg-gradient-atmospheric relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Header -->
    <header class="bg-surface border-b border-border relative z-10">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <!-- Back Button + Title -->
        <div class="flex items-center gap-3">
          <BaseButton 
            variant="ghost" 
            size="sm" 
            @click="goBackToDashboard"
            class="text-text-muted hover:text-purple-400"
          >
            ← Dashboard
          </BaseButton>
          <div>
            <h1 class="text-xl font-bold text-purple-500 flex items-center gap-2">
              🎭 {{ campaign?.name || 'Carregando...' }}
            </h1>
            <p class="text-xs text-text-muted">Visão do Jogador</p>
          </div>
        </div>

        <!-- Player Actions -->
        <div class="flex items-center gap-2">
          <BaseButton 
            variant="primary" 
            size="sm" 
            @click="goToLiveGame"
            class="bg-purple-600 hover:bg-purple-500"
          >
            🎲 Entrar no Jogo
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8 relative z-10">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <p class="text-text-muted mt-4">Carregando campanha...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Campaign Overview -->
          <div class="bg-surface border border-border rounded-vampire p-6">
            <h2 class="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              📖 Sobre a Campanha
            </h2>
            <p class="text-text-muted leading-relaxed">
              {{ campaign?.description }}
            </p>
          </div>

          <!-- My Character -->
          <div class="bg-surface border border-border rounded-vampire p-6">
            <h2 class="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              🎭 Meu Personagem
            </h2>
            
            <div v-if="myCharacter" class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {{ getCharacterInitials(myCharacter.name) }}
                </div>
                <div>
                  <h3 class="font-bold text-text-primary">{{ myCharacter.name }}</h3>
                  <p class="text-text-muted">{{ myCharacter.clan }} - {{ myCharacter.generation }}ª Geração</p>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-4 pt-4 border-t border-border-secondary">
                <div class="text-center">
                  <p class="text-2xl font-bold text-purple-500">{{ myCharacter.attributes.physical }}</p>
                  <p class="text-xs text-text-muted">Físico</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-purple-500">{{ myCharacter.attributes.social }}</p>
                  <p class="text-xs text-text-muted">Social</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-purple-500">{{ myCharacter.attributes.mental }}</p>
                  <p class="text-xs text-text-muted">Mental</p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <div class="text-4xl mb-4">🎭</div>
              <p class="text-text-muted mb-4">Você ainda não criou seu personagem</p>
              <BaseButton variant="primary" @click="createCharacter">
                Criar Personagem
              </BaseButton>
            </div>
          </div>

          <!-- Session Notes -->
          <div class="bg-surface border border-border rounded-vampire p-6">
            <h2 class="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              📝 Notas das Sessões
            </h2>
            
            <div v-if="sessionNotes.length > 0" class="space-y-4">
              <div 
                v-for="note in sessionNotes" 
                :key="note.id"
                class="border border-border-secondary rounded p-4"
              >
                <div class="flex justify-between items-start mb-2">
                  <h3 class="font-semibold text-text-primary">{{ note.title }}</h3>
                  <span class="text-xs text-text-muted">{{ formatDate(note.date) }}</span>
                </div>
                <p class="text-text-muted text-sm">{{ note.content }}</p>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <div class="text-4xl mb-4">📝</div>
              <p class="text-text-muted">Nenhuma nota de sessão ainda</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Other Players -->
          <div class="bg-surface border border-border rounded-vampire p-6">
            <h3 class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              👥 Outros Jogadores
            </h3>
            
            <div class="space-y-3">
              <div 
                v-for="player in otherPlayers" 
                :key="player.id"
                class="flex items-center gap-3 p-3 bg-surface-hover rounded border border-border-secondary"
              >
                <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {{ getPlayerInitials(player.name) }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-text-primary">{{ player.name }}</p>
                  <p class="text-xs text-text-muted">
                    {{ player.character ? player.character.name : 'Sem personagem' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-surface border border-border rounded-vampire p-6">
            <h3 class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              ⚡ Ações Rápidas
            </h3>
            
            <div class="space-y-3">
              <BaseButton 
                variant="ghost" 
                size="sm" 
                @click="goToLiveGame"
                class="w-full justify-start"
              >
                🎲 Entrar no Jogo
              </BaseButton>
              
              <BaseButton 
                variant="ghost" 
                size="sm" 
                @click="editCharacter"
                class="w-full justify-start"
              >
                ✏️ Editar Personagem
              </BaseButton>
              
              <BaseButton 
                variant="ghost" 
                size="sm" 
                @click="viewRules"
                class="w-full justify-start"
              >
                📚 Ver Regras
              </BaseButton>
            </div>
          </div>

          <!-- Campaign Stats -->
          <div class="bg-surface border border-border rounded-vampire p-6">
            <h3 class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              📊 Estatísticas
            </h3>
            
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-text-muted">Sessões jogadas:</span>
                <span class="font-semibold text-text-primary">{{ playedSessions }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-muted">Total de jogadores:</span>
                <span class="font-semibold text-text-primary">{{ totalPlayers }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-text-muted">Campanha ativa há:</span>
                <span class="font-semibold text-text-primary">{{ campaignDuration }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// ============================================
// Vue imports
// ============================================
import { ref, onMounted, computed } from 'vue'

// ============================================
// Explicit component imports
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'

// ============================================
// Types
// ============================================
interface Campaign {
  id: string
  name: string
  description: string
  masterId: string
  createdAt: Date
}

interface Character {
  id: string
  name: string
  clan: string
  generation: number
  attributes: {
    physical: number
    social: number
    mental: number
  }
}

interface Player {
  id: string
  name: string
  character?: Character
}

interface SessionNote {
  id: string
  title: string
  content: string
  date: Date
}

// ============================================
// Route params and middleware
// ============================================
const route = useRoute()
const campaignId = route.params.id as string

definePageMeta({
  // middleware: 'auth' // Removido temporariamente
})

// ============================================
// Composables
// ============================================
const { user } = useAuth()

// ============================================
// State
// ============================================
const loading = ref(true)
const campaign = ref<Campaign | null>(null)
const myCharacter = ref<Character | null>(null)
const otherPlayers = ref<Player[]>([])
const sessionNotes = ref<SessionNote[]>([])

// ============================================
// Computed
// ============================================
const playedSessions = computed(() => sessionNotes.value.length)
const totalPlayers = computed(() => otherPlayers.value.length + 1) // +1 for current user
const campaignDuration = computed(() => {
  if (!campaign.value) return '0 dias'
  const diffTime = Math.abs(new Date().getTime() - campaign.value.createdAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays} dias`
})

// ============================================
// Methods
// ============================================
const loadCampaignData = async () => {
  try {
    loading.value = true
    console.log('🎭 PLAYER.VUE: Carregando dados da campanha...', campaignId)
    
    // Load real campaign data from Supabase
    const { getCampaignById } = useCampaign()
    const campaignData = await getCampaignById(campaignId)
    
    if (campaignData) {
      campaign.value = {
        id: campaignData.id,
        name: campaignData.name,
        description: campaignData.description || 'Sem descrição',
        masterId: campaignData.master_id,
        createdAt: new Date(campaignData.created_at)
      }

      // Find current user's character
      const userPlayer = campaignData.campaign_players?.find(
        (player: any) => player.user_id === user?.value?.id
      )
      
      if (userPlayer) {
        myCharacter.value = {
          id: userPlayer.user_id,
          name: userPlayer.character_name,
          clan: 'Ventrue', // Default - will be extended later
          generation: 8,   // Default - will be extended later
          attributes: {
            physical: 7,
            social: 9,
            mental: 6
          }
        }
      }

      // Load other players (excluding current user)
      otherPlayers.value = (campaignData.campaign_players || [])
        .filter((player: any) => player.user_id !== user?.value?.id)
        .map((player: any) => ({
          id: player.user_id,
          name: player.character_name,
          character: {
            id: player.user_id,
            name: player.character_name,
            clan: 'Desconhecido', // Will be extended later
            generation: 10,
            attributes: { physical: 5, social: 6, mental: 7 }
          }
        }))
      
      console.log('🎭 PLAYER.VUE: Dados carregados:', {
        campaign: campaign.value,
        myCharacter: myCharacter.value,
        otherPlayers: otherPlayers.value
      })
    }

    // Session notes will remain mock for now
    sessionNotes.value = [
      {
        id: 'note1',
        title: 'Primeira Noite',
        content: 'Chegamos a Chicago. A cidade parece diferente à noite. Conhecemos o Príncipe Victoria no Elysium.',
        date: new Date('2024-12-01')
      },
      {
        id: 'note2',
        title: 'Investigação no Porto',
        content: 'Descobrimos pistas sobre o contrabando de sangue. Algo não está certo com os Brujah.',
        date: new Date('2024-12-03')
      }
    ]

    loading.value = false
  } catch (error) {
    console.error('Erro ao carregar dados da campanha:', error)
    loading.value = false
  }
}

// Navigation
const goBackToDashboard = () => {
  navigateTo('/dashboard')
}

const goToLiveGame = () => {
  navigateTo(`/campaign/${campaignId}/live`)
}

// Character actions
const createCharacter = () => {
  console.log('Create character')
  // navigateTo(`/campaign/${campaignId}/character/create`)
}

const editCharacter = () => {
  console.log('Edit character')
  // navigateTo(`/campaign/${campaignId}/character/edit`)
}

const viewRules = () => {
  console.log('View rules')
  // navigateTo(`/campaign/${campaignId}/rules`)
}

// Helper functions
const getCharacterInitials = (name: string) => {
  const words = name.split(' ').filter((word: string) => word.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return words[0]?.[0]?.toUpperCase() || '?'
}

const getPlayerInitials = (name: string) => {
  const words = name.split(' ').filter((word: string) => word.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return words[0]?.[0]?.toUpperCase() || '?'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  loadCampaignData()
})

// ============================================
// SEO
// ============================================
const campaignTitle = computed(() => campaign.value?.name || 'Carregando...')

useSeoMeta({
  title: computed(() => `Campanha - ${campaignTitle.value}`),
  description: 'Dashboard do jogador para campanha de Vampire: The Masquerade'
})
</script>