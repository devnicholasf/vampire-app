<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="df-section-title text-xl flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        Visão Geral da Crônica
      </h3>
      <BaseButton variant="ghost" size="sm" @click="editMode = !editMode">
        <svg v-if="!editMode" class="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <svg v-else class="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        {{ editMode ? 'Visualizar' : 'Editar' }}
      </BaseButton>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- SECTION 1: Nome e Status da Crônica        -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">A Crônica</h4>
        </div>

        <!-- Chronicle Name (read-only, managed in Settings) -->
        <div class="mb-6">
          <label class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 block">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Nome da Crônica
          </label>
          <p class="text-white text-2xl font-bold tracking-wide">{{ overview.name || campaign?.name || 'Sem nome' }}</p>
        </div>

        <!-- Status -->
        <div class="mb-6">
          <label class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2 block">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Status Atual
          </label>
          <template v-if="editMode">
            <input v-model="overview.status" class="df-input text-sm" placeholder="Ex: Em andamento, Sessão 12, Arco do Príncipe..." />
          </template>
          <template v-else>
            <div class="flex items-center gap-2.5">
              <span class="w-2.5 h-2.5 rounded-full" :class="overview.status ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-df-muted'"></span>
              <p class="text-df-silver text-base">{{ overview.status || 'Nenhum status definido' }}</p>
            </div>
          </template>
        </div>

        <!-- Separator -->
        <div class="border-t border-df-border-silver/20 my-4"></div>

        <!-- Tom da Crônica -->
        <div class="mb-6">
          <label class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 block">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            Tom da Crônica
          </label>
          <template v-if="editMode">
            <div class="flex flex-wrap gap-2 mb-3">
              <button
                v-for="tone in toneOptions" :key="tone.value"
                @click="toggleTone(tone.value)"
                class="px-3 py-1.5 rounded-full text-xs border transition-all"
                :class="overview.tones.includes(tone.value)
                  ? 'border-df-red bg-df-red/20 text-df-red font-semibold'
                  : 'border-df-border-silver/40 text-df-muted hover:border-df-gold hover:text-df-gold'"
              >
                {{ tone.label }}
              </button>
              <!-- Custom tones as removable badges -->
              <span
                v-for="(ct, ci) in overview.customTones" :key="'ct' + ci"
                class="px-3 py-1.5 rounded-full text-xs border border-df-gold bg-df-gold/15 text-df-gold font-semibold flex items-center gap-1.5 cursor-default"
              >
                {{ ct }}
                <button @click="overview.customTones.splice(ci, 1)" class="hover:text-df-red transition-colors">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <input v-model="newCustomTone" class="df-input text-xs flex-1" placeholder="Adicionar tom personalizado..." @keydown.enter="addCustomTone" />
              <button v-if="newCustomTone.trim()" @click="addCustomTone" class="px-3 py-1.5 rounded-full text-xs border border-df-gold text-df-gold hover:bg-df-gold/20 transition-all">+ Adicionar</button>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-wrap gap-2.5" v-if="activeTones.length > 0">
              <span
                v-for="tone in activeTones" :key="tone"
                class="px-3 py-1.5 rounded-full text-xs border border-df-red/30 bg-df-red/10 text-df-red font-semibold"
              >
                {{ getToneDisplay(tone) }}
              </span>
            </div>
            <p v-else class="text-df-muted text-xs italic">Nenhum tom definido</p>
          </template>
        </div>

        <!-- Princípios da Crônica -->
        <div>
          <label class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 block">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            Princípios da Crônica
          </label>
          <template v-if="editMode">
            <textarea v-model="overview.principles" class="df-input text-sm resize-none" rows="4" placeholder="Quais os princípios temáticos e narrativos desta crônica? Ex: A Besta sempre cobra seu preço, Ninguém é inocente na Camarilla..."></textarea>
          </template>
          <template v-else>
            <p v-if="overview.principles" class="text-df-silver text-sm whitespace-pre-line leading-relaxed">{{ overview.principles }}</p>
            <p v-else class="text-df-muted text-xs italic">Nenhum princípio definido</p>
          </template>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- SECTION 2: Linha do Tempo & Último Evento  -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Linha do Tempo</h4>
        </div>

        <!-- Timeline placeholder -->
        <div class="space-y-3">
          <div class="flex items-start gap-3 p-3 rounded-lg bg-df-deep/60 border border-df-border-silver/10">
            <div class="w-8 h-8 rounded-full bg-df-red/20 border border-df-red/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-df-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div class="flex-1">
              <h6 class="text-xs font-bold text-df-silver uppercase tracking-wider mb-1">Linha do Tempo Resumida</h6>
              <p class="text-df-muted text-xs italic">
                Esta informação será preenchida automaticamente a partir do Jogo ao Vivo quando implementado.
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-df-border-silver/20 my-4"></div>

        <!-- Last Event -->
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-4 h-4 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <h5 class="text-sm font-bold text-df-gold uppercase tracking-wider">Último Evento Registrado</h5>
        </div>

        <div class="p-3 rounded-lg bg-df-deep/60 border border-df-border-silver/10">
          <p class="text-df-muted text-xs italic">
            Nenhum evento registrado. Esta informação será preenchida automaticamente a partir do Jogo ao Vivo quando implementado.
          </p>
        </div>
      </div>
    </div>

    <!-- ═══════════════════ -->
    <!-- Save / Cancel bar  -->
    <!-- ═══════════════════ -->
    <div v-if="editMode" class="flex items-center justify-end gap-3 pt-2">
      <BaseButton variant="ghost" size="sm" @click="cancelEdits">Cancelar</BaseButton>
      <BaseButton variant="primary" size="sm" @click="saveOverview">
        <svg class="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Salvar Visão Geral
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from '~/composables/useToast'
import BaseButton from '~/components/ui/BaseButton.vue'

