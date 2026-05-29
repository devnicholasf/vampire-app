<template>
  <div class="min-h-screen" style="background:#080810; color:#c4c4d4;">

    <!-- ═══════════════════════════════════════════════ -->
    <!-- CARREGANDO                                     -->
    <!-- ═══════════════════════════════════════════════ -->
    <div v-if="pageLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="df-spinner"></div>
        <p class="df-text-muted mt-4">Carregando sessão...</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- AGUARDANDO SESSÃO                              -->
    <!-- ═══════════════════════════════════════════════ -->
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
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border font-semibold transition-colors"
            :class="isLeavingPage
              ? 'border-[#7f1d1d]/50 text-[#9b9bbb] bg-[#0d0d20] cursor-not-allowed opacity-80'
              : 'border-[#7f1d1d] text-[#c4c4d4] bg-[#0d0d20] hover:text-white hover:border-[#b91c1c] hover:bg-[#1a0a0a]'"
            :disabled="isLeavingPage"
            @click="goBack"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            {{ isLeavingPage ? 'Saindo...' : 'Sair' }}
          </button>
        </div>
      </div>

      <!-- Layout principal: 3 colunas -->
      <div class="flex" style="height:calc(100vh - 57px);">

        <!-- ── Sidebar Esquerda: Coterie (jogadores) ── -->
        <div
          class="flex flex-col items-center pt-5 pb-4 gap-3 shrink-0 border-r border-[#2d1515] overflow-y-auto"
          style="width:88px; background:#080810;"
        >
          <!-- Avatares da Coterie (sem AO VIVO redundante) -->
          <CoterieAvatars
            :players="coteriePlayers"
            :active-players="(activePlayers as string[])"
            mode="vertical"
          />

          <!-- Botão da Ficha (fixo no final da coluna) -->
          <div class="mt-auto pt-6">
            <button
              class="group flex flex-col items-center gap-1.5 text-[#d4a647] hover:text-[#ffe7a3] transition-colors"
              title="Abrir ficha do personagem"
              @click="openPlayerSheet"
            >
              <span
                class="w-11 h-11 rounded-lg border flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                style="
                  border-color:#b91c1c;
                  background:linear-gradient(160deg,#1a0a0a 0%,#2a0d0d 45%,#0d0d20 100%);
                  box-shadow:0 0 14px rgba(185,28,28,0.45), inset 0 0 12px rgba(212,166,71,0.18);
                "
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="8" y1="13" x2="16" y2="13"/>
                  <line x1="8" y1="17" x2="13" y2="17"/>
                  <line x1="8" y1="9" x2="10" y2="9"/>
                </svg>
              </span>
              <span class="text-[9px] uppercase tracking-[0.12em] font-semibold text-[#fca5a5] group-hover:text-[#ffe7a3]">Ficha</span>
            </button>
          </div>
        </div>

        <!-- Coluna Central: Conteúdo principal -->
        <div class="flex-1 flex flex-col items-center justify-start px-6 py-8 gap-8 overflow-y-auto">

        <!-- -- Cena Atual -- -->
        <div v-if="currentScene" class="text-center">
          <p class="text-[11px] uppercase tracking-[0.25em] text-[#6b6b7b] mb-1">Cena</p>
          <h2 class="text-2xl font-bold text-white">{{ currentScene }}</h2>
        </div>
        <div v-else class="text-center">
          <p class="text-sm text-[#4a4a5a]">Aguardando o Mestre definir a cena...</p>
        </div>

        <!-- -- Imagem da Cena -- -->
        <div v-if="currentImageUrl" class="w-full max-w-3xl rounded-xl overflow-hidden border border-[#7f1d1d]"
             style="box-shadow:0 4px 32px rgba(127,29,29,0.35)">
          <img :src="currentImageUrl" alt="Imagem da cena" style="width:100%;object-fit:contain;max-height:65vh;display:block;">
        </div>

        <!-- ── Player de Áudio Escondido (Sincronizado com o Mestre) ── -->
        <audio
          v-if="currentAudioUrl"
          ref="audioPlayerRef"
          :src="currentAudioUrl"
          preload="auto"
          style="display:none;"
          @loadeddata="syncAudioPlayer"
          @canplay="syncAudioPlayer"
        ></audio>

        <!-- ── NPCs visíveis ── -->
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
                  v-if="npc.photo_url"
                  :src="npc.photo_url"
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

          <!-- Indicador se há mais que 3 visíveis -->
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

        <!-- -- Mapa de Territórios -- -->
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
        
        <!-- Coluna Direita: Sistema de Dados -->
        <div class="w-96 border-l border-[#2d1515] shrink-0 flex flex-col" style="background:#0a0a1a">
          <DiceFeed 
            :rolls="rolls"
            :character-avatars="playerCharacterAvatars"
            @open-roll-modal="showDiceRollModal = true"
          />
        </div>
        
      </div>
      
      <!-- Modal de Rolagem de Dados -->
      <DiceRollModal 
        v-model="showDiceRollModal"
        :current-hunger="currentHunger"
        :attribute-values="attributeValuesForDice"
        :skill-values="skillValuesForDice"
        :auto-calculate-pool="true"
        @roll="handleDiceRoll"
      />

      <!-- Modal da Ficha do Jogador -->
      <PlayerSheet
        v-if="showPlayerSheet && myCharacter"
        :key="playerSheetKey"
        :player="myCharacter"
        :campaign-id="campaignId"
        :canEdit="true"
        @close="closePlayerSheet"
        @save="savePlayerSheetFromLive"
      />

      <BaseToast
        :message="toastMessage"
        title="Ficha do Personagem"
        :variant="toastVariant"
        :show="showToast"
        @dismiss="hideToast"
        class="fixed top-4 right-4 z-[10000]"
      />
      
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, definePageMeta, useRuntimeConfig, navigateTo } from '#imports'
import { useLiveGame } from '~/composables/useLiveGame'
import { useDice } from '~/composables/useDice'
import { useCampaign } from '~/composables/useCampaign'
import { useAuth } from '~/composables/useAuth'
import { createClient } from '@supabase/supabase-js'
import PlayerSheet from '~/components/campaign/PlayerSheet.vue'
import BaseToast from '~/components/ui/BaseToast.vue'
import TerritoryMapViewer from '~/components/campaign/TerritoryMapViewer.vue'
import DiceFeed from '~/components/live/dice/DiceFeed.vue'
import DiceRollModal from '~/components/live/dice/DiceRollModal.vue'
import CoterieAvatars from '~/components/live/CoterieAvatars.vue'
import type { DiceRollConfig } from '~/types/dice'
import type { CoteriePlayer } from '~/components/live/CoterieAvatars.vue'

