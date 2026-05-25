/**
 * Mapeamento de especialidades de habilidades para tipos de predadores
 * Indica em qual categoria (talents/skills/knowledges) e qual habilidade a especialidade deve ser injetada
 */
export interface SpecialtyMappingEntry {
  category: 'talents' | 'skills' | 'knowledges'
  skill: string
}

export const specialtyMapping: Record<string, SpecialtyMappingEntry> = {
  // Consensualista
  'Medicina (Flebotomia)': { category: 'knowledges', skill: 'medicine' },
  'Persuasão (Bolsas)': { category: 'skills', skill: 'persuasion' },
  
  // Fazendeiro
  'Empatia com animais (Animal Específico)': { category: 'skills', skill: 'animalKen' },
  'Sobrevivência (Caça)': { category: 'talents', skill: 'survival' },
  
  // Osiris
  'Ocultismo (Tradição Específica)': { category: 'knowledges', skill: 'occult' },
  'Performance (Campo específico)': { category: 'skills', skill: 'performance' },
  
  // Sacoleiro
  'Ladroagem (Abrir Fechaduras)': { category: 'talents', skill: 'larceny' },
  'Manha (Mercado Negro)': { category: 'skills', skill: 'streetwise' },
  
  // Sandman
  'Medicina (Anestésicos)': { category: 'knowledges', skill: 'medicine' },
  'Furtividade (Invasão)': { category: 'talents', skill: 'stealth' },
  
  // Sanguessuga
  'Briga (Membros)': { category: 'talents', skill: 'brawl' },
  'Furtividade (Contra Membros)': { category: 'talents', skill: 'stealth' },
  
  // Scene Queen
  'Etiqueta (Cena Específica)': { category: 'skills', skill: 'etiquette' },
  'Liderança (Cena Específica)': { category: 'skills', skill: 'leadership' },
  'Manha (Cena Específica)': { category: 'skills', skill: 'streetwise' },
  
  // Sereia
  'Persuasão (Sedução)': { category: 'skills', skill: 'persuasion' },
  'Subterfúgio (Sedução)': { category: 'skills', skill: 'subterfuge' },
  
  // Trinchador
  'Persuasão (Gaslighting)': { category: 'skills', skill: 'persuasion' },
  'Subterfúgio (Encobrimento)': { category: 'skills', skill: 'subterfuge' },
  
  // Vira-Lata
  'Intimidação (Assalto à Mão Armada)': { category: 'skills', skill: 'intimidation' },
  'Briga (Agarramento)': { category: 'talents', skill: 'brawl' }
}
