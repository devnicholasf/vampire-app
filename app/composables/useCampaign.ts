// ============================================
// useCampaign - Gerenciamento de Campanhas com Supabase
// ============================================

import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig, useState } from '#imports'
import { useAuth } from '~/composables/useAuth'
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

      // Ficha padrão com 1 ponto em todos os atributos/habilidades
      const defaultSheet = {
        name: characterName,
        concept: '',
        clan: '',
        generation: 13,
        sect: '',
        haven: '',
        player: '',
        avatar: '',
        resonance: '',
        chronicleTenets: '',
        touchstonesConvictions: [],
        clanBane: '',
        advantages: [{ name: '', level: 0 }],
        bloodPotency: 0,
        bloodSurge: '+2',
        powerBonus: '0',
        feedingPenalty: 'Sem Penalidade',
        baneSeverity: '0',
        xpTotal: 0,
        xpSpent: 0,
        embraceGeneration: '',
        appearance: '',
        distinguishingFeatures: '',
        history: '',
        attributes: {
          physical: { strength: 1, dexterity: 1, stamina: 1 },
          social: { charisma: 1, manipulation: 1, appearance: 1 },
          mental: { perception: 1, intelligence: 1, wits: 1 }
        },
        skills: {
          talents: { melee: 1, firearms: 1, athletics: 1, brawl: 1, drive: 1, stealth: 1, larceny: 1, craft: 1, survival: 1 },
          skills: { animalKen: 1, etiquette: 1, intimidation: 1, leadership: 1, streetwise: 1, performance: 1, persuasion: 1, awareness: 1, subterfuge: 1 },
          knowledges: { science: 1, academics: 1, finance: 1, investigation: 1, medicine: 1, occult: 1, perception: 1, politics: 1, technology: 1 }
        },
        disciplines: [{ name: '', level: 0 }],
        virtues: { conscience: 1, selfControl: 1, courage: 1 },
        humanity: 1,
        willpower: 1,
        vitality: 1,
        hunger: 1,
        conditions: [''],
        notes: ''
      }

      // Entrar na campanha com ficha padrão
      const { data: player, error: joinError } = await supabase
        .from('campaign_players')
        .insert({
          user_id: user.value.id,
          campaign_id: campaign.id,
          character_name: characterName,
          role: 'player',
          joined_at: new Date().toISOString(),
          sheet: defaultSheet
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

      // Limpar arquivos de mídia da campanha no Storage para evitar lixo órfão.
      const { data: mediaFiles, error: listError } = await supabase.storage
        .from('campaign-media')
        .list(campaignId, { limit: 1000, sortBy: { column: 'name', order: 'asc' } })

      if (listError) {
        console.error('Erro ao listar mídias da campanha:', listError)
        throw new Error(`Erro ao limpar mídias da campanha: ${listError.message}`)
      }

      const filePathsToDelete = (mediaFiles || [])
        .filter((file: any) => file?.name && file.name !== '.emptyFolderPlaceholder')
        .map((file: any) => `${campaignId}/${file.name}`)

      if (filePathsToDelete.length > 0) {
        const { error: removeError } = await supabase.storage
          .from('campaign-media')
          .remove(filePathsToDelete)

        if (removeError) {
          console.error('Erro ao remover mídias da campanha:', removeError)
          throw new Error(`Erro ao remover mídias da campanha: ${removeError.message}`)
        }
      }

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
      
      // Só recarregar a campanha se quem foi removido NÃO é o usuário atual
      // (quando o próprio jogador sai, ele perde acesso via RLS e .single() falha)
      if (userId !== user.value.id) {
        await getCampaignById(campaignId)
      }
      
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
  // Campaign Invites
  // ============================================

  /**
   * Check if an email is registered in the system
   */
  const checkUserByEmail = async (email: string): Promise<{ userId: string; email: string } | null> => {
    try {
      const { data, error: rpcError } = await supabase
        .rpc('check_user_by_email', { email_param: email.toLowerCase().trim() })

      if (rpcError) {
        console.error('Erro ao verificar email:', rpcError)
        throw new Error('Erro ao verificar email')
      }

      if (data && data.length > 0) {
        return { userId: data[0].user_id, email: data[0].user_email }
      }

      return null
    } catch (err: any) {
      console.error('Erro ao verificar email:', err)
      throw err
    }
  }

  /**
   * Send a campaign invite to a user by email.
   * Validates: email exists, user is not already in campaign, no pending invite exists.
   * Invite expires in 15 minutes.
   */
  const sendCampaignInvite = async (campaignId: string, email: string): Promise<{ success: boolean; message: string }> => {
    if (!user.value) throw new Error('Usuário não autenticado')

    try {
      // 1. Check if email is registered
      const targetUser = await checkUserByEmail(email)
      if (!targetUser) {
        return { success: false, message: 'Este email não está cadastrado no sistema.' }
      }

      // 2. Cannot invite yourself
      if (targetUser.userId === user.value.id) {
        return { success: false, message: 'Você não pode convidar a si mesmo.' }
      }

      // 3. Check if user is already in the campaign
      const { data: existingPlayer } = await supabase
        .from('campaign_players')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('user_id', targetUser.userId)
        .maybeSingle()

      if (existingPlayer) {
        return { success: false, message: 'Este jogador já faz parte da campanha.' }
      }

      // 4. Check if there's already a pending invite
      const { data: existingInvite } = await supabase
        .from('campaign_invites')
        .select('id, expires_at')
        .eq('campaign_id', campaignId)
        .eq('invited_user_id', targetUser.userId)
        .eq('status', 'pending')
        .maybeSingle()

      if (existingInvite) {
        const expiresAt = new Date(existingInvite.expires_at)
        if (expiresAt > new Date()) {
          return { success: false, message: 'Já existe um convite pendente para este jogador.' }
        }
        // If expired, update it
        await supabase
          .from('campaign_invites')
          .update({ status: 'expired' })
          .eq('id', existingInvite.id)
      }

      // 5. Get campaign name for the invite
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('name')
        .eq('id', campaignId)
        .single()

      // 6. Create the invite (15 minute expiry)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      const { error: insertError } = await supabase
        .from('campaign_invites')
        .insert({
          campaign_id: campaignId,
          invited_by: user.value.id,
          invited_email: email.toLowerCase().trim(),
          invited_user_id: targetUser.userId,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          campaign_name: campaignData?.name || 'Campanha'
        })

      if (insertError) {
        console.error('Erro ao criar convite:', insertError)
        // Handle unique constraint violation
        if (insertError.code === '23505') {
          return { success: false, message: 'Já existe um convite pendente para este jogador.' }
        }
        throw new Error(`Erro ao enviar convite: ${insertError.message}`)
      }

      return { success: true, message: `Convite enviado para ${email}!` }

    } catch (err: any) {
      console.error('Erro ao enviar convite:', err)
      throw err
    }
  }

  /**
   * Accept a campaign invite (client-side: update invite + add player)
   */
  const acceptCampaignInvite = async (inviteId: string): Promise<{ campaignId: string; campaignName: string }> => {
    if (!user.value) throw new Error('Usuário não autenticado')

    try {
      // 1. Get the invite
      const { data: invite, error: fetchError } = await supabase
        .from('campaign_invites')
        .select('*')
        .eq('id', inviteId)
        .eq('invited_user_id', user.value.id)
        .eq('status', 'pending')
        .single()

      if (fetchError || !invite) {
        console.error('Convite não encontrado:', fetchError)
        throw new Error('Convite não encontrado ou já respondido')
      }

      // 2. Check if expired
      if (new Date(invite.expires_at) < new Date()) {
        await supabase
          .from('campaign_invites')
          .update({ status: 'expired' })
          .eq('id', inviteId)
        throw new Error('Este convite expirou')
      }

      // 3. Check if already in campaign
      const { data: existingPlayer } = await supabase
        .from('campaign_players')
        .select('id')
        .eq('campaign_id', invite.campaign_id)
        .eq('user_id', user.value.id)
        .maybeSingle()

      if (!existingPlayer) {
        // 4. Add player to campaign with default sheet
        const defaultSheet = {
          name: 'Novo Personagem',
          concept: '',
          clan: '',
          generation: 13,
          sect: '',
          haven: '',
          player: '',
          avatar: '',
          bloodPotency: 0,
          humanity: 1,
          willpower: 1,
          hunger: 1,
          xpTotal: 0,
          xpSpent: 0,
          attributes: {
            physical: { strength: 1, dexterity: 1, stamina: 1 },
            social: { charisma: 1, manipulation: 1, appearance: 1 },
            mental: { perception: 1, intelligence: 1, wits: 1 }
          },
          skills: {
            talents: { melee: 1, firearms: 1, athletics: 1, brawl: 1, drive: 1, stealth: 1, larceny: 1, craft: 1, survival: 1 },
            skills: { animalKen: 1, etiquette: 1, intimidation: 1, leadership: 1, streetwise: 1, performance: 1, persuasion: 1, awareness: 1, subterfuge: 1 },
            knowledges: { science: 1, academics: 1, finance: 1, investigation: 1, medicine: 1, occult: 1, perception: 1, politics: 1, technology: 1 }
          },
          disciplines: [{ name: '', level: 0 }],
          virtues: { conscience: 1, selfControl: 1, courage: 1 },
          vitality: 1,
          conditions: [''],
          touchstonesConvictions: [],
          notes: ''
        }

        const { error: insertError } = await supabase
          .from('campaign_players')
          .insert({
            campaign_id: invite.campaign_id,
            user_id: user.value.id,
            character_name: 'Novo Personagem',
            role: 'player',
            joined_at: new Date().toISOString(),
            sheet: defaultSheet
          })

        if (insertError) {
          console.error('Erro ao entrar na campanha:', insertError)
          throw new Error(`Erro ao entrar na campanha: ${insertError.message}`)
        }
      }

      // 5. Mark invite as accepted (with retry)
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error: updateError } = await supabase
          .from('campaign_invites')
          .update({ status: 'accepted', responded_at: new Date().toISOString() })
          .eq('id', inviteId)

        if (!updateError) {
          console.log('Convite marcado como aceito com sucesso')
          break
        }
        console.error(`Tentativa ${attempt + 1} de atualizar convite falhou:`, updateError)
        if (attempt < 2) await new Promise(r => setTimeout(r, 300))
      }

      // 6. Reload campaigns
      await loadCampaigns()

      return {
        campaignId: invite.campaign_id,
        campaignName: invite.campaign_name || 'Campanha'
      }

    } catch (err: any) {
      console.error('Erro ao aceitar convite:', err)
      throw err
    }
  }

  /**
   * Decline a campaign invite
   */
  const declineCampaignInvite = async (inviteId: string): Promise<boolean> => {
    if (!user.value) throw new Error('Usuário não autenticado')

    try {
      const { error: updateError } = await supabase
        .from('campaign_invites')
        .update({ status: 'declined', responded_at: new Date().toISOString() })
        .eq('id', inviteId)
        .eq('invited_user_id', user.value.id)
        .eq('status', 'pending')

      if (updateError) {
        console.error('Erro ao recusar convite:', updateError)
        throw new Error('Erro ao recusar convite')
      }

      return true

    } catch (err: any) {
      console.error('Erro ao recusar convite:', err)
      throw err
    }
  }

  /**
   * Load pending invites for the current user
   */
  const loadPendingInvites = async () => {
    if (!user.value) return []

    try {
      const { data, error: fetchError } = await supabase
        .from('campaign_invites')
        .select('*')
        .eq('invited_user_id', user.value.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Erro ao carregar convites:', fetchError)
        return []
      }

      // Filter out expired invites and mark them
      const now = new Date()
      const valid: any[] = []
      for (const invite of data || []) {
        if (new Date(invite.expires_at) <= now) {
          // Auto-expire
          await supabase
            .from('campaign_invites')
            .update({ status: 'expired' })
            .eq('id', invite.id)
        } else {
          valid.push(invite)
        }
      }

      // Filter out invites for campaigns the user already joined
      if (valid.length > 0 && user.value) {
        const { data: myPlayers } = await supabase
          .from('campaign_players')
          .select('campaign_id')
          .eq('user_id', user.value.id)

        if (myPlayers && myPlayers.length > 0) {
          const joinedCampaignIds = new Set(myPlayers.map((p: any) => p.campaign_id))
          const filtered = valid.filter((invite: any) => !joinedCampaignIds.has(invite.campaign_id))

          // Mark already-joined invites as accepted
          for (const invite of valid) {
            if (joinedCampaignIds.has(invite.campaign_id)) {
              await supabase
                .from('campaign_invites')
                .update({ status: 'accepted', responded_at: new Date().toISOString() })
                .eq('id', invite.id)
            }
          }

          return filtered
        }
      }

      return valid

    } catch (err: any) {
      console.error('Erro ao carregar convites:', err)
      return []
    }
  }

  /**
   * Subscribe to realtime invite changes for current user
   */
  const subscribeToInvites = (callback: (invite: any) => void) => {
    if (!user.value) return null

    const channel = supabase
      .channel('campaign_invites_' + user.value.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_invites',
          filter: `invited_user_id=eq.${user.value.id}`
        },
        (payload) => {
          console.log('Novo convite recebido:', payload)
          callback(payload.new)
        }
      )
      .subscribe()

    return channel
  }

  // ============================================
  // NPCs Management
  // ============================================

  // Mapear dados do Supabase (snake_case) para tipos TypeScript (camelCase)
  const mapSupabaseNPC = (raw: any): NPC => ({
    id: raw.id,
    campaignId: raw.campaign_id,
    name: raw.name,
    type: raw.type,
    clan: raw.clan,
    generation: raw.generation,
    sect: raw.sect,
    status: raw.status,
    role: raw.role,
    motivation: raw.motivation,
    secret: raw.secret,
    mainPool: raw.main_pool,
    bio: raw.bio,
    keyPoints: raw.key_points || [],
    photo: raw.photo_url,
    sheet: raw.sheet_data || undefined,
    isVisible: raw.is_visible_to_players ?? false,
    createdAt: new Date(raw.created_at),
    updatedAt: raw.updated_at ? new Date(raw.updated_at) : undefined
  })

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

      campaignNPCs.value = (npcs || []).map(mapSupabaseNPC)
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
          sect: npcData.sect,
          status: npcData.status,
          role: npcData.role,
          motivation: npcData.motivation,
          secret: npcData.secret,
          main_pool: npcData.mainPool,
          bio: npcData.bio,
          key_points: npcData.keyPoints,
          photo_url: npcData.photo
        })
        .select()
        .single()

      if (npcError) throw npcError

      // Adicionar à lista local (realtime subscription pode duplicar, mas verificamos)
      const formattedNPC = mapSupabaseNPC(npc)
      // Evitar duplicata: só adicionar se não existir
      if (!campaignNPCs.value.some(n => n.id === formattedNPC.id)) {
        campaignNPCs.value.push(formattedNPC)
      }
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
      
      if (npcData.name !== undefined) updateData.name = npcData.name
      if (npcData.type !== undefined) updateData.type = npcData.type
      if (npcData.clan !== undefined) updateData.clan = npcData.clan
      if (npcData.generation !== undefined) updateData.generation = npcData.generation
      if (npcData.sect !== undefined) updateData.sect = npcData.sect
      if (npcData.status !== undefined) updateData.status = npcData.status
      if (npcData.role !== undefined) updateData.role = npcData.role
      if (npcData.motivation !== undefined) updateData.motivation = npcData.motivation
      if (npcData.secret !== undefined) updateData.secret = npcData.secret
      if (npcData.mainPool !== undefined) updateData.main_pool = npcData.mainPool
      if (npcData.bio !== undefined) updateData.bio = npcData.bio
      if (npcData.keyPoints !== undefined) updateData.key_points = npcData.keyPoints
      if (npcData.photo !== undefined) updateData.photo_url = npcData.photo
      if (npcData.sheet !== undefined) updateData.sheet_data = npcData.sheet
      if (npcData.isVisible !== undefined) updateData.is_visible_to_players = npcData.isVisible

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
        campaignNPCs.value[index] = mapSupabaseNPC(npc)
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
            case 'INSERT': {
              const newNPC = mapSupabaseNPC(payload.new)
              // Evitar duplicata (createNPC já pode ter adicionado localmente)
              if (!campaignNPCs.value.some(n => n.id === newNPC.id)) {
                campaignNPCs.value.push(newNPC)
              }
              break
            }
            case 'UPDATE': {
              const updateIndex = campaignNPCs.value.findIndex(n => n.id === payload.new.id)
              if (updateIndex !== -1) {
                campaignNPCs.value[updateIndex] = mapSupabaseNPC(payload.new)
              }
              break
            }
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

    // Invite methods
    checkUserByEmail,
    sendCampaignInvite,
    acceptCampaignInvite,
    declineCampaignInvite,
    loadPendingInvites,
    subscribeToInvites,

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
