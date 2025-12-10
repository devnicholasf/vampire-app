<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">Anotações da Campanha</h3>
      <BaseButton variant="primary" size="sm" @click="showCreateModal = true">
        + Nova Anotação
      </BaseButton>
    </div>
    
    <!-- Notes List -->
    <div v-if="notes.length > 0" class="space-y-4">
      <div 
        v-for="note in notes" 
        :key="note.id"
        class="bg-surface-card p-4 rounded-lg border border-primary"
      >
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-medium text-text-primary">{{ note.title }}</h4>
          <div class="flex space-x-1">
            <BaseButton variant="ghost" size="sm" @click="editNote(note)">
              ✏️
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="confirmDeleteNote(note)">
              🗑️
            </BaseButton>
          </div>
        </div>
        <p class="text-text-secondary text-sm mb-2">{{ note.content }}</p>
        <div class="flex justify-between items-center text-xs text-text-muted">
          <span>{{ formatDate(note.createdAt) }}</span>
          <span v-if="note.tags" class="flex space-x-1">
            <span 
              v-for="tag in note.tags" 
              :key="tag"
              class="px-2 py-1 bg-secondary rounded text-white"
            >
              {{ tag }}
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-4xl mb-4">📝</div>
      <p class="text-text-muted mb-6">Nenhuma anotação criada ainda.</p>
      <BaseButton variant="primary" @click="showCreateModal = true">
        + Criar Primeira Anotação
      </BaseButton>
    </div>

    <!-- Create/Edit Modal -->
    <div 
      v-if="showCreateModal || editingNote" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-surface-card rounded-lg border border-primary p-6 w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-text-primary">
            {{ editingNote ? 'Editar Anotação' : 'Nova Anotação' }}
          </h3>
          <BaseButton variant="ghost" size="sm" @click="closeModal">
            ✕
          </BaseButton>
        </div>

        <form @submit.prevent="saveNote" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Título *
            </label>
            <input
              v-model="noteForm.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              placeholder="Título da anotação"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Conteúdo *
            </label>
            <textarea
              v-model="noteForm.content"
              rows="6"
              required
              class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              placeholder="Escreva sua anotação aqui..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              Tags (separadas por vírgula)
            </label>
            <input
              v-model="tagsInput"
              type="text"
              class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              placeholder="sessão, npcs, plot..."
            >
          </div>

          <div class="flex justify-end space-x-3">
            <BaseButton variant="ghost" @click="closeModal" type="button">
              Cancelar
            </BaseButton>
            <BaseButton variant="primary" type="submit">
              {{ editingNote ? 'Salvar' : 'Criar' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Note Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      @click="closeDeleteModal"
    >
      <div
        class="bg-surface-card p-6 rounded-lg border-2 border-primary max-w-sm mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4 text-text-primary">Deletar Anotação</h3>
        <p class="text-text-muted mb-6">
          Tem certeza que deseja deletar <strong>"{{ deletingNote?.title }}"</strong>?
        </p>
        <div class="flex justify-end space-x-3">
          <BaseButton variant="ghost" @click="closeDeleteModal">
            Cancelar
          </BaseButton>
          <BaseButton variant="danger" @click="executeDeleteNote">
            Deletar
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
import BaseButton from '~/components/ui/BaseButton.vue'

// Props
interface Props {
  campaignId: string
}

const props = defineProps<Props>()

interface Note {
  id: string
  title: string
  content: string
  tags?: string[]
  createdAt: Date
}

// Reactive data
const notes = ref<Note[]>([])
const showCreateModal = ref(false)
const editingNote = ref<Note | null>(null)

// Delete confirmation states
const showDeleteModal = ref(false)
const deletingNote = ref<Note | null>(null)

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)
const noteForm = ref({
  title: '',
  content: ''
})
const tagsInput = ref('')

// Methods
const editNote = (note: Note) => {
  editingNote.value = note
  noteForm.value = {
    title: note.title,
    content: note.content
  }
  tagsInput.value = note.tags?.join(', ') || ''
  showCreateModal.value = true
}

const confirmDeleteNote = (note: Note) => {
  deletingNote.value = note
  showDeleteModal.value = true
}

const executeDeleteNote = () => {
  if (deletingNote.value) {
    notes.value = notes.value.filter(n => n.id !== deletingNote.value!.id)
    showToastMessage(`Anotação "${deletingNote.value.title}" foi removida`, 'success')
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingNote.value = null
}

const closeModal = () => {
  showCreateModal.value = false
  editingNote.value = null
  noteForm.value = { title: '', content: '' }
  tagsInput.value = ''
}

const saveNote = () => {
  const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)
  
  const noteData: Note = {
    id: editingNote.value?.id || `note_${Date.now()}`,
    title: noteForm.value.title,
    content: noteForm.value.content,
    tags: tags.length > 0 ? tags : undefined,
    createdAt: editingNote.value?.createdAt || new Date()
  }

  if (editingNote.value) {
    const index = notes.value.findIndex(n => n.id === editingNote.value!.id)
    if (index !== -1) {
      notes.value[index] = noteData
    }
  } else {
    notes.value.unshift(noteData)
  }

  closeModal()
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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

// Expose count for parent
defineExpose({
  count: computed(() => notes.value.length)
})
</script>