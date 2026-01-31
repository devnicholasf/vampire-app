<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-surface-card rounded-lg border border-primary p-6 w-full max-w-6xl max-h-[95vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-text-primary">
          📋 Ficha de {{ npc.name }}
        </h2>
        <div class="flex space-x-2">
          <BaseButton 
            v-if="!editMode" 
            variant="outline" 
            size="sm" 
            @click="editMode = true"
          >
            ✏️ Editar
          </BaseButton>
          <BaseButton 
            v-if="editMode" 
            variant="primary" 
            size="sm" 
            @click="saveSheet"
          >
            💾 Salvar
          </BaseButton>
          <BaseButton 
            v-if="editMode" 
            variant="ghost" 
            size="sm" 
            @click="cancelEdit"
          >
            ❌ Cancelar
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click="$emit('close')">
            ✕ Fechar
          </BaseButton>
        </div>
      </div>

      <form @submit.prevent="saveSheet" class="space-y-8">
        <!-- Header da Ficha -->
        <div class="bg-surface-dark p-6 rounded-lg border border-primary">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">Nome</label>
              <input
                v-model="sheetData.name"
                :readonly="!editMode"
                class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">Conceito</label>
              <input
                v-model="sheetData.concept"
                :readonly="!editMode"
                placeholder="Ex: Ancião Político"
                class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">Clã</label>
              <select
                v-model="sheetData.clan"
                :disabled="!editMode"
                class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              >
                <option v-for="clan in vampireClans" :key="clan" :value="clan">
                  {{ clan }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">Geração</label>
              <input
                v-model.number="sheetData.generation"
                type="number"
                min="3"
                max="15"
                :readonly="!editMode"
                class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">Seita</label>
              <select
                v-model="sheetData.sect"
                :disabled="!editMode"
                class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="">Selecionar</option>
                <option value="Camarilla">Camarilla</option>
                <option value="Sabá">Sabá</option>
                <option value="Anarquistas">Anarquistas</option>
                <option value="Independente">Independente</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">Refúgio</label>
              <input
                v-model="sheetData.haven"
                :readonly="!editMode"
                placeholder="Local do refúgio"
                class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">Jogador</label>
              <input
                v-model="sheetData.player"
                :readonly="!editMode"
                placeholder="Nome do jogador"
                class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
              >
            </div>
          </div>
        </div>

        <!-- Atributos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Físicos -->
          <div class="bg-surface-dark p-6 rounded-lg border border-primary">
            <h3 class="text-lg font-semibold text-accent mb-4">🏋️ Atributos Físicos</h3>
            <div class="space-y-4">
              <div v-for="attr in physicalAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="text-sm font-medium text-text-primary">{{ attr.name }}</label>
                <div class="flex space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    :disabled="!editMode"
                    @click="setAttributeValue('physical', attr.key, n)"
                    :class="[
                      'w-6 h-6 rounded-full border-2 transition-colors',
                      n <= (sheetData.attributes.physical as any)[attr.key]
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

          <!-- Sociais -->
          <div class="bg-surface-dark p-6 rounded-lg border border-primary">
            <h3 class="text-lg font-semibold text-accent mb-4">🎭 Atributos Sociais</h3>
            <div class="space-y-4">
              <div v-for="attr in socialAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="text-sm font-medium text-text-primary">{{ attr.name }}</label>
                <div class="flex space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    :disabled="!editMode"
                    @click="setAttributeValue('social', attr.key, n)"
                    :class="[
                      'w-6 h-6 rounded-full border-2 transition-colors',
                      n <= (sheetData.attributes.social as any)[attr.key]
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

          <!-- Mentais -->
          <div class="bg-surface-dark p-6 rounded-lg border border-primary">
            <h3 class="text-lg font-semibold text-accent mb-4">🧠 Atributos Mentais</h3>
            <div class="space-y-4">
              <div v-for="attr in mentalAttributes" :key="attr.key" class="flex justify-between items-center">
                <label class="text-sm font-medium text-text-primary">{{ attr.name }}</label>
                <div class="flex space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    :disabled="!editMode"
                    @click="setAttributeValue('mental', attr.key, n)"
                    :class="[
                      'w-6 h-6 rounded-full border-2 transition-colors',
                      n <= (sheetData.attributes.mental as any)[attr.key]
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

        <!-- Habilidades -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Talentos -->
          <div class="bg-surface-dark p-6 rounded-lg border border-primary">
            <h3 class="text-lg font-semibold text-accent mb-4">⚡ Talentos</h3>
            <div class="space-y-3">
              <div v-for="skill in talents" :key="skill.key" class="flex justify-between items-center">
                <label class="text-sm text-text-primary">{{ skill.name }}</label>
                <div class="flex space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    :disabled="!editMode"
                    @click="setSkillValue('talents', skill.key, n)"
                    :class="[
                      'w-5 h-5 rounded-full border-2 transition-colors',
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
          <div class="bg-surface-dark p-6 rounded-lg border border-primary">
            <h3 class="text-lg font-semibold text-accent mb-4">🛠️ Perícias</h3>
            <div class="space-y-3">
              <div v-for="skill in skills" :key="skill.key" class="flex justify-between items-center">
                <label class="text-sm text-text-primary">{{ skill.name }}</label>
                <div class="flex space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    :disabled="!editMode"
                    @click="setSkillValue('skills', skill.key, n)"
                    :class="[
                      'w-5 h-5 rounded-full border-2 transition-colors',
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
          <div class="bg-surface-dark p-6 rounded-lg border border-primary">
            <h3 class="text-lg font-semibold text-accent mb-4">📚 Conhecimentos</h3>
            <div class="space-y-3">
              <div v-for="skill in knowledges" :key="skill.key" class="flex justify-between items-center">
                <label class="text-sm text-text-primary">{{ skill.name }}</label>
                <div class="flex space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    :disabled="!editMode"
                    @click="setSkillValue('knowledges', skill.key, n)"
                    :class="[
                      'w-5 h-5 rounded-full border-2 transition-colors',
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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Disciplinas -->
          <div class="bg-surface-dark p-6 rounded-lg border border-primary">
            <h3 class="text-lg font-semibold text-accent mb-4">🩸 Disciplinas</h3>
            <div class="space-y-4">
              <div v-for="(discipline, index) in sheetData.disciplines" :key="index" class="flex items-center space-x-3">
                <input
                  v-model="discipline.name"
                  :readonly="!editMode"
                  placeholder="Nome da Disciplina"
                  class="flex-1 px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
                >
                <div class="flex space-x-1">
                  <button
                    v-for="n in 5"
                    :key="n"
                    type="button"
                    :disabled="!editMode"
                    @click="setDisciplineValue(index, n)"
                    :class="[
                      'w-6 h-6 rounded-full border-2 transition-colors',
                      n <= discipline.level
                        ? 'bg-red-600 border-red-600'
                        : 'border-red-600 hover:bg-red-600 hover:bg-opacity-30'
                    ]"
                  >
                    <span class="sr-only">{{ n }}</span>
                  </button>
                </div>
                <BaseButton
                  v-if="editMode"
                  variant="ghost"
                  size="sm"
                  type="button"
                  @click="removeDiscipline(index)"
                  class="text-red-400"
                >
                  🗑️
                </BaseButton>
              </div>
              <BaseButton
                v-if="editMode"
                variant="outline"
                size="sm"
                type="button"
                @click="addDiscipline"
                class="w-full"
              >
                + Adicionar Disciplina
              </BaseButton>
            </div>
          </div>

          <!-- Virtudes e Humanidade -->
          <div class="space-y-6">
            <!-- Virtudes -->
            <div class="bg-surface-dark p-6 rounded-lg border border-primary">
              <h3 class="text-lg font-semibold text-accent mb-4">✨ Virtudes</h3>
              <div class="space-y-4">
                <div v-for="virtue in virtues" :key="virtue.key" class="flex justify-between items-center">
                  <label class="text-sm font-medium text-text-primary">{{ virtue.name }}</label>
                  <div class="flex space-x-1">
                    <button
                      v-for="n in 5"
                      :key="n"
                      type="button"
                      :disabled="!editMode"
                      @click="setVirtueValue(virtue.key, n)"
                      :class="[
                        'w-6 h-6 rounded-full border-2 transition-colors',
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
            <div class="bg-surface-dark p-6 rounded-lg border border-primary">
              <h3 class="text-lg font-semibold text-accent mb-4">❤️ Humanidade & Força de Vontade</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-text-primary">Humanidade</label>
                  <div class="flex space-x-1">
                    <button
                      v-for="n in 10"
                      :key="n"
                      type="button"
                      :disabled="!editMode"
                      @click="sheetData.humanity = n"
                      :class="[
                        'w-5 h-5 rounded-full border-2 transition-colors',
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
                  <label class="text-sm font-medium text-text-primary">Força de Vontade</label>
                  <div class="flex space-x-1">
                    <button
                      v-for="n in 10"
                      :key="n"
                      type="button"
                      :disabled="!editMode"
                      @click="sheetData.willpower = n"
                      :class="[
                        'w-5 h-5 rounded-full border-2 transition-colors',
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
        <div class="bg-surface-dark p-6 rounded-lg border border-primary">
          <h3 class="text-lg font-semibold text-accent mb-4">💊 Níveis de Saúde</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div v-for="(health, index) in healthLevels" :key="index" class="text-center">
              <label class="block text-xs text-text-muted mb-1">{{ health.name }}</label>
              <button
                type="button"
                :disabled="!editMode"
                @click="toggleHealthLevel(index)"
                :class="[
                  'w-8 h-8 rounded-full border-2 transition-colors',
                  sheetData.healthLevels[index]
                    ? 'bg-red-600 border-red-600'
                    : 'border-red-600 hover:bg-red-600 hover:bg-opacity-30'
                ]"
              >
                <span class="sr-only">{{ health.name }}</span>
              </button>
              <div class="text-xs text-text-muted mt-1">{{ health.penalty }}</div>
            </div>
          </div>
        </div>

        <!-- Notas -->
        <div class="bg-surface-dark p-6 rounded-lg border border-primary">
          <h3 class="text-lg font-semibold text-accent mb-4">📝 Notas e História</h3>
          <textarea
            v-model="sheetData.notes"
            :readonly="!editMode"
            rows="6"
            placeholder="História, personalidade, objetivos, segredos..."
            class="w-full px-3 py-2 border border-primary rounded-md bg-surface text-text-primary focus:border-accent focus:outline-none"
          ></textarea>
        </div>
      </form>

      <!-- Toast Notification -->
      <BaseToast
        v-if="showToast"
        :message="toastMessage"
        :variant="toastType"
        @dismiss="hideToast"
        class="fixed top-4 right-4 z-[10000]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseToast from '~/components/ui/BaseToast.vue'
