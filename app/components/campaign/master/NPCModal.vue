<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
    <div class="df-modal-card w-full max-w-6xl max-h-[88vh] flex flex-col">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>

      <div class="relative z-10 flex flex-col max-h-[88vh]">
        <!-- Header Premium -->
        <div class="df-header-premium">
          <div class="flex items-start gap-3">
            <div class="df-header-icon">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-white tracking-wide">
                {{ npc ? 'Editar Personagem' : 'Criar Personagem da Crônica' }}
              </h3>
              <p class="text-xs text-df-muted italic">Cada vampiro possui fome, ambição e segredos.</p>
            </div>
            <button @click="$emit('close')" class="df-close-btn">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body Scrollável com Grid -->
        <div class="df-modal-body flex-1 overflow-y-auto df-scrollbar min-h-0">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Coluna Principal: Formulário (2/3) -->
            <div class="lg:col-span-2">
              <form @submit.prevent="handleSave" class="space-y-4">
                <!-- SEÇÃO: IDENTIDADE -->
                <section class="df-section-compact">
                  <h4 class="df-section-title-compact">Identidade</h4>
                  <div class="space-y-3">
                    <!-- Nome -->
                    <div>
                      <label class="df-label">Nome do Personagem *</label>
                      <input
                        v-model="form.name"
                        type="text"
                        required
                        class="df-input"
                        placeholder="Ex: Marcus Ventrue, A Sanguessuga"
                      />
                    </div>

                    <!-- Clã -->
                    <NPCClanSelector v-model="form.clan" />

                    <!-- Geração Visual -->
                    <NPCGenerationSelector v-model="form.generation" />

                    <!-- Seita -->
                    <div>
                      <label class="df-label">Seita</label>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          v-for="sect in sects"
                          :key="sect"
                          type="button"
                          @click="form.sect = sect"
                          class="df-pill"
                          :class="{ 'df-pill-active': form.sect === sect }"
                        >
                          {{ sect }}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- SEÇÃO: FUNÇÃO NA CRÔNICA -->
                <section class="df-section-compact">
                  <h4 class="df-section-title-compact">Função na Crônica</h4>
                  <div class="space-y-3">
                    <!-- Status -->
                    <div>
                      <label class="df-label">Status</label>
                      <div class="grid grid-cols-2 gap-2">
                        <button
                          v-for="status in statuses"
                          :key="status.value"
                          type="button"
                          @click="form.status = status.value"
                          class="df-pill"
                          :class="{ 'df-pill-active': form.status === status.value }"
                        >
                          {{ status.label }}
                        </button>
                      </div>
                    </div>

                    <!-- Nível de Ameaça -->
                    <NPCThreatSelector v-model="form.threat" />

                    <!-- Papel na Crônica -->
                    <div>
                      <label class="df-label">Papel na Crônica</label>
                      <input 
                        v-model="form.role" 
                        type="text" 
                        class="df-input" 
                        placeholder="Ex: Príncipe da Cidade, Informante Sabbat" 
                      />
                      <p class="text-[10px] text-zinc-500 italic mt-1">
                        Como este personagem se encaixa na narrativa?
                      </p>
                    </div>

                    <!-- Pool Principal com Autocomplete -->
                    <NPCPoolInput v-model="form.mainPool" />
                  </div>
                </section>

                <!-- SEÇÃO: NARRATIVA -->
                <section class="df-section-compact">
                  <h4 class="df-section-title-compact">Narrativa</h4>
                  <div class="space-y-3">
                    <!-- Motivação -->
                    <div>
                      <label class="df-label">Motivação Principal</label>
                      <p class="text-[10px] text-zinc-500 italic mb-2">
                        O que move este vampiro? Qual é sua ambição eterna?
                      </p>
                      <textarea 
                        v-model="form.motivation" 
                        rows="2" 
                        class="df-input resize-none" 
                        placeholder="Ex: Controlar todos os distritos financeiros da cidade através de manipulação política..."
                      ></textarea>
                    </div>

                    <!-- Segredo -->
                    <div>
                      <label class="df-label flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>Segredo Oculto</span>
                      </label>
                      <p class="text-[10px] text-zinc-500 italic mb-2">
                        Qual verdade destruiria este vampiro se fosse revelada?
                      </p>
                      <textarea 
                        v-model="form.secret" 
                        rows="2" 
                        class="df-input resize-none" 
                        placeholder="Ex: Diablerista em segredo, mantém laços com o Sabbat, senhor ainda está vivo..."
                      ></textarea>
                    </div>
                  </div>
                </section>

                <!-- SEÇÃO: RELAÇÕES -->
                <section class="df-section-compact">
                  <h4 class="df-section-title-compact">Relações & História</h4>
                  <NPCTagInput
                    v-model="form.keyPoints"
                    label="Pontos-Chave na Crônica"
                    placeholder="Ex: Conhece o paradeiro do Antediluviano..."
                  />
                </section>

                <!-- SEÇÃO: AVATAR -->
                <section class="df-section-compact">
                  <h4 class="df-section-title-compact">Aparência</h4>
                  <NPCDropzone
                    v-model="form.photo"
                    :name="form.name"
                    @error="handleDropzoneError"
                  />
                </section>

                <!-- SEÇÃO COLAPSÁVEL: DETALHES AVANÇADOS -->
                <section class="df-section-compact">
                  <button
                    type="button"
                    @click="showAdvanced = !showAdvanced"
                    class="flex items-center gap-2 w-full text-left group"
                  >
                    <svg 
                      class="w-4 h-4 text-[#C6A85A] transition-transform duration-200"
                      :class="{ 'rotate-90': showAdvanced }"
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      stroke-width="2"
                    >
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <h4 class="df-section-title-compact mb-0">
                      Detalhes Avançados
                    </h4>
                  </button>
                  
                  <div 
                    v-show="showAdvanced"
                    class="mt-3 space-y-3 animate-fadeIn"
                  >
                    <!-- Observações -->
                    <div>
                      <label class="df-label">Observações Gerais</label>
                      <textarea 
                        v-model="form.notes" 
                        rows="3" 
                        class="df-input resize-none" 
                        placeholder="Notas adicionais sobre o personagem..."
                      ></textarea>
                    </div>

                    <!-- Lore Extra -->
                    <div>
                      <label class="df-label">Lore & Background</label>
                      <textarea 
                        v-model="form.lore" 
                        rows="3" 
                        class="df-input resize-none" 
                        placeholder="História detalhada, origem, eventos importantes..."
                      ></textarea>
                    </div>

                    <!-- Relações Complexas -->
                    <div>
                      <label class="df-label">Relações Políticas</label>
                      <textarea 
                        v-model="form.politicalTies" 
                        rows="2" 
                        class="df-input resize-none" 
                        placeholder="Alianças, inimizades, laços de sangue..."
                      ></textarea>
                    </div>
                  </div>
                </section>
              </form>
            </div>

            <!-- Coluna Lateral: Preview (1/3) -->
            <div class="lg:col-span-1 hidden lg:block">
              <NPCPreview :npc="previewData" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="df-footer-premium">
          <button type="button" @click="$emit('close')" class="df-btn-ghost px-4 py-2">
            Cancelar
          </button>
          <button type="submit" @click="handleSave" class="df-btn-primary px-5 py-2">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ npc ? 'Salvar' : 'Criar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { NPC } from '~/types'
