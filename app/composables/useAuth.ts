// ============================================
// useAuth - Gerenciamento de Autenticação com Supabase
// ============================================

import { createClient } from '@supabase/supabase-js'
import type { AuthUser, LoginCredentials, RegisterData } from '~/types'

export const useAuth = () => {
  // Criar cliente Supabase diretamente
  const config = useRuntimeConfig()
  
  // Usar singleton para evitar múltiplas instâncias
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )
  
  // Usar useState para reatividade SSR-friendly
  const user = useState<AuthUser | null>('auth.user', () => null)
  const loading = useState<boolean>('auth.loading', () => false)
  const error = useState<string | null>('auth.error', () => null)

  // Computed para autenticação
  const isAuthenticated = computed(() => !!user.value)
  
  // Restaurar sessão do Supabase no cliente
  const restoreSession = async () => {
    if (process.client && supabase) {
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      
      if (supaUser) {
        user.value = {
          id: supaUser.id,
          email: supaUser.email!,
          username: supaUser.user_metadata?.username || supaUser.email!.split('@')[0],
          avatar: supaUser.user_metadata?.avatar || null,
          createdAt: new Date(supaUser.created_at),
          updatedAt: new Date(supaUser.updated_at || supaUser.created_at)
        }
      }
    }
  }

  // ============================================
  // Tradução de erros do Supabase
  // ============================================
  const translateAuthError = (authError: any): string => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha inválidos',
      'invalid_credentials': 'Email ou senha inválidos',
      'User not found': 'Usuário não encontrado',
      'Invalid email': 'Email inválido',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'User already registered': 'Este email já está em uso',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
      'Invalid email or password': 'Email ou senha inválidos',
      'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos'
    }

    // Verificar mensagem e código do erro
    const message = authError?.message || ''
    const code = authError?.code || ''
    
    return errorMap[message] || errorMap[code] || 'Email ou senha inválidos'
  }

  // ============================================
  // Login com Supabase
  // ============================================
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível')
      }
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError) {
        error.value = translateAuthError(authError)
        return { success: false, error: error.value }
      }

      if (data.user) {
        user.value = {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
          avatar: data.user.user_metadata?.avatar || null,
          createdAt: new Date(data.user.created_at),
          updatedAt: new Date(data.user.updated_at || data.user.created_at)
        }

        return { success: true, data: { user: user.value } }
      } else {
        error.value = 'Login falhou'
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
  // Registro (para implementar depois)
  // ============================================
  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível')
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username
          }
        }
      })

      if (authError) {
        error.value = translateAuthError(authError)
        return { success: false, error: error.value }
      }

      return { success: true, data: authData }
    } catch (e: any) {
      error.value = e.message || 'Erro ao criar conta'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Logout
  // ============================================
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    
    user.value = null
    error.value = null

    // Redirecionar para login
    await navigateTo('/login')
  }

  // ============================================
  // Atualizar dados do usuário
  // ============================================
  const updateUser = (updatedUser: Partial<AuthUser>) => {
    if (user.value) {
      user.value = { ...user.value, ...updatedUser }
    }
  }

  // Restaurar sessão automaticamente no cliente
  onMounted(() => {
    if (process.client && !user.value) {
      restoreSession()
    }
  })

  return {
    // State
    user: readonly(user),
    loading: readonly(loading),
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