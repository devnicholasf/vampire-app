<template>
  <div class="min-h-screen bg-gradient-atmospheric relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Header -->
    <header class="bg-surface-card border-b border-primary mt-4 relative z-10">
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
              <h1 class="text-xl font-bold text-purple-400">🎭 {{ campaign?.name || 'Carregando...' }}</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
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
      </div>
    </header>

    <!-- PlayerSheet Modal -->
    <PlayerSheet
      v-if="showCharacterSheet && myCharacter"
      :key="sheetKey"
      :player="myCharacter"
      :canEdit="true"
      @close="closeCharacterSheet"
      @save="saveCharacterSheet"
    />

    <!-- Toast Notification -->
    <BaseToast
      :message="toastMessage"
      :variant="toastVariant"
      :show="showToast"
      @dismiss="hideToast"
      class="fixed top-4 right-4 z-[10000]"
    />

    <main class="container mx-auto px-4 py-8 relative z-10">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <p class="text-text-muted mt-4">Carregando campanha...</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Hero Section - My Character Card -->
        <div class="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-vampire p-8 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div class="relative z-10">
            <div class="mb-6">
              <h2 class="text-3xl font-bold text-purple-400 mb-2">🎭 Meu Personagem</h2>
              <p class="text-text-muted text-sm">
                {{ campaign?.name }}
              </p>
            </div>
            
            <div v-if="myCharacter" class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Character Avatar & Name -->
              <div class="md:col-span-1 flex flex-col items-center text-center">
                <div class="w-32 h-32 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center text-white font-bold text-4xl shadow-xl mb-4 border-2 border-purple-400">
                  {{ getCharacterInitials(myCharacter.character_name || myCharacter.name) }}
                </div>
                <h3 class="text-2xl font-bold text-text-primary mb-2">
                  {{ myCharacter.character_name || myCharacter.name }}
                </h3>
                <div class="text-text-muted space-y-1">
                  <p class="text-lg">
                    {{ myCharacter.sheet?.clan || '🔮 Clã não definido' }}
                  </p>
                  <p v-if="myCharacter.sheet?.generation" class="text-sm">
                    {{ myCharacter.sheet.generation }}ª Geração
                  </p>
                  <p v-if="myCharacter.sheet?.sect" class="text-sm">
                    {{ myCharacter.sheet.sect }}
                  </p>
                </div>
              </div>

              <!-- Character Stats -->
              <div v-if="myCharacter.sheet" class="md:col-span-2">
                <div class="grid grid-cols-3 gap-4 mb-6">
                  <div class="bg-surface-dark p-4 rounded-lg border border-purple-500/30 text-center">
                    <p class="text-3xl font-bold text-purple-400 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.physical) }}
                    </p>
                    <p class="text-xs text-text-muted uppercase">🏋️ Físico</p>
                  </div>
                  <div class="bg-surface-dark p-4 rounded-lg border border-blue-500/30 text-center">
                    <p class="text-3xl font-bold text-blue-400 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.social) }}
                    </p>
                    <p class="text-xs text-text-muted uppercase">🎭 Social</p>
                  </div>
                  <div class="bg-surface-dark p-4 rounded-lg border border-green-500/30 text-center">
                    <p class="text-3xl font-bold text-green-400 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.mental) }}
                    </p>
                    <p class="text-xs text-text-muted uppercase">🧠 Mental</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-surface-dark p-4 rounded-lg border border-red-500/30">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-text-muted">❤️ Humanidade</span>
                      <span class="text-lg font-bold text-red-400">{{ myCharacter.sheet.humanity || 7 }}</span>
                    </div>
                    <div class="w-full bg-surface-hover rounded-full h-2">
                      <div 
                        class="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all"
                        :style="{ width: `${((myCharacter.sheet.humanity || 7) / 10) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="bg-surface-dark p-4 rounded-lg border border-blue-500/30">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-text-muted">💪 Força de Vontade</span>
                      <span class="text-lg font-bold text-blue-400">{{ myCharacter.sheet.willpower || 3 }}</span>
                    </div>
                    <div class="w-full bg-surface-hover rounded-full h-2">
                      <div 
                        class="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all"
                        :style="{ width: `${((myCharacter.sheet.willpower || 3) / 10) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- Top Disciplines -->
                <div v-if="myCharacter.sheet.disciplines?.length > 0" class="mt-4 bg-surface-dark p-4 rounded-lg border border-purple-500/30">
                  <p class="text-sm text-text-muted mb-3">🩸 Disciplinas Principais</p>
                  <div class="flex flex-wrap gap-2">
                    <div 
                      v-for="discipline in myCharacter.sheet.disciplines.filter((d: any) => d.name && d.level > 0).slice(0, 5)" 
                      :key="discipline.name"
                      class="bg-red-900/20 border border-red-500/30 rounded-full px-3 py-1 text-sm"
                    >
                      {{ discipline.name }} <span class="text-red-400 font-bold">{{ '●'.repeat(discipline.level) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Editar Ficha Button -->
                <div class="mt-6 text-center">
                  <BaseButton 
                    variant="primary" 
                    size="md"
                    @click="openCharacterSheet"
                    class="bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg transition-colors"
                  >
                    ✏️ Editar Ficha
                  </BaseButton>
                </div>
              </div>

              <!-- No Sheet Yet -->
              <div v-else class="md:col-span-2 bg-surface-dark p-8 rounded-lg border border-border-secondary text-center">
                <div class="text-6xl mb-4">📋</div>
                <p class="text-text-muted mb-4">Você ainda não preencheu sua ficha de personagem</p>
                <p class="text-text-muted text-sm mb-6">Crie sua ficha completa com atributos, habilidades, disciplinas e mais!</p>
                <BaseButton 
                  variant="primary" 
                  size="md"
                  @click="openCharacterSheet"
                  class="bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg transition-colors"
                >
                  ✨ Criar Ficha Agora
                </BaseButton>
              </div>
            </div>

            <div v-else class="text-center py-12">
              <div class="text-6xl mb-4">🎭</div>
              <p class="text-text-muted text-lg mb-4">Você ainda não faz parte desta campanha</p>
              <p class="text-text-muted text-sm">Entre em contato com o Mestre para receber um convite</p>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            <!-- Session Notes -->
            <div class="bg-surface border border-border rounded-vampire p-6">
              <h2 class="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                📝 Notas das Sessões
              </h2>
              
              <div v-if="sessionNotes.length > 0" class="space-y-4">
                <div 
                  v-for="note in sessionNotes" 
                  :key="note.id"
                  class="border border-border-secondary rounded p-4 hover:border-purple-500/30 transition-colors"
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
            <!-- Quick Actions -->
            <div class="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-vampire p-6">
              <h3 class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                ⚡ Ações Rápidas
              </h3>
              
              <div class="space-y-3">
                <BaseButton 
                  variant="primary" 
                  size="md" 
                  @click="goToLiveGame"
                  class="w-full justify-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg"
                >
                  🎲 Entrar no Jogo Ao Vivo
                </BaseButton>
                
                <BaseButton 
                  variant="outline" 
                  size="sm" 
                  @click="editCharacter"
                  class="w-full justify-start hover:bg-purple-500/10"
                >
                  ✏️ Editar Personagem
                </BaseButton>
                
                <BaseButton 
                  variant="ghost" 
                  size="sm" 
                  @click="viewRules"
                  class="w-full justify-start text-text-muted hover:text-text-primary"
                >
                  📚 Ver Regras
                </BaseButton>
              </div>
            </div>

            <!-- Other Players -->
            <div class="bg-surface border border-border rounded-vampire p-6">
              <h3 class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                👥 Outros Jogadores
              </h3>
              
              <div v-if="otherPlayers.length > 0" class="space-y-3">
                <div 
                  v-for="player in otherPlayers" 
                  :key="player.id"
                  class="flex items-center gap-3 p-3 bg-surface-hover rounded border border-border-secondary hover:border-purple-500/30 transition-colors"
                >
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {{ getPlayerInitials(player.name) }}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-text-primary">{{ player.name }}</p>
                    <p v-if="player.character && player.character.clan" class="text-xs text-text-muted">
                      {{ player.character.clan }}
                    </p>
                    <p v-else class="text-xs text-text-muted italic">
                      Ficha não preenchida
                    </p>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8">
                <div class="text-4xl mb-2">👤</div>
                <p class="text-text-muted text-sm">Você é o único jogador por enquanto</p>
              </div>
            </div>

            <!-- Campaign Stats -->
            <div class="bg-surface border border-border rounded-vampire p-6">
              <h3 class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                📊 Estatísticas
              </h3>
              
              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-surface-hover rounded">
                  <span class="text-text-muted text-sm">📅 Sessões jogadas:</span>
                  <span class="font-bold text-text-primary">{{ playedSessions }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-surface-hover rounded">
                  <span class="text-text-muted text-sm">👥 Total de jogadores:</span>
                  <span class="font-bold text-text-primary">{{ totalPlayers }}</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-surface-hover rounded">
                  <span class="text-text-muted text-sm">⏱️ Campanha ativa há:</span>
                  <span class="font-bold text-text-primary">{{ campaignDuration }}</span>
                </div>
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
import PlayerSheet from '~/components/campaign/PlayerSheet.vue'
import BaseToast from '~/components/ui/BaseToast.vue'

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
const { savePlayerSheet, loadPlayerSheet } = useCampaign()
const toast = useToast()

// ============================================
// State
// ============================================
const loading = ref(true)
const campaign = ref<Campaign | null>(null)
const myCharacter = ref<any>(null)
const otherPlayers = ref<Player[]>([])
const sessionNotes = ref<SessionNote[]>([])
const showCharacterSheet = ref(false)
const sheetKey = ref(0) // Key para forçar recriação do componente

// Toast states
const showToast = ref(false)
const toastMessage = ref('')
const toastVariant = ref<'success' | 'error' | 'warning' | 'info'>('success')

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
          user_id: userPlayer.user_id,
          character_name: userPlayer.character_name,
          name: userPlayer.character_name,
          sheet: userPlayer.sheet || null,
          role: userPlayer.role,
          joined_at: userPlayer.joined_at
        }
      }

      // Load other players (excluding current user) - apenas dados reais do banco
      otherPlayers.value = (campaignData.campaign_players || [])
        .filter((player: any) => player.user_id !== user?.value?.id)
        .map((player: any) => ({
          id: player.user_id,
          name: player.character_name || 'Jogador',
          character: player.sheet ? {
            id: player.user_id,
            name: player.character_name,
            clan: player.sheet.clan || null,
            generation: player.sheet.generation || null,
            attributes: player.sheet.attributes || null
          } : null
        }))
      
      console.log('🎭 PLAYER.VUE: Dados carregados:', {
        campaign: campaign.value,
        myCharacter: myCharacter.value,
        otherPlayers: otherPlayers.value
      })
    }

    // Session notes vazias (serão implementadas futuramente)
    sessionNotes.value = []

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

