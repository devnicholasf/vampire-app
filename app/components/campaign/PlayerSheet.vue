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

  <!-- Modal de Escolhas do Predador - PREMIUM DESIGN -->
  <div
    v-if="showPredatorModal"
    class="fixed inset-0 z-[10002] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
    @click.self="cancelPredatorModal"
  >
    <div class="bg-df-deep border border-df-gold/20 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col animate-scale-in">
      
      <!-- HEADER NARRATIVO -->
      <div class="relative bg-gradient-to-b from-df-input to-df-deep border-b border-df-gold/20 p-8 flex-shrink-0">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDRhNjQ3IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div class="relative">
          <div class="flex items-start gap-4 mb-3">
            <div class="w-12 h-12 rounded-full bg-df-border-red/20 border border-df-border-red/40 flex items-center justify-center flex-shrink-0 mt-1">
              <svg class="w-6 h-6 text-df-red" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-4xl font-bold text-df-gold tracking-wide" style="text-shadow: 0 0 20px rgba(212, 166, 71, 0.3);">
                {{ selectedPredatorType.toUpperCase() }}
              </h2>
              <p class="text-df-muted text-sm italic mt-1">Tipo de Predador</p>
            </div>
          </div>
          <div class="w-full h-px bg-gradient-to-r from-transparent via-df-gold/40 to-transparent my-4"></div>
          <p class="text-df-silver text-base leading-relaxed max-w-3xl">
            {{ predatorDescriptions[selectedPredatorType] || predatorModalData.description }}
          </p>
        </div>
      </div>

      <!-- BODY - Layout Grid Desktop / Stack Mobile -->
      <div class="lg:grid lg:grid-cols-[1fr_300px] gap-6 p-6 overflow-y-auto flex-1">
        
        <!-- CONTEÚDO PRINCIPAL - STEPS -->
        <div class="space-y-6">
          
          <!-- STEP 1: Escolha de Disciplina -->
          <div v-if="predatorModalData.choices.discipline" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-df-gold/20 border border-df-gold/40 text-df-gold font-bold text-sm">
                1
              </div>
              <div>
                <h3 class="text-xl font-bold text-df-gold">Escolha uma Disciplina</h3>
                <p class="text-df-muted text-sm">Poder vampírico que define suas capacidades sobrenaturais</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                v-for="option in predatorModalData.choices.discipline.options"
                :key="option"
                @click="selectDiscipline(option)"
                :disabled="isDisciplineRestricted(option)"
                :class="[
                  'group relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:scale-[1.02] hover:shadow-lg',
                  selectedChoices.discipline === option
                    ? 'border-df-gold bg-df-gold/10 shadow-[0_0_20px_rgba(212,166,71,0.2)]'
                    : isDisciplineRestricted(option)
                    ? 'border-df-border-silver/20 bg-df-input opacity-40 cursor-not-allowed'
                    : 'border-df-border-silver/30 bg-df-input hover:border-df-gold/50 hover:bg-df-card'
                ]"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-lg bg-df-deep/50 border border-df-gold/30 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-df-gold" fill="currentColor" viewBox="0 0 24 24">
                      <path :d="getDisciplineIconPath(option)"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-df-silver text-base mb-1">{{ option }}</div>
                    <div class="text-xs text-df-muted leading-relaxed">
                      {{ disciplineDescriptions[option] || 'Poder vampírico ancestral' }}
                    </div>
                    <div v-if="isDisciplineRestricted(option)" class="text-xs text-df-red mt-2 italic">
                      Exclusivo: {{ predatorModalData.choices.discipline.restriction?.[option] }}
                    </div>
                  </div>
                </div>
                <div v-if="selectedChoices.discipline === option" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-df-gold flex items-center justify-center">
                  <svg class="w-4 h-4 text-df-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <!-- STEP 2: Escolha de Especialidade -->
          <div v-if="predatorModalData.choices.specialty" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-df-gold/20 border border-df-gold/40 text-df-gold font-bold text-sm">
                2
              </div>
              <div>
                <h3 class="text-xl font-bold text-df-gold">Escolha uma Especialidade</h3>
                <p class="text-df-muted text-sm">Área de expertise que refina suas habilidades</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                v-for="option in predatorModalData.choices.specialty.options"
                :key="option"
                @click="selectedChoices.specialty = option"
                :class="[
                  'group relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:scale-[1.02] hover:shadow-lg',
                  selectedChoices.specialty === option
                    ? 'border-df-gold bg-df-gold/10 shadow-[0_0_20px_rgba(212,166,71,0.2)]'
                    : 'border-df-border-silver/30 bg-df-input hover:border-df-gold/50 hover:bg-df-card'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-df-silver">{{ option }}</span>
                  <div v-if="selectedChoices.specialty === option" class="w-5 h-5 rounded-full bg-df-gold flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-df-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
            
            <!-- Input customizado para especialidades específicas -->
            <div v-if="needsCustomSpecialtyInput(selectedChoices.specialty)" class="mt-3 animate-fade-in">
              <label class="text-df-silver text-sm mb-2 block font-medium">Especifique:</label>
              <input
                v-model="selectedChoices.specialtyCustom"
                type="text"
                :placeholder="getCustomSpecialtyPlaceholder(selectedChoices.specialty)"
                class="w-full px-4 py-3 bg-df-input border-2 border-df-border-silver/30 rounded-xl text-df-silver placeholder-df-muted focus:border-df-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <!-- STEP 3: Escolha de Mérito -->
          <div v-if="predatorModalData.choices.merit" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-df-gold/20 border border-df-gold/40 text-df-gold font-bold text-sm">
                3
              </div>
              <div>
                <h3 class="text-xl font-bold text-df-gold">Escolha um Mérito</h3>
                <p class="text-df-muted text-sm">Vantagem que beneficia seu personagem</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                v-for="option in predatorModalData.choices.merit.options"
                :key="option"
                @click="selectedChoices.merit = option"
                :class="[
                  'group relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:scale-[1.02] hover:shadow-lg',
                  selectedChoices.merit === option
                    ? 'border-df-gold bg-df-gold/10 shadow-[0_0_20px_rgba(212,166,71,0.2)]'
                    : 'border-df-border-silver/30 bg-df-input hover:border-df-gold/50 hover:bg-df-card'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-df-silver">{{ option }}</span>
                  <div v-if="selectedChoices.merit === option" class="w-5 h-5 rounded-full bg-df-gold flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-df-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- STEP 4: Escolha de Defeito -->
          <div v-if="predatorModalData.choices.flaw" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-df-red/20 border border-df-border-red/40 text-df-red font-bold text-sm">
                4
              </div>
              <div>
                <h3 class="text-xl font-bold text-df-red">Escolha um Defeito</h3>
                <p class="text-df-muted text-sm">Fraqueza que desafia seu personagem</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                v-for="option in predatorModalData.choices.flaw.options"
                :key="option"
                @click="selectedChoices.flaw = option"
                :class="[
                  'group relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:scale-[1.02] hover:shadow-lg',
                  selectedChoices.flaw === option
                    ? 'border-df-red bg-df-red/10 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                    : 'border-df-border-silver/30 bg-df-input hover:border-df-red/50 hover:bg-df-card'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-df-silver">{{ option }}</span>
                  <div v-if="selectedChoices.flaw === option" class="w-5 h-5 rounded-full bg-df-red flex items-center justify-center flex-shrink-0">
                    <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- STEP 5: Distribuição de Pontos de Antecedentes (Osiris) -->
          <div v-if="predatorModalData.choices.pointDistribution" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-df-gold/20 border border-df-gold/40 text-df-gold font-bold text-sm">
                5
              </div>
              <div>
                <h3 class="text-xl font-bold text-df-gold">Distribua Pontos de Antecedentes</h3>
                <p class="text-df-muted text-sm">{{ predatorModalData.choices.pointDistribution.total }} pontos entre {{ predatorModalData.choices.pointDistribution.options.join(' e ') }}</p>
              </div>
            </div>
            
            <div class="bg-df-input border border-df-border-silver/30 rounded-xl p-5 space-y-4">
              <div v-for="option in predatorModalData.choices.pointDistribution.options" :key="option" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-df-silver font-medium">{{ option }}</label>
                  <span class="text-df-gold font-bold text-lg">{{ selectedChoices.backgroundPoints?.[option] || 0 }}</span>
                </div>
                <input
                  v-model.number="selectedChoices.backgroundPoints![option]"
                  @input="validateBackgroundPoints(option)"
                  type="range"
                  min="0"
                  :max="getMaxBackgroundPoints(option)"
                  class="w-full h-2 bg-df-deep rounded-lg appearance-none cursor-pointer slider-gold"
                />
              </div>
              <div class="pt-3 border-t border-df-border-silver/20">
                <div class="flex justify-between text-sm">
                  <span class="text-df-muted">Pontos distribuídos:</span>
                  <span :class="[
                    'font-bold',
                    getTotalBackgroundPoints() === predatorModalData.choices.pointDistribution.total ? 'text-df-gold' : 'text-df-red'
                  ]">
                    {{ getTotalBackgroundPoints() }} / {{ predatorModalData.choices.pointDistribution.total }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 6: Distribuição de Pontos de Defeitos (Osiris) -->
          <div v-if="predatorModalData.choices.flawDistribution" class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-df-red/20 border border-df-border-red/40 text-df-red font-bold text-sm">
                6
              </div>
              <div>
                <h3 class="text-xl font-bold text-df-red">Distribua Pontos de Defeitos</h3>
                <p class="text-df-muted text-sm">{{ predatorModalData.choices.flawDistribution.total }} pontos entre {{ predatorModalData.choices.flawDistribution.options.join(' e ') }}</p>
              </div>
            </div>
            
            <div class="bg-df-input border border-df-border-silver/30 rounded-xl p-5 space-y-4">
              <div v-for="option in predatorModalData.choices.flawDistribution.options" :key="option" class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="text-df-silver font-medium">{{ option }}</label>
                  <span class="text-df-red font-bold text-lg">{{ selectedChoices.flawPoints?.[option] || 0 }}</span>
                </div>
                <input
                  v-model.number="selectedChoices.flawPoints![option]"
                  @input="validateFlawPoints(option)"
                  type="range"
                  min="0"
                  :max="getMaxFlawPoints(option)"
                  class="w-full h-2 bg-df-deep rounded-lg appearance-none cursor-pointer slider-red"
                />
              </div>
              <div class="pt-3 border-t border-df-border-silver/20">
                <div class="flex justify-between text-sm">
                  <span class="text-df-muted">Pontos distribuídos:</span>
                  <span :class="[
                    'font-bold',
                    getTotalFlawPoints() === predatorModalData.choices.flawDistribution.total ? 'text-df-gold' : 'text-df-red'
                  ]">
                    {{ getTotalFlawPoints() }} / {{ predatorModalData.choices.flawDistribution.total }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR - RESUMO DAS ESCOLHAS -->
        <div class="lg:sticky lg:top-0 lg:self-start">
          <div class="bg-df-input border border-df-gold/20 rounded-xl p-5 space-y-4">
            <div class="flex items-center gap-2 pb-3 border-b border-df-border-silver/20">
              <svg class="w-5 h-5 text-df-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h4 class="font-bold text-df-gold text-lg">Escolhas Atuais</h4>
            </div>

            <!-- Disciplina Escolhida -->
            <div v-if="predatorModalData.choices.discipline">
              <div class="text-xs text-df-muted uppercase tracking-wider mb-2">Disciplina</div>
              <div v-if="selectedChoices.discipline" class="flex items-center gap-2 px-3 py-2 bg-df-deep rounded-lg border border-df-gold/30">
                <svg class="w-4 h-4 text-df-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path :d="getDisciplineIconPath(selectedChoices.discipline)"/>
                </svg>
                <span class="text-df-silver font-medium">{{ selectedChoices.discipline }}</span>
              </div>
              <div v-else class="text-df-muted text-sm italic">Nenhuma selecionada</div>
            </div>

            <!-- Especialidade Escolhida -->
            <div v-if="predatorModalData.choices.specialty">
              <div class="text-xs text-df-muted uppercase tracking-wider mb-2">Especialidade</div>
              <div v-if="selectedChoices.specialty" class="px-3 py-2 bg-df-deep rounded-lg border border-df-gold/30">
                <div class="text-df-silver font-medium">{{ selectedChoices.specialty }}</div>
                <div v-if="selectedChoices.specialtyCustom" class="text-df-gold text-sm mt-1">{{ selectedChoices.specialtyCustom }}</div>
              </div>
              <div v-else class="text-df-muted text-sm italic">Nenhuma selecionada</div>
            </div>

            <!-- Mérito Escolhido -->
            <div v-if="predatorModalData.choices.merit">
              <div class="text-xs text-df-muted uppercase tracking-wider mb-2">Mérito</div>
              <div v-if="selectedChoices.merit" class="px-3 py-2 bg-df-deep rounded-lg border border-df-gold/30 text-df-silver font-medium">
                {{ selectedChoices.merit }}
              </div>
              <div v-else class="text-df-muted text-sm italic">Nenhum selecionado</div>
            </div>

            <!-- Defeito Escolhido -->
            <div v-if="predatorModalData.choices.flaw">
              <div class="text-xs text-df-muted uppercase tracking-wider mb-2">Defeito</div>
              <div v-if="selectedChoices.flaw" class="px-3 py-2 bg-df-deep rounded-lg border border-df-red/30 text-df-silver font-medium">
                {{ selectedChoices.flaw }}
              </div>
              <div v-else class="text-df-muted text-sm italic">Nenhum selecionado</div>
            </div>

            <!-- Pontos de Antecedentes -->
            <div v-if="predatorModalData.choices.pointDistribution && getTotalBackgroundPoints() > 0">
              <div class="text-xs text-df-muted uppercase tracking-wider mb-2">Antecedentes</div>
              <div class="space-y-1">
                <div v-for="(value, key) in selectedChoices.backgroundPoints" :key="key" v-show="value && value > 0" class="flex justify-between text-sm">
                  <span class="text-df-silver">{{ key }}</span>
                  <span class="text-df-gold font-bold">{{ value }}</span>
                </div>
              </div>
            </div>

            <!-- Pontos de Defeitos -->
            <div v-if="predatorModalData.choices.flawDistribution && getTotalFlawPoints() > 0">
              <div class="text-xs text-df-muted uppercase tracking-wider mb-2">Defeitos</div>
              <div class="space-y-1">
                <div v-for="(value, key) in selectedChoices.flawPoints" :key="key" v-show="value && value > 0" class="flex justify-between text-sm">
                  <span class="text-df-silver">{{ key }}</span>
                  <span class="text-df-red font-bold">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Status de Progresso -->
          <div class="bg-df-input rounded-xl p-4 border border-df-border-silver/20 mt-4">
            <div class="flex items-center gap-2 text-sm">
              <div :class="[
                'w-3 h-3 rounded-full',
                canConfirmPredatorChoices
                  ? 'bg-df-gold animate-pulse'
                  : 'bg-df-muted'
              ]"></div>
              <span :class="canConfirmPredatorChoices ? 'text-df-gold' : 'text-df-muted'">
                {{ canConfirmPredatorChoices ? 'Pronto para confirmar' : 'Escolhas incompletas' }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- FOOTER - BOTÕES DE AÇÃO -->
      <div class="border-t border-df-border-silver/20 p-6 bg-df-deep flex-shrink-0">
        <div class="flex gap-4">
          <button
            @click="cancelPredatorModal"
            class="flex-1 px-6 py-3 rounded-xl border-2 border-df-border-silver/30 text-df-silver font-semibold hover:border-df-border-silver hover:bg-df-input transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            @click="applyPredatorChoices"
            :disabled="!canConfirmPredatorChoices"
            :class="[
              'flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all duration-200',
              'flex items-center justify-center gap-2',
              canConfirmPredatorChoices
                ? 'bg-gradient-to-r from-df-crimson to-df-red hover:from-df-red hover:to-df-crimson hover:scale-[1.02] shadow-lg shadow-df-red/30'
                : 'bg-df-muted/30 cursor-not-allowed opacity-50'
            ]"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            Confirmar Escolhas
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import { useToast } from '~/composables/useToast'
import { clanBanes } from '~/config/clanBanes'
import { vantagensDados, vampireClans } from '~/config/advantagesData'
import { usePredatorSystem } from '~/composables/usePredatorSystem'

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

