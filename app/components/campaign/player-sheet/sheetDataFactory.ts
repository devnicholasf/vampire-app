import {
  hasMeaningfulAdvantage,
  hasMeaningfulDiscipline,
  normalizeAdvantageEntry,
  normalizeDisciplineEntry,
  normalizeSheetAttributes
} from '~/components/campaign/player-sheet/normalizers'

interface PlayerRecord {
  character_name?: string
  characterName?: string
  sheet?: any
}

interface ClanBaneMap {
  [key: string]: string
}

export const createInitialPlayerSheetData = (player: PlayerRecord, clanBanes: ClanBaneMap) => {
  const playerSheet = player.sheet || {}

  return {
    name: player.character_name || player.characterName || '',
    concept: playerSheet.concept || '',
    clan: playerSheet.clan || '',
    generation: playerSheet.generation || 13,
    sect: playerSheet.sect || '',
    predator: playerSheet.predator || '',
    ambition: playerSheet.ambition || '',
    desire: playerSheet.desire || '',
    sire: playerSheet.sire || '',
    player: playerSheet.player || '',
    avatar: playerSheet.avatar || '',

    resonance: playerSheet.resonance || '',
    resonanceIntensity: playerSheet.resonanceIntensity || '',
    resonanceDetails: playerSheet.resonanceDetails || '',
    touchstonesConvictions: Array.isArray(playerSheet.touchstonesConvictions)
      ? playerSheet.touchstonesConvictions
      : (playerSheet.touchstonesConvictions
          ? [{ conviction: playerSheet.touchstonesConvictions, pillar: '' }]
          : []),
    clanBane: playerSheet.clanBane || (playerSheet.clan && clanBanes[playerSheet.clan]) || '',
    advantages: Array.isArray(playerSheet.advantages)
      ? playerSheet.advantages.map(normalizeAdvantageEntry).filter(hasMeaningfulAdvantage)
      : [],
    bloodPotency: playerSheet.bloodPotency || 0,
    bloodSurge: playerSheet.bloodSurge || '+2',
    powerBonus: playerSheet.powerBonus || '0',
    feedingPenalty: playerSheet.feedingPenalty || 'Sem Penalidade',
    baneSeverity: playerSheet.baneSeverity || '0',
    xpTotal: playerSheet.xpTotal || 0,
    xpSpent: playerSheet.xpSpent || 0,
    embraceGeneration: playerSheet.embraceGeneration || '',
    appearance: playerSheet.appearance || '',
    distinguishingFeatures: playerSheet.distinguishingFeatures || '',
    history: playerSheet.history || '',

    attributes: normalizeSheetAttributes(playerSheet.attributes),
    skills: playerSheet.skills || {
      talents: { melee: 1, firearms: 1, athletics: 1, brawl: 1, drive: 1, stealth: 1, larceny: 1, craft: 1, survival: 1 },
      skills: { animalKen: 1, etiquette: 1, intimidation: 1, leadership: 1, streetwise: 1, performance: 1, persuasion: 1, awareness: 1, subterfuge: 1 },
      knowledges: { science: 1, academics: 1, finance: 1, investigation: 1, medicine: 1, occult: 1, perception: 1, politics: 1, technology: 1 }
    },
    skillSpecialties: playerSheet.skillSpecialties || {
      talents: {},
      skills: {},
      knowledges: {}
    },
    disciplines: Array.isArray(playerSheet.disciplines)
      ? playerSheet.disciplines.map(normalizeDisciplineEntry).filter(hasMeaningfulDiscipline)
      : [],
    humanity: playerSheet.humanity || 1,
    willpower: playerSheet.willpower || 1,
    vitality: playerSheet.vitality || 1,
    hunger: playerSheet.hunger ?? 1,
    conditions: playerSheet.conditions?.length > 0 ? playerSheet.conditions : ['']
  }
}