definePageMeta({
  middleware: 'is-player',
  layout: false
})

const route      = useRoute()
const router     = useRouter()
const campaignId = route.params.id as string
const config     = useRuntimeConfig()
const supabase   = createClient(config.public.supabaseUrl, config.public.supabaseKey)

const { isGameLive, fetchLiveGameState, joinGame, leaveGame, activePlayers, setActivePlayers } = useLiveGame()
const { user } = useAuth()
const { rolls, rollDice, loadRolls, subscribeToRolls, unsubscribeFromRolls } = useDice()
const { savePlayerSheet } = useCampaign()

// ── State ──────────────────────────────────────────
const campaignName    = ref('')
const playerCharacterName = ref('')
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
// Audio sync state
const currentAudioPlaying = ref(false)
const currentAudioTime    = ref(0)
const currentAudioVolume  = ref(2)
// Dice system state
const showDiceRollModal = ref(false)
const currentHunger     = ref(1)
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null
let playerSheetChannel: ReturnType<typeof supabase.channel> | null = null
let isDiceRolling = false
const isLeavingPage    = ref(false)
const coteriePlayers   = ref<CoteriePlayer[]>([])
const myCharacter      = ref<any>(null)
const showPlayerSheet  = ref(false)
const playerSheetKey   = ref(0)
const showToast        = ref(false)
const toastMessage     = ref('')
const toastVariant     = ref<'success' | 'error' | 'warning' | 'info'>('success')

// ── Computed ───────────────────────────────────────────────
const isLiveActive     = computed(() => isGameLive.value)
const visibleNPCs   = computed(() => liveNpcs.value.filter(n => n.isVisible))
const displayNPCs   = computed(() => visibleNPCs.value.slice(0, 3))