// Placeholder para input customizado de especialidade
const getCustomSpecialtyPlaceholder = (specialty?: string): string => {
  if (!specialty) return ''
  if (specialty.includes('Performance')) return 'Ex: Música, Dança, Teatro...'
  if (specialty.includes('Cena Específica')) return 'Ex: Góticos, Clubbers, Cosplayers...'
  if (specialty.includes('Animal Específico')) return 'Ex: Lobos, Gatos, Ratos...'
  if (specialty.includes('Ocultismo')) return 'Ex: Hermetismo, Kabbalah, Vodu...'
  return 'Especifique...'
}

// Descrições narrativas dos Predadores
const predatorDescriptions: Record<string, string> = {
  'Consensualista': 'Você se alimenta apenas de voluntários que oferecem seu sangue conscientemente, cultivando relacionamentos íntimos baseados em confiança mútua e consentimento.',
  'Fazendeiro': 'Você prefere se alimentar de animais ao invés de humanos, cultivando uma conexão especial com criaturas e evitando ferir mortais.',
  'Osiris': 'Você cultiva um culto de mortais devotos que o veneram como uma divindade, oferecendo seu sangue em rituais de adoração e submissão.',
  'Sacoleiro': 'Você rouba sangue de bancos de sangue, hospitais e fontes médicas, evitando contato direto com vítimas vivas.',
  'Sandman': 'Você se alimenta de vítimas adormecidas, invadindo lares e infiltrando-se sorrateiramente para sugar sangue sem ser notado.',
  'Sanguessuga': 'Você se alimenta de outros vampiros, drenando vitae de seus companheiros Cainitas em atos de diablerie parcial ou roubo vampírico.',
  'Scene Queen': 'Você domina clubes noturnos, festas e cenas sociais, manipulando e seduzindo vítimas em ambientes de êxtase e caos.',
  'Sereia': 'Você seduz e atrai vítimas através de charme sobrenatural, criando relacionamentos íntimos que mascaram sua natureza predatória.',
  'Trinchador': 'Você caça violentamente nas ruas, atacando vítimas aleatórias com ferocidade brutal e selvagem.',
  'Vira-Lata': 'Você se alimenta dos marginalizados da sociedade – sem-teto, viciados e esquecidos – caçando nas sombras da miséria urbana.'
}

