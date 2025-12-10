<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold">Configurações da Campanha</h3>
    
    <div class="bg-surface-card p-6 rounded-lg border border-primary">
      <form @submit.prevent="saveCampaignSettings" class="space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Nome da Campanha
            </label>
            <input
              v-model="settings.name"
              type="text"
              :readonly="!editMode"
              :class="[
                'w-full px-3 py-2 border rounded-md text-text-primary',
                editMode 
                  ? 'border-primary bg-surface focus:border-accent focus:outline-none' 
                  : 'border-border-dark bg-surface-dark'
              ]"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Status da Campanha
            </label>
            <select
              v-model="settings.status"
              :disabled="!editMode"
              :class="[
                'w-full px-3 py-2 border rounded-md text-text-primary',
                editMode 
                  ? 'border-primary bg-surface focus:border-accent focus:outline-none' 
                  : 'border-border-dark bg-surface-dark'
              ]"
            >
              <option value="active">Ativa</option>
              <option value="paused">Pausada</option>
              <option value="completed">Finalizada</option>
            </select>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Descrição
          </label>
          <textarea
            v-model="settings.description"
            rows="4"
            :readonly="!editMode"
            :class="[
              'w-full px-3 py-2 border rounded-md text-text-primary',
              editMode 
                ? 'border-primary bg-surface focus:border-accent focus:outline-none' 
                : 'border-border-dark bg-surface-dark'
            ]"
          ></textarea>
        </div>

        <!-- Campaign Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Máximo de Jogadores
            </label>
            <input
              v-model.number="settings.maxPlayers"
              type="number"
              min="1"
              max="10"
              :readonly="!editMode"
              :class="[
                'w-full px-3 py-2 border rounded-md text-text-primary',
                editMode 
                  ? 'border-primary bg-surface focus:border-accent focus:outline-none' 
                  : 'border-border-dark bg-surface-dark'
              ]"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Visibilidade
            </label>
            <select
              v-model="settings.visibility"
              :disabled="!editMode"
              :class="[
                'w-full px-3 py-2 border rounded-md text-text-primary',
                editMode 
                  ? 'border-primary bg-surface focus:border-accent focus:outline-none' 
                  : 'border-border-dark bg-surface-dark'
              ]"
            >
              <option value="private">Privada</option>
              <option value="public">Pública</option>
            </select>
          </div>
        </div>

        <!-- Campaign Rules -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-3">
            Configurações do Sistema
          </label>
          <div class="space-y-3">
            <label class="flex items-center">
              <input 
                v-model="settings.allowPlayerNotes" 
                type="checkbox" 
                :disabled="!editMode"
                class="mr-2"
              >
              <span class="text-sm text-text-secondary">
                Permitir que jogadores façam anotações
              </span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="settings.allowPlayerMaps" 
                type="checkbox" 
                :disabled="!editMode"
                class="mr-2"
              >
              <span class="text-sm text-text-secondary">
                Permitir que jogadores vejam mapas
              </span>
            </label>
            
            <label class="flex items-center">
              <input 
                v-model="settings.allowPrivateMessages" 
                type="checkbox" 
                :disabled="!editMode"
                class="mr-2"
              >
              <span class="text-sm text-text-secondary">
                Permitir mensagens privadas entre jogadores
              </span>
            </label>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center pt-6 border-t border-border-dark">
          <div class="text-sm text-text-muted">
            <p>Criada em: {{ formatDate(campaign?.createdAt) }}</p>
            <p v-if="campaign?.updatedAt">Última atualização: {{ formatDate(campaign?.updatedAt) }}</p>
          </div>
          
          <div class="flex space-x-3">
            <BaseButton 
              v-if="!editMode" 
              variant="ghost" 
              @click="editMode = true"
            >
              ✏️ Editar
            </BaseButton>
            
            <template v-else>
              <BaseButton variant="ghost" @click="cancelEdit">
                Cancelar
              </BaseButton>
              <BaseButton variant="primary" type="submit">
                💾 Salvar Alterações
              </BaseButton>
            </template>
          </div>
        </div>
      </form>
    </div>

    <!-- Danger Zone -->
    <div class="bg-red-900 bg-opacity-10 border border-red-600 rounded-lg p-6">
      <h4 class="font-medium text-red-400 mb-4">Zona de Perigo</h4>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-text-primary">Arquivar Campanha</p>
            <p class="text-xs text-text-muted">A campanha ficará invisível mas não será deletada</p>
          </div>
          <BaseButton variant="ghost" size="sm" @click="archiveCampaign">
            📁 Arquivar
          </BaseButton>
        </div>
        
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-text-primary">Deletar Campanha</p>
            <p class="text-xs text-text-muted">Esta ação não pode ser desfeita</p>
          </div>
          <BaseButton variant="ghost" size="sm" @click="deleteCampaign" class="text-red-400 hover:bg-red-600">
            🗑️ Deletar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Archive Campaign Confirmation Modal -->
    <div
      v-if="showArchiveModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click="closeArchiveModal"
    >
      <div
        class="bg-surface-card p-6 rounded-lg border-2 border-primary max-w-sm mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-text-primary">Arquivar Campanha</h3>
        <p class="text-text-muted mb-6">
          Tem certeza que deseja arquivar esta campanha? Ela ficará invisível mas não será deletada.
        </p>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="ghost" @click="closeArchiveModal">
            Cancelar
          </BaseButton>
          <BaseButton variant="outline" @click="confirmArchiveCampaign">
            Arquivar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Delete Campaign Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click="closeDeleteModal"
    >
      <div
        class="bg-surface-card p-6 rounded-lg border-2 border-red-600 max-w-sm mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-red-400">⚠️ DELETAR CAMPANHA</h3>
        <p class="text-text-muted mb-2">
          Tem certeza que deseja <strong class="text-red-400">DELETAR PERMANENTEMENTE</strong>
        </p>
        <p class="text-text-muted mb-6">
          "<strong>{{ campaign?.name || 'esta campanha' }}</strong>"?
        </p>
        <p class="text-xs text-red-400 mb-6">Esta ação não pode ser desfeita!</p>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="ghost" @click="closeDeleteModal">
            Cancelar
          </BaseButton>
          <BaseButton variant="danger" @click="confirmDeleteCampaign">
            DELETAR
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <BaseToast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="hideToast"
      class="fixed top-4 right-4 z-[10000]"
    />
  </div>