import { useToast } from '~/composables/useToast'
import NPCClanSelector from '~/components/ui/NPCClanSelector.vue'
import NPCGenerationSelector from '~/components/ui/NPCGenerationSelector.vue'
import NPCThreatSelector from '~/components/ui/NPCThreatSelector.vue'
import NPCPoolInput from '~/components/ui/NPCPoolInput.vue'
import NPCTagInput from '~/components/ui/NPCTagInput.vue'
import NPCDropzone from '~/components/ui/NPCDropzone.vue'
import NPCPreview from '~/components/ui/NPCPreview.vue'

interface Props { 
  npc?: NPC | null 
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [npcData: Omit<NPC, 'id' | 'campaignId' | 'createdAt'>]
}>()

const toast = useToast()
const showAdvanced = ref(false)

const sects = ['Camarilla', 'Sabá', 'Anarquistas', 'Independente']

const statuses = [
  { value: 'Ativo', label: 'Ativo' },
  { value: 'Desaparecido', label: 'Desaparecido' },
  { value: 'Caçado', label: 'Caçado' },
  { value: 'Traidor', label: 'Traidor' }
]

const form = ref({
  name: '',
  clan: '',
  generation: 10,
  status: 'Ativo' as string,
  sect: '',
  threat: 'moderado' as string,
  role: '',
  motivation: '',
  secret: '',
  mainPool: '',
  keyPoints: [] as string[],
  photo: '',
  notes: '',
  lore: '',
  politicalTies: ''
})

