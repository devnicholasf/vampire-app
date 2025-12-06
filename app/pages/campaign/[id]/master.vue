<template>
  <div class="min-h-screen bg-gradient-atmospheric text-text-primary">
    <!-- Master Header -->
    <header class="bg-surface border-b border-border-primary sticky top-0 z-40">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Navigation -->
          <div class="flex items-center gap-4">
            <BaseButton 
              variant="ghost" 
              size="sm" 
              @click="navigateTo(`/campaign/${campaignId}`)"
              iconLeft="←"
            >
              Campanha
            </BaseButton>
            <div>
              <h1 class="text-2xl font-bold text-red-400 flex items-center gap-2">
                <span>👑</span>
                Dashboard do Mestre
              </h1>
              <p class="text-text-muted text-sm">{{ campaign?.name }}</p>
            </div>
          </div>

          <!-- Master Actions -->
          <div class="flex items-center gap-2">
            <BaseButton 
              variant="ghost" 
              size="sm" 
              @click="showQuickActionsModal = true"
              iconLeft="⚡"
            >
              Ações Rápidas
            </BaseButton>
            <BaseButton 
              variant="primary" 
              size="sm" 
              @click="navigateTo(`/campaign/${campaignId}`)"
              iconLeft="👁️"
            >
              Ver Campanha
            </BaseButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p class="text-text-muted mt-4">Carregando dashboard...</p>
      </div>

      <!-- Access Denied -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-6xl mb-4">🚫</div>
        <h2 class="text-xl font-semibold text-text-primary mb-2">Acesso Negado</h2>
        <p class="text-text-muted mb-6">{{ error }}</p>
        <BaseButton variant="primary" @click="navigateTo('/dashboard')">
          Voltar ao Dashboard
        </BaseButton>
      </div>

      <!-- Master Dashboard -->
      <div v-else-if="campaign" class="space-y-6">
        <!-- Quick Stats -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Players Count -->
          <div class="bg-surface-card rounded-lg border border-border-primary p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm">Jogadores</p>
                <p class="text-2xl font-bold text-text-primary">{{ campaign.players?.length || 0 }}</p>
              </div>
              <div class="text-3xl">🎭</div>
            </div>
          </div>

          <!-- Sessions Count -->
          <div class="bg-surface-card rounded-lg border border-border-primary p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm">Sessões</p>
                <p class="text-2xl font-bold text-text-primary">{{ sessionCount }}</p>
              </div>
              <div class="text-3xl">📅</div>
            </div>
          </div>

          <!-- Events Count -->
          <div class="bg-surface-card rounded-lg border border-border-primary p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm">Eventos</p>
                <p class="text-2xl font-bold text-text-primary">{{ eventsCount }}</p>
              </div>
              <div class="text-3xl">📜</div>
            </div>
          </div>

          <!-- NPCs Count -->
          <div class="bg-surface-card rounded-lg border border-border-primary p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-text-muted text-sm">NPCs</p>
                <p class="text-2xl font-bold text-text-primary">{{ npcsCount }}</p>
              </div>
              <div class="text-3xl">👤</div>
            </div>
          </div>
        </section>

        <!-- Tabs Navigation -->
        <section class="bg-surface-card rounded-lg border border-border-primary">
          <div class="border-b border-border-primary">
            <nav class="flex space-x-8 px-6">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                :class="[
                  'py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200',
                  currentTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border-primary'
                ]"
                @click="currentTab = tab.id"
              >
                <span class="mr-2">{{ tab.icon }}</span>
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Players Stats -->
            <div v-if="currentTab === 'players'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-text-primary">Estatísticas dos Jogadores</h3>
                <BaseButton variant="ghost" size="sm" @click="refreshPlayerStats">
                  🔄 Atualizar
                </BaseButton>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlayerAvatar
                  v-for="player in campaign.players"
                  :key="player.userId"
                  :character="player.character"
                  :editable="false"
                  :compact="false"
                />
              </div>
            </div>

            <!-- NPCs Management -->
            <div v-if="currentTab === 'npcs'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-text-primary">Gerenciador de NPCs</h3>
                <BaseButton variant="primary" size="sm" @click="showCreateNPCModal = true">
                  + Criar NPC
                </BaseButton>
              </div>

              <NPCManager 
                :campaign-id="campaignId"
                @npc-created="handleNPCCreated"
                @npc-updated="handleNPCUpdated"
              />
            </div>

            <!-- Master Notes -->
            <div v-if="currentTab === 'notes'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-text-primary">Anotações Privadas</h3>
                <BaseButton variant="primary" size="sm" @click="showCreateNoteModal = true">
                  + Nova Nota
                </BaseButton>
              </div>

              <MasterNotes 
                :campaign-id="campaignId"
                @note-created="handleNoteCreated"
                @note-updated="handleNoteUpdated"
              />
            </div>

            <!-- Combat Tracker -->
            <div v-if="currentTab === 'combat'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-text-primary">Rastreador de Combate</h3>
                <div class="flex gap-2">
                  <BaseButton variant="ghost" size="sm" @click="resetCombat">
                    🔄 Resetar
                  </BaseButton>
                  <BaseButton variant="primary" size="sm" @click="startCombat">
                    ⚔️ Iniciar Combate
                  </BaseButton>
                </div>
              </div>

              <CombatTracker 
                :campaign-id="campaignId"
                @combat-started="handleCombatStarted"
                @combat-ended="handleCombatEnded"
              />
            </div>

            <!-- Campaign Settings -->
            <div v-if="currentTab === 'settings'" class="space-y-6">
              <h3 class="text-lg font-semibold text-text-primary">Configurações da Campanha</h3>
              
              <CampaignSettings 
                :campaign="campaign"
                @updated="handleCampaignUpdated"
              />
            </div>

            <!-- Media Library -->
            <div v-if="currentTab === 'media'" class="space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-text-primary">Biblioteca de Mídia</h3>
                <BaseButton variant="primary" size="sm" @click="showUploadMediaModal = true">
                  📁 Upload
                </BaseButton>
              </div>

              <MediaLibrary 
                :campaign-id="campaignId"
                @media-uploaded="handleMediaUploaded"
                @media-selected="handleMediaSelected"
              />
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Modals -->
    <CreateNPCModal
      v-if="showCreateNPCModal"
      :campaign-id="campaignId"
      @close="showCreateNPCModal = false"
      @created="handleNPCCreated"
    />

    <CreateNoteModal
      v-if="showCreateNoteModal"
      :campaign-id="campaignId"
      @close="showCreateNoteModal = false"
      @created="handleNoteCreated"
    />

    <UploadMediaModal
      v-if="showUploadMediaModal"
      :campaign-id="campaignId"
      @close="showUploadMediaModal = false"
      @uploaded="handleMediaUploaded"
    />

    <QuickActionsModal
      v-if="showQuickActionsModal"
      :campaign-id="campaignId"
      @close="showQuickActionsModal = false"
      @action="handleQuickAction"
    />
  </div>
