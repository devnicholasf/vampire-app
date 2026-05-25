<template>
  <div 
    class="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4 df-overlay"
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
              <label class="df-label">Predador</label>
              <select v-model="sheetData.predator" :disabled="!canEdit" class="df-input">
                <option value="">Selecionar</option>
                <option value="Consensualista">Consensualista</option>
                <option value="Fazendeiro" :disabled="sheetData.clan === 'Ventrue'">
                  Fazendeiro{{ sheetData.clan === 'Ventrue' ? ' (Ventrue não pode escolher)' : '' }}
                </option>
                <option value="Osiris">Osiris</option>
                <option value="Sacoleiro" :disabled="sheetData.clan === 'Ventrue'">
                  Sacoleiro{{ sheetData.clan === 'Ventrue' ? ' (Ventrue não pode escolher)' : '' }}
                </option>
                <option value="Sandman">Sandman</option>
                <option value="Sanguessuga">Sanguessuga</option>
                <option value="Scene Queen">Scene Queen</option>
                <option value="Sereia">Sereia</option>
                <option value="Trinchador">Trinchador</option>
                <option value="Vira-Lata">Vira-Lata</option>
              </select>
            </div>
            <div>
              <label class="df-label">Ambição</label>
              <input v-model="sheetData.ambition" placeholder="Sua ambição" :disabled="!canEdit" class="df-input">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 mt-3">
            <div>
              <label class="df-label">Desejo</label>
              <input v-model="sheetData.desire" placeholder="Seu desejo" :disabled="!canEdit" class="df-input">
            </div>
            <div>
              <label class="df-label">Senhor</label>
              <input v-model="sheetData.sire" placeholder="Nome do senhor" :disabled="!canEdit" class="df-input">
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
              <div v-for="skill in talents" :key="skill.key" class="flex flex-col">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-1.5">
                    <label class="df-attr-label">{{ skill.name }}</label>
                    <span 
                      v-if="sheetData.skillSpecialties?.talents?.[skill.key]" 
                      class="text-xs px-1.5 py-0.5 rounded bg-df-gold/10 text-df-gold border border-df-gold/20"
                    >
                      {{ sheetData.skillSpecialties.talents[skill.key] }}
                    </span>
                  </div>
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
          </div>

          <!-- Perícias -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              Perícias
            </h3>
            <div class="space-y-3">
              <div v-for="skill in skills" :key="skill.key" class="flex flex-col">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-1.5">
                    <label class="df-attr-label">{{ skill.name }}</label>
                    <span 
                      v-if="sheetData.skillSpecialties?.skills?.[skill.key]" 
                      class="text-xs px-1.5 py-0.5 rounded bg-df-gold/10 text-df-gold border border-df-gold/20"
                    >
                      {{ sheetData.skillSpecialties.skills[skill.key] }}
                    </span>
                  </div>
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
          </div>

          <!-- Conhecimentos -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
              Conhecimentos
            </h3>
            <div class="space-y-3">
              <div v-for="skill in knowledges" :key="skill.key" class="flex flex-col">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-1.5">
                    <label class="df-attr-label">{{ skill.name }}</label>
                    <span 
                      v-if="sheetData.skillSpecialties?.knowledges?.[skill.key]" 
                      class="text-xs px-1.5 py-0.5 rounded bg-df-gold/10 text-df-gold border border-df-gold/20"
                    >
                      {{ sheetData.skillSpecialties.knowledges[skill.key] }}
                    </span>
                  </div>
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
        </div>

        <!-- Campos com Bolinhas: Grid 2 colunas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:items-start">
          <div class="space-y-3 flex flex-col items-start">
            <!-- Disciplinas -->
            <div class="df-card w-full">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
                Disciplinas
              </h3>
              <div 
                class="space-y-2 pr-2 scrollbar-thin scrollbar-thumb-df-border-red/50 scrollbar-track-transparent"
                :class="sheetData.disciplines.length >= 4 ? 'max-h-[165px] overflow-y-auto' : ''"
              >
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
              </div>
              <BaseButton
                v-if="canEdit"
                variant="outline"
                size="sm"
                type="button"
                @click="addDiscipline"
                class="w-full mt-2"
              >
                + Disciplina
              </BaseButton>
            </div>

            <!-- Vantagens & Defeitos -->
            <div class="df-card h-auto min-h-0 flex-shrink-0 w-full">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Vantagens &amp; Defeitos
              </h3>
              <div 
                v-if="sheetData.advantages.length > 0"
                class="space-y-3 pr-2 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-df-border-red/50 scrollbar-track-transparent"
              >
                <template v-for="(adv, idx) in sheetData.advantages" :key="idx">
                  <div 
                    v-if="isValidAdvantage(adv)"
                    class="space-y-2 p-3 rounded-lg border border-df-border-silver/20 bg-df-deep/20"
                  >
                  <!-- Linha 1: Categoria e Tipo -->
                  <div class="grid grid-cols-2 gap-2">
                    <!-- Dropdown 1: Categoria -->
                    <div>
                      <label class="text-xs text-df-muted mb-1 block">Categoria</label>
                      <select
                        v-model="adv.category"
                        @change="onCategoryChange(Number(idx))"
                        :disabled="!canEdit || adv.fixo"
                        class="df-input w-full"
                      >
                        <option value="">Selecione...</option>
                        <option value="Antecedente">Antecedente</option>
                        <option value="Mérito">Mérito</option>
                        <option value="Defeito">Defeito</option>
                        <option value="Folha de Lore">Folha de Lore</option>
                      </select>
                    </div>
                    
                    <!-- Dropdown 2: Tipo (condicional) -->
                    <div v-if="shouldShowTypeDropdown(adv.category)">
                      <label class="text-xs text-df-muted mb-1 block">Tipo</label>
                      <select
                        v-model="adv.type"
                        @change="onTypeChange(Number(idx))"
                        :disabled="!canEdit || adv.fixo"
                        class="df-input w-full"
                      >
                        <option value="">Selecione...</option>
                        <option v-for="opt in getSubcategoryOptions(adv.category)" :key="opt" :value="opt">
                          {{ opt }}
                        </option>
                      </select>
                    </div>
                  </div>
                  
                  <!-- Linha 2: Nome, Dots e Detalhes -->
                  <div class="flex items-end gap-2">
                    <!-- Dropdown 3: Nome -->
                    <div class="flex-1">
                      <label class="text-xs text-df-muted mb-1 block">Nome</label>
                      <select
                        v-model="adv.name"
                        @change="onNameChange(Number(idx))"
                        :disabled="!canEdit || adv.fixo || !adv.category || (shouldShowTypeDropdown(adv.category) && !adv.type)"
                        class="df-input w-full"
                      >
                        <option value="">Selecione...</option>
                        <option v-for="opt in getNameOptions(adv)" :key="opt" :value="opt">
                          {{ opt }}
                        </option>
                      </select>
                    </div>
                    
                    <!-- Seletor de Pontuação (Dots) -->
                    <div class="flex gap-1 pb-0.5">
                      <button
                        v-for="level in (adv.maxLevel || 5)"
                        :key="level"
                        type="button"
                        @click="setAdvantageLevel(Number(idx), level)"
                        :disabled="!canEdit || adv.fixo"
                        :class="[
                          'df-dot df-dot-md',
                          adv.level >= level
                            ? 'df-dot-filled'
                            : 'df-dot-empty',
                          adv.fixo ? 'opacity-60 cursor-not-allowed' : ''
                        ]"
                        :title="adv.fixo ? 'Pontuação fixa (não editável)' : `Nível ${level}`"
                      >
                        <span class="sr-only">Nível {{ level }}</span>
                      </button>
                    </div>
                    
                    <!-- Botão Deletar -->
                    <button
                      v-if="canEdit && !adv.fixo"
                      type="button"
                      @click="removeAdvantage(Number(idx))"
                      class="df-btn-remove pb-0.5"
                      title="Remover"
                    >
                      <svg class="w-5 h-5" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <!-- Linha 3: Input de Detalhes -->
                  <div>
                    <label class="text-xs text-df-muted mb-1 block">Detalhes/Especificação</label>
                    <input
                      v-model="adv.details"
                      type="text"
                      placeholder="Ex: Nome do contato, descrição do refúgio, etc..."
                      @input="hasUnsavedChanges = true"
                      :disabled="!canEdit"
                      class="df-input w-full"
                    />
                  </div>
                </div>
              </template>
            </div>
                
            <BaseButton
              v-if="props.canEdit"
              variant="ghost"
              @click="addAdvantage"
              :disabled="sheetData.advantages.length >= 10"
              class="w-full text-sm mt-3"
              :class="{ 'opacity-50 cursor-not-allowed': sheetData.advantages.length >= 10 }"
            >
              + Adicionar Vantagem/Defeito ({{ sheetData.advantages.length }}/10)
            </BaseButton>
          </div>
        </div>

          <div class="space-y-3 flex flex-col">
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
            <div class="df-card">
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

            <!-- Fome -->
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.5 2 2 6 2 10.5c0 2.5 1.5 4.5 3 5.5L7 22l2.5-5h5L17 22l2-6c1.5-1 3-3 3-5.5C22 6 17.5 2 12 2z"/><path d="M9 11v3.5"/><path d="M15 11v3.5"/></svg>
                Fome
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="df-sub-label">Nível de Fome</label>
                  <div class="flex gap-1 mt-2">
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
                <div>
                  <label class="df-sub-label">Estado</label>
                  <div class="text-sm text-df-muted mt-1">
                    {{ 
                      (sheetData.hunger || 0) === 0 ? 'Saciado' :
                      (sheetData.hunger || 0) === 1 ? 'Satisfeito' :
                      (sheetData.hunger || 0) === 2 ? 'Faminto' :
                      (sheetData.hunger || 0) === 3 ? 'Voraz' :
                      (sheetData.hunger || 0) === 4 ? 'Famélico' :
                      'Besta Descontrolada'
                    }}
                  </div>
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
                      'df-dot df-dot-sm df-dot-gold',
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
                      'df-dot df-dot-sm df-dot-gold',
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
                      'df-dot df-dot-sm df-dot-gold',
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

        <!-- Perdição do Clã -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 00-8 8c0 3.5 2 6 4 7.5V20h8v-2.5c2-1.5 4-4 4-7.5a8 8 0 00-8-8z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 16h6"/><path d="M10 20v2"/><path d="M14 20v2"/></svg>
            Perdição do Clã
          </h3>
          <div v-if="sheetData.clan && clanBanes[sheetData.clan]" class="p-4 rounded-lg border border-df-border-red/30 bg-df-deep/30">
            <p class="text-df-silver text-sm leading-relaxed whitespace-pre-line">{{ clanBanes[sheetData.clan] }}</p>
          </div>
          <div v-else class="p-4 rounded-lg border border-df-border-silver/20 bg-df-deep/20">
            <p class="text-df-muted text-sm italic">Selecione um clã para ver a Perdição correspondente.</p>
          </div>
        </div>

        <!-- Ressonância -->
        <div class="df-card">
          <h3 class="df-section-title">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Ressonância
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Tipo de Ressonância -->
            <div>
              <label class="text-xs text-df-muted mb-1.5 block">Tipo</label>
              <select
                v-model="sheetData.resonance"
                @change="hasUnsavedChanges = true"
                :disabled="!canEdit"
                class="df-input"
              >
                <option value="">Selecione...</option>
                <option value="Colérica">Colérica (Choleric)</option>
                <option value="Melancólica">Melancólica (Melancholic)</option>
                <option value="Flegmática">Flegmática (Phlegmatic)</option>
                <option value="Sanguínea">Sanguínea (Sanguine)</option>
                <option value="Animal">Animal</option>
              </select>
            </div>
            <!-- Intensidade da Ressonância -->
            <div>
              <label class="text-xs text-df-muted mb-1.5 block">Intensidade</label>
              <select
                v-model="sheetData.resonanceIntensity"
                @change="hasUnsavedChanges = true"
                :disabled="!canEdit"
                class="df-input"
              >
                <option value="">Nenhuma</option>
                <option value="Fugaz">Fugaz (Fleeting)</option>
                <option value="Intensa">Intensa (Intense)</option>
                <option value="Aguda">Aguda (Acute)</option>
                <option value="Discrasia">Discrasia (Dyscrasia)</option>
              </select>
            </div>
          </div>
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

  <!-- Modal de Escolhas do Predador -->
  <div
    v-if="showPredatorModal"
    class="fixed inset-0 z-[10002] flex items-center justify-center bg-black/80 p-4"
    @click.self="closePredatorModal"
  >
    <div class="bg-df-card border border-df-border-silver rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
      <h2 class="text-2xl font-bold text-df-text-gold mb-4">
        {{ predatorModalData.title }}
      </h2>
      <p class="text-df-muted mb-6">
        {{ predatorModalData.description }}
      </p>

      <!-- Lista de Escolhas -->
      <div class="space-y-6">
        <!-- Escolha de Disciplina -->
        <div v-if="predatorModalData.choices.discipline" class="space-y-2">
          <label class="df-label">Escolha uma Disciplina:</label>
          <div class="flex flex-col gap-2">
            <button
              v-for="option in predatorModalData.choices.discipline.options"
              :key="option"
              @click="selectDiscipline(option)"
              :disabled="isDisciplineRestricted(option)"
              :title="isDisciplineRestricted(option) ? `Exclusivo para clã ${predatorModalData.choices.discipline.restriction?.[option]}` : ''"
              :class="[
                'p-3 rounded-lg border-2 text-left transition-all',
                selectedChoices.discipline === option
                  ? 'border-df-border-gold bg-df-border-gold/10'
                  : isDisciplineRestricted(option)
                  ? 'border-df-border-silver/10 bg-df-deep/40 opacity-50 cursor-not-allowed'
                  : 'border-df-border-silver/30 hover:border-df-border-silver'
              ]"
            >
              {{ option }}
              <span v-if="isDisciplineRestricted(option)" class="text-xs text-df-muted ml-2">
                (Exclusivo {{ predatorModalData.choices.discipline.restriction?.[option] }})
              </span>
            </button>
          </div>
        </div>

        <!-- Escolha de Especialidade -->
        <div v-if="predatorModalData.choices.specialty" class="space-y-2">
          <label class="df-label">Escolha uma Especialidade:</label>
          <div class="flex flex-col gap-2">
            <button
              v-for="option in predatorModalData.choices.specialty.options"
              :key="option"
              @click="selectedChoices.specialty = option"
              :class="[
                'p-3 rounded-lg border-2 text-left transition-all',
                selectedChoices.specialty === option
                  ? 'border-df-border-gold bg-df-border-gold/10'
                  : 'border-df-border-silver/30 hover:border-df-border-silver'
              ]"
            >
              {{ option }}
            </button>
          </div>
          
          <!-- Input customizado para especialidades específicas -->
          <div v-if="needsCustomSpecialtyInput(selectedChoices.specialty)" class="mt-3">
            <label class="text-df-text text-sm mb-1 block">Especifique:</label>
            <input
              v-model="selectedChoices.specialtyCustom"
              type="text"
              :placeholder="getCustomSpecialtyPlaceholder(selectedChoices.specialty)"
              class="df-input w-full"
            />
          </div>
        </div>

        <!-- Escolha de Mérito -->
        <div v-if="predatorModalData.choices.merit" class="space-y-2">
          <label class="df-label">Escolha um Mérito:</label>
          <div class="flex flex-col gap-2">
            <button
              v-for="option in predatorModalData.choices.merit.options"
              :key="option"
              @click="selectedChoices.merit = option"
              :class="[
                'p-3 rounded-lg border-2 text-left transition-all',
                selectedChoices.merit === option
                  ? 'border-df-border-gold bg-df-border-gold/10'
                  : 'border-df-border-silver/30 hover:border-df-border-silver'
              ]"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- Escolha de Defeito -->
        <div v-if="predatorModalData.choices.flaw" class="space-y-2">
          <label class="df-label">Escolha um Defeito:</label>
          <div class="flex flex-col gap-2">
            <button
              v-for="option in predatorModalData.choices.flaw.options"
              :key="option"
              @click="selectedChoices.flaw = option"
              :class="[
                'p-3 rounded-lg border-2 text-left transition-all',
                selectedChoices.flaw === option
                  ? 'border-df-border-gold bg-df-border-gold/10'
                  : 'border-df-border-silver/30 hover:border-df-border-silver'
              ]"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- Distribuição de Pontos de Antecedentes (Osiris) -->
        <div v-if="predatorModalData.choices.pointDistribution" class="space-y-3">
          <label class="df-label">
            Distribua {{ predatorModalData.choices.pointDistribution.total }} pontos entre {{ predatorModalData.choices.pointDistribution.options.join(' e ') }}:
          </label>
          <div class="space-y-3">
            <div v-for="option in predatorModalData.choices.pointDistribution.options" :key="option">
              <label class="text-df-text text-sm">{{ option }}:</label>
              <input
                v-model.number="selectedChoices.backgroundPoints![option]"
                @input="validateBackgroundPoints(option)"
                type="number"
                min="0"
                :max="getMaxBackgroundPoints(option)"
                class="df-input mt-1"
              />
            </div>
            <p class="text-sm text-df-muted">
              Pontos distribuídos: {{ getTotalBackgroundPoints() }} / {{ predatorModalData.choices.pointDistribution.total }}
            </p>
          </div>
        </div>

        <!-- Distribuição de Pontos de Defeitos (Osiris) -->
        <div v-if="predatorModalData.choices.flawDistribution" class="space-y-3">
          <label class="df-label">
            Distribua {{ predatorModalData.choices.flawDistribution.total }} pontos entre {{ predatorModalData.choices.flawDistribution.options.join(' e ') }}:
          </label>
          <div class="space-y-3">
            <div v-for="option in predatorModalData.choices.flawDistribution.options" :key="option">
              <label class="text-df-text text-sm">{{ option }}:</label>
              <input
                v-model.number="selectedChoices.flawPoints![option]"
                @input="validateFlawPoints(option)"
                type="number"
                min="0"
                :max="getMaxFlawPoints(option)"
                class="df-input mt-1"
              />
            </div>
            <p class="text-sm text-df-muted">
              Pontos distribuídos: {{ getTotalFlawPoints() }} / {{ predatorModalData.choices.flawDistribution.total }}
            </p>
          </div>
        </div>
      </div>

      <!-- Botões -->
      <div class="flex gap-3 mt-6">
        <BaseButton
          variant="ghost"
          @click="closePredatorModal"
          class="flex-1"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="applyPredatorChoices"
          :disabled="!canConfirmPredatorChoices"
          class="flex-1"
        >
          Confirmar
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import type { Ref } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import { useToast } from '~/composables/useToast'

