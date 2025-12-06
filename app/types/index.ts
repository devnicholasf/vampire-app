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
  image?: string
  clan?: VampireClan
  description: string
  stats?: {
    health?: number
    willpower?: number
    disciplines?: string[]
  }
  notes?: string // Notas privadas do mestre
  createdAt: Date
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
