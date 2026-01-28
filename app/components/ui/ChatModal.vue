<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] pointer-events-none"
    >
      <!-- Chat Window -->
      <div
        ref="chatWindow"
        :style="windowStyle"
        class="absolute bg-surface border border-border rounded-vampire shadow-2xl pointer-events-auto overflow-hidden"
        :class="{ 'select-none': isResizing }"
      >
        <!-- Header -->
        <div
          @mousedown="startDragging"
          class="flex items-center justify-between p-3 bg-surface-hover border-b border-border cursor-move"
        >
          <div class="flex items-center gap-3">
            <!-- Active Conversation Info -->
            <div v-if="activeConversation" class="flex items-center gap-2">
              <div class="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <span class="text-xs font-bold text-red-400">
                  {{ getInitials(activeConversation.otherUser.name) }}
                </span>
              </div>
              <div>
                <p class="text-sm font-medium text-text-primary">{{ activeConversation.otherUser.name }}</p>
                <p class="text-xs text-text-muted">{{ activeConversation.campaign?.name }}</p>
              </div>
            </div>
            <div v-else class="text-sm font-medium text-text-primary">Mensagens</div>
          </div>
          
          <div class="flex items-center gap-1">
            <!-- Minimize -->
            <button
              @click="minimize"
              class="p-1.5 hover:bg-surface transition-colors rounded"
            >
              <svg class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </button>
            
            <!-- Close -->
            <button
              @click="close"
              class="p-1.5 hover:bg-red-500/10 hover:text-red-400 transition-colors rounded"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex h-full">
          <!-- Conversations Sidebar -->
          <div v-if="!activeConversation || showConversationsList" class="w-64 border-r border-border flex flex-col">
            <!-- Search -->
            <div class="p-3 border-b border-border">
              <input
                v-model="searchQuery"
                placeholder="Buscar conversas..."
                class="w-full px-3 py-2 bg-surface-input border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-red-400"
              >
            </div>
            
            <!-- Conversations List -->
            <div class="flex-1 overflow-y-auto">
              <div v-if="filteredConversations.length === 0" class="p-4 text-center text-text-muted text-sm">
                Nenhuma conversa
              </div>
              
              <div
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                @click="selectConversation(conversation)"
                :class="[
                  'p-3 border-b border-border cursor-pointer hover:bg-surface-hover transition-colors',
                  { 'bg-red-500/10': activeConversation?.id === conversation.id }
                ]"
              >
                <div class="flex gap-3">
                  <div class="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-bold text-red-400">
                      {{ getInitials(conversation.otherUser.name) }}
                    </span>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-text-primary truncate">
                        {{ conversation.otherUser.name }}
                      </p>
                      <div class="flex items-center gap-1">
                        <span class="text-xs text-text-secondary">
                          {{ formatTime(conversation.lastMessage?.createdAt) }}
                        </span>
                        <div 
                          v-if="conversation.unreadCount > 0"
                          class="bg-red-500 text-white text-xs rounded-full min-w-[16px] h-[16px] flex items-center justify-center font-bold"
                        >
                          {{ conversation.unreadCount }}
                        </div>
                      </div>
                    </div>
                    
                    <p class="text-xs text-text-muted truncate mt-1">
                      {{ conversation.lastMessage?.content || 'Nova conversa' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Area -->
          <div v-if="activeConversation" class="flex-1 flex flex-col min-w-0">
            <!-- Back Button (Mobile) -->
            <div v-if="!showConversationsList" class="p-2 border-b border-border md:hidden">
              <button
                @click="showConversationsList = true"
                class="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Voltar
              </button>
            </div>
            
            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div v-if="messages.length === 0" class="text-center text-text-muted text-sm">
                Inicie a conversa
              </div>
              
              <div
                v-for="message in messages"
                :key="message.id"
                :class="[
                  'flex',
                  message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'max-w-xs px-3 py-2 rounded-lg text-sm',
                    message.senderId === currentUserId
                      ? 'bg-red-500 text-white'
                      : 'bg-surface-hover text-text-primary'
                  ]"
                >
                  <p>{{ message.content }}</p>
                  <p
                    :class="[
                      'text-xs mt-1',
                      message.senderId === currentUserId
                        ? 'text-red-100'
                        : 'text-text-muted'
                    ]"
                  >
                    {{ formatTime(message.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Message Input -->
            <div class="p-4 border-t border-border">
              <div class="flex gap-2">
                <input
                  v-model="newMessageContent"
                  @keydown.enter="sendMessage"
                  placeholder="Digite sua mensagem..."
                  class="flex-1 px-3 py-2 bg-surface-input border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-red-400"
                >
                <button
                  @click="sendMessage"
                  :disabled="!newMessageContent.trim() || sendingMessage"
                  class="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ sendingMessage ? '...' : 'Enviar' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-if="!activeConversation && filteredConversations.length > 0" class="flex-1 flex items-center justify-center p-8">
            <div class="text-center text-text-muted">
              <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <p class="text-lg font-medium mb-2">Selecione uma conversa</p>
              <p class="text-sm">Escolha uma conversa da lista para começar a chat</p>
            </div>
          </div>
        </div>

        <!-- Resize Handles -->
        <div
          @mousedown="startResize('se')"
          class="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100"
        >
          <div class="absolute bottom-1 right-1 w-2 h-2 bg-text-muted rounded-sm"></div>
        </div>
        
        <div
          @mousedown="startResize('s')"
          class="absolute bottom-0 left-4 right-4 h-1 cursor-s-resize"
        ></div>
        
        <div
          @mousedown="startResize('e')"
          class="absolute top-4 bottom-4 right-0 w-1 cursor-e-resize"
        ></div>
      </div>
    </div>
    
    <!-- Minimized Bar -->
    <div
      v-if="isMinimized"
      class="fixed bottom-4 right-4 z-[9998] bg-surface border border-border rounded-vampire shadow-xl p-3 cursor-pointer hover:bg-surface-hover transition-colors"
      @click="restore"
    >
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span class="text-sm font-medium text-text-primary">Mensagens</span>
        <div v-if="totalUnreadCount > 0" class="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold">
          {{ totalUnreadCount > 99 ? '99+' : totalUnreadCount }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { ChatUser, ChatMessage, ChatConversation } from '../../types/index'

interface Props {
  conversations?: ChatConversation[]
  currentUserId?: string
}

const props = withDefaults(defineProps<Props>(), {
  conversations: () => [],
  currentUserId: 'current-user'
})

// State
const isOpen = ref(false)
const isMinimized = ref(false)
const activeConversation = ref<ChatConversation | null>(null)
const messages = ref<ChatMessage[]>([])
const newMessageContent = ref('')
const sendingMessage = ref(false)
const searchQuery = ref('')
const showConversationsList = ref(true)

// Window positioning and sizing
const windowPosition = ref({ x: 20, y: 100 })
const windowSize = ref({ width: 600, height: 500 })
const isDragging = ref(false)
const isResizing = ref(false)
const resizeDirection = ref('')
const dragStart = ref({ x: 0, y: 0, windowX: 0, windowY: 0 })

// Refs
const chatWindow = ref<HTMLElement>()

// Computed
const windowStyle = computed(() => ({
  left: `${windowPosition.value.x}px`,
  top: `${windowPosition.value.y}px`,
  width: `${windowSize.value.width}px`,
  height: `${windowSize.value.height}px`,
  minWidth: '400px',
  minHeight: '300px',
  maxWidth: '90vw',
  maxHeight: '90vh'
}))

const filteredConversations = computed(() => {
  if (!searchQuery.value) return [...props.conversations]
  return props.conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalUnreadCount = computed(() => {
  return props.conversations.reduce((total, conv) => total + conv.unreadCount, 0)
})

// Methods
const getInitials = (name: string) => {
  const words = name.split(' ').filter(word => word.length > 0)
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

const open = (conversation?: ChatConversation) => {
  // Set position to bottom right of screen
  const screenWidth = window.innerWidth || 1200
  const screenHeight = window.innerHeight || 800
  
  windowPosition.value = {
    x: Math.max(20, screenWidth - windowSize.value.width - 20),
    y: Math.max(20, screenHeight - windowSize.value.height - 20)
  }
  
  isOpen.value = true
  isMinimized.value = false
  if (conversation) {
    selectConversation(conversation)
  }
}

const close = () => {
  isOpen.value = false
  isMinimized.value = false
  activeConversation.value = null
}

const minimize = () => {
  isMinimized.value = true
}

const restore = () => {
  isMinimized.value = false
}

const selectConversation = (conversation: ChatConversation) => {
  activeConversation.value = conversation
  showConversationsList.value = false
  conversation.unreadCount = 0
  
  // Load messages for this conversation
  // TODO: Load from API
  messages.value = [
    {
      id: 'msg1',
      content: conversation.lastMessage?.content || 'Olá!',
      senderId: conversation.otherUser.id,
      createdAt: conversation.lastMessage?.createdAt || new Date()
    }
  ]
}

const sendMessage = async () => {
  if (!newMessageContent.value.trim() || !activeConversation.value) return
  
  sendingMessage.value = true
  
  try {
    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessageContent.value.trim(),
      senderId: props.currentUserId,
      createdAt: new Date()
    }
    
    messages.value.push(message)
    newMessageContent.value = ''
    
    // TODO: Send to API
    await new Promise(resolve => setTimeout(resolve, 500))
    
  } finally {
    sendingMessage.value = false
  }
}

// Drag functionality
const startDragging = (event: MouseEvent) => {
  isDragging.value = true
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    windowX: windowPosition.value.x,
    windowY: windowPosition.value.y
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = event.clientX - dragStart.value.x
    const deltaY = event.clientY - dragStart.value.y
    
    windowPosition.value = {
      x: Math.max(0, Math.min(window.innerWidth - windowSize.value.width, dragStart.value.windowX + deltaX)),
      y: Math.max(0, Math.min(window.innerHeight - windowSize.value.height, dragStart.value.windowY + deltaY))
    }
  }
  
  if (isResizing.value) {
    // Handle resize logic here
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
  resizeDirection.value = ''
}

const startResize = (direction: string) => {
  isResizing.value = true
  resizeDirection.value = direction
}

// Lifecycle
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// Expose methods
defineExpose({
  open,
  close,
  minimize,
  restore,
  get isOpen() {
    return isOpen.value
  }
})
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