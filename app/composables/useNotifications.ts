import { ref, computed, readonly } from 'vue'
import type { Notification, NotificationAction } from '../types/index'

// Estado global das notificações
const notifications = ref<Notification[]>([])
let realtimeChannel: any = null
let expiryCheckInterval: ReturnType<typeof setInterval> | null = null

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

  // ============================================
  // Load notifications from Supabase
  // ============================================
  const loadNotifications = async () => {
    isLoading.value = true
    try {
      const { loadPendingInvites } = useCampaign()
      const invites = await loadPendingInvites()

      // Map invites to Notification format
      const inviteNotifications: Notification[] = invites.map((invite: any) => ({
        id: invite.id,
        type: 'campaign_invite' as const,
        title: 'Convite para Campanha',
        message: `Você foi convidado para a campanha "${invite.campaign_name || 'Campanha'}".`,
        read: false,
        createdAt: new Date(invite.created_at),
        data: {
          inviteId: invite.id,
          campaignId: invite.campaign_id,
          campaignName: invite.campaign_name || 'Campanha',
          invitedBy: invite.invited_by,
          expiresAt: invite.expires_at
        },
        actions: [
          {
            id: `accept-${invite.id}`,
            label: 'Aceitar',
            primary: true,
            action: 'accept' as const
          },
          {
            id: `decline-${invite.id}`,
            label: 'Recusar',
            primary: false,
            action: 'decline' as const
          }
        ]
      }))

      notifications.value = inviteNotifications
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      isLoading.value = false
    }
  }

  const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
  }

  const markAsRead = (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  // ============================================
  // Handle notification actions (accept/decline)
  // ============================================
  const handleNotificationAction = async (notification: Notification, action: NotificationAction) => {
    markAsRead(notification.id)
    
    try {
      const { acceptCampaignInvite, declineCampaignInvite } = useCampaign()

      switch (action.action) {
        case 'accept': {
          const inviteId = notification.data?.inviteId || notification.id
          console.log('Aceitando convite:', inviteId)
          
          try {
            const result = await acceptCampaignInvite(inviteId)
            console.log('Convite aceito, resultado:', result)
          } catch (acceptError: any) {
            console.error('Erro ao aceitar convite:', acceptError)
          }
          
          // Always remove notification and close dropdown
          removeNotification(notification.id)
          showNotifications.value = false
          
          // Reload campaigns to show the new one (no page reload needed)
          try {
            const { loadCampaigns } = useCampaign()
            await loadCampaigns()
          } catch (_) {}
          break
        }
        case 'decline': {
          const inviteId = notification.data?.inviteId || notification.id
          await declineCampaignInvite(inviteId)
          
          // Remove the notification
          removeNotification(notification.id)
          break
        }
        case 'view':
          showNotifications.value = false
          break
        case 'dismiss':
          removeNotification(notification.id)
          break
      }
    } catch (error: any) {
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
    const icons: Record<string, { svg: string; bgClass: string; iconClass: string }> = {
      campaign_invite: { 
        svg: 'invite',
        bgClass: 'bg-df-red/20', 
        iconClass: 'text-df-red' 
      },
      session_reminder: { 
        svg: 'clock',
        bgClass: 'bg-df-gold/20', 
        iconClass: 'text-df-gold' 
      },
      message: { 
        svg: 'message',
        bgClass: 'bg-green-500/20', 
        iconClass: 'text-green-400' 
      },
      system: { 
        svg: 'system',
        bgClass: 'bg-df-muted/20', 
        iconClass: 'text-df-muted' 
      }
    }
    
    return icons[type] || icons.system
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  /**
   * Get remaining time for an invite expiration
   */
  const getExpiryText = (expiresAt: string): string => {
    const expires = new Date(expiresAt)
    const now = new Date()
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return 'Expirado'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    if (minutes > 0) return `Expira em ${minutes}m ${seconds}s`
    return `Expira em ${seconds}s`
  }

  /**
   * Check if an invite has expired
   */
  const isExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) <= new Date()
  }

  // ============================================
  // Realtime subscription for new invites
  // ============================================
  const setupRealtimeSubscription = () => {
    try {
      const { subscribeToInvites } = useCampaign()
      
      realtimeChannel = subscribeToInvites((invite: any) => {
        // A new invite arrived, reload notifications
        loadNotifications()
      })
    } catch (error) {
      console.error('Error setting up realtime subscription:', error)
    }
  }

  // ============================================
  // Expiry checker - removes expired invites
  // ============================================
  const startExpiryChecker = () => {
    if (expiryCheckInterval) return

    expiryCheckInterval = setInterval(() => {
      notifications.value = notifications.value.filter(n => {
        if (n.type === 'campaign_invite' && n.data?.expiresAt) {
          if (isExpired(n.data.expiresAt)) {
            return false // remove expired
          }
        }
        return true
      })
    }, 10000) // Check every 10 seconds
  }

  const stopExpiryChecker = () => {
    if (expiryCheckInterval) {
      clearInterval(expiryCheckInterval)
      expiryCheckInterval = null
    }
  }

  // ============================================
  // Cleanup
  // ============================================
  const cleanup = () => {
    stopExpiryChecker()
    if (realtimeChannel) {
      realtimeChannel.unsubscribe()
      realtimeChannel = null
    }
  }

  // ============================================
  // Inicialização
  // ============================================
  const initialize = async () => {
    await loadNotifications()
    setupRealtimeSubscription()
    startExpiryChecker()
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
    formatTime,
    getExpiryText,
    isExpired,
    cleanup
  }
}