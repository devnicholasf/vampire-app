// ============================================
// Middleware para redirecionamento baseado em role
// Redireciona automaticamente para dashboard correto
// ============================================
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Verificar se está acessando uma campanha diretamente
  if (to.path.startsWith('/campaign/') && to.path.split('/').length === 3) {
    const campaignId = to.params.id as string
    
    // Simular verificação de role - em produção seria uma API call
    const isMaster = await checkIfUserIsMaster(campaignId)
    
    if (isMaster) {
      return navigateTo(`/campaign/${campaignId}/master`)
    } else {
      return navigateTo(`/campaign/${campaignId}/player`)
    }
  }
})

// Função auxiliar para verificar se o usuário é mestre
async function checkIfUserIsMaster(campaignId: string): Promise<boolean> {
  // Mock: em produção seria uma consulta à API
  // Para demo, campanha '1' sempre tem o usuário atual como mestre
  return campaignId === '1'
}