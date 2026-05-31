<template>
  <div class="relative">
    <!-- User Info Button -->
    <BaseButton
      variant="ghost"
      size="sm"
      @click="openModal"
      class="flex items-center gap-2 text-text-primary hover:text-red-400 transition-colors"
    >
      <div class="w-8 h-8 bg-red-500/20 rounded-full overflow-hidden flex items-center justify-center border border-border-red/30">
        <img
          v-if="profileAvatarUrl"
          :src="profileAvatarUrl"
          alt="Avatar do perfil"
          class="w-full h-full object-cover"
        >
        <span v-else class="text-sm font-bold text-red-400">
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
        <div class="bg-surface border border-border rounded-vampire p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-df-red font-cinzel flex items-center gap-2">
              <svg class="w-5 h-5 text-df-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
              </svg>
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
          <form @submit.prevent="handleSaveProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Avatar -->
              <div class="md:col-span-1 flex flex-col items-center justify-start gap-3 pt-1">
                <div class="w-24 h-24 rounded-full border border-border overflow-hidden bg-surface-dark flex items-center justify-center">
                  <img
                    v-if="avatarPreviewUrl"
                    :src="avatarPreviewUrl"
                    alt="Preview da foto de perfil"
                    class="w-full h-full object-cover"
                  >
                  <span v-else class="text-lg font-bold text-red-400">
                    {{ userInitials }}
                  </span>
                </div>
                <label
                  for="profile-avatar-input"
                  class="text-xs font-semibold text-df-gold hover:text-df-red transition-colors cursor-pointer"
                >
                  Alterar Foto
                </label>
                <input
                  id="profile-avatar-input"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                >
              </div>

              <!-- Dados -->
              <div class="md:col-span-2 space-y-4">
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
                </div>

                <button
                  type="button"
                  class="text-xs font-semibold text-df-gold hover:text-df-red transition-colors"
                  @click="togglePasswordFields"
                >
                  Alterar senha da conta
                </button>

                <div v-if="showPasswordFields" class="space-y-3 border border-border rounded-vampire p-3 bg-surface-dark/40">
                  <div>
                    <label class="block text-text-secondary text-sm font-medium mb-2">
                      Senha Atual
                    </label>
                    <input
                      v-model="passwordForm.currentPassword"
                      type="password"
                      autocomplete="current-password"
                      class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label class="block text-text-secondary text-sm font-medium mb-2">
                      Nova Senha
                    </label>
                    <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      autocomplete="new-password"
                      class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p v-if="formError" class="text-xs text-red-400">
              {{ formError }}
            </p>

            <!-- Buttons -->
            <div class="flex gap-3 pt-1">
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
  avatar?: string | null
}

interface Props {
  user: UserData | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'profile-updated': [user: UserData]
}>()

const { updateUserProfile, updateUserPassword, uploadProfileAvatar } = useAuth()

// State
const showProfileModal = ref(false)
const showConfirmationModal = ref(false)
const loading = ref(false)
const showPasswordFields = ref(false)
const formError = ref('')
const avatarPreviewUrl = ref('')
const selectedAvatarFile = ref<File | null>(null)
const profileForm = ref({
  name: '',
  email: ''
})
const passwordForm = ref({
  currentPassword: '',
  newPassword: ''
})

// Computed
const displayName = computed(() => {
  if (!props.user) return 'Usuário'
  return props.user.username || props.user.name || 'Usuário'
})

const profileAvatarUrl = computed(() => {
  return String(props.user?.avatar || '').trim()
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
    avatarPreviewUrl.value = props.user.avatar || ''
  }
  selectedAvatarFile.value = null
  passwordForm.value = { currentPassword: '', newPassword: '' }
  showPasswordFields.value = false
  formError.value = ''
  showProfileModal.value = true
}

// Watch for user changes to update form
watch(() => props.user, (newUser) => {
  if (newUser && showProfileModal.value) {
    profileForm.value = {
      name: newUser.username || newUser.name || '',
      email: newUser.email || ''
    }
    avatarPreviewUrl.value = newUser.avatar || avatarPreviewUrl.value
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
      avatarPreviewUrl.value = props.user.avatar || avatarPreviewUrl.value
    })
  }
})

const togglePasswordFields = () => {
  showPasswordFields.value = !showPasswordFields.value
  if (!showPasswordFields.value) {
    passwordForm.value = { currentPassword: '', newPassword: '' }
  }
}

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    formError.value = 'Selecione um arquivo de imagem válido.'
    return
  }

  selectedAvatarFile.value = file
  formError.value = ''

  const reader = new FileReader()
  reader.onload = () => {
    avatarPreviewUrl.value = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

const closeModal = () => {
  selectedAvatarFile.value = null
  showProfileModal.value = false
}

const closeConfirmationModal = () => {
  showConfirmationModal.value = false
}

const handleSaveProfile = async () => {
  if (!props.user) return
  formError.value = ''

  if (showPasswordFields.value) {
    if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
      formError.value = 'Preencha a senha atual e a nova senha para continuar.'
      return
    }

    if (passwordForm.value.newPassword.length < 6) {
      formError.value = 'A nova senha deve ter pelo menos 6 caracteres.'
      return
    }
  }

  // Mostrar modal de confirmação
  showConfirmationModal.value = true
}

const confirmSaveProfile = async () => {
  if (!props.user) return
  
  loading.value = true
  
  try {
    formError.value = ''

    let avatarToSave: string | null | undefined = props.user?.avatar ?? null
    if (selectedAvatarFile.value) {
      avatarToSave = await uploadProfileAvatar(selectedAvatarFile.value)
    }

    // Chamar composable para atualizar no Supabase
    const updatedUser = await updateUserProfile({
      username: profileForm.value.name,
      email: profileForm.value.email,
      avatar: avatarToSave
    })

    if (showPasswordFields.value) {
      await updateUserPassword(
        passwordForm.value.currentPassword,
        passwordForm.value.newPassword
      )
    }
    
    // Emit updated user data
    emit('profile-updated', updatedUser)
    
    // Fechar modals
    closeConfirmationModal()
    closeModal()
    
  } catch (error: any) {
    console.error('Erro ao salvar perfil:', error)
    formError.value = error?.message || 'Não foi possível salvar as alterações.'
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