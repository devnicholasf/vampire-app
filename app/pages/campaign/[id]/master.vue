<template>
  <div class="df-master min-h-screen relative overflow-hidden">

    <!-- Header -->
    <header class="df-header sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="goBackToDashboard" class="df-btn-ghost" title="Voltar ao Dashboard">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div>
              <h1 class="df-brand-title flex items-center gap-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                {{ campaign?.name || 'Carregando...' }}
              </h1>
              <!-- Invite Code -->
              <div v-if="campaign && campaign.inviteCode" class="flex items-center gap-2 mt-1.5">
                <span class="text-xs df-text-muted">Código de convite:</span>
                <button
                  class="df-invite-code"
                  @click="copyInviteCode(campaign.inviteCode)"
                  title="Clique para copiar código de convite"
                >
                  <code class="font-mono font-bold text-red-400 text-sm">{{ campaign.inviteCode }}</code>
                  <svg class="w-3.5 h-3.5 df-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <button @click="goToLiveGame" class="df-btn-primary">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>
            Entrar no Jogo
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="localLoading || (!campaign && !error)" class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <div class="df-spinner"></div>
        <p class="df-text-muted mt-4">Carregando campanha...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <div class="max-w-md mx-auto">
        <svg class="w-16 h-16 text-red-900 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <h2 class="text-2xl font-bold text-red-400 mb-4">Erro ao carregar campanha</h2>
        <p class="df-text-muted mb-6">{{ error }}</p>
        <button @click="goBackToDashboard" class="df-btn-primary">
          Voltar ao Dashboard
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="campaign" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

      <!-- Campaign Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="df-stat-card">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>
          <div class="flex items-center gap-3 relative z-10">
            <div class="df-stat-icon">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div>
              <p class="text-xs df-text-muted uppercase tracking-wider">Jogadores</p>
              <p class="text-2xl font-bold text-white">{{ playersCount }}</p>
            </div>
          </div>
        </div>

        <div class="df-stat-card">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>
          <div class="flex items-center gap-3 relative z-10">
            <div class="df-stat-icon">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            </div>
            <div>
              <p class="text-xs df-text-muted uppercase tracking-wider">Sessões</p>
              <p class="text-2xl font-bold text-white">{{ sessionCount }}</p>
            </div>
          </div>
        </div>

        <div class="df-stat-card">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>
          <div class="flex items-center gap-3 relative z-10">
            <div class="df-stat-icon">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div>
              <p class="text-xs df-text-muted uppercase tracking-wider">Eventos</p>
              <p class="text-2xl font-bold text-white">{{ eventsCount }}</p>
            </div>
          </div>
        </div>

        <div class="df-stat-card">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>
          <div class="flex items-center gap-3 relative z-10">
            <div class="df-stat-icon">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
            </div>
            <div>
              <p class="text-xs df-text-muted uppercase tracking-wider">NPCs</p>
              <p class="text-2xl font-bold text-white">{{ npcsCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="df-tabs-nav mb-8">
        <nav class="flex">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'df-tab',
              currentTab === tab.id ? 'df-tab-active' : ''
            ]"
            @click="currentTab = tab.id"
          >
            <component :is="tab.iconComponent" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <OverviewTab
          v-if="currentTab === 'overview'"
          :campaign="campaign"
          :campaign-id="campaignId"
        />

        <PlayersTab
          v-if="currentTab === 'players'"
          :campaign="campaign"
          :campaign-id="campaignId"
          ref="playersTabRef"
          @refresh="refreshCampaignData"
        />

        <NPCsTab
          v-if="currentTab === 'npcs'"
          :campaign-id="campaignId"
          ref="npcsTabRef"
        />

        <PoliticsTab
          v-if="currentTab === 'notes'"
          :campaign-id="campaignId"
          ref="politicsTabRef"
        />

        <EventsTab
          v-if="currentTab === 'events'"
          :campaign-id="campaignId"
          :players="(campaign as any)?.players ?? []"
        />

        <SettingsTab
          v-if="currentTab === 'settings'"
          :campaign="campaign"
          :campaign-id="campaignId"
        />

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
// ============================================
// Vue imports
// ============================================
import { ref, computed, onMounted, watch, h, type FunctionalComponent } from 'vue'

// ============================================
// Nuxt imports
// ============================================
import { useRoute, useRouter, definePageMeta } from '#imports'

// ============================================
// Composable imports
// ============================================
import { useToast } from '~/composables/useToast'
import { useCampaign } from '~/composables/useCampaign'

// ============================================
// Type imports
// ============================================
import type { Campaign } from '~/types'

// ============================================
// Explicit component imports
// ============================================
import ToastContainer from '~/components/ui/ToastContainer.vue'
import PlayersTab from '~/components/campaign/master/PlayersTab.vue'
import NPCsTab from '~/components/campaign/master/NPCsTab.vue'
import PoliticsTab from '~/components/campaign/master/PoliticsTab.vue'
import SettingsTab from '~/components/campaign/master/SettingsTab.vue'
import MediaTab from '~/components/campaign/master/MediaTab.vue'
import OverviewTab from '~/components/campaign/master/OverviewTab.vue'
import EventsTab from '~/components/campaign/master/EventsTab.vue'

// ============================================
// SVG Icon Components for Tabs
// ============================================
const IconOverview: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M12 6v6l4 2' })
  ])

