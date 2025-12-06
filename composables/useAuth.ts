// ============================================
// useAuth - Gerenciamento de Autenticação
// ============================================

// @ts-ignore - Tipos auto-importados pelo Nuxt
import type { User, LoginCredentials, RegisterData, ApiResponse } from '~/types'

export const useAuth = () => {
  // Inicializar state sempre com null no SSR
  // @ts-ignore - Auto-importado pelo Nuxt
  const user = useState<User | null>('user', () => null)
  
  // @ts-ignore - Auto-importado pelo Nuxt
  const token = useState<string | null>('token', () => null)
  
  // @ts-ignore - Auto-importado pelo Nuxt
  const loading = useState<boolean>('auth-loading', () => false)
  // @ts-ignore - Auto-importado pelo Nuxt
  const error = useState<string | null>('auth-error', () => null)

  // Verifica se o usuário está autenticado
  // @ts-ignore - Auto-importado pelo Nuxt
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  
  // Restaurar do localStorage automaticamente no cliente
  // @ts-ignore - Nuxt runtime
  if (process.client && !user.value) {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('auth_token')
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
      } catch (e) {
        localStorage.removeItem('user')
        localStorage.removeItem('auth_token')
      }
    }
  }

  // ============================================
  // Login
  // ============================================
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (response.success && response.data) {
        user.value = response.data.user
        token.value = response.data.token

        // Salvar no localStorage
        // @ts-ignore - Nuxt runtime
        if (process.client) {
          localStorage.setItem('auth_token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }

        return { success: true }
      } else {
        error.value = response.error || 'Login falhou'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao fazer login'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Registro
  // ============================================
  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/register', {
        method: 'POST',
        body: data
      })

      if (response.success && response.data) {
        user.value = response.data.user
        token.value = response.data.token

        // Salvar no localStorage
        // @ts-ignore - Nuxt runtime
        if (process.client) {
          localStorage.setItem('auth_token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }

        return { success: true }
      } else {
        error.value = response.error || 'Registro falhou'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao fazer registro'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Logout
  // ============================================
  const logout = async () => {
    user.value = null
    token.value = null

    // @ts-ignore - Nuxt runtime
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }

    // Redirecionar para login
    // @ts-ignore - Auto-importado pelo Nuxt
    await navigateTo('/login')
  }

  // ============================================
  // Restaurar sessão do localStorage
  // ============================================
  const restoreSession = () => {
    // @ts-ignore - Nuxt runtime
    if (process.client) {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('user')

      if (savedToken && savedUser) {
        try {
          token.value = savedToken
          user.value = JSON.parse(savedUser)
        } catch (e) {
          console.error('Erro ao restaurar sessão:', e)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
      }
    }
  }

  // ============================================
  // Atualizar dados do usuário
  // ============================================
  const updateUser = (updatedUser: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...updatedUser }
      
      // @ts-ignore - Nuxt runtime
      if (process.client) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    }
  }

  return {
    // State
    // @ts-ignore - Auto-importado pelo Nuxt
    user: readonly(user),
    // @ts-ignore - Auto-importado pelo Nuxt
    token: readonly(token),
    // @ts-ignore - Auto-importado pelo Nuxt
    loading: readonly(loading),
    // @ts-ignore - Auto-importado pelo Nuxt
    error: readonly(error),
    isAuthenticated,

    // Methods
    login,
    register,
    logout,
    restoreSession,
    updateUser
  }
}
