export interface NormalizedDiscipline {
  name: string
  level: number
}

export interface NormalizedAdvantage {
  category: string
  type: string
  name: string
  level: number
  details: string
  fixo: boolean
  maxLevel: number
}

export const normalizeSheetAttributes = (attributes: any) => {
  const physical = attributes?.physical || {}
  const social = attributes?.social || {}
  const mental = attributes?.mental || {}

  const resolveAttributeValue = (primary: any, legacy: any) => {
    const primaryValue = Number(primary)
    if (Number.isFinite(primaryValue) && primaryValue >= 1) return primaryValue

    const legacyValue = Number(legacy)
    if (Number.isFinite(legacyValue) && legacyValue >= 1) return legacyValue

    return 1
  }

  return {
    physical: {
      strength: Number(physical.strength ?? 1),
      dexterity: Number(physical.dexterity ?? 1),
      stamina: Number(physical.stamina ?? 1)
    },
    social: {
      charisma: Number(social.charisma ?? 1),
      manipulation: Number(social.manipulation ?? 1),
      composure: resolveAttributeValue(social.composure, social.appearance)
    },
    mental: {
      intelligence: Number(mental.intelligence ?? 1),
      wits: Number(mental.wits ?? 1),
      resolve: resolveAttributeValue(mental.resolve, mental.perception)
    }
  }
}

export const normalizeDisciplineEntry = (discipline: any): NormalizedDiscipline => ({
  name: discipline?.name || '',
  level: typeof discipline?.level === 'number' ? discipline.level : 0
})

export const hasMeaningfulDiscipline = (discipline: any): boolean => {
  if (!discipline) return false
  return Boolean(String(discipline.name || '').trim()) || Number(discipline.level || 0) > 0
}

export const normalizeAdvantageEntry = (adv: any): NormalizedAdvantage => ({
  category: adv?.category || '',
  type: adv?.type || '',
  name: adv?.name || '',
  level: typeof adv?.level === 'number' ? adv.level : 0,
  details: adv?.details || '',
  fixo: Boolean(adv?.fixo),
  maxLevel: typeof adv?.maxLevel === 'number' ? adv.maxLevel : 5
})

export const hasMeaningfulAdvantage = (adv: any): boolean => {
  if (!adv) return false
  if (adv.fixo) return Boolean(String(adv.name || '').trim())

  return (
    Boolean(String(adv.category || '').trim()) ||
    Boolean(String(adv.type || '').trim()) ||
    Boolean(String(adv.name || '').trim()) ||
    Boolean(String(adv.details || '').trim()) ||
    Number(adv.level || 0) > 0
  )
}
