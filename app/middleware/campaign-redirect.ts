// ============================================
// Middleware para redirecionamento baseado em role
// Redireciona automaticamente para dashboard correto
// ============================================
import type { RouteLocationNormalized } from 'vue-router'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Apenas verificar autenticação - não forçar redirecionamentos
  const { user } = useAuth()
  
  if (!user.value) {
    return navigateTo('/login')
  }
  
  // Permitir acesso direto às páginas específicas
  // O dashboard já decide qual página acessar
})