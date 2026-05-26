// ============================================
// TYPES - Vampire The Masquerade RPG System
// ============================================

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Tipo específico para autenticação com Supabase
export interface AuthUser {
  id: string
  email: string
  username: string
  avatar?: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// CHAT SYSTEM TYPES
// ============================================

export interface ChatUser {
  id: string
  name: string
  role?: string
}

export interface ChatMessage {
  id: string
  content: string
  senderId: string
  createdAt: Date
}

export interface ChatConversation {
  id: string
  otherUser: ChatUser
  lastMessage?: ChatMessage
  unreadCount: number
  campaign?: { id: string; name: string }
}

// ============================================
// NOTIFICATION SYSTEM TYPES
// ============================================

export interface NotificationAction {
  id: string
  label: string
  primary?: boolean
  action: 'accept' | 'decline' | 'view' | 'dismiss'
}

export interface Notification {
  id: string
  type: 'campaign_invite' | 'session_reminder' | 'message' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
  data?: Record<string, any>
  actions?: NotificationAction[]
}

export interface Campaign {
  id: string
  name: string
  description: string
  masterId: string // ID do mestre
  inviteCode: string // Código único para convite de jogadores
  master?: User
  players: CampaignPlayer[]
  createdAt: Date
  updatedAt: Date
  currentImage?: string // Mapa/imagem atual
  currentMusic?: string // Música atual
  isPremium: boolean
}

export interface CampaignPlayer {
  userId: string
  user?: User
  campaignId: string
  character: Character
  joinedAt: Date
}

export interface Character {
  name: string
  clan: VampireClan
  generation: number
  avatar?: string
  // Atributos VtM
  attributes: {
    hunger: number // 0-5
    humanity: number // 0-10
    willpower: number // 0-10
    health: number // 0-10
  }
  // Disciplinas, vantagens, etc podem ser expandidas
  disciplines?: string[]
  background?: string
}

export type VampireClan = 
  | 'Brujah'
  | 'Gangrel'
  | 'Malkavian'
  | 'Nosferatu'
  | 'Toreador'
  | 'Tremere'
  | 'Ventrue'
  | 'Caitiff'
  | 'Lasombra'
  | 'Tzimisce'
  | 'Other'

export interface TimelineEvent {
  id: string
  campaignId: string
  authorId: string
  author?: User
  type: TimelineEventType
  title: string
  description: string
  session?: number
  createdAt: Date
  updatedAt: Date
}

export type TimelineEventType = 
  | 'combat'
  | 'roleplay'
  | 'discovery'
  | 'social'
  | 'investigation'
  | 'travel'
  | 'other'

export interface NPC {
  id: string
  campaignId: string
  name: string
  type?: string // Tipo do NPC (Antagonista, Aliado, Informante, etc.)
  clan?: VampireClan | string // Permitir string para mais flexibilidade
  generation?: number
  sect?: string // Seita (Camarilla, Sabbat, Anarquistas, etc.)
  status?: 'active' | 'dead' | 'missing' | 'traitor' // Status do NPC
  role?: string // Papel na crônica
  motivation?: string // Motivação
  secret?: string // Segredo
  mainPool?: string // Pool principal
  bio?: string // Biografia completa (legado)
  keyPoints?: string[] // Pontos chave na história
  photo?: string // URL da foto (futuramente arquivo)
  image?: string // Manter retrocompatibilidade
  description?: string // Manter retrocompatibilidade
  stats?: {
    health?: number
    willpower?: number
    disciplines?: string[]
  }
  notes?: string // Notas privadas do mestre
  sheet?: CharacterSheet // Ficha completa do NPC
  isVisible?: boolean // Se está visível no jogo live
  createdAt: Date
  updatedAt?: Date
}

export interface CharacterSheet {
  name: string
  concept: string
  clan: string
  generation: number
  sect: string
  haven: string
  predator?: string // Tipo de Predador (V5)
  ambition?: string // Ambição (V5)
  desire?: string // Desejo (V5)
  player: string
  avatar?: string // Avatar base64
  
  // Campos da ficha oficial V5
  resonance?: string // Ressonância
  chronicleTenets?: string // Princípios da Crônica
  touchstonesConvictions?: Array<{ conviction: string; pillar: string }> // Pilares & Convicções V5
  clanBane?: string // Perdição do Clã
  advantages?: Array<{ name: string; level: number }> // Vantagens & Defeitos
  bloodPotency?: number // Potência de Sangue (0-10)
  bloodSurge?: string // Surto de Sangue
  powerBonus?: string // Bônus de Poder
  feedingPenalty?: string // Penalidade de Alimentação
  baneSeverity?: string // Gravidade da Perdição
  
  // Informações pessoais
  embraceGeneration?: string // Geração do Abraço (childer, neonate, ancilla)
  appearance?: string // Aparência (descrição física)
  distinguishingFeatures?: string // Traços Distintivos
  history?: string // História completa
  
  attributes: {
    physical: { strength: number; dexterity: number; stamina: number }
    social: { charisma: number; manipulation: number; composure: number }
    mental: { intelligence: number; wits: number; resolve: number }
  }
  skills: {
    talents: Record<string, number>
    skills: Record<string, number>
    knowledges: Record<string, number>
  }
  disciplines: Array<{ name: string; level: number }>
  virtues: { conscience: number; selfControl: number; courage: number }
  humanity: number
  willpower: number
  vitality?: number // Vitalidade (V5)
  hunger?: number // Fome atual (1-5)
  conditions?: string[] // Condições narrativas ativas
  xpTotal?: number // Experiência Total
  xpAvailable?: number // XP disponível
  xpSpent?: number // XP gasto
  notes?: string // Notas diversas
}

export interface MediaFile {
  id: string
  campaignId: string
  uploadedBy: string
  type: MediaType
  name: string
  url: string
  thumbnail?: string
  size: number
  createdAt: Date
}

export type MediaType = 
  | 'image'
  | 'audio'
  | 'document'
  | 'map'
  | 'other'

export interface CombatTurn {
  id: string
  campaignId: string
  participantId: string // Character ou NPC
  participantName: string
  initiative: number
  isNPC: boolean
  order: number
}

export interface MasterNote {
  id: string
  campaignId: string
  title: string
  content: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export interface CreateCampaignData {
  name: string
  description: string
}

export interface JoinCampaignData {
  campaignId: string
  character: Character
}

// ============================================
// Permission Types
// ============================================

export interface CampaignPermissions {
  isMaster: boolean
  isPlayer: boolean
  canEdit: boolean
  canDelete: boolean
}
