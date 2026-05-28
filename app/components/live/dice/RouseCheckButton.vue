<template>
  <button
    :disabled="disabled || isProcessing"
    class="relative px-4 py-2 rounded border font-semibold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
    :class="buttonClasses"
    :style="buttonStyle"
    @click="handleRouseCheck"
  >
    <!-- Glow effect for high hunger -->
    <div 
      v-if="currentHunger >= 4"
      class="absolute inset-0 rounded pointer-events-none"
      style="background: radial-gradient(circle, rgba(220, 38, 38, 0.2), transparent); animation: pulse-glow 2s ease-in-out infinite;"
    />

    <svg 
      v-if="isProcessing" 
      class="w-4 h-4 animate-spin" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2"
    >
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>

    <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/>
    </svg>

    <span class="relative z-10">
      {{ isProcessing ? 'Rolando...' : 'Teste de Despertar' }}
    </span>

    <!-- Hunger indicator -->
    <div 
      v-if="!isProcessing"
      class="relative z-10 px-2 py-0.5 rounded text-xs font-bold"
      :class="hungerBadgeClass"
    >
      {{ currentHunger }}
    </div>
  </button>

  <!-- Result Modal -->
  <Teleport to="body">
    <Transition name="result-modal">
      <div
        v-if="showResult"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style="background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(8px);"
        @click="closeResult"
      >
        <div
          class="relative max-w-md w-full rounded-lg overflow-hidden"
          :class="resultContainerClass"
          style="border: 2px solid;"
          :style="{ borderColor: result?.hungerIncreased ? '#dc2626' : '#22c55e' }"
          @click.stop
        >
          <!-- Animated background -->
          <div 
            class="absolute inset-0 pointer-events-none"
            :style="resultBackgroundStyle"
          />

          <div class="relative z-10 p-8 text-center space-y-6">
            <!-- Icon -->
            <div class="flex justify-center">
              <div 
                class="w-20 h-20 rounded-full flex items-center justify-center"
                :class="result?.hungerIncreased ? 'bg-red-950/60 animate-pulse' : 'bg-green-950/40'"
              >
                <svg 
                  class="w-10 h-10"
                  :class="result?.hungerIncreased ? 'text-red-500' : 'text-green-400'"
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/>
                </svg>
              </div>
            </div>

            <!-- Title -->
            <div>
              <h3 
                class="text-2xl font-bold uppercase tracking-wider mb-2"
                :class="result?.hungerIncreased ? 'text-red-400' : 'text-green-400'"
              >
                {{ result?.hungerIncreased ? 'Falha' : 'Sucesso' }}
              </h3>
              <p class="text-sm text-[#6b6b7b] uppercase tracking-wider">
                Teste de Despertar
              </p>
            </div>

            <!-- Dice Result -->
            <div class="flex justify-center">
              <div 
                class="w-16 h-16 rounded-lg flex items-center justify-center text-3xl font-bold border-2"
                :class="diceResultClass"
                :style="{ borderColor: result?.diceValue >= 6 ? '#22c55e' : '#dc2626' }"
              >
                {{ result?.diceValue }}
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <p 
                class="text-base font-semibold"
                :class="result?.hungerIncreased ? 'text-red-200' : 'text-green-200'"
              >
                {{ result?.hungerIncreased 
                  ? 'A Fome aumenta...' 
                  : 'Você controla a Besta.' 
                }}
              </p>
              <div class="flex items-center justify-center gap-3 text-sm">
                <span class="text-[#6b6b7b]">Fome:</span>
                <span 
                  class="font-bold text-xl"
                  :class="result?.hungerIncreased ? 'text-red-400 animate-pulse' : 'text-white'"
                >
                  {{ result?.newHunger }}
                </span>
              </div>
            </div>

            <!-- Close button -->
            <button
              class="w-full px-4 py-2 rounded border font-semibold text-sm uppercase tracking-wider transition-colors"
              :style="{ 
                borderColor: result?.hungerIncreased ? '#dc2626' : '#22c55e',
                color: result?.hungerIncreased ? '#dc2626' : '#22c55e'
              }"
              @click="closeResult"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDice } from '~/composables/useDice'
import type { RouseCheckResult } from '~/types/dice'

const props = defineProps<{
  currentHunger: number
  campaignId: string
  characterName: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'hunger-change': [newHunger: number]
}>()

const { rouseCheck } = useDice()

const isProcessing = ref(false)
const showResult = ref(false)
const result = ref<RouseCheckResult | null>(null)

const buttonClasses = computed(() => {
  if (props.disabled || isProcessing.value) {
    return 'opacity-50 cursor-not-allowed border-gray-700 text-gray-600 bg-gray-900/20'
  }
  
  if (props.currentHunger >= 4) {
    return 'border-red-600 text-red-400 bg-red-950/30 hover:bg-red-950/50'
  }
  
  return 'border-red-800 text-red-300 bg-red-950/20 hover:bg-red-950/40'
})

const buttonStyle = computed(() => {
  if (props.disabled || isProcessing.value) return {}
  
  return {
    boxShadow: props.currentHunger >= 4 
      ? '0 0 20px rgba(220, 38, 38, 0.4)' 
      : '0 0 10px rgba(127, 29, 29, 0.3)'
  }
})

const hungerBadgeClass = computed(() => {
  const hunger = props.currentHunger
  if (hunger === 0) return 'bg-gray-800 text-gray-400'
  if (hunger <= 2) return 'bg-yellow-900/50 text-yellow-400'
  if (hunger <= 4) return 'bg-red-900/50 text-red-400'
  return 'bg-red-800 text-red-300 animate-pulse'
})

const resultContainerClass = computed(() => {
  return result.value?.hungerIncreased
    ? 'bg-gradient-to-b from-[#1a0505] to-[#0a0a0a]'
    : 'bg-gradient-to-b from-[#051a05] to-[#0a0a0a]'
})

const resultBackgroundStyle = computed(() => {
  const color = result.value?.hungerIncreased ? '220, 38, 38' : '34, 197, 94'
  return {
    background: `radial-gradient(circle at 50% 50%, rgba(${color}, 0.15), transparent 70%)`,
    animation: 'pulse-glow 2s ease-in-out infinite'
  }
})

const diceResultClass = computed(() => {
  if (!result.value) return ''
  
  if (result.value.diceValue >= 6) {
    return 'bg-green-950/40 text-green-400'
  }
  return 'bg-red-950/60 text-red-400 animate-pulse'
})

const handleRouseCheck = async () => {
  if (props.disabled || isProcessing.value || props.currentHunger >= 5) return
  
  isProcessing.value = true
  
  try {
    const checkResult = await rouseCheck(
      props.campaignId,
      props.currentHunger,
      props.characterName
    )
    
    if (checkResult) {
      result.value = checkResult
      showResult.value = true
      
      // Emitir mudança de fome
      emit('hunger-change', checkResult.newHunger)
    }
  } catch (error) {
    console.error('Erro no Rouse Check:', error)
  } finally {
    isProcessing.value = false
  }
}

const closeResult = () => {
  showResult.value = false
  setTimeout(() => {
    result.value = null
  }, 300)
}
</script>

<style scoped>
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Modal transitions */
.result-modal-enter-active {
  transition: all 0.3s ease-out;
}

.result-modal-leave-active {
  transition: all 0.2s ease-in;
}

.result-modal-enter-from,
.result-modal-leave-to {
  opacity: 0;
}

.result-modal-enter-from > div {
  transform: scale(0.9) translateY(-20px);
}

.result-modal-leave-to > div {
  transform: scale(0.9);
}
</style>
