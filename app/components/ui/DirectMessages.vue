<template>
  <div class="relative">
    <!-- DM Button -->
    <BaseButton
      variant="ghost"
      size="sm"
      @click="toggleMessages"
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
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </div>
      </div>
    </BaseButton>

    <!-- Chat Modal -->
    <ChatModal
      ref="chatModal"
      :conversations="[...conversations]"
      :current-user-id="currentUserId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'
import ChatModal from './ChatModal.vue'
import { useChat } from '../../composables/useChat'

// Usar composable para gerenciar estado do chat
const { conversations, unreadCount, currentUserId, initialize } = useChat()

// Refs locais
const chatModal = ref<InstanceType<typeof ChatModal>>()

// Inicialização
onMounted(async () => {
  await initialize()
})

// Methods
const toggleMessages = () => {
  if (chatModal.value) {
    // Se já está aberto, fechar. Senão, abrir.
    if (chatModal.value.isOpen) {
      chatModal.value.close()
    } else {
      chatModal.value.open()
    }
  }
}
</script>