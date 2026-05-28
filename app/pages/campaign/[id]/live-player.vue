<template>
  <div class="min-h-screen" style="background:#080810; color:#c4c4d4;">

    <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
    <!-- CARREGANDO                                     -->
    <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
    <div v-if="pageLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="df-spinner"></div>
        <p class="df-text-muted mt-4">Carregando sessão...</p>
      </div>
    </div>

    <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
    <!-- AGUARDANDO SESSÃƒO                              -->
    <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
    <div v-else-if="!isLiveActive" class="flex flex-col items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-lg text-center space-y-8">
        <div class="flex items-center justify-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-red-900/60"/>
          <svg class="w-10 h-10 text-red-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/>
          </svg>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-red-900/60"/>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-red-800 mb-2">Vampiro: A MÃ¡scara V5</p>
          <h1 class="text-3xl font-bold text-white mb-1">{{ campaignName || 'Carregando...' }}</h1>
          <p class="text-sm text-[#6b6b7b]">Aguardando o Mestre iniciar a sessÃ£o...</p>
        </div>

        <div class="relative border border-[#7f1d1d] rounded-lg p-6"
             style="background:#0a0a1a; box-shadow: 0 0 0 1px #4a4a5a;">
          <span class="lc lc-tl"/><span class="lc lc-tr"/>
          <span class="lc lc-bl"/><span class="lc lc-br"/>
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-[#4a4a5a] shrink-0"/>
            <p class="text-sm font-medium text-[#4a4a5a] uppercase tracking-wider">SessÃ£o Inativa</p>
          </div>
        </div>

        <button
          class="flex items-center gap-2 mx-auto px-5 py-3 rounded border border-[#4a4a5a]/50 text-[#6b6b7b] text-sm hover:text-white hover:border-[#6b6b7b] transition-colors"
          @click="goBack"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar
        </button>
      </div>
    </div>

    <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
    <!-- SESSÃƒO ATIVA â€” visÃ£o do jogador                -->
    <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
    <template v-else>

      <!-- Header -->
      <div style="background:#0a0a1a; border-bottom:1px solid #2d1515;" class="px-6 py-3 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500" style="animation:pulse 2s ease-in-out infinite"/>
              <span class="text-red-400 font-semibold text-xs uppercase tracking-widest">Ao Vivo</span>
            </div>
            <h1 class="text-base font-bold text-white">{{ campaignName }}</h1>
          </div>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-[#4a4a5a]/40 text-[#6b6b7b] hover:text-white hover:border-[#6b6b7b] transition-colors"
            @click="goBack"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Sair
          </button>
        </div>
      </div>

      <!-- ConteÃºdo principal -->
      <div class="flex flex-col items-center justify-start min-h-[calc(100vh-57px)] px-6 py-8 gap-8">

        <!-- ── Cena Atual ── -->
        <div v-if="currentScene" class="text-center">
          <p class="text-[11px] uppercase tracking-[0.25em] text-[#6b6b7b] mb-1">Cena</p>
          <h2 class="text-2xl font-bold text-white">{{ currentScene }}</h2>
        </div>
        <div v-else class="text-center">
          <p class="text-sm text-[#4a4a5a]">Aguardando o Mestre definir a cena...</p>
        </div>

        <!-- ── Imagem da Cena ── -->
        <div v-if="currentImageUrl" class="w-full max-w-3xl rounded-xl overflow-hidden border border-[#7f1d1d]"
             style="box-shadow:0 4px 32px rgba(127,29,29,0.35)">
          <img :src="currentImageUrl" alt="Imagem da cena" style="width:100%;object-fit:contain;max-height:65vh;display:block;">
        </div>

        <!-- ── Música da Cena ── -->
        <div v-if="currentAudioUrl" class="w-full max-w-xl rounded-lg border border-[#2d1515] px-4 py-3"
             style="background:#0a0a1a">
          <p class="text-[10px] uppercase tracking-[0.25em] text-[#6b6b7b] mb-2">Música da Cena</p>
          <audio
            ref="audioPlayerRef"
            controls
            :src="currentAudioUrl"
            class="w-full"
            style="color-scheme:dark;accent-color:#d4a647;"
          ></audio>
        </div>

        <!-- â”€â”€ NPCs visÃ­veis â”€â”€ -->
        <div v-if="displayNPCs.length > 0" class="w-full max-w-4xl">

          <!-- Grid adaptativo: 1, 2 ou 3 colunas -->
          <div
            class="grid gap-4"
            :class="{
              'grid-cols-1 max-w-sm mx-auto': displayNPCs.length === 1,
              'grid-cols-2 max-w-xl mx-auto': displayNPCs.length === 2,
              'grid-cols-3':                  displayNPCs.length >= 3,
            }"
          >
            <div
              v-for="npc in displayNPCs"
              :key="npc.id"
              class="flex flex-col rounded-xl border border-[#7f1d1d] overflow-hidden"
              style="background:rgba(10,10,26,0.9)"
            >
              <!-- Foto -->
              <div class="w-full overflow-hidden h-[380px]">
                <img
                  v-if="npc.photo"
                  :src="npc.photo"
                  :alt="npc.name"
                  class="w-full h-full object-cover object-top"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                  style="background:linear-gradient(135deg,#1a0a0a,#0d0d20)"
                >
                  <span class="text-4xl font-bold text-white/20">{{ npc.name.charAt(0) }}</span>
                </div>
              </div>

              <!-- Nome + tipo -->
              <div class="px-3 py-2 text-center">
                <p class="font-semibold text-white text-sm leading-tight">{{ npc.name }}</p>
                <p v-if="npc.type" class="text-xs text-[#6b6b7b] mt-0.5">{{ npc.type }}</p>
              </div>
            </div>
          </div>

          <!-- Indicador se hÃ¡ mais que 3 visÃ­veis -->
          <p v-if="visibleNPCs.length > 3" class="text-center text-xs text-[#4a4a5a] mt-3">
            +{{ visibleNPCs.length - 3 }} personagem{{ visibleNPCs.length - 3 > 1 ? 's' : '' }} na cena
          </p>
        </div>

        <div v-else class="flex flex-col items-center gap-3 text-center">
          <svg class="w-16 h-16 text-red-900/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          <p class="text-sm text-[#4a4a5a]">Nenhum personagem em cena no momento.</p>
        </div>

        <!-- ── Mapa de Territórios ── -->
        <div v-if="showTerritoryMap && territoryZones.length > 0" class="w-full max-w-5xl">
          <div class="mb-4">
            <h3 class="text-center text-base font-semibold text-[#d4a647] mb-1">🗺️ Mapa de Territórios</h3>
            <p class="text-center text-xs text-[#6b6b7b]">Mapa político da cidade compartilhado pelo Mestre</p>
          </div>
          
          <TerritoryMapViewer
            :territories="territoryZones"
            :map-image-url="territoryMapUrl"
          />
        </div>

      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, definePageMeta, useRuntimeConfig } from '#imports'
import { useLiveGame } from '~/composables/useLiveGame'
import { createClient } from '@supabase/supabase-js'
import TerritoryMapViewer from '~/components/campaign/TerritoryMapViewer.vue'

definePageMeta({
  middleware: 'is-player',
  layout: false
})

const route      = useRoute()
const router     = useRouter()
const campaignId = route.params.id as string
const config     = useRuntimeConfig()
const supabase   = createClient(config.public.supabaseUrl, config.public.supabaseKey)

const { isGameLive, fetchLiveGameState, joinGame, leaveGame } = useLiveGame()
const { user } = useAuth()

// â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const campaignName    = ref('')
const currentScene    = ref('')
const liveNpcs        = ref<any[]>([])
const currentImageUrl = ref('')
const currentAudioUrl = ref('')
const audioPlayerRef  = ref<HTMLAudioElement | null>(null)
const pageLoading     = ref(true)
// Territory map state
const showTerritoryMap = ref(false)
const territoryZones   = ref<any[]>([])
const territoryMapUrl  = ref('')
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

// â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const isLiveActive  = computed(() => isGameLive.value)
const visibleNPCs   = computed(() => liveNpcs.value.filter(n => n.isVisible))
const displayNPCs   = computed(() => visibleNPCs.value.slice(0, 3))

// â”€â”€ Load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const loadState = async () => {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name, politics')
    .eq('id', campaignId)
    .maybeSingle()

  if (campaign) {
    campaignName.value = campaign.name
    if (campaign.politics) {
      territoryZones.value = campaign.politics.territoryZones || []
      territoryMapUrl.value = campaign.politics.territoryMapImage || ''
    }
  }

  const state = await fetchLiveGameState(campaignId)
  if (state) {
    currentScene.value    = (state as any).current_scene ?? ''
    liveNpcs.value        = (state as any).current_npcs ?? []
    currentImageUrl.value = (state as any).current_image_url ?? ''
    currentAudioUrl.value = (state as any).current_audio_url ?? ''
    showTerritoryMap.value = (state as any).show_territory_map ?? false
  }
}

