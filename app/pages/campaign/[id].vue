<template>
  <div class="min-h-screen bg-gradient-atmospheric text-text-primary">
    <!-- Campaign Header -->
    <header class="bg-surface border-b border-border-primary sticky top-0 z-40">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Campaign Info -->
          <div class="flex items-center gap-4">
            <BaseButton 
              variant="ghost" 
              size="sm" 
              @click="navigateTo('/dashboard')"
              iconLeft="←"
            >
              Dashboard
            </BaseButton>
            <div>
              <h1 class="text-2xl font-bold text-red-400">{{ campaign?.name }}</h1>
              <p class="text-text-muted text-sm">{{ campaign?.description }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Master Controls -->
            <template v-if="permissions.isMaster">
              <BaseButton 
                variant="ghost" 
                size="sm" 
                @click="showUploadModal = true"
                iconLeft="🖼️"
              >
                Imagem
              </BaseButton>
              <BaseButton 
                variant="ghost" 
                size="sm" 
                @click="showMusicModal = true"
                iconLeft="🎵"
              >
                Música
              </BaseButton>
              <BaseButton 
                variant="primary" 
                size="sm" 
                @click="navigateTo(`/campaign/${campaignId}/master`)"
                iconLeft="👑"
              >
                Dashboard Mestre
              </BaseButton>
            </template>
            
            <!-- Player Info -->
            <div class="text-right">
              <div class="text-sm text-text-muted">
                {{ permissions.isMaster ? 'Mestre' : 'Jogador' }}
              </div>
              <div class="text-xs text-text-secondary">
                {{ campaign?.players?.length || 0 }} jogadores
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p class="text-text-muted mt-4">Carregando campanha...</p>
      </div>

      <!-- Campaign Not Found -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-xl font-semibold text-text-primary mb-2">Campanha não encontrada</h2>
        <p class="text-text-muted mb-6">{{ error }}</p>
        <BaseButton variant="primary" @click="navigateTo('/dashboard')">
          Voltar ao Dashboard
        </BaseButton>
      </div>

      <!-- Campaign Content -->
      <div v-else-if="campaign" class="space-y-6">
        <!-- Party Team -->
        <section class="bg-surface-card rounded-lg border border-border-primary p-6">
          <h2 class="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span>🎭</span>
            Party
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <PlayerAvatar
              v-for="player in campaign.players"
              :key="player.userId"
              :character="player.character"
              :compact="true"
              :editable="false"
            />
            
            <!-- Empty slots for visual -->
            <div 
              v-for="i in Math.max(0, 6 - (campaign.players?.length || 0))"
              :key="`empty-${i}`"
              class="flex items-center justify-center h-32 border-2 border-dashed border-border-secondary rounded-lg text-text-muted"
            >
              <span class="text-sm">Slot vazio</span>
            </div>
          </div>
        </section>

        <!-- Current Media Display -->
        <section v-if="campaign.currentImage || campaign.currentMusic" class="bg-surface-card rounded-lg border border-border-primary p-6">
          <h2 class="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span>📱</span>
            Mídia Atual
          </h2>

          <!-- Current Image/Map -->
          <div v-if="campaign.currentImage" class="mb-6">
            <h3 class="text-lg font-medium text-text-secondary mb-2">🗺️ Mapa/Imagem</h3>
            <div class="relative bg-surface-dark rounded-lg overflow-hidden">
              <img 
                :src="campaign.currentImage" 
                :alt="campaign.name"
                class="w-full max-h-96 object-contain"
                @load="imageLoaded = true"
                @error="imageError = true"
              />
              
              <!-- Loading/Error states -->
              <div v-if="!imageLoaded && !imageError" class="absolute inset-0 flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
              <div v-if="imageError" class="absolute inset-0 flex items-center justify-center text-text-muted">
                <span>❌ Erro ao carregar imagem</span>
              </div>
            </div>
          </div>

          <!-- Current Music -->
          <div v-if="campaign.currentMusic" class="mb-4">
            <h3 class="text-lg font-medium text-text-secondary mb-2">🎵 Música Ambiente</h3>
            <MediaPlayer 
              :src="campaign.currentMusic"
              :campaign-id="campaignId"
              :is-master="permissions.isMaster"
            />
          </div>
        </section>

        <!-- Timeline -->
        <section class="bg-surface-card rounded-lg border border-border-primary p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-text-primary flex items-center gap-2">
              <span>📜</span>
              Timeline da Campanha
            </h2>
            
            <BaseButton 
              v-if="permissions.isMaster"
              variant="primary" 
              size="sm"
              @click="showAddEventModal = true"
            >
              + Adicionar Evento
            </BaseButton>
          </div>

          <Timeline 
            :campaign-id="campaignId"
            :can-edit="permissions.isMaster"
          />
        </section>

        <!-- Document Library (Master only) -->
        <section v-if="permissions.isMaster" class="bg-surface-card rounded-lg border border-border-primary p-6">
          <h2 class="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span>📚</span>
            Biblioteca de Documentos
          </h2>
          
          <DocumentLibrary 
            :campaign-id="campaignId"
            :is-master="permissions.isMaster"
          />
        </section>
      </div>
    </main>

    <!-- Modals -->
    <UploadImageModal 
      v-if="showUploadModal"
      :campaign-id="campaignId"
      @close="showUploadModal = false"
      @uploaded="handleImageUploaded"
    />

    <MusicLibraryModal
      v-if="showMusicModal"
      :campaign-id="campaignId"
      @close="showMusicModal = false"
      @selected="handleMusicSelected"
    />

    <AddEventModal
      v-if="showAddEventModal"
      :campaign-id="campaignId"
      @close="showAddEventModal = false"
      @added="handleEventAdded"
    />
  </div>
</template>

<script setup lang="ts">
// ============================================
// Campaign Page - Tela compartilhada da campanha
// Acesso: Mestre + Jogadores da campanha
// ============================================

// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import PlayerAvatar from '~/components/campaign/PlayerAvatar.vue'
import Timeline from '~/components/campaign/Timeline.vue'
import MediaPlayer from '~/components/campaign/MediaPlayer.vue'

// Nuxt 4 auto-imports
definePageMeta({
  layout: 'campaign',
  middleware: 'is-player'
})

// Route params
const route = useRoute()
const campaignId = route.params.id as string

// Mock composables with middleware protection (will be real with backend)
const campaign = ref<any>(null)
const permissions = ref({ isMaster: true, isPlayer: true, canEdit: true, canDelete: false })
const loading = ref(true)
const error = ref<string | null>(null)

// Mock methods
const fetchCampaignData = async (id: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  campaign.value = {
    id,
    name: 'Crônicas de Chicago',
    description: 'Uma história sombria nas ruas de Chicago...',
    players: [
      {
        userId: '1',
        character: {
          name: 'Marcus Ventrue',
          clan: 'Ventrue',
          generation: 10,
          attributes: { hunger: 2, humanity: 7, willpower: 8, health: 10 },
          disciplines: ['Dominação', 'Presença']
        }
      }
    ],
    currentImage: null,
    currentMusic: null
  }
}

const updateCurrentMedia = async (type: string, url: string) => {
  console.log(`Updating ${type}:`, url)
}

// Local state
const imageLoaded = ref(false)
const imageError = ref(false)

// Modal states
const showUploadModal = ref(false)
const showMusicModal = ref(false)
const showAddEventModal = ref(false)

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
  console.log('Campanha: Página montada, ID:', campaignId)
  
  try {
    await fetchCampaignData(campaignId)
    
    if (!campaign.value) {
      error.value = 'Campanha não encontrada ou você não tem permissão para acessá-la'
    }
  } catch (e: any) {
    console.error('Erro ao carregar campanha:', e)
    error.value = e.message || 'Erro ao carregar campanha'
  } finally {
    loading.value = false
  }
})

// ============================================
// Methods
// ============================================

const handleImageUploaded = async (imageUrl: string) => {
  try {
    await updateCurrentMedia('image', imageUrl)
    showUploadModal.value = false
    
    // Refresh campaign data
    await fetchCampaignData(campaignId)
  } catch (e: any) {
    console.error('Erro ao atualizar imagem:', e)
  }
}

const handleMusicSelected = async (musicUrl: string) => {
  try {
    await updateCurrentMedia('music', musicUrl)
    showMusicModal.value = false
    
    // Refresh campaign data
    await fetchCampaignData(campaignId)
  } catch (e: any) {
    console.error('Erro ao atualizar música:', e)
  }
}

const handleEventAdded = () => {
  showAddEventModal.value = false
  // Timeline component will auto-refresh
}

// ============================================
// SEO
// ============================================
useHead({
  title: computed(() => campaign.value?.name || 'Campanha'),
  meta: [
    {
      name: 'description',
      content: computed(() => campaign.value?.description || 'Campanha de Vampire: The Masquerade')
    }
  ]
})
</script>

<style scoped>
/* Component-specific styles if needed */
.bg-gradient-atmospheric {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 100%);
}
</style>