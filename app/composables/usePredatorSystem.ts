/**
 * Composable para gerenciar o sistema de Tipos de Predador V5
 * Centraliza toda a lógica de seleção, validação e aplicação de predadores
 */

import { ref, type Ref } from 'vue'
import { predatorTypes } from '~/config/predatorTypes'
import { specialtyMapping, type SpecialtyMappingEntry } from '~/config/specialtyMapping'

// ===== INTERFACES =====

export interface OriginalPredatorValues {
  humanity: number
  bloodPotency: number
  disciplinesSnapshot: Array<{ name: string, level: number }>
}

export interface AppliedPredatorData {
  predatorName: string
  humanityChange: number
  bloodPotencyChange?: number
  disciplineAdded?: string
  advantageIndices: number[]
}

export interface PredatorMetadata {
  predatorName: string
  humanityChange: number
  bloodPotencyChange: number
  disciplineAdded?: string
  fixedAdvantagesCount: number
}

export interface PredatorChoice {
  discipline?: string
  specialty?: string
  specialtyCustom?: string
  merit?: string
  flaw?: string
  backgroundPoints?: Record<string, number>
  flawPoints?: Record<string, number>
}

export interface PredatorModalData {
  title: string
  description: string
  choices: {
    discipline?: { options: string[]; restriction?: Record<string, string> }
    specialty?: { options: string[]; customInput?: string[] }
    merit?: { options: string[] }
    flaw?: { options: string[] }
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
}

// ===== COMPOSABLE =====

export function usePredatorSystem(
  sheetData: Ref<any>,
  clan: Ref<string>,
  canEdit: Ref<boolean>,
  toast: any
) {
  // Estados reativos
  const showPredatorModal = ref(false)
  const selectedPredatorType = ref('')
  const previousPredatorType = ref('')
  const selectedChoices = ref<PredatorChoice>({})
  const originalPredatorValues = ref<OriginalPredatorValues | null>(null)
  const appliedPredatorData = ref<AppliedPredatorData | null>(null)
  const snapshotInitialized = ref(false)
  
  const predatorModalData = ref<PredatorModalData>({
    title: '',
    description: '',
    choices: {}
  })

  // ===== FUNÇÕES DE VALIDAÇÃO =====

  const isDisciplineRestricted = (discipline: string): boolean => {
    const restriction = predatorModalData.value.choices.discipline?.restriction
    if (!restriction || !restriction[discipline]) return false
    return clan.value !== restriction[discipline]
  }

  const selectDiscipline = (discipline: string) => {
    if (!isDisciplineRestricted(discipline)) {
      selectedChoices.value.discipline = discipline
    }
  }

  const needsCustomSpecialtyInput = (specialty?: string): boolean => {
    if (!specialty) return false
    const customInputOptions = predatorModalData.value.choices.specialty?.customInput || []
    return customInputOptions.includes(specialty)
  }

  const canConfirmPredatorChoice = (): boolean => {
    const choices = predatorModalData.value.choices

    // Validar disciplina
    if (choices.discipline && !selectedChoices.value.discipline) return false

    // Validar especialidade
    if (choices.specialty && !selectedChoices.value.specialty) return false

    // Validar input customizado de especialidade
    if (selectedChoices.value.specialty && needsCustomSpecialtyInput(selectedChoices.value.specialty)) {
      if (!selectedChoices.value.specialtyCustom || selectedChoices.value.specialtyCustom.trim() === '') {
        return false
      }
    }

    // Validar merit
    if (choices.merit && !selectedChoices.value.merit) return false

    // Validar flaw
    if (choices.flaw && !selectedChoices.value.flaw) return false

    // Validar distribuição de pontos de backgrounds
    if (choices.pointDistribution) {
      const total = getTotalBackgroundPoints()
      if (total !== choices.pointDistribution.total) return false
    }

    // Validar distribuição de pontos de flaws
    if (choices.flawDistribution) {
      const total = getTotalFlawPoints()
      if (total !== choices.flawDistribution.total) return false
    }

    return true
  }

  // ===== FUNÇÕES DE PONTOS =====

  const getTotalBackgroundPoints = (): number => {
    if (!selectedChoices.value.backgroundPoints) return 0
    return Object.values(selectedChoices.value.backgroundPoints).reduce((sum, val) => sum + (val || 0), 0)
  }

  const getTotalFlawPoints = (): number => {
    if (!selectedChoices.value.flawPoints) return 0
    return Object.values(selectedChoices.value.flawPoints).reduce((sum, val) => sum + (val || 0), 0)
  }

  const getMaxBackgroundPoints = (option: string): number => {
    if (!predatorModalData.value.choices.pointDistribution) return 0
    const total = predatorModalData.value.choices.pointDistribution.total
    const currentTotal = getTotalBackgroundPoints()
    const currentValue = selectedChoices.value.backgroundPoints?.[option] || 0
    return total - (currentTotal - currentValue)
  }

  const validateBackgroundPoints = (option: string) => {
    const max = getMaxBackgroundPoints(option)
    if (!selectedChoices.value.backgroundPoints) {
      selectedChoices.value.backgroundPoints = {}
    }

    const currentValue = selectedChoices.value.backgroundPoints[option] || 0

    if (currentValue < 0) {
      selectedChoices.value.backgroundPoints[option] = 0
    }

    if (currentValue > max) {
      selectedChoices.value.backgroundPoints[option] = max
    }
  }

  const getMaxFlawPoints = (option: string): number => {
    if (!predatorModalData.value.choices.flawDistribution) return 0
    const total = predatorModalData.value.choices.flawDistribution.total
    const currentTotal = getTotalFlawPoints()
    const currentValue = selectedChoices.value.flawPoints?.[option] || 0
    return total - (currentTotal - currentValue)
  }

  const validateFlawPoints = (option: string) => {
    const max = getMaxFlawPoints(option)
    if (!selectedChoices.value.flawPoints) {
      selectedChoices.value.flawPoints = {}
    }

    const currentValue = selectedChoices.value.flawPoints[option] || 0

    if (currentValue < 0) {
      selectedChoices.value.flawPoints[option] = 0
    }

    if (currentValue > max) {
      selectedChoices.value.flawPoints[option] = max
    }
  }

  // ===== FUNÇÕES DE MODAL =====

  const openPredatorModal = (predatorType: string) => {
    const config = predatorTypes[predatorType as keyof typeof predatorTypes]
    if (!config) return

    // Verificar se o clã tem restrições
    if (config.restrictedClans && config.restrictedClans.includes(clan.value)) {
      toast.error(`Clã ${clan.value} não pode escolher o tipo de predador ${predatorType}`)
      sheetData.value.predator = previousPredatorType.value
      return
    }

    selectedPredatorType.value = predatorType

    // Preparar dados do modal
    predatorModalData.value = {
      title: predatorType,
      description: `Escolha as opções para o tipo de predador: ${predatorType}`,
      choices: {}
    }

    // Configurar escolhas de disciplina
    if (config.choices.discipline) {
      predatorModalData.value.choices.discipline = {
        options: config.choices.discipline,
        restriction: config.choices.disciplineRestriction
      }
    }

    // Configurar escolhas de especialidade
    if (config.choices.specialty) {
      predatorModalData.value.choices.specialty = {
        options: config.choices.specialty,
        customInput: config.choices.specialtyCustomInput
      }
    }

    // Configurar escolhas de merit
    if (config.choices.merit) {
      predatorModalData.value.choices.merit = {
        options: config.choices.merit
      }
    }

    // Configurar escolhas de flaw
    if (config.choices.flaw) {
      predatorModalData.value.choices.flaw = {
        options: config.choices.flaw
      }
    }

    // Configurar distribuição de pontos (Osiris)
    if (config.choices.pointDistribution) {
      predatorModalData.value.choices.pointDistribution = config.choices.pointDistribution

      // Inicializar pontos
      selectedChoices.value.backgroundPoints = {}
      config.choices.pointDistribution.options.forEach(option => {
        selectedChoices.value.backgroundPoints![option] = 0
      })
    }

    // Configurar distribuição de flaws (Osiris)
    if (config.choices.flawDistribution) {
      predatorModalData.value.choices.flawDistribution = config.choices.flawDistribution

      // Inicializar pontos de flaws
      selectedChoices.value.flawPoints = {}
      config.choices.flawDistribution.options.forEach(option => {
        selectedChoices.value.flawPoints![option] = 0
      })
    }

    // Resetar escolhas
    selectedChoices.value = {
      backgroundPoints: selectedChoices.value.backgroundPoints,
      flawPoints: selectedChoices.value.flawPoints
    }

    showPredatorModal.value = true
  }

  const cancelPredatorModal = () => {
    sheetData.value.predator = previousPredatorType.value
    showPredatorModal.value = false
    selectedChoices.value = {}
  }

  // ===== FUNÇÕES DE APLICAÇÃO =====

  const clearPreviousPredatorData = () => {
    console.log('🧹 clearPreviousPredatorData: Iniciando limpeza')

    // Limpar especialidades
    Object.keys(sheetData.value.skillSpecialties.talents).forEach(key => {
      delete sheetData.value.skillSpecialties.talents[key]
    })
    Object.keys(sheetData.value.skillSpecialties.skills).forEach(key => {
      delete sheetData.value.skillSpecialties.skills[key]
    })
    Object.keys(sheetData.value.skillSpecialties.knowledges).forEach(key => {
      delete sheetData.value.skillSpecialties.knowledges[key]
    })
    console.log('   ✅ Especialidades limpas')

    // Remover vantagens/defeitos fixos
    const advantagesBefore = sheetData.value.advantages.length
    sheetData.value.advantages = sheetData.value.advantages.filter((adv: any) => !adv.fixo)
    const advantagesAfter = sheetData.value.advantages.length
    console.log(`   ✅ Vantagens fixas removidas (${advantagesBefore} → ${advantagesAfter})`)

    // Restaurar valores originais
    if (originalPredatorValues.value) {
      console.log('🔄 Restaurando valores originais do snapshot:', JSON.stringify(originalPredatorValues.value))

      const oldHumanity = sheetData.value.humanity
      sheetData.value.humanity = originalPredatorValues.value.humanity
      console.log(`   ✅ Humanidade: ${oldHumanity} → ${sheetData.value.humanity}`)

      const oldBloodPotency = sheetData.value.bloodPotency
      sheetData.value.bloodPotency = originalPredatorValues.value.bloodPotency
      console.log(`   ✅ Potência Sangue: ${oldBloodPotency} → ${sheetData.value.bloodPotency}`)

      const oldDisciplines = JSON.stringify(sheetData.value.disciplines)
      sheetData.value.disciplines = originalPredatorValues.value.disciplinesSnapshot.map(d => ({
        name: d.name,
        level: Math.max(1, d.level)
      }))
      const newDisciplines = JSON.stringify(sheetData.value.disciplines)
      console.log(`   ✅ Disciplinas restauradas:`)
      console.log(`      Antes: ${oldDisciplines}`)
      console.log(`      Depois: ${newDisciplines}`)
      console.log(`      Snapshot: ${JSON.stringify(originalPredatorValues.value.disciplinesSnapshot)}`)
    } else {
      console.log('⚠️ Nenhum snapshot original encontrado! Não foi possível restaurar valores.')
    }

    appliedPredatorData.value = null
    delete (sheetData.value as any)._predatorMetadata
    console.log('🧹 clearPreviousPredatorData: Limpeza concluída')
  }

  const applyPredatorChoices = () => {
    const config = predatorTypes[selectedPredatorType.value as keyof typeof predatorTypes]
    if (!config) return

    console.log('🎯 Aplicando predador:', selectedPredatorType.value)
    console.log('📊 Estado ANTES de aplicar:')
    console.log('   - Humanidade:', sheetData.value.humanity)
    console.log('   - Potência Sangue:', sheetData.value.bloodPotency)
    console.log('   - Disciplinas:', JSON.stringify(sheetData.value.disciplines))
    console.log('   - Snapshot original existe?', !!originalPredatorValues.value)

    if (originalPredatorValues.value) {
      console.log('   - Snapshot BASE:', JSON.stringify(originalPredatorValues.value))
    }

    // Salvar snapshot BASE se não existir
    if (!originalPredatorValues.value) {
      console.log('⚠️ Snapshot original não existe! Salvando agora (ficha nova sem predador)')
      originalPredatorValues.value = {
        humanity: sheetData.value.humanity,
        bloodPotency: sheetData.value.bloodPotency,
        disciplinesSnapshot: sheetData.value.disciplines.map((d: any) => ({
          name: d.name,
          level: d.level
        }))
      }
      console.log('📸 Snapshot BASE salvo:', JSON.stringify(originalPredatorValues.value))
    }

    // Limpar predador anterior
    console.log('🧹 Limpando predador anterior antes de aplicar novo')
    clearPreviousPredatorData()

    console.log('📊 Estado DEPOIS de limpar:')
    console.log('   - Humanidade:', sheetData.value.humanity)
    console.log('   - Potência Sangue:', sheetData.value.bloodPotency)
    console.log('   - Disciplinas:', JSON.stringify(sheetData.value.disciplines))

    // Rastreamento
    const trackingData: AppliedPredatorData = {
      predatorName: selectedPredatorType.value,
      humanityChange: config.humanityChange,
      advantageIndices: []
    }

    // 1. Aplicar mudança de Humanidade
    if (config.humanityChange !== 0) {
      const newHumanity = sheetData.value.humanity + config.humanityChange
      sheetData.value.humanity = Math.max(0, Math.min(10, newHumanity))
    }

    // 2. Aplicar mudança de Potência de Sangue
    if (config.bloodPotencyChange && config.bloodPotencyChange !== 0) {
      const newBloodPotency = sheetData.value.bloodPotency + config.bloodPotencyChange
      sheetData.value.bloodPotency = Math.max(0, Math.min(10, newBloodPotency))
    }

    // 3. Adicionar disciplina escolhida
    if (selectedChoices.value.discipline) {
      trackingData.disciplineAdded = selectedChoices.value.discipline

      const existingDiscipline = sheetData.value.disciplines.find(
        (d: any) => d.name === selectedChoices.value.discipline
      )
      if (existingDiscipline) {
        existingDiscipline.level += 1
      } else {
        sheetData.value.disciplines.push({
          name: selectedChoices.value.discipline,
          level: 1
        })
      }
    }

    // 4. Injetar especialidade escolhida
    if (selectedChoices.value.specialty) {
      const mapping = specialtyMapping[selectedChoices.value.specialty]
      if (mapping) {
        let specialtyText = ''
        if (selectedChoices.value.specialtyCustom) {
          specialtyText = selectedChoices.value.specialtyCustom
        } else {
          specialtyText = selectedChoices.value.specialty.match(/\(([^)]+)\)/)?.[1] || selectedChoices.value.specialty
        }

        if (!sheetData.value.skillSpecialties[mapping.category]) {
          sheetData.value.skillSpecialties[mapping.category] = {}
        }
        sheetData.value.skillSpecialties[mapping.category][mapping.skill] = specialtyText
        console.log(`✅ Especialidade injetada: ${specialtyText} em ${mapping.category}.${mapping.skill}`)
      } else {
        console.warn(`⚠️ ATENÇÃO: Especialidade "${selectedChoices.value.specialty}" não encontrada no specialtyMapping!`)
      }
    }

    // 5. Adicionar vantagens fixas
    config.fixedAdvantages.forEach(adv => {
      const currentLength = sheetData.value.advantages.length
      sheetData.value.advantages.push({ ...adv })
      trackingData.advantageIndices.push(currentLength)
    })

    // 6. Distribuição de pontos de antecedentes (Osiris)
    if (config.choices.pointDistribution && selectedChoices.value.backgroundPoints) {
      Object.entries(selectedChoices.value.backgroundPoints).forEach(([name, points]) => {
        if (points && points > 0) {
          const currentLength = sheetData.value.advantages.length
          sheetData.value.advantages.push({
            category: 'Antecedente',
            type: '',
            name: name,
            level: points,
            details: '',
            fixo: true
          })
          trackingData.advantageIndices.push(currentLength)
        }
      })
    }

    // 7. Distribuição de pontos de defeitos (Osiris)
    if (config.choices.flawDistribution && selectedChoices.value.flawPoints) {
      Object.entries(selectedChoices.value.flawPoints).forEach(([name, points]) => {
        if (points && points > 0) {
          const currentLength = sheetData.value.advantages.length
          sheetData.value.advantages.push({
            category: 'Defeito',
            type: 'Social',
            name: name,
            level: points,
            details: '',
            fixo: true
          })
          trackingData.advantageIndices.push(currentLength)
        }
      })
    }

    // 8. Tratamento de escolha de defeito
    if (selectedChoices.value.flaw && !config.choices.flawDistribution) {
      const currentLength = sheetData.value.advantages.length

      let flawName = selectedChoices.value.flaw
      let flawLevel = 1
      let flawDetails = ''

      // Parse dos defeitos específicos
      if (flawName === 'Segredo Sombrio (Diablerista)') {
        flawName = 'Segredo Sombrio'
        flawLevel = 2
        flawDetails = 'Diablerista'
      } else if (flawName === 'Segregado') {
        flawName = 'Segregado'
        flawLevel = 2
      } else if (flawName === 'Influência (Rejeitado)') {
        flawName = 'Influência'
        flawLevel = 1
        flawDetails = 'Rejeitado (fora de sua subcultura)'
      } else if (flawName === 'Alimentação (Exclusão de Presa)') {
        flawName = 'Alimentação'
        flawLevel = 1
        flawDetails = 'Exclusão de Presa (Uma subcultura diferente da sua)'
      }

      // Determinar tipo correto
      let flawType = 'Social'
      if (flawName === 'Alimentação') {
        flawType = 'Físico'
      }

      sheetData.value.advantages.push({
        category: 'Defeito',
        type: flawType,
        name: flawName,
        level: flawLevel,
        details: flawDetails,
        fixo: true
      })
      trackingData.advantageIndices.push(currentLength)
    }

    // Salvar rastreamento
    appliedPredatorData.value = trackingData

    // Criar metadata para salvar no banco
    const metadata: PredatorMetadata = {
      predatorName: selectedPredatorType.value,
      humanityChange: config.humanityChange,
      bloodPotencyChange: config.bloodPotencyChange || 0,
      disciplineAdded: trackingData.disciplineAdded,
      fixedAdvantagesCount: config.fixedAdvantages?.length || 0
    }

    ;(sheetData.value as any)._predatorMetadata = metadata

    console.log('💾 Metadata do predador criado:', JSON.stringify(metadata))
    console.log('📊 Estado FINAL após aplicar predador:')
    console.log('   - Predador:', sheetData.value.predator)
    console.log('   - Humanidade:', sheetData.value.humanity)
    console.log('   - Potência Sangue:', sheetData.value.bloodPotency)
    console.log('   - Disciplinas:', JSON.stringify(sheetData.value.disciplines))
    console.log('   - Snapshot BASE (não modificado):', JSON.stringify(originalPredatorValues.value))

    previousPredatorType.value = selectedPredatorType.value
    showPredatorModal.value = false

    toast.success(`Tipo de Predador "${selectedPredatorType.value}" aplicado com sucesso!`)
    console.log('✅ Predador aplicado com sucesso!')
  }

