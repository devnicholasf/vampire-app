<template>
  <ChatDock ref="chatDock" @closed-by-user="handleClosedByUser" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useState } from '#imports'
import ChatDock from './ChatDock.vue'

const chatDock = ref<InstanceType<typeof ChatDock>>()
const route = useRoute()

// Estado global entre páginas da sessão atual.
const closedUntilDashboard = useState<boolean>('chat-closed-until-dashboard', () => false)

const ensureDockState = async () => {
  if (!chatDock.value) return

  if (closedUntilDashboard.value) {
    chatDock.value.close()
    return
  }

  if (!chatDock.value.isVisible) {
    await chatDock.value.openMinimized()
  }
}

const handleClosedByUser = () => {
  closedUntilDashboard.value = true
}

onMounted(async () => {
  if (route.path === '/dashboard') {
    closedUntilDashboard.value = false
  }

  await ensureDockState()
})

watch(
  () => route.path,
  async (newPath) => {
    // Ao entrar no dashboard geral, reativa o componente novamente.
    if (newPath === '/dashboard') {
      closedUntilDashboard.value = false
    }

    await ensureDockState()
  }
)
</script>