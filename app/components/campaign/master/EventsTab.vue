<template>
  <!-- Loading state: shown until first fetch completes -->
  <div v-if="!ready" class="flex items-center justify-center min-h-96">
    <div class="text-center">
      <div class="df-spinner"></div>
      <p class="text-sm mt-4" style="color:#4a4a5a">Carregando eventos...</p>
    </div>
  </div>

  <div v-else class="space-y-8">

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <h3 class="df-section-title text-xl flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        Eventos &amp; Linha do Tempo
      </h3>

      <div class="flex items-center gap-2">
        <!-- Toggle secret events -->
        <button
          class="df-btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border"
          :class="showSecret ? 'border-df-red text-df-red' : 'border-df-border-red/30 text-df-muted'"
          @click="showSecret = !showSecret"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="showSecret" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle v-if="showSecret" cx="12" cy="12" r="3"/>
            <path v-if="!showSecret" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line v-if="!showSecret" x1="1" y1="1" x2="23" y2="23"/>
          </svg>
          {{ showSecret ? 'Secretos visíveis' : 'Ocultar secretos' }}
          <span v-if="secretCount > 0" class="ml-1 px-1.5 py-0.5 rounded-full bg-red-900/40 text-red-400 text-xs font-bold">
            {{ secretCount }}
          </span>
        </button>

        <!-- Reload -->
        <button
          class="df-btn-ghost flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-df-border-red/30 text-df-muted hover:text-df-gold hover:border-df-gold/40 transition-colors"
          :disabled="loading"
          @click="fetchEvents"
        >
          <svg class="w-3.5 h-3.5" :class="loading ? 'animate-spin' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Atualizar
        </button>
      </div>
    </div>

    <!-- ── Error banner ─────────────────────────────────────── -->
    <div v-if="error" class="df-card border-red-700 bg-red-950/30 text-red-400 text-sm px-4 py-3 flex items-center gap-2">
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ error }}
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- CARD 1: Resumo da Crônica                            -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"/>
      <div class="df-card-corner df-card-corner-tr"/>
      <div class="df-card-corner df-card-corner-bl"/>
      <div class="df-card-corner df-card-corner-br"/>

      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-red-900/30">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Resumo da Crônica</h4>
        </div>

        <!-- Empty state -->
        <div v-if="!loading && visibleEvents.length === 0" class="text-center py-10 space-y-4">
          <svg class="w-16 h-16 mx-auto text-df-muted/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          <p class="text-df-muted text-sm">Nenhum evento registrado ainda.</p>
          <p class="text-df-muted/50 text-xs max-w-xs mx-auto">
            Os eventos são criados na tela de&nbsp;
            <span class="text-df-gold font-medium">Jogo ao Vivo</span>.
            Quando a crônica avançar, o histórico aparecerá aqui.
          </p>
          <a
            :href="`/campaign/${campaignId}/live`"
            class="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded border border-red-800 text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            Iniciar Jogo ao Vivo
          </a>
        </div>

        <!-- Skeleton loader -->
        <div v-else-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-8 rounded bg-white/5 animate-pulse"/>
        </div>

        <!-- Stats grid -->
        <div v-else class="space-y-4">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="stat-pill">
              <span class="stat-pill-num">{{ visibleEvents.length }}</span>
              <span class="stat-pill-lbl">Total</span>
            </div>
            <div
              v-for="(cfg, type) in EVENT_TYPE_CONFIG"
              v-show="(countByType[type] ?? 0) > 0"
              :key="type"
              class="stat-pill"
              :style="`--pill-color: ${cfg.color}`"
            >
              <span class="stat-pill-num">{{ countByType[type] ?? 0 }}</span>
              <span class="stat-pill-lbl">{{ cfg.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- CARD 2: Timeline geral                               -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"/>
      <div class="df-card-corner df-card-corner-tr"/>
      <div class="df-card-corner df-card-corner-bl"/>
      <div class="df-card-corner df-card-corner-br"/>

      <div class="relative z-10">
        <!-- Card header + filter row -->
        <div class="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-red-900/30">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <svg class="w-5 h-5 text-df-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Linha do Tempo</h4>
          </div>

          <!-- Type filter -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              class="filter-pill"
              :class="filterType === null ? 'filter-pill--active' : ''"
              @click="filterType = null"
            >Todos</button>
            <button
              v-for="(cfg, type) in EVENT_TYPE_CONFIG"
              :key="type"
              class="filter-pill"
              :class="filterType === type ? 'filter-pill--active' : ''"
              @click="filterType = filterType === type ? null : (type as EventType)"
            >{{ cfg.label }}</button>
          </div>
        </div>

        <!-- Skeleton loader -->
        <div v-if="!ready || loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="ml-9 space-y-2">
            <div class="h-4 w-32 rounded bg-white/5 animate-pulse"/>
            <div class="h-14 rounded bg-white/5 animate-pulse"/>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredTimeline.length === 0" class="py-8 text-center text-df-muted text-sm">
          Nenhum evento nesta categoria.
        </div>

        <!-- Timeline list -->
        <ol v-else class="relative border-l border-red-900/40 space-y-6 ml-3">
          <li
            v-for="(event, index) in filteredTimeline"
            :key="event.id"
            class="ml-6"
          >
            <!-- Timeline dot: index 0 = latest event (bigger + ripple) -->
            <span
              class="absolute flex items-center justify-center rounded-full ring-2 ring-[#0a0a1a]"
              :class="index === 0 ? '-left-[14px] w-7 h-7' : '-left-[11px] w-[22px] h-[22px]'"
              :style="`background: ${eventColor(event.type)}18; border: 1px solid ${eventColor(event.type)}50;`"
            >
              <!-- Ripple ring — only latest event -->
              <span
                v-if="index === 0"
                class="dot-ripple absolute inset-0 rounded-full"
                :style="`background: ${eventColor(event.type)};`"
              />
              <!-- Core dot -->
              <span
                class="rounded-full relative z-10 dot-core"
                :class="index === 0 ? 'w-[11px] h-[11px]' : 'w-2 h-2'"
                :style="`background: ${eventColor(event.type)};`"
              />
            </span>

            <!-- Content -->
            <EventCard
              :title="event.title"
              :description="event.description"
              :type="event.type"
              :occurred-at="event.occurredAt"
              :location="event.location"
              :ingame-date="event.ingameDate"
              :is-secret="event.isSecret"
              :player-names="event.playerNames"
              :npc-ids="event.npcIds"
            />
          </li>
        </ol>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════ -->
    <!-- CARD 3: História por Personagem                      -->
    <!-- ══════════════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"/>
      <div class="df-card-corner df-card-corner-tr"/>
      <div class="df-card-corner df-card-corner-bl"/>
      <div class="df-card-corner df-card-corner-br"/>

      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-6 pb-4 border-b border-red-900/30">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">História por Personagem</h4>
        </div>

        <!-- Character selector from players prop -->
        <div v-if="players.length > 0" class="space-y-6">
          <!-- Player character tabs -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="player in players"
              :key="player.id"
              class="char-tab"
              :class="selectedCharacter === player.id ? 'char-tab--active' : ''"
              @click="selectedCharacter = player.id"
            >{{ player.characterName || player.name }}</button>
          </div>

          <!-- Events for selected character -->
          <div v-if="selectedCharacter">
            <!-- Skeleton loader -->
            <div v-if="!ready || loading" class="space-y-4">
              <div v-for="i in 2" :key="i" class="ml-9 space-y-2">
                <div class="h-4 w-32 rounded bg-white/5 animate-pulse"/>
                <div class="h-14 rounded bg-white/5 animate-pulse"/>
              </div>
            </div>

            <div v-else-if="eventsForCharacter.length === 0" class="py-6 text-center text-df-muted text-sm">
              Nenhum evento registrado para este personagem ainda.
            </div>
            <ol v-else class="relative border-l border-red-900/40 space-y-4 ml-3">
              <li v-for="event in eventsForCharacter" :key="event.id" class="ml-6">
                <span
                  class="absolute -left-[11px] flex items-center justify-center w-[22px] h-[22px] rounded-full ring-2 ring-[#0a0a1a]"
                  :style="`background: ${eventColor(event.type)}18; border: 1px solid ${eventColor(event.type)}50;`"
                >
                  <span class="w-2 h-2 rounded-full dot-core" :style="`background: ${eventColor(event.type)};`"/>
                </span>
                <EventCard
                  :title="event.title"
                  :description="event.description"
                  :type="event.type"
                  :occurred-at="event.occurredAt"
                  :location="event.location"
                  :ingame-date="event.ingameDate"
                  :is-secret="event.isSecret"
                  :player-names="event.playerNames"
                  :npc-ids="event.npcIds"
                />
              </li>
            </ol>
          </div>
        </div>

        <!-- No players yet -->
        <div v-else class="py-8 text-center text-df-muted text-sm">
          <p>Nenhum jogador na campanha ainda.</p>
          <p class="text-xs mt-1 text-df-muted/50">Adicione jogadores na aba&nbsp;<span class="text-df-gold">Jogadores</span>&nbsp;para ver a história individual.</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEvents, type EventType, EVENT_TYPE_CONFIG } from '~/composables/useEvents'
import EventCard from '~/components/campaign/master/EventCard.vue'

// ── Props ──────────────────────────────────────────────────
const props = defineProps<{
  campaignId: string
  players: { id: string; name: string; characterName?: string }[]
}>()

const emit = defineEmits<{
  'update:count': [count: number]
}>()

// ── Events composable ──────────────────────────────────────
const {
  visibleEvents,
  countByType,
  eventsForNpc,
  secretCount,
  showSecret,
  loading,
  error,
  fetchEvents,
  subscribeToEvents,
  unsubscribeFromEvents,
  EVENT_TYPE_CONFIG: typeCfg,
} = useEvents(props.campaignId)

// Watch events to update count
watch(visibleEvents, (newEvents) => {
  emit('update:count', newEvents.length)
}, { immediate: true })

// ── Local state ────────────────────────────────────────────
const ready             = ref(false)
const filterType        = ref<EventType | null>(null)
const selectedCharacter = ref<string | null>(null)

// ── Computed ───────────────────────────────────────────────
const filteredTimeline = computed(() =>
  filterType.value
    ? visibleEvents.value.filter(e => e.type === filterType.value)
    : visibleEvents.value
)

const eventsForCharacter = computed(() => {
  if (!selectedCharacter.value) return []
  // Match by playerName or npcId; here we check player name from the players array
  const char = props.players.find(p => p.id === selectedCharacter.value)
  if (!char) return []
  const name = char.characterName ?? char.name
  return visibleEvents.value.filter(e =>
    e.playerNames.includes(name) || e.npcIds.includes(selectedCharacter.value!)
  )
})

// ── Helpers ────────────────────────────────────────────────
const eventColor  = (type: EventType) => EVENT_TYPE_CONFIG[type]?.color ?? '#4a4a5a'
const eventLabel  = (type: EventType) => EVENT_TYPE_CONFIG[type]?.label ?? type

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(d)

// ── Auto-select first player ───────────────────────────────
watch(
  () => props.players,
  (players) => {
    if (players.length > 0 && !selectedCharacter.value) {
      selectedCharacter.value = players[0].id
    }
  },
  { immediate: true }
)

// ── Refetch when browser tab regains focus ────────────────
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchEvents()
  }
}

