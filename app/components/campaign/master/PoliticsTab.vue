<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="df-section-title text-xl flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"/><path d="M5 20V10l7-6 7 6v10"/><path d="M9 20v-6h6v6"/><path d="M3 10l9-7 9 7"/></svg>
        Mapa Político da Crônica
      </h3>
      <button @click="editMode = !editMode" class="df-btn-ghost px-3 py-1.5 text-sm flex items-center gap-2">
        <svg v-if="!editMode" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        {{ editMode ? 'Visualizar' : 'Editar' }}
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION 1: Governo da Cidade                    -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M5 16h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z"/></svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Governo da Cidade</h4>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="(role, index) in politics.government" :key="index" class="df-role-card">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold uppercase tracking-wider" :class="getRoleColor(role.title)">{{ role.title || 'Cargo' }}</span>
              <button v-if="editMode" @click="removeGovernmentRole(index)" class="text-df-muted hover:text-df-red transition-colors">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <template v-if="editMode">
              <select v-model="role.title" class="df-input text-xs mb-1">
                <option value="">Cargo...</option>
                <option v-for="t in governmentTitles" :key="t" :value="t">{{ t }}</option>
              </select>
              <input v-model="role.name" class="df-input text-sm" placeholder="Nome do vampiro" />
              <input v-model="role.clan" class="df-input text-xs mt-1" placeholder="Clã" />
              <input v-model="role.note" class="df-input text-xs mt-1" placeholder="Nota breve..." />
            </template>
            <template v-else>
              <p class="text-white font-semibold text-sm">{{ role.name || '—' }}</p>
              <p v-if="role.clan" class="text-df-red text-xs">{{ role.clan }}</p>
              <p v-if="role.note" class="text-df-muted text-xs mt-1 italic">{{ role.note }}</p>
            </template>
          </div>
        </div>

        <button v-if="editMode" @click="addGovernmentRole" class="mt-3 w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-gold hover:text-df-gold transition-colors">
          + Adicionar Cargo
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION 2: Facções                              -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Facções</h4>
        </div>

        <div class="space-y-4">
          <div v-for="(faction, fi) in politics.factions" :key="fi" class="df-faction-card">
            <div class="flex items-center justify-between mb-2">
              <template v-if="editMode">
                <input v-model="faction.name" class="df-input text-sm font-bold flex-1 mr-2" placeholder="Nome da facção" />
                <button @click="removeFaction(fi)" class="text-df-muted hover:text-df-red transition-colors flex-shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </template>
              <h5 v-else class="text-white font-bold text-sm flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ background: faction.color || '#dc2626' }"></span>
                {{ faction.name }}
              </h5>
            </div>

            <template v-if="editMode">
              <div class="flex gap-2 mb-2">
                <input v-model="faction.leader" class="df-input text-xs flex-1" placeholder="Líder da facção" />
                <input v-model="faction.color" type="color" class="w-8 h-8 rounded cursor-pointer border border-df-border-silver bg-transparent" />
              </div>
              <textarea v-model="faction.description" class="df-input text-xs resize-none" rows="2" placeholder="Descrição / objetivos..."></textarea>
              <div class="mt-2">
                <label class="text-xs text-df-muted">Membros (um por linha)</label>
                <textarea v-model="faction.membersText" class="df-input text-xs resize-none mt-1" rows="2" placeholder="Marcus Ventrue&#10;Helena Toreador"></textarea>
              </div>
            </template>
            <template v-else>
              <p v-if="faction.leader" class="text-df-silver text-xs mb-1">
                <span class="text-df-gold">Líder:</span> {{ faction.leader }}
              </p>
              <p v-if="faction.description" class="text-df-muted text-xs italic mb-2">{{ faction.description }}</p>
              <div v-if="factionMembers(faction).length" class="flex flex-wrap gap-1">
                <span v-for="m in factionMembers(faction)" :key="m" class="px-2 py-0.5 text-xs rounded-full border" :style="{ borderColor: faction.color || '#7f1d1d', color: faction.color || '#dc2626' }">
                  {{ m }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <button v-if="editMode" @click="addFaction" class="mt-3 w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-gold hover:text-df-gold transition-colors">
          + Adicionar Facção
        </button>

        <!-- Empty state -->
        <div v-if="!editMode && politics.factions.length === 0" class="text-center py-6 text-df-muted text-sm italic">
          Nenhuma facção registrada. Clique em "Editar" para começar.
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION 3: Relações (Alianças, Ódios, Tensões) -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Relações</h4>
        </div>

        <!-- Sub-tabs for relation types -->
        <div class="flex gap-1 mb-4 border-b border-df-border-red/30 pb-2">
          <button
            v-for="rt in relationTypes" :key="rt.key"
            @click="activeRelationType = rt.key"
            class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t transition-all"
            :class="activeRelationType === rt.key ? 'text-white border-b-2' : 'text-df-muted hover:text-df-silver'"
            :style="activeRelationType === rt.key ? { borderColor: rt.color, color: rt.color } : {}"
          >
            {{ rt.label }}
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="(rel, ri) in filteredRelations"
            :key="ri"
            class="flex items-center gap-2 p-2 rounded-lg border transition-all"
            :class="getRelBorderClass(rel.type)"
          >
            <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: getRelColor(rel.type) }"></span>
            <template v-if="editMode">
              <input v-model="rel.from" class="df-input text-xs flex-1" placeholder="De..." />
              <svg class="w-4 h-4 text-df-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
              <input v-model="rel.to" class="df-input text-xs flex-1" placeholder="Para..." />
              <input v-model="rel.reason" class="df-input text-xs flex-1" placeholder="Motivo..." />
              <button @click="removeRelation(rel)" class="text-df-muted hover:text-df-red transition-colors flex-shrink-0">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </template>
            <template v-else>
              <span class="text-white text-sm font-medium">{{ rel.from }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" :style="{ color: getRelColor(rel.type), background: getRelColor(rel.type) + '15' }">
                {{ getRelLabel(rel.type) }}
              </span>
              <span class="text-white text-sm font-medium">{{ rel.to }}</span>
              <span v-if="rel.reason" class="text-df-muted text-xs italic ml-auto truncate max-w-[200px]">— {{ rel.reason }}</span>
            </template>
          </div>

          <div v-if="filteredRelations.length === 0" class="text-center py-4 text-df-muted text-sm italic">
            Nenhuma relação de {{ getRelLabel(activeRelationType).toLowerCase() }} registrada.
          </div>
        </div>

        <button v-if="editMode" @click="addRelation" class="mt-3 w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-gold hover:text-df-gold transition-colors">
          + Adicionar Relação
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION 4: Influência por Território            -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-4">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Influência por Território</h4>
        </div>

        <div class="space-y-3">
          <div v-for="(territory, ti) in politics.territories" :key="ti" class="df-territory-card">
            <div class="flex items-center justify-between mb-2">
              <template v-if="editMode">
                <input v-model="territory.name" class="df-input text-sm font-bold flex-1 mr-2" placeholder="Nome do território" />
                <button @click="removeTerritory(ti)" class="text-df-muted hover:text-df-red transition-colors flex-shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </template>
              <h5 v-else class="text-white font-bold text-sm">{{ territory.name }}</h5>
            </div>

            <template v-if="editMode">
              <input v-model="territory.controlledBy" class="df-input text-xs mb-1" placeholder="Controlado por..." />
              <textarea v-model="territory.description" class="df-input text-xs resize-none" rows="2" placeholder="Descrição do território e seu significado..."></textarea>
              <div class="flex items-center gap-2 mt-2">
                <label class="text-xs text-df-muted">Nível de controle:</label>
                <div class="flex gap-1">
                  <button
                    v-for="n in 5" :key="n" type="button"
                    @click="territory.controlLevel = n"
                    class="w-5 h-5 rounded-full border transition-all"
                    :class="n <= (territory.controlLevel || 0) ? 'bg-df-red border-df-red' : 'bg-transparent border-df-border-silver hover:border-df-red'"
                  ></button>
                </div>
              </div>
            </template>
            <template v-else>
              <p v-if="territory.controlledBy" class="text-df-silver text-xs mb-1">
                <span class="text-df-gold">Domínio de:</span> {{ territory.controlledBy }}
              </p>
              <p v-if="territory.description" class="text-df-muted text-xs italic mb-2">{{ territory.description }}</p>
              <div v-if="territory.controlLevel" class="flex items-center gap-1">
                <span class="text-xs text-df-muted mr-1">Controle:</span>
                <span v-for="n in 5" :key="n" class="w-3 h-3 rounded-full border" :class="n <= territory.controlLevel ? 'bg-df-red border-df-red shadow-sm shadow-red-900/50' : 'bg-transparent border-df-border-silver'"></span>
              </div>
            </template>
          </div>
        </div>

        <button v-if="editMode" @click="addTerritory" class="mt-3 w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-gold hover:text-df-gold transition-colors">
          + Adicionar Território
        </button>

        <!-- Empty state -->
        <div v-if="!editMode && politics.territories.length === 0" class="text-center py-6 text-df-muted text-sm italic">
          Nenhum território registrado. Clique em "Editar" para começar.
        </div>
      </div>
    </div>

    <!-- Save bar (when editing) -->
    <div v-if="editMode" class="sticky bottom-4 z-50 flex justify-end gap-3">
      <button @click="cancelEdits" class="df-btn-ghost px-5 py-2 text-sm">Descartar</button>
      <button @click="savePolitics" class="df-btn-primary px-5 py-2 text-sm flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        Salvar Mapa Político
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~/composables/useToast'

interface Props { campaignId: string }
const props = defineProps<Props>()
const toast = useToast()

const editMode = ref(false)

// ── Government titles used in Camarilla ──
const governmentTitles = [
  'Príncipe', 'Senescal', 'Xerife', 'Harpia', 'Guardião do Elísio',
  'Primogênito', 'Algoz', 'Carrasco', 'Emissário', 'Bispo',
  'Arcebispo', 'Cardeal', 'Barão', 'Outro'
]

// ── Relation types ──
const relationTypes = [
  { key: 'alliance' as const, label: 'Alianças', color: '#22c55e' },
  { key: 'hatred' as const, label: 'Ódios', color: '#dc2626' },
  { key: 'tension' as const, label: 'Tensões', color: '#f59e0b' }
]

type RelationType = 'alliance' | 'hatred' | 'tension'
const activeRelationType = ref<RelationType>('alliance')

interface GovernmentRole { title: string; name: string; clan: string; note: string }
interface Faction { name: string; leader: string; color: string; description: string; membersText: string }
interface Relation { type: RelationType; from: string; to: string; reason: string }
interface Territory { name: string; controlledBy: string; description: string; controlLevel: number }

interface PoliticsData {
  government: GovernmentRole[]
  factions: Faction[]
  relations: Relation[]
  territories: Territory[]
}

const defaultPolitics = (): PoliticsData => ({
  government: [
    { title: 'Príncipe', name: '', clan: '', note: '' },
    { title: 'Senescal', name: '', clan: '', note: '' },
    { title: 'Xerife', name: '', clan: '', note: '' },
    { title: 'Harpia', name: '', clan: '', note: '' },
    { title: 'Guardião do Elísio', name: '', clan: '', note: '' }
  ],
  factions: [],
  relations: [],
  territories: []
})

const politics = ref<PoliticsData>(defaultPolitics())
let savedSnapshot = ''

// ── Persistence via localStorage ──
const storageKey = computed(() => `vamp-politics-${props.campaignId}`)

onMounted(() => {
  const stored = localStorage.getItem(storageKey.value)
  if (stored) {
    try {
      politics.value = { ...defaultPolitics(), ...JSON.parse(stored) }
    } catch { /* ignore */ }
  }
  savedSnapshot = JSON.stringify(politics.value)
})

const savePolitics = () => {
  localStorage.setItem(storageKey.value, JSON.stringify(politics.value))
  savedSnapshot = JSON.stringify(politics.value)
  editMode.value = false
  toast.success('Mapa Político salvo!', 'Todas as alterações foram registradas.')
}

const cancelEdits = () => {
  try { politics.value = JSON.parse(savedSnapshot) } catch { /* ignore */ }
  editMode.value = false
}

// ── Government ──
const addGovernmentRole = () => { politics.value.government.push({ title: '', name: '', clan: '', note: '' }) }
const removeGovernmentRole = (i: number) => { politics.value.government.splice(i, 1) }

// ── Factions ──
const addFaction = () => { politics.value.factions.push({ name: '', leader: '', color: '#dc2626', description: '', membersText: '' }) }
const removeFaction = (i: number) => { politics.value.factions.splice(i, 1) }
const factionMembers = (f: Faction) => f.membersText ? f.membersText.split('\n').map(m => m.trim()).filter(Boolean) : []

// ── Relations ──
const filteredRelations = computed(() => politics.value.relations.filter(r => r.type === activeRelationType.value))
const addRelation = () => { politics.value.relations.push({ type: activeRelationType.value, from: '', to: '', reason: '' }) }
const removeRelation = (rel: Relation) => {
  const i = politics.value.relations.indexOf(rel)
  if (i !== -1) politics.value.relations.splice(i, 1)
}

const getRelColor = (type: string) => {
  if (type === 'alliance') return '#22c55e'
  if (type === 'hatred') return '#dc2626'
  return '#f59e0b'
}
const getRelLabel = (type: string) => {
  if (type === 'alliance') return 'Aliança'
  if (type === 'hatred') return 'Ódio'
  return 'Tensão'
}
const getRelBorderClass = (type: string) => {
  if (type === 'alliance') return 'border-green-900/40 bg-green-950/20'
  if (type === 'hatred') return 'border-red-900/40 bg-red-950/20'
  return 'border-yellow-900/40 bg-yellow-950/20'
}

const getRoleColor = (title: string) => {
  if (title === 'Príncipe') return 'text-df-gold'
  if (title === 'Senescal') return 'text-blue-400'
  if (title === 'Xerife') return 'text-df-red'
  if (title === 'Harpia') return 'text-purple-400'
  return 'text-df-silver'
}

// ── Territories ──
const addTerritory = () => { politics.value.territories.push({ name: '', controlledBy: '', description: '', controlLevel: 0 }) }
const removeTerritory = (i: number) => { politics.value.territories.splice(i, 1) }

// Expose count for parent
defineExpose({ count: computed(() => politics.value.factions.length) })
</script>

<style scoped>
/* ═══ Cards ═══ */
.df-card {
  position: relative;
  background: #0a0a1a;
  border: 1px solid #7f1d1d;
  box-shadow: 0 0 0 1px #4a4a5a, inset 0 1px 6px rgba(0,0,0,0.5);
  border-radius: 0.5rem;
  padding: 1rem;
}
.df-card-corner { position: absolute; width: 14px; height: 14px; pointer-events: none; z-index: 2; }
.df-card-corner::before, .df-card-corner::after { content: ''; position: absolute; background: #dc2626; }
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

/* ═══ Inner cards ═══ */
.df-role-card, .df-faction-card, .df-territory-card {
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s ease;
}
.df-role-card:hover, .df-faction-card:hover, .df-territory-card:hover {
  border-color: #7f1d1d;
}

/* ═══ Inputs ═══ */
.df-input {
  width: 100%;
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.375rem;
  padding: 0.375rem 0.625rem;
  color: #c0c0d0;
  transition: border-color 0.2s;
}
.df-input:focus { outline: none; border-color: #dc2626; }
.df-input::placeholder { color: #6b6b80; }

/* ═══ Buttons ═══ */
.df-btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
  background: linear-gradient(135deg, #991b1b, #7f1d1d); color: #fecaca;
  border: 1px solid #dc2626; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease; box-shadow: 0 0 12px rgba(220,38,38,0.2);
}
.df-btn-primary:hover { background: linear-gradient(135deg, #b91c1c, #991b1b); box-shadow: 0 0 20px rgba(220,38,38,0.4); color: #fff; }

.df-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em;
  background: transparent; color: #6b6b80;
  border: 1px solid #4a4a5a; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease;
}
.df-btn-ghost:hover { border-color: #dc2626; color: #c0c0d0; background: rgba(127,29,29,0.1); }
</style>