const toast = useToast()

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

// ===== SISTEMA DE PREDADORES V5 =====
const showPredatorModal = ref(false)
const selectedPredatorType = ref('')
const previousPredatorType = ref('')

// Rastrear valores ORIGINAIS antes de qualquer predador (para restaurar ao trocar)
interface OriginalPredatorValues {
  humanity: number
  bloodPotency: number
  disciplinesSnapshot: Array<{ name: string, level: number }>
}

const originalPredatorValues = ref<OriginalPredatorValues | null>(null)

// Flag para evitar múltiplas execuções do onMounted
const snapshotInitialized = ref(false)

// Rastrear modificações aplicadas pelo predador para permitir limpeza ao trocar
interface AppliedPredatorData {
  predatorName: string
  humanityChange: number
  bloodPotencyChange?: number
  disciplineAdded?: string
  advantageIndices: number[] // Índices das vantagens adicionadas
}

const appliedPredatorData = ref<AppliedPredatorData | null>(null)

// Metadata do predador salvo no banco (para restaurar estado correto ao reabrir ficha)
interface PredatorMetadata {
  predatorName: string
  humanityChange: number
  bloodPotencyChange: number
  disciplineAdded?: string // Nome da disciplina adicionada
  fixedAdvantagesCount: number // Quantas vantagens fixas foram adicionadas
}

