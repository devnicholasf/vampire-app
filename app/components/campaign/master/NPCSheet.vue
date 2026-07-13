<template>
  <div class="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4 df-overlay">
    <div class="relative w-full max-w-7xl max-h-[98vh]">
      <div class="df-main-panel df-modal-card p-3 w-full max-w-6xl max-h-[88vh] flex flex-col">

        <div class="mb-0 sticky top-0 z-10 pb-2 pt-0 df-header-premium">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="df-editor-badge mt-0.5">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div class="relative">
                <h2 class="df-editor-title">Editar NPC</h2>
                <p class="df-editor-subtitle">Cada vampiro possui fome, ambicao e segredos.</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
              <div class="hidden md:flex items-center gap-2 rounded-lg border border-df-border-silver/35 bg-df-input/70 px-2.5 py-1.5 cursor-pointer" @click="avatarInput?.click()" title="Clique para alterar o avatar">
                <div class="w-8 h-8 rounded overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-gray-900 flex items-center justify-center">
                  <img v-if="sheetData.avatar" :src="sheetData.avatar" :alt="sheetData.name" class="w-full h-full object-cover" />
                  <span v-else class="text-red-200 font-bold text-sm">{{ getInitials(sheetData.name) }}</span>
                </div>
                <div class="text-left leading-tight">
                  <p class="text-df-silver text-xs font-semibold uppercase tracking-wide">{{ sheetData.name || npc.name || 'NPC' }}</p>
                  <p class="text-df-gold/70 text-[10px] uppercase tracking-wider">{{ sheetData.clan || 'Sem cla' }}</p>
                </div>
              </div>

              <button v-if="!editMode" type="button" @click="startEditing" class="df-btn df-btn-edit">Editar</button>
              <button v-if="editMode" type="button" @click="saveSheet" class="df-btn df-btn-save">Salvar</button>
              <button v-if="editMode" type="button" @click="cancelEdit" class="df-btn df-btn-close">Cancelar</button>

              <button type="button" @click="handleClose" class="df-close-btn" title="Fechar">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="df-modal-body flex-1 overflow-y-auto df-scrollbar min-h-0">
        <form @submit.prevent="saveSheet" class="df-sheet-shell">
          <div class="df-sheet-main">
          <!-- Character Info Header -->
          <section class="df-card df-section-compact">
            <h4 class="df-section-title-compact">Identidade</h4>
            <div class="df-identity-grid">
              <div class="df-identity-row-quick">
                <div class="df-identity-group df-identity-span-name">
                  <label class="df-label">Nome <span class="text-red-400">*</span></label>
                  <input v-model="sheetData.name" required :disabled="!editMode" class="df-input" />
                </div>

                <div class="df-identity-group df-identity-span-concept">
                  <label class="df-label">Conceito <span class="text-red-400">*</span></label>
                  <input v-model="sheetData.concept" required :disabled="!editMode" placeholder="Ex: Ancião Político" class="df-input" />
                </div>

                <div class="df-identity-group df-identity-group-clan df-identity-span-clan">
                  <NPCClanSelector v-model="sheetData.clan" />
                </div>
              </div>

              <div class="df-identity-columns">
                <div class="df-identity-group df-identity-group-generation df-identity-area-generation">
                  <NPCGenerationSelector v-model="sheetData.generation" />
                </div>

                <div class="df-identity-group relative df-identity-area-predator">
                  <label class="df-label">Tipo de Predador</label>
                  <button
                    type="button"
                    @click="editMode && (isPredatorOpen = !isPredatorOpen)"
                    :disabled="!editMode"
                    class="w-full df-clan-trigger"
                    :class="{ 'df-clan-trigger-active': sheetData.predator }"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <span class="w-6 h-6 text-df-gold flex items-center justify-center">🩸</span>
                      <div class="flex-1 text-left min-w-0 leading-tight">
                        <div class="text-sm font-semibold text-white truncate">{{ sheetData.predator || 'Selecione o predador' }}</div>
                        <div v-if="sheetData.predator" class="text-xs text-df-muted truncate mt-0.5">{{ getPredatorSummary(sheetData.predator) }}</div>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-df-muted transition-transform duration-200" :class="{ 'rotate-180': isPredatorOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  <Transition name="dropdown">
                    <div v-if="isPredatorOpen && editMode" class="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto df-scrollbar rounded-lg border border-df-border-red/30 bg-df-card shadow-2xl">
                      <button
                        v-for="predator in predatorTypeOptions"
                        :key="predator.name"
                        type="button"
                        @click="selectPredatorType(predator.name)"
                        class="df-clan-option"
                        :class="{ 'df-clan-option-selected': sheetData.predator === predator.name }"
                        :disabled="predator.blocked"
                      >
                        <span class="w-6 h-6 text-df-gold flex items-center justify-center">🩸</span>
                        <div class="flex-1 text-left">
                          <div class="text-sm font-semibold text-white">{{ predator.name }}</div>
                          <div class="text-xs text-df-muted">{{ predator.description }}</div>
                        </div>
                        <svg v-if="sheetData.predator === predator.name" class="w-5 h-5 text-df-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    </div>
                  </Transition>
                </div>

                <div class="df-identity-group df-identity-area-ambition">
                  <label class="df-label">Ambição</label>
                  <input v-model="sheetData.ambition" placeholder="Ambição do NPC" :disabled="!editMode" class="df-input" />
                </div>

                <div class="df-identity-group df-identity-group-sect df-identity-area-sect">
                  <label class="df-label">Seita</label>
                  <div class="df-identity-sect-grid">
                    <button
                      v-for="sect in sectOptions"
                      :key="sect"
                      type="button"
                      @click="if (editMode) { sheetData.sect = sect; hasUnsavedChanges = true }"
                      class="df-pill"
                      :class="{ 'df-pill-active': sheetData.sect === sect }"
                      :disabled="!editMode"
                    >
                      {{ sect }}
                    </button>
                  </div>
                </div>

                <div class="df-identity-group df-identity-area-desire">
                  <label class="df-label">Desejo</label>
                  <input v-model="sheetData.desire" placeholder="Desejo do NPC" :disabled="!editMode" class="df-input" />
                </div>
              </div>
            </div>
          </section>

          <!-- Attributes -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>
                Físicos
              </h3>
              <div class="space-y-2">
                <div v-for="attr in physicalAttributes" :key="attr.key" class="df-attribute-row">
                  <label class="df-attr-label df-attribute-name">{{ attr.name }}</label>
                  <div class="df-attribute-dots">
                    <button v-for="n in 5" :key="n" type="button" @click="setVal('attributes', 'physical', attr.key, n)" :disabled="!editMode" :class="['df-dot df-dot-md', n <= (sheetData.attributes.physical as any)[attr.key] ? 'df-dot-filled' : 'df-dot-empty', !editMode && 'cursor-not-allowed opacity-60']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>
                Sociais
              </h3>
              <div class="space-y-2">
                <div v-for="attr in socialAttributes" :key="attr.key" class="df-attribute-row">
                  <label class="df-attr-label df-attribute-name">{{ attr.name }}</label>
                  <div class="df-attribute-dots">
                    <button v-for="n in 5" :key="n" type="button" @click="setVal('attributes', 'social', attr.key, n)" :disabled="!editMode" :class="['df-dot df-dot-md', n <= (sheetData.attributes.social as any)[attr.key] ? 'df-dot-filled' : 'df-dot-empty', !editMode && 'cursor-not-allowed opacity-60']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                Mentais
              </h3>
              <div class="space-y-2">
                <div v-for="attr in mentalAttributes" :key="attr.key" class="df-attribute-row">
                  <label class="df-attr-label df-attribute-name">{{ attr.name }}</label>
                  <div class="df-attribute-dots">
                    <button v-for="n in 5" :key="n" type="button" @click="setVal('attributes', 'mental', attr.key, n)" :disabled="!editMode" :class="['df-dot df-dot-md', n <= (sheetData.attributes.mental as any)[attr.key] ? 'df-dot-filled' : 'df-dot-empty', !editMode && 'cursor-not-allowed opacity-60']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Habilidades -->
          <div class="df-card">
            <h3 class="df-section-title justify-center text-center">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Habilidades
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="space-y-3">
                <div v-for="skill in talents" :key="`talents-${skill.key}`" class="df-skill-row">
                  <div class="df-skill-meta">
                    <label class="df-attr-label df-skill-name">{{ skill.name }}</label>
                  </div>
                  <div class="df-skill-dots">
                    <button v-for="n in 5" :key="n" type="button" @click="setSkill('talents', skill.key, n)" :class="['df-dot df-dot-sm', n <= (sheetData.skills.talents as any)[skill.key] ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>

              <div class="space-y-3 md:border-l md:border-df-border-red/35 md:pl-4">
                <div v-for="skill in skillsList" :key="`skills-${skill.key}`" class="df-skill-row">
                  <div class="df-skill-meta">
                    <label class="df-attr-label df-skill-name">{{ skill.name }}</label>
                  </div>
                  <div class="df-skill-dots">
                    <button v-for="n in 5" :key="n" type="button" @click="setSkill('skills', skill.key, n)" :class="['df-dot df-dot-sm', n <= (sheetData.skills.skills as any)[skill.key] ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>

              <div class="space-y-3 md:border-l md:border-df-border-red/35 md:pl-4">
                <div v-for="skill in knowledges" :key="`knowledges-${skill.key}`" class="df-skill-row">
                  <div class="df-skill-meta">
                    <label class="df-attr-label df-skill-name">{{ skill.name }}</label>
                  </div>
                  <div class="df-skill-dots">
                    <button v-for="n in 5" :key="n" type="button" @click="setSkill('knowledges', skill.key, n)" :class="['df-dot df-dot-sm', n <= (sheetData.skills.knowledges as any)[skill.key] ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Disciplines + Blood Potency + Advantages, Hunger, XP -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:items-start">
            <div class="space-y-3 flex flex-col">
              <!-- Disciplines -->
              <div class="df-card">
                <h3 class="df-section-title">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
                  Disciplinas
                </h3>
                <div
                  class="space-y-2 pr-2 scrollbar-thin scrollbar-thumb-df-border-red/50 scrollbar-track-transparent"
                  :class="sheetData.disciplines.length >= 4 ? 'max-h-[165px] overflow-y-auto' : ''"
                >
                  <div v-for="(discipline, index) in sheetData.disciplines" :key="index" class="flex items-center space-x-2 sm:space-x-3">
                    <select v-model="discipline.name" :disabled="!editMode" class="df-input flex-1">
                      <option value="">Selecione uma disciplina</option>
                      <option v-for="disc in vampireDisciplines" :key="disc" :value="disc">{{ disc }}</option>
                    </select>
                    <div class="flex space-x-0.5 sm:space-x-1">
                      <button v-for="n in 5" :key="n" type="button" @click="setDisciplineValue(index, n)" :disabled="!editMode" :class="['df-dot df-dot-md', n <= discipline.level ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                    </div>
                    <button v-if="editMode" type="button" @click="removeDiscipline(index)" class="df-btn-remove">
                      <svg class="w-5 h-5" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </button>
                  </div>
                  <button v-if="editMode" type="button" @click="addDiscipline" class="w-full py-2 mt-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-red hover:text-df-silver transition-colors bg-transparent cursor-pointer">
                    + Disciplina
                  </button>
                </div>
              </div>

              <!-- Advantages & Defects -->
              <div class="df-card">
                <h3 class="df-section-title">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Vantagens &amp; Defeitos
                </h3>
                <div v-if="sheetData.advantages.length > 0" class="space-y-3">
                  <template v-for="(adv, idx) in sheetData.advantages" :key="idx">
                    <div v-if="isValidAdvantage(adv)" class="space-y-2 p-3 rounded-lg border border-df-border-silver/20 bg-black/10">
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label class="text-xs text-df-muted mb-1 block">Categoria</label>
                          <select
                            v-model="adv.category"
                            @change="onCategoryChange(Number(idx))"
                            :disabled="!editMode || adv.fixo"
                            class="df-input w-full"
                          >
                            <option value="">Selecione...</option>
                            <option value="Antecedente">Antecedente</option>
                            <option value="Mérito">Mérito</option>
                            <option value="Defeito">Defeito</option>
                            <option value="Folha de Lore">Folha de Lore</option>
                          </select>
                        </div>

                        <div v-if="shouldShowTypeDropdown(adv.category)">
                          <label class="text-xs text-df-muted mb-1 block">Tipo</label>
                          <select
                            v-model="adv.type"
                            @change="onTypeChange(Number(idx))"
                            :disabled="!editMode || adv.fixo"
                            class="df-input w-full"
                          >
                            <option value="">Selecione...</option>
                            <option v-for="opt in getSubcategoryOptions(adv.category)" :key="opt" :value="opt">
                              {{ opt }}
                            </option>
                          </select>
                        </div>
                      </div>

                      <div class="flex items-end gap-2">
                        <div class="flex-1">
                          <label class="text-xs text-df-muted mb-1 block">Nome</label>
                          <select
                            v-model="adv.name"
                            @change="onNameChange(Number(idx))"
                            :disabled="!editMode || adv.fixo || !adv.category || (shouldShowTypeDropdown(adv.category) && !adv.type)"
                            class="df-input w-full"
                          >
                            <option value="">Selecione...</option>
                            <option v-for="opt in getNameOptions(adv)" :key="opt" :value="opt">
                              {{ opt }}
                            </option>
                          </select>
                        </div>

                        <div class="flex gap-1 pb-0.5">
                          <button
                            v-for="level in (adv.maxLevel || 5)"
                            :key="level"
                            type="button"
                            @click="setAdvantageLevel(Number(idx), level)"
                            :disabled="!editMode || adv.fixo"
                            :class="['df-dot df-dot-md', adv.level >= level ? 'df-dot-filled' : 'df-dot-empty', adv.fixo ? 'opacity-60 cursor-not-allowed' : '']"
                          >
                            <span class="sr-only">{{ level }}</span>
                          </button>
                        </div>

                        <button
                          v-if="editMode && !adv.fixo"
                          type="button"
                          @click="removeAdvantage(Number(idx))"
                          class="df-btn-remove pb-0.5"
                        >
                          <svg class="w-5 h-5" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                        </button>
                      </div>

                      <div>
                        <label class="text-xs text-df-muted mb-1 block">Detalhes/Especificação</label>
                        <input
                          v-model="adv.details"
                          type="text"
                          placeholder="Ex: Nome do contato, descrição do refúgio, etc..."
                          :disabled="!editMode"
                          class="df-input w-full"
                        />
                      </div>
                    </div>
                  </template>
                </div>
                <button v-if="editMode && sheetData.advantages.length < 10" type="button" @click="addAdvantage" class="w-full py-2 mt-3 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-red hover:text-df-silver transition-colors bg-transparent cursor-pointer">
                  + Adicionar Vantagem/Defeito ({{ sheetData.advantages.length }}/10)
                </button>
              </div>

              <!-- Hunger -->
              <div class="df-card">
                <h3 class="df-section-title">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6 2 10.5c0 2.5 1.5 4.5 3 5.5L7 22l2.5-5h5L17 22l2-6c1.5-1 3-3 3-5.5C22 6 17.5 2 12 2z"/><path d="M9 11v3.5"/><path d="M15 11v3.5"/></svg>
                  Fome
                </h3>
                <div class="flex gap-1">
                  <button v-for="level in 5" :key="level" type="button" @click="sheetData.hunger = level" :disabled="!editMode" :class="['df-dot df-dot-md', (sheetData.hunger || 0) >= level ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ level }}</span></button>
                </div>
              </div>
            </div>

            <div class="flex flex-col">
              <!-- Blood Potency -->
              <div class="df-card">
                <h3 class="df-section-title">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M6 3h12l-1 8c-.5 3-2.5 5-5 5s-4.5-2-5-5L6 3z"/></svg>
                  Potência de Sangue
                </h3>
                <div class="mb-4">
                  <label class="df-sub-label">Nível de Potência (0-10)</label>
                  <div class="flex gap-1 flex-wrap">
                    <button v-for="level in 10" :key="level" type="button" @click="setBloodPotency(level)" :disabled="!editMode" :class="['df-dot df-dot-md', sheetData.bloodPotency >= level ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ level }}</span></button>
                  </div>
                </div>
                <div class="space-y-2">
                  <div>
                    <label class="df-sub-label">Surto de Sangue</label>
                    <input v-model="sheetData.bloodSurge" type="text" placeholder="+2" :disabled="!editMode" class="df-input" />
                  </div>
                  <div>
                    <label class="df-sub-label">Bônus de Poder</label>
                    <input v-model="sheetData.powerBonus" type="text" placeholder="0" :disabled="!editMode" class="df-input" />
                  </div>
                  <div>
                    <label class="df-sub-label">Penalidade de Alimentação</label>
                    <input v-model="sheetData.feedingPenalty" type="text" placeholder="Sem Penalidade" :disabled="!editMode" class="df-input" />
                  </div>
                  <div>
                    <label class="df-sub-label">Gravidade da Perdição</label>
                    <input v-model="sheetData.baneSeverity" type="text" placeholder="0" :disabled="!editMode" class="df-input" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Humanity/Willpower/Vitality -->
          <div class="grid grid-cols-1 gap-3">
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                Humanidade, Vontade &amp; Vitalidade
              </h3>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="df-attr-label">Humanidade</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button v-for="n in 10" :key="n" type="button" @click="sheetData.humanity = n" :disabled="!editMode" :class="['df-dot df-dot-sm df-dot-gold', n <= sheetData.humanity ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <label class="df-attr-label">Força de Vontade</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button v-for="n in 10" :key="n" type="button" @click="sheetData.willpower = n" :disabled="!editMode" :class="['df-dot df-dot-sm df-dot-gold', n <= sheetData.willpower ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <label class="df-attr-label">Vitalidade</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button v-for="n in 10" :key="n" type="button" @click="sheetData.vitality = n" :disabled="!editMode" :class="['df-dot df-dot-sm df-dot-gold', n <= sheetData.vitality ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Key Points -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Pontos Chave na História
            </h3>
            <div class="space-y-2">
              <div v-for="(point, idx) in sheetData.keyPoints" :key="idx" class="flex items-center gap-2">
                <span class="text-red-500 font-bold text-sm flex-shrink-0">{{ idx + 1 }}.</span>
                <input v-model="sheetData.keyPoints[idx]" type="text" placeholder="Ex: Traiu o príncipe em 1920..." :disabled="!editMode" class="df-input flex-1" />
                <button v-if="editMode && sheetData.keyPoints.length > 1" type="button" @click="removeKeyPoint(idx)" class="df-btn-remove">
                  <svg class="w-5 h-5" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
              </div>
              <button v-if="editMode && sheetData.keyPoints.length < 20" type="button" @click="addKeyPoint" class="w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-red hover:text-df-silver transition-colors bg-transparent cursor-pointer">
                + Adicionar Ponto Chave
              </button>
            </div>
          </div>

          <!-- Embrace Generation -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              Geração do Abraço
            </h3>
            <select v-model="sheetData.embraceGeneration" :disabled="!editMode" class="df-input">
              <option value="">Selecionar</option>
              <option value="childer">[Cria] Abraçado nos últimos 15 anos</option>
              <option value="neonate">[Neófito] Abraçado entre 15 - 50 anos atrás</option>
              <option value="ancilla">[Ancião] Abraçado entre 50 - 100 anos atrás</option>
            </select>
          </div>

          <!-- History / Notes -->
          <div class="df-card">
            <h3 class="df-section-title">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              História do Personagem
            </h3>
            <textarea v-model="sheetData.history" rows="6" placeholder="História completa: origem, vida mortal, abraço, eventos da não-vida..." :disabled="!editMode" class="df-input"></textarea>
          </div>
          </div>
        </form>
        </div>

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
              <button
                type="button"
                @click="confirmSave"
                class="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-emerald-900/50"
              >
                Sim, Salvar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { NPC } from '~/types'
import { useToast } from '~/composables/useToast'
import { vantagensDados } from '~/config/advantagesData'
import BaseButton from '~/components/ui/BaseButton.vue'
import NPCClanSelector from '~/components/ui/NPCClanSelector.vue'
import NPCGenerationSelector from '~/components/ui/NPCGenerationSelector.vue'

interface Props { npc: NPC }
const props = defineProps<Props>()
const emit = defineEmits<{ close: []; save: [npcData: any] }>()
const toast = useToast()

const editMode = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const hasUnsavedChanges = ref(false)
const showConfirmModal = ref(false)
const showSaveConfirmModal = ref(false)
const isPredatorOpen = ref(false)

const sectOptions = ['Camarilla', 'Sabá', 'Anarquistas', 'Independente']

const predatorTypeOptions = computed(() => ([
  { name: 'Consensualista', description: 'Alimenta-se com consentimento.' },
  { name: 'Fazendeiro', description: sheetData.value.clan === 'Ventrue' ? 'Ventrue não pode escolher.' : 'Prefere sangue animal.', blocked: sheetData.value.clan === 'Ventrue' },
  { name: 'Osiris', description: 'Cultiva devotos para se alimentar.' },
  { name: 'Sacoleiro', description: sheetData.value.clan === 'Ventrue' ? 'Ventrue não pode escolher.' : 'Rouba sangue de bancos/hospitais.', blocked: sheetData.value.clan === 'Ventrue' },
  { name: 'Sandman', description: 'Caça vítimas adormecidas.' },
  { name: 'Sanguessuga', description: 'Alimenta-se de outros vampiros.' },
  { name: 'Scene Queen', description: 'Predação em cenas sociais noturnas.' },
  { name: 'Sereia', description: 'Seduz suas vítimas para se alimentar.' },
  { name: 'Trinchador', description: 'Predação violenta e brutal.' },
  { name: 'Vira-Lata', description: 'Caça entre os marginalizados.' }
]))

const getPredatorSummary = (predatorName: string) => {
  if (!predatorName) return ''
  return predatorTypeOptions.value.find(p => p.name === predatorName)?.description || ''
}

const selectPredatorType = (predatorName: string) => {
  const selected = predatorTypeOptions.value.find(p => p.name === predatorName)
  if (!selected || selected.blocked || !editMode.value) return

  sheetData.value.predator = predatorName
  hasUnsavedChanges.value = true
  isPredatorOpen.value = false
}

const onAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Arquivo muito grande', 'O avatar deve ter no máximo 2MB.')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    sheetData.value.avatar = e.target?.result as string
    editMode.value = true
    hasUnsavedChanges.value = true
  }
  reader.readAsDataURL(file)
}

