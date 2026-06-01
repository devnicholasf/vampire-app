// ============================================
// Dice System Types - VTM V5
// ============================================

export interface DiceRollConfig {
  attribute: string
  skill: string
  attributeValue?: number
  skillValue?: number
  frenzyAutoSuccess?: boolean
  frenzyDifficultyPenalty?: number
  frenzyBaseDifficulty?: number
  modifier: number
  difficulty: number
  rollType: 'normal' | 'oculta' | 'resistida' | 'frenesi' | 'despertar'
  hunger: number
  characterId?: string
  targetId?: string // Para rolagens resistidas
}

export interface DiceResult {
  normal: number[]
  hunger: number[]
}

export interface RollResult {
  id: string
  campaignId: string
  sessionId?: string
  userId: string
  characterId?: string
  characterName: string
  
  rollType: string
  attribute: string
  skill: string
  
  poolTotal: number
  hunger: number
  difficulty: number
  modifier: number
  
  diceResults: DiceResult
  
  successes: number
  totalSuccesses: number
  
  isCritical: boolean
  isMessyCritical: boolean
  isBestialFailure: boolean
  isHidden: boolean
  canViewHiddenDetails: boolean
  
  description?: string
  createdAt: string
}

export interface RouseCheckResult {
  diceValue: number
  hungerIncreased: boolean
  newHunger: number
}

export const VTM_ATTRIBUTES = [
  { value: 'forca', label: 'Força' },
  { value: 'destreza', label: 'Destreza' },
  { value: 'vigor', label: 'Vigor' },
  { value: 'carisma', label: 'Carisma' },
  { value: 'manipulacao', label: 'Manipulação' },
  { value: 'aparencia', label: 'Aparência' },
  { value: 'percepcao', label: 'Percepção' },
  { value: 'inteligencia', label: 'Inteligência' },
  { value: 'raciocinio', label: 'Raciocínio' }
]

export const VTM_SKILLS = [
  { value: 'persuasao', label: 'Persuasão', category: 'social' },
  { value: 'briga', label: 'Briga', category: 'fisico' },
  { value: 'etiqueta', label: 'Etiqueta', category: 'social' },
  { value: 'intimidacao', label: 'Intimidação', category: 'social' },
  { value: 'investigacao', label: 'Investigação', category: 'mental' },
  { value: 'armas_de_fogo', label: 'Armas de Fogo', category: 'fisico' },
  { value: 'lideranca', label: 'Liderança', category: 'social' },
  { value: 'subterfugio', label: 'Subterfúgio', category: 'social' },
  { value: 'armas_brancas', label: 'Armas Brancas', category: 'fisico' },
  { value: 'atletismo', label: 'Atletismo', category: 'fisico' },
  { value: 'furtividade', label: 'Furtividade', category: 'fisico' },
  { value: 'sobrevivencia', label: 'Sobrevivência', category: 'fisico' },
  { value: 'conducao', label: 'Condução', category: 'fisico' },
  { value: 'academico', label: 'Acadêmico', category: 'mental' },
  { value: 'ciencias', label: 'Ciências', category: 'mental' },
  { value: 'financas', label: 'Finanças', category: 'mental' },
  { value: 'medicina', label: 'Medicina', category: 'mental' },
  { value: 'ocultismo', label: 'Ocultismo', category: 'mental' },
  { value: 'tecnologia', label: 'Tecnologia', category: 'mental' },
  { value: 'consciencia', label: 'Consciência', category: 'mental' },
  { value: 'manha', label: 'Manha', category: 'social' },
  { value: 'empatia', label: 'Empatia', category: 'social' },
  { value: 'intuicao', label: 'Intuição', category: 'social' },
  { value: 'performance', label: 'Performance', category: 'social' }
]

export const ROLL_TYPES = [
  { value: 'normal', label: 'Normal', description: 'Rolagem padrão visível a todos' },
  { value: 'oculta', label: 'Oculta', description: 'Mestre e autor veem o resultado; mesa vê apenas o aviso' },
  { value: 'resistida', label: 'Resistida', description: 'Contra outro personagem' },
  { value: 'frenesi', label: 'Frenesi', description: 'Teste de controle da Besta' },
  { value: 'despertar', label: 'Teste de Despertar', description: 'Rouse Check' }
]
