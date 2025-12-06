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

      <!-- Formulário -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Nome de Usuário -->
        <BaseInput
          v-model="form.username"
          type="text"
          label="Nome de Usuário"
          placeholder="Como deseja ser chamado"
          :error="errors.username"
          :disabled="loading"
          required
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
          required
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
          required
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
          required
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
            required
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

// Validar username
watch(() => form.value.username, (value) => {
  if (value && value.length < 3) {
    errors.username = 'Nome deve ter no mínimo 3 caracteres'
  } else {
    errors.username = ''
  }
})

// Validar email
watch(() => form.value.email, (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (value && !emailRegex.test(value)) {
    errors.email = 'Email inválido'
  } else {
    errors.email = ''
  }
})

// Validar senha
watch(() => form.value.password, (value) => {
  if (value && value.length < 6) {
    errors.password = 'Senha deve ter no mínimo 6 caracteres'
  } else {
    errors.password = ''
  }
})

// Validar confirmação
watch(() => form.value.confirmPassword, (value) => {
  if (value && value !== form.value.password) {
    errors.confirmPassword = 'As senhas não coincidem'
  } else {
    errors.confirmPassword = ''
  }
})

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

// Validar formulário
const isFormValid = computed(() => {
  return (
    form.value.username.length >= 3 &&
    form.value.email.length > 0 &&
    form.value.password.length >= 6 &&
    form.value.confirmPassword === form.value.password &&
    form.value.acceptTerms &&
    !errors.username &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword
  )
})

// Handle register
const handleRegister = async () => {
  if (!isFormValid.value) return

  const data: RegisterData = {
    username: form.value.username,
    email: form.value.email,
    password: form.value.password,
    confirmPassword: form.value.confirmPassword
  }

  const result = await register(data)
  
  if (result.success) {
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
