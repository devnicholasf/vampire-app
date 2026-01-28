<template>
  <div class="relative">
    <!-- Notifications Button -->
    <BaseButton
      ref="buttonRef"
      variant="ghost"
      size="sm"
      @click="toggleNotifications"
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
        class="fixed w-80 bg-surface border border-border rounded-vampire shadow-2xl z-[9999] max-h-96 overflow-hidden"
        @click.stop
      >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-border bg-surface-hover/50">
        <h3 class="font-semibold text-text-primary text-sm">Notificações</h3>
        <BaseButton
          v-if="unreadCount > 0"
          variant="ghost"
          size="sm"
          @click="markAllAsRead"
          class="text-xs text-red-400 hover:text-red-300 py-1 px-2"
        >
          Marcar todas como lidas
        </BaseButton>
      </div>

      <!-- Notifications List -->
      <div class="max-h-80 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-8 text-center text-text-muted">
          <div class="w-16 h-16 mx-auto mb-4 bg-surface-hover rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <p class="text-sm font-medium mb-1">Nenhuma notificação</p>
          <p class="text-xs text-text-secondary">Quando você receber notificações, elas aparecerão aqui</p>
        </div>

        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'p-4 border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors',
            { 'bg-red-500/5': !notification.read }
          ]"
        >
          <div class="flex gap-3">
            <!-- Icon -->
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              getNotificationIcon(notification.type).bgClass
            ]">
              <span :class="getNotificationIcon(notification.type).iconClass">
                {{ getNotificationIcon(notification.type).icon }}
              </span>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-text-primary">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-text-muted line-clamp-2 mt-1">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-text-secondary mt-2">
                    {{ formatTime(notification.createdAt) }}
                  </p>
                </div>
                
                <!-- Unread indicator -->
                <div v-if="!notification.read" class="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
              </div>

              <!-- Action Buttons (Instagram style) -->
              <div v-if="notification.actions && notification.actions.length > 0" class="flex gap-2 mt-3">
                <button
                  v-for="action in notification.actions"
                  :key="action.id"
                  @click="handleNotificationAction(notification, action)"
                  :class="[
                    'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                    action.primary 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-surface-hover text-text-primary hover:bg-border'
                  ]"
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
import BaseButton from './BaseButton.vue'
import { useNotifications } from '../../composables/useNotifications'

// Usar composable para gerenciar estado das notificações
const {
  notifications,
  showNotifications,
  unreadCount,
  toggleNotifications,
  markAllAsRead,
  handleNotificationAction,
  getNotificationIcon,
  formatTime,
  initialize
} = useNotifications()

// Refs locais
const buttonRef = ref<InstanceType<typeof BaseButton>>()

// Computed para posicionamento do dropdown
const dropdownStyle = computed(() => {
  if (!buttonRef.value) return {}
  
  const button = buttonRef.value.$el
  if (!button) return {}
  
  const rect = button.getBoundingClientRect()
  const dropdownWidth = 320 // w-80 = 20rem = 320px
  
  return {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
    minWidth: `${dropdownWidth}px`
  }
})

// Inicialização
onMounted(async () => {
  await initialize()
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