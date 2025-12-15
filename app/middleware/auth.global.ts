// ============================================
// Auth Global Middleware
// Protege rotas privadas
// ============================================

export default defineNuxtRouteMiddleware((to) => {
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login', '/register', '/', '/terms', '/privacy', '/forgot-password']
  
  // Se a rota é pública, permite acesso
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Verificar autenticação usando composable
  if (process.client) {
    const { isAuthenticated } = useAuth()
    
    if (!isAuthenticated.value) {
      return navigateTo('/login')
    }
  }
})
