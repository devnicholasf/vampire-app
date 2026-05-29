// ============================================
// VTM V5 Dice Engine - REVISADO E CORRIGIDO
// Sistema de Rolagem Vampire The Masquerade V5
// ============================================
// MATEMÁTICA CORRIGIDA:
// - rollD10(): Math.floor(Math.random() * 10) + 1 = 1~10 ✓
// - Sucesso: 6~10 = 50% de chance ✓
// - Par de 10: 4 sucessos TOTAIS (2 dos 10s + 2 extras) ✓
// - Fome SUBSTITUI dados normais, não soma ✓
// ============================================

import type { DiceRollConfig, DiceResult, RollResult, RouseCheckResult } from '~/types/dice'

// ============================================
// 1. FUNÇÕES PURAS DE RNG
// ============================================

/**
 * Rola um único dado de 10 faces
 * GARANTIDO: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
 * Chance de sucesso (6+): 50%
 */
function rolarD10(): number {
  return Math.floor(Math.random() * 10) + 1
}

/**
 * Rola uma parada de dados (pool)
 * Retorna array vazio se count <= 0
 */
function rolarPoolDados(count: number): number[] {
  if (count <= 0) return []
  return Array.from({ length: count }, () => rolarD10())
}

// ============================================
// 2. FUNÇÕES PURAS DE CÁLCULO
// ============================================

/**
 * Calcula sucessos básicos (6, 7, 8, 9, 10 = sucesso)
 * 1~5 = falha
 * 6~9 = 1 sucesso
 * 10 = 1 sucesso (críticos são calculados separadamente)
 */
function calcularSucessos(dice: number[]): number {
  return dice.filter(d => d >= 6).length
}

/**
 * Detecta pares de 10 (crítico)
 * CADA PAR = 4 sucessos TOTAIS
 * - Os dois 10s já contam como 2 sucessos
 * - O par adiciona +2 sucessos EXTRAS
 * - Total: 2 + 2 = 4 sucessos por par
 */
function detectarCriticos(dice: number[]): { 
  pares: number
  dezsSoltas: number 
} {
  const totalDezs = dice.filter(d => d === 10).length
  const pares = Math.floor(totalDezs / 2)
  const dezsSoltas = totalDezs % 2
  
  return { pares, dezsSoltas }
}

/**
 * Verifica Messy Critical (crítico COM 10 de fome)
 */
function verificarCriticoBrutal(hungerDice: number[], temCritico: boolean): boolean {
  return temCritico && hungerDice.some(d => d === 10)
}

/**
 * Verifica Bestial Failure (0 sucessos COM 1 de fome)
 */
function verificarFalhaBestial(hungerDice: number[], sucessosTotais: number): boolean {
  return sucessosTotais === 0 && hungerDice.some(d => d === 1)
}

/**
 * Calcula sucessos totais finais
 * FÓRMULA CORRETA:
 * Total = sucessos_normais + sucessos_fome + (pares_de_10 × 2_extras)
 */
function calcularResultadoFinal(params: {
  normalSuccesses: number
  hungerSuccesses: number
  criticalPairs: number
}): number {
  const { normalSuccesses, hungerSuccesses, criticalPairs } = params
  
  // Cada par de 10 adiciona +2 sucessos EXTRAS (não +3!)
  // Os 10s já foram contados como sucessos normais
  const extraSuccesses = criticalPairs * 2
  
  return normalSuccesses + hungerSuccesses + extraSuccesses
}

// ============================================
// 3. MOTOR PRINCIPAL
// ============================================

/**
 * Executa rolagem completa com logs detalhados
 */
