<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-2 sm:p-4"
    @click.self="handleClose"
  >
    <div class="relative w-full max-w-7xl max-h-[98vh]">
      <!-- Ornamentos decorativos nos cantos (fora do scroll) -->
      <div class="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-t-4 border-l-4 border-red-600 opacity-60 pointer-events-none z-20"></div>
      <div class="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-t-4 border-r-4 border-red-600 opacity-60 pointer-events-none z-20"></div>
      <div class="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-b-4 border-l-4 border-red-600 opacity-60 pointer-events-none z-20"></div>
      <div class="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-b-4 border-r-4 border-red-600 opacity-60 pointer-events-none z-20"></div>
      
      <!-- Container principal com scroll -->
      <div class="bg-surface-card rounded-lg border-4 border-red-900 p-3 sm:p-4 md:p-6 w-full max-h-[98vh] overflow-y-auto shadow-2xl" style="box-shadow: 0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 20px rgba(220, 38, 38, 0.1);">
      
      <!-- Header com Avatar e Nome -->
      <div class="flex items-center justify-between mb-3 sm:mb-4 sticky top-0 bg-surface-card z-10 pb-3 border-b-2 border-red-900">
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Avatar Circular -->
          <div class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 border-red-600 overflow-hidden bg-gradient-to-br from-red-900 to-gray-900 flex items-center justify-center flex-shrink-0 shadow-lg">
            <img 
              v-if="player.sheet?.avatar" 
              :src="player.sheet.avatar" 
              :alt="player.characterName || player.character_name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-white font-bold text-xl sm:text-2xl md:text-3xl">
              {{ getInitials(player.characterName || player.character_name || 'P') }}
            </span>
          </div>
          
          <!-- Nome do Personagem -->
          <h2 class="text-xl sm:text-2xl md:text-4xl font-bold text-red-400 tracking-wider uppercase">
            {{ sheetData.name || player.characterName || player.character_name || 'Personagem' }}
          </h2>
        </div>
        
        <div class="flex space-x-1 sm:space-x-2">
          <BaseButton 
            v-if="canEdit"
            variant="primary" 
            size="sm" 
            @click="saveSheet"
            class="bg-green-600 hover:bg-green-500 text-white"
          >
            💾 <span class="hidden sm:inline">Salvar</span>
          </BaseButton>
          <BaseButton 
            variant="ghost" 
            size="sm" 
            @click="handleClose"
          >
            ✕
          </BaseButton>
        </div>
      </div>

      <form @submit.prevent="saveSheet" class="space-y-4 sm:space-y-6">
        <!-- Header da Ficha -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-2">Nome <span class="text-red-500">*</span></label>
              <input
                v-model="sheetData.name"
                required
                :disabled="!canEdit"
                class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-2">Conceito <span class="text-red-500">*</span></label>
              <input
                v-model="sheetData.concept"
                required
                :disabled="!canEdit"
                placeholder="Ex: Hacktivista Rebelde"
                class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-2">Clã <span class="text-red-500">*</span></label>
              <select
                v-model="sheetData.clan"
                required
                :disabled="!canEdit"
                class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Selecionar</option>
                <option v-for="clan in vampireClans" :key="clan" :value="clan">
                  {{ clan }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 md:mt-6">
            <div>
              <label class="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-2">Geração <span class="text-red-500">*</span></label>
              <input
                v-model.number="sheetData.generation"
                type="number"
                min="3"
                max="15"
                required
                :disabled="!canEdit"
                class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-2">Seita</label>
              <select
                v-model="sheetData.sect"
                :disabled="!canEdit"
                class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Selecionar</option>
                <option value="Camarilla">Camarilla</option>
                <option value="Sabá">Sabá</option>
                <option value="Anarquistas">Anarquistas</option>
                <option value="Independente">Independente</option>
              </select>
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-2">Refúgio</label>
              <input
                v-model="sheetData.haven"
                placeholder="Local do refúgio"
                :disabled="!canEdit"
                class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
            </div>
          </div>
        </div>

        <!-- Atributos -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <!-- Físicos -->
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🏋️ Físicos</h3>
            <div class="space-y-2 sm:space-y-3 md:space-y-4">
              <div v-for="attr in physicalAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="text-xs sm:text-sm font-medium text-text-primary">{{ attr.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setAttributeValue('physical', attr.key, n)"
                    :disabled="!canEdit"
                    :class="[
                      'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors',
                      n <= (sheetData.attributes.physical as any)[attr.key]
                        ? 'bg-accent border-accent'
                        : 'border-accent hover:bg-accent hover:bg-opacity-30',
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
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🎭 Sociais</h3>
            <div class="space-y-2 sm:space-y-3 md:space-y-4">
              <div v-for="attr in socialAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="text-xs sm:text-sm font-medium text-text-primary">{{ attr.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setAttributeValue('social', attr.key, n)"
                    :disabled="!canEdit"
                    :class="[
                      'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors',
                      n <= (sheetData.attributes.social as any)[attr.key]
                        ? 'bg-accent border-accent'
                        : 'border-accent hover:bg-accent hover:bg-opacity-30',
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
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🧠 Mentais</h3>
            <div class="space-y-2 sm:space-y-3 md:space-y-4">
              <div v-for="attr in mentalAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="text-xs sm:text-sm font-medium text-text-primary">{{ attr.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setAttributeValue('mental', attr.key, n)"
                    :disabled="!canEdit"
                    :class="[
                      'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors',
                      n <= (sheetData.attributes.mental as any)[attr.key]
                        ? 'bg-accent border-accent'
                        : 'border-accent hover:bg-accent hover:bg-opacity-30',
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <!-- Talentos -->
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">⚡ Talentos</h3>
            <div class="space-y-1.5 sm:space-y-2 md:space-y-3">
              <div v-for="skill in talents" :key="skill.key" class="flex justify-between items-center">
                <label class="text-xs sm:text-sm text-text-primary">{{ skill.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setSkillValue('talents', skill.key, n)"
                    :class="[
                      'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 transition-colors',
                      n <= (sheetData.skills.talents as any)[skill.key]
                        ? 'bg-accent border-accent'
                        : 'border-accent hover:bg-accent hover:bg-opacity-30'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Perícias -->
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🛠️ Perícias</h3>
            <div class="space-y-1.5 sm:space-y-2 md:space-y-3">
              <div v-for="skill in skills" :key="skill.key" class="flex justify-between items-center">
                <label class="text-xs sm:text-sm text-text-primary">{{ skill.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setSkillValue('skills', skill.key, n)"
                    :class="[
                      'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 transition-colors',
                      n <= (sheetData.skills.skills as any)[skill.key]
                        ? 'bg-accent border-accent'
                        : 'border-accent hover:bg-accent hover:bg-opacity-30'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Conhecimentos -->
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">📚 Conhecimentos</h3>
            <div class="space-y-1.5 sm:space-y-2 md:space-y-3">
              <div v-for="skill in knowledges" :key="skill.key" class="flex justify-between items-center">
                <label class="text-xs sm:text-sm text-text-primary">{{ skill.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setSkillValue('knowledges', skill.key, n)"
                    :class="[
                      'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 transition-colors',
                      n <= (sheetData.skills.knowledges as any)[skill.key]
                        ? 'bg-accent border-accent'
                        : 'border-accent hover:bg-accent hover:bg-opacity-30'
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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:items-start">
          <div class="space-y-3 sm:space-y-4 md:space-y-6 flex flex-col">
            <!-- Disciplinas -->
            <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
              <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🩸 Disciplinas</h3>
              <div class="space-y-2 sm:space-y-3 md:space-y-4">
                <div v-for="(discipline, index) in sheetData.disciplines" :key="index" class="flex items-center space-x-2 sm:space-x-3">
                  <select
                    v-model="discipline.name"
                    :disabled="!canEdit"
                    @change="hasUnsavedChanges = true"
                    class="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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
                        'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors',
                        n <= discipline.level
                          ? 'bg-red-600 border-red-600'
                          : 'border-red-600 hover:bg-red-600 hover:bg-opacity-30'
                      ]"
                    >
                      <span class="sr-only">{{ n }}</span>
                    </button>
                  </div>
                  <button
                    v-if="canEdit"
                    type="button"
                    @click="removeDiscipline(index)"
                    class="p-1 text-red-400 hover:text-red-300"
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
            <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
              <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">⭐ Vantagens & Defeitos</h3>
              <div class="space-y-2">
                <div v-for="(adv, idx) in sheetData.advantages" :key="idx" class="flex items-center gap-2">
                  <input
                    v-model="adv.name"
                    type="text"
                    placeholder="Nome da vantagem/defeito"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="flex-1 px-2 py-1.5 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <div class="flex gap-1">
                    <button
                      v-for="level in 5"
                      :key="level"
                      type="button"
                      @click="setAdvantageLevel(Number(idx), level)"
                      :disabled="!canEdit"
                      :class="[
                        'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors',
                        adv.level >= level
                          ? 'bg-accent border-accent'
                          : 'border-primary hover:bg-accent hover:bg-opacity-30'
                      ]"
                    >
                      <span class="sr-only">Nível {{ level }}</span>
                    </button>
                  </div>
                  <button
                    v-if="canEdit && Number(idx) > 0"
                    type="button"
                    @click="removeAdvantage(Number(idx))"
                    class="p-1 text-red-400 hover:text-red-300"
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
            <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
              <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🩸 Fome</h3>
              <div class="flex gap-1">
                <button
                  v-for="level in 5"
                  :key="level"
                  type="button"
                  @click="sheetData.hunger = level; hasUnsavedChanges = true"
                  :disabled="!canEdit"
                  :class="[
                    'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors',
                    (sheetData.hunger || 0) >= level
                      ? 'bg-red-600 border-red-600'
                      : 'border-red-600 hover:bg-red-600 hover:bg-opacity-30'
                  ]"
                >
                  <span class="sr-only">Fome {{ level }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-col">
            <!-- Potência de Sangue -->
            <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
              <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🩸 Potência de Sangue</h3>
              
              <!-- Nível de Potência -->
              <div class="mb-4">
                <label class="block text-xs sm:text-sm text-text-muted mb-1">Nível de Potência (0-10)</label>
                <div class="flex gap-1 flex-wrap">
                  <button
                    v-for="level in 11"
                    :key="level - 1"
                    type="button"
                    @click="setBloodPotency(level - 1)"
                    :disabled="!canEdit"
                    :class="[
                      'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors',
                      sheetData.bloodPotency >= level - 1
                        ? 'bg-red-600 border-red-600'
                        : 'border-red-600 hover:bg-red-600 hover:bg-opacity-30'
                    ]"
                  >
                    <span class="sr-only">{{ level - 1 }}</span>
                  </button>
                </div>
              </div>

              <!-- Mecânicas de Potência -->
              <div class="space-y-2 sm:space-y-3 md:space-y-4">
                <div>
                  <label class="block text-xs text-text-muted mb-1">Surto de Sangue</label>
                  <input
                    v-model="sheetData.bloodSurge"
                    type="text"
                    placeholder="+2"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="w-full px-2 py-1.5 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label class="block text-xs text-text-muted mb-1">Bônus de Poder</label>
                  <input
                    v-model="sheetData.powerBonus"
                    type="text"
                    placeholder="0"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="w-full px-2 py-1.5 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label class="block text-xs text-text-muted mb-1">Penalidade de Alimentação</label>
                  <input
                    v-model="sheetData.feedingPenalty"
                    type="text"
                    placeholder="Sem Penalidade"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="w-full px-2 py-1.5 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label class="block text-xs text-text-muted mb-1">Gravidade da Perdição</label>
                  <input
                    v-model="sheetData.baneSeverity"
                    type="text"
                    placeholder="0"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="w-full px-2 py-1.5 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <!-- Experiência -->
            <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary mt-3 sm:mt-4 md:mt-6">
              <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">💎 Experiência</h3>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs text-text-muted mb-1">Total</label>
                  <input
                    v-model.number="sheetData.xpTotal"
                    type="number"
                    min="0"
                    placeholder="0"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="w-full px-2 py-1.5 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label class="block text-xs text-text-muted mb-1">Gasto</label>
                  <input
                    v-model.number="sheetData.xpSpent"
                    type="number"
                    min="0"
                    placeholder="0"
                    @input="hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    class="w-full px-2 py-1.5 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label class="block text-xs text-text-muted mb-1">Disponível</label>
                  <input
                    :value="(sheetData.xpTotal || 0) - (sheetData.xpSpent || 0)"
                    type="number"
                    disabled
                    class="w-full px-2 py-1.5 text-sm border border-primary rounded-md bg-surface-hover text-text-primary opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Virtudes e Humanidade -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <!-- Virtudes -->
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">✨ Virtudes</h3>
            <div class="space-y-2 sm:space-y-3 md:space-y-4">
              <div v-for="virtue in virtues" :key="virtue.key" class="flex justify-between items-center">
                <label class="text-xs sm:text-sm font-medium text-text-primary">{{ virtue.name }}</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setVirtueValue(virtue.key, n)"
                    :disabled="!canEdit"
                    :class="[
                      'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 transition-colors',
                      n <= (sheetData.virtues as any)[virtue.key]
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'border-yellow-500 hover:bg-yellow-500 hover:bg-opacity-30'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Humanidade, Vontade & Vitalidade -->
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">❤️ Humanidade, Vontade & Vitalidade</h3>
            <div class="space-y-2 sm:space-y-3 md:space-y-4">
              <div class="flex justify-between items-center">
                <label class="text-xs sm:text-sm font-medium text-text-primary">Humanidade</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 10"
                    :key="n"
                    type="button"
                    @click="sheetData.humanity = n; hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    :class="[
                      'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 transition-colors',
                      n <= sheetData.humanity
                        ? 'bg-red-500 border-red-500'
                        : 'border-red-500 hover:bg-red-500 hover:bg-opacity-30'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <label class="text-xs sm:text-sm font-medium text-text-primary">Força de Vontade</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 10"
                    :key="n"
                    type="button"
                    @click="sheetData.willpower = n; hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    :class="[
                      'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 transition-colors',
                      n <= sheetData.willpower
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-blue-500 hover:bg-blue-500 hover:bg-opacity-30'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <label class="text-xs sm:text-sm font-medium text-text-primary">Vitalidade</label>
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 10"
                    :key="n"
                    type="button"
                    @click="sheetData.vitality = n; hasUnsavedChanges = true"
                    :disabled="!canEdit"
                    :class="[
                      'w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 transition-colors',
                      n <= sheetData.vitality
                        ? 'bg-green-500 border-green-500'
                        : 'border-green-500 hover:bg-green-500 hover:bg-opacity-30'
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
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🎭 Ressonância</h3>
          <input
            v-model="sheetData.resonance"
            type="text"
            placeholder="Choleric, Melancholic, Phlegmatic, Sanguine..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Princípios da Crônica -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">📜 Princípios da Crônica</h3>
          <textarea
            v-model="sheetData.chronicleTenets"
            rows="3"
            placeholder="As regras e princípios da crônica que você deve seguir..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        <!-- Pilares & Convicções -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">⚖️ Pilares & Convicções</h3>
          <textarea
            v-model="sheetData.touchstonesConvictions"
            rows="3"
            placeholder="Suas crenças fundamentais, pilares de humanidade e conexões mortais..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        <!-- Perdição do Clã -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">⚠️ Perdição do Clã</h3>
          <textarea
            v-model="sheetData.clanBane"
            rows="2"
            placeholder="A maldição específica do seu clã vampírico..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        <!-- Geração do Abraço -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🩸 Geração do Abraço</h3>
          <select
            v-model="sheetData.embraceGeneration"
            @change="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">Selecionar</option>
            <option value="childer">[Cria] Abraçado nos últimos 15 anos</option>
            <option value="neonate">[Neófito] Abraçado entre 15 - 50 anos atrás</option>
            <option value="ancilla">[Ancião] Abraçado entre 50 - 100 anos atrás</option>
          </select>
        </div>

        <!-- Aparência e Traços -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">👤 Aparência</h3>
          <textarea
            v-model="sheetData.appearance"
            rows="3"
            placeholder="Descrição física do personagem: altura, compleição, cor dos olhos e cabelo, estilo de vestimenta..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed mb-3"
          ></textarea>
          
          <label class="block text-xs text-text-muted mb-1">Traços Distintivos</label>
          <textarea
            v-model="sheetData.distinguishingFeatures"
            rows="2"
            placeholder="Cicatrizes, tatuagens, marcas de nascença, maneirismos únicos..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
          ></textarea>
        </div>

        <!-- Condições Narrativas -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">⚠️ Condições Narrativas</h3>
          <div class="space-y-2">
            <div v-for="(condition, idx) in sheetData.conditions" :key="idx" class="flex items-center gap-2">
              <input
                v-model="sheetData.conditions[idx]"
                type="text"
                placeholder="Ex: Ferido, Faminto, Ensanguentado, Frenesi"
                @input="hasUnsavedChanges = true"
                :disabled="!canEdit"
                class="flex-1 px-2 py-1.5 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                v-if="canEdit && sheetData.conditions.length > 1"
                type="button"
                @click="removeCondition(Number(idx))"
                class="p-1 text-red-400 hover:text-red-300"
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
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">📖 História do Personagem</h3>
          <textarea
            v-model="sheetData.history"
            rows="6"
            placeholder="A história completa do seu personagem: origem, vida mortal, circunstâncias do abraço, eventos importantes da não-vida..."
            @input="hasUnsavedChanges = true"
            :disabled="!canEdit"
            class="w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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
      <div class="bg-surface-card p-6 rounded-lg border-2 border-red-500 max-w-md mx-4 shadow-2xl">
        <h3 class="text-xl font-bold text-red-400 mb-4">⚠️ Alterações não salvas</h3>
        <p class="text-text-muted mb-6">
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
      <div class="bg-surface-card p-6 rounded-lg border-2 border-green-500 max-w-md mx-4 shadow-2xl">
        <h3 class="text-xl font-bold text-green-400 mb-4">✅ Deseja salvar alterações?</h3>
        <p class="text-text-muted mb-6">
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
  player: props.player.name || '',
  
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
    talents: { alertness: 1, athletics: 1, awareness: 1, brawl: 1, empathy: 1, expression: 1, intimidation: 1, leadership: 1, streetwise: 1, subterfuge: 1 },
    skills: { animalKen: 1, craft: 1, drive: 1, etiquette: 1, firearms: 1, larceny: 1, melee: 1, performance: 1, stealth: 1, survival: 1 },
    knowledges: { academics: 1, computer: 1, finance: 1, investigation: 1, law: 1, medicine: 1, occult: 1, politics: 1, science: 1, technology: 1 }
  },
  disciplines: props.player.sheet?.disciplines || [{ name: '', level: 0 }],
  virtues: props.player.sheet?.virtues || { conscience: 1, selfControl: 1, courage: 1 },
  humanity: props.player.sheet?.humanity || 7,
  willpower: props.player.sheet?.willpower || 3,
  vitality: props.player.sheet?.vitality || 10,
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
  sheetData.value.bloodPotency = level
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
