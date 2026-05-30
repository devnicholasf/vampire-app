<template>
  <div>
    <NuxtLayout name="auth">
      <div class="space-y-6 relative">
      <!-- Header com branding -->
      <div class="text-center space-y-2">
        <h1 class="mx-auto mb-5 flex w-full flex-col items-center space-y-3 font-cinzel font-bold leading-none text-center">
          <span class="block text-2xl tracking-[0.08em] text-red-500">
            Night Chronicles
          </span>
          <span class="mx-auto block w-full max-w-none whitespace-nowrap text-center text-[14px] font-bold uppercase tracking-[0.02em] text-white">
            Campaign Manager for Vampire: The Masquerade
          </span>
        </h1>
        <h2 class="text-xl font-semibold text-text-secondary">
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
      <form @submit.prevent="handleLogin" class="space-y-6" novalidate>
        <!-- Email -->
        <BaseInput
          v-model="formData.email"
          type="email"
          label="Email"
          placeholder=""
          :error="errors.email"
          :disabled="loading"
          autocomplete="email"
        />

        <!-- Senha -->
        <BaseInput
          v-model="formData.password"
          type="password"
          label="Senha"
          placeholder=""
          :error="errors.password"
          :disabled="loading"
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
          <span class="text-text-muted">•</span>
          <NuxtLink
            to="/creditos-direitos-autorais"
            class="text-text-muted hover:text-secondary transition-colors duration-200"
          >
            Créditos & Direitos Autorais
          </NuxtLink>
        </div>

        <div class="border-t border-border-primary/30 pt-8 mt-16">
          <p class="text-xs text-text-muted/80 mb-2">
            Vampire: The Masquerade e World of Darkness sao marcas registradas de seus respectivos proprietarios.
          </p>
          <p class="text-xs text-text-muted/60 mb-1">
            Projeto independente criado por fãs.
          </p>
          <p class="text-xs text-text-muted/50">
            Nao e afiliado, patrocinado ou endossado por Paradox Interactive ou World of Darkness Entertainment.
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

// ============================================
// Page Meta
// ============================================
definePageMeta({
  middleware: []
})

// ============================================  
// Composables e State
// ============================================
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

// ============================================
// Validation & Form Logic
// ============================================
const isFormValid = computed(() => {
  return (
    formData.email.length > 0 &&
    formData.password.length > 0
  )
})

const validateForm = () => {
  // Limpar erros anteriores
  errors.email = ''
  errors.password = ''
  
  let isValid = true
  
  // Validar email
  if (!formData.email.trim()) {
    errors.email = 'Email é obrigatório'
    isValid = false
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Digite um email válido'
      isValid = false
    }
  }
  
  // Validar senha
  if (!formData.password) {
    errors.password = 'Senha é obrigatória'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres'
    isValid = false
  }
  
  return isValid
}

// ============================================
// Handlers
// ============================================
const handleLogin = async () => {
  if (!validateForm()) return

  const credentials = {
    email: formData.email.trim(),
    password: formData.password
  }
  
  const result = await login(credentials)
  
  if (result.success) {
    await navigateTo('/dashboard')
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
