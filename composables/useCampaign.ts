// ============================================
// useCampaign - Gerenciamento de Campanhas
// ============================================

// @ts-ignore - Auto-importado pelo Nuxt
import type { Campaign, CampaignPlayer, CampaignPermissions, CreateCampaignData, JoinCampaignData, ApiResponse } from '~/types'

export const useCampaign = (campaignId?: string) => {
  // @ts-ignore - Auto-importado pelo Nuxt
  const { user } = useAuth()
  
  // @ts-ignore - Auto-importado pelo Nuxt
  const campaign = useState<Campaign | null>(`campaign-${campaignId}`, () => null)
  // @ts-ignore - Auto-importado pelo Nuxt
  const campaigns = useState<Campaign[]>('user-campaigns', () => [])
  // @ts-ignore - Auto-importado pelo Nuxt
  const loading = useState<boolean>('campaign-loading', () => false)
  // @ts-ignore - Auto-importado pelo Nuxt
  const error = useState<string | null>('campaign-error', () => null)

  // ============================================
  // Permissões
  // ============================================
  // @ts-ignore - Auto-importado pelo Nuxt
  const permissions = computed<CampaignPermissions>(() => {
    if (!campaign.value || !user.value) {
      return {
        isMaster: false,
        isPlayer: false,
        canEdit: false,
        canDelete: false
      }
    }

    const isMaster = campaign.value.masterId === user.value.id
    const isPlayer = campaign.value.players.some((p: CampaignPlayer) => p.userId === user.value.id)

    return {
      isMaster,
      isPlayer,
      canEdit: isMaster,
      canDelete: isMaster
    }
  })

  // ============================================
  // Buscar campanhas do usuário
  // ============================================
  const fetchUserCampaigns = async () => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<Campaign[]>>('/api/campaigns/user', {
        headers: {
          // @ts-ignore - Auto-importado pelo Nuxt
          Authorization: `Bearer ${useAuth().token.value}`
        }
      })

      if (response.success && response.data) {
        campaigns.value = response.data
        return { success: true }
      } else {
        error.value = response.error || 'Erro ao buscar campanhas'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao buscar campanhas'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Buscar campanha específica
  // ============================================
  const fetchCampaign = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<Campaign>>(`/api/campaigns/${id}`, {
        headers: {
          // @ts-ignore - Auto-importado pelo Nuxt
          Authorization: `Bearer ${useAuth().token.value}`
        }
      })

      if (response.success && response.data) {
        campaign.value = response.data
        return { success: true, data: response.data }
      } else {
        error.value = response.error || 'Erro ao buscar campanha'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao buscar campanha'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Criar campanha
  // ============================================
  const createCampaign = async (data: CreateCampaignData) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<Campaign>>('/api/campaigns/create', {
        method: 'POST',
        headers: {
          // @ts-ignore - Auto-importado pelo Nuxt
          Authorization: `Bearer ${useAuth().token.value}`
        },
        body: data
      })

      if (response.success && response.data) {
        campaigns.value.push(response.data)
        return { success: true, data: response.data }
      } else {
        error.value = response.error || 'Erro ao criar campanha'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao criar campanha'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Entrar em campanha como jogador
  // ============================================
  const joinCampaign = async (data: JoinCampaignData) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<Campaign>>('/api/campaigns/join', {
        method: 'POST',
        headers: {
          // @ts-ignore - Auto-importado pelo Nuxt
          Authorization: `Bearer ${useAuth().token.value}`
        },
        body: data
      })

      if (response.success && response.data) {
        campaigns.value.push(response.data)
        return { success: true, data: response.data }
      } else {
        error.value = response.error || 'Erro ao entrar na campanha'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao entrar na campanha'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Atualizar imagem/mapa atual
  // ============================================
  const updateCurrentMedia = async (type: 'image' | 'music', url: string) => {
    if (!campaign.value || !permissions.value.isMaster) {
      return { success: false, error: 'Sem permissão' }
    }

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<Campaign>>(`/api/campaigns/${campaign.value.id}/media`, {
        method: 'PATCH',
        headers: {
          // @ts-ignore - Auto-importado pelo Nuxt
          Authorization: `Bearer ${useAuth().token.value}`
        },
        body: { type, url }
      })

      if (response.success && response.data) {
        campaign.value = response.data
        return { success: true }
      }
      return { success: false, error: response.error }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }

  // ============================================
  // Deletar campanha
  // ============================================
  const deleteCampaign = async (id: string) => {
    if (!permissions.value.canDelete) {
      return { success: false, error: 'Sem permissão para deletar' }
    }

    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse>(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          // @ts-ignore - Auto-importado pelo Nuxt
          Authorization: `Bearer ${useAuth().token.value}`
        }
      })

      if (response.success) {
        campaigns.value = campaigns.value.filter((c: Campaign) => c.id !== id)
        return { success: true }
      } else {
        error.value = response.error || 'Erro ao deletar campanha'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao deletar campanha'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    // @ts-ignore - Auto-importado pelo Nuxt
    campaign: readonly(campaign),
    // @ts-ignore - Auto-importado pelo Nuxt
    campaigns: readonly(campaigns),
    // @ts-ignore - Auto-importado pelo Nuxt
    loading: readonly(loading),
    // @ts-ignore - Auto-importado pelo Nuxt
    error: readonly(error),
    permissions,

    // Methods
    fetchUserCampaigns,
    fetchCampaign,
    createCampaign,
    joinCampaign,
    updateCurrentMedia,
    deleteCampaign
  }
}
