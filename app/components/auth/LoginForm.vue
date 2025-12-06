<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <!-- Email -->
    <BaseInput
      v-model="formData.email"
      type="email"
      label="Email"
      placeholder="seu@email.com"
      icon-left="✉️"
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
      icon-left="🔒"
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
</template>

<script setup lang="ts">
interface LoginCredentials {
  email: string
  password: string
}

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'submit', credentials: LoginCredentials): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
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

// Handle submit
const handleSubmit = () => {
  if (!isFormValid.value) return

  const credentials: LoginCredentials = {
    email: formData.email,
    password: formData.password
  }

  emit('submit', credentials)
}
</script>