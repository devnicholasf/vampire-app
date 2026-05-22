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
		<!-- HERO: Título da Crônica (estilo Vampiro)       -->
		<!-- ═══════════════════════════════════════════════ -->
		<div class="flex flex-col items-center py-6 select-none">
			<!-- Dividers + Blood drop -->
			<div class="flex items-center gap-4 w-full mb-4">
				<div class="flex-1 h-px bg-gradient-to-r from-transparent via-red-900/60 to-red-900/60"/>
				<svg class="w-5 h-7 shrink-0" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M10 1 C10 1 1 12 1 18 C1 23.523 5.477 27 10 27 C14.523 27 19 23.523 19 18 C19 12 10 1 10 1Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="1"/>
				</svg>
				<div class="flex-1 h-px bg-gradient-to-l from-transparent via-red-900/60 to-red-900/60"/>
			</div>

			<!-- Subtitle -->
			<p class="text-xs uppercase tracking-[0.22em] text-red-700/80 mb-2 font-medium">Vampiro: A Máscara V5</p>

			<!-- Campaign name -->
			<h2 class="text-3xl font-black uppercase tracking-widest text-white text-center">
				{{ overview.name || campaign?.name || 'Sem nome' }}
			</h2>

			<!-- Bottom divider -->
			<div class="flex items-center gap-4 w-full mt-4">
				<div class="flex-1 h-px bg-gradient-to-r from-transparent via-red-900/60 to-red-900/60"/>
				<div class="flex-1 h-px bg-gradient-to-l from-transparent via-red-900/60 to-red-900/60"/>
			</div>

			<!-- Edit mode input -->
			<div v-if="editMode" class="w-full mt-5 max-w-md mx-auto">
				<div class="flex flex-col gap-1">
					<label class="text-xs text-df-muted uppercase tracking-wider">Nome da Crônica</label>
					<input v-model="overview.name" class="df-input text-sm text-center" placeholder="Ex: Crônica de Manaus..." />
				</div>
			</div>
		</div>

		<!-- ════ Layout: duas colunas assimétricas ════ -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
			<div class="lg:col-span-2 space-y-6">

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
		<!-- CARD 4: Último Evento Registrado               -->
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

				<!-- Loading -->
				<div v-if="loadingLastEvent" class="flex items-center gap-2 text-df-muted text-sm py-2">
					<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
					Carregando...
				</div>

				<!-- Event found -->
				<EventCard
					v-else-if="lastEvent"
					:title="lastEvent.title"
					:description="lastEvent.description"
					:type="lastEvent.type"
					:occurred-at="lastEvent.occurred_at"
				/>

				<!-- No events -->
				<div v-else class="p-4 rounded-lg bg-df-deep/50 border border-df-border-silver/10">
					<p class="text-df-muted text-sm leading-relaxed">Nenhum evento registrado ainda.</p>
				</div>

			</div>
		</div>

			</div>
			<!-- /Col esquerda -->

			<!-- Col direita: widgets -->
			<div class="space-y-6">

				<!-- Widget: Líder do Domínio -->
				<div class="df-card">
					<div class="df-card-corner df-card-corner-tl"></div>
					<div class="df-card-corner df-card-corner-tr"></div>
					<div class="df-card-corner df-card-corner-bl"></div>
					<div class="df-card-corner df-card-corner-br"></div>
					<div class="relative z-10">
						<div class="flex items-center gap-2 mb-4 pb-3 border-b border-df-border-red/30">
							<svg class="w-4 h-4 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
							<h4 class="text-sm font-bold text-df-gold uppercase tracking-wider">Líder do Domínio</h4>
						</div>
						<div v-if="loadingPolitics" class="flex items-center gap-2 text-df-muted text-xs py-2">
							<svg class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
							Carregando...
						</div>
						<div v-else-if="domainLeader" class="flex items-center gap-3">
							<div class="w-12 h-12 rounded-full bg-df-deep border border-df-border-red/40 overflow-hidden flex-shrink-0 flex items-center justify-center">
								<img v-if="domainLeader.photo" :src="domainLeader.photo" class="w-full h-full object-cover" />
								<svg v-else class="w-6 h-6 text-df-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0114 0v2"/></svg>
							</div>
							<div class="min-w-0">
								<p class="text-sm font-bold text-white truncate">{{ domainLeader.name }}</p>
								<p v-if="domainLeader.clan" class="text-xs text-df-gold truncate">{{ domainLeader.clan }}</p>
								<p v-if="domainLeaderRole" class="text-xs text-df-muted truncate">{{ domainLeaderRole }}</p>
							</div>
						</div>
						<p v-else class="text-df-muted text-xs italic">Nenhum líder definido na aba Política.</p>
					</div>
				</div>

				<!-- Widget: Status dos Territórios -->
				<div class="df-card">
					<div class="df-card-corner df-card-corner-tl"></div>
					<div class="df-card-corner df-card-corner-tr"></div>
					<div class="df-card-corner df-card-corner-bl"></div>
					<div class="df-card-corner df-card-corner-br"></div>
					<div class="relative z-10">
						<div class="flex items-center gap-2 mb-4 pb-3 border-b border-df-border-red/30">
							<svg class="w-4 h-4 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>
							<h4 class="text-sm font-bold text-df-gold uppercase tracking-wider">Status dos Territórios</h4>
						</div>
						<div v-if="loadingPolitics" class="flex items-center gap-2 text-df-muted text-xs py-2">
							<svg class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
							Carregando...
						</div>
						<div v-else-if="territoryZones.length > 0">
							<ul class="space-y-1.5 mb-4">
								<li v-for="zone in territoryZones" :key="zone.name" class="flex items-center gap-2 text-xs">
									<span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: statusColor(zone.status) }"></span>
									<span class="text-df-silver flex-1 truncate">{{ zone.name }}</span>
									<span class="text-[10px]" :style="{ color: statusColor(zone.status) }">{{ statusLabel(zone.status) }}</span>
								</li>
							</ul>
							<div class="flex rounded-full overflow-hidden h-2 mb-2">
								<div v-if="territorySummary.stable > 0" :style="{ width: summaryPercent(territorySummary.stable) + '%', background: '#22c55e' }"></div>
								<div v-if="territorySummary.contested > 0" :style="{ width: summaryPercent(territorySummary.contested) + '%', background: '#eab308' }"></div>
								<div v-if="territorySummary.war > 0" :style="{ width: summaryPercent(territorySummary.war) + '%', background: '#ef4444' }"></div>
								<div v-if="territorySummary.abandoned > 0" :style="{ width: summaryPercent(territorySummary.abandoned) + '%', background: '#6b7280' }"></div>
							</div>
							<div class="flex flex-wrap gap-x-3 gap-y-0.5">
								<span v-if="territorySummary.stable > 0" class="text-[10px] text-green-400">{{ territorySummary.stable }} Estável</span>
								<span v-if="territorySummary.contested > 0" class="text-[10px] text-yellow-400">{{ territorySummary.contested }} Contestado</span>
								<span v-if="territorySummary.war > 0" class="text-[10px] text-red-400">{{ territorySummary.war }} Em Guerra</span>
								<span v-if="territorySummary.abandoned > 0" class="text-[10px] text-gray-400">{{ territorySummary.abandoned }} Abandonado</span>
							</div>
						</div>
						<p v-else class="text-df-muted text-xs italic">Nenhum território definido na aba Política.</p>
					</div>
				</div>

			</div>
			<!-- /Col direita -->

		</div>
		<!-- /Layout 2 colunas -->

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
import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'
import type { NPC } from '~/types'
import { useCampaign } from '~/composables/useCampaign'
import { useToast } from '~/composables/useToast'
import BaseButton from '~/components/ui/BaseButton.vue'
import EventCard from '~/components/campaign/master/EventCard.vue'

