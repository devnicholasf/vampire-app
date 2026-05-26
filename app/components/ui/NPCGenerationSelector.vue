<template>
  <div class="space-y-1.5">
    <label class="text-xs font-medium text-[#C6A85A] uppercase tracking-wider">
      Geração
    </label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="gen in generations"
        :key="gen.value"
        type="button"
        @click="selectGeneration(gen.value)"
        :class="[
          'relative px-4 py-2.5 rounded-lg border transition-all duration-200',
          'hover:scale-105 hover:shadow-lg',
          modelValue === gen.value
            ? 'bg-gradient-to-br from-red-950/40 to-red-900/30 border-red-800/60 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
            : 'bg-[#12121A] border-[#1F1F2E] hover:border-red-900/40 hover:bg-[#171722]'
        ]"
        :title="gen.tooltip"
      >
        <span 
          :class="[
            'text-sm font-semibold',
            modelValue === gen.value ? 'text-red-400' : 'text-zinc-400'
          ]"
        >
          {{ gen.label }}
        </span>
        <div 
          v-if="modelValue === gen.value"
          class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
        ></div>
      </button>
    </div>
    <p class="text-[10px] text-zinc-500 italic mt-1">
      {{ selectedTooltip }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const generations = [
  { value: 13, label: '13ª', tooltip: 'Neonate - Recém-abraçado, inexperiente' },
  { value: 12, label: '12ª', tooltip: 'Neonate - Jovem vampiro em ascensão' },
  { value: 11, label: '11ª', tooltip: 'Ancilla - Vampiro experiente' },
  { value: 10, label: '10ª', tooltip: 'Ancilla - Veterano respeitado' },
  { value: 9, label: '9ª', tooltip: 'Elder - Ancião com séculos de poder' },
  { value: 8, label: '8ª', tooltip: 'Elder - Matusalém das noites antigas' },
  { value: 7, label: '7ª', tooltip: 'Elder - Vampiro milenário' },
  { value: 6, label: '6ª', tooltip: 'Matusalém - Antediluviano jovem' },
  { value: 5, label: '5ª', tooltip: 'Matusalém - Poder quase divino' }
]

const selectGeneration = (value: number) => {
  emit('update:modelValue', value)
}

const selectedTooltip = computed(() => {
  const found = generations.find(g => g.value === props.modelValue)
  return found ? found.tooltip : 'Selecione uma geração'
})
</script>
