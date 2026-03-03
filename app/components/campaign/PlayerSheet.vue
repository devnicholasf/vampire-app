<template>
  <div 
    class="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4 df-overlay"
    @click.self="handleClose"
  >
    <div class="relative w-full max-w-7xl max-h-[98vh]">
      <!-- Ornamentos decorativos estilo dark fantasy nos cantos -->
      <div class="df-corner df-corner-tl"></div>
      <div class="df-corner df-corner-tr"></div>
      <div class="df-corner df-corner-bl"></div>
      <div class="df-corner df-corner-br"></div>
      
      <!-- Container principal com scroll -->
      <div class="df-main-panel p-3 w-full max-h-[98vh] overflow-y-auto">
      
      <!-- Header com Avatar e Nome -->
      <div class="flex items-center justify-between mb-3 sticky top-0 z-10 pb-3 pt-1 df-header-bar">
        <div class="flex items-center gap-3">
          <!-- Botão Voltar -->
          <button 
            type="button"
            @click="handleClose"
            class="df-btn-back flex-shrink-0"
            title="Voltar"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <!-- Avatar Circular com borda ornamental -->
          <div class="df-avatar-frame flex-shrink-0">
            <div class="df-avatar-inner rounded-full overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-gray-900 flex items-center justify-center">
              <img 
                v-if="player.sheet?.avatar" 
                :src="player.sheet.avatar" 
                :alt="player.characterName || player.character_name"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-red-200 font-bold text-xl sm:text-2xl md:text-3xl drop-shadow-lg">
                {{ getInitials(player.characterName || player.character_name || 'P') }}
              </span>
            </div>
          </div>
          
          <!-- Nome do Personagem -->
          <h2 class="df-title text-xl sm:text-2xl md:text-4xl">
            {{ sheetData.name || player.characterName || player.character_name || 'Personagem' }}
          </h2>
        </div>
        
        <div class="flex space-x-2">
          <button 
            v-if="canEdit"
            type="button"
            @click="saveSheet"
            class="df-btn df-btn-save"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            <span class="hidden sm:inline ml-1">Salvar</span>
          </button>
          <button 
            type="button"
            @click="handleClose"
            class="df-btn df-btn-close"
            title="Fechar"
          >
            <svg class="w-4 h-4" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

      <form @submit.prevent="saveSheet" class="space-y-4">
        <!-- Header da Ficha -->
        <div class="df-card">
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="df-label">Nome <span class="text-red-400">*</span></label>
              <input v-model="sheetData.name" required :disabled="!canEdit" class="df-input">
            </div>
            <div>
              <label class="df-label">Conceito <span class="text-red-400">*</span></label>
              <input v-model="sheetData.concept" required :disabled="!canEdit" placeholder="Ex: Hacktivista Rebelde" class="df-input">
            </div>
            <div>
              <label class="df-label">Clã <span class="text-red-400">*</span></label>
              <select v-model="sheetData.clan" required :disabled="!canEdit" class="df-input">
                <option value="">Selecionar</option>
                <option v-for="clan in vampireClans" :key="clan" :value="clan">{{ clan }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 mt-3">
            <div>
              <label class="df-label">Geração <span class="text-red-400">*</span></label>
              <input v-model.number="sheetData.generation" type="number" min="3" max="15" required :disabled="!canEdit" class="df-input">
            </div>
            <div>
              <label class="df-label">Seita</label>
              <select v-model="sheetData.sect" :disabled="!canEdit" class="df-input">
                <option value="">Selecionar</option>
                <option value="Camarilla">Camarilla</option>
                <option value="Sabá">Sabá</option>
                <option value="Anarquistas">Anarquistas</option>
                <option value="Independente">Independente</option>
              </select>
            </div>
            <div>
              <label class="df-label">Refúgio</label>
              <input v-model="sheetData.haven" placeholder="Local do refúgio" :disabled="!canEdit" class="df-input">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 mt-3">
            <div>
              <label class="df-label">Comportamento</label>
              <input v-model="sheetData.demeanor" placeholder="Ex: Rebelde" :disabled="!canEdit" class="df-input">
            </div>
            <div>
              <label class="df-label">Natureza</label>
              <input v-model="sheetData.nature" placeholder="Ex: Sobrevivente" :disabled="!canEdit" class="df-input">
            </div>
            <div>
              <label class="df-label">Jogador</label>
              <input v-model="sheetData.player" :disabled="!canEdit" class="df-input">
            </div>
          </div>
        </div>

        <!-- Atributos -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Físicos -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>
              Físicos
            </h3>
            <div class="space-y-2">
              <div v-for="attr in physicalAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="df-attr-label">{{ attr.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setAttributeValue('physical', attr.key, n)"
                    :disabled="!canEdit"
                    :class="[
                      'df-dot df-dot-md',
                      n <= (sheetData.attributes.physical as any)[attr.key]
                        ? 'df-dot-filled'
                        : 'df-dot-empty',
                      !canEdit && 'cursor-not-allowed opacity-60'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sociais -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>
              Sociais
            </h3>
            <div class="space-y-2">
              <div v-for="attr in socialAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="df-attr-label">{{ attr.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setAttributeValue('social', attr.key, n)"
                    :disabled="!canEdit"
                    :class="[
                      'df-dot df-dot-md',
                      n <= (sheetData.attributes.social as any)[attr.key]
                        ? 'df-dot-filled'
                        : 'df-dot-empty',
                      !canEdit && 'cursor-not-allowed opacity-60'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mentais -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
              Mentais
            </h3>
            <div class="space-y-2">
              <div v-for="attr in mentalAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="df-attr-label">{{ attr.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setAttributeValue('mental', attr.key, n)"
                    :disabled="!canEdit"
                    :class="[
                      'df-dot df-dot-md',
                      n <= (sheetData.attributes.mental as any)[attr.key]
                        ? 'df-dot-filled'
                        : 'df-dot-empty',
                      !canEdit && 'cursor-not-allowed opacity-60'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Habilidades -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Talentos -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Talentos
            </h3>
            <div class="space-y-3">
              <div v-for="skill in talents" :key="skill.key" class="flex justify-between items-center">
                <label class="df-attr-label">{{ skill.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setSkillValue('talents', skill.key, n)"
                    :class="[
                      'df-dot df-dot-sm',
                      n <= (sheetData.skills.talents as any)[skill.key]
                        ? 'df-dot-filled'
                        : 'df-dot-empty'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Perícias -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              Perícias
            </h3>
            <div class="space-y-3">
              <div v-for="skill in skills" :key="skill.key" class="flex justify-between items-center">
                <label class="df-attr-label">{{ skill.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setSkillValue('skills', skill.key, n)"
                    :class="[
                      'df-dot df-dot-sm',
                      n <= (sheetData.skills.skills as any)[skill.key]
                        ? 'df-dot-filled'
                        : 'df-dot-empty'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Conhecimentos -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              Conhecimentos
            </h3>
            <div class="space-y-3">
              <div v-for="skill in knowledges" :key="skill.key" class="flex justify-between items-center">
                <label class="df-attr-label">{{ skill.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setSkillValue('knowledges', skill.key, n)"
                    :class="[
                      'df-dot df-dot-sm',
                      n <= (sheetData.skills.knowledges as any)[skill.key]
                        ? 'df-dot-filled'
                        : 'df-dot-empty'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Campos com Bolinhas: Grid 2 colunas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:items-start">
          <div class="space-y-3 flex flex-col">
            <!-- Disciplinas -->
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
                Disciplinas
              </h3>
              <div class="space-y-2">
                <div v-for="(discipline, index) in sheetData.disciplines" :key="index" class="flex items-center space-x-2 sm:space-x-3">
                  <select
                    v-model="discipline.name"
                    :disabled="!canEdit"
                    @change="hasUnsavedChanges = true"
                    class="df-input flex-1"
                  >
                    <option value="">Selecione uma disciplina</option>
                    <option v-for="disc in vampireDisciplines" :key="disc" :value="disc">{{ disc }}</option>
                  </select>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button
                      v-for="n in 5"
                      :key="n"
                      type="button"
                      @click="setDisciplineValue(index, n)"
                      :disabled="!canEdit"
                      :class="[
                        'df-dot df-dot-md',
                        n <= discipline.level
                          ? 'df-dot-filled'
                          : 'df-dot-empty'
                      ]"
                    >
                      <span class="sr-only">{{ n }}</span>
                    </button>
                  </div>
                  <button
                    v-if="canEdit"
                    type="button"
                    @click="removeDiscipline(index)"
                    class="df-btn-remove"
                  >
                    <svg class="w-5 h-5" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
                <BaseButton
                  v-if="canEdit"
                  variant="outline"
                  size="sm"
                  type="button"
                  @click="addDiscipline"
                  class="w-full"
                >
                  + Disciplina
                </BaseButton>
              </div>
            </div>

            <!-- Vantagens & Defeitos -->
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Vantagens &amp; Defeitos
              </h3>
              <div class="space-y-2">
                <div v-for="(adv, idx) in sheetData.advantages" :key="idx" class="flex items-center gap-2">
                  <input
                    v-model="adv.name"
                    type="text"
                    placeholder="Nome da vantagem/defeito"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="df-input flex-1"
                  />
                  <div class="flex gap-1">
                    <button
                      v-for="level in 5"
                      :key="level"
                      type="button"
                      @click="setAdvantageLevel(Number(idx), level)"
                      :disabled="!canEdit"
                      :class="[
                        'df-dot df-dot-md',
                        adv.level >= level
                          ? 'df-dot-filled'
                          : 'df-dot-empty'
                      ]"
                    >
                      <span class="sr-only">Nível {{ level }}</span>
                    </button>
                  </div>
                  <button
                    v-if="canEdit && Number(idx) > 0"
                    type="button"
                    @click="removeAdvantage(Number(idx))"
                    class="df-btn-remove"
                  >
                    <svg class="w-5 h-5" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
                <BaseButton
                  v-if="canEdit && sheetData.advantages.length < 10"
                  variant="ghost"
                  @click="addAdvantage"
                  class="w-full text-sm mt-2"
                >
                  + Adicionar Vantagem/Defeito
                </BaseButton>
              </div>
            </div>

            <!-- Fome -->
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6 2 10.5c0 2.5 1.5 4.5 3 5.5L7 22l2.5-5h5L17 22l2-6c1.5-1 3-3 3-5.5C22 6 17.5 2 12 2z"/><path d="M9 11v3.5"/><path d="M15 11v3.5"/></svg>
                Fome
              </h3>
              <div class="flex gap-1">
                <button
                  v-for="level in 5"
                  :key="level"
                  type="button"
                  @click="sheetData.hunger = level; hasUnsavedChanges = true"
                  :disabled="!canEdit"
                  :class="[
                    'df-dot df-dot-md',
                    (sheetData.hunger || 0) >= level
                      ? 'df-dot-filled'
                      : 'df-dot-empty'
                  ]"
                >
                  <span class="sr-only">Fome {{ level }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-col">
            <!-- Potência de Sangue -->
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M6 3h12l-1 8c-.5 3-2.5 5-5 5s-4.5-2-5-5L6 3z"/></svg>
                Potência de Sangue
              </h3>
              
              <!-- Nível de Potência -->
              <div class="mb-4">
                <label class="df-sub-label">Nível de Potência (0-10)</label>
                <div class="flex gap-1 flex-wrap">
                  <button
                    v-for="level in 10"
                    :key="level"
                    type="button"
                    @click="setBloodPotency(level)"
                    :disabled="!canEdit"
                    :class="[
                      'df-dot df-dot-md',
                      sheetData.bloodPotency >= level
                        ? 'df-dot-filled'
                        : 'df-dot-empty'
                    ]"
                  >
                    <span class="sr-only">{{ level }}</span>
                  </button>
                </div>
              </div>

              <!-- Mecânicas de Potência -->
              <div class="space-y-2">
                <div>
                  <label class="df-sub-label">Surto de Sangue</label>
                  <input
                    v-model="sheetData.bloodSurge"
                    type="text"
                    placeholder="+2"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="df-input"
                  />
                </div>
                <div>
                  <label class="df-sub-label">Bônus de Poder</label>
                  <input
                    v-model="sheetData.powerBonus"
                    type="text"
                    placeholder="0"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="df-input"
                  />
                </div>
                <div>
                  <label class="df-sub-label">Penalidade de Alimentação</label>
                  <input
                    v-model="sheetData.feedingPenalty"
                    type="text"
                    placeholder="Sem Penalidade"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="df-input"
                  />
                </div>
                <div>
                  <label class="df-sub-label">Gravidade da Perdição</label>
                  <input
                    v-model="sheetData.baneSeverity"
                    type="text"
                    placeholder="0"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="df-input"
                  />
                </div>
              </div>
            </div>

            <!-- Experiência -->
            <div class="df-card mt-3">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M2 9h20"/><path d="M12 22L6 9"/><path d="M12 22l6-13"/></svg>
                Experiência
              </h3>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="df-sub-label">Total</label>
                  <input
                    v-model.number="sheetData.xpTotal"
                    type="number"
                    min="0"
                    placeholder="0"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="df-input"
                  />
                </div>
                <div>
                  <label class="df-sub-label">Gasto</label>
                  <input
                    v-model.number="sheetData.xpSpent"
                    type="number"
                    min="0"
                    placeholder="0"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="df-input"
                  />
                </div>
                <div>
                  <label class="df-sub-label">Disponível</label>
                  <input
                    :value="(sheetData.xpTotal || 0) - (sheetData.xpSpent || 0)"
                    type="number"
                    disabled
                    class="df-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Virtudes e Humanidade -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <!-- Virtudes -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Virtudes
            </h3>
            <div class="space-y-2">
              <div v-for="virtue in virtues" :key="virtue.key" class="flex justify-between items-center">
                <label class="df-attr-label">{{ virtue.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setVirtueValue(virtue.key, n)"
                    :disabled="!canEdit"
                    :class="[
                      'df-dot df-dot-md df-dot-gold',
                      n <= (sheetData.virtues as any)[virtue.key]
                        ? 'df-dot-filled'
                        : 'df-dot-empty'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Humanidade, Vontade & Vitalidade -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              Humanidade, Vontade &amp; Vitalidade
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="df-attr-label">Humanidade</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 10"
                    :key="n"
                    type="button"
                    @click="sheetData.humanity = n; hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    :class="[
                      'df-dot df-dot-sm',
                      n <= sheetData.humanity
                        ? 'df-dot-filled'
                        : 'df-dot-empty'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <label class="df-attr-label">Força de Vontade</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 10"
                    :key="n"
                    type="button"
                    @click="sheetData.willpower = n; hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    :class="[
                      'df-dot df-dot-sm df-dot-blue',
                      n <= sheetData.willpower
                        ? 'df-dot-filled'
                        : 'df-dot-empty'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <label class="df-attr-label">Vitalidade</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 10"
                    :key="n"
                    type="button"
                    @click="sheetData.vitality = n; hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    :class="[
                      'df-dot df-dot-sm df-dot-green',
                      n <= sheetData.vitality
                        ? 'df-dot-filled'
                        : 'df-dot-empty'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ressonância -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Ressonância
          </h3>
          <input
            v-model="sheetData.resonance"
            type="text"
            placeholder="Choleric, Melancholic, Phlegmatic, Sanguine..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="df-input"
          />
        </div>

        <!-- Princípios da Crônica -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10l4-4V5a2 2 0 00-2-2z"/><path d="M17 21v-4h4"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/></svg>
            Princípios da Crônica
          </h3>
          <textarea
            v-model="sheetData.chronicleTenets"
            rows="3"
            placeholder="As regras e princípios da crônica que você deve seguir..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="df-input"
          ></textarea>
        </div>

        <!-- Pilares & Convicções -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-1.5.9-3.5.9-6 0z"/><path d="m2 16 3-8 3 8c-1.5.9-3.5.9-6 0z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
            Pilares &amp; Convicções
          </h3>
          <textarea
            v-model="sheetData.touchstonesConvictions"
            rows="3"
            placeholder="Suas crenças fundamentais, pilares de humanidade e conexões mortais..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="df-input"
          ></textarea>
        </div>

        <!-- Perdição do Clã -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 00-8 8c0 3.5 2 6 4 7.5V20h8v-2.5c2-1.5 4-4 4-7.5a8 8 0 00-8-8z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 16h6"/><path d="M10 20v2"/><path d="M14 20v2"/></svg>
            Perdição do Clã
          </h3>
          <textarea
            v-model="sheetData.clanBane"
            rows="2"
            placeholder="A maldição específica do seu clã vampírico..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="df-input"
          ></textarea>
        </div>

        <!-- Geração do Abraço -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            Geração do Abraço
          </h3>
          <select
            v-model="sheetData.embraceGeneration"
            @change="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="df-input"
          >
            <option value="">Selecionar</option>
            <option value="childer">[Cria] Abraçado nos últimos 15 anos</option>
            <option value="neonate">[Neófito] Abraçado entre 15 - 50 anos atrás</option>
            <option value="ancilla">[Ancião] Abraçado entre 50 - 100 anos atrás</option>
          </select>
        </div>

        <!-- Aparência e Traços -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Aparência
          </h3>
          <textarea
            v-model="sheetData.appearance"
            rows="3"
            placeholder="Descrição física do personagem: altura, compleição, cor dos olhos e cabelo, estilo de vestimenta..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="df-input mb-3"
          ></textarea>
          
          <label class="df-sub-label">Traços Distintivos</label>
          <textarea
            v-model="sheetData.distinguishingFeatures"
            rows="2"
            placeholder="Cicatrizes, tatuagens, marcas de nascença, maneirismos únicos..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="df-input"
          ></textarea>
        </div>

        <!-- Condições Narrativas -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            Condições Narrativas
          </h3>
          <div class="space-y-2">
            <div v-for="(condition, idx) in sheetData.conditions" :key="idx" class="flex items-center gap-2">
              <input
                v-model="sheetData.conditions[idx]"
                type="text"
                placeholder="Ex: Ferido, Faminto, Ensanguentado, Frenesi"
                @input="hasUnsavedChanges = true"
                :disabled="!canEdit"
                class="df-input flex-1"
              />
              <button
                v-if="canEdit && sheetData.conditions.length > 1"
                type="button"
                @click="removeCondition(Number(idx))"
                class="df-btn-remove"
              >
                <svg class="w-5 h-5" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <BaseButton
              v-if="canEdit && sheetData.conditions.length < 10"
              variant="ghost"
              @click="addCondition"
              class="w-full text-sm mt-2"
            >
              + Adicionar Condição
            </BaseButton>
          </div>
        </div>

        <!-- História -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            História do Personagem
          </h3>
          <textarea
            v-model="sheetData.history"
            rows="6"
            placeholder="A história completa do seu personagem: origem, vida mortal, circunstâncias do abraço, eventos importantes da não-vida..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="df-input"
          ></textarea>
        </div>
      </form>


    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10001]"
      @click.self="cancelClose"
    >
      <div class="df-card df-modal-panel max-w-md mx-4">
        <h3 class="df-modal-title text-red-400">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Alterações não salvas
        </h3>
        <p class="df-modal-text">
          Você tem alterações não salvas. Se sair agora, todas as mudanças serão perdidas.
        </p>
        <div class="flex justify-end space-x-3">
          <BaseButton 
            variant="ghost" 
            @click="cancelClose"
            class="hover:bg-surface-hover"
          >
            Continuar Editando
          </BaseButton>
          <BaseButton 
            variant="primary" 
            @click="confirmClose"
            class="bg-red-600 hover:bg-red-500 text-white"
          >
            Sair Sem Salvar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Save Confirmation Modal -->
    <div
      v-if="showSaveConfirmModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10001]"
      @click.self="cancelSave"
    >
      <div class="df-card df-modal-panel max-w-md mx-4">
        <h3 class="df-modal-title text-green-400">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Deseja salvar alterações?
        </h3>
        <p class="df-modal-text">
          Suas alterações serão salvas permanentemente no banco de dados.
        </p>
        <div class="flex justify-end space-x-3">
          <BaseButton 
            variant="ghost" 
            @click="cancelSave"
            class="hover:bg-surface-hover"
          >
            Continuar Editando
          </BaseButton>
          <BaseButton 
            variant="primary" 
            @click="confirmSave"
            class="bg-green-600 hover:bg-green-500 text-white"
          >
            Sim, Salvar
          </BaseButton>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'

// Props
interface Props {
  player: any
  canEdit: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [playerData: any]
}>()

// Reactive data
const hasUnsavedChanges = ref(false)

// Confirmation modal
const showConfirmModal = ref(false)
const showSaveConfirmModal = ref(false)

// Helper para iniciais do avatar
const getInitials = (name: string) => {
  if (!name) return 'P'
  const words = name.split(' ').filter(w => w.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return words[0]?.[0]?.toUpperCase() || 'P'
}

// Vampiro clãs
const vampireClans = [
  'Brujah', 'Gangrel', 'Malkavian', 'Nosferatu', 'Toreador', 
  'Tremere', 'Ventrue', 'Assamita', 'Followers of Set', 'Giovanni',
  'Lasombra', 'Tzimisce', 'Caitiff', 'Thin-Blood'
]

// Disciplinas V5
const vampireDisciplines = [
  'Animalismo',
  'Auspícios',
  'Celeridade',
  'Dominação',
  'Feitiçaria de Sangue',
  'Fortitude',
  'Metamorfose',
  'Ofuscação',
  'Potência',
  'Presença',
  'Tenebrosidade',
  'Serpentis',
  'Quietus',
  'Quimerismo',
  'Vicissitude'
]

// Atributos
const physicalAttributes = [
  { key: 'strength', name: 'Força' },
  { key: 'dexterity', name: 'Destreza' },
  { key: 'stamina', name: 'Vigor' }
]

const socialAttributes = [
  { key: 'charisma', name: 'Carisma' },
  { key: 'manipulation', name: 'Manipulação' },
  { key: 'appearance', name: 'Aparência' }
]

const mentalAttributes = [
  { key: 'perception', name: 'Percepção' },
  { key: 'intelligence', name: 'Inteligência' },
  { key: 'wits', name: 'Raciocínio' }
]

// Habilidades (ordem EXATA do print oficial V5)
const talents = [
  { key: 'melee', name: 'Armas Brancas' },
  { key: 'firearms', name: 'Armas de Fogo' },
  { key: 'athletics', name: 'Atletismo' },
  { key: 'brawl', name: 'Briga' },
  { key: 'drive', name: 'Condução' },
  { key: 'stealth', name: 'Furtividade' },
  { key: 'larceny', name: 'Ladroagem' },
  { key: 'craft', name: 'Ofícios' },
  { key: 'survival', name: 'Sobrevivência' }
]

const skills = [
  { key: 'animalKen', name: 'Empatia com Animais' },
  { key: 'etiquette', name: 'Etiqueta' },
  { key: 'intimidation', name: 'Intimidação' },
  { key: 'leadership', name: 'Liderança' },
  { key: 'streetwise', name: 'Manha' },
  { key: 'performance', name: 'Performance' },
  { key: 'persuasion', name: 'Persuasão' },
  { key: 'awareness', name: 'Sagacidade' },
  { key: 'subterfuge', name: 'Subterfúgio' }
]

const knowledges = [
  { key: 'science', name: 'Ciência' },
  { key: 'academics', name: 'Erudição' },
  { key: 'finance', name: 'Finanças' },
  { key: 'investigation', name: 'Investigação' },
  { key: 'medicine', name: 'Medicina' },
  { key: 'occult', name: 'Ocultismo' },
  { key: 'perception', name: 'Percepção' },
  { key: 'politics', name: 'Política' },
  { key: 'technology', name: 'Tecnologia' }
]

// Virtudes
const virtues = [
  { key: 'conscience', name: 'Consciência' },
  { key: 'selfControl', name: 'Autocontrole' },
  { key: 'courage', name: 'Coragem' }
]

// Sheet data structure
const sheetData = ref({
  name: props.player.character_name || props.player.characterName || '',
  concept: props.player.sheet?.concept || '',
  clan: props.player.sheet?.clan || '',
  generation: props.player.sheet?.generation || 13,
  sect: props.player.sheet?.sect || '',
  haven: props.player.sheet?.haven || '',
  demeanor: props.player.sheet?.demeanor || '',
  nature: props.player.sheet?.nature || '',
  player: props.player.sheet?.player || '',
  avatar: props.player.sheet?.avatar || '', // Avatar do personagem
  
  // Novos campos da ficha oficial V5
  resonance: props.player.sheet?.resonance || '',
  chronicleTenets: props.player.sheet?.chronicleTenets || '',
  touchstonesConvictions: props.player.sheet?.touchstonesConvictions || '',
  clanBane: props.player.sheet?.clanBane || '',
  advantages: props.player.sheet?.advantages || [{ name: '', level: 0 }],
  bloodPotency: props.player.sheet?.bloodPotency || 0,
  bloodSurge: props.player.sheet?.bloodSurge || '+2',
  powerBonus: props.player.sheet?.powerBonus || '0',
  feedingPenalty: props.player.sheet?.feedingPenalty || 'Sem Penalidade',
  baneSeverity: props.player.sheet?.baneSeverity || '0',
  xpTotal: props.player.sheet?.xpTotal || 0,
  xpSpent: props.player.sheet?.xpSpent || 0,
  embraceGeneration: props.player.sheet?.embraceGeneration || '',
  appearance: props.player.sheet?.appearance || '',
  distinguishingFeatures: props.player.sheet?.distinguishingFeatures || '',
  history: props.player.sheet?.history || '',
  
  attributes: props.player.sheet?.attributes || {
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social: { charisma: 1, manipulation: 1, appearance: 1 },
    mental: { perception: 1, intelligence: 1, wits: 1 }
  },
  skills: props.player.sheet?.skills || {
    talents: { melee: 1, firearms: 1, athletics: 1, brawl: 1, drive: 1, stealth: 1, larceny: 1, craft: 1, survival: 1 },
    skills: { animalKen: 1, etiquette: 1, intimidation: 1, leadership: 1, streetwise: 1, performance: 1, persuasion: 1, awareness: 1, subterfuge: 1 },
    knowledges: { science: 1, academics: 1, finance: 1, investigation: 1, medicine: 1, occult: 1, perception: 1, politics: 1, technology: 1 }
  },
  disciplines: props.player.sheet?.disciplines || [{ name: '', level: 0 }],
  virtues: props.player.sheet?.virtues || { conscience: 1, selfControl: 1, courage: 1 },
  humanity: props.player.sheet?.humanity || 1,
  willpower: props.player.sheet?.willpower || 1,
  vitality: props.player.sheet?.vitality || 1,
  hunger: props.player.sheet?.hunger ?? 1,
  conditions: props.player.sheet?.conditions?.length > 0 ? props.player.sheet.conditions : ['']
})

// Methods
const setAttributeValue = (category: string, attribute: string, value: number) => {
  if (!props.canEdit) return
  ;(sheetData.value.attributes as any)[category][attribute] = value
  hasUnsavedChanges.value = true
}

const setSkillValue = (category: string, skill: string, value: number) => {
  if (!props.canEdit) return
  ;(sheetData.value.skills as any)[category][skill] = value
  hasUnsavedChanges.value = true
}

const setDisciplineValue = (index: string | number, value: number) => {
  if (!props.canEdit) return
  const idx = typeof index === 'string' ? parseInt(index) : index
  if (!sheetData.value.disciplines[idx]) return
  sheetData.value.disciplines[idx].level = value
  hasUnsavedChanges.value = true
}

const setVirtueValue = (virtue: string, value: number) => {
  if (!props.canEdit) return
  ;(sheetData.value.virtues as any)[virtue] = value
  hasUnsavedChanges.value = true
}

const addDiscipline = () => {
  if (!props.canEdit) return
  sheetData.value.disciplines.push({ name: '', level: 0 })
  hasUnsavedChanges.value = true
}

const removeDiscipline = (index: string | number) => {
  if (!props.canEdit) return
  const idx = typeof index === 'string' ? parseInt(index) : index
  sheetData.value.disciplines.splice(idx, 1)
  hasUnsavedChanges.value = true
}

// Métodos para Vantagens & Defeitos
const setAdvantageLevel = (index: number, level: number) => {
  if (!props.canEdit) return
  if (sheetData.value.advantages[index].level === level) {
    sheetData.value.advantages[index].level = 0
  } else {
    sheetData.value.advantages[index].level = level
  }
  hasUnsavedChanges.value = true
}

const addAdvantage = () => {
  if (!props.canEdit) return
  if (sheetData.value.advantages.length >= 10) return
  sheetData.value.advantages.push({ name: '', level: 0 })
  hasUnsavedChanges.value = true
}

const removeAdvantage = (index: number) => {
  if (!props.canEdit) return
  sheetData.value.advantages.splice(index, 1)
  hasUnsavedChanges.value = true
}

// Métodos para Condições Narrativas
const addCondition = () => {
  if (!props.canEdit) return
  if (sheetData.value.conditions.length >= 10) return
  sheetData.value.conditions.push('')
  hasUnsavedChanges.value = true
}

const removeCondition = (index: number) => {
  if (!props.canEdit) return
  sheetData.value.conditions.splice(index, 1)
  hasUnsavedChanges.value = true
}

// Método para Potência de Sangue
const setBloodPotency = (level: number) => {
  if (!props.canEdit) return
  sheetData.value.bloodPotency = sheetData.value.bloodPotency === level ? level - 1 : level
  hasUnsavedChanges.value = true
}

const validateRequiredFields = (): boolean => {
  if (!sheetData.value.name || !sheetData.value.name.trim()) {
    // Validação falhou - usuário verá campo vazio
    return false
  }
  if (!sheetData.value.concept || !sheetData.value.concept.trim()) {
    return false
  }
  if (!sheetData.value.clan || !sheetData.value.clan.trim()) {
    return false
  }
  if (!sheetData.value.generation || sheetData.value.generation < 3 || sheetData.value.generation > 15) {
    return false
  }
  return true
}

const saveSheet = () => {
  console.log('✅ PlayerSheet: Botão SALVAR clicado - mostrando modal de confirmação')
  
  if (!validateRequiredFields()) {
    console.log('❌ PlayerSheet: Validação falhou')
    return
  }

  // Mostrar modal de confirmação antes de salvar
  showSaveConfirmModal.value = true
}

const confirmSave = () => {
  console.log('✅ PlayerSheet: Usuário confirmou SALVAR')
  showSaveConfirmModal.value = false
  
  try {
    console.log('✅ PlayerSheet: Emitindo evento SAVE')
    
    // Filtrar condições vazias antes de salvar
    const cleanedConditions = sheetData.value.conditions.filter((c: string) => c && c.trim())
    
    emit('save', {
      ...props.player,
      characterName: sheetData.value.name,
      sheet: {
        ...sheetData.value,
        conditions: cleanedConditions
      }
    })
    
    hasUnsavedChanges.value = false
    
    // NÃO mostrar toast aqui - o componente pai (player.vue) vai mostrar
    // para que o toast permaneça visível mesmo após o modal fechar
  } catch (error) {
    console.error('Erro ao salvar:', error)
    // Erro será tratado pelo componente pai
  }
}

const cancelSave = () => {
  console.log('❌ PlayerSheet: Usuário cancelou salvamento')
  showSaveConfirmModal.value = false
}

const handleClose = () => {
  // Se não pode editar (mestre visualizando), fechar direto
  if (!props.canEdit) {
    emit('close')
    return
  }
  
  if (hasUnsavedChanges.value) {
    showConfirmModal.value = true
  } else {
    emit('close')
  }
}

const confirmClose = () => {
  console.log('⚠️ PlayerSheet: confirmClose - Usuário clicou em SAIR SEM SALVAR')
  console.log('⚠️ PlayerSheet: Emitindo CLOSE (componente pai vai recarregar dados do banco)')
  
  // Fecha sem salvar - o componente pai vai recarregar os dados originais
  showConfirmModal.value = false
  hasUnsavedChanges.value = false
  emit('close')
}

const cancelClose = () => {
  showConfirmModal.value = false
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   DARK FANTASY UI — Vampire: The Masquerade Character Sheet
   ══════════════════════════════════════════════════════════════ */

/* ─── Color Palette (CSS Custom Properties) ─── */
.df-overlay {
  --df-bg-deep: #050510;
  --df-bg-card: #0a0a1a;
  --df-bg-input: #0d0d20;
  --df-border-red: #7f1d1d;
  --df-border-silver: #4a4a5a;
  --df-accent-red: #dc2626;
  --df-accent-crimson: #991b1b;
  --df-text-silver: #c0c0d0;
  --df-text-gold: #d4a647;
  --df-glow-red: rgba(220, 38, 38, 0.3);

  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(6px);
}

/* ─── Main Panel ─── */
.df-main-panel {
  background: var(--df-bg-deep);
  background-image: radial-gradient(ellipse at 50% 30%, rgba(127, 29, 29, 0.08) 0%, transparent 70%);
  border: 2px solid var(--df-border-red);
  box-shadow:
    0 0 0 1px var(--df-border-silver),
    0 0 40px rgba(220, 38, 38, 0.12),
    inset 0 0 80px rgba(0, 0, 0, 0.6);
  border-radius: 0.75rem;
  overflow-y: auto;
  max-height: 98vh;
}

/* ─── Scrollbar ─── */
.df-main-panel::-webkit-scrollbar { width: 6px; }
.df-main-panel::-webkit-scrollbar-track { background: var(--df-bg-deep); }
.df-main-panel::-webkit-scrollbar-thumb { background: var(--df-border-red); border-radius: 3px; }
.df-main-panel::-webkit-scrollbar-thumb:hover { background: var(--df-accent-red); }

/* ─── Corner Decorations ─── */
.df-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  z-index: 20;
  pointer-events: none;
}
.df-corner::before,
.df-corner::after {
  content: '';
  position: absolute;
}
.df-corner::before { width: 28px; height: 2px; }
.df-corner::after  { width: 2px;  height: 28px; }

.df-corner-tl { top: -1px; left: -1px; }
.df-corner-tl::before { top: 0; left: 0; background: linear-gradient(90deg, var(--df-text-silver), var(--df-accent-red), transparent); }
.df-corner-tl::after  { top: 0; left: 0; background: linear-gradient(180deg, var(--df-text-silver), var(--df-accent-red), transparent); }

.df-corner-tr { top: -1px; right: -1px; }
.df-corner-tr::before { top: 0; right: 0; background: linear-gradient(270deg, var(--df-text-silver), var(--df-accent-red), transparent); }
.df-corner-tr::after  { top: 0; right: 0; background: linear-gradient(180deg, var(--df-text-silver), var(--df-accent-red), transparent); }

.df-corner-bl { bottom: -1px; left: -1px; }
.df-corner-bl::before { bottom: 0; left: 0; background: linear-gradient(90deg, var(--df-text-silver), var(--df-accent-red), transparent); }
.df-corner-bl::after  { bottom: 0; left: 0; background: linear-gradient(0deg, var(--df-text-silver), var(--df-accent-red), transparent); }

.df-corner-br { bottom: -1px; right: -1px; }
.df-corner-br::before { bottom: 0; right: 0; background: linear-gradient(270deg, var(--df-text-silver), var(--df-accent-red), transparent); }
.df-corner-br::after  { bottom: 0; right: 0; background: linear-gradient(0deg, var(--df-text-silver), var(--df-accent-red), transparent); }

/* ─── Header Bar ─── */
.df-header-bar {
  background: var(--df-bg-deep);
  border-bottom: 1px solid var(--df-border-red);
  padding-top: 4px;
  margin-left: -12px;
  margin-right: -12px;
  padding-left: 12px;
  padding-right: 12px;
}

/* ─── Back Button ─── */
.df-btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--df-text-silver);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.df-btn-back:hover {
  color: var(--df-accent-red);
  border-color: var(--df-border-red);
  background: rgba(127, 29, 29, 0.15);
}

/* ─── Avatar Frame ─── */
.df-avatar-frame {
  border-radius: 9999px;
  padding: 3px;
  background: linear-gradient(135deg, var(--df-accent-red), var(--df-border-silver), var(--df-accent-crimson));
  box-shadow: 0 0 14px var(--df-glow-red);
  animation: df-pulse 4s ease-in-out infinite;
  width: 62px;
  height: 62px;
  min-width: 62px;
  min-height: 62px;
}
.df-avatar-inner {
  width: 56px;
  height: 56px;
}
@keyframes df-pulse {
  0%, 100% { box-shadow: 0 0 14px var(--df-glow-red); }
  50%      { box-shadow: 0 0 24px var(--df-glow-red), 0 0 40px rgba(220, 38, 38, 0.1); }
}

/* ─── Title ─── */
.df-title {
  color: var(--df-accent-red);
  font-weight: 800;
  text-shadow: 0 0 24px var(--df-glow-red), 0 2px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.02em;
}

/* ─── Card Panel ─── */
.df-card {
  background: var(--df-bg-card);
  border: 1px solid var(--df-border-red);
  box-shadow:
    0 0 0 1px var(--df-border-silver),
    inset 0 1px 6px rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  padding: 16px;
}

/* ─── Modal Panel ─── */
.df-modal-panel {
  border-width: 2px;
  box-shadow:
    0 0 40px var(--df-glow-red),
    0 0 0 1px var(--df-border-silver);
}
.df-modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.df-modal-text {
  color: var(--df-text-silver);
  opacity: 0.85;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* ─── Section Title ─── */
.df-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--df-accent-red);
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  position: relative;
}
.df-section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, var(--df-accent-red), var(--df-border-silver) 50%, transparent);
}
@media (min-width: 640px)  { .df-section-title { font-size: 1rem; } }
@media (min-width: 768px)  { .df-section-title { font-size: 1.125rem; } }

/* ─── Labels ─── */
.df-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--df-text-silver);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
.df-sub-label {
  display: block;
  font-size: 0.75rem;
  color: var(--df-text-silver);
  opacity: 0.7;
  margin-bottom: 0.25rem;
}
.df-attr-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--df-text-silver);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
@media (min-width: 640px) { .df-attr-label { font-size: 0.875rem; } }

/* ─── Input / Select / Textarea ─── */
.df-input {
  width: 100%;
  padding: 6px 8px;
  font-size: 0.875rem;
  border: 1px solid var(--df-border-red);
  border-radius: 0.375rem;
  background: var(--df-bg-input);
  color: var(--df-text-silver);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.df-input:focus {
  border-color: var(--df-accent-red);
  box-shadow: 0 0 10px var(--df-glow-red);
}
.df-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.df-input::placeholder {
  color: var(--df-border-silver);
}
@media (min-width: 640px) { .df-input { padding: 8px 12px; } }

/* ─── Dots — Base ─── */
.df-dot {
  border-radius: 9999px;
  border: 2px solid;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
}
/* Sizes */
.df-dot-md { width: 16px; height: 16px; }
.df-dot-sm { width: 14px; height: 14px; }
@media (min-width: 640px) {
  .df-dot-md { width: 20px; height: 20px; }
  .df-dot-sm { width: 16px; height: 16px; }
}
@media (min-width: 768px) {
  .df-dot-md { width: 24px; height: 24px; }
  .df-dot-sm { width: 20px; height: 20px; }
}

/* ─── Dots — States (Default: Crimson Red) ─── */
.df-dot-filled {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  border-color: #b91c1c;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.15),
    0 0 6px rgba(220, 38, 38, 0.4);
}
.df-dot-empty {
  background: transparent;
  border-color: var(--df-border-silver);
}
.df-dot-empty:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.15);
  border-color: var(--df-accent-red);
  box-shadow: 0 0 6px rgba(220, 38, 38, 0.2);
}

/* ─── Dots — Gold Variant (Virtues) ─── */
.df-dot-gold.df-dot-filled {
  background: linear-gradient(135deg, #eab308, #a16207);
  border-color: #ca8a04;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 0 6px rgba(234, 179, 8, 0.4);
}
.df-dot-gold.df-dot-empty { border-color: #78716c; }
.df-dot-gold.df-dot-empty:hover:not(:disabled) {
  background: rgba(234, 179, 8, 0.15);
  border-color: #eab308;
  box-shadow: 0 0 6px rgba(234, 179, 8, 0.2);
}

/* ─── Dots — Blue Variant (Willpower) ─── */
.df-dot-blue.df-dot-filled {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-color: #2563eb;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 0 6px rgba(59, 130, 246, 0.4);
}
.df-dot-blue.df-dot-empty { border-color: #475569; }
.df-dot-blue.df-dot-empty:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.2);
}

/* ─── Dots — Green Variant (Vitality) ─── */
.df-dot-green.df-dot-filled {
  background: linear-gradient(135deg, #22c55e, #15803d);
  border-color: #16a34a;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 0 6px rgba(34, 197, 94, 0.4);
}
.df-dot-green.df-dot-empty { border-color: #475569; }
.df-dot-green.df-dot-empty:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.2);
}

/* ─── Buttons ─── */
.df-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid;
  cursor: pointer;
}
.df-btn-save {
  background: linear-gradient(135deg, #15803d, #166534);
  border-color: #22c55e;
  color: #d1fae5;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}
.df-btn-save:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 0 18px rgba(34, 197, 94, 0.4);
}
.df-btn-close {
  background: var(--df-bg-card);
  border-color: var(--df-border-red);
  color: var(--df-text-silver);
}
.df-btn-close:hover {
  border-color: var(--df-accent-red);
  color: var(--df-accent-red);
  box-shadow: 0 0 10px var(--df-glow-red);
}
.df-btn-remove {
  padding: 4px;
  color: #f87171;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.15s ease;
  border-radius: 4px;
}
.df-btn-remove:hover {
  color: #fca5a5;
  transform: scale(1.1);
}
</style>