</template>

<script setup lang="ts">
import type { Campaign } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseToast from '~/components/ui/BaseToast.vue'

// Props
interface Props {
  campaign: Campaign | null
  campaignId: string
}

const props = defineProps<Props>()

// Reactive data
const editMode = ref(false)

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)

// Confirmation modal states
const showArchiveModal = ref(false)
const showDeleteModal = ref(false)
const settings = ref({
  name: '',
  description: '',
  status: 'active',
  maxPlayers: 6,
  visibility: 'private',
  allowPlayerNotes: true,
  allowPlayerMaps: true,
  allowPrivateMessages: false
})

// Initialize settings from campaign data
watchEffect(() => {
  if (props.campaign) {
    settings.value = {
      name: props.campaign.name || '',
      description: props.campaign.description || '',
      status: 'active', // Future: add to Campaign interface
      maxPlayers: 6, // Future: add to Campaign interface
      visibility: 'private', // Future: add to Campaign interface
      allowPlayerNotes: true,
      allowPlayerMaps: true,
      allowPrivateMessages: false
    }
  }
})

// Methods
const saveCampaignSettings = () => {
  console.log('Salvando configurações:', settings.value)
  // Future: Save to database
  editMode.value = false
  showToastMessage('Configurações salvas com sucesso!', 'success')
}

const cancelEdit = () => {
  editMode.value = false
  // Reset to original values
  if (props.campaign) {
    settings.value = {
      name: props.campaign.name || '',
      description: props.campaign.description || '',
      status: 'active',
      maxPlayers: 6,
      visibility: 'private',
      allowPlayerNotes: true,
      allowPlayerMaps: true,
      allowPrivateMessages: false
    }
  }
}

const archiveCampaign = () => {
  showArchiveModal.value = true
}

const confirmArchiveCampaign = () => {
  console.log('Arquivando campanha...')
  // Future: Archive campaign
  showToastMessage('Campanha arquivada com sucesso', 'info')
  showArchiveModal.value = false
}

const deleteCampaign = () => {
  showDeleteModal.value = true
}

const confirmDeleteCampaign = () => {
  console.log('Deletando campanha...')
  // Future: Delete campaign
  showToastMessage('Campanha deletada permanentemente', 'warning')
  showDeleteModal.value = false
}

const closeArchiveModal = () => {
  showArchiveModal.value = false
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const hideToast = () => {
  showToast.value = false
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>