export function performRoll(config: DiceRollConfig): {
  diceResults: DiceResult
  successes: number
  isCritical: boolean
  isMessyCritical: boolean
  isBestialFailure: boolean
  description: string
} {
  const { hunger, modifier } = config
  
  // 🎯 PASSO 1: Calcular pool total
  const basePool = calculatePoolSize(
    config.attribute,
    config.skill,
    config.attributeValue,
    config.skillValue
  )
  const totalPool = Math.max(1, basePool + modifier)
  
  // 🎯 PASSO 2: Dividir entre dados normais e de fome
  // IMPORTANTE: Fome SUBSTITUI dados normais, não soma!
  const normalCount = Math.max(0, totalPool - hunger)
  const hungerCount = Math.min(hunger, totalPool)
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎲 [DiceEngine] NOVA ROLAGEM')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Pool:', { 
    base: basePool, 
    modifier, 
    total: totalPool,
    fome: hunger,
    '→ normais': normalCount,
    '→ fome': hungerCount
  })
  
  // 🎯 PASSO 3: Rolar dados
  const normalDice = rolarPoolDados(normalCount)
  const hungerDice = rolarPoolDados(hungerCount)
  
  console.log('🎲 Dados:', { 
    normais: normalDice, 
    fome: hungerDice 
  })
  
  // 🎯 PASSO 4: Calcular sucessos básicos
  const normalSuccesses = calcularSucessos(normalDice)
  const hungerSuccesses = calcularSucessos(hungerDice)
  
  console.log('✓ Sucessos básicos:', {
    normais: normalSuccesses,
    fome: hungerSuccesses,
    subtotal: normalSuccesses + hungerSuccesses
  })
  
  // 🎯 PASSO 5: Detectar críticos (pares de 10)
  const allDice = [...normalDice, ...hungerDice]
  const { pares, dezsSoltas } = detectarCriticos(allDice)
  const isCritical = pares > 0
  
  console.log('⭐ Críticos:', {
    pares_de_10: pares,
    dezs_soltas: dezsSoltas,
    extras_por_par: pares * 2,
    tem_critico: isCritical
  })
  
  // 🎯 PASSO 6: Calcular total CORRETO
  const totalSuccesses = calcularResultadoFinal({
    normalSuccesses,
    hungerSuccesses,
    criticalPairs: pares
  })
  
  // 🎯 PASSO 7: Verificar condições especiais
  const isMessyCritical = verificarCriticoBrutal(hungerDice, isCritical)
  const isBestialFailure = verificarFalhaBestial(hungerDice, totalSuccesses)
  
  console.log('🎯 RESULTADO FINAL:', {
    sucessos_totais: totalSuccesses,
    critico: isCritical,
    critico_brutal: isMessyCritical,
    falha_bestial: isBestialFailure
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // 🎯 PASSO 8: Gerar descrição
  const description = generateDescription({
    totalSuccesses,
    isCritical,
    isMessyCritical,
    isBestialFailure,
    difficulty: config.difficulty
  })
  
  return {
    diceResults: {
      normal: normalDice,
      hunger: hungerDice
    },
    successes: totalSuccesses,
    isCritical,
    isMessyCritical,
    isBestialFailure,
    description
  }
}

// ============================================
// 4. FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcula tamanho da pool baseado em atributo + habilidade
 * TODO: Integrar com sistema de fichas
 */
function calculatePoolSize(
  attribute: string,
  skill: string,
  attributeValue?: number,
  skillValue?: number
): number {
  if (Number.isFinite(attributeValue) && Number.isFinite(skillValue)) {
    return Math.max(0, Number(attributeValue) + Number(skillValue))
  }

  // Fallback legado para fluxos que ainda não enviam os valores resolvidos
  return 5
}

/**
 * Teste de Despertar (Rouse Check)
 */
export function performRouseCheck(currentHunger: number): RouseCheckResult {
  const diceValue = rolarD10()
  const success = diceValue >= 6
  
  return {
    diceValue,
    hungerIncreased: !success,
    newHunger: success ? currentHunger : Math.min(5, currentHunger + 1)
  }
}

// ============================================
// 5. TESTE ESTATÍSTICO
// ============================================

/**
 * Executa 10.000 rolagens simuladas para validar RNG
 * USO: testeEstatistico() no console do navegador
 */
export function testeEstatistico(config: {
  pool?: number
  hunger?: number
  iterations?: number
} = {}) {
  const { pool = 5, hunger = 2, iterations = 10000 } = config
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 TESTE ESTATÍSTICO DO RNG')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🎲 Pool: ${pool} | Fome: ${hunger} | Iterações: ${iterations}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const results = {
    totalRolls: iterations,
    totalSuccesses: 0,
    failures: 0,
    anySuccess: 0,
    criticals: 0,
    messyCriticals: 0,
    bestialFailures: 0,
    
    // Distribuição de valores de dados (1-10)
    diceDistribution: new Array(10).fill(0),
    
    // Distribuição de sucessos por rolagem
    successDistribution: new Map<number, number>()
  }
  
  // Executar simulações
  for (let i = 0; i < iterations; i++) {
    // Rolar dados
    const normalCount = Math.max(0, pool - hunger)
    const hungerCount = Math.min(hunger, pool)
    
    const normalDice = rolarPoolDados(normalCount)
    const hungerDice = rolarPoolDados(hungerCount)
    const allDice = [...normalDice, ...hungerDice]
    
    // Registrar distribuição de valores
    allDice.forEach(value => {
      results.diceDistribution[value - 1]++
    })
    
    // Calcular resultado
    const normalSuccesses = calcularSucessos(normalDice)
    const hungerSuccesses = calcularSucessos(hungerDice)
    const { pares } = detectarCriticos(allDice)
    const totalSuccesses = calcularResultadoFinal({
      normalSuccesses,
      hungerSuccesses,
      criticalPairs: pares
    })
    
    // Condições especiais
    const isCritical = pares > 0
    const isMessyCritical = verificarCriticoBrutal(hungerDice, isCritical)
    const isBestialFailure = verificarFalhaBestial(hungerDice, totalSuccesses)
    
    // Acumular estatísticas
    results.totalSuccesses += totalSuccesses
    if (totalSuccesses === 0) results.failures++
    if (totalSuccesses > 0) results.anySuccess++
    if (isCritical) results.criticals++
    if (isMessyCritical) results.messyCriticals++
    if (isBestialFailure) results.bestialFailures++
    
    // Distribuição de sucessos
    const count = results.successDistribution.get(totalSuccesses) || 0
    results.successDistribution.set(totalSuccesses, count + 1)
  }
  
  // Calcular porcentagens
  const avgSuccesses = results.totalSuccesses / iterations
  const failureRate = (results.failures / iterations) * 100
  const successRate = (results.anySuccess / iterations) * 100
  const criticalRate = (results.criticals / iterations) * 100
  const messyRate = (results.messyCriticals / iterations) * 100
  const bestialRate = (results.bestialFailures / iterations) * 100
  
  // Calcular % teórica de sucesso por dado (deveria ser 50%)
  const totalDiceRolled = iterations * pool
  const totalDiceSuccesses = results.diceDistribution.slice(5).reduce((a, b) => a + b, 0)
  const actualSuccessChance = (totalDiceSuccesses / totalDiceRolled) * 100
  
  // Mostrar resultados
  console.log('📈 RESULTADOS:')
  console.log('─────────────────────────────────────────')
  console.log(`✓ Taxa de sucesso geral: ${successRate.toFixed(2)}%`)
  console.log(`✗ Taxa de falha geral: ${failureRate.toFixed(2)}%`)
  console.log(`📊 Média de sucessos/rolagem: ${avgSuccesses.toFixed(2)}`)
  console.log(`⭐ Taxa de crítico: ${criticalRate.toFixed(2)}%`)
  console.log(`⚠️  Taxa de crítico brutal: ${messyRate.toFixed(2)}%`)
  console.log(`🩸 Taxa de falha bestial: ${bestialRate.toFixed(2)}%`)
  console.log('')
  
  console.log('🎲 VALIDAÇÃO DO RNG:')
  console.log('─────────────────────────────────────────')
  console.log(`🎯 Chance de sucesso por dado: ${actualSuccessChance.toFixed(2)}%`)
  console.log(`   Esperado: 50% (valores 6-10)`)
  
  const deviation = Math.abs(actualSuccessChance - 50)
  if (deviation < 1) {
    console.log(`   ✅ PERFEITO! Desvio: ${deviation.toFixed(2)}%`)
  } else if (deviation < 2) {
    console.log(`   ✅ ÓTIMO! Desvio: ${deviation.toFixed(2)}%`)
  } else if (deviation < 5) {
    console.log(`   ⚠️  ACEITÁVEL. Desvio: ${deviation.toFixed(2)}%`)
  } else {
    console.log(`   ❌ PROBLEMA! Desvio: ${deviation.toFixed(2)}%`)
  }
  console.log('')
  
  console.log('📊 DISTRIBUIÇÃO DE VALORES (1-10):')
  console.log('─────────────────────────────────────────')
  const expectedPerValue = (100 / 10)
  results.diceDistribution.forEach((count, index) => {
    const value = index + 1
    const percentage = (count / totalDiceRolled) * 100
    const bar = '█'.repeat(Math.round(percentage * 2))
    const status = value >= 6 ? '✓' : '✗'
    console.log(`${status} ${value.toString().padStart(2)}: ${bar} ${percentage.toFixed(1)}% (${count})`)
  })
  console.log(`   Esperado: ~${expectedPerValue.toFixed(1)}% por valor`)
  console.log('')
  
  console.log('📊 DISTRIBUIÇÃO DE SUCESSOS POR ROLAGEM:')
  console.log('─────────────────────────────────────────')
  const sortedSuccesses = Array.from(results.successDistribution.entries()).sort((a, b) => a[0] - b[0])
  sortedSuccesses.forEach(([successes, count]) => {
    const percentage = (count / iterations) * 100
    const bar = '█'.repeat(Math.round(percentage / 2))
    console.log(`${successes.toString().padStart(2)} sucessos: ${bar} ${percentage.toFixed(1)}% (${count}x)`)
  })
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ TESTE CONCLUÍDO!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  return {
    avgSuccesses,
    successRate,
    failureRate,
    criticalRate,
    messyRate,
    bestialRate,
    actualSuccessChance,
    deviation
  }
}

