<template>
  <form @submit.prevent="handleSubmit" class="space-y-5" novalidate>
    <!-- Mensagem de erro geral -->
    <div
      v-if="authError"
      class="p-4 bg-red-900/20 border border-red-400 rounded-lg text-red-300 text-sm animate-slide-up"
      role="alert"
    >
      <div class="flex items-center">
        <span class="text-lg mr-3">⚠️</span>
        <span>{{ authError }}</span>
      </div>
    </div>

    <!-- Email -->
    <BaseInput
      v-model="formData.email"
      type="email"
      label="Email"
      placeholder="seu@email.com"
      icon-left="✉️"
      :error="errors.email"
      :disabled="loading"
      autocomplete="email"
    />

    <!-- Senha -->
    <BaseInput
      v-model="formData.password"
      type="password"
      label="Senha"
      placeholder="••••••••"
      icon-left="🔒"
      :error="errors.password"
      :disabled="loading"
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
</template>

<script setup lang="ts">
interface LoginCredentials {
  email: string
  password: string
}

interface Props {
  loading?: boolean
  authError?: string | null
}

interface Emits {
  (e: 'submit', credentials: LoginCredentials): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  authError: null
})

const emit = defineEmits<Emits>()

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

// Validar formulário - apenas verifica se tem conteúdo
const isFormValid = computed(() => {
  return (
    formData.email.length > 0 &&
    formData.password.length > 0
  )
})

// Validação final antes do submit
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

// Handle submit
const handleSubmit = () => {
  // Validar formulário antes de submeter
  if (!validateForm()) return

  const credentials: LoginCredentials = {
    email: formData.email.trim(),
    password: formData.password
  }

  emit('submit', credentials)
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