const playerCharacterAvatars = computed<Record<string, string>>(() => {
  const avatarsByName: Record<string, string> = {}

  const addAvatar = (name: string | null | undefined, avatarUrl: string | null | undefined) => {
    const normalizedName = String(name || '').trim()
    const normalizedAvatar = String(avatarUrl || '').trim()
    if (!normalizedName || !normalizedAvatar) return
    avatarsByName[normalizedName] = normalizedAvatar
  }

  for (const player of coteriePlayers.value) {
    const avatar = player?.sheet?.avatar
    addAvatar(player?.character_name, avatar)
    addAvatar(player?.sheet?.name, avatar)
  }

  addAvatar(myCharacter.value?.character_name, myCharacter.value?.sheet?.avatar)
  addAvatar(myCharacter.value?.sheet?.name, myCharacter.value?.sheet?.avatar)

  return avatarsByName
})

const attributeValuesForDice = computed<Record<string, number>>(() => {
  const attrs = myCharacter.value?.sheet?.attributes || {}
  const physical = attrs.physical || {}
  const social = attrs.social || {}
  const mental = attrs.mental || {}

  return {
    'Força': Number(physical.strength ?? 0),
    'Destreza': Number(physical.dexterity ?? 0),
    'Vigor': Number(physical.stamina ?? 0),
    'Carisma': Number(social.charisma ?? 0),
    'Manipulação': Number(social.manipulation ?? 0),
    // O sistema atual usa "Aparência" no modal, enquanto a ficha usa "Autocontrole".
    'Aparência': Number(social.composure ?? 0),
    // A ficha V5 não tem atributo "Percepção"; usamos Determinação como aproximação.
    'Percepção': Number(mental.resolve ?? 0),
    'Inteligência': Number(mental.intelligence ?? 0),
    'Raciocínio': Number(mental.wits ?? 0)
  }
})

const skillValuesForDice = computed<Record<string, number>>(() => {
  const sheetSkills = myCharacter.value?.sheet?.skills || {}
  const talents = sheetSkills.talents || {}
  const skills = sheetSkills.skills || {}
  const knowledges = sheetSkills.knowledges || {}
  const virtues = myCharacter.value?.sheet?.virtues || {}

  return {
    'Persuasão': Number(skills.persuasion ?? 0),
    'Briga': Number(talents.brawl ?? 0),
    'Etiqueta': Number(skills.etiquette ?? 0),
    'Intimidação': Number(skills.intimidation ?? 0),
    'Investigação': Number(knowledges.investigation ?? 0),
    'Armas de Fogo': Number(talents.firearms ?? 0),
    'Liderança': Number(skills.leadership ?? 0),
    'Subterfúgio': Number(skills.subterfuge ?? 0),
    'Armas Brancas': Number(talents.melee ?? 0),
    'Atletismo': Number(talents.athletics ?? 0),
    'Furtividade': Number(talents.stealth ?? 0),
    'Sobrevivência': Number(talents.survival ?? 0),
    'Condução': Number(talents.drive ?? 0),
    'Acadêmico': Number(knowledges.academics ?? 0),
    'Ciências': Number(knowledges.science ?? 0),
    'Finanças': Number(knowledges.finance ?? 0),
    'Medicina': Number(knowledges.medicine ?? 0),
    'Ocultismo': Number(knowledges.occult ?? 0),
    'Tecnologia': Number(knowledges.technology ?? 0),
    'Consciência': Number(virtues.conscience ?? 0),
    'Manha': Number(skills.streetwise ?? 0),
    'Empatia': Number(skills.animalKen ?? 0),
    'Intuição': Number(skills.awareness ?? 0),
    'Performance': Number(skills.performance ?? 0)
  }
})

const syncHungerFromSheet = () => {
  const hunger = Number(myCharacter.value?.sheet?.hunger ?? 1)
  currentHunger.value = Math.max(0, Math.min(5, hunger))
}

