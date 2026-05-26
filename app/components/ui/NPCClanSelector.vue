<template>
  <div class="relative">
    <label class="df-label mb-2">Clã *</label>
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full df-clan-trigger"
      :class="{ 'df-clan-trigger-active': modelValue }"
    >
      <div class="flex items-center gap-3">
        <span class="w-6 h-6 text-df-gold" v-html="getClanIcon(modelValue)"></span>
        <div class="flex-1 text-left">
          <div class="text-sm font-semibold text-white">{{ modelValue || 'Selecione o clã' }}</div>
          <div v-if="modelValue" class="text-xs text-df-muted">{{ getClanDescription(modelValue) }}</div>
        </div>
      </div>
      <svg 
        class="w-5 h-5 text-df-muted transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <div 
        v-if="isOpen" 
        class="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto df-scrollbar rounded-lg border border-df-border-red/30 bg-df-card shadow-2xl"
      >
        <button
          v-for="clan in clans"
          :key="clan.name"
          type="button"
          @click="select(clan.name)"
          class="df-clan-option"
          :class="{ 'df-clan-option-selected': modelValue === clan.name }"
        >
          <span class="w-6 h-6 text-df-gold" v-html="clan.icon"></span>
          <div class="flex-1 text-left">
            <div class="text-sm font-semibold text-white">{{ clan.name }}</div>
            <div class="text-xs text-df-muted">{{ clan.description }}</div>
          </div>
          <svg 
            v-if="modelValue === clan.name"
            class="w-5 h-5 text-df-gold flex-shrink-0" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isOpen = ref(false)

const clans = [
  { name: 'Ventrue', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>', description: 'Elite da Camarilla' },
  { name: 'Toreador', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>', description: 'Artistas vampíricos' },
  { name: 'Tremere', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>', description: 'Feiticeiros do sangue' },
  { name: 'Brujah', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>', description: 'Rebeldes violentos' },
  { name: 'Gangrel', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', description: 'Bestas selvagens' },
  { name: 'Malkavian', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', description: 'Profetas loucos' },
  { name: 'Nosferatu', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 00-8 8c0 3.5 2 6 4 7.5V20h8v-2.5c2-1.5 4-4 4-7.5a8 8 0 00-8-8z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>', description: 'Criaturas das sombras' },
  { name: 'Banu Haqim', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>', description: 'Juízes silenciosos' },
  { name: 'Hecata', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10l4-4V5a2 2 0 00-2-2z"/><path d="M17 21v-4h4"/></svg>', description: 'Necromantes do clã da morte' },
  { name: 'Lasombra', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>', description: 'Mestres das sombras' },
  { name: 'O Ministério', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', description: 'Seguidores de Set' },
  { name: 'Tzimisce', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>', description: 'Artesãos da carne' },
  { name: 'Ravnos', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>', description: 'Ilusionistas errantes' },
  { name: 'Salubri', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>', description: 'Curandeiros unicórnios' },
  { name: 'Caitiff', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', description: 'Sem clã definido' },
  { name: 'Sangue Fraco', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>', description: 'Sangue diluído' }
]

const getClanIcon = (name: string) => {
  return clans.find(c => c.name === name)?.icon || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'
}

const getClanDescription = (name: string) => {
  return clans.find(c => c.name === name)?.description || ''
}

const select = (name: string) => {
  emit('update:modelValue', name)
  isOpen.value = false
}
</script>

<style scoped>
.df-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--df-text-gold, #d4a647);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.df-clan-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--df-bg-input, #0d0d20);
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.df-clan-trigger:hover {
  border-color: var(--df-red, #dc2626);
  background: var(--df-bg-card, #0a0a1a);
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.15);
}

.df-clan-trigger-active {
  border-color: var(--df-red, #dc2626);
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.2);
}

.df-clan-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(74, 74, 90, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.df-clan-option:last-child {
  border-bottom: none;
}

.df-clan-option:hover {
  background: rgba(127, 29, 29, 0.15);
}

.df-clan-option-selected {
  background: rgba(220, 38, 38, 0.1);
}

.df-scrollbar::-webkit-scrollbar { width: 6px; }
.df-scrollbar::-webkit-scrollbar-track { background: var(--df-bg-deep, #050510); }
.df-scrollbar::-webkit-scrollbar-thumb { background: var(--df-border-red, #7f1d1d); border-radius: 3px; }

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
