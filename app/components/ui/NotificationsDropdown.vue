<template>
  <div class="relative">
    <!-- Notifications Button -->
    <BaseButton
      variant="ghost"
      size="sm"
      @click="showNotifications = !showNotifications"
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        <!-- Notification Badge -->
        <div 
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </div>
      </div>
    </BaseButton>

    <!-- Notifications Dropdown -->
    <div
      v-if="showNotifications"
      v-click-outside="() => showNotifications = false"
      class="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-vampire shadow-xl z-50 max-h-96 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h3 class="font-semibold text-text-primary">Notificações</h3>
        <BaseButton
          v-if="unreadCount > 0"
          variant="ghost"
          size="sm"
          @click="markAllAsRead"
          class="text-xs text-red-400 hover:text-red-300"
        >
          Marcar todas como lidas
        </BaseButton>
      </div>

      <!-- Notifications List -->
      <div class="max-h-80 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-6 text-center text-text-muted">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p>Nenhuma notificação</p>
        </div>

        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-surface-hover transition-colors',
            { 'bg-red-500/5': !notification.read }
          ]"
          @click="handleNotificationClick(notification)"
        >
          <div class="flex gap-3">
            <!-- Icon -->
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              getNotificationIcon(notification.type).bgClass
            ]">
              <span :class="getNotificationIcon(notification.type).iconClass">
                {{ getNotificationIcon(notification.type).icon }}
              </span>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary">
                {{ notification.title }}
              </p>
              <p class="text-sm text-text-muted line-clamp-2">
                {{ notification.message }}
              </p>
              <p class="text-xs text-text-secondary mt-1">
                {{ formatTime(notification.createdAt) }}
              </p>
            </div>

            <!-- Unread indicator -->
            <div v-if="!notification.read" class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BaseButton from './BaseButton.vue'

interface Notification {
  id: string
  type: 'campaign_invite' | 'session_reminder' | 'message' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
  data?: Record<string, any>
}

// Extensão do HTMLElement para propriedades customizadas
declare global {
  interface HTMLElement {
    _clickOutsideHandler?: (event: Event) => void
  }
}

// State
const showNotifications = ref(false)
const notifications = ref<Notification[]>([])

// Mock data for demo
onMounted(() => {
  notifications.value = [
    {
      id: '1',
      type: 'campaign_invite',
      title: 'Convite para Campanha',
      message: 'Você foi convidado para "Crônicas de Chicago" como jogador.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
    },
    {
      id: '2',
      type: 'session_reminder',
      title: 'Sessão Amanhã',
      message: 'Lembrete: Sessão de "Noites de Berlin" amanhã às 19h.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2h ago
    },
    {
      id: '3',
      type: 'message',
      title: 'Nova Mensagem do Mestre',
      message: 'O mestre enviou atualizações sobre a próxima sessão.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    }
  ]
})

// Computed
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// Methods
const getNotificationIcon = (type: Notification['type']) => {
  const icons = {
    campaign_invite: { icon: '📨', bgClass: 'bg-blue-500/20', iconClass: 'text-blue-400' },
    session_reminder: { icon: '⏰', bgClass: 'bg-yellow-500/20', iconClass: 'text-yellow-400' },
    message: { icon: '💬', bgClass: 'bg-green-500/20', iconClass: 'text-green-400' },
    system: { icon: '⚙️', bgClass: 'bg-gray-500/20', iconClass: 'text-gray-400' }
  }
  
  return icons[type] || icons.system
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

const handleNotificationClick = (notification: Notification) => {
  // Mark as read
  notification.read = true
  
  // Handle navigation based on notification type
  console.log('Notification clicked:', notification)
  
  // TODO: Implement navigation logic
  showNotifications.value = false
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>