interface PredatorChoice {
  discipline?: string
  specialty?: string
  specialtyCustom?: string
  merit?: string
  flaw?: string
  backgroundPoints?: Record<string, number>
  flawPoints?: Record<string, number>
}

const selectedChoices = ref<PredatorChoice>({})

interface PredatorModalData {
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

const predatorModalData = ref<PredatorModalData>({
  title: '',
  description: '',
  choices: {}
})

interface PredatorConfig {
  humanityChange: number
  bloodPotencyChange?: number
  restrictedClans?: string[]
  choices: {
    discipline?: string[]
    disciplineRestriction?: Record<string, string>
    specialty?: string[]
    specialtyCustomInput?: string[]
    merit?: string[]
    flaw?: string[]
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
  fixedAdvantages: Array<{
    category: string
    type: string
    name: string
    level: number
    details: string
    fixo: boolean
  }>
}

// Configuração completa dos Tipos de Predador V5
const predatorTypes: Record<string, PredatorConfig> = {
  'Consensualista': {
    humanityChange: 1,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Auspícios', 'Fortitude'],
      specialty: ['Medicina (Flebotomia)', 'Persuasão (Bolsas)']
    },
    fixedAdvantages: [
      { category: 'Defeito', type: 'Social', name: 'Segredo Sombrio', level: 1, details: 'Quebrador da Máscara', fixo: true },
      { category: 'Defeito', type: 'Físico', name: 'Alimentação', level: 1, details: 'Exclusão de presa (sem consentimento)', fixo: true }
    ]
  },
  'Fazendeiro': {
    humanityChange: 1,
    bloodPotencyChange: 0,
    restrictedClans: ['Ventrue'],
    choices: {
      discipline: ['Animalismo', 'Proteanismo'],
      specialty: ['Empatia com animais (Animal Específico)', 'Sobrevivência (Caça)']
    },
    fixedAdvantages: [
      { category: 'Defeito', type: 'Físico', name: 'Alimentação', level: 2, details: 'Fazendeiro', fixo: true }
    ]
  },
  'Osiris': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Feitiçaria de Sangue', 'Presença'],
      disciplineRestriction: { 'Feitiçaria de Sangue': 'Tremere' },
      specialty: ['Ocultismo (Tradição Específica)', 'Performance (Campo específico)'],
      specialtyCustomInput: ['Ocultismo (Tradição Específica)', 'Performance (Campo específico)'],
      pointDistribution: {
        type: 'backgrounds',
        total: 3,
        options: ['Fama', 'Rebanho']
      },
      flawDistribution: {
        type: 'flaws',
        total: 2,
        options: ['Inimigo', 'Inimigo Mítico']
      }
    },
    fixedAdvantages: []
  },
  'Sacoleiro': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: ['Ventrue'],
    choices: {
      discipline: ['Feitiçaria de Sangue', 'Ofuscação'],
      disciplineRestriction: { 'Feitiçaria de Sangue': 'Tremere' },
      specialty: ['Ladroagem (Abrir Fechaduras)', 'Manha (Mercado Negro)']
    },
    fixedAdvantages: [
      { category: 'Mérito', type: 'Físico', name: 'Alimentação', level: 3, details: 'Esôfago de Ferro', fixo: true },
      { category: 'Defeito', type: 'Social', name: 'Inimigo', level: 2, details: 'Alguém acredita que você lhe deve ou há outro motivo para ficar fora das ruas', fixo: true }
    ]
  },
  'Sandman': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Auspícios', 'Ofuscação'],
      specialty: ['Medicina (Anestésicos)', 'Furtividade (Invasão)']
    },
    fixedAdvantages: [
      { category: 'Antecedente', type: '', name: 'Recursos', level: 1, details: '', fixo: true }
    ]
  },
  'Sanguessuga': {
    humanityChange: -1,
    bloodPotencyChange: 1,
    restrictedClans: [],
    choices: {
      discipline: ['Celeridade', 'Proteanismo'],
      specialty: ['Briga (Membros)', 'Furtividade (Contra Membros)'],
      flaw: ['Segredo Sombrio (Diablerista)', 'Segregado']
    },
    fixedAdvantages: [
      { category: 'Defeito', type: 'Físico', name: 'Alimentação', level: 2, details: 'Exclusão de Presa (mortais)', fixo: true }
    ]
  },
  'Scene Queen': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Dominação', 'Potência'],
      specialty: ['Etiqueta (Cena Específica)', 'Liderança (Cena Específica)', 'Manha (Cena Específica)'],
      specialtyCustomInput: ['Etiqueta (Cena Específica)', 'Liderança (Cena Específica)', 'Manha (Cena Específica)'],
      flaw: ['Influência (Rejeitado)', 'Alimentação (Exclusão de Presa)']
    },
    fixedAdvantages: [
      { category: 'Antecedente', type: '', name: 'Fama', level: 1, details: '', fixo: true },
      { category: 'Antecedente', type: '', name: 'Contatos', level: 1, details: '', fixo: true }
    ]
  },
  'Sereia': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Fortitude', 'Presença'],
      specialty: ['Persuasão (Sedução)', 'Subterfúgio (Sedução)']
    },
    fixedAdvantages: [
      { category: 'Mérito', type: 'Físico', name: 'Visual', level: 2, details: 'Belo', fixo: true },
      { category: 'Defeito', type: 'Social', name: 'Inimigo', level: 1, details: 'Um amante desprezado ou parceiro ciumento', fixo: true }
    ]
  },
  'Trinchador': {
    humanityChange: 0,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Dominação', 'Animalismo'],
      specialty: ['Persuasão (Gaslighting)', 'Subterfúgio (Encobrimento)']
    },
    fixedAdvantages: [
      { category: 'Defeito', type: 'Social', name: 'Segredo Sombrio', level: 1, details: 'Trinchador', fixo: true },
      { category: 'Antecedente', type: '', name: 'Rebanho', level: 2, details: '', fixo: true }
    ]
  },
  'Vira-Lata': {
    humanityChange: -1,
    bloodPotencyChange: 0,
    restrictedClans: [],
    choices: {
      discipline: ['Celeridade', 'Potência'],
      specialty: ['Intimidação (Assalto à Mão Armada)', 'Briga (Agarramento)']
    },
    fixedAdvantages: [
      { category: 'Antecedente', type: '', name: 'Contatos', level: 3, details: 'Contatos Criminosos', fixo: true }
    ]
  }
}

