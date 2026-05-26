<template>
  <div class="sticky top-0 space-y-3">
    <!-- Card Principal -->
    <div class="p-4 rounded-lg border border-red-900/30 bg-gradient-to-br from-[#12121A] to-[#0a0a14]
                shadow-[0_0_20px_rgba(220,38,38,0.1)]">
      <div class="flex items-start gap-3">
        <!-- Avatar Preview -->
        <div class="flex-shrink-0">
          <div v-if="npc.photo" class="w-16 h-16 rounded-lg overflow-hidden border border-red-900/30">
            <img :src="npc.photo" :alt="npc.name || 'Avatar'" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-700/50 
                           flex items-center justify-center bg-[#0d0d20]">
            <svg class="w-8 h-8 text-zinc-700/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
            </svg>
          </div>
        </div>
        
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h4 class="text-base font-bold text-[#C6A85A] truncate">
            {{ npc.name || 'Sem Nome' }}
          </h4>
          <p class="text-xs text-zinc-400 mt-0.5">
            {{ npc.clan || 'Clã não definido' }}
          </p>
          <p v-if="npc.role" class="text-[10px] text-zinc-500 italic mt-1 line-clamp-2">
            "{{ npc.role }}"
          </p>
        </div>
      </div>
    </div>
    
    <!-- Status & Ameaça -->
    <div class="grid grid-cols-2 gap-2">
      <div class="p-3 rounded-lg bg-[#12121A] border border-[#1F1F2E]">
        <p class="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Status</p>
        <p class="text-sm text-zinc-300 flex items-center gap-1">
          <span class="w-4 h-4" :class="getStatusColor(npc.status)" v-html="getStatusIcon(npc.status)"></span>
          <span class="font-medium">{{ npc.status || 'N/A' }}</span>
        </p>
      </div>
      
      <div class="p-3 rounded-lg bg-[#12121A] border border-[#1F1F2E]">
        <p class="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Ameaça</p>
        <p class="text-sm text-zinc-300 flex items-center gap-1">
          <span class="w-4 h-4" :class="getThreatColor(npc.threat)" v-html="getThreatIcon(npc.threat)"></span>
          <span class="font-medium">{{ getThreatLabel(npc.threat) }}</span>
        </p>
      </div>
    </div>
    
    <!-- Detalhes -->
    <div class="space-y-2">
      <div v-if="npc.generation" class="p-2.5 rounded-lg bg-[#0d0d20] border border-[#1F1F2E]">
        <p class="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Geração</p>
        <p class="text-xs text-zinc-300 font-medium">{{ npc.generation }}ª Geração</p>
      </div>
      
      <div v-if="npc.sect" class="p-2.5 rounded-lg bg-[#0d0d20] border border-[#1F1F2E]">
        <p class="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Seita</p>
        <p class="text-xs text-zinc-300 font-medium">{{ npc.sect }}</p>
      </div>
      
      <div v-if="npc.mainPool" class="p-2.5 rounded-lg bg-[#0d0d20] border border-[#1F1F2E]">
        <p class="text-[9px] text-zinc-500 uppercase tracking-wider mb-0.5">Pool Principal</p>
        <p class="text-xs text-zinc-300 font-medium">{{ npc.mainPool }}</p>
      </div>
    </div>
    
    <!-- Motivação -->
    <div v-if="npc.motivation" class="p-3 rounded-lg bg-[#0d0d20] border border-red-900/20">
      <p class="text-[9px] text-[#C6A85A] uppercase tracking-wider mb-1.5">Motivação</p>
      <p class="text-xs text-zinc-400 leading-relaxed line-clamp-3">
        {{ npc.motivation }}
      </p>
    </div>
    
    <!-- Segredo -->
    <div v-if="npc.secret" class="p-3 rounded-lg bg-[#0d0d20] border border-red-900/20">
      <p class="text-[9px] text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        Segredo
      </p>
      <p class="text-xs text-zinc-400 leading-relaxed line-clamp-3">
        {{ npc.secret }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  npc: {
    name: string
    clan: string
    generation: number
    sect: string
    status: string
    threat: string
    role: string
    mainPool: string
    motivation: string
    secret: string
    photo: string
  }
}

const props = defineProps<Props>()

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    'Ativo': '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
    'Caçado': '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
    'Desaparecido': '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
    'Traidor': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>'
  }
  return icons[status] || '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Ativo': 'text-emerald-500',
    'Caçado': 'text-red-500',
    'Desaparecido': 'text-zinc-500',
    'Traidor': 'text-rose-600'
  }
  return colors[status] || 'text-zinc-400'
}

const getThreatIcon = (threat: string) => {
  const icons: Record<string, string> = {
    'fraco': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    'moderado': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/></svg>',
    'perigoso': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    'letal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 00-8 8c0 3.5 2 6 4 7.5V20h8v-2.5c2-1.5 4-4 4-7.5a8 8 0 00-8-8z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>',
    'anciao': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    'narrativo': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>'
  }
  return icons[threat] || '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>'
}

const getThreatColor = (threat: string) => {
  const colors: Record<string, string> = {
    'fraco': 'text-emerald-400',
    'moderado': 'text-blue-400',
    'perigoso': 'text-orange-400',
    'letal': 'text-red-400',
    'anciao': 'text-purple-400',
    'narrativo': 'text-amber-400'
  }
  return colors[threat] || 'text-zinc-400'
}

const getThreatLabel = (threat: string) => {
  const labels: Record<string, string> = {
    'fraco': 'Fraco',
    'moderado': 'Moderado',
    'perigoso': 'Perigoso',
    'letal': 'Letal',
    'anciao': 'Ancião',
    'narrativo': 'Narrativo'
  }
  return labels[threat] || 'N/A'
}
</script>
