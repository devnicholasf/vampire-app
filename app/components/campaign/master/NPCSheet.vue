<template>
  <div class="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-4 df-overlay">
    <div class="relative w-full max-w-7xl max-h-[98vh]">
      <!-- Corner Decorations -->
      <div class="df-corner df-corner-tl"></div>
      <div class="df-corner df-corner-tr"></div>
      <div class="df-corner df-corner-bl"></div>
      <div class="df-corner df-corner-br"></div>

      <!-- Main Scroll Panel -->
      <div class="df-main-panel p-3 w-full max-h-[98vh] overflow-y-auto">

        <!-- Header -->
        <div class="flex items-center justify-between mb-3 sticky top-0 z-10 pb-3 pt-1 df-header-bar">
          <div class="flex items-center gap-3">
            <button type="button" @click="handleClose" class="df-btn-back flex-shrink-0" title="Voltar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <!-- Avatar (clickable to upload) -->
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            <div class="df-avatar-frame flex-shrink-0 cursor-pointer group" @click="avatarInput?.click()" title="Clique para alterar o avatar">
              <div class="df-avatar-inner rounded-full overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-gray-900 flex items-center justify-center relative">
                <img v-if="sheetData.avatar" :src="sheetData.avatar" :alt="sheetData.name" class="w-full h-full object-cover" />
                <span v-else class="text-red-200 font-bold text-xl sm:text-2xl md:text-3xl drop-shadow-lg">
                  {{ getInitials(sheetData.name) }}
                </span>
                <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              </div>
            </div>
            <h2 class="df-title text-xl sm:text-2xl md:text-4xl">
              {{ sheetData.name || npc.name || 'NPC' }}
            </h2>
          </div>
          <div class="flex space-x-2">
            <button v-if="!editMode" type="button" @click="editMode = true" class="df-btn df-btn-edit">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span class="hidden sm:inline ml-1">Editar</span>
            </button>
            <button v-if="editMode" type="button" @click="saveSheet" class="df-btn df-btn-save">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span class="hidden sm:inline ml-1">Salvar</span>
            </button>
            <button v-if="editMode" type="button" @click="cancelEdit" class="df-btn df-btn-close">
              <svg class="w-4 h-4" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span class="hidden sm:inline ml-1">Cancelar</span>
            </button>
            <button type="button" @click="handleClose" class="df-btn df-btn-close" title="Fechar">
              <svg class="w-4 h-4" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="saveSheet" class="space-y-4">
          <!-- Character Info Header -->
          <div class="df-card">
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="df-label">Nome <span class="text-red-400">*</span></label>
                <input v-model="sheetData.name" required :disabled="!editMode" class="df-input" />
              </div>
              <div>
                <label class="df-label">Conceito <span class="text-red-400">*</span></label>
                <input v-model="sheetData.concept" required :disabled="!editMode" placeholder="Ex: Ancião Político" class="df-input" />
              </div>
              <div>
                <label class="df-label">Clã <span class="text-red-400">*</span></label>
                <select v-model="sheetData.clan" required :disabled="!editMode" class="df-input">
                  <option value="">Selecionar</option>
                  <option v-for="clan in vampireClans" :key="clan" :value="clan">{{ clan }}</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label class="df-label">Geração <span class="text-red-400">*</span></label>
                <input v-model.number="sheetData.generation" type="number" min="3" max="15" required :disabled="!editMode" class="df-input" />
              </div>
              <div>
                <label class="df-label">Seita</label>
                <select v-model="sheetData.sect" :disabled="!editMode" class="df-input">
                  <option value="">Selecionar</option>
                  <option value="Camarilla">Camarilla</option>
                  <option value="Sabá">Sabá</option>
                  <option value="Anarquistas">Anarquistas</option>
                  <option value="Independente">Independente</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label class="df-label">Predador</label>
                <select v-model="sheetData.predator" :disabled="!editMode" class="df-input">
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
                <input v-model="sheetData.ambition" placeholder="Ambição do NPC" :disabled="!editMode" class="df-input" />
              </div>
              <div>
                <label class="df-label">Desejo</label>
                <input v-model="sheetData.desire" placeholder="Desejo do NPC" :disabled="!editMode" class="df-input" />
              </div>
            </div>
          </div>

          <!-- Attributes -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>
                Físicos
              </h3>
              <div class="space-y-2">
                <div v-for="attr in physicalAttributes" :key="attr.key" class="flex justify-between items-center">
                  <label class="df-attr-label">{{ attr.name }}</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
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
                <div v-for="attr in socialAttributes" :key="attr.key" class="flex justify-between items-center">
                  <label class="df-attr-label">{{ attr.name }}</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
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
                <div v-for="attr in mentalAttributes" :key="attr.key" class="flex justify-between items-center">
                  <label class="df-attr-label">{{ attr.name }}</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button v-for="n in 5" :key="n" type="button" @click="setVal('attributes', 'mental', attr.key, n)" :disabled="!editMode" :class="['df-dot df-dot-md', n <= (sheetData.attributes.mental as any)[attr.key] ? 'df-dot-filled' : 'df-dot-empty', !editMode && 'cursor-not-allowed opacity-60']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Talentos
              </h3>
              <div class="space-y-3">
                <div v-for="skill in talents" :key="skill.key" class="flex justify-between items-center">
                  <label class="df-attr-label">{{ skill.name }}</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button v-for="n in 5" :key="n" type="button" @click="setSkill('talents', skill.key, n)" :class="['df-dot df-dot-sm', n <= (sheetData.skills.talents as any)[skill.key] ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
                Perícias
              </h3>
              <div class="space-y-3">
                <div v-for="skill in skillsList" :key="skill.key" class="flex justify-between items-center">
                  <label class="df-attr-label">{{ skill.name }}</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button v-for="n in 5" :key="n" type="button" @click="setSkill('skills', skill.key, n)" :class="['df-dot df-dot-sm', n <= (sheetData.skills.skills as any)[skill.key] ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                Conhecimentos
              </h3>
              <div class="space-y-3">
                <div v-for="skill in knowledges" :key="skill.key" class="flex justify-between items-center">
                  <label class="df-attr-label">{{ skill.name }}</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
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
                <div class="space-y-2">
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
                  <button v-if="editMode" type="button" @click="addDiscipline" class="w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-red hover:text-df-silver transition-colors bg-transparent cursor-pointer">
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
                <div class="space-y-2">
                  <div v-for="(adv, idx) in sheetData.advantages" :key="idx" class="flex items-center gap-2">
                    <input v-model="adv.name" type="text" placeholder="Nome da vantagem/defeito" :disabled="!editMode" class="df-input flex-1" />
                    <div class="flex gap-1">
                      <button v-for="level in 5" :key="level" type="button" @click="setAdvantageLevel(Number(idx), level)" :disabled="!editMode" :class="['df-dot df-dot-md', adv.level >= level ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ level }}</span></button>
                    </div>
                    <button v-if="editMode && Number(idx) > 0" type="button" @click="removeAdvantage(Number(idx))" class="df-btn-remove">
                      <svg class="w-5 h-5" viewBox="0 0 12 12" fill="none"><path d="M1 1L11 11M1 11L11 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </button>
                  </div>
                  <button v-if="editMode && sheetData.advantages.length < 10" type="button" @click="addAdvantage" class="w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-red hover:text-df-silver transition-colors bg-transparent cursor-pointer">
                    + Adicionar Vantagem/Defeito
                  </button>
                </div>
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

          <!-- Virtues & Humanity/Willpower/Vitality -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div class="df-card">
              <h3 class="df-section-title">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Virtudes
              </h3>
              <div class="space-y-2">
                <div v-for="virtue in virtues" :key="virtue.key" class="flex justify-between items-center">
                  <label class="df-attr-label">{{ virtue.name }}</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button v-for="n in 5" :key="n" type="button" @click="setVirtueValue(virtue.key, n)" :disabled="!editMode" :class="['df-dot df-dot-md df-dot-gold', n <= (sheetData.virtues as any)[virtue.key] ? 'df-dot-filled' : 'df-dot-empty']"><span class="sr-only">{{ n }}</span></button>
                  </div>
                </div>
              </div>
            </div>
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
        </form>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { NPC } from '~/types'