const applyState = (data: any) => {
  if (!data) return
  currentScene.value    = data.current_scene ?? ''
  liveNpcs.value        = data.current_npcs ?? []
  currentImageUrl.value = data.current_image_url ?? ''
  showTerritoryMap.value = data.show_territory_map ?? false
  const newAudio        = data.current_audio_url ?? ''
  if (newAudio !== currentAudioUrl.value) {
    currentAudioUrl.value = newAudio
  }
}

// â”€â”€ Realtime â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const startRealtime = () => {
  realtimeChannel = supabase
    .channel(`live_player:${campaignId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'live_game_state', filter: `campaign_id=eq.${campaignId}` },
      (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          applyState(payload.new)
          if (!(payload.new as any).is_live) {
            router.push(`/campaign/${campaignId}/player`)
          }
        }
      }
    )
    .subscribe()
}
// ── Autoplay audio when master changes track ──────────────
watch(currentAudioUrl, async (newUrl) => {
  if (!newUrl) return
  await nextTick()
  if (audioPlayerRef.value) {
    try { await audioPlayerRef.value.play() } catch (_) { /* autoplay blocked */ }
  }
})


// â”€â”€ Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const goBack = async () => {
  await leaveGame(campaignId)
  router.push(`/campaign/${campaignId}/player`)
}

// Remove player from active list when closing page/logging out
const handleBeforeUnload = () => {
  if (!user.value) return
  
  // Chamada síncrona para remover jogador da lista de ativos
  const leaveGameSync = async () => {
    try {
      const { data: state } = await supabase
        .from('live_game_state')
        .select('active_players')
        .eq('campaign_id', campaignId)
        .maybeSingle()
      
      if (state) {
        const currentPlayers = state.active_players || []
        const updatedPlayers = currentPlayers.filter((id: string) => id !== user.value!.id)
        
        await supabase
          .from('live_game_state')
          .update({ active_players: updatedPlayers })
          .eq('campaign_id', campaignId)
      }
    } catch (e) {
      console.error('Erro ao sair do jogo:', e)
    }
  }
  
  leaveGameSync()
}

// â”€â”€ Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
onMounted(async () => {
  await loadState()
  
  // Adicionar jogador à lista de ativos quando entrar na sessão
  if (isGameLive.value && user.value) {
    try {
      await joinGame(campaignId)
    } catch (e) {
      console.error('Erro ao entrar no jogo:', e)
    }
  }
  
  startRealtime()
  
  // Adicionar listener para fechar página
  if (process.client) {
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
  
  pageLoading.value = false
})

onBeforeUnmount(async () => {
  // Remover jogador da lista ao sair da página
  if (user.value) {
    await leaveGame(campaignId)
  }
  
  if (process.client) {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
  
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
.lc {
  position: absolute;
  width: 12px;
  height: 12px;
  pointer-events: none;
  z-index: 2;
}
.lc::before, .lc::after {
  content: '';
  position: absolute;
  background: #dc2626;
}
.lc::before { width: 12px; height: 1px; }
.lc::after  { width: 1px; height: 12px; }
.lc-tl { top: -1px; left: -1px; }
.lc-tr { top: -1px; right: -1px; }
.lc-tr::before { right: 0; }
.lc-tr::after  { right: 0; }
.lc-bl { bottom: -1px; left: -1px; }
.lc-bl::before { bottom: 0; }
.lc-bl::after  { bottom: 0; }
.lc-br { bottom: -1px; right: -1px; }
.lc-br::before { right: 0; bottom: 0; }
.lc-br::after  { right: 0; bottom: 0; }
@keyframes spin  { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
/* ── Spinner padrão do sistema ── */
.df-spinner {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 2px solid #7f1d1d;
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.df-text-muted {
  color: #6b6b7b;
  font-size: 0.8rem;
}
</style>
