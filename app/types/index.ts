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
  bio?: string // Biografia completa
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
  player: string
  attributes: {
    physical: { strength: number; dexterity: number; stamina: number }
    social: { charisma: number; manipulation: number; appearance: number }
    mental: { perception: number; intelligence: number; wits: number }
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
  healthLevels: boolean[]
  notes: string
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
