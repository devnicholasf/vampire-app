<template>
  <NuxtLayout name="auth">
    <div class="space-y-6">
      <!-- Título -->
      <div class="text-center">
        <h2 class="text-2xl font-bold text-text-primary mb-2">
          Bem-vindo de volta
        </h2>
        <p class="text-text-secondary text-sm">
          Entre para acessar suas campanhas
        </p>
      </div>

      <!-- Mensagem de erro global -->
      <div
        v-if="authError"
        class="p-4 bg-error/10 border border-error rounded-vampire text-error-light text-sm animate-slide-up"
        role="alert"
      >
        <div class="flex items-center">
          <span class="text-lg mr-2">⚠️</span>
          <span>{{ authError }}</span>
        </div>
      </div>

      <!-- Formulário de Login -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Email -->
        <BaseInput
          v-model="formData.email"
          type="email"
          label="Email"
          placeholder="seu@email.com"
          :error="errors.email"
          :disabled="loading"
          required
          autocomplete="email"
        />

        <!-- Senha -->
        <BaseInput
          v-model="formData.password"
          type="password"
          label="Senha"
          placeholder="••••••••"
          :error="errors.password"
          :disabled="loading"
          required
          autocomplete="current-password"
        />

        <!-- Lembrar-me e Esqueceu senha -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center cursor-pointer group">
            <input
              v-model="formData.remember"
              type="checkbox"
              class="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-background transition-colors"
            />
            <span class="ml-2 text-text-secondary group-hover:text-text-primary transition-colors">
              Lembrar-me
            </span>
          </label>
          
          <NuxtLink
            to="/forgot-password"
            class="text-secondary hover:text-secondary-light transition-colors"
          >
            Esqueceu a senha?
          </NuxtLink>
        </div>

        <!-- Botão Submit -->
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="loading"
          :disabled="!isFormValid"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </BaseButton>
      </form>

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-surface text-text-muted">ou</span>
        </div>
      </div>

      <!-- Link para registro -->
      <div class="text-center">
        <p class="text-text-secondary text-sm">
          Não tem uma conta?
          <NuxtLink
            to="/register"
            class="text-secondary hover:text-secondary-light font-semibold transition-colors"
          >
            Criar conta
          </NuxtLink>
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-center space-x-4 text-xs">
        <NuxtLink to="/terms" class="hover:text-secondary transition-colors">
          Termos de Uso
        </NuxtLink>
        <span>•</span>
        <NuxtLink to="/privacy" class="hover:text-secondary transition-colors">
          Privacidade
        </NuxtLink>
      </div>
    </template>
  </NuxtLayout>
  
</template>

<script setup lang="ts">
definePageMeta({
  middleware: []
})

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

// Composable simplificado inline
const useAuthSimple = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<{ user: User; token: string }>>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (response.success && response.data) {
        // Salvar no localStorage
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

  return {
    login,
    loading,
    error
  }
}

const { login, loading, error: authError } = useAuthSimple()
const router = useRouter()

// Form state
const formData = reactive({
  email: '',
  password: '',
  remember: false
})

// Validação local
const errors = reactive({
  email: '',
  password: ''
})

// Validar formulário
const isFormValid = computed(() => {
  return (
    formData.email.length > 0 &&
    formData.password.length >= 6 &&
    !errors.email &&
    !errors.password
  )
})

// Validar email
watch(() => formData.email, (value) => {
  if (value && !value.includes('@')) {
    errors.email = 'Email inválido'
  } else {
    errors.email = ''
  }
})

// Validar senha
watch(() => formData.password, (value) => {
  if (value && value.length < 6) {
    errors.password = 'Senha deve ter no mínimo 6 caracteres'
  } else {
    errors.password = ''
  }
})

// Handle login
const handleLogin = async () => {
  if (!isFormValid.value) return

  const credentials: LoginCredentials = {
    email: formData.email,
    password: formData.password
  }

  const result = await login(credentials)
  
  if (result.success) {
    await router.push('/dashboard')
  }
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>
