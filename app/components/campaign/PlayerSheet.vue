<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-2 sm:p-4"
    @click.self="handleClose"
  >
    <div class="bg-surface-card rounded-lg border border-primary p-3 sm:p-4 md:p-6 w-full max-w-7xl max-h-[98vh] overflow-y-auto shadow-2xl">
      <div class="flex justify-between items-center mb-3 sm:mb-4 sticky top-0 bg-surface-card z-10 pb-2 border-b border-primary">
        <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">
          📋 Ficha de {{ player.characterName || player.character_name || 'Personagem' }}
        </h2>
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 md:mt-6">
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
            <div>
              <label class="block text-xs sm:text-sm font-medium text-text-primary mb-1 sm:mb-2">Jogador</label>
              <input
                v-model="sheetData.player"
                placeholder="Seu nome"
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

        <!-- Disciplinas e Vantagens -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <!-- Disciplinas -->
          <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
            <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">🩸 Disciplinas</h3>
            <div class="space-y-2 sm:space-y-3 md:space-y-4">
              <div v-for="(discipline, index) in sheetData.disciplines" :key="index" class="flex items-center space-x-2 sm:space-x-3">
                <input
                  v-model="discipline.name"
                  placeholder="Nome da Disciplina"
                  :disabled="!canEdit"
                  class="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 text-sm border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                <div class="flex space-x-0.5 sm:space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    @click="setDisciplineValue(index, n)"
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
                <BaseButton
                  v-if="canEdit"
                  variant="ghost"
                  size="sm"
                  type="button"
                  @click="removeDiscipline(index)"
                  class="text-red-400 !p-1"
                >
                  🗑️
                </BaseButton>
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

          <!-- Virtudes e Humanidade -->
          <div class="space-y-3 sm:space-y-4 md:space-y-6">
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

            <!-- Humanidade & Força de Vontade -->
            <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
              <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">❤️ Humanidade & Vontade</h3>
              <div class="space-y-2 sm:space-y-3 md:space-y-4">
                <div class="flex justify-between items-center">
                  <label class="text-xs sm:text-sm font-medium text-text-primary">Humanidade</label>
                  <div class="flex space-x-0.5 sm:space-x-1">
                    <button
                      v-for="n in 10"
                      :key="n"
                      type="button"
                      @click="sheetData.humanity = n; hasUnsavedChanges = true"
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
              </div>
            </div>
          </div>
        </div>

        <!-- Saúde -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">💊 Níveis de Saúde</h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
            <div v-for="(health, index) in healthLevels" :key="index" class="text-center">
              <label class="block text-[10px] sm:text-xs text-text-muted mb-1">{{ health.name }}</label>
              <button
                type="button"
                @click="toggleHealthLevel(index)"
                :class="[
                  'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border-2 transition-colors mx-auto',
                  sheetData.healthLevels[index]
                    ? 'bg-red-600 border-red-600'
                    : 'border-red-600 hover:bg-red-600 hover:bg-opacity-30'
                ]"
              >
                <span class="sr-only">{{ health.name }}</span>
              </button>
              <div class="text-[10px] sm:text-xs text-text-muted mt-0.5 sm:mt-1">{{ health.penalty }}</div>
            </div>
          </div>
        </div>

        <!-- Notas -->
        <div class="bg-surface-dark p-3 sm:p-4 md:p-6 rounded-lg border border-primary">
          <h3 class="text-sm sm:text-base md:text-lg font-semibold text-accent mb-2 sm:mb-3 md:mb-4">📝 História do Personagem</h3>
          <textarea
            v-model="sheetData.notes"
            rows="4"
            placeholder="Conte a história do seu personagem, sua personalidade, objetivos e segredos..."
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

// Vampiro clãs
const vampireClans = [
  'Brujah', 'Gangrel', 'Malkavian', 'Nosferatu', 'Toreador', 
  'Tremere', 'Ventrue', 'Assamita', 'Followers of Set', 'Giovanni',
  'Lasombra', 'Tzimisce', 'Caitiff', 'Thin-Blood'
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

// Habilidades
const talents = [
  { key: 'alertness', name: 'Prontidão' },
  { key: 'athletics', name: 'Esportes' },
  { key: 'awareness', name: 'Consciência' },
  { key: 'brawl', name: 'Briga' },
  { key: 'empathy', name: 'Empatia' },
  { key: 'expression', name: 'Expressão' },
  { key: 'intimidation', name: 'Intimidação' },
  { key: 'leadership', name: 'Liderança' },
  { key: 'streetwise', name: 'Lábia' },
  { key: 'subterfuge', name: 'Subterfúgio' }
]

const skills = [
  { key: 'animalKen', name: 'Empatia com Animais' },
  { key: 'craft', name: 'Ofícios' },
  { key: 'drive', name: 'Condução' },
  { key: 'etiquette', name: 'Etiqueta' },
  { key: 'firearms', name: 'Armas de Fogo' },
  { key: 'larceny', name: 'Furto' },
  { key: 'melee', name: 'Armas Brancas' },
  { key: 'performance', name: 'Performance' },
  { key: 'stealth', name: 'Furtividade' },
  { key: 'survival', name: 'Sobrevivência' }
]

const knowledges = [
  { key: 'academics', name: 'Acadêmicos' },
  { key: 'computer', name: 'Computador' },
  { key: 'finance', name: 'Finanças' },
  { key: 'investigation', name: 'Investigação' },
  { key: 'law', name: 'Direito' },
  { key: 'medicine', name: 'Medicina' },
  { key: 'occult', name: 'Ocultismo' },
  { key: 'politics', name: 'Política' },
  { key: 'science', name: 'Ciências' },
  { key: 'technology', name: 'Tecnologia' }
]

// Virtudes
const virtues = [
  { key: 'conscience', name: 'Consciência' },
  { key: 'selfControl', name: 'Autocontrole' },
  { key: 'courage', name: 'Coragem' }
]

// Níveis de saúde
const healthLevels = [
  { name: 'Escoriado', penalty: '-0' },
  { name: 'Machucado', penalty: '-1' },
  { name: 'Ferido', penalty: '-1' },
  { name: 'Ferido Gravemente', penalty: '-2' },
  { name: 'Espancado', penalty: '-2' },
  { name: 'Aleijado', penalty: '-5' },
  { name: 'Incapacitado', penalty: 'Inconsciente' }
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
  healthLevels: props.player.sheet?.healthLevels || [false, false, false, false, false, false, false],
  notes: props.player.sheet?.notes || ''
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

const toggleHealthLevel = (index: number) => {
  if (!props.canEdit) return
  sheetData.value.healthLevels[index] = !sheetData.value.healthLevels[index]
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
    emit('save', {
      ...props.player,
      characterName: sheetData.value.name,
      sheet: sheetData.value
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