// ── Load ───────────────────────────────────────────
const loadState = async () => {
  const { data: campaign } = await supabase
    .from('campaigns')
    .select(`
      name,
      politics,
      campaign_players(
        user_id,
        character_name,
        sheet,
        role
      )
    `)
    .eq('id', campaignId)
    .maybeSingle()

  if (campaign) {
    campaignName.value = campaign.name
    if (campaign.politics) {
      territoryZones.value = campaign.politics.territoryZones || []
      territoryMapUrl.value = campaign.politics.territoryMapImage || ''
    }
    // Popula coterie (todos os jogadores, exceto o próprio mestre)
    const rawPlayers: any[] = (campaign as any).campaign_players ?? []
    coteriePlayers.value = rawPlayers
      .filter((p: any) => p.role !== 'master')
      .map((p: any) => ({
        user_id: p.user_id,
        character_name: p.character_name ?? null,
        sheet: p.sheet ?? null,
        role: p.role ?? 'player',
      }))

    const currentPlayer = rawPlayers.find((p: any) => p.user_id === user.value?.id)
    if (currentPlayer) {
      myCharacter.value = {
        user_id: currentPlayer.user_id,
        character_name: currentPlayer.character_name,
        name: currentPlayer.character_name,
        sheet: currentPlayer.sheet || null,
        role: currentPlayer.role,
      }
      syncHungerFromSheet()
    }
  }

  const state = await fetchLiveGameState(campaignId)
  if (state) {
    currentScene.value    = (state as any).current_scene ?? ''
    liveNpcs.value        = (state as any).current_npcs ?? []
    currentImageUrl.value = (state as any).current_image_url ?? ''
    currentAudioUrl.value = (state as any).current_audio_url ?? ''
    showTerritoryMap.value = (state as any).show_territory_map ?? false
    currentAudioPlaying.value = (state as any).current_audio_playing ?? false
    currentAudioTime.value = (state as any).current_audio_time ?? 0
    currentAudioVolume.value = (state as any).current_audio_volume ?? 2
  }
}

const loadPlayerCharacterName = async () => {
  if (!user.value?.id) return

  try {
    const { data: player, error } = await supabase
      .from('campaign_players')
      .select('character_name, sheet')
      .eq('campaign_id', campaignId)
      .eq('user_id', user.value.id)
      .maybeSingle()

    if (error) throw error

    const sheetName = String((player as any)?.sheet?.name ?? '').trim()
    const characterName = String((player as any)?.character_name ?? '').trim()

    playerCharacterName.value = sheetName || characterName
  } catch (error) {
    console.error('Erro ao carregar nome do personagem para rolagem:', error)
    playerCharacterName.value = ''
  }
}

const applyState = (data: any) => {
  if (!data) return
  currentScene.value    = data.current_scene ?? ''
  liveNpcs.value        = data.current_npcs ?? []
  currentImageUrl.value = data.current_image_url ?? ''
  showTerritoryMap.value = data.show_territory_map ?? false

  // Sincroniza jogadores ativos (para CoterieAvatars)
  if (Array.isArray(data.active_players)) {
    setActivePlayers(data.active_players)
  }
  
  const newAudio        = data.current_audio_url ?? ''
  if (newAudio !== currentAudioUrl.value) {
    currentAudioUrl.value = newAudio
  }
  
  // Sincronizar estado do áudio
  const isPlaying = data.current_audio_playing ?? false
  const audioTime = data.current_audio_time ?? 0
  const audioVolume = data.current_audio_volume ?? 2
  
  currentAudioPlaying.value = isPlaying
  currentAudioTime.value = audioTime
  currentAudioVolume.value = audioVolume
  
  // Aplicar estado ao player
  syncAudioPlayer()
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
          if (!(payload.new as any).is_live) {
            router.push(`/campaign/${campaignId}/player`)
          }
        }
      }
    )
    .subscribe()
}