// Mapeamento de especialidades para habilidades específicas
const specialtyMapping: Record<string, { category: 'talents' | 'skills' | 'knowledges', skill: string }> = {
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

// Verificar se uma vantagem é válida para exibição
const isValidAdvantage = (adv: any): boolean => {
  // Vantagens editáveis (não fixas) sempre aparecem, mesmo vazias (para permitir edição)
  if (!adv.fixo) return true
  
  // Para vantagens fixas (do predador), validar se tem nome
  if (!adv.name || adv.name.trim() === '') return false
  
  // Remover entradas que são especialidades antigas (formato "Habilidade (Especialidade)")
  if (adv.name === 'Especialidade' && adv.details && adv.details.includes('(') && adv.details.includes(')')) {
    return false
  }
  
  return true
}

// Validação para habilitar o botão de confirmar
const canConfirmPredatorChoices = computed(() => {
  const config = predatorTypes[selectedPredatorType.value as keyof typeof predatorTypes]
  if (!config) return false

  const choices = config.choices

  // Verificar escolha de disciplina
  if (choices.discipline && !selectedChoices.value.discipline) return false

  // Verificar escolha de especialidade
  if (choices.specialty && !selectedChoices.value.specialty) return false
  
  // Verificar input customizado de especialidade (se necessário)
  if (needsCustomSpecialtyInput(selectedChoices.value.specialty) && !selectedChoices.value.specialtyCustom) return false

  // Verificar escolha de mérito
  if (choices.merit && !selectedChoices.value.merit) return false

  // Verificar escolha de defeito
  if (choices.flaw && !selectedChoices.value.flaw) return false

  // Verificar distribuição de pontos de antecedentes
  if (choices.pointDistribution) {
    const total = getTotalBackgroundPoints()
    if (total !== choices.pointDistribution.total) return false
  }

  // Verificar distribuição de pontos de defeitos
  if (choices.flawDistribution) {
    const total = getTotalFlawPoints()
    if (total !== choices.flawDistribution.total) return false
  }

  return true
})

// Abrir modal de escolhas do predador
const openPredatorModal = (predatorType: string) => {
  const config = predatorTypes[predatorType as keyof typeof predatorTypes]
  if (!config) return

  // Verificar restrições de clã
  if (config.restrictedClans && config.restrictedClans.includes(sheetData.value.clan)) {
    toast.error(`O clã ${sheetData.value.clan} não pode escolher o tipo de predador ${predatorType}`)
    sheetData.value.predator = previousPredatorType.value
    return
  }

  selectedPredatorType.value = predatorType
  selectedChoices.value = {}

  // Preparar dados do modal
  predatorModalData.value = {
    title: `Tipo de Predador: ${predatorType}`,
    description: 'Faça suas escolhas para completar a configuração do seu predador:',
    choices: {}
  }

  if (config.choices.discipline) {
    predatorModalData.value.choices.discipline = {
      options: config.choices.discipline,
      restriction: config.choices.disciplineRestriction
    }
  }

  if (config.choices.specialty) {
    predatorModalData.value.choices.specialty = {
      options: config.choices.specialty,
      customInput: config.choices.specialtyCustomInput
    }
  }

  if (config.choices.merit) {
    predatorModalData.value.choices.merit = {
      options: config.choices.merit
    }
  }

  if (config.choices.flaw) {
    predatorModalData.value.choices.flaw = {
      options: config.choices.flaw
    }
  }

  if (config.choices.pointDistribution) {
    predatorModalData.value.choices.pointDistribution = config.choices.pointDistribution
    selectedChoices.value.backgroundPoints = {}
    // Inicializar cada opção com 0
    config.choices.pointDistribution.options.forEach(option => {
      selectedChoices.value.backgroundPoints![option] = 0
    })
  }

  if (config.choices.flawDistribution) {
    predatorModalData.value.choices.flawDistribution = config.choices.flawDistribution
    selectedChoices.value.flawPoints = {}
    // Inicializar cada opção com 0
    config.choices.flawDistribution.options.forEach(option => {
      selectedChoices.value.flawPoints![option] = 0
    })
  }

  showPredatorModal.value = true
}

// Fechar modal
const closePredatorModal = () => {
  showPredatorModal.value = false
  // Reverter seleção se cancelou
  sheetData.value.predator = previousPredatorType.value
}

// Verificar se disciplina está restrita (apenas para clãs específicos)
const isDisciplineRestricted = (discipline: string): boolean => {
  const restriction = predatorModalData.value.choices.discipline?.restriction
  if (!restriction || !restriction[discipline]) return false
  return sheetData.value.clan !== restriction[discipline]
}

// Selecionar disciplina (se não estiver restrita)
const selectDiscipline = (discipline: string) => {
  if (!isDisciplineRestricted(discipline)) {
    selectedChoices.value.discipline = discipline
  }
}

// Verificar se especialidade precisa de input customizado
const needsCustomSpecialtyInput = (specialty?: string): boolean => {
  if (!specialty) return false
  const customInputOptions = predatorModalData.value.choices.specialty?.customInput || []
  return customInputOptions.includes(specialty)
}

// Placeholder para input customizado de especialidade
const getCustomSpecialtyPlaceholder = (specialty?: string): string => {
  if (!specialty) return ''
  if (specialty.includes('Performance')) return 'Ex: Música, Dança, Teatro...'
  if (specialty.includes('Cena Específica')) return 'Ex: Góticos, Clubbers, Cosplayers...'
  if (specialty.includes('Animal Específico')) return 'Ex: Lobos, Gatos, Ratos...'
  if (specialty.includes('Ocultismo')) return 'Ex: Hermetismo, Kabbalah, Vodu...'
  return 'Especifique...'
}

// Calcular total de pontos de antecedentes distribuídos
const getTotalBackgroundPoints = (): number => {
  if (!selectedChoices.value.backgroundPoints) return 0
  return Object.values(selectedChoices.value.backgroundPoints).reduce((sum, val) => sum + (val || 0), 0)
}

// Calcular total de pontos de defeitos distribuídos
const getTotalFlawPoints = (): number => {
  if (!selectedChoices.value.flawPoints) return 0
  return Object.values(selectedChoices.value.flawPoints).reduce((sum, val) => sum + (val || 0), 0)
}

// Calcular máximo permitido para um antecedente específico
const getMaxBackgroundPoints = (option: string): number => {
  if (!predatorModalData.value.choices.pointDistribution) return 0
  const total = predatorModalData.value.choices.pointDistribution.total
  const currentTotal = getTotalBackgroundPoints()
  const currentValue = selectedChoices.value.backgroundPoints?.[option] || 0
  return total - (currentTotal - currentValue)
}

// Calcular máximo permitido para um defeito específico
const getMaxFlawPoints = (option: string): number => {
  if (!predatorModalData.value.choices.flawDistribution) return 0
  const total = predatorModalData.value.choices.flawDistribution.total
  const currentTotal = getTotalFlawPoints()
  const currentValue = selectedChoices.value.flawPoints?.[option] || 0
  return total - (currentTotal - currentValue)
}

// Validar pontos de antecedentes para não ultrapassar o total
const validateBackgroundPoints = (option: string) => {
  if (!predatorModalData.value.choices.pointDistribution) return
  if (!selectedChoices.value.backgroundPoints) {
    selectedChoices.value.backgroundPoints = {}
  }
  
  const total = predatorModalData.value.choices.pointDistribution.total
  const max = getMaxBackgroundPoints(option)
  const currentValue = selectedChoices.value.backgroundPoints[option] || 0
  
  // Garantir que não seja negativo
  if (currentValue < 0) {
    selectedChoices.value.backgroundPoints[option] = 0
  }
  
  // Garantir que não ultrapasse o máximo permitido
  if (currentValue > max) {
    selectedChoices.value.backgroundPoints[option] = max
  }
}

// Validar pontos de defeitos para não ultrapassar o total
const validateFlawPoints = (option: string) => {
  if (!predatorModalData.value.choices.flawDistribution) return
  if (!selectedChoices.value.flawPoints) {
    selectedChoices.value.flawPoints = {}
  }
  
  const total = predatorModalData.value.choices.flawDistribution.total
  const max = getMaxFlawPoints(option)
  const currentValue = selectedChoices.value.flawPoints[option] || 0
  
  // Garantir que não seja negativo
  if (currentValue < 0) {
    selectedChoices.value.flawPoints[option] = 0
  }
  
  // Garantir que não ultrapasse o máximo permitido
  if (currentValue > max) {
    selectedChoices.value.flawPoints[option] = max
  }
}

// Limpar dados do predador anterior antes de aplicar novo
const clearPreviousPredatorData = () => {
  console.log('🧹 clearPreviousPredatorData: Iniciando limpeza')
  
  // SEMPRE limpar especialidades, independente de ter appliedPredatorData
  // Limpar mantendo a reatividade do Vue (não substituir o objeto, apenas limpar as chaves)
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

  // Remover TODAS as vantagens/defeitos fixos (do predador)
  const advantagesBefore = sheetData.value.advantages.length
  sheetData.value.advantages = sheetData.value.advantages.filter((adv: any) => !adv.fixo)
  const advantagesAfter = sheetData.value.advantages.length
  console.log(`   ✅ Vantagens fixas removidas (${advantagesBefore} → ${advantagesAfter})`)

  // Se temos valores originais salvos, RESTAURAR para eles (não reverter incrementalmente)
  if (originalPredatorValues.value) {
    console.log('🔄 Restaurando valores originais do snapshot:', JSON.stringify(originalPredatorValues.value))
    
    // 1. Restaurar Humanidade original
    const oldHumanity = sheetData.value.humanity
    sheetData.value.humanity = originalPredatorValues.value.humanity
    console.log(`   ✅ Humanidade: ${oldHumanity} → ${sheetData.value.humanity}`)

    // 2. Restaurar Potência de Sangue original
    const oldBloodPotency = sheetData.value.bloodPotency
    sheetData.value.bloodPotency = originalPredatorValues.value.bloodPotency
    console.log(`   ✅ Potência Sangue: ${oldBloodPotency} → ${sheetData.value.bloodPotency}`)

    // 3. Restaurar Disciplinas originais (snapshot completo)
    const oldDisciplines = JSON.stringify(sheetData.value.disciplines)
    
    // Criar novo array com cópia dos valores do snapshot (evitar referências)
    sheetData.value.disciplines = originalPredatorValues.value.disciplinesSnapshot.map(d => ({
      name: d.name,
      level: Math.max(1, d.level) // Garantir que nunca seja 0 ou negativo
    }))
    
    const newDisciplines = JSON.stringify(sheetData.value.disciplines)
    console.log(`   ✅ Disciplinas restauradas:`)
    console.log(`      Antes: ${oldDisciplines}`)
    console.log(`      Depois: ${newDisciplines}`)
    console.log(`      Snapshot: ${JSON.stringify(originalPredatorValues.value.disciplinesSnapshot)}`)
  } else {
    console.log('⚠️ Nenhum snapshot original encontrado! Não foi possível restaurar valores.')
  }

  // Limpar rastreamento
  appliedPredatorData.value = null
  
  // Limpar metadata do predador (será recriado ao aplicar novo predador)
  delete (sheetData.value as any)._predatorMetadata
  console.log('🧹 clearPreviousPredatorData: Limpeza concluída')
}

// Aplicar escolhas do predador
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

  // PASSO -1: Salvar valores originais ANTES de qualquer modificação (apenas se não tiver snapshot)
  // Isso só acontece quando aplica predador pela PRIMEIRA VEZ em uma ficha nova
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

  // PASSO 0: Limpar dados do predador anterior (restaura valores originais)
  console.log('🧹 Limpando predador anterior antes de aplicar novo')
  clearPreviousPredatorData()
  
  console.log('📊 Estado DEPOIS de limpar:')
  console.log('   - Humanidade:', sheetData.value.humanity)
  console.log('   - Potência Sangue:', sheetData.value.bloodPotency)
  console.log('   - Disciplinas:', JSON.stringify(sheetData.value.disciplines))

  // Inicializar rastreamento das modificações
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

  // 2. Aplicar mudança de Potência de Sangue (Sanguessuga +1)
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

  // 4. Injetar especialidade escolhida diretamente na habilidade
  if (selectedChoices.value.specialty) {
    const mapping = specialtyMapping[selectedChoices.value.specialty]
    if (mapping) {
      // Se tiver texto customizado, usar ele. Senão, extrair o texto da especialidade padrão
      let specialtyText = ''
      if (selectedChoices.value.specialtyCustom) {
        specialtyText = selectedChoices.value.specialtyCustom
      } else {
        specialtyText = selectedChoices.value.specialty.match(/\(([^)]+)\)/)?.[1] || selectedChoices.value.specialty
      }
      
      // Injetar na habilidade correta
      if (!sheetData.value.skillSpecialties[mapping.category]) {
        sheetData.value.skillSpecialties[mapping.category] = {}
      }
      sheetData.value.skillSpecialties[mapping.category][mapping.skill] = specialtyText
    }
  }

  // 5. Adicionar vantagens e defeitos fixos
  config.fixedAdvantages.forEach(adv => {
    const currentLength = sheetData.value.advantages.length
    sheetData.value.advantages.push({ ...adv })
    trackingData.advantageIndices.push(currentLength)
  })

  // 6. Tratamento de distribuição de pontos de antecedentes (Osiris)
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

  // 7. Tratamento de distribuição de pontos de defeitos (Osiris)
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

  // 8. Tratamento de escolha de defeito (Sanguessuga, Scene Queen)
  if (selectedChoices.value.flaw && !config.choices.flawDistribution) {
    const currentLength = sheetData.value.advantages.length
    
    // Parse do defeito selecionado para extrair nome e nível
    let flawName = selectedChoices.value.flaw
    let flawLevel = 1
    let flawDetails = ''
    
    // Extrair informações do formato "Nome (Detalhes)"
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
    
    // Determinar o tipo correto baseado no defeito
    let flawType = 'Social' // Padrão para a maioria
    if (flawName === 'Alimentação') {
      flawType = 'Físico' // Alimentação é defeito físico
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

  // Salvar rastreamento das modificações
  appliedPredatorData.value = trackingData

  // Criar metadata para salvar no banco (permite restaurar estado correto ao reabrir ficha)
  const metadata: PredatorMetadata = {
    predatorName: selectedPredatorType.value,
    humanityChange: config.humanityChange,
    bloodPotencyChange: config.bloodPotencyChange || 0,
    disciplineAdded: trackingData.disciplineAdded,
    fixedAdvantagesCount: config.fixedAdvantages?.length || 0
  }
  
  // Adicionar metadata ao sheetData (será salvo no banco)
  ;(sheetData.value as any)._predatorMetadata = metadata
  
  console.log('💾 Metadata do predador criado:', JSON.stringify(metadata))
  console.log('📊 Estado FINAL após aplicar predador:')
  console.log('   - Predador:', sheetData.value.predator)
  console.log('   - Humanidade:', sheetData.value.humanity)
  console.log('   - Potência Sangue:', sheetData.value.bloodPotency)
  console.log('   - Disciplinas:', JSON.stringify(sheetData.value.disciplines))
  console.log('   - Snapshot BASE (não modificado):', JSON.stringify(originalPredatorValues.value))

  hasUnsavedChanges.value = true
  previousPredatorType.value = selectedPredatorType.value
  showPredatorModal.value = false

  toast.success(`Tipo de Predador "${selectedPredatorType.value}" aplicado com sucesso!`)
  console.log('✅ Predador aplicado com sucesso!')
}
// ===== FIM DO SISTEMA DE PREDADORES =====

// Helper para iniciais do avatar
const getInitials = (name: string) => {
  if (!name) return 'P'
  const words = name.split(' ').filter(w => w.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return words[0]?.[0]?.toUpperCase() || 'P'
}

// Dados de Vantagens & Defeitos V5
const vantagensDados = {
  antecedentes: ["Aliados", "Contatos", "Fama", "Influência", "Lacaios", "Mawla", "Rebanho", "Recursos", "Refúgio", "Status"],
  meritos: {
    fisicos: [
      { nome: "Atraente", pontos: 2, fixo: true },
      { nome: "Impressionante", pontos: 4, fixo: true },
      { nome: "Estômago de Ferro", pontos: 2, fixo: true },
      { nome: "Resistência a Toxinas", pontos: 1, fixo: true },
      { nome: "Visual", pontos: 2, fixo: true },
      { nome: "Alimentação", pontos: 3, fixo: true }
    ],
    mentais: [
      { nome: "Linguista", pontos: 1, fixo: false },
      { nome: "Mente Alerta", pontos: 2, fixo: true }
    ],
    sociais: [
      { nome: "Identidade Falsa", pontos: 3, fixo: false, max: 3 },
      { nome: "Língua Afiada", pontos: 2, fixo: true }
    ],
    sobrenaturais: [
      { nome: "Médium", pontos: 2, fixo: true },
      { nome: "Sentido do Perigo", pontos: 2, fixo: true },
      { nome: "Vontade de Ferro", pontos: 2, fixo: true }
    ],
    sangue_ralo: [
      { nome: "Alquimista de Sangue Ralo", pontos: 1, fixo: false },
      { nome: "Caminhante do Dia", pontos: 1, fixo: false },
      { nome: "Disciplina de Sangue Ralo", pontos: 1, fixo: false },
      { nome: "Aparência Humana", pontos: 1, fixo: true },
      { nome: "Sede Reduzida", pontos: 1, fixo: true }
    ]
  },
  defeitos: {
    fisicos: [
      { nome: "Feio", pontos: 2, fixo: true },
      { nome: "Repulsivo", pontos: 4, fixo: true },
      { nome: "Carne Racha", pontos: 1, fixo: true },
      { nome: "Bebedor Ineficiente", pontos: 2, fixo: true },
      { nome: "Restrição Alimentar", pontos: 1, fixo: false, max: 3 },
      { nome: "Sede Metódica", pontos: 1, fixo: true },
      { nome: "Alimentação", pontos: 1, fixo: false, max: 2 }
    ],
    mentais: [
      { nome: "Amnésia", pontos: 1, fixo: false, max: 2 },
      { nome: "Vício", pontos: 1, fixo: true },
      { nome: "Pesadelos", pontos: 1, fixo: true }
    ],
    sociais: [
      { nome: "Segredo Sombrio", pontos: 1, fixo: false, max: 2 },
      { nome: "Desacreditado", pontos: 1, fixo: true },
      { nome: "Identidade Trocada", pontos: 1, fixo: true },
      { nome: "Submisso", pontos: 1, fixo: true },
      { nome: "Criminoso", pontos: 1, fixo: true },
      { nome: "Inimigo", pontos: 1, fixo: false },
      { nome: "Segregado", pontos: 2, fixo: true },
      { nome: "Influência", pontos: 1, fixo: false },
      { nome: "Inimigo Mítico", pontos: 1, fixo: false }
    ],
    sobrenaturais: [
      { nome: "Assombrado", pontos: 1, fixo: false, max: 2 },
      { nome: "Presença Repulsiva", pontos: 2, fixo: true },
      { nome: "Repulsa do Sangue", pontos: 2, fixo: true }
    ],
    sangue_ralo: [
      { nome: "Bebedor de Fluidos", pontos: 1, fixo: true },
      { nome: "Cicatrizes de Caine", pontos: 1, fixo: true },
      { nome: "Fragilidade de Sangue Ralo", pontos: 1, fixo: true },
      { nome: "Marca da Besta", pontos: 1, fixo: true },
      { nome: "Mordida de Bebê", pontos: 1, fixo: true },
      { nome: "Rejeitado pelos Anarquistas", pontos: 1, fixo: true },
      { nome: "Caçado pela Camarilla", pontos: 1, fixo: true }
    ]
  },
  loresheets: ["O Movimento Anarquista", "A Camarilla", "A Segunda Inquisição", "Primeira Luz", "A Semana dos Pesadelos", "Descendente de Hardestadt", "Descendente de Helena", "Descendente de Louhi", "Descendente de Villon", "Descendente de Xaviar", "O Ministério de Set", "A Rede Nosferatu", "A Pirâmide Tremere / Casa Carna", "A Pirâmide Tremere / Casa Goratrix", "Bahari", "Culto de Shalim", "A Cinza", "Golconda"]
}

// Vampiro clãs V5
const vampireClans = [
  'Banu Haqim',
  'Brujah', 
  'Gangrel', 
  'Hecata',
  'Lasombra',
  'Malkavian', 
  'Nosferatu',
  'O Ministério',
  'Ravnos',
  'Salubri',
  'Toreador', 
  'Tremere', 
  'Tzimisce',
  'Ventrue',
  'Caitiff', 
  'Sangue Fraco'
]

// Perdições de Clã V5 (imutáveis por clã)
const clanBanes: Record<string, string> = {
  'Banu Haqim': 'Vício em Sangue. O sangue dos Banu Haqim anseia pela vitae de outros vampiros. Quando consomem sangue de outro Cainita, devem passar em um teste de Frenesi de Fome (Dificuldade 2 + Gravidade da Perdição) ou tentarão drenar o alvo até a morte. Além disso, seu sangue é tóxico para mortais, causando dano agravado caso tentem criar ghouls facilmente.',
  
  'Brujah': 'Temperamento Violento. O sangue dos Brujah ferve com uma fúria ancestral. O personagem sofre uma penalidade na parada de dados igual à sua Gravidade da Perdição em todos os testes feitos para resistir a um Frenesi de Fúria.',
  
  'Gangrel': 'Traços Bestiais. A Besta dos Gangrel molda sua carne. Sempre que o personagem entra em Frenesi, ele ganha uma ou mais características físicas animais. Esses traços duram por mais uma noite após o término do Frenesi e reduzem um Atributo (Social ou Mental) em 1 ponto por característica manifestada.',
  
  'Hecata': 'O Beijo Doloroso. Ao contrário dos outros vampiros, cujo Beijo traz êxtase, a mordida dos Hecata causa uma dor agonizante e excruciante. Suas vítimas mortais resistem violentamente. Cada vez que se alimentam, causam dano agravado à saúde da vítima igual à Gravidade da Perdição por nível de Fome saciado.',
  
  'Lasombra': 'Imagem Distorcida. A alma dos Lasombra está parcialmente submersa no Abismo. Seus reflexos e gravações eletrônicas distorcem, piscam ou ficam transparentes. Telas de toque falham frequentemente e o personagem sofre uma penalidade igual à Gravidade da Perdição em testes de tecnologia e para evitar sistemas de vigilância.',
  
  'Malkavian': 'Perturbação. A mente do Malkavian é permanentemente fragmentada por um transtorno psíquico. Sempre que o personagem sofre uma Falha Bestial ou ativa sua Compulsão de Clã, sua Perdição se manifesta: ele recebe uma penalidade igual à Gravidade da Perdição em uma categoria inteira de dados (Físicos, Sociais ou Mentais) até o fim da cena.',
  
  'O Ministério': 'Aversão à Luz. Como herdeiros de Set, os Ministros abominam a luz. Quando expostos a qualquer iluminação direta intensa (seja natural ou artificial, como holofotes e lâmpadas fortes de neon), sofrem uma penalidade igual à Gravidade da Perdição em todas as suas paradas de dados. Além disso, adicionam esse valor ao dano agravado recebido pela luz solar.',
  
  'Nosferatu': 'Hediondo. A maldição de Caine deforma os Nosferatu em monstros visuais. Eles falham automaticamente em qualquer teste de disfarce que tente passá-los por humanos normais (sem o uso de poderes como Ofuscação). Além disso, sofrem uma penalidade de dados igual à Gravidade da Perdição em testes sociais baseados na aparência física.',
  
  'Ravnos': 'Amaldiçoado. Os Ravnos são nômades eternos por punição divina. Se eles dormirem durante o dia no mesmo local (ou dentro de um raio de 1,6 km daquele local) mais de uma vez a cada sete noites, o sangue queima em suas veias. O jogador deve rolar dados equivalentes à sua Gravidade da Perdição; cada resultado "10" causa 1 ponto de Dano Agravado.',
  
  'Salubri': 'Caçado. Os Salubri possuem um terceiro olho no centro da testa que não pode ser ocultado por disciplinas. Sempre que ativam qualquer poder de Disciplina, o olho chora sangue (vitae). Além disso, o sangue dos Salubri é uma iguaria irresistível: qualquer vampiro que beba deles deve passar em um teste de Frenesi de Fome (Dificuldade 2 + Gravidade da Perdição) ou continuará bebendo até secá-los.',
  
  'Toreador': 'Obsessão Estética. Os Toreador são escravos da beleza. Quando o personagem se encontra em um ambiente que não seja esteticamente belo, deslumbrante ou artisticamente enriquecedor (como becos sujos, delegacias ou escritórios genéricos), ele sofre uma penalidade igual à sua Gravidade da Perdição em todas as paradas de dados para utilizar suas Disciplinas.',
  
  'Tremere': 'Laço Deficiente. Após a destruição da estrutura da Pirâmide, o sangue dos Tremere enfraqueceu no quesito submissão. Eles nunca podem criar Laços de Sangue com outros vampiros. Ao tentar laçar humanos ou ghouls, o processo exige que o alvo beba do sangue do Tremere um número de noites adicional igual à Gravidade da Perdição.',
  
  'Tzimisce': 'Solo Natal / Propriedade Territorial. Os Tzimisce são mestres possessivos ligados à sua terra. Ao entrar em repouso diurno, o personagem deve estar cercado por terra de um local de extrema importância para ele em sua vida mortal (sua terra natal, o local de seu abraço, etc.) ou de um território explicitamente reivindicado por ele. Caso não o faça, sofre penalidades pesadas em Força de Vontade e ações na noite seguinte.',
  
  'Ventrue': 'Paladar Rarefeito. Os Ventrue possuem um paladar aristocrático e extremamente restrito. Durante a criação da ficha, o jogador deve escolher uma classe estrita de presas (ex: apenas virgens, apenas criminosos, apenas pessoas de sangue nobre, etc.). Se o Ventrue consumir sangue que não seja de sua preferência, ele rejeita o alimento violentamente (vomita) e não reduz seus níveis de Fome.',
  
  'Caitiff': 'Sem clã, sem perdição de clã específica.',
  'Sangue Fraco': 'Sem clã, sem perdição de clã específica.'
}

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
  { key: 'composure', name: 'Autocontrole' }
]

const mentalAttributes = [
  { key: 'intelligence', name: 'Inteligência' },
  { key: 'wits', name: 'Raciocínio' },
  { key: 'resolve', name: 'Determinação' }
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
  predator: props.player.sheet?.predator || '',
  ambition: props.player.sheet?.ambition || '',
  desire: props.player.sheet?.desire || '',
  sire: props.player.sheet?.sire || '',
  player: props.player.sheet?.player || '',
  avatar: props.player.sheet?.avatar || '', // Avatar do personagem
  
  // Novos campos da ficha oficial V5
  resonance: props.player.sheet?.resonance || '',
  resonanceIntensity: props.player.sheet?.resonanceIntensity || '',
  chronicleTenets: props.player.sheet?.chronicleTenets || '',
  touchstonesConvictions: props.player.sheet?.touchstonesConvictions || '',
  clanBane: props.player.sheet?.clanBane || (props.player.sheet?.clan && clanBanes[props.player.sheet.clan]) || '',
  advantages: props.player.sheet?.advantages || [],
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
    social: { charisma: 1, manipulation: 1, composure: 1 },
    mental: { intelligence: 1, wits: 1, resolve: 1 }
  },
  skills: props.player.sheet?.skills || {
    talents: { melee: 1, firearms: 1, athletics: 1, brawl: 1, drive: 1, stealth: 1, larceny: 1, craft: 1, survival: 1 },
    skills: { animalKen: 1, etiquette: 1, intimidation: 1, leadership: 1, streetwise: 1, performance: 1, persuasion: 1, awareness: 1, subterfuge: 1 },
    knowledges: { science: 1, academics: 1, finance: 1, investigation: 1, medicine: 1, occult: 1, perception: 1, politics: 1, technology: 1 }
  },
  skillSpecialties: props.player.sheet?.skillSpecialties || {
    talents: {},
    skills: {},
    knowledges: {}
  },
  disciplines: props.player.sheet?.disciplines || [],
  virtues: props.player.sheet?.virtues || { conscience: 1, selfControl: 1, courage: 1 },
  humanity: props.player.sheet?.humanity || 1,
  willpower: props.player.sheet?.willpower || 1,
  vitality: props.player.sheet?.vitality || 1,
  hunger: props.player.sheet?.hunger ?? 1,
  conditions: props.player.sheet?.conditions?.length > 0 ? props.player.sheet.conditions : ['']
})

