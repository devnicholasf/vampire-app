// ============================================
// useLiveGame - Gerenciamento de Jogos ao Vivo com Tempo Real
// ============================================

import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig, useState } from '#imports'
import { readonly } from 'vue'
import { useAuth } from '~/composables/useAuth'
import type { NPC } from '~/types'

interface LiveGameState {
  id: string
  campaignId: string
  isLive: boolean
  currentScene?: string
  currentNpcs: any[]
  activePlayers: string[]
  timelineEvents: any[]
  currentImageUrl: string
  currentAudioUrl: string
  showTerritoryMap: boolean
  createdAt: Date
  updatedAt: Date
}

// Interface para dados vindos do Supabase (snake_case)
interface SupabaseLiveGameState {
  id: string
  campaign_id: string
  is_live: boolean
  current_scene?: string
  current_npcs: any[]
  active_players: string[]
  timeline_events: any[]
  current_image_url?: string
  current_audio_url?: string
  show_territory_map?: boolean
  created_at: string
  updated_at: string
}

interface TimelineEvent {
  id: string
  type: 'npc-appears' | 'scene-change' | 'action' | 'note'
  title: string
  description?: string
  data?: any
  timestamp: Date
  isVisible: boolean // Visible para players ou só para mestre
}

export const useLiveGame = () => {
  const config = useRuntimeConfig()
  const { user } = useAuth()
  const LIVE_TIMEOUT_MINUTES = 30
  
  // Criar cliente Supabase
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  // Função para converter dados do Supabase para interface local
  const convertSupabaseData = (supabaseData: SupabaseLiveGameState): LiveGameState => ({
    id: supabaseData.id,
    campaignId: supabaseData.campaign_id,
    isLive: supabaseData.is_live,
    currentScene: supabaseData.current_scene,
    currentNpcs: supabaseData.current_npcs || [],
    activePlayers: supabaseData.active_players || [],
    timelineEvents: supabaseData.timeline_events || [],
    currentImageUrl: supabaseData.current_image_url ?? '',
    currentAudioUrl: supabaseData.current_audio_url ?? '',
    showTerritoryMap: supabaseData.show_territory_map ?? false,
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at)
  })

  // Estados reativos
  const liveGameState = useState<LiveGameState | null>('liveGameState', () => null)
  const timelineEvents = useState<TimelineEvent[]>('timelineEvents', () => [])
  const currentNpcs = useState<NPC[]>('currentNpcs', () => [])
  const activePlayers = useState<string[]>('activePlayers', () => [])
  const isGameLive = useState<boolean>('isGameLive', () => false)
  const currentSceneMedia = useState<{ imageUrl: string; audioUrl: string }>('liveGame.sceneMedia', () => ({ imageUrl: '', audioUrl: '' }))
  const loading = useState<boolean>('liveGame.loading', () => false)
  const error = useState<string | null>('liveGame.error', () => null)

  // ============================================
  // Live Game State Management
  // ============================================

  const startLiveGame = async (campaignId: string) => {
    loading.value = true
    error.value = null

    try {
      // Verificar se já existe um estado de jogo ativo
      const { data: existingState, error: fetchError } = await supabase
        .from('live_game_state')
        .select('*')
        .eq('campaign_id', campaignId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // Not found é esperado se não existir
        throw fetchError
      }

      let gameState: LiveGameState

      if (existingState) {
        // Atualizar estado existente para ativo
        const { data: updatedState, error: updateError } = await supabase
          .from('live_game_state')
          .update({
            is_live: true,
            active_players: user.value ? [user.value.id] : []
          })
          .eq('id', existingState.id)
          .select()
          .single()

        if (updateError) throw updateError
        gameState = updatedState
      } else {
        // Criar novo estado de jogo
        const { data: newState, error: createError } = await supabase
          .from('live_game_state')
          .insert({
            campaign_id: campaignId,
            is_live: true,
            current_scene: 'Cena Inicial',
            current_npcs: [],
            active_players: user.value ? [user.value.id] : [],
            timeline_events: []
          })
          .select()
          .single()

        if (createError) throw createError
        gameState = newState
      }

      // Atualizar estado local
      liveGameState.value = convertSupabaseData(gameState as unknown as SupabaseLiveGameState)
      isGameLive.value = true
      activePlayers.value = (gameState as any).active_players || []
      
      return gameState

    } catch (err: any) {
      console.error('Erro ao iniciar jogo:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const stopLiveGame = async (campaignId: string) => {
    loading.value = true
    error.value = null

    try {
      // Manter NPCs na lista mas ocultar todos da tela dos jogadores
      const { data: currentState } = await supabase
        .from('live_game_state')
        .select('current_npcs')
        .eq('campaign_id', campaignId)
        .maybeSingle()

      const hiddenNpcs = (currentState?.current_npcs ?? []).map((npc: any) => ({
        ...npc,
        isVisible: false,
        isSpotlight: false,
      }))

      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          is_live: false,
          active_players: [],
          current_scene: '',
          current_npcs: hiddenNpcs,
          timeline_events: [],
        })
        .eq('campaign_id', campaignId)

      if (updateError) throw updateError

      // Atualizar estado local
      isGameLive.value = false
      currentNpcs.value = hiddenNpcs as any[]
      activePlayers.value = []
      timelineEvents.value = []
      if (liveGameState.value) {
        liveGameState.value.isLive = false
        liveGameState.value.currentScene = ''
        liveGameState.value.currentNpcs = hiddenNpcs
        liveGameState.value.activePlayers = []
        liveGameState.value.timelineEvents = []
      }

    } catch (err: any) {
      console.error('Erro ao parar jogo:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // NPCs Management em Tempo Real
  // ============================================

  const ensureLiveGameState = async (campaignId: string): Promise<LiveGameState> => {
    const { data: existingState, error: fetchError } = await supabase
      .from('live_game_state')
      .select('*')
      .eq('campaign_id', campaignId)
      .maybeSingle()

    if (fetchError) throw fetchError

    if (existingState) {
      const converted = convertSupabaseData(existingState as SupabaseLiveGameState)
      liveGameState.value = converted
      isGameLive.value = converted.isLive
      currentNpcs.value = converted.currentNpcs || []
      activePlayers.value = converted.activePlayers || []
      timelineEvents.value = converted.timelineEvents || []
      return converted
    }

    const { data: createdState, error: createError } = await supabase
      .from('live_game_state')
      .insert({
        campaign_id: campaignId,
        is_live: false,
        current_scene: '',
        current_npcs: [],
        active_players: [],
        timeline_events: []
      })
      .select()
      .single()

    if (createError) throw createError

    const converted = convertSupabaseData(createdState as SupabaseLiveGameState)
    liveGameState.value = converted
    isGameLive.value = converted.isLive
    currentNpcs.value = converted.currentNpcs || []
    activePlayers.value = converted.activePlayers || []
    timelineEvents.value = converted.timelineEvents || []
    return converted
  }

  const addNPCToGame = async (campaignId: string, npc: NPC, isVisible: boolean = true) => {
    const state = await ensureLiveGameState(campaignId)

    const npcData = {
      id: npc.id,
      name: npc.name,
      photo_url: npc.photo,
      type: npc.type,
      isVisible
    }

    try {
      // Atualizar estado no Supabase sem gerar eventos técnicos de log.
      const existingNpcs = state.currentNpcs || []
      const existingIndex = existingNpcs.findIndex((currentNpc: any) => currentNpc.id === npcData.id)
      const updatedNpcs = [...existingNpcs]

      if (existingIndex >= 0) {
        updatedNpcs[existingIndex] = { ...updatedNpcs[existingIndex], ...npcData }
      } else {
        updatedNpcs.push(npcData)
      }
      
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          current_npcs: updatedNpcs
        })
        .eq('id', state.id)

      if (updateError) throw updateError

      if (liveGameState.value) {
        liveGameState.value.currentNpcs = updatedNpcs
      }
      currentNpcs.value = updatedNpcs as NPC[]

    } catch (err: any) {
      console.error('Erro ao adicionar NPC ao jogo:', err)
      throw err
    }
  }

  const removeNPCFromGame = async (npcId: string, campaignId?: string) => {
    let state = liveGameState.value

    if (!state && campaignId) {
      const { data, error: fetchError } = await supabase
        .from('live_game_state')
        .select('*')
        .eq('campaign_id', campaignId)
        .maybeSingle()

      if (fetchError) throw fetchError
      if (!data) return

      state = convertSupabaseData(data as SupabaseLiveGameState)
      liveGameState.value = state
    }

    if (!state) return

    try {
      const updatedNpcs = (state.currentNpcs || []).filter((npc: any) => npc.id !== npcId)
      
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          current_npcs: updatedNpcs
        })
        .eq('id', state.id)

      if (updateError) throw updateError

      if (liveGameState.value) {
        liveGameState.value.currentNpcs = updatedNpcs
      }
      currentNpcs.value = updatedNpcs as NPC[]

    } catch (err: any) {
      console.error('Erro ao remover NPC do jogo:', err)
      throw err
    }
  }

  // ============================================
  // Timeline Events Management
  // ============================================

  const addTimelineEvent = async (eventData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    if (!liveGameState.value) return

    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      ...eventData
    }

    try {
      const updatedEvents = [...(liveGameState.value.timelineEvents || []), newEvent]
      
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          timeline_events: updatedEvents
        })
        .eq('id', liveGameState.value.id)

      if (updateError) throw updateError

    } catch (err: any) {
      console.error('Erro ao adicionar evento na timeline:', err)
      throw err
    }
  }

  const updateCurrentScene = async (sceneName: string) => {
    if (!liveGameState.value) return

    try {
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          current_scene: sceneName
        })
        .eq('id', liveGameState.value.id)

      if (updateError) throw updateError

      if (liveGameState.value) {
        liveGameState.value.currentScene = sceneName
      }

    } catch (err: any) {
      console.error('Erro ao atualizar cena:', err)
      throw err
    }
  }

  // ============================================
  // Fetch current state (without starting the game)
  // Used by players to check if the session is live
  // ============================================

  const fetchLiveGameState = async (campaignId: string) => {
    loading.value = true
    error.value = null
    try {
      await cleanupInactiveSessions()

      const { data, error: sbErr } = await supabase
        .from('live_game_state')
        .select('*')
        .eq('campaign_id', campaignId)
        .maybeSingle()

      if (sbErr) throw sbErr

      if (data) {
        liveGameState.value = convertSupabaseData(data as SupabaseLiveGameState)
        isGameLive.value = (data as SupabaseLiveGameState).is_live
        currentNpcs.value = (data as SupabaseLiveGameState).current_npcs || []
        activePlayers.value = (data as SupabaseLiveGameState).active_players || []
        timelineEvents.value = (data as SupabaseLiveGameState).timeline_events || []
        currentSceneMedia.value = {
          imageUrl: (data as any).current_image_url ?? '',
          audioUrl: (data as any).current_audio_url ?? '',
        }
      } else {
        isGameLive.value = false
        liveGameState.value = null
        currentNpcs.value = []
        activePlayers.value = []
        timelineEvents.value = []
      }

      return data
    } catch (err: any) {
      console.error('Erro ao buscar estado do jogo:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  const cleanupInactiveSessions = async (timeoutMinutes: number = LIVE_TIMEOUT_MINUTES) => {
    try {
      await supabase.rpc('cleanup_inactive_live_sessions', {
        timeout_minutes: timeoutMinutes,
      })
    } catch (err) {
      // Falha não-bloqueante: a sessão segue funcional mesmo sem cleanup.
      console.warn('cleanup_inactive_live_sessions não disponível ou falhou:', err)
    }
  }

  // ============================================
  // Real-time Subscriptions
  // ============================================

  const subscribeToLiveGame = (campaignId: string) => {
    return supabase
      .channel(`live_game:${campaignId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_game_state',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('Live game state changed:', payload)
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newState = payload.new as SupabaseLiveGameState
            
            // Atualizar estado local
            liveGameState.value = convertSupabaseData(newState)
            isGameLive.value = newState.is_live
            currentNpcs.value = newState.current_npcs || []
            activePlayers.value = newState.active_players || []
            timelineEvents.value = newState.timeline_events || []
            currentSceneMedia.value = {
              imageUrl: (newState as any).current_image_url ?? '',
              audioUrl: (newState as any).current_audio_url ?? '',
            }
          }
        }
      )
      .subscribe()
  }

  // ============================================
  // Player Management
  // ============================================

  const joinGame = async (campaignId: string) => {
    if (!user.value) return

    try {
      // Caminho principal: RPC SECURITY DEFINER (evita bloqueio por RLS em active_players)
      const { data: rpcPlayers, error: rpcError } = await supabase.rpc('join_live_game_presence', {
        campaign_id_param: campaignId,
      })

      if (!rpcError) {
        setActivePlayers((rpcPlayers as string[]) || [])
        return
      }

      console.warn('join_live_game_presence RPC indisponível, usando fallback legacy:', rpcError)

      // Sempre lê do banco — evita estado local desatualizado ou nulo
      const { data: state, error: fetchErr } = await supabase
        .from('live_game_state')
        .select('active_players')
        .eq('campaign_id', campaignId)
        .maybeSingle()

      if (fetchErr) throw fetchErr
      if (!state) return // Sessão não existe no banco

      const currentPlayers: string[] = state.active_players || []

      if (!currentPlayers.includes(user.value.id)) {
        const updatedPlayers = [...currentPlayers, user.value.id]

        const { error: updateError } = await supabase
          .from('live_game_state')
          .update({ active_players: updatedPlayers })
          .eq('campaign_id', campaignId)

        if (updateError) throw updateError

        // Atualiza estado local imediatamente (sem esperar realtime)
        setActivePlayers(updatedPlayers)
      } else {
        // Jogador já está na lista — garante que o estado local está correto
        setActivePlayers(currentPlayers)
      }
    } catch (err: any) {
      console.error('Erro ao entrar no jogo:', err)
      throw err
    }
  }

  const leaveGame = async (campaignId: string) => {
    if (!user.value) return

    try {
      // Caminho principal: RPC SECURITY DEFINER (evita bloqueio por RLS em active_players)
      const { data: rpcPlayers, error: rpcError } = await supabase.rpc('leave_live_game_presence', {
        campaign_id_param: campaignId,
      })

      if (!rpcError) {
        setActivePlayers((rpcPlayers as string[]) || [])
        return
      }

      console.warn('leave_live_game_presence RPC indisponível, usando fallback legacy:', rpcError)

      const currentPlayers = liveGameState.value?.activePlayers || []
      const updatedPlayers = currentPlayers.filter(playerId => playerId !== user.value!.id)
      
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          active_players: updatedPlayers
        })
        .eq('campaign_id', campaignId)

      if (updateError) throw updateError

      setActivePlayers(updatedPlayers)
    } catch (err: any) {
      console.error('Erro ao sair do jogo:', err)
      throw err
    }
  }

  // Limpar dados quando sair
  const updateSceneMedia = async (campaignId: string, imageUrl: string, audioUrl: string) => {
    try {
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          current_image_url: imageUrl,
          current_audio_url: audioUrl,
        })
        .eq('campaign_id', campaignId)

      if (updateError) throw updateError

      currentSceneMedia.value = { imageUrl, audioUrl }
      if (liveGameState.value) {
        liveGameState.value.currentImageUrl = imageUrl
        liveGameState.value.currentAudioUrl = audioUrl
      }
    } catch (err: any) {
      console.error('Erro ao atualizar mídia da cena:', err)
      throw err
    }
  }

  const clearLiveGameData = () => {
    liveGameState.value = null
    timelineEvents.value = []
    currentNpcs.value = []
    activePlayers.value = []
    isGameLive.value = false
    currentSceneMedia.value = { imageUrl: '', audioUrl: '' }
  }

  /** Atualiza a lista de jogadores ativos (chamado por páginas via realtime) */
  const setActivePlayers = (players: string[]) => {
    activePlayers.value = players
    if (liveGameState.value) {
      liveGameState.value.activePlayers = players
    }
  }

  return {
    // State
    liveGameState: readonly(liveGameState),
    timelineEvents: readonly(timelineEvents),
    currentNpcs: readonly(currentNpcs),
    activePlayers: readonly(activePlayers),
    isGameLive: readonly(isGameLive),
    currentSceneMedia: readonly(currentSceneMedia),
    loading: readonly(loading),
    error: readonly(error),

    // Game State Methods
    startLiveGame,
    stopLiveGame,
    fetchLiveGameState,

    // NPC Methods
    addNPCToGame,
    removeNPCFromGame,

    // Timeline Methods
    addTimelineEvent,
    updateCurrentScene,
    updateSceneMedia,

    // Player Methods
    joinGame,
    leaveGame,
    setActivePlayers,

    // Real-time Methods
    subscribeToLiveGame,
    cleanupInactiveSessions,

    // Utility Methods
    clearLiveGameData
  }
}