const IconPlayers: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' }),
    h('circle', { cx: '9', cy: '7', r: '4' }),
    h('path', { d: 'M23 21v-2a4 4 0 00-3-3.87' }),
    h('path', { d: 'M16 3.13a4 4 0 010 7.75' })
  ])

const IconNPCs: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z' })
  ])

const IconPolitics: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M2 20h20' }),
    h('path', { d: 'M5 20V10l7-6 7 6v10' }),
    h('path', { d: 'M9 20v-6h6v6' }),
    h('path', { d: 'M3 10l9-7 9 7' })
  ])

const IconSettings: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: '12', cy: '12', r: '3' }),
    h('path', { d: 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z' })
  ])

const IconMedia: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z' })
  ])

const IconEvents: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
    h('path', { d: 'M2 17l10 5 10-5' }),
    h('path', { d: 'M2 12l10 5 10-5' })
  ])

// ============================================
// Composables
// ============================================
const { success: toastSuccess, error: toastError } = useToast()
const { getCampaignById, loading, error: campaignError } = useCampaign()

// ============================================
// Page meta
// ============================================
definePageMeta({
  layout: false
})

// ============================================
// Reactive data
// ============================================
const route = useRoute()
const router = useRouter()
const campaignId = route.params.id as string

const campaign = ref<Campaign | null>(null)
const error = ref<string | null>(null)
const localLoading = ref(false)
// Persist tab via URL hash
const validTabs = ['overview', 'players', 'npcs', 'notes', 'events', 'settings', 'media']
const hashTab = route.hash?.replace('#', '')
const currentTab = ref(validTabs.includes(hashTab || '') ? hashTab! : 'overview')

watch(currentTab, (tab) => {
  router.replace({ hash: `#${tab}` })
})

// Tab refs for accessing child data
const playersTabRef = ref()
const npcsTabRef = ref()
const politicsTabRef = ref()

// Mock data for now
const sessions = ref<any[]>([])
const events = ref<any[]>([])

// ============================================
// Computed
// ============================================
const playersCount = computed(() => playersTabRef.value?.count || 0)
const sessionCount = computed(() => sessions.value.length)
const eventsCount = computed(() => events.value.length || politicsTabRef.value?.count || 0)
const npcsCount = computed(() => npcsTabRef.value?.npcs?.length || 0)

// ============================================
// Tabs configuration (SVG icon components)
// ============================================
const tabs = ref([
  { id: 'overview', label: 'Visão Geral', iconComponent: IconOverview },
  { id: 'players', label: 'Jogadores', iconComponent: IconPlayers },
  { id: 'npcs', label: 'NPCs', iconComponent: IconNPCs },
  { id: 'notes', label: 'Política', iconComponent: IconPolitics },
  { id: 'events', label: 'Eventos', iconComponent: IconEvents },
  { id: 'media', label: 'Mídia', iconComponent: IconMedia },
  { id: 'settings', label: 'Configurações', iconComponent: IconSettings },
])

// ============================================
// Methods
// ============================================
const refreshCampaignData = async () => {
  console.log('MASTER.VUE: Recarregando dados da campanha...')
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
      console.log('MASTER.VUE: Dados recarregados com sucesso')
    }
  } catch (err) {
    console.error('MASTER.VUE: Erro ao recarregar dados:', err)
  }
}

