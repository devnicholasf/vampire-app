<template>
  <div class="relative">
    <!-- Notifications Button -->
    <button
      ref="buttonRef"
      @click="toggleNotifications"
      class="relative p-2 text-df-muted hover:text-df-red transition-colors rounded-lg hover:bg-df-input"
    >
      <div class="relative">
        <svg 
          class="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        
        <!-- Notification Badge -->
        <div 
          v-if="unreadCount > 0"
          class="absolute -top-1.5 -right-1.5 bg-df-red text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold shadow-[0_0_8px_rgba(220,38,38,0.5)]"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </div>
      </div>
    </button>

    <!-- Teleport dropdown to body -->
    <Teleport to="body">
      <!-- Backdrop -->
      <div
        v-if="showNotifications"
        class="fixed inset-0 z-[9998]"
        @click="showNotifications = false"
      ></div>

      <!-- Notifications Dropdown -->
      <div
        v-if="showNotifications"
        :style="dropdownStyle"
        class="fixed w-96 rounded-xl shadow-2xl z-[9999] max-h-[480px] overflow-hidden border"
        style="background: #0a0a1a; border-color: #7f1d1d;"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3.5 border-b" style="border-color: rgba(127,29,29,0.4); background: rgba(5,5,16,0.9);">
          <h3 class="font-bold text-sm tracking-wide uppercase" style="color: #c0c0d0;">Notificações</h3>
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-xs font-medium transition-colors" 
            style="color: #dc2626;"
            @mouseenter="($event.target as HTMLElement).style.color = '#ef4444'"
            @mouseleave="($event.target as HTMLElement).style.color = '#dc2626'"
          >
            Marcar como lidas
          </button>
        </div>

        <!-- Notifications List -->
        <div class="max-h-[420px] overflow-y-auto" style="scrollbar-color: #7f1d1d #0a0a1a;">
          <!-- Empty State -->
          <div v-if="sortedNotifications.length === 0" class="px-5 py-10 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style="background: rgba(127,29,29,0.15);">
              <svg class="w-7 h-7" style="color: #6b6b80;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <p class="text-sm font-medium mb-1" style="color: #c0c0d0;">Nenhuma notificação</p>
            <p class="text-xs" style="color: #6b6b80;">Convites e alertas aparecerão aqui</p>
          </div>

          <!-- Notification Items -->
          <div
            v-for="notification in sortedNotifications"
            :key="notification.id"
            class="px-5 py-4 border-b transition-colors"
            :style="{
              borderColor: 'rgba(127,29,29,0.2)',
              background: !notification.read ? 'rgba(220,38,38,0.05)' : 'transparent'
            }"
            @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.08)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = !notification.read ? 'rgba(220,38,38,0.05)' : 'transparent'"
          >
            <div class="flex gap-3">
              <!-- Icon -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                :style="{ background: notification.type === 'campaign_invite' ? 'rgba(220,38,38,0.15)' : 'rgba(107,107,128,0.15)' }"
              >
                <!-- Campaign Invite Icon (sword) -->
                <svg v-if="notification.type === 'campaign_invite'" class="w-5 h-5" style="color: #dc2626;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
                  <path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>
                </svg>
                <!-- System Icon -->
                <svg v-else class="w-5 h-5" style="color: #6b6b80;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold" style="color: #c0c0d0;">
                      {{ notification.title }}
                    </p>
                    <p class="text-sm mt-1 line-clamp-2" style="color: #6b6b80;">
                      {{ notification.message }}
                    </p>
                    
                    <!-- Expiry Timer for invites -->
                    <div v-if="notification.type === 'campaign_invite' && notification.data?.expiresAt" class="flex items-center gap-1.5 mt-2">
                      <svg class="w-3.5 h-3.5" style="color: #d4a647;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span class="text-xs font-medium" :style="{ color: getExpiryColor(notification.data.expiresAt) }">
                        {{ expiryTexts[notification.id] || getExpiryText(notification.data.expiresAt) }}
                      </span>
                    </div>

                    <p class="text-xs mt-1.5" style="color: rgba(107,107,128,0.7);">
                      {{ formatTime(notification.createdAt) }}
                    </p>
                  </div>
                  
                  <!-- Unread indicator -->
                  <div v-if="!notification.read" class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(220,38,38,0.6)]" style="background: #dc2626;"></div>
                </div>

                <!-- Action Buttons -->
                <div v-if="notification.actions && notification.actions.length > 0" class="flex gap-2 mt-3">
                  <button
                    v-for="action in notification.actions"
                    :key="action.id"
                    @click="handleNotificationAction(notification, action)"
                    :class="[
                      'px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 uppercase tracking-wider',
                      action.primary 
                        ? 'text-red-200 border hover:text-white hover:shadow-[0_0_12px_rgba(220,38,38,0.4)]' 
                        : 'border text-gray-300 hover:text-white'
                    ]"
                    :style="action.primary 
                      ? { background: 'linear-gradient(135deg, #991b1b, #450a0a)', borderColor: '#7f1d1d' }
                      : { background: 'rgba(107,107,128,0.1)', borderColor: 'rgba(107,107,128,0.3)' }
                    "
                  >
                    {{ action.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotifications } from '../../composables/useNotifications'

const {
  sortedNotifications,
  showNotifications,
  unreadCount,
  toggleNotifications,
  markAllAsRead,
  handleNotificationAction,
  getNotificationIcon,
  formatTime,
  getExpiryText,
  isExpired,
  initialize,
  cleanup
} = useNotifications()

// Refs locais
const buttonRef = ref<HTMLButtonElement>()

// Reactive expiry texts (updated every second)
const expiryTexts = ref<Record<string, string>>({})
let expiryTimerInterval: ReturnType<typeof setInterval> | null = null

const getExpiryColor = (expiresAt: string): string => {
  const expires = new Date(expiresAt)
  const now = new Date()
  const diff = expires.getTime() - now.getTime()
  const minutes = diff / 60000

  if (minutes <= 2) return '#ef4444' // Red - urgent
  if (minutes <= 5) return '#d4a647' // Gold - warning
  return '#6b6b80' // Muted - normal
}

const updateExpiryTexts = () => {
  const texts: Record<string, string> = {}
  for (const n of sortedNotifications.value) {
    if (n.type === 'campaign_invite' && n.data?.expiresAt) {
      texts[n.id] = getExpiryText(n.data.expiresAt)
    }
  }
  expiryTexts.value = texts
}

// Computed para posicionamento do dropdown
const dropdownStyle = computed(() => {
  if (!buttonRef.value) return {}
  
  const rect = buttonRef.value.getBoundingClientRect()
  const dropdownWidth = 384 // w-96
  
  return {
    top: `${rect.bottom + 8}px`,
    right: `${Math.max(8, window.innerWidth - rect.right)}px`,
    minWidth: `${dropdownWidth}px`
  }
})

// Inicialização
onMounted(async () => {
  await initialize()
  
  // Update expiry texts every second
  expiryTimerInterval = setInterval(() => {
    updateExpiryTexts()
  }, 1000)
})

onUnmounted(() => {
  cleanup()
  if (expiryTimerInterval) {
    clearInterval(expiryTimerInterval)
  }
})
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