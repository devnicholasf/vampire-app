// ============================================
// isMaster Middleware (Simplified for mock data)
// Permite acesso ao dashboard master por enquanto
// ============================================

export default defineNuxtRouteMiddleware(async (to) => {
  const campaignId = to.params.id as string
  
  if (!campaignId) {
    return navigateTo('/dashboard')
  }
  
  // TODO: Implementar verificação real quando backend estiver pronto
  // Por enquanto, permite acesso para testes
  console.log('Acessando dashboard master para campanha:', campaignId)
})