const props = defineProps<{
  campaignId: string
  campaign: { id: string; name: string; description?: string } | null
}>()

const toast = useToast()
const editMode = ref(false)

// ── Tone presets ──
const toneOptions = [
  { value: 'political', label: 'Político' },
  { value: 'personal-horror', label: 'Horror Pessoal' },
  { value: 'psychological', label: 'Psicológico' },
  { value: 'action', label: 'Ação' },
  { value: 'mystery', label: 'Mistério' },
  { value: 'intrigue', label: 'Intriga' },
  { value: 'survival', label: 'Sobrevivência' },
]

// ── Overview data ──
interface OverviewData {
  name: string
  status: string
  principles: string
  tones: string[]
  customTones: string[]
}

const overview = ref<OverviewData>({
  name: '',
  status: '',
  principles: '',
  tones: [],
  customTones: []
})

const newCustomTone = ref('')

let savedSnapshot = ''

const storageKey = computed(() => `vamp-overview-${props.campaignId}`)

// ── Computed ──
const activeTones = computed(() => {
  const tones = [...overview.value.tones]
  tones.push(...overview.value.customTones)
  return tones
})

// ── Helpers ──
const getToneDisplay = (tone: string): string => {
  const preset = toneOptions.find(t => t.value === tone)
  return preset ? preset.label : tone
}

const toggleTone = (tone: string) => {
  const idx = overview.value.tones.indexOf(tone)
  if (idx >= 0) {
    overview.value.tones.splice(idx, 1)
  } else {
    overview.value.tones.push(tone)
  }
}

const addCustomTone = () => {
  const val = newCustomTone.value.trim()
  if (val && !overview.value.customTones.includes(val)) {
    overview.value.customTones.push(val)
  }
  newCustomTone.value = ''
}

// ── Persistence ──
const loadOverview = () => {
  try {
    const raw = localStorage.getItem(storageKey.value)
    if (raw) {
      const parsed = JSON.parse(raw)
      const validToneValues = toneOptions.map(t => t.value)
      // Migrate old single customTone to customTones array
      let customTones: string[] = parsed.customTones || []
      if (!customTones.length && parsed.customTone && parsed.customTone.trim()) {
        customTones = [parsed.customTone.trim()]
      }
      overview.value = {
        name: parsed.name || '',
        status: parsed.status || '',
        principles: parsed.principles || '',
        tones: (parsed.tones || []).filter((t: string) => validToneValues.includes(t)),
        customTones
      }
    } else {
      // Default from campaign data
      overview.value.name = props.campaign?.name || ''
    }
  } catch {
    overview.value.name = props.campaign?.name || ''
  }
  savedSnapshot = JSON.stringify(overview.value)
}

const saveOverview = () => {
  localStorage.setItem(storageKey.value, JSON.stringify(overview.value))
  savedSnapshot = JSON.stringify(overview.value)
  editMode.value = false
  toast.success('Visão Geral salva!', 'As informações da crônica foram atualizadas.')
}

const cancelEdits = () => {
  try { overview.value = JSON.parse(savedSnapshot) } catch { /* ignore */ }
  editMode.value = false
}

// ── Lifecycle ──
onMounted(() => {
  loadOverview()
})

watch(() => props.campaign, (val) => {
  if (val && !overview.value.name) {
    overview.value.name = val.name
  }
})
</script>

<style scoped>
.df-input {
  width: 100%;
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: #c4c4d4;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}
.df-input:focus {
  outline: none;
  border-color: #d4a647;
}
.df-input::placeholder {
  color: #6b6b7b;
}
</style>
