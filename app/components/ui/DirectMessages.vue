<template>
  <div class="relative">
    <!-- DM Button -->
    <BaseButton
      variant="ghost"
      size="sm"
      @click="showMessages = !showMessages"
      class="relative p-2 text-text-muted hover:text-red-400 transition-colors"
    >
      <div class="relative">
        <svg 
          class="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        
        <!-- Unread Messages Badge -->
        <div 
          v-if="unreadMessagesCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold"
        >
          {{ unreadMessagesCount > 99 ? '99+' : unreadMessagesCount }}
        </div>
      </div>
    </BaseButton>

    <!-- Messages Dropdown -->
    <div
      v-if="showMessages"
      v-click-outside="() => showMessages = false"
      class="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-vampire shadow-xl z-50 max-h-96 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h3 class="font-semibold text-text-primary">Mensagens</h3>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="showNewMessageModal = true"
          class="text-xs text-red-400 hover:text-red-300"
        >
          + Nova
        </BaseButton>
      </div>

      <!-- Conversations List -->
      <div class="max-h-80 overflow-y-auto">
        <div v-if="conversations.length === 0" class="p-6 text-center text-text-muted">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p>Nenhuma conversa</p>
        </div>

        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          :class="[
            'p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-surface-hover transition-colors',
            { 'bg-red-500/5': conversation.unreadCount > 0 }
          ]"
          @click="openConversation(conversation)"
        >
          <div class="flex gap-3">
            <!-- Avatar -->
            <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-bold text-red-400">
                {{ getInitials(conversation.otherUser.name) }}
              </span>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-text-primary truncate">
                  {{ conversation.otherUser.name }}
                </p>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-text-secondary">
                    {{ formatTime(conversation.lastMessage?.createdAt) }}
                  </span>
                  <div 
                    v-if="conversation.unreadCount > 0"
                    class="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold"
                  >
                    {{ conversation.unreadCount }}
                  </div>
                </div>
              </div>
              
              <p class="text-sm text-text-muted line-clamp-1 mt-1">
                {{ conversation.lastMessage?.content || 'Nova conversa' }}
              </p>
              
              <div v-if="conversation.campaign" class="flex items-center gap-1 mt-1">
                <span class="text-xs text-text-secondary">📖</span>
                <span class="text-xs text-text-secondary">{{ conversation.campaign.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Message Modal -->
    <Teleport to="body">
      <div
        v-if="showNewMessageModal"
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
        @click.self="closeNewMessageModal"
      >
        <div class="bg-surface border border-border rounded-vampire p-6 max-w-md w-full">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-red-400">Nova Mensagem</h3>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="closeNewMessageModal"
              class="text-text-muted hover:text-text-primary"
            >
              ✕
            </BaseButton>
          </div>

          <form @submit.prevent="sendNewMessage" class="space-y-4">
            <!-- Recipient -->
            <div>
              <label class="block text-text-secondary text-sm font-medium mb-2">
                Para
              </label>
              <select
                v-model="newMessage.recipient"
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Selecione um destinatário</option>
                <option v-for="contact in availableContacts" :key="contact.id" :value="contact.id">
                  {{ contact.name }} ({{ contact.role }})
                </option>
              </select>
            </div>

            <!-- Message -->
            <div>
              <label class="block text-text-secondary text-sm font-medium mb-2">
                Mensagem
              </label>
              <textarea
                v-model="newMessage.content"
                rows="4"
                placeholder="Digite sua mensagem..."
                class="w-full px-4 py-3 bg-surface-dark border border-border rounded-vampire text-text-primary placeholder:text-text-muted focus:outline-none focus:border-red-500 resize-none"
                required
              ></textarea>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3">
              <BaseButton
                type="button"
                variant="ghost"
                class="flex-1"
                @click="closeNewMessageModal"
              >
                Cancelar
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                class="flex-1"
                :disabled="newMessageLoading"
              >
                {{ newMessageLoading ? 'Enviando...' : 'Enviar' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'

interface User {
  id: string
  name: string
  role?: string
}

interface Campaign {
  id: string
  name: string
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: Date
}

interface Conversation {
  id: string
  otherUser: User
  lastMessage?: Message
  unreadCount: number
  campaign?: Campaign
}

// Extensão do HTMLElement para propriedades customizadas
declare global {
  interface HTMLElement {
    _clickOutsideHandler?: (event: Event) => void
  }
}

// State
const showMessages = ref(false)
const showNewMessageModal = ref(false)
const newMessageLoading = ref(false)
const conversations = ref<Conversation[]>([])
const availableContacts = ref<User[]>([])

const newMessage = ref({
  recipient: '',
  content: ''
})

// Mock data
onMounted(() => {
  conversations.value = [
    {
      id: '1',
      otherUser: { id: 'user1', name: 'João Silva', role: 'Mestre' },
      lastMessage: {
        id: 'msg1',
        content: 'Vamos marcar a próxima sessão para sábado?',
        senderId: 'user1',
        createdAt: new Date(Date.now() - 1000 * 60 * 15)
      },
      unreadCount: 2,
      campaign: { id: 'camp1', name: 'Crônicas de Chicago' }
    },
    {
      id: '2',
      otherUser: { id: 'user2', name: 'Maria Santos', role: 'Jogadora' },
      lastMessage: {
        id: 'msg2',
        content: 'Obrigada pela ajuda com o personagem!',
        senderId: 'user2',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      unreadCount: 0,
      campaign: { id: 'camp1', name: 'Crônicas de Chicago' }
    }
  ]

  availableContacts.value = [
    { id: 'user3', name: 'Pedro Costa', role: 'Mestre' },
    { id: 'user4', name: 'Ana Paula', role: 'Jogadora' },
    { id: 'user5', name: 'Carlos Lima', role: 'Jogador' }
  ]
})

// Computed
const unreadMessagesCount = computed(() => {
  return conversations.value.reduce((total, conv) => total + conv.unreadCount, 0)
})

// Methods
const getInitials = (name: string) => {
  const words = name.split(' ').filter((word: string) => word.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  if (words.length > 0 && words[0]) {
    return words[0].substring(0, 2).toUpperCase()
  }
  return 'U'
}

const formatTime = (date?: Date) => {
  if (!date) return ''
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

const openConversation = (conversation: Conversation) => {
  // Mark as read
  conversation.unreadCount = 0
  
  // TODO: Open chat interface or navigate to conversation page
  console.log('Opening conversation:', conversation)
  showMessages.value = false
}

const closeNewMessageModal = () => {
  showNewMessageModal.value = false
  newMessage.value = { recipient: '', content: '' }
}

const sendNewMessage = async () => {
  newMessageLoading.value = true
  
  try {
    // TODO: Send message API call
    console.log('Sending message:', newMessage.value)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    closeNewMessageModal()
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    newMessageLoading.value = false
  }
}

// Click outside directive
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el._clickOutsideHandler = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickOutsideHandler)
  },
  unmounted(el: HTMLElement) {
    if (el._clickOutsideHandler) {
      document.removeEventListener('click', el._clickOutsideHandler)
      delete el._clickOutsideHandler
    }
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>