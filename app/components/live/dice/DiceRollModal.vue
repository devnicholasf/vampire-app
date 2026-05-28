<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(4px);"
      >
        <div
          class="relative w-full max-w-2xl rounded-lg overflow-hidden"
          style="background: linear-gradient(180deg, #05010A 0%, #090312 100%); border: 1px solid rgba(127, 29, 29, 0.6); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);"
        >
          <!-- Decorative corners -->
          <span class="dice-corner dice-corner-tl" />
          <span class="dice-corner dice-corner-tr" />
          <span class="dice-corner dice-corner-bl" />
          <span class="dice-corner dice-corner-br" />

          <!-- Header -->
          <div class="px-6 py-4 border-b border-[#2d1515]">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-[#d4a647]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 2l2 4H4L6 2zM18 2l2 4h-4l2-4zM12 7l2 4h-4l2-4z"/>
                </svg>
                <h2 class="text-lg font-bold text-white uppercase tracking-wider">Nova Rolagem</h2>
              </div>
              <button
                class="w-8 h-8 flex items-center justify-center rounded transition-colors text-[#6b6b7b] hover:text-white hover:bg-white/5"
                @click="close"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <!-- Roll Type -->
            <div>
              <label class="block text-xs font-semibold text-[#d4a647] uppercase tracking-wider mb-2">
                Tipo de Rolagem
              </label>
              <select
                v-model="rollConfig.rollType"
                class="w-full px-3 py-2 rounded border bg-[#0d0d20] text-white text-sm focus:outline-none focus:border-[#d4a647] transition-colors"
                style="border-color: #4a4a5a;"
              >
                <option v-for="type in ROLL_TYPES" :key="type.value" :value="type.value">
                  {{ type.label }} — {{ type.description }}
                </option>
              </select>
            </div>

            <!-- Attribute + Skill (2 columns) -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-[#d4a647] uppercase tracking-wider mb-2">
                  Atributo
                </label>
                <select
                  v-model="rollConfig.attribute"
                  class="w-full px-3 py-2 rounded border bg-[#0d0d20] text-white text-sm focus:outline-none focus:border-[#d4a647] transition-colors"
                  style="border-color: #4a4a5a;"
                >
                  <option value="">Selecione...</option>
                  <option v-for="attr in VTM_ATTRIBUTES" :key="attr.value" :value="attr.label">
                    {{ attr.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#d4a647] uppercase tracking-wider mb-2">
                  Habilidade
                </label>
                <select
                  v-model="rollConfig.skill"
                  class="w-full px-3 py-2 rounded border bg-[#0d0d20] text-white text-sm focus:outline-none focus:border-[#d4a647] transition-colors"
                  style="border-color: #4a4a5a;"
                >
                  <option value="">Selecione...</option>
                  <option v-for="skill in VTM_SKILLS" :key="skill.value" :value="skill.label">
                    {{ skill.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Modifier + Difficulty (2 columns) -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-[#d4a647] uppercase tracking-wider mb-2">
                  Modificador
                </label>
                <input
                  v-model.number="rollConfig.modifier"
                  type="number"
                  min="-5"
                  max="5"
                  class="w-full px-3 py-2 rounded border bg-[#0d0d20] text-white text-sm focus:outline-none focus:border-[#d4a647] transition-colors"
                  style="border-color: #4a4a5a;"
                  placeholder="0"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#d4a647] uppercase tracking-wider mb-2">
                  Dificuldade
                </label>
                <input
                  v-model.number="rollConfig.difficulty"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full px-3 py-2 rounded border bg-[#0d0d20] text-white text-sm focus:outline-none focus:border-[#d4a647] transition-colors"
                  style="border-color: #4a4a5a;"
                  placeholder="2"
                />
              </div>
            </div>

            <!-- Hunger -->
            <div>
              <label class="block text-xs font-semibold text-[#d4a647] uppercase tracking-wider mb-2">
                Fome Atual
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="rollConfig.hunger"
                  type="range"
                  min="0"
                  max="5"
                  class="flex-1 hunger-slider"
                />
                <div 
                  class="w-12 h-10 flex items-center justify-center rounded border font-bold text-lg"
                  :class="hungerColorClass"
                  style="border-color: #7f1d1d;"
                >
                  {{ rollConfig.hunger }}
                </div>
              </div>
              <div class="flex justify-between text-[10px] text-[#6b6b7b] mt-1">
                <span>Nenhuma</span>
                <span>Frenesi</span>
              </div>
            </div>

            <!-- Pool Preview -->
            <div 
              class="rounded-lg p-4 border"
              style="background: rgba(212, 166, 71, 0.05); border-color: rgba(212, 166, 71, 0.2);"
            >
              <p class="text-[10px] text-[#d4a647] uppercase tracking-wider mb-3">Parada de Dados</p>
              <div class="flex items-center gap-2 mb-2">
                <div class="text-center">
                  <p class="text-2xl font-bold text-white">{{ calculatedPool }}</p>
                  <p class="text-[10px] text-[#6b6b7b]">Total</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs text-[#9b9bbb]">
                <svg class="w-3 h-3 text-[#d4a647]" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>{{ normalDiceCount }} {{ normalDiceCount === 1 ? 'dado normal' : 'dados normais' }}</span>
              </div>
              <div v-if="hungerDiceCount > 0" class="flex items-center gap-2 text-xs text-red-400 mt-1">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>{{ hungerDiceCount }} {{ hungerDiceCount === 1 ? 'dado de fome' : 'dados de fome' }} (substitui {{ hungerDiceCount === 1 ? 'normal' : 'normais' }})</span>
              </div>
            </div>

            <!-- Warning if pool is too small -->
            <div 
              v-if="calculatedPool < 1"
              class="rounded px-3 py-2 text-xs text-yellow-200 bg-yellow-950/30 border border-yellow-900/40"
            >
              ⚠️ A parada de dados não pode ser menor que 1
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-[#2d1515] flex items-center justify-between">
            <button
              class="px-4 py-2 rounded border text-sm font-semibold transition-colors"
              style="border-color: #4a4a5a; color: #9b9bbb;"
              @mouseover="e => (e.currentTarget as HTMLElement).style.color = '#fff'"
              @mouseout="e => (e.currentTarget as HTMLElement).style.color = '#9b9bbb'"
              @click="close"
            >
              Cancelar
            </button>
            <button
              :disabled="!canRoll || isRolling"
              class="px-6 py-2 rounded border font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :style="rollButtonStyle"
              @click="executeRoll"
            >
              <svg v-if="isRolling" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 2l2 4H4L6 2zM18 2l2 4h-4l2-4zM12 7l2 4h-4l2-4z"/>
              </svg>
              {{ isRolling ? 'Rolando...' : 'Rolar Dados' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { VTM_ATTRIBUTES, VTM_SKILLS, ROLL_TYPES } from '~/types/dice'
import type { DiceRollConfig } from '~/types/dice'

const props = defineProps<{
  modelValue: boolean
  currentHunger?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'roll': [config: DiceRollConfig]
}>()

const rollConfig = ref<DiceRollConfig>({
  attribute: '',
  skill: '',
  modifier: 0,
  difficulty: 2,
  rollType: 'normal',
  hunger: props.currentHunger || 0
})

const isRolling = ref(false)

// Atualizar hunger quando prop mudar
watch(() => props.currentHunger, (newHunger) => {
  if (newHunger !== undefined) {
    rollConfig.value.hunger = newHunger
  }
})

const calculatedPool = computed(() => {
  // TODO: Integrar com sistema de fichas para pegar valores reais
  // Por enquanto, retorna valor base para demonstração
  const base = 5
  return Math.max(0, base + rollConfig.value.modifier)
})

const normalDiceCount = computed(() => {
  return Math.max(0, calculatedPool.value - rollConfig.value.hunger)
})

const hungerDiceCount = computed(() => {
  return Math.min(rollConfig.value.hunger, calculatedPool.value)
})

const canRoll = computed(() => {
  return (
    rollConfig.value.attribute &&
    rollConfig.value.skill &&
    calculatedPool.value >= 1 &&
    !isRolling.value
  )
})

const hungerColorClass = computed(() => {
  const hunger = rollConfig.value.hunger
  if (hunger === 0) return 'text-gray-400 bg-gray-950/40'
  if (hunger <= 2) return 'text-yellow-400 bg-yellow-950/40'
  if (hunger <= 4) return 'text-red-400 bg-red-950/40'
  return 'text-red-500 bg-red-950/60 animate-pulse'
})

const rollButtonStyle = computed(() => {
  if (!canRoll.value) {
    return {
      borderColor: '#4a4a5a',
      color: '#6b6b7b',
      background: 'transparent'
    }
  }
  return {
    borderColor: '#d4a647',
    color: '#d4a647',
    background: 'linear-gradient(135deg, rgba(212, 166, 71, 0.1), rgba(212, 166, 71, 0.05))'
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const executeRoll = async () => {
  if (!canRoll.value) return
  
  isRolling.value = true
  
  try {
    // Pequeno delay para efeito dramático
    await new Promise(resolve => setTimeout(resolve, 300))
    
    emit('roll', { ...rollConfig.value })
    
    // Reset form após rolagem
    setTimeout(() => {
      rollConfig.value = {
        attribute: '',
        skill: '',
        modifier: 0,
        difficulty: 2,
        rollType: 'normal',
        hunger: props.currentHunger || 0
      }
      close()
    }, 500)
  } finally {
    isRolling.value = false
  }
}
</script>

<style scoped>
.dice-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  pointer-events: none;
  z-index: 2;
}
.dice-corner::before,
.dice-corner::after {
  content: '';
  position: absolute;
  background: #dc2626;
}
.dice-corner::before { width: 12px; height: 1px; }
.dice-corner::after { width: 1px; height: 12px; }
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

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #05010A;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #7f1d1d;
  border-radius: 3px;
}

/* Hunger Slider */
.hunger-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, 
    #4a4a5a 0%, 
    #eab308 40%, 
    #dc2626 80%, 
    #7f1d1d 100%
  );
  outline: none;
}

.hunger-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #dc2626;
  cursor: pointer;
  border: 2px solid #7f1d1d;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
}

.hunger-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #dc2626;
  cursor: pointer;
  border: 2px solid #7f1d1d;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
}

/* Modal transitions */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div {
  transform: scale(0.95) translateY(20px);
}

.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