// Inicializar previousPredatorType com o valor atual (evita abrir modal na carga)
previousPredatorType.value = props.player.sheet?.predator || ''

// Watch para detectar mudanças no tipo de predador
watch(() => sheetData.value.predator, (newPredator, oldPredator) => {
  // Só abre o modal se:
  // 1. Novo valor existe e não é vazio
  // 2. É diferente do valor anterior
  // 3. Não é o mesmo que já foi processado (previousPredatorType)
  // 4. Usuário tem permissão de edição
  if (newPredator && newPredator !== '' && newPredator !== previousPredatorType.value && props.canEdit) {
    openPredatorModal(newPredator)
  }
})

// Watch clan changes to auto-update clan bane
watch(() => sheetData.value.clan, (newClan) => {
  if (newClan && clanBanes[newClan]) {
    sheetData.value.clanBane = clanBanes[newClan]
    hasUnsavedChanges.value = true
  } else if (!newClan) {
    sheetData.value.clanBane = ''
  }
})

// Salvar snapshot inicial ao carregar a ficha (para restaurar ao trocar de predador)
onMounted(() => {
  // Evitar múltiplas execuções
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
  
  // Se a ficha tem metadata de predador salvo, precisamos calcular o estado BASE
  const metadata = props.player.sheet?._predatorMetadata as PredatorMetadata | undefined
  console.log('📦 Metadata encontrado?', !!metadata)
  
  if (metadata && sheetData.value.predator) {
    console.log('📦 Metadata de predador encontrado no banco:', JSON.stringify(metadata))
    console.log('🔄 Calculando estado BASE (sem predador) para snapshot...')
    
    // Calcular valores BASE (NÃO modificar o sheetData, apenas calcular para o snapshot!)
    const baseHumanity = sheetData.value.humanity - metadata.humanityChange
    console.log(`   - Humanidade BASE: ${sheetData.value.humanity} - ${metadata.humanityChange} = ${baseHumanity}`)
    
    const baseBloodPotency = sheetData.value.bloodPotency - metadata.bloodPotencyChange
    console.log(`   - Potência BASE: ${sheetData.value.bloodPotency} - ${metadata.bloodPotencyChange} = ${baseBloodPotency}`)
    
    // Calcular disciplinas BASE
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
          // Se ficou 0 ou negativo, remover do snapshot BASE
          baseDisciplines.splice(disciplineIndex, 1)
          console.log(`   - Disciplina removida do BASE (nível chegaria a ${newLevel})`)
        } else {
          baseDisciplines[disciplineIndex].level = newLevel
          console.log(`   - Disciplina mantida no BASE com nível ${newLevel}`)
        }
      } else {
        console.log(`   ⚠️ Disciplina "${metadata.disciplineAdded}" não encontrada! Ela foi criada pelo predador.`)
        // Disciplina não existe no array = foi criada pelo predador, então não incluir no BASE
      }
    } else {
      console.log('   - Nenhuma disciplina foi adicionada pelo predador')
    }
    
    console.log(`   - Disciplinas BASE calculadas: ${JSON.stringify(baseDisciplines)}`)
    
    // Salvar snapshot do estado BASE (sem predador)
    // IMPORTANTE: Apenas salvar no snapshot, NÃO modificar sheetData!
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
    
    // Não tem predador aplicado ainda, salvar estado atual como base
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
  
  // Marcar como inicializado
  snapshotInitialized.value = true
  console.log('🔵 onMounted: Finalizado')
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
  
  // Limite máximo de 10 vantagens/defeitos
  if (sheetData.value.advantages.length >= 10) {
    toast.warning('Limite máximo de 10 vantagens/defeitos atingido')
    return
  }
  
  sheetData.value.advantages.push({ category: '', type: '', name: '', level: 0, details: '', fixo: false, maxLevel: 5 })
  hasUnsavedChanges.value = true
}