const getInitials = (name: string) => {
  if (!name) return 'N'
  const words = name.split(' ').filter(w => w.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) return (words[0][0] + words[1][0]).toUpperCase()
  return words[0]?.[0]?.toUpperCase() || 'N'
}

const vampireClans = [
  'Banu Haqim', 'Brujah', 'Gangrel', 'Hecata', 'Lasombra',
  'Malkavian', 'Nosferatu', 'O Ministério', 'Ravnos', 'Salubri',
  'Toreador', 'Tremere', 'Tzimisce', 'Ventrue', 'Caitiff', 'Sangue Fraco'
]

const vampireDisciplines = [
  'Animalismo', 'Auspícios', 'Celeridade', 'Dominação', 'Feitiçaria de Sangue',
  'Fortitude', 'Metamorfose', 'Ofuscação', 'Potência', 'Presença', 'Proteanismo',
  'Tenebrosidade', 'Serpentis', 'Quietus', 'Quimerismo', 'Vicissitude'
]

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
const skillsList = [
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

const normalizeAdvantage = (adv: any) => ({
  category: adv?.category || '',
  type: adv?.type || '',
  name: adv?.name || '',
  level: typeof adv?.level === 'number' ? adv.level : 0,
  details: adv?.details || '',
  fixo: Boolean(adv?.fixo),
  maxLevel: typeof adv?.maxLevel === 'number' ? adv.maxLevel : 5
})

const hasMeaningfulAdvantage = (adv: any): boolean => {
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

const isValidAdvantage = (adv: any): boolean => {
  if (!adv.fixo) return true
  if (!adv.name || adv.name.trim() === '') return false
  if (adv.name === 'Especialidade' && adv.details && adv.details.includes('(') && adv.details.includes(')')) {
    return false
  }
  return true
}

const cloneValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const normalizeDiscipline = (discipline: any) => ({
  name: discipline?.name || '',
  level: typeof discipline?.level === 'number' ? discipline.level : 0
})

const hasMeaningfulDiscipline = (discipline: any): boolean => {
  if (!discipline) return false
  return Boolean(String(discipline.name || '').trim()) || Number(discipline.level || 0) > 0
}

const buildSheetData = () => ({
  name: existingSheet?.name || props.npc.name || '',
  concept: existingSheet?.concept || '',
  clan: existingSheet?.clan || props.npc.clan || '',
  // Keep generation/sect in sync with NPC modal edits (top-level fields are canonical).
  generation: props.npc.generation || existingSheet?.generation || 13,
  sect: props.npc.sect || existingSheet?.sect || '',
  predator: existingSheet?.predator || '',
  ambition: existingSheet?.ambition || '',
  desire: existingSheet?.desire || '',
  avatar: existingSheet?.avatar || props.npc.photo || '',
  keyPoints: (props.npc.keyPoints && props.npc.keyPoints.length > 0) ? [...props.npc.keyPoints] : [''],
  advantages: Array.isArray(existingSheet?.advantages) && existingSheet.advantages.length > 0
    ? existingSheet.advantages.map(normalizeAdvantage).filter(hasMeaningfulAdvantage)
    : [],
  bloodPotency: existingSheet?.bloodPotency || 0,
  bloodSurge: existingSheet?.bloodSurge || '+2',
  powerBonus: existingSheet?.powerBonus || '0',
  feedingPenalty: existingSheet?.feedingPenalty || 'Sem Penalidade',
  baneSeverity: existingSheet?.baneSeverity || '0',
  embraceGeneration: existingSheet?.embraceGeneration || '',
  history: existingSheet?.history || props.npc.bio || '',
  attributes: cloneValue(existingSheet?.attributes || {
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social: { charisma: 1, manipulation: 1, composure: 1 },
    mental: { intelligence: 1, wits: 1, resolve: 1 }
  }),
  skills: cloneValue(existingSheet?.skills || {
    talents: { melee: 1, firearms: 1, athletics: 1, brawl: 1, drive: 1, stealth: 1, larceny: 1, craft: 1, survival: 1 },
    skills: { animalKen: 1, etiquette: 1, intimidation: 1, leadership: 1, streetwise: 1, performance: 1, persuasion: 1, awareness: 1, subterfuge: 1 },
    knowledges: { science: 1, academics: 1, finance: 1, investigation: 1, medicine: 1, occult: 1, perception: 1, politics: 1, technology: 1 }
  }),
  disciplines: Array.isArray(existingSheet?.disciplines) && existingSheet.disciplines.length > 0
    ? existingSheet.disciplines.map(normalizeDiscipline).filter(hasMeaningfulDiscipline)
    : [],
  humanity: existingSheet?.humanity || 1,
  willpower: existingSheet?.willpower || 1,
  vitality: existingSheet?.vitality || 1,
  hunger: existingSheet?.hunger ?? 1
})

// Initialize sheet data from NPC's existing sheet or defaults
const existingSheet = props.npc.sheet
const pristineSheetData = ref(buildSheetData())
const sheetData = ref(cloneValue(pristineSheetData.value))

watch(sheetData, () => {
  if (editMode.value) {
    hasUnsavedChanges.value = true
  }
}, { deep: true })

// Methods
const setVal = (group: string, category: string, key: string, value: number) => {
  if (!editMode.value) return
  ;(sheetData.value as any)[group][category][key] = value
}
const setSkill = (category: string, skill: string, value: number) => {
  if (!editMode.value) return
  ;(sheetData.value.skills as any)[category][skill] = value
}
const setDisciplineValue = (index: number, value: number) => {
  if (!editMode.value || !sheetData.value.disciplines[index]) return
  sheetData.value.disciplines[index].level = value
}
const addDiscipline = () => {
  if (!editMode.value) return
  sheetData.value.disciplines.push(normalizeDiscipline({}))
}
const removeDiscipline = (index: number) => {
  if (!editMode.value) return
  sheetData.value.disciplines.splice(index, 1)
}
const setAdvantageLevel = (index: number, level: number) => {
  if (!editMode.value) return
  const adv = sheetData.value.advantages[index]
  if (adv) adv.level = adv.level === level ? 0 : level
}
const addAdvantage = () => {
  if (!editMode.value) return
  if (sheetData.value.advantages.length >= 10) {
    toast.warning('Limite máximo de 10 vantagens/defeitos atingido')
    return
  }
  sheetData.value.advantages.push(normalizeAdvantage({}))
}
const removeAdvantage = (index: number) => {
  if (!editMode.value) return
  if (sheetData.value.advantages[index]?.fixo) {
    toast.warning('Vantagens fixas não podem ser removidas')
    return
  }
  sheetData.value.advantages.splice(index, 1)
}

const getSubcategoryOptions = (category: string) => {
  if (category === 'Mérito' || category === 'Defeito') {
    const options = ['Físico', 'Mental', 'Social', 'Sobrenatural']
    if (sheetData.value.generation >= 14 && sheetData.value.generation <= 16) {
      options.push('Sangue Ralo')
    }
    return options
  }
  return []
  return []
}

const normalizeCategoryKey = (category: string): string => {
  const map: Record<string, string> = {
    'Antecedente': 'antecedentes',
    'Folha de Lore': 'loresheets',
    'Mérito': 'meritos',
    'Defeito': 'defeitos'
  }
  return map[category] || ''
}

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

  if (categoryKey === 'antecedentes') return vantagensDados.antecedentes
  if (categoryKey === 'loresheets') return vantagensDados.loresheets

  if (categoryKey === 'meritos' && type) {
    const typeKey = normalizeTypeKey(type) as keyof typeof vantagensDados.meritos
    return (vantagensDados.meritos[typeKey] || []).map((item: any) => item.nome)
  }

  if (categoryKey === 'defeitos' && type) {
    const typeKey = normalizeTypeKey(type) as keyof typeof vantagensDados.defeitos
    return (vantagensDados.defeitos[typeKey] || []).map((item: any) => item.nome)
  }

  return []
}

const shouldShowTypeDropdown = (category: string) => category === 'Mérito' || category === 'Defeito'

const onCategoryChange = (index: number) => {
  const advantage = sheetData.value.advantages[index]
  if (!advantage) return

  advantage.type = ''
  advantage.name = ''
  advantage.level = 0
  advantage.maxLevel = 5
}

const onTypeChange = (index: number) => {
  const advantage = sheetData.value.advantages[index]
  if (!advantage) return

  advantage.name = ''
  advantage.level = 0
  advantage.maxLevel = 5
}

const onNameChange = (index: number) => {
  const adv = sheetData.value.advantages[index]
  if (!adv) return

  const categoryKey = normalizeCategoryKey(adv.category)

  if (categoryKey === 'antecedentes' || categoryKey === 'loresheets') {
    adv.level = 1
    adv.fixo = false
    adv.maxLevel = 5
    return
  }

  if ((categoryKey === 'meritos' || categoryKey === 'defeitos') && adv.type && adv.name) {
    const typeKey = normalizeTypeKey(adv.type)
    const items = categoryKey === 'meritos'
      ? vantagensDados.meritos[typeKey as keyof typeof vantagensDados.meritos]
      : vantagensDados.defeitos[typeKey as keyof typeof vantagensDados.defeitos]

    const selectedItem = (items || []).find((item: any) => item.nome === adv.name)

    if (selectedItem) {
      adv.level = selectedItem.pontos
      adv.fixo = false
      adv.maxLevel = (selectedItem as any).max || 5
    }
  }
}
const addKeyPoint = () => { if (sheetData.value.keyPoints.length < 20) sheetData.value.keyPoints.push('') }
const removeKeyPoint = (index: number) => { sheetData.value.keyPoints.splice(index, 1) }
const setBloodPotency = (level: number) => {
  if (!editMode.value) return
  sheetData.value.bloodPotency = sheetData.value.bloodPotency === level ? level - 1 : level
}

const startEditing = () => {
  editMode.value = true
  hasUnsavedChanges.value = false
}

const saveSheet = () => {
  showSaveConfirmModal.value = true
}

const confirmSave = () => {
  showSaveConfirmModal.value = false
  const cleanedKeyPoints = sheetData.value.keyPoints.filter((p: string) => p && p.trim())
  const cleanedDisciplines = sheetData.value.disciplines
    .map(normalizeDiscipline)
    .filter(hasMeaningfulDiscipline)
  const cleanedAdvantages = sheetData.value.advantages
    .map(normalizeAdvantage)
    .filter(hasMeaningfulAdvantage)
  emit('save', {
    ...props.npc,
    name: sheetData.value.name,
    clan: sheetData.value.clan,
    generation: sheetData.value.generation,
    sect: sheetData.value.sect,
    bio: sheetData.value.history,
    photo: sheetData.value.avatar,
    keyPoints: cleanedKeyPoints,
    sheet: { ...sheetData.value, disciplines: cleanedDisciplines, advantages: cleanedAdvantages }
  })
  pristineSheetData.value = cloneValue({ ...sheetData.value, disciplines: cleanedDisciplines, advantages: cleanedAdvantages })
  hasUnsavedChanges.value = false
  editMode.value = false
  toast.success('Ficha salva!', 'As alterações foram registradas.')
}

const cancelSave = () => {
  showSaveConfirmModal.value = false
}

const restorePristineData = () => {
  sheetData.value = cloneValue(pristineSheetData.value)
}

const cancelEdit = () => {
  handleClose()
}

const handleClose = () => {
  if (editMode.value && hasUnsavedChanges.value) {
    showConfirmModal.value = true
    return
  }

  emit('close')
}

const confirmClose = () => {
  showConfirmModal.value = false
  showSaveConfirmModal.value = false
  restorePristineData()
  hasUnsavedChanges.value = false
  editMode.value = false
  emit('close')
}

const cancelClose = () => {
  showConfirmModal.value = false
}
</script>

<style scoped>
/* ══════════════════════════════════════════════════════════════
   DARK FANTASY UI — NPC Character Sheet
   (Mirrors PlayerSheet.vue styles exactly)
   ══════════════════════════════════════════════════════════════ */

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

.df-main-panel {
  background: var(--df-bg-deep);
  background-image: radial-gradient(ellipse at 50% 30%, rgba(127, 29, 29, 0.08) 0%, transparent 70%);
  border: 1px solid rgba(220, 38, 38, 0.4);
  box-shadow: 0 0 60px rgba(220, 38, 38, 0.25), inset 0 1px 10px rgba(0, 0, 0, 0.8);
  border-radius: 1rem;
  overflow: hidden;
  max-height: 88vh;
}

.df-modal-card {
  position: relative;
}

.df-header-premium {
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(220, 38, 38, 0.2);
  background: linear-gradient(to bottom, rgba(220, 38, 38, 0.05), transparent);
  flex-shrink: 0;
}

.df-modal-body {
  padding: 1rem 1.5rem;
}

.df-scrollbar::-webkit-scrollbar { width: 6px; }
.df-scrollbar::-webkit-scrollbar-track { background: rgba(13, 13, 32, 0.6); }
.df-scrollbar::-webkit-scrollbar-thumb { background: rgba(220, 38, 38, 0.35); border-radius: 999px; }
.df-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.55); }

