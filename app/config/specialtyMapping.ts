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
  'Empatia com Animais (Animais Específicos)': { category: 'skills', skill: 'animalKen' },
  'Persuasão (Agricultores)': { category: 'skills', skill: 'persuasion' },
  
  // Osiris
  'Ocultismo (Tradição Específica)': { category: 'knowledges', skill: 'occult' },
  'Performance (Campo específico)': { category: 'skills', skill: 'performance' },
  
  // Sacoleiro
  'Intimidação (Barganhar)': { category: 'skills', skill: 'intimidation' },
  'Manha (Comércio Negro)': { category: 'skills', skill: 'streetwise' },
  
  // Sandman
  'Medicina (Anestesia)': { category: 'knowledges', skill: 'medicine' },
  'Furtividade (Invasão de Propriedade)': { category: 'talents', skill: 'stealth' },
  
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
  'Sobrevivência (Nas Ruas)': { category: 'talents', skill: 'survival' },
  'Manha (Ruas)': { category: 'skills', skill: 'streetwise' }
}