import type { NPC } from '~/types'

// Props
interface Props {
  npc: NPC
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [npcData: any]
}>()

// Reactive data
const editMode = ref(false)

// Toast states
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const showToast = ref(false)

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
  name: props.npc.name || '',
  concept: '',
  clan: props.npc.clan || '',
  generation: props.npc.generation || 13,
  sect: '',
  haven: '',
  player: '',
  attributes: {
    physical: { strength: 1, dexterity: 1, stamina: 1 },
    social: { charisma: 1, manipulation: 1, appearance: 1 },
    mental: { perception: 1, intelligence: 1, wits: 1 }
  },
  skills: {
    talents: { alertness: 0, athletics: 0, awareness: 0, brawl: 0, empathy: 0, expression: 0, intimidation: 0, leadership: 0, streetwise: 0, subterfuge: 0 },
    skills: { animalKen: 0, craft: 0, drive: 0, etiquette: 0, firearms: 0, larceny: 0, melee: 0, performance: 0, stealth: 0, survival: 0 },
    knowledges: { academics: 0, computer: 0, finance: 0, investigation: 0, law: 0, medicine: 0, occult: 0, politics: 0, science: 0, technology: 0 }
  },
  disciplines: [
    { name: '', level: 0 }
  ],
  virtues: { conscience: 1, selfControl: 1, courage: 1 },
  humanity: 7,
  willpower: 3,
  healthLevels: [false, false, false, false, false, false, false],
  notes: props.npc.bio || ''
})

// Methods
const setAttributeValue = (category: string, attribute: string, value: number) => {
  if (!editMode.value) return
  ;(sheetData.value.attributes as any)[category][attribute] = value
}

const setSkillValue = (category: string, skill: string, value: number) => {
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

const addDiscipline = () => {
  sheetData.value.disciplines.push({ name: '', level: 0 })
}

const removeDiscipline = (index: number) => {
  sheetData.value.disciplines.splice(index, 1)
}

const toggleHealthLevel = (index: number) => {
  if (!editMode.value) return
  sheetData.value.healthLevels[index] = !sheetData.value.healthLevels[index]
}

const saveSheet = () => {
  // Emit save event with updated data
  emit('save', {
    ...props.npc,
    ...sheetData.value,
    sheet: sheetData.value
  })
  editMode.value = false
  showToastMessage('Ficha salva com sucesso!', 'success')
}

const cancelEdit = () => {
  editMode.value = false
  // Reset to original values
  sheetData.value.name = props.npc.name || ''
  sheetData.value.clan = props.npc.clan || ''
  sheetData.value.generation = props.npc.generation || 13
  sheetData.value.notes = props.npc.bio || ''
}

const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}

const hideToast = () => {
  showToast.value = false
}
</script>