.df-corner { position: absolute; width: 28px; height: 28px; z-index: 20; pointer-events: none; }
.df-corner::before, .df-corner::after { content: ''; position: absolute; }
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


.df-editor-badge {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--df-border-red);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--df-text-gold);
  background: linear-gradient(180deg, rgba(185, 28, 28, 0.2) 0%, rgba(10, 10, 26, 0.95) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.df-editor-title {
  margin: 0;
  color: #f0f0f5;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.df-editor-subtitle {
  margin: 2px 0 0;
  color: #8b8ba8;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-style: italic;
}

.df-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  color: var(--df-text-silver, #6b6b80);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.df-close-btn:hover {
  border-color: var(--df-accent-red, #dc2626);
  background: rgba(220, 38, 38, 0.1);
  color: #ffffff;
}

.df-sheet-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.df-sheet-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.df-btn-back {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; background: transparent;
  border: 1px solid transparent; color: var(--df-text-silver);
  border-radius: 0.375rem; cursor: pointer; transition: all 0.2s;
}
.df-btn-back:hover { color: var(--df-accent-red); border-color: var(--df-border-red); background: rgba(127, 29, 29, 0.15); }

.df-avatar-frame {
  border-radius: 9999px; padding: 3px;
  background: linear-gradient(135deg, var(--df-accent-red), var(--df-border-silver), var(--df-accent-crimson));
  box-shadow: 0 0 14px var(--df-glow-red);
  animation: df-pulse 4s ease-in-out infinite;
  width: 62px; height: 62px; min-width: 62px; min-height: 62px;
}
.df-avatar-inner { width: 56px; height: 56px; }
@keyframes df-pulse {
  0%, 100% { box-shadow: 0 0 14px var(--df-glow-red); }
  50%      { box-shadow: 0 0 24px var(--df-glow-red), 0 0 40px rgba(220, 38, 38, 0.1); }
}

.df-title {
  color: var(--df-accent-red); font-weight: 800;
  text-shadow: 0 0 24px var(--df-glow-red), 0 2px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.02em;
}

.df-card {
  background: rgba(18, 18, 26, 0.5);
  border: 1px solid rgba(74, 74, 90, 0.3);
  box-shadow: none;
  border-radius: 0.5rem;
  padding: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.df-card:hover {
  border-color: rgba(220, 38, 38, 0.3);
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.1);
}

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
  line-height: 1.35;
  letter-spacing: 0.01em;
  text-transform: none;
}

.df-modal-text {
  color: var(--df-text-silver);
  opacity: 0.85;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.85;
  letter-spacing: 0.01em;
  text-transform: none;
}

.df-section-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--df-text-gold);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.7rem;
  padding-bottom: 0;
  position: relative;
}
.df-section-title::after {
  display: none;
}

