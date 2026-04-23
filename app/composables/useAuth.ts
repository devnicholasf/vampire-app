// ============================================
// useAuth - Gerenciamento de Autenticação com Supabase
// ============================================

import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig, useState, navigateTo } from '#imports'
import { computed } from 'vue'
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
      'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos',
      'Signup not allowed for this instance': 'Cadastro não permitido no momento',
      'Email address not authorized': 'Este email não está autorizado',
      'Weak password': 'Senha muito fraca. Use uma senha mais forte',
      'Password too short': 'Senha muito curta. Use pelo menos 6 caracteres'
    }

    // Verificar mensagem e código do erro
    const message = authError?.message || ''
    const code = authError?.code || ''
    
    return errorMap[message] || errorMap[code] || 'Erro na autenticação'
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
  // Registro no Supabase
  // ============================================
  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível')
      }

      // Criar conta no Supabase (apenas nome, email e senha)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            display_name: data.username
          }
        }
      })

      if (authError) {
        console.error('Erro ao criar conta:', authError)
        error.value = translateAuthError(authError)
        return { success: false, error: error.value }
      }

      // Se o usuário foi criado com sucesso
      if (authData.user) {
        // Configurar dados do usuário
        user.value = {
          id: authData.user.id,
          email: authData.user.email!,
          username: data.username,
          avatar: null,
          createdAt: new Date(authData.user.created_at),
          updatedAt: new Date(authData.user.updated_at || authData.user.created_at)
        }

        // Se a sessão foi criada automaticamente (email confirmado)
        if (authData.session) {
          return { 
            success: true, 
            data: { user: user.value },
            needsConfirmation: false
          }
        } else {
          // Email de confirmação enviado
          return { 
            success: true, 
            data: { user: user.value },
            needsConfirmation: true,
            message: 'Conta criada! Verifique seu email para confirmação.'
          }
        }
      }

      error.value = 'Falha ao criar conta'
      return { success: false, error: error.value }

    } catch (e: any) {
      console.error('Erro durante registro:', e)
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
    // Reset active live sessions for this user before signing out
    try {
      if (user.value?.id) {
        const { data: liveStates } = await supabase
          .from('live_game_state')
          .select('campaign_id')
          .eq('is_live', true)
          .contains('active_players', [user.value.id])

        if (liveStates && liveStates.length > 0) {
          await Promise.all(
            liveStates.map((ls: any) =>
              supabase
                .from('live_game_state')
                .update({
                  is_live: false,
                  active_players: [],
                  current_scene: '',
                  timeline_events: [],
                })
                .eq('campaign_id', ls.campaign_id)
            )
          )
        }
      }
    } catch (_) {
      // Non-blocking: proceed with logout even if cleanup fails
    }

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

  // ============================================
  // Atualizar perfil do usuário no Supabase
  // ============================================
  const updateUserProfile = async (profileData: { username?: string, email?: string }) => {
    loading.value = true
    error.value = null

    try {
      if (!supabase) {
        throw new Error('Supabase não está disponível')
      }

      if (!user.value) {
        throw new Error('Usuário não está logado')
      }

      // Atualizar metadata do usuário
      const { data, error: updateError } = await supabase.auth.updateUser({
        email: profileData.email,
        data: {
          username: profileData.username,
          display_name: profileData.username
        }
      })

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError)
        error.value = translateAuthError(updateError)
        throw new Error(error.value)
      }

      if (data.user) {
        // Atualizar estado local
        const updatedUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
          avatar: data.user.user_metadata?.avatar || null,
          createdAt: new Date(data.user.created_at),
          updatedAt: new Date()
        }

        user.value = updatedUser
        return updatedUser
      }

      throw new Error('Erro ao atualizar perfil')

    } catch (e: any) {
      console.error('Erro ao atualizar perfil:', e)
      error.value = e.message || 'Erro ao atualizar perfil'
      throw e
    } finally {
      loading.value = false
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
    updateUser,
    updateUserProfile
  }
}