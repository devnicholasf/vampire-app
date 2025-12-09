<template>
  <div class="min-h-screen bg-gradient-vampire text-text-primary">
    <!-- Header -->
    <header class="bg-surface-card border-b border-primary">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <BaseButton
              variant="ghost"
              size="sm"
              @click="goBackToDashboard"
              class="mr-4"
            >
              ← Voltar ao Dashboard
            </BaseButton>
            <h1 class="text-xl font-bold">{{ campaign?.name || 'Carregando...' }} - Dashboard do Mestre</h1>
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
    <div v-if="!campaign && !error" class="flex items-center justify-center min-h-96">
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
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          :campaign-id="campaignId"
          ref="playersTabRef"
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

        <!-- Combat Tab -->
        <CombatTab 
          v-if="currentTab === 'combat'" 
          :campaign-id="campaignId"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Campaign } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'

// Import tab components
import PlayersTab from '~/components/campaign/master/PlayersTab.vue'
import NPCsTab from '~/components/campaign/master/NPCsTab.vue'
import NotesTab from '~/components/campaign/master/NotesTab.vue'
import CombatTab from '~/components/campaign/master/CombatTab.vue'
import SettingsTab from '~/components/campaign/master/SettingsTab.vue'
import MediaTab from '~/components/campaign/master/MediaTab.vue'

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
  { id: 'combat', label: 'Combate', icon: '⚔️' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
  { id: 'media', label: 'Mídia', icon: '📁' }
])

// Mock getCampaign function
const getCampaign = async (campaignId: string): Promise<Campaign> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    id: campaignId,
    name: 'Sombras de Lisboa',
    description: 'Uma campanha de vampiro ambientada na Lisboa do século XXI, onde antigas linhagens se enfrentam.',
    masterId: 'current-user-id',
    players: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isPremium: false
  }
}

// Methods
const goBackToDashboard = () => {
  router.push('/dashboard')
}

const goToLiveGame = () => {
  router.push(`/campaign/${campaignId}/live`)
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

// Initialize campaign data
onMounted(async () => {
  try {
    campaign.value = await getCampaign(campaignId)
    
    // Mock data initialization
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
    error.value = 'Não foi possível carregar a campanha'
    console.error('Error loading campaign:', err)
  }
})
</script>