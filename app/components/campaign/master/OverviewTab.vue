<template>
	<div class="space-y-8">
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

		<!-- ═══════════════════════════════════════════════ -->
		<!-- CARD 1: A Crônica — Nome + Status              -->
		<!-- ═══════════════════════════════════════════════ -->
		<div class="df-card">
			<div class="df-card-corner df-card-corner-tl"></div>
			<div class="df-card-corner df-card-corner-tr"></div>
			<div class="df-card-corner df-card-corner-bl"></div>
			<div class="df-card-corner df-card-corner-br"></div>
			<div class="relative z-10 space-y-0">

				<!-- Section Title -->
				<div class="flex items-center gap-2 mb-6 pb-4 border-b border-df-border-red/30">
					<svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
					</svg>
					<h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">A Crônica</h4>
				</div>

				<!-- Row: Nome da Crônica -->
				<div class="ov-row">
					<div class="ov-row-label">
						<svg class="w-4 h-4 text-df-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
						<span>Nome da Crônica</span>
					</div>
					<div class="ov-row-value">
						<p class="text-white text-lg font-bold">{{ overview.name || campaign?.name || 'Sem nome' }}</p>
					</div>
				</div>

				<!-- Row: Status Atual -->
				<div class="ov-row">
					<div class="ov-row-label">
						<svg class="w-4 h-4 text-df-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
						<span>Status Atual</span>
					</div>
					<div class="ov-row-value">
						<template v-if="editMode">
							<input v-model="overview.status" class="df-input text-sm" placeholder="Ex: Em andamento, Sessão 12, Arco do Príncipe..." />
						</template>
						<template v-else>
							<div class="flex items-center gap-2.5">
								<span class="w-2 h-2 rounded-full flex-shrink-0" :class="overview.status ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-df-muted/50'"></span>
								<p class="text-df-silver text-sm">{{ overview.status || 'Nenhum status definido' }}</p>
							</div>
						</template>
					</div>
				</div>

			</div>
		</div>

		<!-- ═══════════════════════════════════════════════ -->
		<!-- CARD 2: Tom da Crônica                         -->
		<!-- ═══════════════════════════════════════════════ -->
		<div class="df-card">
			<div class="df-card-corner df-card-corner-tl"></div>
			<div class="df-card-corner df-card-corner-tr"></div>
			<div class="df-card-corner df-card-corner-bl"></div>
			<div class="df-card-corner df-card-corner-br"></div>
			<div class="relative z-10">

				<!-- Section Title -->
				<div class="flex items-center gap-2 mb-5 pb-4 border-b border-df-border-red/30">
					<svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
					<h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Tom da Crônica</h4>
				</div>

				<template v-if="editMode">
					<div class="flex flex-wrap gap-2 mb-4">
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
					<p v-else class="text-df-muted text-sm italic">Nenhum tom definido</p>
				</template>

			</div>
		</div>

		<!-- ═══════════════════════════════════════════════ -->
		<!-- CARD 3: Princípios da Crônica                  -->
		<!-- ═══════════════════════════════════════════════ -->
		<div class="df-card">
			<div class="df-card-corner df-card-corner-tl"></div>
			<div class="df-card-corner df-card-corner-tr"></div>
			<div class="df-card-corner df-card-corner-bl"></div>
			<div class="df-card-corner df-card-corner-br"></div>
			<div class="relative z-10">

				<!-- Section Title -->
				<div class="flex items-center gap-2 mb-5 pb-4 border-b border-df-border-red/30">
					<svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
					<h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Princípios da Crônica</h4>
				</div>

				<template v-if="editMode">
					<textarea v-model="overview.principles" class="df-input text-sm resize-none" rows="4" placeholder="Quais os princípios temáticos e narrativos desta crônica? Ex: A Besta sempre cobra seu preço, Ninguém é inocente na Camarilla..."></textarea>
				</template>
				<template v-else>
					<p v-if="overview.principles" class="text-df-silver text-sm whitespace-pre-line leading-relaxed">{{ overview.principles }}</p>
					<p v-else class="text-df-muted text-sm italic">Nenhum princípio definido</p>
				</template>

			</div>
		</div>

		<!-- ═══════════════════════════════════════════════ -->
		<!-- CARD 4: Linha do Tempo                         -->
		<!-- ═══════════════════════════════════════════════ -->
		<div class="df-card">
			<div class="df-card-corner df-card-corner-tl"></div>
			<div class="df-card-corner df-card-corner-tr"></div>
			<div class="df-card-corner df-card-corner-bl"></div>
			<div class="df-card-corner df-card-corner-br"></div>
			<div class="relative z-10">

				<!-- Section Title -->
				<div class="flex items-center gap-2 mb-5 pb-4 border-b border-df-border-red/30">
					<svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
					</svg>
					<h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Linha do Tempo</h4>
				</div>

				<!-- Timeline placeholder -->
				<div class="flex items-start gap-4 p-4 rounded-lg bg-df-deep/50 border border-df-border-silver/10">
					<div class="w-10 h-10 rounded-full bg-df-red/15 border border-df-red/30 flex items-center justify-center flex-shrink-0">
						<svg class="w-5 h-5 text-df-red/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
						</svg>
					</div>
					<div>
						<h6 class="text-sm font-semibold text-df-silver mb-1">Linha do Tempo Resumida</h6>
						<p class="text-df-muted text-xs leading-relaxed">
							Esta informação será preenchida automaticamente a partir do Jogo ao Vivo quando implementado.
						</p>
					</div>
				</div>

			</div>
		</div>

		<!-- ═══════════════════════════════════════════════ -->
		<!-- CARD 5: Último Evento Registrado               -->
		<!-- ═══════════════════════════════════════════════ -->
		<div class="df-card">
			<div class="df-card-corner df-card-corner-tl"></div>
			<div class="df-card-corner df-card-corner-tr"></div>
			<div class="df-card-corner df-card-corner-bl"></div>
			<div class="df-card-corner df-card-corner-br"></div>
			<div class="relative z-10">

				<!-- Section Title -->
				<div class="flex items-center gap-2 mb-5 pb-4 border-b border-df-border-red/30">
					<svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
					</svg>
					<h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Último Evento Registrado</h4>
				</div>

				<div class="p-4 rounded-lg bg-df-deep/50 border border-df-border-silver/10">
					<p class="text-df-muted text-sm leading-relaxed">
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
/* ═══ Section windows (same visual language as Politics) ═══ */
.df-card {
	position: relative;
	background: #0a0a1a;
	border: 1px solid #7f1d1d;
	box-shadow: 0 0 0 1px #4a4a5a, inset 0 1px 6px rgba(0,0,0,0.5);
	border-radius: 0.5rem;
	padding: 1rem;
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

/* ── Overview Row System ── */
.ov-row {
	display: flex;
	align-items: flex-start;
	gap: 1rem;
	padding: 0.875rem 0;
	border-bottom: 1px solid rgba(74, 74, 90, 0.15);
}
.ov-row:last-child {
	border-bottom: none;
	padding-bottom: 0;
}
.ov-row:first-child {
	padding-top: 0;
}
.ov-row-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	min-width: 180px;
	flex-shrink: 0;
	font-size: 0.7rem;
	font-weight: 700;
	color: var(--df-red, #dc2626);
	text-transform: uppercase;
	letter-spacing: 0.1em;
	padding-top: 0.25rem;
}
.ov-row-value {
	flex: 1;
	min-width: 0;
}
</style>
