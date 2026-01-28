import { ref, computed } from 'vue'
import type { Notification, NotificationAction } from '../types/index'

// Estado global das notificações
const notifications = ref<Notification[]>([])

export const useNotifications = () => {
  // Estado reativo
  const isLoading = ref(false)
  const showNotifications = ref(false)

  // Computed
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  })

  // Methods
  const loadNotifications = async () => {
    isLoading.value = true
    try {
      // TODO: Implementar carregamento do backend
      // const response = await $fetch('/api/notifications')
      // notifications.value = response.data
      
      // Por enquanto, manter vazio para demonstrar estado limpo
      notifications.value = []
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      isLoading.value = false
    }
  }

  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
    
    // Instagram-style: Auto-mark as viewed when opening dropdown
    if (showNotifications.value) {
      // Mark all notifications as read after a short delay (user has seen them)
      setTimeout(() => {
        markAllAsRead()
      }, 1000)
    }
  }

  const markAsRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      
      // TODO: Atualizar no backend
      // $fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
    
    // TODO: Atualizar no backend
    // $fetch('/api/notifications/read-all', { method: 'POST' })
  }

  const handleNotificationAction = async (notification: Notification, action: NotificationAction) => {
    // Mark as read when any action is taken
    markAsRead(notification.id)
    
    try {
      // Handle different action types
      switch (action.action) {
        case 'accept':
          console.log('Accepting:', notification.data)
          // TODO: Implement accept logic (join campaign, etc.)
          break
        case 'decline':
          console.log('Declining:', notification.data)
          // TODO: Implement decline logic
          break
        case 'view':
          console.log('Viewing:', notification.data)
          // TODO: Navigate to related page
          showNotifications.value = false
          break
        case 'dismiss':
          console.log('Dismissing:', notification.data)
          removeNotification(notification.id)
          break
      }
      
      // TODO: Enviar ação para o backend
      // await $fetch(`/api/notifications/${notification.id}/action`, {
      //   method: 'POST',
      //   body: { action: action.action }
      // })
      
    } catch (error) {
      console.error('Error handling notification action:', error)
    }
  }

  const addNotification = (notification: Notification) => {
    const existingIndex = notifications.value.findIndex(n => n.id === notification.id)
    if (existingIndex >= 0) {
      notifications.value[existingIndex] = notification
    } else {
      notifications.value.unshift(notification)
    }
  }

  const removeNotification = (notificationId: string) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index >= 0) {
      notifications.value.splice(index, 1)
    }
  }

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

  // Inicialização
  const initialize = async () => {
    await loadNotifications()
  }

  return {
    // Estado
    notifications: readonly(notifications),
    isLoading: readonly(isLoading),
    showNotifications,
    
    // Computed
    unreadCount,
    sortedNotifications,
    
    // Methods
    initialize,
    loadNotifications,
    toggleNotifications,
    markAsRead,
    markAllAsRead,
    handleNotificationAction,
    addNotification,
    removeNotification,
    getNotificationIcon,
    formatTime
  }
}