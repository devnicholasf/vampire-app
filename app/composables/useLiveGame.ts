// ============================================
// useLiveGame - Gerenciamento de Jogos ao Vivo com Tempo Real
// ============================================

import { createClient } from '@supabase/supabase-js'
import type { NPC } from '~/types'

interface LiveGameState {
  id: string
  campaignId: string
  isLive: boolean
  currentScene?: string
  currentNpcs: any[]
  activePlayers: string[]
  timelineEvents: any[]
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
    createdAt: new Date(supabaseData.created_at),
    updatedAt: new Date(supabaseData.updated_at)
  })

  // Estados reativos
  const liveGameState = useState<LiveGameState | null>('liveGameState', () => null)
  const timelineEvents = useState<TimelineEvent[]>('timelineEvents', () => [])
  const currentNpcs = useState<NPC[]>('currentNpcs', () => [])
  const activePlayers = useState<string[]>('activePlayers', () => [])
  const isGameLive = useState<boolean>('isGameLive', () => false)
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
    if (!liveGameState.value) return

    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          is_live: false,
          active_players: []
        })
        .eq('campaign_id', campaignId)

      if (updateError) throw updateError

      // Limpar estado local
      isGameLive.value = false
      activePlayers.value = []
      if (liveGameState.value) {
        liveGameState.value.isLive = false
        liveGameState.value.activePlayers = []
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

  const addNPCToGame = async (npc: NPC, isVisible: boolean = true) => {
    if (!liveGameState.value) return

    const npcData = {
      id: npc.id,
      name: npc.name,
      photo: npc.photo,
      type: npc.type,
      isVisible
    }

    try {
      // Atualizar estado no Supabase
      const updatedNpcs = [...(liveGameState.value.currentNpcs || []), npcData]
      
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          current_npcs: updatedNpcs
        })
        .eq('id', liveGameState.value.id)

      if (updateError) throw updateError

      // Adicionar evento na timeline
      await addTimelineEvent({
        type: 'npc-appears',
        title: `${npc.name} entrou na cena`,
        description: isVisible ? 'Visível para jogadores' : 'Apenas para o mestre',
        data: npcData,
        isVisible
      })

    } catch (err: any) {
      console.error('Erro ao adicionar NPC ao jogo:', err)
      throw err
    }
  }

  const removeNPCFromGame = async (npcId: string) => {
    if (!liveGameState.value) return

    try {
      const updatedNpcs = liveGameState.value.currentNpcs.filter(npc => npc.id !== npcId)
      
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          current_npcs: updatedNpcs
        })
        .eq('id', liveGameState.value.id)

      if (updateError) throw updateError

      // Encontrar nome do NPC removido
      const removedNpc = liveGameState.value.currentNpcs.find(npc => npc.id === npcId)
      
      if (removedNpc) {
        await addTimelineEvent({
          type: 'action',
          title: `${removedNpc.name} saiu da cena`,
          isVisible: true
        })
      }

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

      // Adicionar evento na timeline
      await addTimelineEvent({
        type: 'scene-change',
        title: `Cena alterada para: ${sceneName}`,
        isVisible: true
      })

    } catch (err: any) {
      console.error('Erro ao atualizar cena:', err)
      throw err
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
          
          if (payload.eventType === 'UPDATE') {
            const newState = payload.new as SupabaseLiveGameState
            
            // Atualizar estado local
            liveGameState.value = convertSupabaseData(newState)
            isGameLive.value = newState.is_live
            currentNpcs.value = newState.current_npcs || []
            activePlayers.value = newState.active_players || []
            timelineEvents.value = newState.timeline_events || []
          }
        }
      )
      .subscribe()
  }

  // ============================================
  // Player Management
  // ============================================

  const joinGame = async (campaignId: string) => {
    if (!user.value || !liveGameState.value) return

    try {
      const currentPlayers = liveGameState.value.activePlayers || []
      if (!currentPlayers.includes(user.value.id)) {
        const updatedPlayers = [...currentPlayers, user.value.id]
        
        const { error: updateError } = await supabase
          .from('live_game_state')
          .update({
            active_players: updatedPlayers
          })
          .eq('campaign_id', campaignId)

        if (updateError) throw updateError
      }
    } catch (err: any) {
      console.error('Erro ao entrar no jogo:', err)
      throw err
    }
  }

  const leaveGame = async (campaignId: string) => {
    if (!user.value || !liveGameState.value) return

    try {
      const currentPlayers = liveGameState.value.activePlayers || []
      const updatedPlayers = currentPlayers.filter(playerId => playerId !== user.value!.id)
      
      const { error: updateError } = await supabase
        .from('live_game_state')
        .update({
          active_players: updatedPlayers
        })
        .eq('campaign_id', campaignId)

      if (updateError) throw updateError
    } catch (err: any) {
      console.error('Erro ao sair do jogo:', err)
      throw err
    }
  }

  // Limpar dados quando sair
  const clearLiveGameData = () => {
    liveGameState.value = null
    timelineEvents.value = []
    currentNpcs.value = []
    activePlayers.value = []
    isGameLive.value = false
  }

  return {
    // State
    liveGameState: readonly(liveGameState),
    timelineEvents: readonly(timelineEvents),
    currentNpcs: readonly(currentNpcs),
    activePlayers: readonly(activePlayers),
    isGameLive: readonly(isGameLive),
    loading: readonly(loading),
    error: readonly(error),

    // Game State Methods
    startLiveGame,
    stopLiveGame,

    // NPC Methods
    addNPCToGame,
    removeNPCFromGame,

    // Timeline Methods
    addTimelineEvent,
    updateCurrentScene,

    // Player Methods
    joinGame,
    leaveGame,

    // Real-time Methods
    subscribeToLiveGame,

    // Utility Methods
    clearLiveGameData
  }
}