import { useToast } from '~/composables/useToast'

interface Props { npc: NPC }
const props = defineProps<Props>()
const emit = defineEmits<{ close: []; save: [npcData: any] }>()
const toast = useToast()

const editMode = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

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

const virtues = [
  { key: 'conscience', name: 'Consciência' },
  { key: 'selfControl', name: 'Autocontrole' },
  { key: 'courage', name: 'Coragem' }
]

// Initialize sheet data from NPC's existing sheet or defaults
const existingSheet = props.npc.sheet
const sheetData = ref({
  name: existingSheet?.name || props.npc.name || '',
  concept: existingSheet?.concept || '',
  clan: existingSheet?.clan || props.npc.clan || '',
  generation: existingSheet?.generation || props.npc.generation || 13,
  sect: existingSheet?.sect || '',
  predator: existingSheet?.predator || '',
  ambition: existingSheet?.ambition || '',
  desire: existingSheet?.desire || '',
  avatar: existingSheet?.avatar || props.npc.photo || '',
  keyPoints: (props.npc.keyPoints && props.npc.keyPoints.length > 0) ? [...props.npc.keyPoints] : [''],
  advantages: existingSheet?.advantages || [{ name: '', level: 0 }],
  bloodPotency: existingSheet?.bloodPotency || 0,
  bloodSurge: existingSheet?.bloodSurge || '+2',
  powerBonus: existingSheet?.powerBonus || '0',
  feedingPenalty: existingSheet?.feedingPenalty || 'Sem Penalidade',
  baneSeverity: existingSheet?.baneSeverity || '0',
  embraceGeneration: existingSheet?.embraceGeneration || '',
  history: existingSheet?.history || props.npc.bio || '',
  attributes: existingSheet?.attributes || {
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social: { charisma: 1, manipulation: 1, composure: 1 },
    mental: { intelligence: 1, wits: 1, resolve: 1 }
  },
  skills: existingSheet?.skills || {
    talents: { melee: 1, firearms: 1, athletics: 1, brawl: 1, drive: 1, stealth: 1, larceny: 1, craft: 1, survival: 1 },
    skills: { animalKen: 1, etiquette: 1, intimidation: 1, leadership: 1, streetwise: 1, performance: 1, persuasion: 1, awareness: 1, subterfuge: 1 },
    knowledges: { science: 1, academics: 1, finance: 1, investigation: 1, medicine: 1, occult: 1, perception: 1, politics: 1, technology: 1 }
  },
  disciplines: existingSheet?.disciplines || [{ name: '', level: 0 }],
  virtues: existingSheet?.virtues || { conscience: 1, selfControl: 1, courage: 1 },
  humanity: existingSheet?.humanity || 1,
  willpower: existingSheet?.willpower || 1,
  vitality: existingSheet?.vitality || 1,
  hunger: existingSheet?.hunger ?? 1
})

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
const setVirtueValue = (virtue: string, value: number) => {
  if (!editMode.value) return
  ;(sheetData.value.virtues as any)[virtue] = value
}
const addDiscipline = () => { sheetData.value.disciplines.push({ name: '', level: 0 }) }
const removeDiscipline = (index: number) => { sheetData.value.disciplines.splice(index, 1) }
const setAdvantageLevel = (index: number, level: number) => {
  if (!editMode.value) return
  const adv = sheetData.value.advantages[index]
  if (adv) adv.level = adv.level === level ? 0 : level
}
const addAdvantage = () => { if (sheetData.value.advantages.length < 10) sheetData.value.advantages.push({ name: '', level: 0 }) }
const removeAdvantage = (index: number) => { sheetData.value.advantages.splice(index, 1) }
const addKeyPoint = () => { if (sheetData.value.keyPoints.length < 20) sheetData.value.keyPoints.push('') }
const removeKeyPoint = (index: number) => { sheetData.value.keyPoints.splice(index, 1) }
const setBloodPotency = (level: number) => {
  if (!editMode.value) return
  sheetData.value.bloodPotency = sheetData.value.bloodPotency === level ? level - 1 : level
}

