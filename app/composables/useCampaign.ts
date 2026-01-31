// ============================================
// useCampaign - Gerenciamento de Campanhas com Supabase
// ============================================

import { createClient } from '@supabase/supabase-js'
import type { Campaign, NPC } from '~/types'

export const useCampaign = () => {
  const config = useRuntimeConfig()
  const { user } = useAuth()
  
  // Criar cliente Supabase
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  // Estados reativos
  const campaigns = useState<Campaign[]>('campaigns', () => [])
  const currentCampaign = useState<Campaign | null>('currentCampaign', () => null)
  const campaignNPCs = useState<NPC[]>('campaignNPCs', () => [])
  const campaignNotes = useState<any[]>('campaignNotes', () => [])
  const campaignSessions = useState<any[]>('campaignSessions', () => [])
  const loading = useState<boolean>('campaign.loading', () => false)
  const error = useState<string | null>('campaign.error', () => null)

  // ============================================
  // Helper Functions
  // ============================================
  
  // Gerar código de convite único
  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  // Mapear dados do Supabase (snake_case) para tipos TypeScript (camelCase)
  const mapSupabaseCampaign = (supabaseCampaign: any): Campaign => {
    return {
      id: supabaseCampaign.id,
      name: supabaseCampaign.name,
      description: supabaseCampaign.description,
      masterId: supabaseCampaign.master_id,
      inviteCode: supabaseCampaign.invite_code,
      players: [], // TODO: mapear campaign_players quando necessário
      createdAt: new Date(supabaseCampaign.created_at),
      updatedAt: new Date(supabaseCampaign.updated_at),
      isPremium: supabaseCampaign.is_premium || false
    }
  }

  // ============================================
  // Campaigns CRUD Operations
  // ============================================
  
  const loadCampaigns = async () => {
    if (!user.value) return
    
    loading.value = true
    error.value = null

    try {
      console.log('Carregando campanhas para usuário:', user.value.id)
      
      // Buscar campanhas onde é mestre
      const { data: masterCampaigns, error: masterError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('master_id', user.value.id)
        .order('created_at', { ascending: false })

      if (masterError) {
        console.error('Erro ao buscar campanhas como mestre:', masterError)
        throw new Error(`Erro ao carregar campanhas: ${masterError.message}`)
      }

      // Buscar campanhas onde é jogador
      const { data: playerCampaigns, error: playerError } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_players!inner(user_id)
        `)
        .eq('campaign_players.user_id', user.value.id)
        .order('created_at', { ascending: false })

      if (playerError) {
        console.error('Erro ao buscar campanhas como jogador:', playerError)
        // Não falhar se der erro nas campanhas como jogador
        console.warn('Continuando apenas com campanhas como mestre')
      }

      // Combinar as campanhas (mestre + jogador)
      const allCampaigns = [
        ...(masterCampaigns || []).map(mapSupabaseCampaign),
        ...(playerCampaigns || []).map(mapSupabaseCampaign)
      ]

      // Remover duplicatas (caso existam)
      const uniqueCampaigns = allCampaigns.filter((campaign, index, arr) => 
        arr.findIndex(c => c.id === campaign.id) === index
      )

      campaigns.value = uniqueCampaigns
      console.log('Campanhas carregadas:', {
        master: masterCampaigns?.length || 0,
        player: playerCampaigns?.length || 0,
        total: uniqueCampaigns.length
      })
      
      return campaigns.value

    } catch (err: any) {
      console.error('Erro ao carregar campanhas:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const createCampaign = async (campaignData: {
    name: string
    description: string
  }) => {
    if (!user.value) throw new Error('Usuário não autenticado')

    loading.value = true
    error.value = null

    try {
      // Gerar código de convite único
      let inviteCode = generateInviteCode()
      let attempts = 0
      const maxAttempts = 10
      
      // Verificar se o código já existe e gerar outro se necessário
      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('campaigns')
          .select('id')
          .eq('invite_code', inviteCode)
          .single()
        
        if (!existing) break
        
        inviteCode = generateInviteCode()
        attempts++
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Não foi possível gerar um código único. Tente novamente.')
      }

      console.log('Criando campanha com dados:', {
        name: campaignData.name,
        description: campaignData.description,
        master_id: user.value.id,
        invite_code: inviteCode
      })

      // Dados para inserção
      const insertData = {
        name: campaignData.name,
        description: campaignData.description,
        master_id: user.value.id,
        invite_code: inviteCode
      }

      console.log('Dados para inserção:', insertData)

      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert(insertData)
        .select()
        .single()

      console.log('Resposta do Supabase:', { campaign, campaignError })

      if (campaignError) {
        console.error('Erro do Supabase:', campaignError)
        throw new Error(`Erro ao criar campanha: ${campaignError.message}`)
      }

      if (!campaign) {
        throw new Error('Campanha foi criada mas não retornou dados')
      }

      // Mapear e adicionar à lista local
      const mappedCampaign = mapSupabaseCampaign(campaign)
      campaigns.value.push(mappedCampaign)
      console.log('Campanha criada com sucesso:', mappedCampaign)
      
      return mappedCampaign

    } catch (err: any) {
      console.error('Erro completo ao criar campanha:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCampaignById = async (campaignId: string) => {
    loading.value = true
    error.value = null

    try {
      // Buscar campanha COM campaign_players E seus sheets
      let { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_players(
            user_id,
            character_name,
            sheet,
            role,
            joined_at
          )
        `)
        .eq('id', campaignId)
        .single()

      if (campaignError) {
        console.error('Erro do Supabase:', campaignError)
        throw campaignError
      }

      if (!campaign) {
        throw new Error('Campanha não encontrada')
      }

      currentCampaign.value = campaign
      return campaign

    } catch (err: any) {
      console.error('Erro ao buscar campanha:', err)
      error.value = err.message || 'Erro ao carregar campanha'
      throw err
    } finally {
      loading.value = false
    }
  }

  const findCampaignByInviteCode = async (inviteCode: string) => {
    loading.value = true
    error.value = null

    try {
      console.log('Buscando campanha por código de convite:', inviteCode)

      // Usa RPC function que bypassa RLS para buscar por código de convite
      const { data: campaigns, error: campaignError } = await supabase
        .rpc('find_campaign_by_invite_code', { 
          invite_code_param: inviteCode.toUpperCase() 
        })

      if (campaignError) {
        throw new Error(`Erro ao buscar campanha: ${campaignError.message}`)
      }

      if (!campaigns || campaigns.length === 0) {
        throw new Error('Código de convite não encontrado')
      }

      const campaign = campaigns[0]
      const mappedCampaign = mapSupabaseCampaign(campaign)
      console.log('Campanha encontrada:', mappedCampaign)
      
      return mappedCampaign

    } catch (err: any) {
      console.error('Erro ao buscar campanha por código:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const joinCampaignByInviteCode = async (inviteCode: string, characterName: string) => {
    if (!user.value) throw new Error('Usuário não autenticado')

    loading.value = true
    error.value = null

    try {
      console.log('Entrando na campanha com código:', inviteCode, 'como:', characterName)

      // Primeiro, encontrar a campanha
      const campaign = await findCampaignByInviteCode(inviteCode)
      
      // Verificar se já está na campanha
      const { data: existingPlayer, error: checkError } = await supabase
        .from('campaign_players')
        .select('*')
        .eq('user_id', user.value.id)
        .eq('campaign_id', campaign.id)
        .single()

      if (existingPlayer) {
        throw new Error('Você já faz parte desta campanha')
      }

      // Entrar na campanha
      const { data: player, error: joinError } = await supabase
        .from('campaign_players')
        .insert({
          user_id: user.value.id,
          campaign_id: campaign.id,
          character_name: characterName,
          role: 'player',
          joined_at: new Date().toISOString()
        })
        .select()
        .single()

      if (joinError) {
        console.error('Erro ao entrar na campanha:', joinError)
        throw new Error(`Erro ao entrar na campanha: ${joinError.message}`)
      }

      console.log('Entrou na campanha com sucesso:', player)
      
      // Recarregar campanhas para incluir a nova
      await loadCampaigns()
      
      return {
        campaign,
        player: {
          id: player.user_id,
          name: player.character_name,
          role: player.role,
          joinedAt: new Date(player.joined_at)
        }
      }

    } catch (err: any) {
      console.error('Erro ao entrar na campanha:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!user.value) throw new Error('Usuário não autenticado')

    loading.value = true
    error.value = null

    try {
      console.log('Deletando campanha:', campaignId)

      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('master_id', user.value.id) // Garantir que só pode deletar próprias campanhas

      if (deleteError) {
        console.error('Erro do Supabase ao deletar:', deleteError)
        throw new Error(`Erro ao deletar campanha: ${deleteError.message}`)
      }

      // Remover da lista local
      campaigns.value = campaigns.value.filter(c => c.id !== campaignId)
      
      console.log('Campanha deletada com sucesso:', campaignId)
      return true

    } catch (err: any) {
      console.error('Erro completo ao deletar campanha:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const removePlayerFromCampaign = async (campaignId: string, userId: string) => {
    if (!user.value) throw new Error('Usuário não autenticado')

    loading.value = true
    error.value = null

    try {
      console.log('Removendo jogador da campanha:', { campaignId, userId })

      // Deletar o registro do jogador na tabela campaign_players
      const { error: deleteError } = await supabase
        .from('campaign_players')
        .delete()
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Erro do Supabase ao remover jogador:', deleteError)
        throw new Error(`Erro ao remover jogador: ${deleteError.message}`)
      }

      console.log('Jogador removido com sucesso')
      
      // Recarregar a campanha para atualizar a lista de jogadores
      await getCampaignById(campaignId)
      
      return true

    } catch (err: any) {
      console.error('Erro ao remover jogador:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // NPCs Management
  // ============================================

  const loadCampaignNPCs = async (campaignId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data: npcs, error: npcsError } = await supabase
        .from('npcs')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })

      if (npcsError) throw npcsError

      campaignNPCs.value = npcs || []
      return campaignNPCs.value

    } catch (err: any) {
      console.error('Erro ao carregar NPCs:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const createNPC = async (npcData: Omit<NPC, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      const { data: npc, error: npcError } = await supabase
        .from('npcs')
        .insert({
          campaign_id: npcData.campaignId,
          name: npcData.name,
          type: npcData.type,
          clan: npcData.clan,
          generation: npcData.generation,
          bio: npcData.bio,
          key_points: npcData.keyPoints,
          photo_url: npcData.photo
        })
        .select()
        .single()

      if (npcError) throw npcError

      // Adicionar à lista local
      const formattedNPC: NPC = {
        id: npc.id,
        campaignId: npc.campaign_id,
        name: npc.name,
        type: npc.type,
        clan: npc.clan,
        generation: npc.generation,
        bio: npc.bio,
        keyPoints: npc.key_points || [],
        photo: npc.photo_url,
        createdAt: new Date(npc.created_at),
        updatedAt: new Date(npc.updated_at)
      }
      
      campaignNPCs.value.push(formattedNPC)
      return formattedNPC

    } catch (err: any) {
      console.error('Erro ao criar NPC:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateNPC = async (npcId: string, npcData: Partial<NPC>) => {
    loading.value = true
    error.value = null

    try {
      const updateData: any = {}
      
      if (npcData.name) updateData.name = npcData.name
      if (npcData.type) updateData.type = npcData.type
      if (npcData.clan) updateData.clan = npcData.clan
      if (npcData.generation) updateData.generation = npcData.generation
      if (npcData.bio) updateData.bio = npcData.bio
      if (npcData.keyPoints) updateData.key_points = npcData.keyPoints
      if (npcData.photo) updateData.photo_url = npcData.photo

      const { data: npc, error: npcError } = await supabase
        .from('npcs')
        .update(updateData)
        .eq('id', npcId)
        .select()
        .single()

      if (npcError) throw npcError

      // Atualizar na lista local
      const index = campaignNPCs.value.findIndex(n => n.id === npcId)
      if (index !== -1) {
        const formattedNPC: NPC = {
          id: npc.id,
          campaignId: npc.campaign_id,
          name: npc.name,
          type: npc.type,
          clan: npc.clan,
          generation: npc.generation,
          bio: npc.bio,
          keyPoints: npc.key_points || [],
          photo: npc.photo_url,
          createdAt: new Date(npc.created_at),
          updatedAt: new Date(npc.updated_at)
        }
        campaignNPCs.value[index] = formattedNPC
      }

      return npc

    } catch (err: any) {
      console.error('Erro ao atualizar NPC:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteNPC = async (npcId: string) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('npcs')
        .delete()
        .eq('id', npcId)

      if (deleteError) throw deleteError

      // Remover da lista local
      campaignNPCs.value = campaignNPCs.value.filter(n => n.id !== npcId)

    } catch (err: any) {
      console.error('Erro ao deletar NPC:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Real-time Subscriptions
  // ============================================

  const subscribeToNPCs = (campaignId: string) => {
    return supabase
      .channel(`npcs:campaign_id=eq.${campaignId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'npcs',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('NPC changed:', payload)
          
          switch (payload.eventType) {
            case 'INSERT':
              const newNPC: NPC = {
                id: payload.new.id,
                campaignId: payload.new.campaign_id,
                name: payload.new.name,
                type: payload.new.type,
                clan: payload.new.clan,
                generation: payload.new.generation,
                bio: payload.new.bio,
                keyPoints: payload.new.key_points || [],
                photo: payload.new.photo_url,
                createdAt: new Date(payload.new.created_at),
                updatedAt: new Date(payload.new.updated_at)
              }
              campaignNPCs.value.push(newNPC)
              break
            case 'UPDATE':
              const updateIndex = campaignNPCs.value.findIndex(n => n.id === payload.new.id)
              if (updateIndex !== -1) {
                const updatedNPC: NPC = {
                  id: payload.new.id,
                  campaignId: payload.new.campaign_id,
                  name: payload.new.name,
                  type: payload.new.type,
                  clan: payload.new.clan,
                  generation: payload.new.generation,
                  bio: payload.new.bio,
                  keyPoints: payload.new.key_points || [],
                  photo: payload.new.photo_url,
                  createdAt: new Date(payload.new.created_at),
                  updatedAt: new Date(payload.new.updated_at)
                }
                campaignNPCs.value[updateIndex] = updatedNPC
              }
              break
            case 'DELETE':
              campaignNPCs.value = campaignNPCs.value.filter(n => n.id !== payload.old.id)
              break
          }
        }
      )
      .subscribe()
  }

  const subscribeToCampaign = (campaignId: string) => {
    return supabase
      .channel(`campaign:${campaignId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'campaigns',
          filter: `id=eq.${campaignId}`
        },
        (payload) => {
          console.log('Campaign changed:', payload)
          if (payload.eventType === 'UPDATE') {
            currentCampaign.value = payload.new as Campaign
          }
        }
      )
      .subscribe()
  }

  // ============================================
  // Utility Functions
  // ============================================

  const isMaster = (campaign: Campaign) => {
    return user.value && campaign.masterId === user.value.id
  }

  const isPlayer = (campaign: Campaign) => {
    return user.value && campaign.players?.some((p: any) => p.user_id === user.value!.id)
  }

  // ============================================
  // Player Sheet Management
  // ============================================

  const savePlayerSheet = async (campaignId: string, userId: string, sheetData: any) => {
    loading.value = true
    error.value = null

    try {
      const { data: player, error: updateError } = await supabase
        .from('campaign_players')
        .update({
          sheet: sheetData,
          character_name: sheetData.name || null
        })
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao salvar ficha:', updateError)
        throw new Error(`Erro ao salvar ficha: ${updateError.message}`)
      }

      return player

    } catch (err: any) {
      console.error('Erro ao salvar ficha do jogador:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadPlayerSheet = async (campaignId: string, userId: string) => {
    loading.value = true
    error.value = null

    try {
      console.log('Carregando ficha do jogador:', { campaignId, userId })

      const { data: player, error: loadError } = await supabase
        .from('campaign_players')
        .select('sheet, character_name')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .single()

      if (loadError) {
        console.error('Erro ao carregar ficha:', loadError)
        throw new Error(`Erro ao carregar ficha: ${loadError.message}`)
      }

      console.log('Ficha carregada:', player)
      return player

    } catch (err: any) {
      console.error('Erro ao carregar ficha do jogador:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const subscribeToPlayerSheets = (campaignId: string) => {
    return supabase
      .channel(`campaign_players:campaign_id=eq.${campaignId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'campaign_players',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('Player sheet changed:', payload)
          // Pode disparar evento para atualizar UI em tempo real
        }
      )
      .subscribe()
  }

  // Limpar dados quando sair
  const clearCampaignData = () => {
    currentCampaign.value = null
    campaignNPCs.value = []
    campaignNotes.value = []
    campaignSessions.value = []
  }

  return {
    // State
    campaigns: readonly(campaigns),
    currentCampaign: readonly(currentCampaign),
    campaignNPCs: readonly(campaignNPCs),
    campaignNotes: readonly(campaignNotes),
    campaignSessions: readonly(campaignSessions),
    loading: readonly(loading),
    error: readonly(error),

    // Campaign methods
    loadCampaigns,
    createCampaign,
    deleteCampaign,
    getCampaignById,
    findCampaignByInviteCode,
    joinCampaignByInviteCode,
    removePlayerFromCampaign,

    // NPC methods
    loadCampaignNPCs,
    createNPC,
    updateNPC,
    deleteNPC,

    // Player Sheet methods
    savePlayerSheet,
    loadPlayerSheet,
    subscribeToPlayerSheets,

    // Real-time methods
    subscribeToNPCs,
    subscribeToCampaign,

    // Utility methods
    isMaster,
    isPlayer,
    clearCampaignData
  }
}
