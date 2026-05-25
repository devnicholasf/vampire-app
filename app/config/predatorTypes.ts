/**
 * Configuração completa dos Tipos de Predador para Vampiro: A Máscara V5
 * Define as características, bônus e penalidades de cada tipo de predador
 */

export interface PredatorAdvantage {
  category: string
  type: string
  name: string
  level: number
  details: string
  fixo: boolean
}

export interface PredatorConfig {
  humanityChange: number
  bloodPotencyChange?: number
  restrictedClans?: string[]
  choices: {
    discipline?: string[]
    disciplineRestriction?: Record<string, string>
    specialty?: string[]
    specialtyCustomInput?: string[]
    merit?: string[]
    flaw?: string[]
    pointDistribution?: {
      type: 'backgrounds' | 'flaws'
      total: number
      options: string[]
    }
    flawDistribution?: {
      type: 'backgrounds' | 'flaws'
      total: number
      options: string[]
    }
  }
  fixedAdvantages: PredatorAdvantage[]
}

export const predatorTypes: Record<string, PredatorConfig> = {
  'Consensualista': {
    humanityChange: 1,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Auspícios', 'Fortitude'],
      specialty: ['Medicina (Flebotomia)', 'Persuasão (Bolsas)']
    },
    fixedAdvantages: [
      { category: 'Defeito', type: 'Social', name: 'Segredo Sombrio', level: 1, details: 'Quebrador da Máscara', fixo: true },
      { category: 'Defeito', type: 'Físico', name: 'Alimentação', level: 1, details: 'Exclusão de presa (sem consentimento)', fixo: true }
    ]
  },
  
  'Fazendeiro': {
    humanityChange: 1,
    bloodPotencyChange: 0,
    restrictedClans: ['Ventrue'],
    choices: {
      discipline: ['Animalismo', 'Proteanismo'],
      specialty: ['Empatia com animais (Animal Específico)', 'Sobrevivência (Caça)'],
      specialtyCustomInput: ['Empatia com animais (Animal Específico)']
    },
    fixedAdvantages: [
      { category: 'Defeito', type: 'Físico', name: 'Alimentação', level: 2, details: 'Fazendeiro', fixo: true }
    ]
  },
  
  'Osiris': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Feitiçaria de Sangue', 'Presença'],
      disciplineRestriction: { 'Feitiçaria de Sangue': 'Tremere' },
      specialty: ['Ocultismo (Tradição Específica)', 'Performance (Campo específico)'],
      specialtyCustomInput: ['Ocultismo (Tradição Específica)', 'Performance (Campo específico)'],
      pointDistribution: {
        type: 'backgrounds',
        total: 3,
        options: ['Fama', 'Rebanho']
      },
      flawDistribution: {
        type: 'flaws',
        total: 2,
        options: ['Inimigo', 'Inimigo Mítico']
      }
    },
    fixedAdvantages: []
  },
  
  'Sacoleiro': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: ['Ventrue'],
    choices: {
      discipline: ['Feitiçaria de Sangue', 'Ofuscação'],
      disciplineRestriction: { 'Feitiçaria de Sangue': 'Tremere' },
      specialty: ['Ladroagem (Abrir Fechaduras)', 'Manha (Mercado Negro)']
    },
    fixedAdvantages: [
      { category: 'Mérito', type: 'Físico', name: 'Alimentação', level: 3, details: 'Esôfago de Ferro', fixo: true },
      { category: 'Defeito', type: 'Social', name: 'Inimigo', level: 2, details: 'Alguém acredita que você lhe deve ou há outro motivo para ficar fora das ruas', fixo: true }
    ]
  },
  
  'Sandman': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Auspícios', 'Ofuscação'],
      specialty: ['Medicina (Anestésicos)', 'Furtividade (Invasão)']
    },
    fixedAdvantages: [
      { category: 'Antecedente', type: '', name: 'Recursos', level: 1, details: '', fixo: true }
    ]
  },
  
  'Sanguessuga': {
    humanityChange: -1,
    bloodPotencyChange: 1,
    restrictedClans: [],
    choices: {
      discipline: ['Celeridade', 'Proteanismo'],
      specialty: ['Briga (Membros)', 'Furtividade (Contra Membros)'],
      flaw: ['Segredo Sombrio (Diablerista)', 'Segregado']
    },
    fixedAdvantages: [
      { category: 'Defeito', type: 'Físico', name: 'Alimentação', level: 2, details: 'Exclusão de Presa (mortais)', fixo: true }
    ]
  },
  
  'Scene Queen': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Dominação', 'Potência'],
      specialty: ['Etiqueta (Cena Específica)', 'Liderança (Cena Específica)', 'Manha (Cena Específica)'],
      specialtyCustomInput: ['Etiqueta (Cena Específica)', 'Liderança (Cena Específica)', 'Manha (Cena Específica)'],
      flaw: ['Influência (Rejeitado)', 'Alimentação (Exclusão de Presa)']
    },
    fixedAdvantages: [
      { category: 'Antecedente', type: '', name: 'Fama', level: 1, details: '', fixo: true },
      { category: 'Antecedente', type: '', name: 'Contatos', level: 1, details: '', fixo: true }
    ]
  },
  
  'Sereia': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Fortitude', 'Presença'],
      specialty: ['Persuasão (Sedução)', 'Subterfúgio (Sedução)']
    },
    fixedAdvantages: [
      { category: 'Mérito', type: 'Físico', name: 'Visual', level: 2, details: 'Belo', fixo: true },
      { category: 'Defeito', type: 'Social', name: 'Inimigo', level: 1, details: 'Um amante desprezado ou parceiro ciumento', fixo: true }
    ]
  },
  
  'Trinchador': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Dominação', 'Animalismo'],
      specialty: ['Persuasão (Gaslighting)', 'Subterfúgio (Encobrimento)']
    },
    fixedAdvantages: [
      { category: 'Defeito', type: 'Social', name: 'Segredo Sombrio', level: 1, details: 'Trinchador', fixo: true },
      { category: 'Antecedente', type: '', name: 'Rebanho', level: 2, details: '', fixo: true }
    ]
  },
  
  'Vira-Lata': {
    humanityChange: -1,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Celeridade', 'Potência'],
      specialty: ['Intimidação (Assalto à Mão Armada)', 'Briga (Agarramento)']
    },
    fixedAdvantages: [
      { category: 'Antecedente', type: '', name: 'Contatos', level: 3, details: 'Contatos Criminosos', fixo: true }
    ]
  }
}