  // ===== INICIALIZAÇÃO DO SNAPSHOT =====

  const initializeSnapshot = (playerSheet: any) => {
    if (snapshotInitialized.value) {
      console.log('⚠️ onMounted: Snapshot já foi inicializado, ignorando execução duplicada')
      return
    }

    console.log('🔵 onMounted: Iniciando carregamento da ficha')
    console.log('📋 Dados da ficha carregados do banco:')
    console.log('   - Predador:', sheetData.value.predator)
    console.log('   - Humanidade:', sheetData.value.humanity)
    console.log('   - Potência Sangue:', sheetData.value.bloodPotency)
    console.log('   - Disciplinas:', JSON.stringify(sheetData.value.disciplines))

    const metadata = playerSheet?._predatorMetadata as PredatorMetadata | undefined
    console.log('📦 Metadata encontrado?', !!metadata)

    if (metadata && sheetData.value.predator) {
      console.log('📦 Metadata de predador encontrado no banco:', JSON.stringify(metadata))
      console.log('🔄 Calculando estado BASE (sem predador) para snapshot...')

      const baseHumanity = sheetData.value.humanity - metadata.humanityChange
      console.log(`   - Humanidade BASE: ${sheetData.value.humanity} - ${metadata.humanityChange} = ${baseHumanity}`)

      const baseBloodPotency = sheetData.value.bloodPotency - metadata.bloodPotencyChange
      console.log(`   - Potência BASE: ${sheetData.value.bloodPotency} - ${metadata.bloodPotencyChange} = ${baseBloodPotency}`)

      let baseDisciplines = sheetData.value.disciplines.map((d: any) => ({ name: d.name, level: d.level }))
      console.log(`   - Disciplinas ATUAIS (com predador): ${JSON.stringify(baseDisciplines)}`)

      if (metadata.disciplineAdded) {
        console.log(`   - Predador adicionou disciplina: "${metadata.disciplineAdded}"`)
        const disciplineIndex = baseDisciplines.findIndex((d: any) => d.name === metadata.disciplineAdded)
        console.log(`   - Índice da disciplina: ${disciplineIndex}`)

        if (disciplineIndex !== -1) {
          const originalLevel = baseDisciplines[disciplineIndex].level
          const newLevel = originalLevel - 1
          console.log(`   - Calculando nível BASE: ${originalLevel} - 1 = ${newLevel}`)

          if (newLevel <= 0) {
            baseDisciplines.splice(disciplineIndex, 1)
            console.log(`   - Disciplina removida do BASE (nível chegaria a ${newLevel})`)
          } else {
            baseDisciplines[disciplineIndex].level = newLevel
            console.log(`   - Disciplina mantida no BASE com nível ${newLevel}`)
          }
        } else {
          console.log(`   ⚠️ Disciplina "${metadata.disciplineAdded}" não encontrada! Ela foi criada pelo predador.`)
        }
      } else {
        console.log('   - Nenhuma disciplina foi adicionada pelo predador')
      }

      console.log(`   - Disciplinas BASE calculadas: ${JSON.stringify(baseDisciplines)}`)

      originalPredatorValues.value = {
        humanity: Math.max(0, Math.min(10, baseHumanity)),
        bloodPotency: Math.max(0, Math.min(10, baseBloodPotency)),
        disciplinesSnapshot: baseDisciplines
      }

      console.log('📸 Snapshot BASE salvo (valores SEM predador):', JSON.stringify(originalPredatorValues.value))
      console.log('📍 sheetData permanece INALTERADO (COM predador aplicado):')
      console.log('   - Humanidade:', sheetData.value.humanity, '(não modificado)')
      console.log('   - Potência:', sheetData.value.bloodPotency, '(não modificado)')
      console.log('   - Disciplinas:', JSON.stringify(sheetData.value.disciplines), '(não modificado)')
      console.log('   ✅ Snapshot BASE salvo! Será usado ao trocar de predador.')
    } else {
      console.log('ℹ️ Ficha não tem predador aplicado (ou sem metadata)')

      if (!originalPredatorValues.value) {
        originalPredatorValues.value = {
          humanity: sheetData.value.humanity,
          bloodPotency: sheetData.value.bloodPotency,
          disciplinesSnapshot: sheetData.value.disciplines.map((d: any) => ({
            name: d.name,
            level: d.level
          }))
        }
        console.log('📸 Snapshot inicial salvo (sem predador aplicado):', JSON.stringify(originalPredatorValues.value))
      }
    }

    snapshotInitialized.value = true
    console.log('🔵 onMounted: Finalizado')
  }

  // ===== RETORNO DO COMPOSABLE =====

  return {
    // Estados
    showPredatorModal,
    selectedPredatorType,
    previousPredatorType,
    selectedChoices,
    originalPredatorValues,
    appliedPredatorData,
    predatorModalData,
    snapshotInitialized,

    // Funções de validação
    isDisciplineRestricted,
    selectDiscipline,
    needsCustomSpecialtyInput,
    canConfirmPredatorChoice,

    // Funções de pontos
    getTotalBackgroundPoints,
    getTotalFlawPoints,
    getMaxBackgroundPoints,
    validateBackgroundPoints,
    getMaxFlawPoints,
    validateFlawPoints,

    // Funções de modal
    openPredatorModal,
    cancelPredatorModal,

    // Funções de aplicação
    clearPreviousPredatorData,
    applyPredatorChoices,

    // Inicialização
    initializeSnapshot
  }
}
