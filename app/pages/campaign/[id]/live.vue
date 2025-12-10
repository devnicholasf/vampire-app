<template>
  <div class="min-h-screen bg-surface-primary">
    <!-- Header do Live Game -->
    <div class="bg-surface-card border-b border-border px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <span class="text-red-400 font-semibold text-sm uppercase tracking-wider">AO VIVO</span>
          </div>
          <h1 class="text-xl font-cinzel font-bold text-text-primary">{{ campaign?.name }}</h1>
        </div>
        
        <div class="flex items-center gap-3">
          <BaseButton variant="secondary" size="sm" @click="togglePlayerView">
            👁️ Visão do Jogador
          </BaseButton>
          <BaseButton variant="outline" size="sm" @click="goBackToMaster">
            ⚙️ Dashboard
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Layout Principal -->
    <div class="flex h-[calc(100vh-80px)]">
      <!-- Painel Esquerdo - Controles do Mestre -->
      <div class="w-80 bg-surface-card border-r border-border p-4 overflow-y-auto">
        <div class="space-y-6">
          <!-- NPCs -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-text-primary">NPCs Ativos</h3>
              <BaseButton variant="ghost" size="sm" @click="showAddNPCModal = true">
                <span class="text-lg">+</span>
              </BaseButton>
            </div>
            <div class="space-y-2">
              <div 
                v-for="npc in activeNPCs" 
                :key="npc.id"
                class="bg-surface-primary p-3 rounded-vampire border border-border hover:border-red-500/50 transition-colors cursor-pointer"
                @click="selectNPC(npc)"
                :class="{ 'border-red-500': selectedNPC?.id === npc.id }"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-gold-500 flex items-center justify-center text-white font-semibold text-sm">
                      {{ npc.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-medium text-text-primary text-sm">{{ npc.name }}</p>
                      <p class="text-text-muted text-xs">{{ npc.type }}</p>
                    </div>
                  </div>
                  
                  <!-- Controle de visibilidade para jogadores -->
                  <div class="flex items-center gap-1">
                    <BaseButton 
                      variant="ghost" 
                      size="sm" 
                      @click.stop="toggleNPCVisibility(npc)"
                      :class="npc.visibleToPlayers ? 'text-green-400' : 'text-gray-500'"
                    >
                      {{ npc.visibleToPlayers ? '👁️' : '🙈' }}
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Música/Ambientação -->
          <div>
            <h3 class="font-semibold text-text-primary mb-3">Ambientação</h3>
            <div class="space-y-3">
              <div class="bg-surface-primary p-3 rounded-vampire border border-border">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-text-primary text-sm font-medium">Música</span>
                  <BaseButton variant="ghost" size="sm" @click="toggleMusic">
                    {{ isPlaying ? '⏸️' : '▶️' }}
                  </BaseButton>
                </div>
                <select 
                  v-model="selectedTrack" 
                  @change="changeTrack"
                  class="w-full bg-surface-card border border-border rounded px-2 py-1 text-sm text-text-primary"
                >
                  <option value="">Nenhuma música</option>
                  <option v-for="track in musicTracks" :key="track.id" :value="track.id">
                    {{ track.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Cenários/Mapas -->
          <div>
            <h3 class="font-semibold text-text-primary mb-3">Cenários</h3>
            <div class="space-y-3">
              <div class="bg-surface-primary p-3 rounded-vampire border border-border">
                <span class="text-text-primary text-sm font-medium">Mapa Ativo</span>
                <select 
                  v-model="selectedScene" 
                  @change="changeScene"
                  class="w-full mt-2 bg-surface-card border border-border rounded px-2 py-1 text-sm text-text-primary"
                >
                  <option value="">Nenhum mapa</option>
                  <option v-for="scene in scenes" :key="scene.id" :value="scene.id">
                    {{ scene.name }}
                  </option>
                </select>
              </div>
              
              <div v-if="selectedScene" class="bg-surface-primary p-3 rounded-vampire border border-border">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-text-primary text-sm font-medium">Controles</span>
                </div>
                <div class="space-y-2">
                  <BaseButton variant="ghost" size="sm" @click="addMarker" class="w-full text-xs">
                    📍 Adicionar Marcador
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="clearMarkers" class="w-full text-xs">
                    🧹 Limpar Marcadores
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline Rápida -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-text-primary">Timeline</h3>
              <BaseButton variant="ghost" size="sm" @click="addEvent">
                <span class="text-lg">+</span>
              </BaseButton>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div 
                v-for="event in recentEvents" 
                :key="event.id"
                class="bg-surface-primary p-2 rounded border border-border"
              >
                <p class="text-text-primary text-xs font-medium">{{ event.title }}</p>
                <p class="text-text-muted text-xs">{{ formatTime(event.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área Central - Mapa Compartilhado -->
      <div class="flex-1 relative">
        <div v-if="selectedScene" class="h-full bg-surface-primary">
          <MapViewer 
            :campaign-id="campaignId"
            :is-master="true"
            :initial-map="getCurrentMap()"
            @map-changed="onMapChanged"
            @marker-moved="onMarkerMoved"
            class="h-full"
          />
        </div>
        
        <div v-else class="h-full bg-surface-primary flex items-center justify-center">
          <div class="text-center text-text-muted">
            <div class="text-6xl mb-4">🗺️</div>
            <h2 class="text-xl font-semibold mb-2">Selecione um Cenário</h2>
            <p class="text-sm">Escolha um mapa no painel lateral para compartilhar com os jogadores</p>
          </div>
        </div>
        
        <!-- NPCs visíveis aos jogadores -->
        <div v-if="visibleNPCs.length > 0" class="absolute bottom-4 left-4 right-4">
          <div class="bg-surface-card/90 backdrop-blur-sm rounded-vampire border border-border p-4">
            <h4 class="text-text-primary font-semibold mb-3 text-sm">NPCs Presentes</h4>
            <div class="flex flex-wrap gap-3">
              <div 
                v-for="npc in visibleNPCs" 
                :key="npc.id"
                class="bg-surface-primary p-3 rounded-vampire border border-border hover:border-red-500/50 transition-all duration-200 cursor-pointer group"
                @click="highlightNPC(npc)"
              >
                <div class="flex items-center gap-3">
                  <!-- Avatar do NPC -->
                  <div class="relative">
                    <div v-if="npc.photo" class="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500/30">
                      <img :src="npc.photo" :alt="npc.name" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-gold-500 flex items-center justify-center text-white font-bold">
                      {{ npc.name.charAt(0).toUpperCase() }}
                    </div>
                    <!-- Indicador de status -->
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface-card"></div>
                  </div>
                  
                  <!-- Nome do NPC -->
                  <div>
                    <p class="font-medium text-text-primary text-sm group-hover:text-red-400 transition-colors">{{ npc.name }}</p>
                    <p class="text-text-muted text-xs">Presente na cena</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overlay de Informações -->
        <div v-if="selectedNPC" class="absolute top-4 right-4 w-64 bg-surface-card border border-border rounded-vampire p-4 shadow-lg">
          <h4 class="font-semibold text-text-primary mb-2">{{ selectedNPC.name }}</h4>
          <div class="space-y-2 text-sm">
            <p><span class="text-text-muted">Tipo:</span> <span class="text-text-primary">{{ selectedNPC.type }}</span></p>
            <div class="flex gap-2 mt-3">
              <BaseButton variant="outline" size="sm" @click="selectedNPC = null">Fechar</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'is-master',
  layout: false
})

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '~/components/ui/BaseButton.vue'
import MapViewer from '~/components/campaign/MapViewer.vue'

const route = useRoute()
const router = useRouter()
const campaignId = route.params.id as string

// Estado da interface
const selectedNPC = ref<any>(null)
const selectedScene = ref('')
const selectedTrack = ref('')
const isPlaying = ref(false)
const showAddNPCModal = ref(false)

// Mock data - NPCs com controle de visibilidade
const activeNPCs = ref([
  {
    id: '1',
    name: 'Vampiro Ancião',
    type: 'Antagonista',
    description: 'Um vampiro antigo e poderoso que controla parte da cidade',
    photo: '/npcs/vampire-elder.jpg',
    visibleToPlayers: false,
    details: {
      clan: 'Ventrue',
      generation: 7,
      disciplines: ['Dominação', 'Presença', 'Fortitude'],
      background: 'Ex-nobre português do século XVIII'
    }
  },
  {
    id: '2', 
    name: 'Bartender Joe',
    type: 'Informante',
    description: 'Conhece todos os segredos da cidade e está disposto a compartilhá-los... por um preço',
    photo: '/npcs/bartender.jpg',
    visibleToPlayers: true,
    details: {
      clan: 'Nosferatu',
      generation: 9,
      disciplines: ['Ofuscação', 'Animalismo'],
      background: 'Ex-detetive que foi abraçado nos anos 80'
    }
  },
  {
    id: '3',
    name: 'Madame Clarissa',
    type: 'Aliada',
    description: 'Proprietária de uma galeria de arte, conhece muitos segredos da sociedade vampíresca',
    photo: '/npcs/madame-clarissa.jpg',
    visibleToPlayers: false,
    details: {
      clan: 'Toreador',
      generation: 8,
      disciplines: ['Auspícios', 'Presença', 'Celeridade'],
      background: 'Artista renomada abraçada na Belle Époque'
    }
  }
])

// Computed - NPCs visíveis aos jogadores
const visibleNPCs = computed(() => {
  return activeNPCs.value.filter(npc => npc.visibleToPlayers)
})

// Estados
const campaign = ref({ name: 'Campanha Teste' })

const musicTracks = ref([
  { id: '1', name: 'Gothic Atmosphere', url: '/music/gothic1.mp3' },
  { id: '2', name: 'City by Night', url: '/music/city.mp3' },
  { id: '3', name: 'Vampire Court', url: '/music/court.mp3' }
])

// Mock data - Cenários/Mapas
const scenes = ref([
  { 
    id: '1', 
    name: 'Mansão Tremere', 
    imageUrl: '/maps/mansion.jpg',
    description: 'Antiga mansão gótica com segredos sombrios'
  },
  { 
    id: '2', 
    name: 'Centro da Cidade', 
    imageUrl: '/maps/downtown.jpg',
    description: 'Ruas movimentadas da metrópole noturna'
  },
  { 
    id: '3', 
    name: 'Cemitério Sombrio', 
    imageUrl: '/maps/cemetery.jpg',
    description: 'Local de descanso eterno e encontros secretos'
  },
  { 
    id: '4', 
    name: 'Bar Elysium', 
    imageUrl: '/maps/bar.jpg',
    description: 'Territorio neutro para todas as criaturas da noite'
  }
])

const recentEvents = ref([
  {
    id: '1',
    title: 'Encontro com Vampiro Ancião',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: '2',
    title: 'Investigação no Bar',
    timestamp: new Date(Date.now() - 600000)
  }
])

// Métodos
const selectNPC = (npc: any) => {
  selectedNPC.value = selectedNPC.value?.id === npc.id ? null : npc
}

const toggleMusic = () => {
  isPlaying.value = !isPlaying.value
  console.log('Música:', isPlaying.value ? 'Tocando' : 'Pausada')
}

const changeTrack = () => {
  if (selectedTrack.value) {
    isPlaying.value = true
  } else {
    isPlaying.value = false
  }
}

const addEvent = () => {
  const newEvent = {
    id: Date.now().toString(),
    title: `Evento ${recentEvents.value.length + 1}`,
    timestamp: new Date()
  }
  recentEvents.value.unshift(newEvent)
}

// Métodos - Controle de NPCs
const toggleNPCVisibility = (npc: any) => {
  npc.visibleToPlayers = !npc.visibleToPlayers
  console.log(`NPC ${npc.name} ${npc.visibleToPlayers ? 'visível' : 'oculto'} para jogadores`)
  // TODO: Sincronizar com jogadores via WebSocket
}

const highlightNPC = (npc: any) => {
  // Destacar NPC quando jogadores clicam nele
  console.log('Destacando NPC:', npc.name)
  // TODO: Adicionar efeito visual de destaque
}

// Métodos - Controle de Mapa
const getCurrentMap = () => {
  const scene = scenes.value.find(s => s.id === selectedScene.value)
  if (!scene) return null
  
  return {
    id: scene.id,
    name: scene.name,
    url: scene.imageUrl,
    type: 'regional' as const,
    description: scene.description,
    createdAt: new Date(),
    markers: []
  }
}

const changeScene = () => {
  console.log('Mapa alterado para:', selectedScene.value)
  // TODO: Sincronizar com jogadores via WebSocket
}

const addMarker = () => {
  console.log('Adicionando marcador ao mapa')
  // TODO: Implementar adição de marcador
}

const clearMarkers = () => {
  console.log('Limpando todos os marcadores')
  // TODO: Implementar limpeza de marcadores
}

const onMapChanged = (map: any) => {
  console.log('Mapa modificado:', map)
  // TODO: Sincronizar mudanças com jogadores
}

const onMarkerMoved = (marker: any) => {
  console.log('Marcador movido:', marker)
  // TODO: Sincronizar posição com jogadores
}

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const goBackToMaster = () => {
  router.push(`/campaign/${campaignId}/master`)
}

const togglePlayerView = () => {
  console.log('Toggle player view')
}

onMounted(() => {
  console.log('Live Game iniciado para campanha:', campaignId)
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>