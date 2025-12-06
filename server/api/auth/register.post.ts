// ============================================
// API Route - Register
// ============================================

// Tipos locais
interface RegisterData {
  email: string
  username: string
  password: string
  confirmPassword: string
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
    const body: RegisterData = await readBody(event)
    
    // Validação básica
    if (!body.email || !body.username || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Todos os campos são obrigatórios'
      })
    }

    if (body.password !== body.confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Senhas não conferem'
      })
    }

    // TODO: Implementar registro real com banco de dados
    // Por agora, vamos simular sucesso para desenvolvimento
    const user: User = {
      id: Date.now().toString(),
      email: body.email,
      username: body.username,
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
  } catch (error: any) {
    console.error('Erro no registro:', error)
    
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Erro interno do servidor'
    }

    return response
  }
})