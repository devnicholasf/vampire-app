<template>
  <ChatDock ref="chatDock" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChatDock from './ChatDock.vue'

const chatDock = ref<InstanceType<typeof ChatDock>>()

onMounted(async () => {
  if (!chatDock.value) return
  await chatDock.value.openMinimized()
})
</script>