const removeAdvantage = (index: number) => {
  if (!props.canEdit) return
  
  // Não permitir remover vantagens fixas (do tipo de predador)
  if (sheetData.value.advantages[index]?.fixo) {
    toast.warning('Vantagens do tipo de predador não podem ser removidas')
    return
  }
  
  sheetData.value.advantages.splice(index, 1)
  hasUnsavedChanges.value = true
}

// Métodos auxiliares para dropdowns de Vantagens
const getSubcategoryOptions = (category: string) => {
  if (category === 'Mérito' || category === 'Defeito') {
    const options = ['Físico', 'Mental', 'Social', 'Sobrenatural']
    // Só inclui Sangue Ralo se geração for 14, 15 ou 16
    if (sheetData.value.generation >= 14 && sheetData.value.generation <= 16) {
      options.push('Sangue Ralo')
    }
    return options
  }
  return []
}

// Mapeia o nome da categoria exibido para a chave do objeto de dados
const normalizeCategoryKey = (category: string): string => {
  const map: Record<string, string> = {
    'Antecedente': 'antecedentes',
    'Folha de Lore': 'loresheets',
    'Mérito': 'meritos',
    'Defeito': 'defeitos'
  }
  return map[category] || ''
}

// Mapeia o nome do tipo exibido para a chave do objeto de dados
const normalizeTypeKey = (type: string): string => {
  const map: Record<string, string> = {
    'Físico': 'fisicos',
    'Mental': 'mentais',
    'Social': 'sociais',
    'Sobrenatural': 'sobrenaturais',
    'Sangue Ralo': 'sangue_ralo'
  }
  return map[type] || ''
}