// ── Load on mount ──────────────────────────────────────────
onMounted(async () => {
  await fetchEvents()
  ready.value = true
  subscribeToEvents()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  unsubscribeFromEvents()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
/* ── Loading spinner ── */
.df-spinner {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 2px solid #7f1d1d;
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin-spinner 1s linear infinite;
}
@keyframes spin-spinner { to { transform: rotate(360deg); } }

/* ═══ Section windows (same visual language as Politics / Overview) ═══ */
.df-card {
  position: relative;
  background: #0a0a1a;
  border: 1px solid #7f1d1d;
  box-shadow: 0 0 0 1px #4a4a5a, inset 0 1px 6px rgba(0,0,0,0.5);
  border-radius: 0.5rem;
  padding: 1.5rem;
}
.df-card-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
  z-index: 2;
}
.df-card-corner::before,
.df-card-corner::after {
  content: '';
  position: absolute;
  background: #dc2626;
}
.df-card-corner::before { width: 14px; height: 1px; }
.df-card-corner::after  { width: 1px; height: 14px; }
.df-card-corner-tl { top: -1px; left: -1px; }
.df-card-corner-tr { top: -1px; right: -1px; }
.df-card-corner-tr::before { right: 0; }
.df-card-corner-tr::after  { right: 0; }
.df-card-corner-bl { bottom: -1px; left: -1px; }
.df-card-corner-bl::before { bottom: 0; }
.df-card-corner-bl::after  { bottom: 0; }
.df-card-corner-br { bottom: -1px; right: -1px; }
.df-card-corner-br::before { right: 0; bottom: 0; }
.df-card-corner-br::after  { right: 0; bottom: 0; }

/* ── Stat pills ── */
.stat-pill {
  --pill-color: #d4a647;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid color-mix(in srgb, var(--pill-color) 30%, transparent);
  background: color-mix(in srgb, var(--pill-color) 8%, transparent);
}
.stat-pill-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--pill-color);
  line-height: 1;
}
.stat-pill-lbl {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b6b7b;
  margin-top: 0.25rem;
}

