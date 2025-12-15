// ============================================
// Auth Global Middleware
// Protege rotas privadas e gerencia redirecionamentos
// ============================================

export default defineNuxtRouteMiddleware(async (to) => {
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/register', '/terms', '/privacy', '/forgot-password']
  
  // Verificar autenticação usando composable (apenas no cliente)
  if (process.client) {
    const { isAuthenticated, restoreSession } = useAuth()
    
    // Restaurar sessão primeiro se não houver usuário
    await restoreSession()
    
    // Se está na página inicial (/), redireciona baseado no status de autenticação
    if (to.path === '/') {
      if (isAuthenticated.value) {
        return navigateTo('/dashboard')
      } else {
        return navigateTo('/login')
      }
    }
    
    // Se usuário já está logado e tenta acessar rotas de autenticação, redireciona para dashboard
    if ((to.path === '/login' || to.path === '/register') && isAuthenticated.value) {
      return navigateTo('/dashboard')
    }
    
    // Se a rota é pública, permite acesso
    if (publicRoutes.includes(to.path)) {
      return
    }

    // Para rotas privadas, verifica se está autenticado
    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
  }
})
