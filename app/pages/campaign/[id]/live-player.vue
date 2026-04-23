<template>
  <div class="min-h-screen" style="background:#080810; color:#c4c4d4;">

    <!-- ═══════════════════════════════════════════════ -->
    <!-- AGUARDANDO SESSÃO                              -->
    <!-- ═══════════════════════════════════════════════ -->
    <div v-if="!isLiveActive" class="flex flex-col items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-lg text-center space-y-8">
        <div class="flex items-center justify-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-red-900/60"/>
          <svg class="w-10 h-10 text-red-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/>
          </svg>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-red-900/60"/>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-red-800 mb-2">Vampiro: A Máscara V5</p>
          <h1 class="text-3xl font-bold text-white mb-1">{{ campaignName || 'Carregando...' }}</h1>
          <p class="text-sm text-[#6b6b7b]">Aguardando o Mestre iniciar a sessão...</p>
        </div>

        <div class="relative border border-[#7f1d1d] rounded-lg p-6"
             style="background:#0a0a1a; box-shadow: 0 0 0 1px #4a4a5a;">
          <span class="lc lc-tl"/><span class="lc lc-tr"/>
          <span class="lc lc-bl"/><span class="lc lc-br"/>
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full bg-[#4a4a5a] shrink-0"/>
            <p class="text-sm font-medium text-[#4a4a5a] uppercase tracking-wider">Sessão Inativa</p>
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

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SESSÃO ATIVA — visão do jogador                -->
    <!-- ═══════════════════════════════════════════════ -->
    <template v-else>

      <!-- Header -->
      <div style="background:#0a0a1a; border-bottom:1px solid #2d1515;" class="px-6 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"/>
              <span class="text-red-400 font-semibold text-xs uppercase tracking-widest">Ao Vivo</span>
            </div>
            <h1 class="text-lg font-bold text-white">{{ campaignName }}</h1>
          </div>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-[#4a4a5a]/40 text-[#6b6b7b] hover:text-white hover:border-[#6b6b7b] transition-colors"
            @click="goBack"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Sair do Jogo
          </button>
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div class="flex items-start justify-center min-h-[calc(100vh-65px)] p-8 gap-8">

        <!-- Área central: cena + NPCs visíveis -->
        <div class="flex-1 max-w-2xl flex flex-col items-center gap-6 text-center">

          <!-- Spotlight NPC -->
          <div
            v-if="spotlightNPC"
            class="w-full rounded-xl border border-[#7f1d1d] p-4"
            style="background:rgba(10,10,26,0.85)"
          >
            <div class="flex flex-col items-center gap-3">
              <img
                v-if="spotlightNPC.photo"
                :src="spotlightNPC.photo"
                :alt="spotlightNPC.name"
                class="w-full max-h-[360px] object-contain rounded-lg border border-[#4a4a5a]"
              >
              <div v-else class="w-full h-52 rounded-lg border border-[#4a4a5a] flex items-center justify-center text-[#6b6b7b] text-sm">
                Sem retrato disponível
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ spotlightNPC.name }}</h3>
                <p v-if="spotlightNPC.type" class="text-xs text-[#6b6b7b]">{{ spotlightNPC.type }}</p>
              </div>
            </div>
          </div>

          <!-- Decoração quando sem spotlight -->
          <svg v-else class="w-20 h-20 text-red-900/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>

          <!-- Cena atual -->
          <div>
            <h2 class="text-xl font-bold text-white mb-2">
              {{ currentScene || 'Aguardando o Mestre...' }}
            </h2>
            <p class="text-sm text-[#4a4a5a] max-w-sm">
              Acompanhe o que o Mestre revela na sessão ao vivo.
            </p>
          </div>

          <!-- NPCs visíveis -->
          <div
            v-if="visibleNPCs.length > 0"
            class="w-full border-t border-[#2d1515] pt-4"
          >
            <p class="text-xs text-[#4a4a5a] uppercase tracking-wider mb-3">Personagens em Cena</p>
            <div class="flex flex-wrap gap-2 justify-center">
              <div
                v-for="npc in visibleNPCs"
                :key="npc.id"
                class="flex items-center gap-2 rounded border border-green-900/40 px-3 py-1.5 text-xs"
                style="background:rgba(21,128,61,0.08)"
              >
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style="background:linear-gradient(135deg,#7f1d1d,#d4a647)"
                >
                  {{ npc.name.charAt(0) }}
                </span>
                <span class="text-green-400 font-medium">{{ npc.name }}</span>
                <span v-if="npc.type" class="text-[#4a4a5a]">{{ npc.type }}</span>
              </div>
            </div>
          </div>

          <p v-else class="text-sm text-[#4a4a5a]">Nenhum personagem em cena no momento.</p>
        </div>

      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, definePageMeta, useRuntimeConfig } from '#imports'
import { useAuth } from '~/composables/useAuth'
import { useLiveGame } from '~/composables/useLiveGame'
import { createClient } from '@supabase/supabase-js'

definePageMeta({
  middleware: 'is-player',
  layout: false
})

const route      = useRoute()
const router     = useRouter()
const campaignId = route.params.id as string
const config     = useRuntimeConfig()
const supabase   = createClient(config.public.supabaseUrl, config.public.supabaseKey)

const { user } = useAuth()
const { isGameLive, fetchLiveGameState, subscribeToLiveGame } = useLiveGame()

// ── State ──────────────────────────────────────────
const campaignName = ref('')
const currentScene = ref('')
const liveNpcs     = ref<any[]>([])

let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

// ── Computed ───────────────────────────────────────
// Only show what the master explicitly made visible (green eye)
const isLiveActive  = computed(() => isGameLive.value)
const visibleNPCs   = computed(() => liveNpcs.value.filter(n => n.isVisible))
const spotlightNPC  = computed(() => visibleNPCs.value.find(n => n.isSpotlight) ?? null)

// ── Load ───────────────────────────────────────────
const loadState = async () => {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name')
    .eq('id', campaignId)
    .maybeSingle()

  if (campaign) campaignName.value = campaign.name

  const state = await fetchLiveGameState(campaignId)
  if (state) {
    currentScene.value = (state as any).current_scene ?? ''
    liveNpcs.value     = (state as any).current_npcs ?? []
  }
}

const applyState = (data: any) => {
  if (!data) return
  currentScene.value = data.current_scene ?? ''
  liveNpcs.value     = data.current_npcs ?? []
}

// ── Realtime ───────────────────────────────────────
const startRealtime = () => {
  realtimeChannel = supabase
    .channel(`live_player:${campaignId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'live_game_state', filter: `campaign_id=eq.${campaignId}` },
      (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          applyState(payload.new)
          // Sync isGameLive from realtime
          if (!(payload.new as any).is_live) {
            // Session ended — go back
            router.push(`/campaign/${campaignId}/player`)
          }
        }
      }
    )
    .subscribe()
}

// ── Navigation ─────────────────────────────────────
const goBack = () => router.push(`/campaign/${campaignId}/player`)

// ── Lifecycle ──────────────────────────────────────
onMounted(async () => {
  await loadState()
  startRealtime()
})

onBeforeUnmount(() => {
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
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
</style>
