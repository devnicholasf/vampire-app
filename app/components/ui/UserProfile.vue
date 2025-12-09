<template>
  <div class="relative">
    <!-- User Info Button -->
    <BaseButton
      variant="ghost"
      size="sm"
      @click="showProfileModal = true"
      class="flex items-center gap-2 text-text-primary hover:text-red-400 transition-colors"
    >
      <div class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
        <span class="text-sm font-bold text-red-400">
          {{ userInitials }}
        </span>
      </div>
      <span class="hidden sm:inline font-medium">{{ displayName }}</span>
    </BaseButton>

    <!-- Profile Modal -->
    <Teleport to="body">
      <div
        v-if="showProfileModal"
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
        @click.self="closeModal"
      >
        <div class="bg-surface border border-border rounded-vampire p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-red-400 flex items-center gap-2">
              <span>👤</span>
              Perfil do Usuário
            </h2>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="closeModal"
              class="text-text-muted hover:text-text-primary"
            >
              ✕
            </BaseButton>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSaveProfile" class="space-y-4">
            <!-- Nome -->
            <div>
              <label class="block text-text-secondary text-sm font-medium mb-2">
                Nome de Exibição
              </label>
              <input
                v-model="profileForm.name"
                type="text"
                placeholder="Como você gostaria de ser chamado?"
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors"
              />
              <p class="text-xs text-text-muted mt-1">
                Se vazio, será usado seu email
              </p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-text-secondary text-sm font-medium mb-2">
                Email
              </label>
              <input
                v-model="profileForm.email"
                type="email"
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <!-- Bio -->
            <div>
              <label class="block text-text-secondary text-sm font-medium mb-2">
                Biografia
              </label>
              <textarea
                v-model="profileForm.bio"
                rows="3"
                placeholder="Conte um pouco sobre você como jogador/mestre..."
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors resize-none"
              ></textarea>
              <p class="text-xs text-text-muted mt-1">
                Máximo 200 caracteres
              </p>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <BaseButton
                type="button"
                variant="ghost"
                class="flex-1"
                @click="closeModal"
              >
                Cancelar
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                class="flex-1"
                :disabled="loading"
              >
                {{ loading ? 'Salvando...' : 'Salvar' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from './BaseButton.vue'

interface UserData {
  id: string
  email: string
  name?: string
  bio?: string
}

interface Props {
  user: UserData | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'profile-updated': [user: UserData]
}>()

// State
const showProfileModal = ref(false)
const loading = ref(false)
const profileForm = ref({
  name: '',
  email: '',
  bio: ''
})

// Computed
const displayName = computed(() => {
  if (!props.user) return 'Usuário'
  return props.user.name || props.user.email || 'Usuário'
})

const userInitials = computed(() => {
  const name = displayName.value
  const words = name.split(' ').filter((word: string) => word.length > 0)
  
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  
  if (words.length > 0 && words[0]) {
    return words[0].substring(0, 2).toUpperCase()
  }
  
  return 'U'
})

// Methods
const openModal = () => {
  if (props.user) {
    profileForm.value = {
      name: props.user.name || '',
      email: props.user.email || '',
      bio: props.user.bio || ''
    }
  }
  showProfileModal.value = true
}

const closeModal = () => {
  showProfileModal.value = false
}

const handleSaveProfile = async () => {
  if (!props.user) return
  
  loading.value = true
  
  try {
    // TODO: Implementar API call
    console.log('Salvando perfil:', profileForm.value)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Emit updated user data
    emit('profile-updated', {
      ...props.user,
      name: profileForm.value.name,
      email: profileForm.value.email,
      bio: profileForm.value.bio
    })
    
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
  } finally {
    loading.value = false
  }
}

// Expose methods for external access
defineExpose({
  openModal
})
</script>

<style scoped>
/* Adicionar animações personalizadas se necessário */
</style>