.df-section-title::before {
  content: '';
  width: 3px;
  height: 12px;
  background: linear-gradient(to bottom, var(--df-text-gold), transparent);
  border-radius: 2px;
}

@media (min-width: 640px) { .df-section-title { font-size: 0.82rem; } }
@media (min-width: 768px) { .df-section-title { font-size: 0.88rem; } }

.df-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--df-text-gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
  text-shadow: none;
}
.df-sub-label { display: block; font-size: 0.75rem; color: var(--df-text-silver); opacity: 0.7; margin-bottom: 0.25rem; }
.df-attr-label { font-size: 0.75rem; font-weight: 500; color: var(--df-text-silver); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }
@media (min-width: 640px) { .df-attr-label { font-size: 0.875rem; } }

.df-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.8125rem;
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  background: var(--df-bg-input);
  color: #ffffff;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.df-input:focus { border-color: var(--df-accent-red); box-shadow: 0 0 8px rgba(220, 38, 38, 0.2); }
.df-input:disabled { opacity: 0.6; cursor: not-allowed; }
.df-input::placeholder { color: var(--df-border-silver); }
@media (min-width: 640px) { .df-input { padding: 8px 12px; } }

.df-section-compact {
  padding: 1rem;
  background: rgba(18, 18, 26, 0.5);
  border: 1px solid rgba(74, 74, 90, 0.3);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.df-section-title-compact {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--df-text-gold, #d4a647);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.df-section-title-compact::before {
  content: '';
  width: 3px;
  height: 12px;
  background: linear-gradient(to bottom, var(--df-text-gold, #d4a647), transparent);
  border-radius: 2px;
}

.df-pill {
  width: 100%;
  padding: 0.55rem 0.7rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(74, 74, 90, 0.55);
  background: rgba(18, 18, 26, 0.9);
  color: #d1d1dc;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.df-pill:hover:not(:disabled) {
  border-color: rgba(220, 38, 38, 0.5);
  background: rgba(23, 23, 34, 1);
}

.df-pill-active {
  border-color: rgba(220, 38, 38, 0.75);
  background: linear-gradient(135deg, rgba(153, 27, 27, 0.35), rgba(127, 29, 29, 0.2));
  color: #f1f1f6;
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.18);
}

.df-clan-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--df-bg-input, #0d0d20);
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.df-clan-trigger:hover:not(:disabled) {
  border-color: var(--df-accent-red, #dc2626);
  background: var(--df-bg-card, #0a0a1a);
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.15);
}

.df-clan-trigger-active {
  border-color: var(--df-accent-red, #dc2626);
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.2);
}

.df-clan-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(74, 74, 90, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.df-clan-option:last-child {
  border-bottom: none;
}

.df-clan-option:hover:not(:disabled) {
  background: rgba(127, 29, 29, 0.15);
}

.df-clan-option-selected {
  background: rgba(220, 38, 38, 0.1);
}

.df-clan-option:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.df-scrollbar::-webkit-scrollbar { width: 6px; }
.df-scrollbar::-webkit-scrollbar-track { background: rgba(13, 13, 32, 0.6); }
.df-scrollbar::-webkit-scrollbar-thumb { background: rgba(220, 38, 38, 0.35); border-radius: 999px; }
.df-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.55); }

.df-identity-grid {
  display: grid;
  row-gap: 32px;
}

.df-identity-row-quick {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.df-identity-columns {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 24px;
  column-gap: 24px;
}

.df-identity-group {
  min-width: 0;
  display: grid;
  gap: 16px;
  align-content: start;
}

.df-identity-sect-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.df-identity-grid .df-label {
  margin-bottom: 0;
  color: var(--df-text-gold, #d4a647);
}

.df-identity-grid .df-input,
.df-identity-grid .df-clan-trigger {
  height: 48px;
}

.df-identity-grid .df-input {
  padding-top: 0;
  padding-bottom: 0;
}

.df-identity-group-clan :deep(.df-label) {
  margin-bottom: 16px;
}

.df-identity-group-clan :deep(.df-clan-trigger) {
  height: 48px;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}

.df-identity-group-generation :deep(.space-y-1\.5 > :not([hidden]) ~ :not([hidden])) {
  margin-top: 0 !important;
}

.df-identity-group-generation :deep(.flex.flex-wrap.gap-2) {
  margin-top: 16px;
  gap: 12px;
}

.df-identity-group-generation :deep(p) {
  margin-top: 6px;
}

@media (min-width: 1024px) {
  .df-identity-row-quick {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .df-identity-columns {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .df-identity-span-name { grid-column: span 4; }
  .df-identity-span-concept { grid-column: span 3; }
  .df-identity-span-clan { grid-column: span 5; }

  .df-identity-area-generation { grid-column: span 5; grid-row: 1; }
  .df-identity-area-predator { grid-column: 6 / span 4; grid-row: 1; }
  .df-identity-area-ambition { grid-column: 10 / span 3; grid-row: 1; }
  .df-identity-area-sect { grid-column: span 5; grid-row: 2; }
  .df-identity-area-desire { grid-column: 6 / span 4; grid-row: 2; }
}

.df-attribute-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
}

.df-attribute-name {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.df-attribute-dots {
  display: grid;
  grid-template-columns: repeat(5, max-content);
  align-items: center;
  column-gap: 0.25rem;
  justify-content: end;
}

.df-skill-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 0.5rem;
}

.df-skill-meta {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.df-skill-name {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.df-skill-dots {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  justify-self: end;
}

/* Dots */
.df-dot { border-radius: 9999px; border: 2px solid; transition: all 0.2s ease; cursor: pointer; flex-shrink: 0; }
.df-dot-md { width: 16px; height: 16px; }
.df-dot-sm { width: 14px; height: 14px; }
@media (min-width: 640px) { .df-dot-md { width: 20px; height: 20px; } .df-dot-sm { width: 16px; height: 16px; } }
@media (min-width: 768px) { .df-dot-md { width: 24px; height: 24px; } .df-dot-sm { width: 20px; height: 20px; } }

.df-dot-filled {
  background: linear-gradient(135deg, #dc2626, #991b1b); border-color: #b91c1c;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 0 6px rgba(220, 38, 38, 0.4);
}
.df-dot-empty { background: transparent; border-color: var(--df-border-silver); }
.df-dot-empty:hover:not(:disabled) { background: rgba(220, 38, 38, 0.15); border-color: var(--df-accent-red); box-shadow: 0 0 6px rgba(220, 38, 38, 0.2); }

.df-dot-gold.df-dot-filled { background: linear-gradient(135deg, #eab308, #a16207); border-color: #ca8a04; box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 0 6px rgba(234, 179, 8, 0.4); }
.df-dot-gold.df-dot-empty { border-color: #78716c; }
.df-dot-gold.df-dot-empty:hover:not(:disabled) { background: rgba(234, 179, 8, 0.15); border-color: #eab308; box-shadow: 0 0 6px rgba(234, 179, 8, 0.2); }

.df-dot-blue.df-dot-filled { background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-color: #2563eb; box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 0 6px rgba(59, 130, 246, 0.4); }
.df-dot-blue.df-dot-empty { border-color: #475569; }
.df-dot-blue.df-dot-empty:hover:not(:disabled) { background: rgba(59, 130, 246, 0.15); border-color: #3b82f6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.2); }

.df-dot-green.df-dot-filled { background: linear-gradient(135deg, #22c55e, #15803d); border-color: #16a34a; box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 0 6px rgba(34, 197, 94, 0.4); }
.df-dot-green.df-dot-empty { border-color: #475569; }
.df-dot-green.df-dot-empty:hover:not(:disabled) { background: rgba(34, 197, 94, 0.15); border-color: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.2); }

/* Buttons */
.df-btn {
  display: inline-flex; align-items: center; padding: 6px 12px;
  border-radius: 0.375rem; font-size: 0.875rem; font-weight: 600;
  transition: all 0.2s ease; border: 1px solid; cursor: pointer;
}
.df-btn-edit {
  background: var(--df-bg-card); border-color: var(--df-border-red); color: var(--df-text-silver);
}
.df-btn-edit:hover { border-color: var(--df-accent-red); color: var(--df-accent-red); box-shadow: 0 0 10px var(--df-glow-red); }
.df-btn-save {
  background: linear-gradient(135deg, #15803d, #166534); border-color: #22c55e; color: #d1fae5;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}
.df-btn-save:hover { background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 0 18px rgba(34, 197, 94, 0.4); }
.df-btn-close {
  background: var(--df-bg-card); border-color: var(--df-border-red); color: var(--df-text-silver);
}
.df-btn-close:hover { border-color: var(--df-accent-red); color: var(--df-accent-red); box-shadow: 0 0 10px var(--df-glow-red); }
.df-btn-remove {
  padding: 4px; color: #f87171; background: transparent; border: none;
  cursor: pointer; transition: color 0.2s ease, transform 0.15s ease; border-radius: 4px;
}
.df-btn-remove:hover { color: #fca5a5; transform: scale(1.1); }
</style>