const props = defineProps<{
	campaignId: string
	campaign: { id: string; name: string; description?: string } | null
}>()

const config = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl as string, config.public.supabaseKey as string)
const toast = useToast()
const editMode = ref(false)

// ── Politics data (para widgets) ──
interface TerritoryZone {
	name: string
	status: 'stable' | 'contested' | 'war' | 'abandoned'
}
interface GovernmentRole {
	title: string
	npcId: string
	note?: string
}
const { campaignNPCs, loadCampaignNPCs } = useCampaign()
const loadingPolitics = ref(false)
const politicsData = ref<{ government: GovernmentRole[]; territoryZones: TerritoryZone[] }>({
	government: [],
	territoryZones: []
})

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

// ── Politics widget computeds ──
const domainLeader = computed(() => {
	const role = politicsData.value.government.find(g => g.title === 'Príncipe')
	if (!role?.npcId) return null
	return campaignNPCs.value.find(n => n.id === role.npcId) ?? null
})

const domainLeaderRole = computed<string>(() => {
	const role = politicsData.value.government.find(g => g.title === 'Príncipe')
	return role?.title ?? ''
})

const territoryZones = computed(() => politicsData.value.territoryZones || [])

const territorySummary = computed(() => {
	const s = { stable: 0, contested: 0, war: 0, abandoned: 0 }
	for (const z of territoryZones.value) {
		if (z.status in s) s[z.status as keyof typeof s]++
	}
	return s
})

