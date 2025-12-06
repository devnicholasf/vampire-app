<template>
  <NuxtLayout name="auth">
    <AuthForm>
      <template #header>
        <AuthHeader 
          title="Recuperar Senha"
          subtitle="Digite seu e-mail para receber as instruções de recuperação"
        />
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <BaseInput
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          required
          autocomplete="email"
          label="E-mail"
        />

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :disabled="!email"
          class="w-full"
        >
          Enviar Instruções
        </BaseButton>

        <div class="text-center">
          <NuxtLink
            to="/login"
            class="text-sm text-secondary hover:text-accent transition-colors duration-200 font-medium"
          >
            Voltar ao Login
          </NuxtLink>
        </div>
      </form>
    </AuthForm>
  </NuxtLayout>
</template>

<script setup lang="ts">
// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseInput from '~/components/ui/BaseInput.vue'

definePageMeta({
  layout: 'auth'
})

const email = ref('')

const handleSubmit = () => {
  // Simulação de envio de e-mail
  alert(`Instruções enviadas para: ${email.value}`)
  
  // Redirecionar de volta ao login
  navigateTo('/login')
}
</script>