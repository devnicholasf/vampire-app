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
                <option v-for="type in rollTypesToShow" :key="type.value" :value="type.value">
                  {{ type.label }} — {{ type.description }}
                </option>
              </select>
            </div>

            <!-- NPC selector (master mode) -->
            <div v-if="npcOptions.length > 0">
              <label class="block text-xs font-semibold text-[#d4a647] uppercase tracking-wider mb-2">
                NPC
              </label>
              <select
                v-model="selectedNpcModel"
                class="w-full px-3 py-2 rounded border bg-[#0d0d20] text-white text-sm focus:outline-none focus:border-[#d4a647] transition-colors"
                style="border-color: #4a4a5a;"
              >
                <option value="">Selecione um NPC...</option>
                <option v-for="npc in npcOptions" :key="npc.id" :value="npc.id">
                  {{ npc.name }}
                </option>
              </select>
            </div>

            <!-- Attribute + Skill (2 columns) -->
            <div v-if="!isPlayerFrenzyMode" class="grid grid-cols-2 gap-4">
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

            <!-- Frenzy Details (player-only automation) -->
            <div v-else class="rounded-lg p-4 border space-y-3" style="background: rgba(212, 166, 71, 0.05); border-color: rgba(212, 166, 71, 0.2);">
              <p class="text-[10px] text-[#d4a647] uppercase tracking-wider">Teste de Frenesi</p>
              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="rounded border p-2" style="border-color: #4a4a5a; background: #0d0d20;">
                  <p class="text-[10px] text-[#6b6b7b] uppercase">Força de Vontade</p>
                  <p class="text-xl font-bold text-white">{{ frenzyWillpowerCurrent }}</p>
                </div>
                <div class="rounded border p-2" style="border-color: #4a4a5a; background: #0d0d20;">
                  <p class="text-[10px] text-[#6b6b7b] uppercase">Humanidade</p>
                  <p class="text-xl font-bold text-white">{{ frenzyHumanity }}</p>
                </div>
                <div class="rounded border p-2" style="border-color: #4a4a5a; background: #0d0d20;">
                  <p class="text-[10px] text-[#6b6b7b] uppercase">Bônus (1/3)</p>
                  <p class="text-xl font-bold text-[#d4a647]">{{ frenzyHumanityBonus }}</p>
                </div>
              </div>

              <div v-if="frenzyDifficultyPenalty > 0" class="rounded px-3 py-2 text-xs border bg-red-950/25 border-red-900/50 text-red-200">
                Penalidade de clã aplicada: +{{ frenzyDifficultyPenalty }} na dificuldade
                <span v-if="normalizedFrenzyClan">({{ normalizedFrenzyClan }})</span>.
              </div>

              <button
                v-if="frenzyWillpowerCurrent > 0"
                class="w-full px-3 py-2 rounded border text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                style="border-color: #d4a647; color: #d4a647; background: rgba(212, 166, 71, 0.06);"
                @click="useWillpowerWithoutRoll"
              >
                Gastar 1 Força de Vontade (suprimir por 1 turno sem rolar)
              </button>
            </div>

            <!-- Modifier + Difficulty (2 columns) -->
            <div :class="isPlayerFrenzyMode ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4'">
              <div v-if="!isPlayerFrenzyMode">
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
                  {{ isPlayerFrenzyMode ? 'Dificuldade Base' : 'Dificuldade' }}
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
                <p v-if="isPlayerFrenzyMode" class="mt-1 text-[10px] text-[#9b9bbb]">
                  Dificuldade final: {{ finalDifficultyForDisplay }}
                  <span v-if="frenzyDifficultyPenalty > 0"> (base {{ rollConfig.difficulty }} + penalidade {{ frenzyDifficultyPenalty }})</span>
                </p>
              </div>
            </div>

            <!-- Hunger -->
            <div v-if="!isPlayerFrenzyMode && showHunger">
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
              <p class="text-xs md:text-sm font-semibold text-[#d4a647] uppercase tracking-wider mb-3">Teste de Dados</p>
              <div class="flex items-center gap-2 mb-2">
                <div class="text-center">
                  <p class="text-[2.15rem] leading-none font-extrabold text-white">{{ calculatedPool }}</p>
                  <p class="text-[10px] text-[#6b6b7b]">Total</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs text-white">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>{{ normalDiceCount }} {{ normalDiceCount === 1 ? 'dado normal' : 'dados normais' }}</span>
              </div>
              <div v-if="hungerDiceCount > 0" class="flex items-center gap-2 text-xs text-red-500 mt-1">
                <svg class="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
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
import { ref, computed, watch } from 'vue'
import { VTM_ATTRIBUTES, VTM_SKILLS, ROLL_TYPES } from '~/types/dice'
import type { DiceRollConfig } from '~/types/dice'

