<template>
  <div>
    <NuxtLayout name="auth">
      <div class="space-y-8 relative">
      <!-- Header com branding -->
      <div class="text-center space-y-4">
        <h1 class="text-2xl font-bold text-red-500 font-cinzel mb-2">
          VAMPIRE: THE MASQUERADE Campaign Manager
        </h1>
        <h2 class="text-xl font-semibold text-text-secondary mb-2">
          Bem-vindo de volta
        </h2>
        <p class="text-text-muted">
          Entre para acessar suas campanhas nas trevas
        </p>
      </div>

      <!-- Mensagem de erro global -->
      <div
        v-if="authError"
        class="p-4 bg-red-900/20 border border-red-400 rounded-lg text-red-300 text-sm animate-slide-up backdrop-blur-sm"
        role="alert"
      >
        <div class="flex items-center">
          <span class="text-lg mr-3">⚠️</span>
          <span>{{ authError }}</span>
        </div>
      </div>

      <!-- Formulário de Login -->
      <form @submit.prevent="handleLogin" class="space-y-6">
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
          placeholder="••••••••••"
          :error="errors.password"
          :disabled="loading"
          required
          autocomplete="current-password"
        />

        <!-- Lembrar-me e Esqueceu senha -->
        <div class="flex items-center justify-between">
          <label class="flex items-center cursor-pointer group">
            <input
              v-model="formData.remember"
              type="checkbox"
              class="w-4 h-4 rounded border-border-primary bg-surface-card text-secondary focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 focus:ring-offset-transparent transition-colors"
            />
            <span class="ml-3 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              Lembrar-me
            </span>
          </label>
          
          <NuxtLink
            to="/forgot-password"
            class="text-sm text-secondary hover:text-accent transition-colors duration-200 font-medium"
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
          class="!py-4 !text-base font-semibold"
        >
          {{ loading ? 'Entrando nas trevas...' : 'Entrar' }}
        </BaseButton>
      </form>

      <!-- Divider elegante -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border-primary"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-6 bg-surface-dark text-text-muted font-medium">ou</span>
        </div>
      </div>

      <!-- Link para registro -->
      <div class="text-center">
        <p class="text-text-secondary">
          Novo nas trevas?
          <NuxtLink
            to="/register"
            class="text-secondary hover:text-accent font-semibold transition-colors duration-200 ml-1"
          >
            Criar conta
          </NuxtLink>
        </p>
      </div>
    </div>

    <template #footer>
      <div class="text-center space-y-8">
        <!-- Links de termos -->
        <div class="flex items-center justify-center space-x-6 text-xs">
          <NuxtLink 
            to="/terms" 
            class="text-text-muted hover:text-secondary transition-colors duration-200"
          >
            Termos de Uso
          </NuxtLink>
          <span class="text-text-muted">•</span>
          <NuxtLink 
            to="/privacy" 
            class="text-text-muted hover:text-secondary transition-colors duration-200"
          >
            Privacidade
          </NuxtLink>
        </div>
        
        <!-- Copyright no final da página -->
        <div class="border-t border-border-primary/30 pt-8 mt-16">
          <p class="text-xs text-text-muted/80 mb-2">
            Vampire: The Masquerade © 2025 World of Darkness Entertainment
          </p>
          <p class="text-xs text-text-muted/60 mb-1">
            Created by fan for fans.
          </p>
          <p class="text-xs text-text-muted/50">
            Not affiliated with Paradox Interactive or World of Darkness Entertainment.
          </p>
        </div>
      </div>
    </template>
  </NuxtLayout>

  <!-- Botão WoD fora do layout, fixo na tela -->
  <WodButton />
</div>
</template>

<script setup lang="ts">
// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import WodButton from '~/components/ui/WodButton.vue'

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

// Composable global de autenticação
const { login, loading, error: authError } = useAuth()
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

  console.log('Tentando login com:', credentials)
  
  try {
    const result = await login(credentials)
    console.log('Resultado do login:', result)
    
    if (result.success) {
      console.log('Login bem-sucedido, redirecionando...')
      
      // Usar navigateTo do Nuxt para redirecionamento
      await navigateTo('/dashboard')
    } else {
      console.log('Login falhou:', result.error)
    }
  } catch (e: any) {
    console.error('Erro durante login:', e)
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