const summaryPercent = (count: number) => {
	const total = territoryZones.value.length
	return total > 0 ? Math.round((count / total) * 100) : 0
}

const statusColor = (status: string) => {
	const map: Record<string, string> = {
		stable: '#22c55e', contested: '#eab308', war: '#ef4444', abandoned: '#6b7280'
	}
	return map[status] ?? '#6b7280'
}

const statusLabel = (status: string) => {
	const map: Record<string, string> = {
		stable: 'Estável', contested: 'Contestado', war: 'Em Guerra', abandoned: 'Abandonado'
	}
	return map[status] ?? status
}

// ── Load politics data (widgets) ──
const loadPoliticsData = async () => {
	if (!props.campaignId) return
	loadingPolitics.value = true
	try {
		const [{ data: campaign }] = await Promise.all([
			supabase
				.from('campaigns')
				.select('politics')
				.eq('id', props.campaignId)
				.single(),
			loadCampaignNPCs(props.campaignId)
		])
		if (campaign?.politics) {
			politicsData.value = {
				government: campaign.politics.government || [],
				territoryZones: campaign.politics.territoryZones || []
			}
		}
	} catch (err) {
		console.error('Erro ao carregar política (widgets):', err)
	} finally {
		loadingPolitics.value = false
	}
}

// ── Last event from DB ──
const lastEvent = ref<any>(null)
const loadingLastEvent = ref(false)

const fetchLastEvent = async () => {
	if (!props.campaignId) return
	loadingLastEvent.value = true
	try {
		const { data } = await supabase
			.from('campaign_events')
			.select('id, title, description, type, occurred_at')
			.eq('campaign_id', props.campaignId)
			.order('occurred_at', { ascending: false })
			.limit(1)
			.maybeSingle()
		lastEvent.value = data ?? null
	} catch {
		lastEvent.value = null
	} finally {
		loadingLastEvent.value = false
	}
}

// ── Persistence ──
const loadOverview = async () => {
	try {
		if (!props.campaignId) return

		// 1. Tentar carregar do Supabase primeiro
		const { data, error } = await supabase
			.from('campaigns')
			.select('overview')
			.eq('id', props.campaignId)
			.single()

		if (data?.overview && Object.keys(data.overview).length > 0) {
			const parsed = data.overview
			const validToneValues = toneOptions.map(t => t.value)
			
			// Migrate old single customTone to customTones array
			let customTones: string[] = parsed.customTones || []
			if (!customTones.length && parsed.customTone && parsed.customTone.trim()) {
				customTones = [parsed.customTone.trim()]
			}
			
			overview.value = {
				name: parsed.name || props.campaign?.name || '',
				status: parsed.status || '',
				principles: parsed.principles || '',
				tones: (parsed.tones || []).filter((t: string) => validToneValues.includes(t)),
				customTones
			}
		} else {
			// 2. Se não tem no Supabase, verificar localStorage (migração)
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
				
				// Migrar automaticamente para o Supabase
				await supabase
					.from('campaigns')
					.update({ overview: overview.value })
					.eq('id', props.campaignId)
				
				// Limpar localStorage após migração
				localStorage.removeItem(storageKey.value)
				console.log('✅ Dados da Visão Geral migrados do localStorage para Supabase')
			} else {
				// Default from campaign data
				overview.value.name = props.campaign?.name || ''
			}
		}
	} catch (err) {
		console.error('Erro ao carregar overview:', err)
		overview.value.name = props.campaign?.name || ''
	}
	savedSnapshot = JSON.stringify(overview.value)
}

const saveOverview = async () => {
	try {
		if (!props.campaignId) {
			toast.error('Erro', 'ID da campanha não encontrado')
			return
		}

		// Salvar no Supabase
		const { error } = await supabase
			.from('campaigns')
			.update({ overview: overview.value })
			.eq('id', props.campaignId)

		if (error) {
			console.error('Erro ao salvar overview:', error)
			toast.error('Erro ao salvar', error.message)
			return
		}

		savedSnapshot = JSON.stringify(overview.value)
		editMode.value = false
		toast.success('Visão Geral salva!', 'As informações da crônica foram atualizadas.')
	} catch (err: any) {
		console.error('Erro ao salvar overview:', err)
		toast.error('Erro ao salvar', err.message || 'Erro desconhecido')
	}
}

const cancelEdits = () => {
	try { overview.value = JSON.parse(savedSnapshot) } catch { /* ignore */ }
	editMode.value = false
}

// ── Lifecycle ──
onMounted(async () => {
	await loadOverview()
	fetchLastEvent()
	loadPoliticsData()
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
