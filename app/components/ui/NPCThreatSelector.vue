<template>
  <div class="space-y-1.5">
    <label class="text-xs font-medium text-[#C6A85A] uppercase tracking-wider">
      Nível de Ameaça
    </label>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <button
        v-for="threat in threats"
        :key="threat.value"
        type="button"
        @click="selectThreat(threat.value)"
        :class="[
          'relative px-3 py-3 rounded-lg border transition-all duration-200',
          'hover:scale-105 hover:shadow-lg flex flex-col items-center gap-1',
          modelValue === threat.value
            ? threat.activeClass
            : 'bg-[#12121A] border-[#1F1F2E] hover:border-zinc-700/50 hover:bg-[#171722]'
        ]"
      >
        <span class="w-5 h-5 inline-block" v-html="threat.icon"></span>
        <span 
          :class="[
            'text-xs font-semibold uppercase tracking-wide',
            modelValue === threat.value ? threat.textClass : 'text-zinc-500'
          ]"
        >
          {{ threat.label }}
        </span>
        <div 
          v-if="modelValue === threat.value"
          class="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
          :class="threat.dotClass"
        ></div>
      </button>
    </div>
    <p class="text-[10px] text-zinc-500 italic mt-1">
      {{ selectedDescription }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const threats = [
  { 
    value: 'fraco', 
    label: 'Fraco', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    description: 'Ameaça mínima - vampiro jovem ou enfraquecido',
    activeClass: 'bg-gradient-to-br from-emerald-950/40 to-emerald-900/30 border-emerald-800/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    textClass: 'text-emerald-400',
    dotClass: 'bg-emerald-500'
  },
  { 
    value: 'moderado', 
    label: 'Moderado', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/></svg>',
    description: 'Ameaça equilibrada - adversário competente',
    activeClass: 'bg-gradient-to-br from-blue-950/40 to-blue-900/30 border-blue-800/60 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    textClass: 'text-blue-400',
    dotClass: 'bg-blue-500'
  },
  { 
    value: 'perigoso', 
    label: 'Perigoso', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    description: 'Ameaça séria - vampiro experiente e letal',
    activeClass: 'bg-gradient-to-br from-orange-950/40 to-orange-900/30 border-orange-800/60 shadow-[0_0_15px_rgba(249,115,22,0.2)]',
    textClass: 'text-orange-400',
    dotClass: 'bg-orange-500'
  },
  { 
    value: 'letal', 
    label: 'Letal', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 00-8 8c0 3.5 2 6 4 7.5V20h8v-2.5c2-1.5 4-4 4-7.5a8 8 0 00-8-8z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>',
    description: 'Ameaça extrema - ancião poderoso',
    activeClass: 'bg-gradient-to-br from-red-950/40 to-red-900/30 border-red-800/60 shadow-[0_0_15px_rgba(220,38,38,0.3)]',
    textClass: 'text-red-400',
    dotClass: 'bg-red-500'
  },
  { 
    value: 'anciao', 
    label: 'Ancião', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    description: 'Ameaça apocalíptica - matusalém ou antediluviano',
    activeClass: 'bg-gradient-to-br from-purple-950/40 to-purple-900/30 border-purple-800/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    textClass: 'text-purple-400',
    dotClass: 'bg-purple-500'
  },
  { 
    value: 'narrativo', 
    label: 'Narrativo', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
    description: 'Personagem não-combatente ou aliado',
    activeClass: 'bg-gradient-to-br from-amber-950/40 to-amber-900/30 border-amber-800/60 shadow-[0_0_15px_rgba(217,119,6,0.2)]',
    textClass: 'text-amber-400',
    dotClass: 'bg-amber-500'
  }
]

const selectThreat = (value: string) => {
  emit('update:modelValue', value)
}

const selectedDescription = computed(() => {
  const found = threats.find(t => t.value === props.modelValue)
  return found ? found.description : 'Selecione o nível de ameaça deste NPC'
})
</script>
