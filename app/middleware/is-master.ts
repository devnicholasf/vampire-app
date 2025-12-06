// ============================================
// isMaster Middleware
// Verifica se o usuário é mestre da campanha
// ============================================

export default defineNuxtRouteMiddleware(async (to) => {
  const campaignId = to.params.id as string

  if (!campaignId) {
    return navigateTo('/dashboard')
  }

  const { fetchCampaign, permissions } = useCampaign(campaignId)
  
  // Buscar dados da campanha
  const result = await fetchCampaign(campaignId)

  if (!result.success) {
    return navigateTo('/dashboard')
  }

  // Verificar se é mestre
  if (!permissions.value.isMaster) {
    return abortNavigation({
      statusCode: 403,
      message: 'Acesso negado. Você não é o mestre desta campanha.'
    })
  }
})
