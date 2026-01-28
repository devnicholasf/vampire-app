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
                :placeholder="displayName"
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors"
              />
              <p class="text-xs text-text-muted mt-1">
                Valor atual: {{ displayName }}
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
                :placeholder="user?.email || 'Email atual'"
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors"
              />
              <p class="text-xs text-text-muted mt-1">
                Valor atual: {{ user?.email || 'Email não informado' }}
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

    <!-- Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showConfirmationModal"
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
        @click.self="closeConfirmationModal"
      >
        <div class="bg-surface border border-border rounded-vampire p-6 max-w-sm w-full">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              Confirmar Alterações
            </h3>
          </div>

          <p class="text-text-primary mb-6">
            Tem certeza que deseja salvar as alterações no seu perfil?
          </p>

          <!-- Buttons -->
          <div class="flex gap-3">
            <BaseButton
              type="button"
              variant="ghost"
              class="flex-1"
              @click="closeConfirmationModal"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="button"
              variant="primary"
              class="flex-1"
              :disabled="loading"
              @click="confirmSaveProfile"
            >
              {{ loading ? 'Salvando...' : 'Confirmar' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import BaseButton from './BaseButton.vue'
import { useAuth } from '../../composables/useAuth'

interface UserData {
  id: string
  email: string
  username?: string
  name?: string
}

interface Props {
  user: UserData | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'profile-updated': [user: UserData]
}>()

const { updateUserProfile } = useAuth()

// State
const showProfileModal = ref(false)
const showConfirmationModal = ref(false)
const loading = ref(false)
const profileForm = ref({
  name: '',
  email: ''
})

// Computed
const displayName = computed(() => {
  if (!props.user) return 'Usuário'
  return props.user.username || props.user.name || 'Usuário'
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
      name: props.user.username || props.user.name || '',
      email: props.user.email || ''
    }
  }
  showProfileModal.value = true
}

// Watch for user changes to update form
watch(() => props.user, (newUser) => {
  if (newUser && showProfileModal.value) {
    profileForm.value = {
      name: newUser.username || newUser.name || '',
      email: newUser.email || ''
    }
  }
}, { immediate: true })

// Watch for modal opening to ensure form is populated
watch(showProfileModal, (isOpen) => {
  if (isOpen && props.user) {
    // Use nextTick to ensure DOM is ready
    nextTick(() => {
      profileForm.value = {
        name: props.user.username || props.user.name || '',
        email: props.user.email || ''
      }
    })
  }
})

const closeModal = () => {
  showProfileModal.value = false
}

const closeConfirmationModal = () => {
  showConfirmationModal.value = false
}

const handleSaveProfile = async () => {
  if (!props.user) return
  
  // Mostrar modal de confirmação
  showConfirmationModal.value = true
}

const confirmSaveProfile = async () => {
  if (!props.user) return
  
  loading.value = true
  
  try {
    // Chamar composable para atualizar no Supabase
    const updatedUser = await updateUserProfile({
      username: profileForm.value.name,
      email: profileForm.value.email
    })
    
    // Emit updated user data
    emit('profile-updated', updatedUser)
    
    // Fechar modals
    closeConfirmationModal()
    closeModal()
    
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
    // TODO: Mostrar notificação de erro
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