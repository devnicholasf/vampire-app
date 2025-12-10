import { ref, reactive, computed } from 'vue'

export interface NPC {
  id: string
  name: string
  type: string
  description: string
  photo?: string
  visibleToPlayers: boolean
  createdBy: string
  campaignId: string
  details?: {
    clan?: string
    generation?: number
    disciplines?: string[]
    background?: string
    relationships?: string[]
  }
}

// Estado global dos NPCs
const campaignNPCs = reactive(new Map<string, NPC[]>())

export function useNPCs(campaignId?: string) {
  // NPCs da campanha atual
  const npcs = computed(() => {
    if (!campaignId) return []
    return campaignNPCs.get(campaignId) || []
  })

  // NPCs visíveis aos jogadores
  const visibleNPCs = computed(() => {
    return npcs.value.filter(npc => npc.visibleToPlayers)
  })

  // Adicionar NPC
  const addNPC = (npc: Omit<NPC, 'id' | 'campaignId'>) => {
    if (!campaignId) return

    const newNPC: NPC = {
      ...npc,
      id: generateNPCId(),
      campaignId,
      visibleToPlayers: false // Por padrão, NPCs não são visíveis aos jogadores
    }

    const currentNPCs = campaignNPCs.get(campaignId) || []
    campaignNPCs.set(campaignId, [...currentNPCs, newNPC])

    return newNPC
  }

  // Atualizar NPC
  const updateNPC = (npcId: string, updates: Partial<NPC>) => {
    if (!campaignId) return

    const currentNPCs = campaignNPCs.get(campaignId) || []
    const npcIndex = currentNPCs.findIndex(npc => npc.id === npcId)
    
    if (npcIndex !== -1) {
      currentNPCs[npcIndex] = { ...currentNPCs[npcIndex], ...updates }
      campaignNPCs.set(campaignId, [...currentNPCs])
    }
  }

  // Remover NPC
  const removeNPC = (npcId: string) => {
    if (!campaignId) return

    const currentNPCs = campaignNPCs.get(campaignId) || []
    const filteredNPCs = currentNPCs.filter(npc => npc.id !== npcId)
    campaignNPCs.set(campaignId, filteredNPCs)
  }

  // Alternar visibilidade para jogadores
  const toggleNPCVisibility = (npcId: string) => {
    const npc = npcs.value.find(n => n.id === npcId)
    if (npc) {
      updateNPC(npcId, { visibleToPlayers: !npc.visibleToPlayers })
      console.log(`NPC ${npc.name} ${!npc.visibleToPlayers ? 'visível' : 'oculto'} para jogadores`)
    }
  }

  // Buscar NPC por ID
  const getNPCById = (npcId: string): NPC | undefined => {
    return npcs.value.find(npc => npc.id === npcId)
  }

  // Inicializar NPCs mock para desenvolvimento
  const initializeMockNPCs = () => {
    if (!campaignId || campaignNPCs.has(campaignId)) return

    const mockNPCs: NPC[] = [
      {
        id: 'npc-1',
        name: 'Vampiro Ancião',
        type: 'Antagonista',
        description: 'Um vampiro antigo e poderoso que controla parte da cidade',
        photo: '/npcs/vampire-elder.jpg',
        visibleToPlayers: false,
        createdBy: 'master-1',
        campaignId,
        details: {
          clan: 'Ventrue',
          generation: 7,
          disciplines: ['Dominação', 'Presença', 'Fortitude'],
          background: 'Ex-nobre português do século XVIII',
          relationships: ['Inimigo mortal do Príncipe atual']
        }
      },
      {
        id: 'npc-2',
        name: 'Bartender Joe',
        type: 'Informante',
        description: 'Conhece todos os segredos da cidade e está disposto a compartilhá-los... por um preço',
        photo: '/npcs/bartender.jpg',
        visibleToPlayers: true,
        createdBy: 'master-1',
        campaignId,
        details: {
          clan: 'Nosferatu',
          generation: 9,
          disciplines: ['Ofuscação', 'Animalismo'],
          background: 'Ex-detetive que foi abraçado nos anos 80',
          relationships: ['Contato dos Nosferatu', 'Devedor do Príncipe']
        }
      },
      {
        id: 'npc-3',
        name: 'Madame Clarissa',
        type: 'Aliada',
        description: 'Proprietária de uma galeria de arte, conhece muitos segredos da sociedade vampíresca',
        photo: '/npcs/madame-clarissa.jpg',
        visibleToPlayers: false,
        createdBy: 'master-1',
        campaignId,
        details: {
          clan: 'Toreador',
          generation: 8,
          disciplines: ['Auspícios', 'Presença', 'Celeridade'],
          background: 'Artista renomada abraçada na Belle Époque',
          relationships: ['Primógena Toreador', 'Mecenas de artistas mortais']
        }
      }
    ]

    campaignNPCs.set(campaignId, mockNPCs)
  }

  return {
    npcs,
    visibleNPCs,
    addNPC,
    updateNPC,
    removeNPC,
    toggleNPCVisibility,
    getNPCById,
    initializeMockNPCs
  }
}

// Função auxiliar para gerar IDs únicos
function generateNPCId(): string {
  return `npc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}