</template>

<script setup lang="ts">
// ============================================
// Master Dashboard - Dashboard exclusivo do mestre
// Acesso: Apenas mestre da campanha
// ============================================

// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import PlayerAvatar from '~/components/campaign/PlayerAvatar.vue'

// Nuxt 4 auto-imports
definePageMeta({
  layout: 'campaign',
  middleware: 'is-master'
})

// Route params
const route = useRoute()
const campaignId = route.params.id as string

// Composables (protected by isMaster middleware)
const campaign = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Tab system
const currentTab = ref('players')
const tabs = [
  { id: 'players', name: 'Jogadores', icon: '🎭' },
  { id: 'npcs', name: 'NPCs', icon: '👤' },
  { id: 'notes', name: 'Notas', icon: '📝' },
  { id: 'combat', name: 'Combate', icon: '⚔️' },
  { id: 'media', name: 'Mídia', icon: '📁' },
  { id: 'settings', name: 'Configurações', icon: '⚙️' }
]

// Modal states
const showCreateNPCModal = ref(false)
const showCreateNoteModal = ref(false)
const showUploadMediaModal = ref(false)
const showQuickActionsModal = ref(false)

// Mock stats (will be calculated from real data)
const sessionCount = ref(5)
const eventsCount = ref(23)
const npcsCount = ref(8)

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
  try {
    // Mock campaign data for now
    await simulateLoadCampaign()
  } catch (e: any) {
    console.error('Erro ao carregar dashboard:', e)
    error.value = e.message || 'Erro ao carregar dashboard do mestre'
  } finally {
    loading.value = false
  }
})

// ============================================
// Mock Methods (replace with real API calls)
// ============================================
const simulateLoadCampaign = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock campaign data
  campaign.value = {
    id: campaignId,
    name: 'Crônicas de Chicago',
    description: 'Uma história sombria nas ruas de Chicago...',
    players: [
      {
        userId: '1',
        character: {
          name: 'Marcus Ventrue',
          clan: 'Ventrue',
          generation: 10,
          avatar: '/images/marcus.jpg',
          attributes: {
            hunger: 2,
            humanity: 7,
            willpower: 8,
            health: 10
          },
          disciplines: ['Dominação', 'Presença', 'Fortitude']
        }
      },
      {
        userId: '2', 
        character: {
          name: 'Selene Toreador',
          clan: 'Toreador',
          generation: 9,
          avatar: '/images/selene.jpg',
          attributes: {
            hunger: 1,
            humanity: 8,
            willpower: 7,
            health: 9
          },
          disciplines: ['Presença', 'Celeridade', 'Auspícios']
        }
      }
    ]
  }
}

// ============================================
// Event Handlers
// ============================================
const refreshPlayerStats = () => {
  console.log('Refreshing player stats...')
  // Implement refresh logic
}

const handleNPCCreated = (npc: any) => {
  console.log('NPC created:', npc)
  showCreateNPCModal.value = false
  npcsCount.value++
}

const handleNPCUpdated = (npc: any) => {
  console.log('NPC updated:', npc)
}

const handleNoteCreated = (note: any) => {
  console.log('Note created:', note)
  showCreateNoteModal.value = false
}

const handleNoteUpdated = (note: any) => {
  console.log('Note updated:', note)
}

const handleCombatStarted = () => {
  console.log('Combat started')
}

const handleCombatEnded = () => {
  console.log('Combat ended')
}

const handleCampaignUpdated = (updatedCampaign: any) => {
  console.log('Campaign updated:', updatedCampaign)
  campaign.value = updatedCampaign
}

const handleMediaUploaded = (media: any) => {
  console.log('Media uploaded:', media)
  showUploadMediaModal.value = false
}

const handleMediaSelected = (media: any) => {
  console.log('Media selected:', media)
}

const handleQuickAction = (action: string) => {
  console.log('Quick action:', action)
  showQuickActionsModal.value = false
}

const resetCombat = () => {
  console.log('Resetting combat...')
}

const startCombat = () => {
  console.log('Starting combat...')
}

// ============================================
// SEO
// ============================================
useHead({
  title: computed(() => `Dashboard - ${campaign.value?.name || 'Mestre'}`),
  meta: [
    {
      name: 'description',
      content: 'Dashboard exclusivo do mestre para gerenciar a campanha de Vampire: The Masquerade'
    }
  ]
})
</script>

<style scoped>
.bg-gradient-atmospheric {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 100%);
}
</style>