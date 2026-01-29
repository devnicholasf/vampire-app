<template>
  <div class="campaign-main min-h-screen bg-gradient-vampire">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
        <p class="text-text-muted">Carregando campanha...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-bold text-red-400 mb-4">Erro ao carregar campanha</h2>
        <p class="text-text-muted mb-6">{{ error }}</p>
        <BaseButton variant="primary" @click="$router.push('/dashboard')">
          Voltar ao Dashboard
        </BaseButton>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="campaign">
      <!-- Header -->
      <header class="bg-surface-card border-b border-primary sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Campaign Info -->
            <div class="flex items-center space-x-4">
              <BaseButton
                variant="ghost"
                size="sm"
                @click="$router.push('/dashboard')"
              >
                ← Voltar
              </BaseButton>
              <div>
                <h1 class="text-xl font-bold text-text-primary">{{ campaign.name }}</h1>
                <p class="text-sm text-text-muted">{{ campaign.description }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-3">
              <!-- Master Tools -->
              <BaseButton
                v-if="permissions.isMaster"
                variant="primary"
                size="sm"
                @click="$router.push(`/campaign/${campaignId}/master`)"
              >
                🎛️ Dashboard do Mestre
              </BaseButton>

              <!-- Player Count -->
              <BaseBadge variant="info" size="sm">
                {{ campaign.players?.length || 0 }} Jogadores
              </BaseBadge>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column - Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Party Team -->
            <section class="bg-surface-card rounded-lg border border-border-primary p-6">
              <h2 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span>👥</span>
                Party
              </h2>
              
              <div v-if="campaign.players && campaign.players.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PlayerAvatar
                  v-for="player in campaign.players"
                  :key="player.userId"
                  :character="player.character"
                  :compact="true"
                  :editable="false"
                />
              </div>
              
              <div v-else class="text-center py-8">
                <div class="text-4xl mb-2">👥</div>
                <h3 class="text-lg font-semibold text-text-primary mb-1">Nenhum jogador ainda</h3>
                <p class="text-text-muted">Os jogadores aparecerão aqui quando entrarem na campanha</p>
              </div>
            </section>

            <!-- Map Viewer -->
            <section>
              <MapViewer
                :campaignId="campaignId"
                :isMaster="permissions.isMaster"
              />
            </section>
          </div>

          <!-- Right Column - Timeline & Media -->
          <div class="space-y-6">
            <!-- Media Player -->
            <section>
              <MediaPlayer
                :campaignId="campaignId"
                :isMaster="permissions.isMaster"
                :currentTrack="campaign.currentMusic"
              />
            </section>

            <!-- Timeline -->
            <section class="bg-surface-card rounded-lg border border-border-primary p-6">
              <Timeline
                :campaignId="campaignId"
                :canEdit="permissions.isMaster"
              />
            </section>
          </div>
        </div>
      </div>

      <!-- Quick Actions (Master Only) -->
      <div
        v-if="permissions.isMaster"
        class="fixed bottom-6 right-6 flex flex-col gap-2"
      >
        <BaseButton
          variant="primary"
          size="lg"
          class="rounded-full w-12 h-12 p-0 shadow-lg"
          @click="showQuickActions = !showQuickActions"
          title="Ações Rápidas"
        >
          ⚡
        </BaseButton>
        
        <!-- Quick Actions Menu -->
        <div
          v-if="showQuickActions"
          class="bg-surface-card border border-border-primary rounded-lg shadow-lg p-2 space-y-1 mb-2"
        >
          <BaseButton
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            @click="addTimelineEvent"
          >
            📝 Adicionar Evento
          </BaseButton>
          <BaseButton
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            @click="changeMusic"
          >
            🎵 Trocar Música
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================
// Campaign Main Page - Shared view for all users
// ============================================
import { ref, computed, onMounted } from 'vue'
import type { Campaign } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'
import PlayerAvatar from '~/components/campaign/PlayerAvatar.vue'
import MapViewer from '~/components/campaign/MapViewer.vue'
import MediaPlayer from '~/components/campaign/MediaPlayer.vue'
import Timeline from '~/components/campaign/Timeline.vue'

definePageMeta({
  layout: 'campaign'
})

const route = useRoute()
const campaignId = route.params.id as string

// State
const campaign = ref<Campaign | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showQuickActions = ref(false)

// Computed
const permissions = computed(() => {
  if (!campaign.value) {
    return {
      isMaster: false,
      isPlayer: false,
      canEdit: false,
      canDelete: false
    }
  }
  
  const { user } = useAuth()
  const isMaster = campaign.value.masterId === user.value?.id
  
  return {
    isMaster,
    isPlayer: !isMaster,
    canEdit: isMaster,
    canDelete: isMaster
  }
})

// Methods
const fetchCampaign = async () => {
  console.log('📄 INDEX.VUE: Iniciando fetchCampaign')
  loading.value = true
  error.value = null
  
  try {
    console.log('📄 INDEX.VUE: Carregando campanha no index:', campaignId)
    
    // Buscar dados reais da campanha do Supabase
    const { getCampaignById } = useCampaign()
    const campaignData = await getCampaignById(campaignId)
    
    if (campaignData) {
      // Mapear dados do Supabase para o formato esperado
      campaign.value = {
        id: campaignData.id,
        name: campaignData.name,
        description: campaignData.description,
        masterId: campaignData.master_id,
        inviteCode: campaignData.invite_code,
        players: campaignData.campaign_players || [],
        createdAt: new Date(campaignData.created_at),
        updatedAt: new Date(campaignData.updated_at),
        isPremium: campaignData.is_premium || false
      }
      
      console.log('📄 INDEX.VUE: Campanha carregada no index:', campaign.value)
    }
  } catch (err) {
    console.error('📄 INDEX.VUE: Campaign fetch error:', err)
    error.value = 'Erro ao carregar dados da campanha'
  } finally {
    loading.value = false
    console.log('📄 INDEX.VUE: fetchCampaign finalizado')
  }
}

// Quick Actions
const addTimelineEvent = () => {
  showQuickActions.value = false
  // TODO: Open add event modal
  alert('Abrir modal de adicionar evento...')
}

const changeMusic = () => {
  showQuickActions.value = false
  // TODO: Open music selector
  alert('Abrir seletor de música...')
}

// Lifecycle
onMounted(async () => {
  console.log('📄 INDEX.VUE: Página index montada!')
  console.log('📄 INDEX.VUE: Campaign ID:', campaignId)
  await fetchCampaign()
})

// SEO
useSeoMeta({
  title: `${campaign.value?.name || 'Campanha'} - Vampire RPG`,
  description: campaign.value?.description || 'Sessão de Vampire: The Masquerade'
})

// TODO: Close quick actions when clicking outside
// Will implement click outside detection later
</script>

<style scoped>
.campaign-main {
  min-height: 100vh;
}

/* Smooth transitions */
.quick-actions-enter-active,
.quick-actions-leave-active {
  transition: all 0.2s ease;
}

.quick-actions-enter-from,
.quick-actions-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>