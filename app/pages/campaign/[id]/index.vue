<template>
  <div class="min-h-screen bg-gradient-atmospheric flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
      <p class="text-text-muted">Redirecionando para o dashboard correto...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================
// Vue imports
// ============================================
import { onMounted } from 'vue'

// ============================================
// Route params and middleware
// ============================================
const route = useRoute()
const campaignId = route.params.id as string

definePageMeta({
  middleware: ['campaign-redirect']
})

// Esta página serve apenas como ponto de redirecionamento
// O middleware 'campaign-redirect' vai direcionar automaticamente
// para /master ou /player baseado no role do usuário

onMounted(() => {
  console.log('Campaign index: redirecionando para dashboard correto...', campaignId)
})

// ============================================
// SEO
// ============================================
useSeoMeta({
  title: 'Redirecionando...',
  description: 'Redirecionando para dashboard da campanha'
})
</script>