const saveSheet = () => {
  const cleanedKeyPoints = sheetData.value.keyPoints.filter((p: string) => p && p.trim())
  emit('save', {
    ...props.npc,
    name: sheetData.value.name,
    clan: sheetData.value.clan,
    generation: sheetData.value.generation,
    sect: sheetData.value.sect,
    bio: sheetData.value.history,
    photo: sheetData.value.avatar,
    keyPoints: cleanedKeyPoints,
    sheet: { ...sheetData.value }
  })
  editMode.value = false
  toast.success('Ficha salva!', 'As alterações foram registradas.')
}

const cancelEdit = () => { editMode.value = false }
const handleClose = () => { emit('close') }
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
  border: 2px solid var(--df-border-red);
  box-shadow: 0 0 0 1px var(--df-border-silver), 0 0 40px rgba(220, 38, 38, 0.12), inset 0 0 80px rgba(0, 0, 0, 0.6);
  border-radius: 0.75rem;
  overflow-y: auto;
  max-height: 98vh;
}
.df-main-panel::-webkit-scrollbar { width: 6px; }
.df-main-panel::-webkit-scrollbar-track { background: var(--df-bg-deep); }
.df-main-panel::-webkit-scrollbar-thumb { background: var(--df-border-red); border-radius: 3px; }
.df-main-panel::-webkit-scrollbar-thumb:hover { background: var(--df-accent-red); }

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