const props = defineProps<{
  modelValue: boolean
  currentHunger?: number
  showHunger?: boolean
  npcOptions?: Array<{ id: string; name: string }>
  selectedNpcId?: string
  attributeValues?: Record<string, number>
  skillValues?: Record<string, number>
  autoCalculatePool?: boolean
  enablePlayerAutoRules?: boolean
  frenzyWillpowerCurrent?: number
  frenzyHumanity?: number
  frenzyClan?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:selectedNpcId': [value: string]
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

const showHunger = computed(() => props.showHunger ?? true)
const npcOptions = computed(() => props.npcOptions ?? [])

const selectedNpcModel = computed({
  get: () => props.selectedNpcId || '',
  set: (value: string) => emit('update:selectedNpcId', value)
})

const isPlayerFrenzyMode = computed(() => {
  return (props.enablePlayerAutoRules ?? false) && rollConfig.value.rollType === 'frenesi'
})

const rollTypesToShow = computed(() => {
  if (props.enablePlayerAutoRules) return ROLL_TYPES
  return ROLL_TYPES.filter(type => type.value === 'normal')
})

const frenzyWillpowerCurrent = computed(() => {
  return Math.max(0, Number(props.frenzyWillpowerCurrent ?? 0))
})

const frenzyHumanity = computed(() => {
  return Math.max(0, Number(props.frenzyHumanity ?? 0))
})

const frenzyHumanityBonus = computed(() => {
  return Math.floor(frenzyHumanity.value / 3)
})

const normalizedFrenzyClan = computed(() => {
  return String(props.frenzyClan || '').trim()
})

const frenzyDifficultyPenalty = computed(() => {
  const clan = normalizedFrenzyClan.value.toLowerCase()
  if (clan === 'brujah') return 2
  if (clan === 'gangrel') return 1
  return 0
})

const finalDifficultyForDisplay = computed(() => {
  const baseDifficulty = Math.max(1, Number(rollConfig.value.difficulty || 1))
  return baseDifficulty + frenzyDifficultyPenalty.value
})

const effectiveHunger = computed(() => {
  if (isPlayerFrenzyMode.value) return 0
  if (!showHunger.value) return 0
  return Math.max(0, Number(rollConfig.value.hunger || 0))
})

const effectiveModifier = computed(() => {
  return isPlayerFrenzyMode.value ? 0 : rollConfig.value.modifier
})

const getValueFromMap = (map: Record<string, number> | undefined, key: string): number => {
  if (!map || !key) return 0
  return Number(map[key] ?? 0)
}

// Atualizar hunger quando prop mudar
watch(() => props.currentHunger, (newHunger) => {
  if (showHunger.value && newHunger !== undefined) {
    rollConfig.value.hunger = newHunger
  }
})

watch(showHunger, (enabled) => {
  if (!enabled) {
    rollConfig.value.hunger = 0
  }
}, { immediate: true })

watch(() => props.enablePlayerAutoRules, (enabled) => {
  if (!enabled && rollConfig.value.rollType !== 'normal') {
    rollConfig.value.rollType = 'normal'
  }
}, { immediate: true })

const calculatedPool = computed(() => {
  if (isPlayerFrenzyMode.value) {
    return Math.max(0, frenzyWillpowerCurrent.value + frenzyHumanityBonus.value)
  }

  const shouldAutoCalculate = props.autoCalculatePool ?? false
  const base = shouldAutoCalculate
    ? getValueFromMap(props.attributeValues, rollConfig.value.attribute) + getValueFromMap(props.skillValues, rollConfig.value.skill)
    : 5

  return Math.max(0, base + effectiveModifier.value)
})

const normalDiceCount = computed(() => {
  if (isPlayerFrenzyMode.value) {
    return calculatedPool.value
  }
  return Math.max(0, calculatedPool.value - effectiveHunger.value)
})

const hungerDiceCount = computed(() => {
  if (isPlayerFrenzyMode.value) {
    return 0
  }
  return Math.min(effectiveHunger.value, calculatedPool.value)
})

const canRoll = computed(() => {
  if (isPlayerFrenzyMode.value) {
    return calculatedPool.value >= 1 && !isRolling.value
  }

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

    const resolvedAttributeValue = isPlayerFrenzyMode.value
      ? frenzyWillpowerCurrent.value
      : getValueFromMap(props.attributeValues, rollConfig.value.attribute)
    const resolvedSkillValue = isPlayerFrenzyMode.value
      ? frenzyHumanityBonus.value
      : getValueFromMap(props.skillValues, rollConfig.value.skill)

    const normalizedConfig: DiceRollConfig = isPlayerFrenzyMode.value
      ? {
          ...rollConfig.value,
          attribute: 'Força de Vontade',
          skill: 'Humanidade (Bônus)',
          modifier: 0,
          hunger: 0,
          difficulty: finalDifficultyForDisplay.value,
          frenzyBaseDifficulty: rollConfig.value.difficulty,
          frenzyDifficultyPenalty: frenzyDifficultyPenalty.value,
          attributeValue: resolvedAttributeValue,
          skillValue: resolvedSkillValue
        }
      : {
          ...rollConfig.value,
          hunger: effectiveHunger.value,
          attributeValue: resolvedAttributeValue,
          skillValue: resolvedSkillValue
        }
    
    emit('roll', normalizedConfig)
    
    // Reset form após rolagem
    setTimeout(() => {
      rollConfig.value = {
        attribute: '',
        skill: '',
        modifier: 0,
        difficulty: 2,
        rollType: 'normal',
        hunger: showHunger.value ? (props.currentHunger || 0) : 0
      }
      close()
    }, 500)
  } finally {
    isRolling.value = false
  }
}

const useWillpowerWithoutRoll = () => {
  if (!isPlayerFrenzyMode.value || frenzyWillpowerCurrent.value <= 0) return

  const config: DiceRollConfig = {
    ...rollConfig.value,
    rollType: 'frenesi',
    attribute: 'Força de Vontade (Gasta)',
    skill: 'Supressão Automática',
    modifier: 0,
    hunger: 0,
    difficulty: finalDifficultyForDisplay.value,
    frenzyBaseDifficulty: rollConfig.value.difficulty,
    frenzyDifficultyPenalty: frenzyDifficultyPenalty.value,
    frenzyAutoSuccess: true,
    attributeValue: 0,
    skillValue: 0
  }

  emit('roll', config)
  close()
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
