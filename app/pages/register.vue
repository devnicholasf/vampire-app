<template>
  <NuxtLayout name="auth">
    <div class="space-y-6">
      <!-- Título -->
      <div class="text-center">
        <h2 class="text-2xl font-bold text-text-primary mb-2">
          Junte-se à Sociedade Noturna
        </h2>
        <p class="text-text-secondary text-sm">
          Crie sua conta e comece suas crônicas
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

      <!-- Mensagem de sucesso para confirmação de email -->
      <div
        v-if="successMessage"
        class="p-4 bg-success/10 border border-success rounded-vampire text-success-light text-sm animate-slide-up"
        role="alert"
      >
        <div class="flex items-center">
          <span class="text-lg mr-2">✅</span>
          <span>{{ successMessage }}</span>
        </div>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleRegister" class="space-y-4" novalidate>
        <!-- Nome de Usuário -->
        <BaseInput
          v-model="form.username"
          type="text"
          label="Nome de Usuário"
          placeholder="Como deseja ser chamado"
          :error="errors.username"
          :disabled="loading"
          autocomplete="username"
        />

        <!-- Email -->
        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="seu@email.com"
          :error="errors.email"
          :disabled="loading"
          autocomplete="email"
        />

        <!-- Senha -->
        <BaseInput
          v-model="form.password"
          type="password"
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          :error="errors.password"
          :disabled="loading"
          autocomplete="new-password"
          helper-text="Mínimo de 6 caracteres"
        />

        <!-- Confirmar Senha -->
        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          label="Confirmar Senha"
          placeholder="Digite a senha novamente"
          :error="errors.confirmPassword"
          :disabled="loading"
          autocomplete="new-password"
        />

        <!-- Password Strength Indicator -->
        <div v-if="form.password" class="space-y-2">
          <div class="flex items-center space-x-2">
            <div class="flex-1 h-2 bg-surface-dark rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300"
                :class="passwordStrengthColor"
                :style="{ width: `${passwordStrength}%` }"
              ></div>
            </div>
            <span class="text-xs text-text-muted">
              {{ passwordStrengthText }}
            </span>
          </div>
        </div>

        <!-- Termos -->
        <label class="flex items-start space-x-3 cursor-pointer group">
          <input
            v-model="form.acceptTerms"
            type="checkbox"
            class="mt-1 w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-background transition-colors"
          />
          <span class="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            Aceito os
            <NuxtLink to="/terms" class="text-secondary hover:text-accent transition-colors duration-200">
              Termos de Uso
            </NuxtLink>
            e
            <NuxtLink to="/privacy" class="text-secondary hover:text-accent transition-colors duration-200">
              Política de Privacidade
            </NuxtLink>
          </span>
        </label>

        <!-- Botão Submit -->
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="loading"
          :disabled="!isFormValid"
        >
          {{ loading ? 'Criando conta...' : 'Criar Conta' }}
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

      <!-- Link para login -->
      <div class="text-center">
        <p class="text-text-secondary text-sm">
          Já tem uma conta?
          <NuxtLink
            to="/login"
            class="text-secondary hover:text-accent font-semibold transition-colors duration-200 ml-1"
          >
            Fazer login
          </NuxtLink>
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'

// @ts-ignore - Auto-importado pelo Nuxt
import type { RegisterData } from '~/types'

definePageMeta({
  middleware: []
})

// @ts-ignore - Auto-importado pelo Nuxt
const { register, loading, error: authError } = useAuth()
const router = useRouter()

// Mensagem de sucesso
const successMessage = ref('')

// Form state
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// Validação local
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Validar formulário - apenas verifica se tem conteúdo
const isFormValid = computed(() => {
  return (
    form.value.username.length > 0 &&
    form.value.email.length > 0 &&
    form.value.password.length > 0 &&
    form.value.confirmPassword.length > 0 &&
    form.value.acceptTerms
  )
})

// Validação completa no submit
const validateForm = () => {
  // Limpar erros anteriores
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  
  let isValid = true
  
  // Validar nome
  if (!form.value.username.trim()) {
    errors.username = 'Nome é obrigatório'
    isValid = false
  } else if (form.value.username.length < 3) {
    errors.username = 'Nome deve ter pelo menos 3 caracteres'
    isValid = false
  }
  
  // Validar email
  if (!form.value.email.trim()) {
    errors.email = 'Email é obrigatório'
    isValid = false
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      errors.email = 'Digite um email válido'
      isValid = false
    }
  }
  
  // Validar senha
  if (!form.value.password) {
    errors.password = 'Senha é obrigatória'
    isValid = false
  } else if (form.value.password.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres'
    isValid = false
  }
  
  // Validar confirmação de senha
  if (!form.value.confirmPassword) {
    errors.confirmPassword = 'Confirme sua senha'
    isValid = false
  } else if (form.value.confirmPassword !== form.value.password) {
    errors.confirmPassword = 'As senhas não coincidem'
    isValid = false
  }
  
  // Validar termos
  if (!form.value.acceptTerms) {
    isValid = false
  }
  
  return isValid
}

// Password strength
const passwordStrength = computed(() => {
  const pass = form.value.password
  if (!pass) return 0
  
  let strength = 0
  if (pass.length >= 6) strength += 25
  if (pass.length >= 8) strength += 25
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 25
  if (/\d/.test(pass)) strength += 25
  
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return ''
  if (strength <= 25) return 'Fraca'
  if (strength <= 50) return 'Média'
  if (strength <= 75) return 'Boa'
  return 'Forte'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 25) return 'bg-error'
  if (strength <= 50) return 'bg-warning'
  if (strength <= 75) return 'bg-info'
  return 'bg-success'
})

// Handle register
const handleRegister = async () => {
  if (!validateForm()) return

  // Limpar mensagens anteriores
  successMessage.value = ''

  const data: RegisterData = {
    username: form.value.username.trim(),
    email: form.value.email.trim(),
    password: form.value.password,
    confirmPassword: form.value.confirmPassword
  }

  const result = await register(data)
  
  if (result.success) {
    // Sempre redirecionar para dashboard após registro bem-sucedido
    await router.push('/dashboard')
  }
}
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
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