// Character sheet actions
const openCharacterSheet = () => {
  showCharacterSheet.value = true
}

const closeCharacterSheet = async () => {
  console.log('🚪 CLOSE: closeCharacterSheet chamado - FECHANDO E RECARREGANDO DADOS')
  showCharacterSheet.value = false
  
  // Recarregar dados do banco para garantir que myCharacter volte aos valores originais
  await loadCampaignData()
  
  // Forçar recriação do componente na próxima abertura
  sheetKey.value++
}

const saveCharacterSheet = async (updatedPlayer: any) => {
  console.log('💾 SAVE: saveCharacterSheet chamado - SALVANDO NO BANCO')
  console.log('💾 SAVE: Dados recebidos:', updatedPlayer)
  try {
    await savePlayerSheet(campaignId, user.value!.id, updatedPlayer.sheet)
    
    // Fechar o modal imediatamente
    showCharacterSheet.value = false
    
    // Mostrar toast com barra de progresso
    toastMessage.value = 'Ficha salva com sucesso!'
    toastVariant.value = 'success'
    showToast.value = true
    
    // Auto-esconder após 4 segundos
    setTimeout(() => {
      showToast.value = false
    }, 4000)
    
    // Recarregar dados do banco em background
    await loadCampaignData()
    
    // Forçar recriação do componente na próxima abertura
    sheetKey.value++
    
  } catch (error: any) {
    console.error('Erro ao salvar ficha:', error)
    toastMessage.value = 'Erro ao salvar ficha: ' + error.message
    toastVariant.value = 'error'
    showToast.value = true
    
    setTimeout(() => {
      showToast.value = false
    }, 4000)
  }
}

// Character actions (legacy)
const createCharacter = () => {
  openCharacterSheet()
}

const editCharacter = () => {
  openCharacterSheet()
}

const hideToast = () => {
  showToast.value = false
}

const viewRules = () => {
  console.log('View rules')
  // navigateTo(`/campaign/${campaignId}/rules`)
}

// Helper functions
const calculateAttributeSum = (attributes: any) => {
  if (!attributes) return 0
  return Object.values(attributes).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
}

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