/* ── Filter pills ── */
.filter-pill {
  font-size: 0.7rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #4a4a5a;
  color: #6b6b7b;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-pill:hover {
  border-color: #d4a647;
  color: #d4a647;
}
.filter-pill--active {
  border-color: #d4a647;
  color: #d4a647;
  background: rgba(212,166,71,0.1);
}

/* ── Timeline dot animations ── */
@keyframes dot-core-breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.45); opacity: 0.75; }
}
@keyframes dot-ripple-expand {
  0%   { transform: scale(0.4); opacity: 0.55; }
  70%  { opacity: 0.12; }
  100% { transform: scale(2.6); opacity: 0; }
}
.dot-core {
  animation: dot-core-breathe 3s ease-in-out infinite;
}
.dot-ripple {
  opacity: 0;
  animation: dot-ripple-expand 2.4s ease-out infinite;
}

/* ── Character tabs ── */
.char-tab {
  font-size: 0.75rem;
  padding: 0.375rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #4a4a5a;
  color: #6b6b7b;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.char-tab:hover {
  border-color: #d4a647;
  color: #d4a647;
}
.char-tab--active {
  border-color: #d4a647;
  color: #0a0a1a;
  background: #d4a647;
  font-weight: 600;
}

/* ── Spinner ── */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 1s linear infinite; }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
