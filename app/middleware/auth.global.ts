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

  // Verificar autenticação apenas no cliente
  if (process.client) {
    const hasToken = localStorage.getItem('auth_token')
    
    console.log('Middleware - rota:', to.path, 'token:', !!hasToken)
    
    if (!hasToken) {
      console.log('Middleware - sem token, redirecionando para login')
      return navigateTo('/login')
    }
  }
})
