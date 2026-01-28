// ============================================
// useCampaign - Gerenciamento de Campanhas com Supabase
// ============================================

import { createClient } from '@supabase/supabase-js'
import type { Campaign, NPC, CampaignNote, CampaignSession } from '~/types'

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
  const campaignNotes = useState<CampaignNote[]>('campaignNotes', () => [])
  const campaignSessions = useState<CampaignSession[]>('campaignSessions', () => [])
  const loading = useState<boolean>('campaign.loading', () => false)
  const error = useState<string | null>('campaign.error', () => null)

  // ============================================
  // Helper Functions
  // ============================================
  
  // Mapear dados do Supabase (snake_case) para tipos TypeScript (camelCase)
  const mapSupabaseCampaign = (supabaseCampaign: any): Campaign => {
    return {
      id: supabaseCampaign.id,
      name: supabaseCampaign.name,
      description: supabaseCampaign.description,
      masterId: supabaseCampaign.master_id,
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
      console.log('Criando campanha com dados:', {
        name: campaignData.name,
        description: campaignData.description,
        master_id: user.value.id
      })

      // Dados simples para inserção
      const insertData = {
        name: campaignData.name,
        description: campaignData.description,
        master_id: user.value.id
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
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_players(
            user_id,
            character_name,
            role,
            joined_at
          )
        `)
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      currentCampaign.value = campaign
      return campaign

    } catch (err: any) {
      console.error('Erro ao buscar campanha:', err)
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

    // NPC methods
    loadCampaignNPCs,
    createNPC,
    updateNPC,
    deleteNPC,

    // Real-time methods
    subscribeToNPCs,
    subscribeToCampaign,

    // Utility methods
    isMaster,
    isPlayer,
    clearCampaignData
  }
}
