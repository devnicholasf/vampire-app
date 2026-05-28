<template>
  <div 
    class="h-full flex flex-col rounded-lg overflow-hidden"
    style="background: linear-gradient(180deg, #05010A 0%, #090312 100%); border: 1px solid rgba(127, 29, 29, 0.4);"
  >
    <!-- Header -->
    <div class="px-4 py-3 border-b border-[#2d1515] shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-[#d4a647]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 2l2 4H4L6 2zM18 2l2 4h-4l2-4zM12 7l2 4h-4l2-4zM3 14l2 4H1l2-4zM21 14l2 4h-4l2-4zM9 14l2 4H7l2-4zM15 14l2 4h-4l2-4zM12 18l2 4h-4l2-4z"/>
          </svg>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">Rolagens</h3>
        </div>
        <div class="flex items-center gap-2">
          <div 
            class="w-2 h-2 rounded-full bg-red-500"
            :class="{ 'animate-pulse': hasNewRolls }"
          />
          <span class="text-[10px] text-[#6b6b7b]">{{ rolls.length }}</span>
        </div>
      </div>
    </div>

    <!-- Feed Container -->
    <div 
      ref="feedContainer"
      class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
    >
      <template v-if="rolls.length === 0">
        <div class="flex flex-col items-center justify-center h-full text-center py-8">
          <svg class="w-12 h-12 text-[#2d1515] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
          <p class="text-xs text-[#6b6b7b]">Nenhuma rolagem ainda.</p>
          <p class="text-[10px] text-[#4a4a5a] mt-1">As rolagens aparecerão aqui em tempo real.</p>
        </div>
      </template>

      <TransitionGroup name="dice-feed">
        <DiceCard 
          v-for="roll in displayedRolls"
          :key="roll.id"
          :result="roll"
          :is-new="isNewRoll(roll.id)"
        />
      </TransitionGroup>

      <!-- Load more indicator -->
      <div 
        v-if="hasMoreRolls"
        class="text-center py-3"
      >
        <button
          class="text-xs text-[#d4a647] hover:text-white transition-colors"
          @click="loadMore"
        >
          Carregar mais rolagens
        </button>
      </div>
    </div>

    <!-- Quick Actions Footer -->
    <div class="px-4 py-3 border-t border-[#2d1515] shrink-0">
      <button
        class="w-full px-3 py-2 rounded border transition-all duration-200 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider"
        style="border-color: #d4a647; color: #d4a647; background: rgba(212, 166, 71, 0.05);"
        @mouseover="e => (e.currentTarget as HTMLElement).style.background = 'rgba(212, 166, 71, 0.15)'"
        @mouseout="e => (e.currentTarget as HTMLElement).style.background = 'rgba(212, 166, 71, 0.05)'"
        @click="$emit('open-roll-modal')"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2l2 4H4L6 2zM18 2l2 4h-4l2-4zM12 7l2 4h-4l2-4z"/>
        </svg>
        Nova Rolagem
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { RollResult } from '~/types/dice'
import DiceCard from './DiceCard.vue'

// Tipo flexível que aceita RollResult com arrays mutáveis ou readonly
type FlexibleRollResult = Omit<RollResult, 'diceResults'> & {
  diceResults: {
    normal: readonly number[] | number[]
    hunger: readonly number[] | number[]
  }
}

const props = defineProps<{
  rolls: readonly FlexibleRollResult[]
  maxDisplay?: number
}>()

const emit = defineEmits<{
  'open-roll-modal': []
  'load-more': []
}>()

const feedContainer = ref<HTMLElement | null>(null)
const newRollIds = ref<Set<string>>(new Set())
const displayLimit = ref(props.maxDisplay || 10)

const displayedRolls = computed(() => {
  return props.rolls
    .slice(0, displayLimit.value)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const hasMoreRolls = computed(() => {
  return props.rolls.length > displayLimit.value
})

const hasNewRolls = computed(() => {
  return newRollIds.value.size > 0
})

const isNewRoll = (rollId: string) => {
  return newRollIds.value.has(rollId)
}

const loadMore = () => {
  displayLimit.value += 10
  emit('load-more')
}

// Mark new rolls and auto-remove highlight after 3s
watch(() => props.rolls, (newRolls, oldRolls) => {
  if (!oldRolls || newRolls.length > oldRolls.length) {
    const newRollId = newRolls[0]?.id
    if (newRollId) {
      newRollIds.value.add(newRollId)
      
      // Auto-scroll to top on new roll
      nextTick(() => {
        if (feedContainer.value) {
          feedContainer.value.scrollTop = 0
        }
      })
      
      // Remove "new" highlight after 3 seconds
      setTimeout(() => {
        newRollIds.value.delete(newRollId)
      }, 3000)
    }
  }
}, { deep: true })
</script>

<style scoped>
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

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #991b1b;
}

/* Transition animations */
.dice-feed-enter-active {
  transition: all 0.4s ease-out;
}

.dice-feed-leave-active {
  transition: all 0.3s ease-in;
}

.dice-feed-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.dice-feed-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.dice-feed-move {
  transition: transform 0.4s ease;
}
</style>
