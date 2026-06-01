// ============================================
// useDice - Composable para Sistema de Dados
// ============================================

import { ref, readonly } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#imports'
import { useAuth } from '~/composables/useAuth'
import type { DiceRollConfig, RollResult, RouseCheckResult } from '~/types/dice'
import { performRoll, performRouseCheck } from '~/components/live/dice/DiceEngine'

interface DiceRollPrivateDetailRow {
  roll_id: string
  campaign_id: string
  user_id: string
  character_id?: string | null
  character_name: string
  roll_type: string
  attribute: string
  skill: string
  pool_total: number
  hunger: number
  difficulty: number
  modifier: number
  dice_results: {
    normal?: number[]
    hunger?: number[]
  }
  successes: number
  is_critical: boolean
  is_messy_critical: boolean
  is_bestial_failure: boolean
  description?: string | null
  created_at: string
}

export const useDice = () => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)
  const { user } = useAuth()

  // Estado reativo
  const rolls = ref<RollResult[]>([])
  const isRolling = ref(false)
  const lastRollId = ref<string | null>(null)

  // Realtime channel
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null
  let privateRealtimeChannel: ReturnType<typeof supabase.channel> | null = null

  /**
   * Executa uma rolagem completa
   */
  const rollDice = async (
    campaignId: string,
    config: DiceRollConfig,
    characterName: string
  ): Promise<RollResult | null> => {
    if (!user.value) {
      console.error('Usuário não autenticado')
      return null
    }

    isRolling.value = true

    try {
      if (config.rollType === 'frenesi' && config.frenzyAutoSuccess) {
        const autoDescription = '✓ Sucesso automático de Frenesi: você gastou 1 ponto de Força de Vontade e suprimiu a Besta por 1 turno.'
        const autoSuccesses = Math.max(1, config.difficulty)

        const rollData = {
          id: crypto.randomUUID(),
          campaign_id: campaignId,
          user_id: user.value.id,
          character_id: config.characterId || null,
          character_name: characterName,
          roll_type: config.rollType,
          attribute: config.attribute,
          skill: config.skill,
          pool_total: 0,
          hunger: 0,
          difficulty: config.difficulty,
          modifier: 0,
          dice_results: {
            normal: [],
            hunger: []
          },
          successes: autoSuccesses,
          is_critical: false,
          is_messy_critical: false,
          is_bestial_failure: false,
          description: autoDescription,
          created_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('dice_rolls')
          .insert(rollData)

        if (error) {
          console.error('Erro ao salvar rolagem automática de frenesi:', error)
          throw error
        }

        const result: RollResult = {
          id: rollData.id,
          campaignId: campaignId,
          userId: user.value.id,
          characterId: rollData.character_id || undefined,
          characterName,
          rollType: config.rollType,
          attribute: config.attribute,
          skill: config.skill,
          poolTotal: 0,
          hunger: 0,
          difficulty: config.difficulty,
          modifier: 0,
          diceResults: {
            normal: [],
            hunger: []
          },
          successes: autoSuccesses,
          totalSuccesses: autoSuccesses,
          isCritical: false,
          isMessyCritical: false,
          isBestialFailure: false,
          isHidden: false,
          canViewHiddenDetails: true,
          description: autoDescription,
          createdAt: rollData.created_at
        }

        lastRollId.value = result.id
        upsertRoll(result)
        return result
      }

      // Executar rolagem usando engine
      const rollResult = performRoll(config)

      // Preparar dados para salvar no banco
      const rollId = crypto.randomUUID()
      const isHiddenRoll = config.rollType === 'oculta'
      const rollData = {
        id: rollId,
        campaign_id: campaignId,
        user_id: user.value.id,
        character_id: config.characterId || null,
        character_name: characterName,
        
        roll_type: config.rollType,
        attribute: isHiddenRoll ? 'Oculto' : config.attribute,
        skill: isHiddenRoll ? 'Teste secreto' : config.skill,
        
        pool_total: isHiddenRoll ? 1 : calculatePoolSize(config),
        hunger: isHiddenRoll ? 0 : config.hunger,
        difficulty: isHiddenRoll ? 1 : config.difficulty,
        modifier: isHiddenRoll ? 0 : config.modifier,
        
        dice_results: isHiddenRoll ? { normal: [], hunger: [] } : rollResult.diceResults,
        
        successes: isHiddenRoll ? 0 : rollResult.successes,
        
        is_critical: isHiddenRoll ? false : rollResult.isCritical,
        is_messy_critical: isHiddenRoll ? false : rollResult.isMessyCritical,
        is_bestial_failure: isHiddenRoll ? false : rollResult.isBestialFailure,
        is_hidden: isHiddenRoll,
        
        description: isHiddenRoll
          ? `${characterName} fez uma rolagem oculta.`
          : rollResult.description,
        created_at: new Date().toISOString()
      }

      const privateRollData = isHiddenRoll
        ? {
            roll_id: rollId,
            campaign_id: campaignId,
            user_id: user.value.id,
            character_id: config.characterId || null,
            character_name: characterName,
            roll_type: config.rollType,
            attribute: config.attribute,
            skill: config.skill,
            pool_total: calculatePoolSize(config),
            hunger: config.hunger,
            difficulty: config.difficulty,
            modifier: config.modifier,
            dice_results: rollResult.diceResults,
            successes: rollResult.successes,
            is_critical: rollResult.isCritical,
            is_messy_critical: rollResult.isMessyCritical,
            is_bestial_failure: rollResult.isBestialFailure,
            description: rollResult.description,
            created_at: rollData.created_at
          }
        : null

      // Salvar no banco
      const { error } = await supabase
        .from('dice_rolls')
        .insert(rollData)

      if (error) {
        console.error('Erro ao salvar rolagem:', error)
        throw error
      }

      if (privateRollData) {
        const { error: privateError } = await supabase
          .from('dice_roll_private_details')
          .insert(privateRollData)

        if (privateError) {
          console.error('Erro ao salvar detalhes privados da rolagem:', privateError)
          throw privateError
        }
      }

      // Criar objeto de resultado
      const result: RollResult = {
        id: rollData.id,
        campaignId: campaignId,
        userId: user.value.id,
        characterId: rollData.character_id || undefined,
        characterName,
        
        rollType: config.rollType,
        attribute: config.attribute,
        skill: config.skill,
        
        poolTotal: rollData.pool_total,
        hunger: config.hunger,
        difficulty: config.difficulty,
        modifier: config.modifier,
        
        diceResults: rollResult.diceResults,
        
        successes: rollResult.successes,
        totalSuccesses: rollResult.successes,
        
        isCritical: rollResult.isCritical,
        isMessyCritical: rollResult.isMessyCritical,
        isBestialFailure: rollResult.isBestialFailure,
        isHidden: isHiddenRoll,
        canViewHiddenDetails: true,
        
        description: rollResult.description,
        createdAt: rollData.created_at
      }

      lastRollId.value = result.id
      upsertRoll(result)

      return result

    } catch (error) {
      console.error('Erro ao rolar dados:', error)
      return null
    } finally {
      isRolling.value = false
    }
  }

  /**
   * Executa Teste de Despertar (Rouse Check)
   */
  const rouseCheck = async (
    campaignId: string,
    currentHunger: number,
    characterName: string
  ): Promise<RouseCheckResult | null> => {
    if (!user.value) return null

    try {
      const result = performRouseCheck(currentHunger)

      // Salvar no banco como rolagem especial
      const rollData = {
        id: crypto.randomUUID(),
        campaign_id: campaignId,
        user_id: user.value.id,
        character_name: characterName,
        
        roll_type: 'despertar',
        attribute: 'Teste de Despertar',
        skill: '',
        
        pool_total: 1,
        hunger: currentHunger,
        difficulty: 6,
        modifier: 0,
        
        dice_results: {
          normal: [result.diceValue],
          hunger: []
        },
        
        successes: result.diceValue >= 6 ? 1 : 0,
        
        is_critical: false,
        is_messy_critical: false,
        is_bestial_failure: false,
        
        description: result.hungerIncreased
          ? `🩸 Falha! Fome aumenta para ${result.newHunger}`
          : `✓ Sucesso! Fome permanece em ${result.newHunger}`,
        
        created_at: new Date().toISOString()
      }

      await supabase.from('dice_rolls').insert(rollData)

      return result

    } catch (error) {
      console.error('Erro no Rouse Check:', error)
      return null
    }
  }

  /**
   * Carrega histórico de rolagens
   */
  const loadRolls = async (campaignId: string, limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('dice_rolls')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      const baseRolls = (data || []).map(convertDbToRollResult)
      const hiddenRollIds = baseRolls.filter(roll => roll.isHidden).map(roll => roll.id)

      if (hiddenRollIds.length === 0) {
        rolls.value = baseRolls
        return
      }

      const { data: privateDetails } = await supabase
        .from('dice_roll_private_details')
        .select('*')
        .in('roll_id', hiddenRollIds)

      rolls.value = mergePrivateDetails(baseRolls, privateDetails || [])

    } catch (error) {
      console.error('Erro ao carregar rolagens:', error)
      rolls.value = []
    }
  }

  /**
   * Inicia subscrição realtime
   */
  const subscribeToRolls = (campaignId: string) => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }

    console.log('[useDice] Iniciando subscrição realtime para campanha:', campaignId)

    realtimeChannel = supabase
      .channel(`dice_rolls:${campaignId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: '' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dice_rolls',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('[useDice] Nova rolagem recebida via realtime:', payload.new)
          const newRoll = convertDbToRollResult(payload.new)
          upsertRoll(newRoll)
          console.log('[useDice] Total de rolagens agora:', rolls.value.length)
        }
      )
      .subscribe((status) => {
        console.log('[useDice] Status da subscrição:', status)
        if (status === 'SUBSCRIBED') {
          console.log('[useDice] ✓ Conectado ao canal de rolagens realtime')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[useDice] ✗ Erro ao conectar no canal de rolagens')
        }
      })

    if (privateRealtimeChannel) {
      supabase.removeChannel(privateRealtimeChannel)
    }

    privateRealtimeChannel = supabase
      .channel(`dice_roll_private_details:${campaignId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: '' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dice_roll_private_details',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('[useDice] Detalhes privados de rolagem recebidos via realtime:', payload.new)
          const privateRoll = convertPrivateDbToRollResult(payload.new as DiceRollPrivateDetailRow)
          upsertRoll(privateRoll)
        }
      )
      .subscribe()
  }

  /**
   * Remove subscrição realtime
   */
  const unsubscribeFromRolls = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
    if (privateRealtimeChannel) {
      supabase.removeChannel(privateRealtimeChannel)
      privateRealtimeChannel = null
    }
  }

  /**
   * Limpa histórico local
   */
  const clearRolls = () => {
    rolls.value = []
  }

  // Helpers
  function calculatePoolSize(config: DiceRollConfig): number {
    const hasResolvedValues = Number.isFinite(config.attributeValue) && Number.isFinite(config.skillValue)
    const basePool = hasResolvedValues
      ? Math.max(0, Number(config.attributeValue) + Number(config.skillValue))
      : 5

    return Math.max(1, basePool + config.modifier)
  }

  function convertDbToRollResult(dbRow: any): RollResult {
    return {
      id: dbRow.id,
      campaignId: dbRow.campaign_id,
      userId: dbRow.user_id,
      characterId: dbRow.character_id,
      characterName: dbRow.character_name,
      
      rollType: dbRow.roll_type,
      attribute: dbRow.attribute,
      skill: dbRow.skill,
      
      poolTotal: dbRow.pool_total,
      hunger: dbRow.hunger,
      difficulty: dbRow.difficulty,
      modifier: dbRow.modifier,
      
      diceResults: {
        normal: [...(dbRow.dice_results?.normal || [])],
        hunger: [...(dbRow.dice_results?.hunger || [])]
      },
      
      successes: dbRow.successes,
      totalSuccesses: dbRow.successes,
      
      isCritical: dbRow.is_critical,
      isMessyCritical: dbRow.is_messy_critical,
      isBestialFailure: dbRow.is_bestial_failure,
      isHidden: Boolean(dbRow.is_hidden),
      canViewHiddenDetails: !Boolean(dbRow.is_hidden),
      
      description: dbRow.description,
      createdAt: dbRow.created_at
    }
  }

  function convertPrivateDbToRollResult(dbRow: DiceRollPrivateDetailRow): RollResult {
    return {
      id: dbRow.roll_id,
      campaignId: dbRow.campaign_id,
      userId: dbRow.user_id,
      characterId: dbRow.character_id || undefined,
      characterName: dbRow.character_name,
      rollType: dbRow.roll_type,
      attribute: dbRow.attribute,
      skill: dbRow.skill,
      poolTotal: dbRow.pool_total,
      hunger: dbRow.hunger,
      difficulty: dbRow.difficulty,
      modifier: dbRow.modifier,
      diceResults: {
        normal: Array.isArray(dbRow.dice_results?.normal) ? dbRow.dice_results.normal : [],
        hunger: Array.isArray(dbRow.dice_results?.hunger) ? dbRow.dice_results.hunger : []
      },
      successes: dbRow.successes,
      totalSuccesses: dbRow.successes,
      isCritical: dbRow.is_critical,
      isMessyCritical: dbRow.is_messy_critical,
      isBestialFailure: dbRow.is_bestial_failure,
      isHidden: true,
      canViewHiddenDetails: true,
      description: dbRow.description || undefined,
      createdAt: dbRow.created_at
    }
  }

  function mergePrivateDetails(baseRolls: RollResult[], privateRows: DiceRollPrivateDetailRow[]) {
    if (privateRows.length === 0) return baseRolls

    const privateById = new Map(
      privateRows.map((row) => [row.roll_id, convertPrivateDbToRollResult(row)])
    )

    return baseRolls.map((roll) => {
      const privateRoll = privateById.get(roll.id)
      if (!privateRoll) return roll
      return {
        ...roll,
        ...privateRoll,
        isHidden: true,
        canViewHiddenDetails: true
      }
    })
  }

  function upsertRoll(incoming: RollResult) {
    const existingIndex = rolls.value.findIndex(roll => roll.id === incoming.id)

    if (existingIndex >= 0) {
      const existingRoll = rolls.value[existingIndex]
      const shouldKeepExistingHiddenDetails =
        existingRoll.isHidden &&
        existingRoll.canViewHiddenDetails &&
        incoming.isHidden &&
        !incoming.canViewHiddenDetails

      if (shouldKeepExistingHiddenDetails) {
        return
      }

      rolls.value[existingIndex] = {
        ...existingRoll,
        ...incoming,
        diceResults: incoming.diceResults || existingRoll.diceResults
      }
    } else {
      rolls.value = [incoming, ...rolls.value]
    }

    rolls.value = [...rolls.value]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 100)
  }

  return {
    // Estado
    rolls,
    isRolling: readonly(isRolling),
    lastRollId: readonly(lastRollId),

    // Métodos
    rollDice,
    rouseCheck,
    loadRolls,
    subscribeToRolls,
    unsubscribeFromRolls,
    clearRolls
  }
}
