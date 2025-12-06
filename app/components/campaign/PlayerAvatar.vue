<template>
  <div class="player-avatar-card bg-surface-card border-2 border-border-primary rounded-lg p-4 hover:border-brand-primary transition-all duration-300">
    <!-- Avatar -->
    <div class="relative mb-4">
      <div class="w-32 h-32 mx-auto relative group">
        <!-- Imagem -->
        <img
          :src="character.avatar || '/images/default-avatar.png'"
          :alt="character.name"
          class="w-full h-full object-cover rounded-lg border-2 border-brand-primary shadow-glow-gold"
        />

        <!-- Overlay de upload (apenas se editável) -->
        <div
          v-if="editable"
          class="absolute inset-0 bg-black bg-opacity-75 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          @click="triggerFileUpload"
        >
          <span class="text-brand-primary text-sm font-semibold">📷 Trocar</span>
        </div>

        <input
          v-if="editable"
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarUpload"
        />
      </div>

      <!-- Badge de clã -->
      <div class="absolute top-0 right-0 bg-brand-primary text-black px-2 py-1 rounded text-xs font-bold">
        {{ character.clan }}
      </div>
    </div>

    <!-- Nome e Info -->
    <div class="text-center mb-4">
      <h3 class="text-xl font-bold text-text-primary mb-1">
        {{ character.name }}
      </h3>
      <p class="text-text-muted text-sm">
        {{ character.clan }} - {{ character.generation }}ª Geração
      </p>
    </div>

    <!-- Atributos VtM -->
    <div v-if="!compact" class="space-y-3">
      <!-- Fome -->
      <div>
        <div class="flex justify-between text-xs text-text-secondary mb-1">
          <span>🩸 Fome</span>
          <span>{{ character.attributes.hunger }}/5</span>
        </div>
        <div class="w-full bg-surface-dark rounded-full h-2">
          <div
            :class="[
              'h-2 rounded-full transition-all duration-300',
              hungerColor
            ]"
            :style="{ width: `${(character.attributes.hunger / 5) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Humanidade -->
      <div>
        <div class="flex justify-between text-xs text-text-secondary mb-1">
          <span>❤️ Humanidade</span>
          <span>{{ character.attributes.humanity }}/10</span>
        </div>
        <div class="w-full bg-surface-dark rounded-full h-2">
          <div
            class="bg-gradient-to-r from-error-DEFAULT to-error-dark h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(character.attributes.humanity / 10) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Força de Vontade -->
      <div>
        <div class="flex justify-between text-xs text-text-secondary mb-1">
          <span>💎 Força de Vontade</span>
          <span>{{ character.attributes.willpower }}/10</span>
        </div>
        <div class="w-full bg-surface-dark rounded-full h-2">
          <div
            class="bg-brand-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(character.attributes.willpower / 10) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Saúde -->
      <div>
        <div class="flex justify-between text-xs text-text-secondary mb-1">
          <span>🛡️ Saúde</span>
          <span>{{ character.attributes.health }}/10</span>
        </div>
        <div class="w-full bg-surface-dark rounded-full h-2">
          <div
            class="bg-success-DEFAULT h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(character.attributes.health / 10) * 100}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Disciplinas (se não compacto) -->
    <div v-if="!compact && character.disciplines && character.disciplines.length > 0" class="mt-4 pt-4 border-t border-border-secondary">
      <p class="text-xs text-text-secondary mb-2">Disciplinas:</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="discipline in character.disciplines"
          :key="discipline"
          class="px-2 py-1 bg-surface-medium text-brand-primary text-xs rounded border border-brand-primary"
        >
          {{ discipline }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Tipos auto-importados pelo Nuxt
import type { Character } from '~/types'

const props = defineProps<{
  character: Character
  editable?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  'update:avatar': [file: File]
}>()

const fileInput = ref<HTMLInputElement>()

// Cor da barra de fome baseada no nível
const hungerColor = computed(() => {
  const hunger = props.character.attributes.hunger
  if (hunger >= 4) return 'bg-error-DEFAULT'
  if (hunger >= 2) return 'bg-warning-DEFAULT'
  return 'bg-success-DEFAULT'
})

// Trigger file upload
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// Handle avatar upload
const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    emit('update:avatar', file)
  }
}
</script>

<style scoped>
.shadow-glow-gold {
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}
</style>