// ============================================
// 6. GERAÇÃO DE DESCRIÇÕES E FORMATAÇÃO
// ============================================

/**
 * Gera descrição narrativa do resultado
 */
function generateDescription(params: {
  totalSuccesses: number
  isCritical: boolean
  isMessyCritical: boolean
  isBestialFailure: boolean
  difficulty: number
}): string {
  const { totalSuccesses, isCritical, isMessyCritical, isBestialFailure, difficulty } = params
  
  if (isBestialFailure) {
    return '🩸 A Besta assume o controle. Falha total com consequências terríveis.'
  }
  
  if (isMessyCritical) {
    return '⚠️ Sucesso extraordinário, mas a Fome cobra seu preço. Algo sai do controle...'
  }
  
  if (isCritical) {
    return '✨ Sucesso crítico! Execução perfeita e magistral.'
  }
  
  const margin = totalSuccesses - difficulty
  
  if (totalSuccesses === 0) {
    return '❌ Falha total. Nenhum sucesso obtido.'
  }
  
  if (margin < 0) {
    return `❌ Falha. ${totalSuccesses} sucesso(s), mas precisava de ${difficulty}.`
  }
  
  if (margin === 0) {
    return `✓ Sucesso marginal. Conseguiu exatamente o necessário.`
  }
  
  if (margin <= 2) {
    return `✓ Sucesso. ${totalSuccesses} sucesso(s) obtidos.`
  }
  
  return `✓✓ Sucesso excepcional! ${totalSuccesses} sucessos — muito além do necessário.`
}

