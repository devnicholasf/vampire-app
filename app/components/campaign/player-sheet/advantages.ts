import type { AdvantageItem, AdvantagesData } from '~/config/advantagesData'

export interface AdvantageFormEntry {
  category?: string
  type?: string
  name?: string
}

export type AdvantageCategoryKey = '' | 'antecedentes' | 'loresheets' | 'meritos' | 'defeitos'
export type AdvantageTypeKey = '' | 'fisicos' | 'mentais' | 'sociais' | 'sobrenaturais' | 'sangue_ralo'

export const getSubcategoryOptions = (category: string, generation: number): string[] => {
  if (category !== 'Mérito' && category !== 'Defeito') return []

  const options = ['Físico', 'Mental', 'Social', 'Sobrenatural']
  if (generation >= 14 && generation <= 16) {
    options.push('Sangue Ralo')
  }

  return options
}

export const normalizeCategoryKey = (category: string): AdvantageCategoryKey => {
  const map: Record<string, AdvantageCategoryKey> = {
    Antecedente: 'antecedentes',
    'Folha de Lore': 'loresheets',
    Mérito: 'meritos',
    Defeito: 'defeitos'
  }

  return map[category] || ''
}

export const normalizeTypeKey = (type: string): AdvantageTypeKey => {
  const map: Record<string, AdvantageTypeKey> = {
    Físico: 'fisicos',
    Mental: 'mentais',
    Social: 'sociais',
    Sobrenatural: 'sobrenaturais',
    'Sangue Ralo': 'sangue_ralo'
  }

  return map[type] || ''
}

export const shouldShowTypeDropdown = (category: string): boolean => {
  return category === 'Mérito' || category === 'Defeito'
}

export const getNameOptions = (adv: AdvantageFormEntry, data: AdvantagesData): string[] => {
  const category = adv.category || ''
  const type = adv.type || ''

  if (!category) return []

  const categoryKey = normalizeCategoryKey(category)

  if (categoryKey === 'antecedentes') return data.antecedentes
  if (categoryKey === 'loresheets') return data.loresheets

  if (categoryKey === 'meritos' && type) {
    const typeKey = normalizeTypeKey(type)
    if (!typeKey) return []
    const items = data.meritos[typeKey as keyof AdvantagesData['meritos']] || []
    return items.map((item: AdvantageItem) => item.nome)
  }

  if (categoryKey === 'defeitos' && type) {
    const typeKey = normalizeTypeKey(type)
    if (!typeKey) return []
    const items = data.defeitos[typeKey as keyof AdvantagesData['defeitos']] || []
    return items.map((item: AdvantageItem) => item.nome)
  }

  return []
}

export const findAdvantageItem = (adv: AdvantageFormEntry, data: AdvantagesData): AdvantageItem | undefined => {
  const categoryKey = normalizeCategoryKey(adv.category || '')
  const typeKey = normalizeTypeKey(adv.type || '')
  const name = adv.name || ''

  if (!name) return undefined
  if ((categoryKey !== 'meritos' && categoryKey !== 'defeitos') || !typeKey) return undefined

  const list = categoryKey === 'meritos'
    ? data.meritos[typeKey as keyof AdvantagesData['meritos']]
    : data.defeitos[typeKey as keyof AdvantagesData['defeitos']]

  return (list || []).find((item: AdvantageItem) => item.nome === name)
}