// Descrições narrativas das Disciplinas
const disciplineDescriptions: Record<string, string> = {
  'Animalismo': 'Comunhão sobrenatural com animais, controlando bestas e convocando criaturas.',
  'Auspícios': 'Percepção sobre-humana que revela verdades ocultas e premonições do futuro.',
  'Celeridade': 'Velocidade e reflexos vampíricos que transcendem os limites mortais.',
  'Dominação': 'Controle mental absoluto, quebrando vontades e reescrevendo memórias.',
  'Feitiçaria de Sangue': 'Magia ritual alimentada por vitae, manipulando a própria essência vampírica.',
  'Fortitude': 'Resistência sobrenatural, até o ponto de resistir ao fogo e à luz solar.',
  'Metamorfose': 'Transformação corporal em formas bestiais e névoa.',
  'Ofuscação': 'Capacidade de permanecer obscuro e invisivel, mesmo em meio a multidões',
  'Potência': 'Força monstruosa capaz de esmagar ossos e rasgar aço.',
  'Presença': 'Magnetismo sobrenatural que inspira terror, adoração ou desejo.',
  'Tenebrosidade': 'Controle sobre trevas vivas que devoram luz e carne.',
  'Serpentis': 'Poderes ofídicos ancestrais dos seguidores de Set.',
  'Quietus': 'Assassinato silencioso através de venenos de sangue mortais.',
  'Quimerismo': 'Ilusões sensoriais que enganam mente e corpo.',
  'Vicissitude': 'Manipulação grotesca de carne e osso, moldando corpos como argila.'
}

