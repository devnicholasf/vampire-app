<template>
  <!-- ══════════════════════════════════════════════════
    CoterieAvatars — exibe avatares dos jogadores da crónica
    Modes:
      horizontal  → header do mestre (avatares lado a lado, pequenos)
      vertical    → coluna do jogador (avatares empilhados, maiores)
  ══════════════════════════════════════════════════ -->

  <!-- HORIZONTAL — mestre -->
  <div
    v-if="mode === 'horizontal'"
    class="flex items-center gap-2"
  >
    <div
      v-for="player in players"
      :key="player.user_id"
      class="relative group"
    >
      <!-- Avatar -->
      <div
        class="rounded-full overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-110"
        :style="avatarStyle(player, 'sm')"
      >
        <img
          v-if="avatarUrl(player)"
          :src="avatarUrl(player)"
          :alt="displayName(player)"
          class="w-full h-full object-cover object-top"
        />
        <span
          v-else
          class="w-full h-full flex items-center justify-center text-white font-bold select-none"
          :style="{ fontSize: '13px', background: 'linear-gradient(135deg, #7f1d1d, #1e1b4b)' }"
        >
          {{ initials(player) }}
        </span>
      </div>

      <!-- Indicador online/offline -->
      <span
        class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
        :style="{ borderColor: '#0a0a1a', background: isOnline(player) ? '#22c55e' : '#dc2626' }"
      />

      <!-- Tooltip com nome do personagem -->
      <div
        class="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded text-[11px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style="background: #1a0a0a; border: 1px solid #7f1d1d; color: #c4c4d4; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.8);"
      >
        {{ displayName(player) }}
        <span
          class="ml-1 font-semibold"
          :class="isOnline(player) ? 'text-green-400' : 'text-red-400'"
        >
          · {{ isOnline(player) ? 'Online' : 'Offline' }}
        </span>
      </div>
    </div>

    <p v-if="players.length === 0" class="text-[11px] text-[#4a4a5a] italic">
      Nenhum jogador na crônica
    </p>
  </div>

  <!-- VERTICAL — jogador -->
  <div
    v-else
    class="flex flex-col items-center gap-3 py-2"
  >
    <div
      v-for="player in players"
      :key="player.user_id"
      class="relative group flex flex-col items-center"
    >
      <!-- Avatar -->
      <div
        class="rounded-full overflow-hidden shrink-0 transition-transform duration-200 group-hover:scale-105"
        :style="avatarStyle(player, 'lg')"
      >
        <img
          v-if="avatarUrl(player)"
          :src="avatarUrl(player)"
          :alt="displayName(player)"
          class="w-full h-full object-cover object-top"
        />
        <span
          v-else
          class="w-full h-full flex items-center justify-center text-white font-bold select-none"
          :style="{ fontSize: '20px', background: 'linear-gradient(135deg, #7f1d1d, #1e1b4b)' }"
        >
          {{ initials(player) }}
        </span>
      </div>

      <!-- SEM bolinha de status — apenas a borda do avatar indica online/offline -->

      <!-- Nome curto abaixo do avatar -->
      <p
        class="text-[10px] mt-1.5 tracking-wide text-center max-w-[64px] truncate leading-tight"
        :class="isOnline(player) ? 'text-green-300' : 'text-[#6b6b7b]'"
        :title="displayName(player)"
      >
        {{ firstName(player) }}
      </p>
    </div>

    <p v-if="players.length === 0" class="text-[10px] text-[#4a4a5a] italic text-center px-1">
      Sem jogadores
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// ── Types ────────────────────────────────────────────────────────
export interface CoteriePlayer {
  user_id: string
  character_name: string | null
  sheet?: {
    name?: string
    avatar?: string
    clan?: string
  } | null
  role?: string
}

// ── Props ────────────────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** Lista de jogadores da crônica vindos de campaign_players */
    players: CoteriePlayer[]
    /** UUIDs dos jogadores com sessão live ativa */
    activePlayers: string[]
    /** Layout: 'horizontal' para o mestre, 'vertical' para o jogador */
    mode?: 'horizontal' | 'vertical'
  }>(),
  { mode: 'horizontal' }
)

const activePlayersSet = computed(() => {
  return new Set((props.activePlayers || []).map((id) => String(id).trim().toLowerCase()))
})

// ── Helpers ──────────────────────────────────────────────────────
const isOnline = (player: CoteriePlayer): boolean =>
  activePlayersSet.value.has(String(player.user_id || '').trim().toLowerCase())

const displayName = (player: CoteriePlayer): string =>
  player.sheet?.name?.trim() ||
  player.character_name?.trim() ||
  'Personagem'

const firstName = (player: CoteriePlayer): string =>
  displayName(player).split(' ')[0]

const initials = (player: CoteriePlayer): string => {
  const name = displayName(player)
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const avatarUrl = (player: CoteriePlayer): string =>
  player.sheet?.avatar?.trim() || ''

const avatarStyle = (
  player: CoteriePlayer,
  size: 'sm' | 'lg'
): Record<string, string> => {
  const online = isOnline(player)
  const dim = size === 'sm' ? '56px' : '68px'
  const borderColor = online ? '#22c55e' : '#dc2626'
  const shadow = online
    ? '0 0 10px rgba(34,197,94,0.55)'
    : '0 0 8px rgba(220,38,38,0.35)'
  return {
    width: dim,
    height: dim,
    border: `2.5px solid ${borderColor}`,
    boxShadow: shadow,
  }
}
</script>
