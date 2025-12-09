<template>
  <div class="min-h-screen bg-background text-text-primary">
    <!-- Header -->
    <header class="bg-surface-card border-b border-border">
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
        <div class="bg-surface-card rounded-lg p-6 border border-border">
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
        
        <div class="bg-surface-card rounded-lg p-6 border border-border">
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
        
        <div class="bg-surface-card rounded-lg p-6 border border-border">
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
        
        <div class="bg-surface-card rounded-lg p-6 border border-border">
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
      <div class="border-b border-border mb-8">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              currentTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary hover:border-text-muted'
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
        <div v-if="currentTab === 'players'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Gerenciar Jogadores</h3>
            <BaseButton variant="ghost" size="sm" @click="refreshPlayerStats">
              🔄 Atualizar
            </BaseButton>
          </div>
          
          <div class="grid gap-4">
            <div 
              v-for="player in mockPlayers" 
              :key="player.id"
              class="bg-surface-card p-4 rounded-lg border border-border"
            >
              <p class="font-medium">{{ player.name }}</p>
              <p class="text-text-muted text-sm">{{ player.email }}</p>
            </div>
          </div>
        </div>

        <!-- NPCs Tab -->
        <div v-if="currentTab === 'npcs'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">NPCs da Campanha</h3>
            <BaseButton variant="primary" size="sm" @click="createNewNPC">
              + Criar NPC
            </BaseButton>
          </div>
          
          <div class="grid gap-4">
            <div 
              v-for="npc in npcs" 
              :key="npc.id"
              class="bg-surface-card p-4 rounded-lg border border-border"
            >
              <p class="font-medium">{{ npc.name }}</p>
              <p class="text-text-muted text-sm">{{ npc.description }}</p>
            </div>
          </div>
        </div>

        <!-- Notes Tab -->
        <div v-if="currentTab === 'notes'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Anotações da Campanha</h3>
            <BaseButton variant="primary" size="sm" @click="createNewNote">
              + Nova Anotação
            </BaseButton>
          </div>
          
          <div class="space-y-4">
            <div class="bg-surface-card p-4 rounded-lg border border-border">
              <p class="text-sm text-text-muted">Nenhuma anotação criada ainda.</p>
            </div>
          </div>
        </div>

        <!-- Combat Tab -->
        <div v-if="currentTab === 'combat'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Sistema de Combate</h3>
            <div class="space-x-2">
              <BaseButton variant="ghost" size="sm" @click="resetCombat">
                🔄 Resetar
              </BaseButton>
              <BaseButton variant="primary" size="sm" @click="startCombat">
                ⚔️ Iniciar Combate
              </BaseButton>
            </div>
          </div>
          
          <div class="bg-surface-card p-4 rounded-lg border border-border">
            <p class="text-sm text-text-muted">Sistema de combate será implementado em breve.</p>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="currentTab === 'settings'" class="space-y-6">
          <h3 class="text-lg font-semibold">Configurações da Campanha</h3>
          
          <div class="bg-surface-card p-6 rounded-lg border border-border">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-text-primary mb-2">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  :value="campaign?.name"
                  class="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                  readonly
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-text-primary mb-2">
                  Descrição
                </label>
                <textarea
                  :value="campaign?.description"
                  class="w-full px-3 py-2 border border-border rounded-md bg-background text-text-primary h-32"
                  readonly
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Media Tab -->
        <div v-if="currentTab === 'media'" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Mídia da Campanha</h3>
            <BaseButton variant="primary" size="sm" @click="uploadMedia">
              📁 Upload de Arquivo
            </BaseButton>
          </div>
          
          <div class="bg-surface-card p-4 rounded-lg border border-border">
            <p class="text-sm text-text-muted">Sistema de mídia será implementado em breve.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Campaign, NPC } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'

// Define the middleware for this page
definePageMeta({
  layout: false
})

// Reactive data
const route = useRoute()
const router = useRouter()

const campaign = ref<Campaign | null>(null)
const error = ref<string | null>(null)
const currentTab = ref('players')

// Mock data for now
const sessions = ref<any[]>([])
const events = ref<any[]>([])
const npcs = ref<NPC[]>([])
const mockPlayers = ref([
  { id: '1', name: 'João Silva', email: 'joao@example.com' },
  { id: '2', name: 'Maria Santos', email: 'maria@example.com' }
])

// Computed properties
const playersCount = computed(() => mockPlayers.value.length)
const sessionCount = computed(() => sessions.value.length)
const eventsCount = computed(() => events.value.length)
const npcsCount = computed(() => npcs.value.length)

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
  router.push(`/campaign/${route.params.id}/live`)
}

const refreshPlayerStats = () => {
  console.log('Atualizando estatísticas dos jogadores...')
}

const createNewNPC = () => {
  console.log('Criando novo NPC...')
}

const createNewNote = () => {
  console.log('Criando nova anotação...')
}

const startCombat = () => {
  console.log('Iniciando combate...')
}

const resetCombat = () => {
  console.log('Resetando combate...')
}

const uploadMedia = () => {
  console.log('Fazendo upload de mídia...')
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

// Initialize campaign data
onMounted(async () => {
  try {
    const campaignId = route.params.id as string
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