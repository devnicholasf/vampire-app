// ============================================
// API Route - Login
// ============================================

// Tipos locais
interface LoginCredentials {
  email: string
  password: string
}

interface User {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export default defineEventHandler(async (event) => {
  try {
    const body: LoginCredentials = await readBody(event)
    
    // Validação básica
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email e senha são obrigatórios'
      })
    }

    // TODO: Implementar autenticação real com banco de dados
    // Por agora, vamos simular um usuário para desenvolvimento
    if (body.email === 'admin@vampire.com' && body.password === '123456') {
      const user: User = {
        id: '1',
        email: 'admin@vampire.com',
        username: 'Admin',
        avatar: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const token = 'dev-token-' + Date.now() // Token simples para desenvolvimento

      const response: ApiResponse<{ user: User; token: string }> = {
        success: true,
        data: {
          user,
          token
        }
      }

      return response
    } else {
      const response: ApiResponse = {
        success: false,
        error: 'Email ou senha incorretos'
      }

      return response
    }
  } catch (error: any) {
    console.error('Erro no login:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Erro interno do servidor'
    }

    return response
  }
})