// Preview Data Computado
const previewData = computed(() => ({
  name: form.value.name,
  clan: form.value.clan,
  generation: form.value.generation,
  sect: form.value.sect,
  status: form.value.status,
  threat: form.value.threat,
  role: form.value.role,
  mainPool: form.value.mainPool,
  motivation: form.value.motivation,
  secret: form.value.secret,
  photo: form.value.photo
}))

watchEffect(() => {
  if (props.npc) {
    form.value = {
      name: props.npc.name,
      clan: props.npc.clan || '',
      generation: props.npc.generation || 10,
      status: props.npc.status || 'Ativo',
      sect: props.npc.sect || '',
      threat: (props.npc as any).threat || 'moderado',
      role: props.npc.role || '',
      motivation: props.npc.motivation || '',
      secret: props.npc.secret || '',
      mainPool: props.npc.mainPool || '',
      keyPoints: (props.npc.keyPoints && props.npc.keyPoints.length > 0) ? [...props.npc.keyPoints] : [],
      photo: props.npc.photo || '',
      notes: (props.npc as any).notes || '',
      lore: (props.npc as any).lore || '',
      politicalTies: (props.npc as any).politicalTies || ''
    }
  } else {
    form.value = {
      name: '',
      clan: '',
      generation: 10,
      status: 'Ativo',
      sect: '',
      threat: 'moderado',
      role: '',
      motivation: '',
      secret: '',
      mainPool: '',
      keyPoints: [],
      photo: '',
      notes: '',
      lore: '',
      politicalTies: ''
    }
  }
})

const handleSave = () => {
  if (!form.value.name || !form.value.clan) {
    toast.error('Campos obrigatórios', 'Preencha o nome e o clã do personagem.')
    return
  }

  emit('save', {
    name: form.value.name,
    clan: form.value.clan,
    generation: form.value.generation,
    status: form.value.status as any,
    sect: form.value.sect,
    role: form.value.role,
    motivation: form.value.motivation,
    secret: form.value.secret,
    mainPool: form.value.mainPool,
    keyPoints: form.value.keyPoints,
    photo: form.value.photo,
    updatedAt: new Date(),
    ...(form.value.notes && { notes: form.value.notes }),
    ...(form.value.lore && { lore: form.value.lore }),
    ...(form.value.politicalTies && { politicalTies: form.value.politicalTies }),
    threat: form.value.threat
  } as any)
}

const handleDropzoneError = (message: string) => {
  toast.error('Erro no upload', message)
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease;
}

