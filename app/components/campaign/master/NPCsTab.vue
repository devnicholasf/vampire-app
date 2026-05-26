<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="df-section-title text-xl flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
        NPCs da Campanha
      </h3>
      <div class="flex items-center gap-3">
        <span class="df-text-muted text-sm">{{ npcs.length }} NPC(s)</span>
        <button @click="createNPC" class="df-btn-primary">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Criar NPC
        </button>
      </div>
    </div>

    <!-- Organizado por -->
    <div class="flex items-center gap-3">
      <span class="text-sm text-df-muted">Organizado por:</span>
      <select v-model="groupBy" class="df-filter-select">
        <option value="">Todos</option>
        <option value="status">Status</option>
        <option value="sect">Seita</option>
        <option value="clan">Clã</option>
      </select>
      <select v-if="groupBy === 'status'" v-model="groupFilter" class="df-filter-select">
        <option value="">Todos os status</option>
        <option value="Ativo">Ativo</option>
        <option value="Desaparecido">Desaparecido</option>
        <option value="Caçado">Caçado</option>
        <option value="Traidor">Traidor</option>
      </select>
      <select v-if="groupBy === 'sect'" v-model="groupFilter" class="df-filter-select">
        <option value="">Todas as seitas</option>
        <option v-for="s in availableSects" :key="s" :value="s">{{ s }}</option>
      </select>
      <select v-if="groupBy === 'clan'" v-model="groupFilter" class="df-filter-select">
        <option value="">Todos os clãs</option>
        <option v-for="c in availableClans" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="text-center">
        <div class="df-spinner"></div>
        <p class="df-text-muted mt-4">Carregando NPCs...</p>
      </div>
    </div>

    <!-- NPCs Grid -->
    <div v-else-if="filteredNPCs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="npc in filteredNPCs"
        :key="npc.id"
        class="df-card group hover:border-df-red/40 transition-all duration-300"
      >
        <div class="df-card-corner df-card-corner-tl"></div>
        <div class="df-card-corner df-card-corner-tr"></div>
        <div class="df-card-corner df-card-corner-bl"></div>
        <div class="df-card-corner df-card-corner-br"></div>

        <div class="relative z-10">
          <!-- NPC Header -->
          <div class="flex items-center gap-3 mb-3">
            <div class="w-14 h-14 rounded-full border-2 border-df-border-red bg-df-input flex items-center justify-center overflow-hidden flex-shrink-0">
              <img v-if="npc.photo" :src="npc.photo" :alt="npc.name" class="w-full h-full object-cover" />
              <svg v-else class="w-7 h-7 text-df-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-lg font-bold text-white truncate">{{ npc.name }}</h4>
              <div class="flex items-center gap-2 mt-0.5">
                <span v-if="npc.clan" class="text-sm text-df-red font-medium">{{ npc.clan }}</span>
                <span v-if="npc.generation" class="text-xs text-df-muted">{{ npc.generation }}ª Geração</span>
              </div>
            </div>
            <button @click="confirmDeleteNPC(npc as any)" class="df-btn-icon opacity-0 group-hover:opacity-100 transition-opacity" title="Remover NPC">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>

          <!-- NPC Info Lines -->
          <div class="space-y-1 mb-3 text-sm">
            <p v-if="npc.role" class="text-df-silver"><span class="text-df-gold font-medium">Papel:</span> {{ npc.role }}</p>
            <p v-if="npc.motivation" class="text-df-silver"><span class="text-df-gold font-medium">Motivação:</span> {{ npc.motivation }}</p>
            <p v-if="npc.secret" class="text-df-silver"><span class="text-df-gold font-medium">Segredo:</span> {{ npc.secret }}</p>
            <p v-if="npc.mainPool" class="text-df-silver"><span class="text-df-gold font-medium">Pool principal:</span> {{ npc.mainPool }}</p>
            <p v-if="!npc.role && !npc.motivation && !npc.secret && !npc.mainPool" class="text-df-muted italic">Sem informações adicionais</p>
          </div>

          <!-- Key Points -->
          <div v-if="npc.keyPoints && npc.keyPoints.length > 0" class="mb-4">
            <div class="flex flex-wrap gap-1.5">
              <span v-for="point in npc.keyPoints.slice(0, 3)" :key="point" class="inline-block px-2 py-0.5 bg-df-input border border-df-border-red rounded text-xs text-df-silver">{{ point }}</span>
              <span v-if="npc.keyPoints.length > 3" class="inline-block px-2 py-0.5 bg-df-input border border-df-border-silver rounded text-xs text-df-muted">+{{ npc.keyPoints.length - 3 }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-3 border-t border-df-border-red/50">
            <button @click="editNPC(npc as any)" class="df-btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
            <button @click="viewDetails(npc as any)" class="df-btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Detalhes
            </button>
            <button @click="openSheet(npc as any)" class="df-btn-ghost text-xs px-2.5 py-1.5 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Ficha
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results for Filter -->
    <div v-else-if="npcs.length > 0 && filteredNPCs.length === 0" class="df-card text-center py-12">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <svg class="w-12 h-12 text-df-border-silver mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h4 class="text-lg font-bold text-white mb-2">Nenhum NPC encontrado</h4>
        <p class="text-df-muted text-sm">Não há NPCs correspondentes ao filtro selecionado.</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="npcs.length === 0" class="df-card text-center py-16">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <svg class="w-16 h-16 text-df-border-red mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
        <h4 class="text-lg font-bold text-white mb-2">Nenhum NPC criado</h4>
        <p class="text-df-muted text-sm mb-6">Crie seu primeiro NPC para popular sua campanha.</p>
        <button @click="createNPC" class="df-btn-primary mx-auto">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Criar Primeiro NPC
        </button>
      </div>
    </div>

    <!-- NPC Creation/Edit Modal -->
    <Teleport to="body">
      <NPCModal v-if="showCreateModal || editingNPC" :npc="editingNPC" @close="closeModal" @save="saveNPC" />
    </Teleport>

    <!-- NPC Details Modal -->
    <Teleport to="body">
      <NPCDetailsModal
        v-if="viewingNPC"
        :npc="viewingNPC"
        :is-in-game="isNpcInGame(viewingNPC.id)"
        @close="closeDetailsModal"
        @edit="editNPC"
        @add-to-game="addToGame"
      />
    </Teleport>

    <!-- NPC Sheet Modal -->
    <Teleport to="body">
      <NPCSheet v-if="viewingSheet" :npc="viewingSheet" @close="closeSheet" @save="saveNPCSheet" />
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]" @click="closeDeleteModal">
        <div class="df-modal-card max-w-sm mx-4 w-full" @click.stop>
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>
          <div class="relative z-10 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-red-500/50 bg-red-500/10 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">Remover NPC</h3>
            <p class="text-df-muted mb-6">Tem certeza que deseja remover <strong class="text-df-silver">{{ npcToDelete?.name }}</strong>? Esta ação não pode ser desfeita.</p>
            <div class="flex justify-center gap-3">
              <button @click="closeDeleteModal" class="df-btn-ghost px-6 py-2">Cancelar</button>
              <button @click="executeDeleteNPC" class="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg border border-red-500 transition-all font-medium">Remover</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NPC } from '~/types'
