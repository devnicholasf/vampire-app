// ============================================
// Auth Global Middleware
// Protege rotas privadas
// ============================================

// @ts-ignore - Auto-importado pelo Nuxt
export default defineNuxtRouteMiddleware((to: any, from: any) => {
  // @ts-ignore - Auto-importado pelo Nuxt
  const { isAuthenticated, restoreSession } = useAuth()

  // Tentar restaurar sessão se ainda não estiver autenticado
  // @ts-ignore - Nuxt runtime
  if (!isAuthenticated.value && process.client) {
    restoreSession()
  }

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/register', '/', '/terms', '/privacy']
  
  // Se a rota é pública, permite acesso
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Se não está autenticado e tentando acessar rota privada
  if (!isAuthenticated.value) {
    // @ts-ignore - Auto-importado pelo Nuxt
    return navigateTo('/login')
  }
})
