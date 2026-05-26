<template>
  <div class="space-y-1.5 relative">
    <label class="text-xs font-medium text-[#C6A85A] uppercase tracking-wider">
      Pool Principal
    </label>
    <input
      v-model="inputValue"
      type="text"
      placeholder="Ex: Manipulação + Persuasão"
      @input="onInput"
      @focus="showSuggestions = true"
      @blur="hideSuggestions"
      class="w-full px-3 py-2.5 bg-[#0d0d20] text-zinc-300 text-sm rounded-lg border border-[#1F1F2E] 
             placeholder:text-zinc-600 transition-all duration-200
             focus:outline-none focus:border-red-800/50 focus:shadow-[0_0_10px_rgba(220,38,38,0.15)]"
    />
    
    <!-- Sugestões -->
    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="absolute z-50 w-full mt-1 bg-[#12121A] border border-[#1F1F2E] rounded-lg shadow-xl 
             max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-red-900/30 scrollbar-track-transparent"
    >
      <button
        v-for="(suggestion, idx) in filteredSuggestions"
        :key="idx"
        type="button"
        @mousedown.prevent="selectSuggestion(suggestion)"
        class="w-full px-4 py-3 text-left border-b border-[#1F1F2E] last:border-b-0
               hover:bg-[#171722] transition-colors duration-150 group"
      >
        <div class="flex items-start gap-2">
          <span class="w-4 h-4 mt-0.5 text-red-500" v-html="suggestion.icon"></span>
          <div class="flex-1">
            <p class="text-sm text-zinc-300 font-medium group-hover:text-red-400 transition-colors">
              {{ suggestion.pool }}
            </p>
            <p class="text-[10px] text-zinc-500 mt-0.5">
              {{ suggestion.description }}
            </p>
          </div>
        </div>
      </button>
    </div>
    
    <!-- Helper Text -->
    <p class="text-[10px] text-zinc-500 italic">
      Digite ou selecione uma combinação de atributo + habilidade
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

const inputValue = ref(props.modelValue)
const showSuggestions = ref(false)

const suggestions = [
  { 
    pool: 'Manipulação + Persuasão', 
    description: 'Manipulação social refinada',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>'
  },
  { 
    pool: 'Carisma + Intimidação', 
    description: 'Presença ameaçadora e dominante',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
  },
  { 
    pool: 'Inteligência + Ocultismo', 
    description: 'Conhecimento sobrenatural profundo',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>'
  },
  { 
    pool: 'Destreza + Armas de Fogo', 
    description: 'Combate armado preciso',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>'
  },
  { 
    pool: 'Força + Briga', 
    description: 'Combate corpo a corpo brutal',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/></svg>'
  },
  { 
    pool: 'Raciocínio + Investigação', 
    description: 'Dedução e análise criminal',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'
  },
  { 
    pool: 'Manipulação + Lábia', 
    description: 'Enganação e manipulação verbal',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>'
  },
  { 
    pool: 'Percepção + Prontidão', 
    description: 'Vigilância e detecção de perigos',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>'
  },
  { 
    pool: 'Inteligência + Política', 
    description: 'Estratégia política vampírica',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10l4-4V5a2 2 0 00-2-2z"/><path d="M17 21v-4h4"/></svg>'
  },
  { 
    pool: 'Carisma + Liderança', 
    description: 'Comando e influência sobre outros',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
  },
  { 
    pool: 'Raciocínio + Medicina', 
    description: 'Conhecimento médico e anatômico',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>'
  },
  { 
    pool: 'Destreza + Furtividade', 
    description: 'Movimento silencioso nas sombras',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
  }
]

const filteredSuggestions = computed(() => {
  if (!inputValue.value) return suggestions
  const search = inputValue.value.toLowerCase()
  return suggestions.filter(s => 
    s.pool.toLowerCase().includes(search) || 
    s.description.toLowerCase().includes(search)
  )
})

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  inputValue.value = target.value
  emit('update:modelValue', target.value)
}

const selectSuggestion = (suggestion: typeof suggestions[0]) => {
  inputValue.value = suggestion.pool
  emit('update:modelValue', suggestion.pool)
  showSuggestions.value = false
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}
</script>