import NPCModal from '~/components/campaign/master/NPCModal.vue'
import NPCDetailsModal from '~/components/campaign/master/NPCDetailsModal.vue'
import NPCSheet from '~/components/campaign/master/NPCSheet.vue'
import { useCampaign } from '~/composables/useCampaign'
import { useLiveGame } from '~/composables/useLiveGame'
import { useToast } from '~/composables/useToast'

interface Props { campaignId: string }
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:count': [count: number]
}>()

const { campaignNPCs: npcs, loadCampaignNPCs, createNPC: createNPCInCampaign, updateNPC, deleteNPC, subscribeToNPCs, loading } = useCampaign()
const { addNPCToGame, removeNPCFromGame, fetchLiveGameState, subscribeToLiveGame, currentNpcs } = useLiveGame()
const toast = useToast()

// Watch NPCs to update count
watch(npcs, (newNpcs) => {
  emit('update:count', newNpcs.length)
}, { immediate: true })

const sortedNPCs = computed(() => [...npcs.value].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR')))

const groupBy = ref('')
const groupFilter = ref('')

const availableSects = computed(() => {
  const sects = npcs.value.map(n => n.sect).filter(Boolean) as string[]
  return [...new Set(sects)].sort()
})
const availableClans = computed(() => {
  const clans = npcs.value.map(n => typeof n.clan === 'string' ? n.clan : '').filter(Boolean)
  return [...new Set(clans)].sort()
})

// Helper para normalizar status (suporta inglês e português)
const normalizeStatus = (status: string | undefined): string => {
  if (!status) return ''
  const normalized: Record<string, string> = {
    'active': 'Ativo',
    'dead': 'Morto',
    'missing': 'Desaparecido',
    'traitor': 'Traidor',
    'hunted': 'Caçado'
  }
  return normalized[status.toLowerCase()] || status
}

const filteredNPCs = computed(() => {
  let list = sortedNPCs.value
  if (groupBy.value && groupFilter.value) {
    if (groupBy.value === 'status') {
      // Comparar status normalizado
      list = list.filter(n => normalizeStatus(n.status) === groupFilter.value)
    }
    else if (groupBy.value === 'sect') list = list.filter(n => n.sect === groupFilter.value)
    else if (groupBy.value === 'clan') list = list.filter(n => (typeof n.clan === 'string' ? n.clan : '') === groupFilter.value)
  }
  return list
})

const statusLabel = (s: string) => ({ 
  active: 'Ativo', 
  dead: 'Morto', 
  missing: 'Desaparecido', 
  traitor: 'Traidor',
  'Ativo': 'Ativo',
  'Desaparecido': 'Desaparecido',
  'Caçado': 'Caçado',
  'Traidor': 'Traidor'
}[s] || s)

const statusBadgeClass = (s: string) => ({
  active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/20',
  'Ativo': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/20',
  dead: 'bg-zinc-800/80 text-zinc-400 border border-zinc-600/50 shadow-lg shadow-zinc-900/30',
  missing: 'bg-zinc-500/20 text-zinc-300 border border-zinc-400/50 shadow-lg shadow-zinc-500/20',
  'Desaparecido': 'bg-zinc-500/20 text-zinc-300 border border-zinc-400/50 shadow-lg shadow-zinc-500/20',
  'Caçado': 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-lg shadow-amber-500/20',
  traitor: 'bg-rose-600/20 text-rose-400 border border-rose-500/50 shadow-lg shadow-rose-600/20',
  'Traidor': 'bg-rose-600/20 text-rose-400 border border-rose-500/50 shadow-lg shadow-rose-600/20',
}[s] || 'bg-gray-900/40 text-gray-400 border border-gray-700/50')

const showCreateModal = ref(false)
const editingNPC = ref<NPC | null>(null)
const viewingNPC = ref<NPC | null>(null)
const viewingSheet = ref<NPC | null>(null)
const showDeleteModal = ref(false)
const npcToDelete = ref<NPC | null>(null)
let npcSubscription: any = null
let liveGameSubscription: any = null

onMounted(async () => {
  await loadCampaignNPCs(props.campaignId)
  await fetchLiveGameState(props.campaignId)
  npcSubscription = subscribeToNPCs(props.campaignId)
  liveGameSubscription = subscribeToLiveGame(props.campaignId)
})
onUnmounted(() => {
  npcSubscription?.unsubscribe()
  liveGameSubscription?.unsubscribe()
})

const isNpcInGame = (npcId: string) => {
  return (currentNpcs.value || []).some((npc: any) => npc.id === npcId)
}

const createNPC = () => { showCreateModal.value = true }
const editNPC = (npc: any) => { viewingNPC.value = null; editingNPC.value = npc; showCreateModal.value = true }
const viewDetails = (npc: any) => { viewingNPC.value = npc }
const openSheet = (npc: any) => { viewingSheet.value = npc }
const closeModal = () => { showCreateModal.value = false; editingNPC.value = null }
const closeDetailsModal = () => { viewingNPC.value = null }
const closeSheet = () => { viewingSheet.value = null }

const saveNPC = async (npcData: any) => {
  try {
    if (editingNPC.value) {
      // Sync photo → sheet.avatar and sect so both stay in sync
      if (editingNPC.value.sheet) {
        npcData.sheet = { ...editingNPC.value.sheet, avatar: npcData.photo, sect: npcData.sect }
      }
      await updateNPC(editingNPC.value.id, npcData); toast.success('NPC atualizado!', `${npcData.name} foi atualizado com sucesso`)
    }
    else { await createNPCInCampaign({ campaignId: props.campaignId, ...npcData }); toast.success('NPC criado!', `${npcData.name} foi adicionado à campanha`) }
  } catch (error: any) { console.error('Erro ao salvar NPC:', error); toast.error('Erro ao salvar NPC', error?.message || 'Tente novamente') }
  closeModal()
}

const saveNPCSheet = async (npcData: any) => {
  try { await updateNPC(npcData.id, npcData); toast.success('Ficha salva!', 'Ficha do NPC foi atualizada') }
  catch (error: any) { console.error('Erro ao salvar ficha:', error); toast.error('Erro ao salvar ficha', error?.message || 'Tente novamente') }
  closeSheet()
}

const addToGame = async (npc: any) => {
  if (isNpcInGame(npc.id)) {
    try {
      await removeNPCFromGame(npc.id)
      toast.success('NPC removido do jogo', `${npc.name} foi removido da sessão ao vivo`)
    } catch (error: any) {
      console.error('Erro:', error)
      toast.error('Erro ao remover do jogo', error?.message || 'Tente novamente')
    }
    return
  }

  try {
    await addNPCToGame(props.campaignId, npc, true)
    toast.success('NPC adicionado!', `${npc.name} foi marcado como usado no jogo`)
  }
  catch (error: any) { console.error('Erro:', error); toast.error('Erro ao adicionar ao jogo', error?.message || 'Tente novamente') }
}

const confirmDeleteNPC = (npc: any) => { npcToDelete.value = npc; showDeleteModal.value = true }
const executeDeleteNPC = async () => {
  if (npcToDelete.value) {
    try {
      await removeNPCFromGame(npcToDelete.value.id, props.campaignId)
      await deleteNPC(npcToDelete.value.id)
      toast.success('NPC removido!', `${npcToDelete.value.name} foi removido`)
    }
    catch (error: any) { console.error('Erro:', error); toast.error('Erro ao remover NPC', error?.message || 'Tente novamente') }
  }
  closeDeleteModal()
}
const closeDeleteModal = () => { showDeleteModal.value = false; npcToDelete.value = null }

defineExpose({ npcs })
</script>

<style scoped>
/* ═══ DF Variables ═══ */
:deep() {
  --df-bg-card: #0a0a1a;
  --df-bg-input: #0d0d20;
  --df-border-red: #7f1d1d;
  --df-border-silver: #4a4a5a;
  --df-accent-red: #dc2626;
  --df-accent-crimson: #991b1b;
  --df-text-silver: #c0c0d0;
  --df-text-gold: #d4a647;
  --df-glow-red: rgba(220, 38, 38, 0.3);
}

/* ═══ Line Clamp ═══ */
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

/* ═══ Filter Select ═══ */
.df-filter-select {
  padding: 0.35rem 0.6rem;
  border: 1px solid #4a4a5a;
  border-radius: 0.375rem;
  background: #0d0d20;
  color: #c0c0d0;
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.2s;
}
.df-filter-select:focus { border-color: #dc2626; }
.df-filter-select option { background: #0d0d20; color: #c0c0d0; }

/* ═══ Text Helpers ═══ */
.df-text-muted { color: #6b6b80; }

/* ═══ Card ═══ */
.df-card {
  position: relative;
  background: #0a0a1a;
  border: 1px solid #7f1d1d;
  box-shadow: 0 0 0 1px #4a4a5a, inset 0 1px 6px rgba(0,0,0,0.5);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* ═══ Corner Decorations ═══ */
.df-card-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 2;
  pointer-events: none;
}
.df-card-corner::before,
.df-card-corner::after {
  content: '';
  position: absolute;
  background: #991b1b;
}
.df-card-corner::before { width: 16px; height: 1px; }
.df-card-corner::after  { width: 1px;  height: 16px; }
.df-card-corner-tl { top: -1px; left: -1px; }
.df-card-corner-tl::before { top: 0; left: 0; }
.df-card-corner-tl::after  { top: 0; left: 0; }
.df-card-corner-tr { top: -1px; right: -1px; }
.df-card-corner-tr::before { top: 0; right: 0; }
.df-card-corner-tr::after  { top: 0; right: 0; }
.df-card-corner-bl { bottom: -1px; left: -1px; }
.df-card-corner-bl::before { bottom: 0; left: 0; }
.df-card-corner-bl::after  { bottom: 0; left: 0; }
.df-card-corner-br { bottom: -1px; right: -1px; }
.df-card-corner-br::before { bottom: 0; right: 0; }
.df-card-corner-br::after  { bottom: 0; right: 0; }

/* ═══ Buttons ═══ */
.df-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #991b1b, #450a0a);
  border: 1px solid #7f1d1d;
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.df-btn-primary:hover {
  background: linear-gradient(135deg, #b91c1c, #7f1d1d);
  box-shadow: 0 0 16px rgba(220, 38, 38, 0.3);
  color: #fff;
}

.df-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  color: #c0c0d0;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.df-btn-ghost:hover {
  color: #dc2626;
  border-color: #7f1d1d;
  background: rgba(127, 29, 29, 0.1);
}

.df-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid transparent;
  color: #6b6b80;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.df-btn-icon:hover { color: #dc2626; border-color: #7f1d1d; background: rgba(127,29,29,0.15); }

/* ═══ Modal Card (Teleported) ═══ */
.df-modal-card {
  background: #0a0a1a;
  border: 1px solid #7f1d1d;
  border-radius: 0.75rem;
  padding: 2rem;
  position: relative;
  box-shadow: 0 0 40px rgba(220,38,38,0.15), inset 0 1px 6px rgba(0,0,0,0.5);
}

/* ═══ Spinner ═══ */
.df-spinner {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 2px solid #7f1d1d;
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
