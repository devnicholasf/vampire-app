<template>
  <div 
    class="relative rounded-lg overflow-hidden transition-all duration-300"
    :class="[
      cardClasses,
      { 'animate-pulse-subtle': isNew }
    ]"
    :style="cardStyle"
  >
    <!-- Decorative corners -->
    <span class="dice-corner dice-corner-tl" :class="{ 'dice-corner-frenzy': isFrenzyRoll }" />
    <span class="dice-corner dice-corner-tr" :class="{ 'dice-corner-frenzy': isFrenzyRoll }" />
    <span class="dice-corner dice-corner-bl" :class="{ 'dice-corner-frenzy': isFrenzyRoll }" />
    <span class="dice-corner dice-corner-br" :class="{ 'dice-corner-frenzy': isFrenzyRoll }" />

    <!-- Glow effect for special results -->
    <div 
      v-if="result.isMessyCritical || result.isBestialFailure || isFrenzyRoll"
      class="absolute inset-0 pointer-events-none"
      :style="glowStyle"
    />

    <div class="relative p-4 space-y-3">
      <!-- Header: Character + Roll Type -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#7f1d1d]/50">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="result.characterName"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-white text-xs font-bold"
              style="background: linear-gradient(135deg, #7f1d1d, #d4a647);"
            >
              {{ characterInitial }}
            </div>
          </div>
          <div>
            <p class="text-sm font-semibold text-white">{{ result.characterName }}</p>
            <div class="flex items-center gap-1.5">
              <p class="text-[10px] text-[#6b6b7b] uppercase tracking-wider">{{ formatRollType }}</p>
              <span v-if="isMaskedHiddenRoll" class="inline-flex items-center gap-1 rounded-full border border-sky-900/60 bg-sky-950/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-sky-300">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                Oculto
              </span>
            </div>
          </div>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-[#6b6b7b]">{{ formattedTime }}</p>
        </div>
      </div>

      <!-- Roll Description -->
      <div v-if="!isMaskedHiddenRoll" class="flex items-center gap-2 text-xs">
        <span class="text-[#d4a647] font-medium">{{ result.attribute }}</span>
        <span class="text-[#6b6b7b]">+</span>
        <span class="text-[#d4a647] font-medium">{{ result.skill }}</span>
        <span v-if="result.modifier !== 0" class="text-[#6b6b7b]">
          {{ result.modifier > 0 ? '+' : '' }}{{ result.modifier }}
        </span>
      </div>
      <div v-else class="rounded border border-sky-900/40 bg-sky-950/10 px-3 py-2 text-xs text-sky-200/90">
        {{ result.characterName }} fez um teste secreto. Os detalhes desta rolagem estao ocultos para voce.
      </div>

      <!-- Pool Info -->
      <div v-if="!isMaskedHiddenRoll" class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-[#6b6b7b]">Dados:</span>
          <span class="text-white font-semibold">{{ result.poolTotal }}</span>
        </div>
        <div v-if="result.hunger > 0" class="flex items-center gap-1.5">
          <span class="text-[#6b6b7b]">Fome:</span>
          <span class="text-red-400 font-semibold">{{ result.hunger }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[#6b6b7b]">Dif:</span>
          <span class="text-white font-semibold">{{ result.difficulty }}</span>
        </div>
      </div>
      <div v-else class="flex items-center gap-2 rounded border border-sky-900/35 bg-sky-950/10 px-3 py-2 text-xs text-sky-100/80">
        <svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
        Dados, fome e dificuldade ocultos para a mesa.
      </div>

      <!-- Dice Results -->
      <div v-if="!isMaskedHiddenRoll" class="space-y-2">
        <!-- Normal Dice -->
        <div v-if="result.diceResults.normal && result.diceResults.normal.length > 0" class="flex flex-wrap gap-1.5">
          <div 
            v-for="(die, idx) in sortedNormalDice" 
            :key="`normal-${idx}`"
            class="dice-face"
            :class="getDiceClass(die, false)"
          >
            {{ die }}
          </div>
        </div>

        <!-- Hunger Dice -->
        <div v-if="result.diceResults.hunger && result.diceResults.hunger.length > 0" class="flex flex-wrap gap-1.5">
          <div 
            v-for="(die, idx) in sortedHungerDice" 
            :key="`hunger-${idx}`"
            class="dice-face dice-hunger"
            :class="getDiceClass(die, true)"
          >
            {{ die }}
          </div>
        </div>
      </div>
      <div v-else class="grid grid-cols-6 gap-1.5 opacity-60 blur-[1.5px]">
        <div v-for="index in 6" :key="index" class="dice-face dice-hidden">?</div>
      </div>

      <!-- Result Banner -->
      <div 
        class="rounded px-3 py-2 text-center"
        :class="resultBannerClass"
      >
        <p class="text-xs font-bold uppercase tracking-wider mb-1" :class="resultTextClass">
          {{ resultTitle }}
        </p>
        <p class="text-[11px] leading-relaxed" :class="resultDescriptionClass">
          {{ result.description }}
        </p>
      </div>

      <!-- Successes Summary -->
      <div class="flex items-center justify-between pt-2 border-t border-[#2d1515]">
        <template v-if="isMaskedHiddenRoll">
          <div class="text-xs text-sky-100/70">
            <span>Resultado:</span>
            <span class="ml-2 text-sky-300 font-bold uppercase tracking-wider">Oculto</span>
          </div>
          <div class="text-xs font-semibold text-sky-300">Teste Secreto</div>
        </template>
        <template v-else>
        <div class="text-xs text-[#6b6b7b]">
          <span>Sucessos:</span>
          <span class="ml-2 text-white font-bold text-base">{{ result.successes }}</span>
        </div>
        <div v-if="result.difficulty" class="text-xs">
          <span 
            :class="summaryStatusClass"
            class="font-semibold"
          >
            {{ result.successes >= result.difficulty ? '✓ SUCESSO' : '✗ FALHA' }}
          </span>
        </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RollResult } from '~/types/dice'

const props = defineProps<{
  result: RollResult
  avatarUrl?: string
  isNew?: boolean
}>()

const characterInitial = computed(() => {
  const name = String(props.result.characterName || '').trim()
  return name ? name.charAt(0).toUpperCase() : '?'
})

const sortedNormalDice = computed(() => {
  if (!props.result.diceResults.normal) return []
  return [...props.result.diceResults.normal].filter(d => d != null).sort((a, b) => b - a)
})

const sortedHungerDice = computed(() => {
  if (!props.result.diceResults.hunger) return []
  return [...props.result.diceResults.hunger].filter(d => d != null).sort((a, b) => b - a)
})

const isMaskedHiddenRoll = computed(() => {
  return props.result.isHidden && !props.result.canViewHiddenDetails
})

const formatRollType = computed(() => {
  const types: Record<string, string> = {
    normal: 'Rolagem Normal',
    oculta: 'Rolagem Oculta',
    resistida: 'Rolagem Resistida',
    frenesi: 'Teste de Frenesi',
    despertar: 'Teste de Despertar'
  }
  return types[props.result.rollType] || 'Rolagem'
})

const formattedTime = computed(() => {
  const date = new Date(props.result.createdAt)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

const isFrenzyRoll = computed(() => props.result.rollType === 'frenesi')
const isFrenzyFailure = computed(() => isFrenzyRoll.value && props.result.successes < props.result.difficulty)

const cardStyle = computed(() => {
  if (isFrenzyFailure.value) {
    return {
      background: 'linear-gradient(135deg, #120205 0%, #1e0308 45%, #090312 100%)',
      border: '1px solid rgba(185, 28, 28, 0.75)'
    }
  }

  return {
    background: 'linear-gradient(135deg, #05010A 0%, #090312 100%)',
    border: '1px solid rgba(127, 29, 29, 0.4)'
  }
})

const getDiceClass = (value: number, isHunger: boolean) => {
  if (isHunger) {
    if (value === 10) return 'dice-ten-hunger'
    if (value === 1) return 'dice-one-hunger'
    if (value >= 6) return 'dice-success-hunger'
    return 'dice-fail-hunger'
  }
  
  if (value === 10) return 'dice-ten'
  if (value >= 6) return 'dice-success'
  return 'dice-fail'
}

const cardClasses = computed(() => {
  if (isFrenzyFailure.value) return 'shadow-[0_0_32px_rgba(185,28,28,0.45)]'
  if (props.result.isMessyCritical) return 'shadow-[0_0_30px_rgba(220,38,38,0.4)]'
  if (props.result.isBestialFailure) return 'shadow-[0_0_30px_rgba(127,29,29,0.6)]'
  if (props.result.isCritical) return 'shadow-[0_0_25px_rgba(212,166,71,0.3)]'
  return 'shadow-[0_0_20px_rgba(0,0,0,0.5)]'
})

const glowStyle = computed(() => {
  if (isFrenzyFailure.value) {
    return {
      background: 'radial-gradient(circle at 50% 50%, rgba(185, 28, 28, 0.22), transparent 70%)',
      animation: 'pulse-glow 1.2s ease-in-out infinite'
    }
  }

  if (props.result.isMessyCritical) {
    return {
      background: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.15), transparent 70%)',
      animation: 'pulse-glow 2s ease-in-out infinite'
    }
  }
  if (props.result.isBestialFailure) {
    return {
      background: 'radial-gradient(circle at 50% 50%, rgba(127, 29, 29, 0.2), transparent 70%)',
      animation: 'pulse-glow 1.5s ease-in-out infinite'
    }
  }
  return {}
})

const resultTitle = computed(() => {
  if (isMaskedHiddenRoll.value) return 'Teste Oculto'

  if (props.result.rollType === 'frenesi') {
    return props.result.successes >= props.result.difficulty
      ? '✓ Frenesi Suprimido'
      : '✗ Frenesi Desencadeado'
  }

  if (props.result.isMessyCritical) return '⚠️ Crítico Descontrolado'
  if (props.result.isBestialFailure) return '🩸 Falha Bestial'
  if (props.result.isCritical) return '✨ Crítico'
  if (props.result.successes >= props.result.difficulty) return '✓ Sucesso'
  return '✗ Falha'
})

const resultBannerClass = computed(() => {
  if (isMaskedHiddenRoll.value) {
    return 'bg-sky-950/25 border border-sky-900/50'
  }

  if (isFrenzyRoll.value) {
    return props.result.successes >= props.result.difficulty
      ? 'bg-green-950/30 border border-green-900/40'
      : 'bg-red-950/70 border border-red-700'
  }

  if (props.result.isMessyCritical) return 'bg-red-950/40 border border-red-900/60'
  if (props.result.isBestialFailure) return 'bg-red-950/60 border border-red-800'
  if (props.result.isCritical) return 'bg-yellow-950/30 border border-yellow-900/40'
  if (props.result.successes >= props.result.difficulty) return 'bg-green-950/30 border border-green-900/40'
  return 'bg-red-950/20 border border-red-900/40'
})

const resultTextClass = computed(() => {
  if (isMaskedHiddenRoll.value) return 'text-sky-300'

  if (isFrenzyRoll.value) {
    return props.result.successes >= props.result.difficulty ? 'text-green-400' : 'text-red-500'
  }

  if (props.result.isMessyCritical) return 'text-red-400'
  if (props.result.isBestialFailure) return 'text-red-500'
  if (props.result.isCritical) return 'text-yellow-400'
  if (props.result.successes >= props.result.difficulty) return 'text-green-400'
  return 'text-red-300'
})

const resultDescriptionClass = computed(() => {
  if (isMaskedHiddenRoll.value) return 'text-sky-100/80'

  if (isFrenzyRoll.value) {
    return props.result.successes >= props.result.difficulty ? 'text-[#c4c4d4]/70' : 'text-red-200/90'
  }
  if (props.result.isMessyCritical || props.result.isBestialFailure) return 'text-red-200/80'
  if (props.result.isCritical) return 'text-yellow-200/70'
  if (props.result.successes >= props.result.difficulty) return 'text-[#c4c4d4]/70'
  return 'text-red-200/65'
})

const summaryStatusClass = computed(() => {
  if (isFrenzyRoll.value) {
    return props.result.successes >= props.result.difficulty ? 'text-green-400' : 'text-red-500'
  }

  return props.result.successes >= props.result.difficulty ? 'text-green-400' : 'text-red-400'
})
</script>

<style scoped>
.dice-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  pointer-events: none;
  z-index: 2;
}
.dice-corner::before,
.dice-corner::after {
  content: '';
  position: absolute;
  background: #dc2626;
}
.dice-corner-frenzy::before,
.dice-corner-frenzy::after {
  background: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
}
.dice-corner::before { width: 10px; height: 1px; }
.dice-corner::after { width: 1px; height: 10px; }
.dice-corner-tl { top: -1px; left: -1px; }
.dice-corner-tr { top: -1px; right: -1px; }
.dice-corner-tr::before { right: 0; }
.dice-corner-tr::after { right: 0; }
.dice-corner-bl { bottom: -1px; left: -1px; }
.dice-corner-bl::before { bottom: 0; }
.dice-corner-bl::after { bottom: 0; }
.dice-corner-br { bottom: -1px; right: -1px; }
.dice-corner-br::before { right: 0; bottom: 0; }
.dice-corner-br::after { right: 0; bottom: 0; }

.dice-face {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
  
  /* Efeito 3D aprimorado */
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 3px rgba(255, 255, 255, 0.15),
    inset 0 -2px 3px rgba(0, 0, 0, 0.4);
  
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  border: 2px solid rgba(255, 255, 255, 0.3);
  
  /* Rotação 3D inicial */
  transform: rotateX(-8deg) rotateY(8deg) translateZ(0);
  
  /* Textura sutil */
  background-image: 
    linear-gradient(145deg, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent);
}

.dice-face:hover {
  transform: rotateX(0deg) rotateY(0deg) translateZ(10px) scale(1.15);
  box-shadow: 
    0 10px 20px rgba(0, 0, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 3px rgba(255, 255, 255, 0.2),
    inset 0 -2px 3px rgba(0, 0, 0, 0.5);
}

.dice-hunger {
  background: linear-gradient(145deg, #991b1b, #7f1d1d);
  border: 2px solid #dc2626;
  box-shadow: 
    0 6px 16px rgba(220, 38, 38, 0.6),
    0 2px 6px rgba(220, 38, 38, 0.4),
    inset 0 2px 3px rgba(255, 100, 100, 0.25),
    inset 0 -2px 3px rgba(0, 0, 0, 0.5);
  background-image: 
    linear-gradient(145deg, rgba(255,100,100,0.15) 0%, transparent 50%),
    radial-gradient(circle at 30% 30%, rgba(255,100,100,0.2), transparent);
}

.dice-hunger:hover {
  box-shadow: 
    0 10px 24px rgba(220, 38, 38, 0.7),
    0 4px 10px rgba(220, 38, 38, 0.5),
    inset 0 2px 3px rgba(255, 100, 100, 0.3),
    inset 0 -2px 3px rgba(0, 0, 0, 0.6);
}

.dice-ten {
  @apply bg-yellow-500/20 border border-yellow-600 text-yellow-400;
  box-shadow: 0 0 15px rgba(234, 179, 8, 0.3);
}

.dice-ten-hunger {
  @apply text-red-300;
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
  animation: pulse-red 2s ease-in-out infinite;
}

.dice-one-hunger {
  @apply text-red-900 bg-red-950/60;
  animation: pulse 1.5s ease-in-out infinite;
}

.dice-success {
  @apply bg-white/10 border border-white/30 text-white;
}

.dice-success-hunger {
  @apply text-red-400;
}

.dice-fail {
  @apply bg-gray-900/40 border border-gray-800 text-gray-600;
}

.dice-hidden {
  @apply bg-sky-950/20 border border-sky-900/40 text-sky-200/70;
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.35),
    inset 0 1px 2px rgba(255, 255, 255, 0.06);
}

.dice-fail-hunger {
  @apply text-red-800/60 bg-red-950/20;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 20px rgba(220, 38, 38, 0.6);
  }
  50% {
    box-shadow: 0 0 30px rgba(220, 38, 38, 0.9);
  }
}

@keyframes pulse-subtle {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.95;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 1s ease-in-out 2;
}
</style>