const getNameOptions = (adv: any) => {
  const category = adv.category
  const type = adv.type
  
  if (!category) return []
  
  const categoryKey = normalizeCategoryKey(category)
  
  // Antecedentes e Loresheets são arrays diretos de strings
  if (categoryKey === 'antecedentes') {
    return vantagensDados.antecedentes
  } else if (categoryKey === 'loresheets') {
    return vantagensDados.loresheets
  } 
  // Méritos e Defeitos são arrays de objetos - retornar apenas os nomes
  else if (categoryKey === 'meritos' && type) {
    const typeKey = normalizeTypeKey(type) as keyof typeof vantagensDados.meritos
    const items = vantagensDados.meritos[typeKey] || []
    return items.map((item: any) => item.nome)
  } else if (categoryKey === 'defeitos' && type) {
    const typeKey = normalizeTypeKey(type) as keyof typeof vantagensDados.defeitos
    const items = vantagensDados.defeitos[typeKey] || []
    return items.map((item: any) => item.nome)
  }
  
  return []
}

const shouldShowTypeDropdown = (category: string) => {
  return category === 'Mérito' || category === 'Defeito'
}

const onCategoryChange = (index: number) => {
  // Reset campos dependentes quando categoria muda
  sheetData.value.advantages[index].type = ''
  sheetData.value.advantages[index].name = ''
  hasUnsavedChanges.value = true
}