/**
 * Compara duas rolagens (para rolagens resistidas)
 */
export function compareRolls(roll1Successes: number, roll2Successes: number): {
  winner: 'attacker' | 'defender' | 'tie'
  margin: number
} {
  const margin = roll1Successes - roll2Successes
  
  if (margin > 0) return { winner: 'attacker', margin }
  if (margin < 0) return { winner: 'defender', margin: Math.abs(margin) }
  return { winner: 'tie', margin: 0 }
}

/**
 * Formata resultado para exibição
 */
export function formatDiceDisplay(dice: number[]): string {
  return dice
    .sort((a, b) => b - a)
    .map(d => {
      if (d === 10) return '⑩'
      if (d >= 6) return `⑥`
      return `①`
    })
    .join(' • ')
}

/**
 * Calcula cor do dado baseado no valor
 */
export function getDiceColor(value: number, isHunger: boolean): string {
  if (isHunger) {
    if (value === 10) return 'text-red-400 glow-red'
    if (value === 1) return 'text-red-900 animate-pulse'
    if (value >= 6) return 'text-red-500'
    return 'text-red-800/60'
  }
  
  if (value === 10) return 'text-yellow-400 glow-gold'
  if (value >= 6) return 'text-white'
  return 'text-gray-600'
}

// ============================================
// 7. EXPORTS PARA TESTES
// ============================================

// Exportar funções internas para testes (opcional)
export const __test__ = {
  rolarD10,
  rolarPoolDados,
  calcularSucessos,
  detectarCriticos,
  verificarCriticoBrutal,
  verificarFalhaBestial,
  calcularResultadoFinal
}