.df-header-bar {
  background: var(--df-bg-deep);
  border-bottom: 1px solid var(--df-border-red);
  padding-top: 4px;
  margin-left: -12px; margin-right: -12px;
  padding-left: 12px; padding-right: 12px;
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
  background: var(--df-bg-card); border: 1px solid var(--df-border-red);
  box-shadow: 0 0 0 1px var(--df-border-silver), inset 0 1px 6px rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem; padding: 16px;
}

.df-section-title {
  display: flex; align-items: center; gap: 0.5rem;
  color: var(--df-text-gold); font-size: 0.875rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 0.75rem; padding-bottom: 0.5rem; position: relative;
}
.df-section-title::after {
  content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
  background: linear-gradient(90deg, var(--df-text-gold), var(--df-border-silver) 50%, transparent);
}
@media (min-width: 640px) { .df-section-title { font-size: 1rem; } }
@media (min-width: 768px) { .df-section-title { font-size: 1.125rem; } }

.df-label {
  display: block; font-size: 0.75rem; font-weight: 600; color: var(--df-text-silver);
  text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.25rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
.df-sub-label { display: block; font-size: 0.75rem; color: var(--df-text-silver); opacity: 0.7; margin-bottom: 0.25rem; }
.df-attr-label { font-size: 0.75rem; font-weight: 500; color: var(--df-text-silver); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }
@media (min-width: 640px) { .df-attr-label { font-size: 0.875rem; } }

.df-input {
  width: 100%; padding: 6px 8px; font-size: 0.875rem;
  border: 1px solid var(--df-border-red); border-radius: 0.375rem;
  background: var(--df-bg-input); color: var(--df-text-silver);
  outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.df-input:focus { border-color: var(--df-accent-red); box-shadow: 0 0 10px var(--df-glow-red); }
.df-input:disabled { opacity: 0.6; cursor: not-allowed; }
.df-input::placeholder { color: var(--df-border-silver); }
@media (min-width: 640px) { .df-input { padding: 8px 12px; } }

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