.df-modal-card {
  background: linear-gradient(135deg, var(--df-bg-deep, #050510), var(--df-bg-card, #0a0a1a));
  border: 1px solid rgba(220, 38, 38, 0.4);
  border-radius: 1rem;
  position: relative;
  box-shadow: 0 0 60px rgba(220, 38, 38, 0.25), inset 0 1px 10px rgba(0, 0, 0, 0.8);
}

/* Cantos decorativos */
.df-card-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid var(--df-text-gold, #d4a647);
  pointer-events: none;
  z-index: 5;
}

.df-card-corner-tl {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 1rem;
}

.df-card-corner-tr {
  top: -1px;
  right: -1px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 1rem;
}

.df-card-corner-bl {
  bottom: -1px;
  left: -1px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 1rem;
}

.df-card-corner-br {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 1rem;
}

/* Header Premium */
.df-header-premium {
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(220, 38, 38, 0.2);
  background: linear-gradient(to bottom, rgba(220, 38, 38, 0.05), transparent);
  flex-shrink: 0;
}

.df-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(220, 38, 38, 0.15);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 0.5rem;
  color: var(--df-text-gold, #d4a647);
  box-shadow: 0 0 12px rgba(212, 168, 71, 0.2);
  flex-shrink: 0;
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
  color: var(--df-muted, #6b6b80);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.df-close-btn:hover {
  border-color: var(--df-red, #dc2626);
  background: rgba(220, 38, 38, 0.1);
  color: white;
}

/* Body */
.df-modal-body {
  padding: 1rem 1.5rem;
}

/* Footer */
.df-footer-premium {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(220, 38, 38, 0.2);
  background: linear-gradient(to top, rgba(220, 38, 38, 0.05), transparent);
  flex-shrink: 0;
}

/* Seções */
.df-section {
  padding: 1.5rem;
  background: rgba(18, 18, 26, 0.5);
  border: 1px solid rgba(74, 74, 90, 0.3);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.df-section:hover {
  border-color: rgba(220, 38, 38, 0.3);
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.1);
}

.df-section-title {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--df-text-gold, #d4a647);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.df-section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(to bottom, var(--df-text-gold, #d4a647), transparent);
  border-radius: 2px;
}

/* Seções Compactas */
.df-section-compact {
  padding: 1rem;
  background: rgba(18, 18, 26, 0.5);
  border: 1px solid rgba(74, 74, 90, 0.3);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.df-section-compact:hover {
  border-color: rgba(220, 38, 38, 0.3);
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.1);
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

/* Labels */
.df-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--df-text-gold, #d4a647);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

/* Inputs */
.df-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  background: var(--df-bg-input, #0d0d20);
  color: white;
  font-size: 0.8125rem;
  outline: none;
  transition: all 0.2s;
}

.df-input:focus {
  border-color: var(--df-red, #dc2626);
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.2);
}

.df-input::placeholder {
  color: var(--df-muted, #6b6b80);
  font-style: italic;
}

/* Pills */
.df-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  background: var(--df-bg-input, #0d0d20);
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
  font-size: 0.8125rem;
  font-weight: 500;
}

.df-pill:hover {
  border-color: var(--df-red, #dc2626);
  background: var(--df-bg-card, #0a0a1a);
  transform: translateY(-1px);
}

.df-pill-active {
  background: rgba(220, 38, 38, 0.15);
  border-color: var(--df-red, #dc2626);
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.2);
}

/* Botões */
.df-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #991b1b, #7f1d1d);
  color: #fecaca;
  border: 1px solid var(--df-red, #dc2626);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.3);
}

.df-btn-primary:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
  color: white;
  transform: translateY(-1px);
}

.df-btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: transparent;
  color: var(--df-muted, #6b6b80);
  border: 1px solid var(--df-border-silver, #4a4a5a);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.df-btn-ghost:hover {
  border-color: var(--df-red, #dc2626);
  color: white;
  background: rgba(220, 38, 38, 0.1);
}

/* Scrollbar */
.df-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.df-scrollbar::-webkit-scrollbar-track {
  background: var(--df-bg-deep, #050510);
  border-radius: 4px;
}

.df-scrollbar::-webkit-scrollbar-thumb {
  background: var(--df-border-red, #7f1d1d);
  border-radius: 4px;
}

.df-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #991b1b;
}
</style>
