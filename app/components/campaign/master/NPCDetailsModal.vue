<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
    <div class="df-modal-card w-full max-w-3xl max-h-[90vh] overflow-y-auto df-scrollbar">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>

      <div class="relative z-10">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-df-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Detalhes do NPC
          </h3>
          <button @click="$emit('close')" class="df-btn-icon">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div v-if="npc" class="space-y-6">
          <!-- NPC Profile Header -->
          <div class="flex items-center gap-6 pb-6 border-b border-df-border-red/50">
            <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-df-border-red bg-df-input flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-900/30">
              <img v-if="npc.photo" :src="npc.photo" :alt="npc.name" class="w-full h-full object-cover" />
              <svg v-else class="w-14 h-14 text-df-red/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
            </div>
            <div>
              <h4 class="text-2xl font-bold text-white">{{ npc.name }}</h4>
              <p v-if="npc.clan" class="text-df-red font-medium text-lg">{{ npc.clan }}</p>
              <p v-if="npc.generation" class="text-sm text-df-muted">{{ npc.generation }}ª Geração</p>
              <p v-if="npc.sect" class="text-sm text-df-gold font-medium">{{ npc.sect }}</p>
              <span v-if="npc.status" class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide" :class="statusBadgeClass(npc.status)">{{ statusLabel(npc.status) }}</span>
            </div>
          </div>

          <!-- Papel na Crônica & Motivação -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-if="npc.role">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-2">Papel na Crônica</h5>
              <p class="text-sm text-df-silver leading-relaxed">{{ npc.role }}</p>
            </div>
            <div v-if="npc.motivation">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-2">Motivação</h5>
              <p class="text-sm text-df-silver leading-relaxed">{{ npc.motivation }}</p>
            </div>
          </div>

          <!-- Segredo & Pool -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-if="npc.secret">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-2">Segredo</h5>
              <p class="text-sm text-df-silver leading-relaxed">{{ npc.secret }}</p>
            </div>
            <div v-if="npc.mainPool">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-2">Pool Principal</h5>
              <p class="text-sm text-df-silver leading-relaxed">{{ npc.mainPool }}</p>
            </div>
          </div>

          <!-- Key Points -->
          <div v-if="npc.keyPoints && npc.keyPoints.length > 0">
            <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-3">Pontos Chave</h5>
            <ul class="space-y-2">
              <li v-for="point in npc.keyPoints" :key="point" class="flex items-start gap-2">
                <svg class="w-4 h-4 text-df-red mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/></svg>
                <span class="text-sm text-df-silver">{{ point }}</span>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-6 border-t border-df-border-red/50">
            <button @click="$emit('edit', npc)" class="df-btn-ghost px-4 py-2 flex items-center gap-2 text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
            <button @click="$emit('addToGame', npc)" class="df-btn-primary px-4 py-2 flex items-center gap-2 text-sm">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v8m-4-4h8"/></svg>
              Usar no Jogo
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NPC } from '~/types'

interface Props { npc: NPC }
defineProps<Props>()
defineEmits<{ close: []; edit: [npc: NPC]; addToGame: [npc: NPC] }>()

const statusLabel = (s: string) => ({ active: 'Ativo', dead: 'Morto', missing: 'Desaparecido', traitor: 'Traidor' }[s] || s)
const statusBadgeClass = (s: string) => ({
  active: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50',
  dead: 'bg-red-900/60 text-red-300 border border-red-700/50',
  missing: 'bg-amber-900/60 text-amber-300 border border-amber-700/50',
  traitor: 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
}[s] || 'bg-df-deep text-df-muted border border-df-border-silver')

</script>

<style scoped>
.df-modal-card {
  background: var(--df-bg-card, #0a0a1a);
  border: 1px solid var(--df-border-red, #7f1d1d);
  border-radius: 0.75rem;
  padding: 1.5rem;
  position: relative;
  box-shadow: 0 0 40px rgba(220,38,38,0.15), inset 0 1px 6px rgba(0,0,0,0.5);
}
.df-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid transparent;
  color: #6b6b80;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.df-btn-icon:hover { color: #dc2626; border-color: #7f1d1d; background: rgba(127,29,29,0.15); }
.df-btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.03em;
  background: linear-gradient(135deg, #991b1b, #7f1d1d); color: #fecaca;
  border: 1px solid #dc2626; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease; box-shadow: 0 0 12px rgba(220,38,38,0.2);
}
.df-btn-primary:hover { background: linear-gradient(135deg, #b91c1c, #991b1b); box-shadow: 0 0 20px rgba(220,38,38,0.4); color: #fff; }
.df-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 500; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.03em;
  background: transparent; color: #6b6b80;
  border: 1px solid #4a4a5a; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease;
}
.df-btn-ghost:hover { border-color: #dc2626; color: #c0c0d0; background: rgba(127,29,29,0.1); }
.df-scrollbar::-webkit-scrollbar { width: 6px; }
.df-scrollbar::-webkit-scrollbar-track { background: #050510; }
.df-scrollbar::-webkit-scrollbar-thumb { background: #7f1d1d; border-radius: 3px; }
</style>
