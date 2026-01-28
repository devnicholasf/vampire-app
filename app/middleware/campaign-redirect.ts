// ============================================
// Middleware para redirecionamento baseado em role
// Redireciona automaticamente para dashboard correto
// ============================================
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Verificar se está acessando uma campanha diretamente
  if (to.path.startsWith('/campaign/') && to.path.split('/').length === 3) {
    const campaignId = to.params.id as string
    const { user } = useAuth()
    
    if (!user.value) {
      return navigateTo('/login')
    }
    
    // Verificar se o usuário é mestre ou jogador desta campanha
    const { getCampaignById } = useCampaign()
    
    try {
      const campaign = await getCampaignById(campaignId)
      
      if (campaign.master_id === user.value.id) {
        return navigateTo(`/campaign/${campaignId}/master`)
      } else {
        return navigateTo(`/campaign/${campaignId}/player`)
      }
    } catch (error) {
      console.error('Erro ao verificar campanha:', error)
      return navigateTo('/dashboard')
    }
  }
})