<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-surface-card rounded-lg border border-primary p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold text-text-primary">Detalhes do NPC</h3>
        <BaseButton variant="ghost" size="sm" @click="$emit('close')">
          ✕
        </BaseButton>
      </div>

      <div v-if="npc" class="space-y-6">
        <!-- Header with photo -->
        <div class="flex items-center space-x-4 pb-4 border-b border-border-dark">
          <div class="w-20 h-20 rounded-full bg-surface flex items-center justify-center">
            <img 
              v-if="npc.photo" 
              :src="npc.photo" 
              :alt="npc.name"
              class="w-full h-full rounded-full object-cover"
            />
            <span v-else class="text-3xl">🎭</span>
          </div>
          <div>
            <h4 class="text-xl font-semibold text-text-primary">{{ npc.name }}</h4>
            <p class="text-accent font-medium">{{ npc.clan }}</p>
            <p class="text-text-muted">Geração {{ npc.generation }}</p>
          </div>
        </div>

        <!-- Bio -->
        <div>
          <h5 class="font-medium text-text-primary mb-2">Biografia</h5>
          <p class="text-text-secondary">
            {{ npc.bio || 'Nenhuma biografia definida.' }}
          </p>
        </div>

        <!-- Key Points -->
        <div v-if="npc.keyPoints && npc.keyPoints.length > 0">
          <h5 class="font-medium text-text-primary mb-3">Pontos Chave na História</h5>
          <ul class="space-y-2">
            <li 
              v-for="point in npc.keyPoints" 
              :key="point"
              class="flex items-start space-x-2"
            >
              <span class="text-accent mt-1">•</span>
              <span class="text-text-secondary">{{ point }}</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-border-dark">
          <BaseButton variant="ghost" @click="$emit('edit', npc)">
            ✏️ Editar
          </BaseButton>
          <BaseButton 
            variant="primary" 
            @click="$emit('addToGame', npc)"
          >
            🎲 Usar no Jogo
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NPC } from '~/types'
import BaseButton from '~/components/ui/BaseButton.vue'

// Props
interface Props {
  npc: NPC
}

defineProps<Props>()

// Emits
defineEmits<{
  close: []
  edit: [npc: NPC]
  addToGame: [npc: NPC]
}>()
</script>