const goBackToDashboard = () => {
  router.push('/dashboard')
}

const goToLiveGame = () => {
  router.push(`/campaign/${campaignId}/live`)
}

const copyInviteCode = async (inviteCode: string) => {
  try {
    await navigator.clipboard.writeText(inviteCode)
    toastSuccess('Código copiado!', `Código ${inviteCode} copiado para a área de transferência`)
  } catch (error) {
    const textArea = document.createElement('textarea')
    textArea.value = inviteCode
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    toastSuccess('Código copiado!', `Código ${inviteCode} copiado para a área de transferência`)
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
  console.log('MASTER.VUE: Página master montada!')
  console.log('MASTER.VUE: Campaign ID:', campaignId)

  localLoading.value = true
  error.value = null

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
    }

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

  } catch (err) {
    console.error('MASTER.VUE: Error loading campaign:', err)
    error.value = 'Não foi possível carregar a campanha'
  } finally {
    localLoading.value = false
  }
})
</script>

<style scoped>
/* ======================================================
   DARK FANTASY UI – Master Dashboard
   ====================================================== */
.df-master {
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
  background-image: radial-gradient(ellipse at 20% 50%, rgba(127, 29, 29, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(220, 38, 38, 0.04) 0%, transparent 50%);
  color: var(--df-text-silver);
}

/* ─── Header ─── */
.df-header {
  background: var(--df-bg-deep);
  border-bottom: 1px solid var(--df-border-red);
  box-shadow: 0 2px 20px rgba(0,0,0,0.5), 0 1px 0 var(--df-border-silver);
}

.df-brand-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--df-accent-red);
  text-shadow: 0 0 20px var(--df-glow-red);
  letter-spacing: 0.04em;
}

/* ─── Invite Code ─── */
.df-invite-code {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--df-bg-input);
  border: 1px solid var(--df-border-red);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.df-invite-code:hover {
  border-color: var(--df-accent-red);
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.2);
}

/* ─── Section Title ─── */
.df-section-title {
  color: var(--df-accent-red);
  font-weight: 800;
  text-shadow: 0 0 16px var(--df-glow-red);
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

/* ─── Stat Cards ─── */
.df-stat-card {
  position: relative;
  background: var(--df-bg-card);
  border: 1px solid var(--df-border-red);
  box-shadow: 0 0 0 1px var(--df-border-silver), inset 0 1px 6px rgba(0,0,0,0.5);
  border-radius: 0.5rem;
  padding: 1.25rem;
  transition: all 0.2s;
}
.df-stat-card:hover {
  border-color: var(--df-accent-red);
  box-shadow: 0 0 0 1px var(--df-border-silver), 0 0 20px rgba(220, 38, 38, 0.1);
}

.df-stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, rgba(127, 29, 29, 0.3), rgba(69, 10, 10, 0.5));
  border: 1px solid var(--df-border-red);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--df-accent-red);
  flex-shrink: 0;
}

/* ─── Tabs Navigation ─── */
.df-tabs-nav {
  border-bottom: 1px solid var(--df-border-red);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.df-tabs-nav::-webkit-scrollbar { height: 0; }

.df-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b6b80;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  white-space: nowrap;
}
.df-tab:hover {
  color: var(--df-text-silver);
  border-bottom-color: var(--df-border-silver);
}
.df-tab-active {
  color: var(--df-accent-red) !important;
  border-bottom-color: var(--df-accent-red) !important;
  text-shadow: 0 0 12px var(--df-glow-red);
}

/* ─── Corner Decorations ─── */
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
}
.df-card-corner::before { width: 16px; height: 1px; }
.df-card-corner::after  { width: 1px;  height: 16px; }
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

/* ─── Text Helpers ─── */
.df-text-muted { color: #6b6b80; }
.df-text-silver { color: var(--df-text-silver); }

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

/* ─── Scrollbar ─── */
.df-master::-webkit-scrollbar { width: 6px; }
.df-master::-webkit-scrollbar-track { background: var(--df-bg-deep); }
.df-master::-webkit-scrollbar-thumb { background: var(--df-border-red); border-radius: 3px; }
.df-master::-webkit-scrollbar-thumb:hover { background: var(--df-accent-red); }
</style>