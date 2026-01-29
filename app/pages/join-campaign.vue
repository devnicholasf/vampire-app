<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="bg-surface-card p-8 rounded-lg border border-primary shadow-lg">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-text-primary mb-2">
            🧛‍♂️ Entrar em Campanha
          </h1>
          <p class="text-text-muted">
            Use o código de convite para entrar em uma campanha
          </p>
        </div>

        <form @submit.prevent="handleJoin" class="space-y-6">
          <!-- Código de Convite -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Código de Convite *
            </label>
            <BaseInput
              v-model="inviteCode"
              placeholder="Ex: GELYL0"
              :disabled="loading"
              required
              class="uppercase"
              maxlength="6"
            />
            <p class="text-xs text-text-muted mt-1">
              Código fornecido pelo Mestre da campanha
            </p>
          </div>

          <!-- Nome do Personagem -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Nome do seu Personagem *
            </label>
            <BaseInput
              v-model="characterName"
              placeholder="Ex: Marcus Ventrue"
              :disabled="loading"
              required
            />
            <p class="text-xs text-text-muted mt-1">
              Como seu personagem será conhecido na campanha
            </p>
          </div>

          <!-- Botões -->
          <div class="flex space-x-4">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="loading"
              :disabled="!inviteCode || !characterName"
              class="flex-1"
            >
              {{ loading ? 'Entrando...' : 'Entrar na Campanha' }}
            </BaseButton>
            
            <BaseButton
              type="button"
              variant="ghost"
              @click="$router.push('/dashboard')"
              :disabled="loading"
            >
              Cancelar
            </BaseButton>
          </div>
        </form>

        <!-- Success Message -->
        <div 
          v-if="successMessage" 
          class="mt-6 p-4 bg-green-600/10 border border-green-600/30 rounded-lg"
        >
          <div class="flex items-start">
            <span class="text-green-400 mr-3">✅</span>
            <div>
              <p class="text-green-400 font-medium">Sucesso!</p>
              <p class="text-green-400/80 text-sm mt-1">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div 
          v-if="errorMessage" 
          class="mt-6 p-4 bg-red-600/10 border border-red-600/30 rounded-lg"
        >
          <div class="flex items-start">
            <span class="text-red-400 mr-3">❌</span>
            <div>
              <p class="text-red-400 font-medium">Erro</p>
              <p class="text-red-400/80 text-sm mt-1">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, navigateTo } from 'nuxt/app'
import BaseInput from '~/components/ui/BaseInput.vue'
import BaseButton from '~/components/ui/BaseButton.vue'



// State
const inviteCode = ref('')
const characterName = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Composables
const { joinCampaignByInviteCode } = useCampaign()
const router = useRouter()

// Methods
const handleJoin = async () => {
  if (!inviteCode.value || !characterName.value) return

  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    console.log('Tentando entrar na campanha:', {
      inviteCode: inviteCode.value,
      characterName: characterName.value
    })

    const result = await joinCampaignByInviteCode(
      inviteCode.value.trim().toUpperCase(),
      characterName.value.trim()
    )

    console.log('Resultado:', result)

    successMessage.value = `Você entrou na campanha "${result.campaign.name}" como ${result.player.name}!`
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

  } catch (error: any) {
    console.error('Erro ao entrar na campanha:', error)
    errorMessage.value = error.message || 'Erro desconhecido ao entrar na campanha'
  } finally {
    loading.value = false
  }
}

// SEO
useSeoMeta({
  title: 'Entrar em Campanha - Vampire RPG',
  description: 'Use o código de convite para entrar em uma campanha de Vampire: The Masquerade'
})
</script>

<style scoped>
.uppercase {
  text-transform: uppercase;
}
</style>