const onTypeChange = (index: number) => {
  // Reset nome quando tipo muda
  sheetData.value.advantages[index].name = ''
  hasUnsavedChanges.value = true
}

const onNameChange = (index: number) => {
  const adv = sheetData.value.advantages[index]
  const categoryKey = normalizeCategoryKey(adv.category)
  
  // Para Antecedentes e Loresheets: pontos livres (1-5), não fixo
  if (categoryKey === 'antecedentes' || categoryKey === 'loresheets') {
    adv.level = 1
    adv.fixo = false
    adv.maxLevel = 5
  }
  // Para Méritos e Defeitos: buscar pontos, fixo e max do objeto de dados
  else if ((categoryKey === 'meritos' || categoryKey === 'defeitos') && adv.type && adv.name) {
    const typeKey = normalizeTypeKey(adv.type)
    const items = categoryKey === 'meritos' 
      ? vantagensDados.meritos[typeKey as keyof typeof vantagensDados.meritos]
      : vantagensDados.defeitos[typeKey as keyof typeof vantagensDados.defeitos]
    
    const selectedItem = (items || []).find((item: any) => item.nome === adv.name)
    
    if (selectedItem) {
      adv.level = selectedItem.pontos
      adv.fixo = selectedItem.fixo
      adv.maxLevel = (selectedItem as any).max || 5
    }
  }
  
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
  const errors: string[] = []
  
  if (!sheetData.value.name || !sheetData.value.name.trim()) {
    errors.push('Nome do Personagem está vazio')
    console.warn('❌ Validação: Nome vazio')
  }
  if (!sheetData.value.concept || !sheetData.value.concept.trim()) {
    errors.push('Conceito está vazio')
    console.warn('❌ Validação: Conceito vazio')
  }
  if (!sheetData.value.clan || !sheetData.value.clan.trim()) {
    errors.push('Clã não foi selecionado')
    console.warn('❌ Validação: Clã vazio')
  }
  if (!sheetData.value.generation || sheetData.value.generation < 3 || sheetData.value.generation > 15) {
    errors.push(`Geração inválida (${sheetData.value.generation}). Deve ser entre 3 e 15`)
    console.warn(`❌ Validação: Geração inválida (${sheetData.value.generation})`)
  }
  
  if (errors.length > 0) {
    console.error('❌ Validação falhou. Erros:', errors)
    toast.error('Campos obrigatórios não preenchidos', errors.join('; '))
    return false
  }
  
  console.log('✅ Validação passou - todos os campos obrigatórios preenchidos')
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
    console.log('💾 Preparando para salvar ficha...')
    console.log('   - Predador:', sheetData.value.predator)
    console.log('   - Humanidade:', sheetData.value.humanity)
    console.log('   - Potência Sangue:', sheetData.value.bloodPotency)
    console.log('   - Disciplinas:', JSON.stringify(sheetData.value.disciplines))
    console.log('   - Metadata:', JSON.stringify((sheetData.value as any)._predatorMetadata))
    console.log('   - Snapshot BASE (não salvo no banco):', JSON.stringify(originalPredatorValues.value))
    
    // Filtrar condições vazias antes de salvar
    const cleanedConditions = sheetData.value.conditions.filter((c: string) => c && c.trim())
    
    const dataToSave = {
      ...props.player,
      characterName: sheetData.value.name,
      sheet: {
        ...sheetData.value,
        conditions: cleanedConditions
      }
    }
    
    console.log('📤 Emitindo evento SAVE com metadata:', JSON.stringify(dataToSave.sheet._predatorMetadata))
    
    emit('save', dataToSave)
    
    hasUnsavedChanges.value = false
    
    console.log('💾 Ficha salva! Metadata foi incluído no objeto salvo.')
    
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