// Ícones SVG para cada Disciplina
const getDisciplineIconPath = (discipline: string): string => {
  const icons: Record<string, string> = {
    // Animalismo - pata de animal
    'Animalismo': 'M8 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM8 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4 4c2.2 0 4 1.8 4 4v4H8v-4c0-2.2 1.8-4 4-4z',
    // Auspícios - olho místico
    'Auspícios': 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
    // Celeridade - raio/velocidade
    'Celeridade': 'M13 10V3L4 14h7v7l9-11h-7z',
    // Dominação - cérebro
    'Dominação': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
    // Feitiçaria de Sangue - pentagrama
    'Feitiçaria de Sangue': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    // Fortitude - escudo
    'Fortitude': 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.12 6 2.12v4.78z',
    // Metamorfose - transformação/círculos
    'Metamorfose': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z',
    // Ofuscação - olho fechado/invisibilidade
    'Ofuscação': 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
    // Potência - punho
    'Potência': 'M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-8-4h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zm-4-8H9v6h2v-2h2v-2h-2V12zm-2-2h2V8h2V6h-2V4h-2v2H9v2h2v2zm10 10h2v-2h-2v2z',
    // Presença - pessoas/grupo
    'Presença': 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    // Tenebrosidade - lua/trevas
    'Tenebrosidade': 'M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z',
    // Serpentis - ondas serpentinas
    'Serpentis': 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 1.89.52 3.65 1.42 5.17C5.16 20.26 8.35 22 12 22s6.84-1.74 8.58-4.83c.9-1.52 1.42-3.28 1.42-5.17zM12 20c-2.76 0-5.24-1.4-6.71-3.53.76-.77 1.64-1.41 2.61-1.88.19-.09.38-.17.57-.24C9.45 13.63 10.67 13 12 13c1.33 0 2.55.63 3.53 1.35.19.07.38.15.57.24.97.47 1.85 1.11 2.61 1.88C17.24 18.6 14.76 20 12 20zm0-9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
    // Quietus - adaga
    'Quietus': 'M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.47-.47-1.12-.29-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25L13.06 7.18l3.75 3.75L6.75 21H3v-3.75z',
    // Quimerismo - máscara teatral
    'Quimerismo': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 8c.83 0 1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S14 10.33 14 9.5 14.67 8 15.5 8zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z',
    // Vicissitude - DNA/espiral
    'Vicissitude': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
  }
  return icons[discipline] || 'M13 10V3L4 14h7v7l9-11h-7z' // raio como padrão
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

// Computed refs para o composable
const clan = computed(() => sheetData.value.clan)
const canEdit = computed(() => props.canEdit)

// ===== SISTEMA DE PREDADORES V5 =====
// Usar composable para todo o sistema de predadores (DEPOIS de sheetData ser declarado)
const {
  showPredatorModal,
  selectedPredatorType,
  previousPredatorType,
  selectedChoices,
  originalPredatorValues,
  appliedPredatorData,
  predatorModalData,
  snapshotInitialized,
  isDisciplineRestricted,
  selectDiscipline,
  needsCustomSpecialtyInput,
  canConfirmPredatorChoice,
  getTotalBackgroundPoints,
  getTotalFlawPoints,
  getMaxBackgroundPoints,
  validateBackgroundPoints,
  getMaxFlawPoints,
  validateFlawPoints,
  openPredatorModal,
  cancelPredatorModal,
  clearPreviousPredatorData,
  applyPredatorChoices,
  initializeSnapshot
} = usePredatorSystem(
  sheetData,
  clan,
  canEdit,
  toast
)

// Validação para habilitar o botão de confirmar (usar função do composable)
const canConfirmPredatorChoices = computed(() => canConfirmPredatorChoice())

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
  // Usar função do composable para inicializar snapshot
  initializeSnapshot(props.player.sheet)
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
  // Para Méritos e Defeitos: buscar pontos e max do objeto de dados
  else if ((categoryKey === 'meritos' || categoryKey === 'defeitos') && adv.type && adv.name) {
    const typeKey = normalizeTypeKey(adv.type)
    const items = categoryKey === 'meritos' 
      ? vantagensDados.meritos[typeKey as keyof typeof vantagensDados.meritos]
      : vantagensDados.defeitos[typeKey as keyof typeof vantagensDados.defeitos]
    
    const selectedItem = (items || []).find((item: any) => item.nome === adv.name)
    
    if (selectedItem) {
      adv.level = selectedItem.pontos
      // IMPORTANTE: Não copiar 'fixo' da configuração!
      // Vantagens criadas manualmente pelo usuário são sempre editáveis (fixo: false)
      // Apenas vantagens adicionadas pelo sistema de predador têm fixo: true
      adv.fixo = false
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

/* ─── Animações do Modal Premium ─── */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

/* ─── Sliders Customizados ─── */
.slider-gold::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4a647, #b8923d);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(212, 166, 71, 0.5);
  border: 2px solid #0a0a1a;
}

.slider-gold::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4a647, #b8923d);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(212, 166, 71, 0.5);
  border: 2px solid #0a0a1a;
}

.slider-red::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
  border: 2px solid #0a0a1a;
}

.slider-red::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
  border: 2px solid #0a0a1a;
}
</style>