const startPlayerSheetRealtime = () => {
  if (!user.value?.id) return

  playerSheetChannel = supabase
    .channel(`live_player_sheet:${campaignId}:${user.value.id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'campaign_players', filter: `user_id=eq.${user.value.id}` },
      (payload) => {
        const row = payload.new as any
        if (row?.campaign_id !== campaignId) return

        if (!myCharacter.value) {
          myCharacter.value = {
            user_id: row.user_id,
            character_name: row.character_name,
            name: row.character_name,
            sheet: row.sheet || null,
            role: row.role,
          }
        } else {
          myCharacter.value = {
            ...myCharacter.value,
            character_name: row.character_name,
            name: row.character_name,
            sheet: row.sheet || myCharacter.value.sheet,
            role: row.role ?? myCharacter.value.role,
          }
        }

        syncHungerFromSheet()
      }
    )
    .subscribe()
}
// -- Sync audio player with master's control --------------
const syncAudioPlayer = async () => {
  await nextTick()
  const audio = audioPlayerRef.value
  if (!audio) return
  
  // Sincronizar volume PRIMEIRO (antes de qualquer outra coisa)
  const targetVolume = currentAudioVolume.value / 100
  audio.volume = targetVolume
  console.log(`🔊 Volume sincronizado: ${Math.round(targetVolume * 100)}%`)
  
  // Sincronizar tempo (com tolerância de 0.3 segundo)
  const timeDiff = Math.abs(audio.currentTime - currentAudioTime.value)
  if (timeDiff > 0.3) {
    audio.currentTime = currentAudioTime.value
  }
  
  // Sincronizar play/pause
  if (currentAudioPlaying.value && audio.paused) {
    const playNow = async () => {
      try {
        await audio.play()
        console.log('▶️ Áudio reproduzindo')
      } catch (e) {
        console.log('Autoplay bloqueado pelo navegador')
      }
    }

    if (audio.readyState >= 2) {
      await playNow()
    } else {
      const handleCanPlay = async () => {
        audio.removeEventListener('canplay', handleCanPlay)
        await playNow()
      }
      audio.addEventListener('canplay', handleCanPlay)
      audio.load()
    }
  } else if (!currentAudioPlaying.value && !audio.paused) {
    audio.pause()
    console.log('⏸️ Áudio pausado')
  }
}

// Watch para mudanças no áudio (sincronização imediata)
watch(currentAudioUrl, async (newUrl) => {
  if (!newUrl) return
  await nextTick()
  syncAudioPlayer()
})

watch([currentAudioPlaying, currentAudioTime, currentAudioVolume], () => {
  syncAudioPlayer()
}, { flush: 'sync' }) // Executa sincronamente para zero delay


// ── Navigation ─────────────────────────────────────
const goBack = async () => {
  if (isLeavingPage.value) return
  isLeavingPage.value = true

  try {
    await leaveGame(campaignId)
  } catch (error) {
    console.error('Erro ao sair da partida ao vivo:', error)
  } finally {
    unsubscribeFromRolls()
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
    await navigateTo(`/campaign/${campaignId}/player`)
  }
}

const openPlayerSheet = () => {
  if (!myCharacter.value) return
  showPlayerSheet.value = true
}

const closePlayerSheet = async () => {
  showPlayerSheet.value = false
  await loadState()
  playerSheetKey.value++
}

const savePlayerSheetFromLive = async (updatedPlayer: any) => {
  if (!user.value?.id) return

  try {
    await savePlayerSheet(campaignId, user.value.id, updatedPlayer.sheet)
    showPlayerSheet.value = false
    await loadState()
    playerSheetKey.value++

    toastMessage.value = 'Ficha salva com sucesso.'
    toastVariant.value = 'success'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 4000)
  } catch (error) {
    console.error('Erro ao salvar ficha no live-player:', error)
    toastMessage.value = 'Erro ao salvar ficha. Tente novamente.'
    toastVariant.value = 'error'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 4000)
  }
}

const hideToast = () => {
  showToast.value = false
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

// ── Lifecycle ──────────────────────────────────────
// -- Dice System --------------------------------------------------
const handleDiceRoll = async (config: DiceRollConfig) => {
  if (isDiceRolling) return
  isDiceRolling = true
  
  try {
    const fallbackName = user.value?.username || user.value?.email?.split('@')[0] || 'Jogador'
    const characterName = playerCharacterName.value || fallbackName
    await rollDice(campaignId, config, characterName)
    showDiceRollModal.value = false
    
    // TODO: Mostrar toast de sucesso
  } catch (error) {
    console.error('Erro ao rolar dados:', error)
  } finally {
    isDiceRolling = false
  }
}

onMounted(async () => {
  await loadPlayerCharacterName()
  await loadState()
  
  // Adicionar jogador à lista de ativos quando entrar na sessão
  if (isGameLive.value && user.value) {
    try {
      await joinGame(campaignId)
    } catch (e) {
      console.error('Erro ao entrar no jogo:', e)
    }
  }
  
  // Carregar rolagens de dados e subscrever
  try {
    await loadRolls(campaignId)
    subscribeToRolls(campaignId)
  } catch (e) {
    console.error('Erro ao carregar sistema de dados:', e)
  }
  
  startRealtime()
  startPlayerSheetRealtime()
  
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
  
  // Desinscrever do sistema de dados
  unsubscribeFromRolls()
  
  if (process.client) {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
  
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
  if (playerSheetChannel) supabase.removeChannel(playerSheetChannel)
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
/* -- Spinner padrão do sistema -- */
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
