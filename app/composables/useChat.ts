import { ref, computed } from 'vue'
import type { ChatConversation, ChatMessage } from '../types/index'

// Estado global do chat
const conversations = ref<ChatConversation[]>([])
const activeConversation = ref<ChatConversation | null>(null)
const messages = ref<ChatMessage[]>([])

export const useChat = () => {
  // Estado reativo compartilhado
  const isLoading = ref(false)
  const currentUserId = ref('current-user') // TODO: Pegar do useAuth

  // Computed
  const unreadCount = computed(() => {
    return conversations.value.reduce((total, conv) => total + conv.unreadCount, 0)
  })

  const filteredConversations = computed(() => (searchQuery: string) => {
    if (!searchQuery) return conversations.value
    return conversations.value.filter(conv =>
      conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Methods
  const loadConversations = async () => {
    isLoading.value = true
    try {
      // TODO: Implementar carregamento do backend
      // const response = await $fetch('/api/conversations')
      // conversations.value = response.data
      
      // Por enquanto, manter vazio para demonstrar estado limpo
      conversations.value = []
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      isLoading.value = false
    }
  }

  const selectConversation = async (conversation: ChatConversation) => {
    activeConversation.value = conversation
    conversation.unreadCount = 0
    
    // Carregar mensagens da conversa
    await loadMessages(conversation.id)
  }

  const loadMessages = async (conversationId: string) => {
    isLoading.value = true
    try {
      // TODO: Implementar carregamento de mensagens do backend
      // const response = await $fetch(`/api/conversations/${conversationId}/messages`)
      // messages.value = response.data
      
      // Exemplo temporário para demonstração
      if (activeConversation.value?.lastMessage) {
        messages.value = [activeConversation.value.lastMessage]
      } else {
        messages.value = []
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      messages.value = []
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!content.trim() || !activeConversation.value) return false
    
    isLoading.value = true
    try {
      // Adicionar mensagem otimisticamente
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        senderId: currentUserId.value,
        createdAt: new Date()
      }
      
      messages.value.push(newMessage)
      
      // TODO: Enviar para o backend
      // await $fetch(`/api/conversations/${activeConversation.value.id}/messages`, {
      //   method: 'POST',
      //   body: { content: content.trim() }
      // })
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return true
    } catch (error) {
      console.error('Error sending message:', error)
      // Remover mensagem se falhou
      messages.value.pop()
      return false
    } finally {
      isLoading.value = false
    }
  }

  const markConversationAsRead = (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }
  }

  const addConversation = (conversation: ChatConversation) => {
    const existingIndex = conversations.value.findIndex(c => c.id === conversation.id)
    if (existingIndex >= 0) {
      conversations.value[existingIndex] = conversation
    } else {
      conversations.value.unshift(conversation)
    }
  }

  const removeConversation = (conversationId: string) => {
    const index = conversations.value.findIndex(c => c.id === conversationId)
    if (index >= 0) {
      conversations.value.splice(index, 1)
    }
    
    // Se a conversa ativa foi removida, limpar seleção
    if (activeConversation.value?.id === conversationId) {
      activeConversation.value = null
      messages.value = []
    }
  }

  // Inicialização
  const initialize = async () => {
    await loadConversations()
  }

  return {
    // Estado
    conversations: readonly(conversations),
    activeConversation: readonly(activeConversation),
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    currentUserId: readonly(currentUserId),
    
    // Computed
    unreadCount,
    filteredConversations,
    
    // Methods
    initialize,
    loadConversations,
    selectConversation,
    loadMessages,
    sendMessage,
    markConversationAsRead,
    addConversation,
    removeConversation
  }
}