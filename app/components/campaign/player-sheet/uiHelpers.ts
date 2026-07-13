interface AdvantageEntry {
  fixo?: boolean
  name?: string
  details?: string
}

export const isValidAdvantage = (adv: AdvantageEntry): boolean => {
  if (!adv.fixo) return true
  if (!adv.name || adv.name.trim() === '') return false

  if (adv.name === 'Especialidade' && adv.details && adv.details.includes('(') && adv.details.includes(')')) {
    return false
  }

  return true
}

export const getCustomSpecialtyPlaceholder = (specialty?: string): string => {
  if (!specialty) return ''
  if (specialty.includes('Performance')) return 'Ex: Música, Dança, Teatro...'
  if (specialty.includes('Cena Específica')) return 'Ex: Góticos, Clubbers, Cosplayers...'
  if (specialty.includes('Animal Específico')) return 'Ex: Lobos, Gatos, Ratos...'
  if (specialty.includes('Ocultismo')) return 'Ex: Hermetismo, Kabbalah, Vodu...'
  return 'Especifique...'
}

export const getInitials = (name: string): string => {
  if (!name) return 'P'

  const words = name.split(' ').filter((word: string) => word.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  return words[0]?.[0]?.toUpperCase() || 'P'
}
