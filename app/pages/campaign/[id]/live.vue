<template>
  <div class="min-h-screen" style="background:#080810; color:#c4c4d4;">

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- PRÉ-LOBBY — sessão não iniciada                       -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-if="!sessionActive" class="flex flex-col items-center justify-center min-h-screen px-4">
      <div class="w-full max-w-lg text-center space-y-8">

        <!-- Decoração -->
        <div class="flex items-center justify-center gap-4">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-red-900/60"/>
          <svg class="w-10 h-10 text-red-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/>
          </svg>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-red-900/60"/>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-red-800 mb-2">Vampiro: A Máscara V5</p>
          <h1 class="text-3xl font-bold text-white mb-1">{{ campaign?.name || 'Carregando...' }}</h1>
          <p class="text-sm text-[#6b6b7b]">Sala de Jogo — Visão do Mestre</p>
        </div>

        <!-- Card de status -->
        <div class="relative border border-[#7f1d1d] rounded-lg p-6 text-left"
             style="background:#0a0a1a; box-shadow: 0 0 0 1px #4a4a5a;">
          <span class="lc lc-tl"/><span class="lc lc-tr"/>
          <span class="lc lc-bl"/><span class="lc lc-br"/>

          <div class="relative z-10 space-y-4">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-[#4a4a5a] shrink-0"/>
              <p class="text-sm font-medium text-[#4a4a5a] uppercase tracking-wider">Sessão Inativa</p>
            </div>
            <p class="text-sm text-[#6b6b7b]">
              A sessão de Jogo ao Vivo ainda não foi iniciada.<br>
              Quando você iniciar, os jogadores poderão entrar na sala.
            </p>
            <p class="text-xs text-[#4a4a5a] pt-1">
              Inicie a sessão para liberar a entrada dos jogadores.
            </p>
          </div>
        </div>

        <!-- Botões de ação -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            class="flex items-center justify-center gap-2 px-8 py-3 rounded border border-red-700 text-white font-semibold tracking-wide hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style="background: rgba(127,29,29,0.2);"
            :disabled="startingSession"
            @click="handleStartSession"
          >
            <svg v-if="startingSession" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            {{ startingSession ? 'Iniciando...' : 'Iniciar Sessão Ao Vivo' }}
          </button>
          <button
            class="flex items-center gap-2 px-5 py-3 rounded border border-[#4a4a5a]/50 text-[#6b6b7b] text-sm hover:text-white hover:border-[#6b6b7b] transition-colors"
            @click="goBackToMaster"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            Voltar ao Dashboard
          </button>
        </div>

        <p v-if="sessionError" class="text-sm text-red-400">{{ sessionError }}</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- SESSÃO ATIVA — interface completa                      -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <template v-else>

      <!-- Header -->
      <div style="background:#0a0a1a; border-bottom:1px solid #2d1515;" class="px-6 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"/>
              <span class="text-red-400 font-semibold text-xs uppercase tracking-widest">Ao Vivo</span>
            </div>
            <h1 class="text-lg font-bold text-white">{{ campaign?.name }}</h1>
            <span class="text-xs text-[#4a4a5a] border border-[#4a4a5a]/40 px-2 py-0.5 rounded">
              {{ activePlayers.length }} jogador{{ activePlayers.length !== 1 ? 'es' : '' }} conectado{{ activePlayers.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-[#4a4a5a]/40 text-[#6b6b7b] hover:text-white hover:border-[#6b6b7b] transition-colors"
              @click="goBackToMaster"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </button>
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-red-900 text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
              :disabled="stoppingSession"
              @click="openStopSessionConfirmation"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
              {{ stoppingSession ? 'Encerrando...' : 'Encerrar Sessão' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Layout principal -->
      <div class="flex" style="height:calc(100vh - 65px);">

        <!-- ── Painel Esquerdo ── -->
        <div class="w-72 overflow-y-auto border-r border-[#2d1515] p-4 space-y-6 shrink-0" style="background:#0a0a1a;">

          <!-- NPCs -->
          <section>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-semibold uppercase tracking-wider text-[#d4a647]">NPCs</h3>
              <span class="text-xs text-[#4a4a5a]">{{ inGameNPCs.length }} em jogo</span>
            </div>

            <!-- NPCs em jogo -->
            <div v-if="inGameNPCs.length === 0 && !showNpcPicker" class="text-center py-4">
              <p class="text-xs text-[#4a4a5a]">Nenhum NPC incluído no jogo.</p>
            </div>

            <div v-if="inGameNPCs.length > 0" class="space-y-2 mb-2">
              <div
                v-for="npc in inGameNPCs"
                :key="npc.id"
                class="rounded border p-2.5 cursor-pointer transition-all"
                :class="selectedNPC?.id === npc.id
                  ? 'border-red-700 bg-red-950/30'
                  : 'border-[#2d1515] hover:border-red-900/60'"
                style="background:rgba(255,255,255,0.02)"
                @click="selectNPC(npc)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                         style="background:linear-gradient(135deg,#7f1d1d,#d4a647)">
                      {{ npc.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-white truncate">{{ npc.name }}</p>
                      <p class="text-xs text-[#4a4a5a] truncate">{{ npc.type }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-0.5 shrink-0">
                    <!-- Visibility toggle -->
                    <button
                      class="p-1 rounded transition-colors"
                      :class="npc.visibleToPlayers ? 'text-green-400 hover:text-green-300' : 'text-[#4a4a5a] hover:text-[#6b6b7b]'"
                      :title="npc.visibleToPlayers ? 'Visível para jogadores — clique para ocultar' : 'Oculto dos jogadores — clique para revelar'"
                      @click.stop="toggleNPCVisibility(npc)"
                    >
                      <svg v-if="npc.visibleToPlayers" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                    <!-- Remove from game -->
                    <button
                      class="p-1 rounded text-[#4a4a5a] hover:text-red-400 transition-colors"
                      title="Tirar do jogo"
                      @click.stop="removeNPCInline(npc)"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Adicionar NPC ao jogo -->
            <button
              class="w-full text-xs px-2 py-1.5 rounded border transition-colors flex items-center justify-center gap-1.5"
              :class="showNpcPicker
                ? 'border-red-800 text-red-400 hover:bg-red-950/20'
                : 'border-[#4a4a5a]/40 text-[#d4a647] hover:border-[#d4a647] hover:text-white'"
              @click="showNpcPicker = !showNpcPicker; npcSearch = ''"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line v-if="!showNpcPicker" x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {{ showNpcPicker ? 'Fechar' : 'Adicionar NPC ao Jogo' }}
            </button>

            <!-- Picker dropdown -->
            <div v-if="showNpcPicker" class="mt-2 space-y-1.5">
              <input
                v-model="npcSearch"
                type="text"
                placeholder="Buscar NPC..."
                class="w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white placeholder-[#4a4a5a] bg-[#0d0d20] focus:outline-none focus:border-[#d4a647]"
              />
              <div v-if="availableNPCs.length === 0" class="text-center py-3">
                <p class="text-xs text-[#4a4a5a]">{{ npcSearch ? 'Nenhum resultado.' : 'Todos os NPCs já estão no jogo.' }}</p>
              </div>
              <div
                v-for="npc in availableNPCs"
                :key="npc.id"
                class="flex items-center justify-between rounded border border-[#2d1515] px-2 py-1.5 hover:border-red-900/60 transition-colors"
                style="background:rgba(255,255,255,0.02)"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold"
                       style="background:linear-gradient(135deg,#4a4a5a,#6b6b7b)">
                    {{ npc.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-white truncate">{{ npc.name }}</p>
                    <p class="text-[11px] text-[#4a4a5a] truncate">{{ npc.type }}</p>
                  </div>
                </div>
                <button
                  class="shrink-0 p-1 rounded border border-[#4a4a5a]/40 text-[#d4a647] hover:border-[#d4a647] hover:bg-red-950/20 transition-colors"
                  title="Adicionar ao jogo"
                  @click="addNPCInline(npc)"
                >
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
          </section>

          <!-- Cena Atual -->
          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#d4a647] mb-3">Cena Atual</h3>
            <input
              v-model="currentSceneName"
              type="text"
              placeholder="Descreva a cena atual..."
              class="w-full rounded border border-[#4a4a5a]/50 px-3 py-2 text-sm text-white placeholder-[#4a4a5a] bg-[#0d0d20] focus:outline-none focus:border-[#d4a647] transition-colors"
              @blur="saveSceneName"
            />
          </section>

          <!-- Mídia da Cena (integração com aba Mídia) -->
          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#d4a647] mb-3">Mídia da Cena</h3>
            <div class="space-y-2 rounded border border-[#2d1515] p-3" style="background:rgba(255,255,255,0.02)">
              <div>
                <label class="text-[11px] text-[#6b6b7b] uppercase tracking-wider">Imagem</label>
                <select
                  v-model="selectedSceneImage"
                  class="mt-1 w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white bg-[#0d0d20] focus:outline-none"
                >
                  <option value="">Nenhuma imagem selecionada</option>
                  <option v-if="campaign?.current_image_url" :value="campaign.current_image_url">Imagem atual da campanha</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] text-[#6b6b7b] uppercase tracking-wider">Música</label>
                <select
                  v-model="selectedSceneMusic"
                  class="mt-1 w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white bg-[#0d0d20] focus:outline-none"
                >
                  <option value="">Nenhuma música selecionada</option>
                  <option v-if="campaign?.current_music_url" :value="campaign.current_music_url">Música atual da campanha</option>
                </select>
              </div>
              <button
                class="w-full text-xs px-2 py-1.5 rounded border border-[#4a4a5a]/40 text-[#d4a647] hover:border-[#d4a647] hover:text-white transition-colors"
                @click="goToMediaTab"
              >
                Gerenciar na Aba Mídia
              </button>
              <p class="text-[11px] text-[#4a4a5a]">Esses campos usarão os arquivos enviados na aba Mídia.</p>
            </div>
          </section>

          <!-- Criar Evento Narrativo -->
          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#d4a647] mb-3">Criar Evento Narrativo</h3>
            <div class="space-y-2 rounded border border-[#2d1515] p-3" style="background:rgba(255,255,255,0.02)">
              <input
                v-model="eventDraft.title"
                type="text"
                placeholder="Título do acontecimento"
                class="w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white placeholder-[#4a4a5a] bg-[#0d0d20] focus:outline-none"
              >
              <textarea
                v-model="eventDraft.description"
                rows="2"
                placeholder="Descrição (opcional)"
                class="w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white placeholder-[#4a4a5a] bg-[#0d0d20] focus:outline-none resize-none"
              />
              <select
                v-model="eventDraft.type"
                class="w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white bg-[#0d0d20] focus:outline-none"
              >
                <option value="narrative">Narrativo</option>
                <option value="social">Social</option>
                <option value="combat">Combate</option>
                <option value="discovery">Descoberta</option>
                <option value="political">Político</option>
                <option value="other">Outro</option>
              </select>
              <button
                class="w-full text-xs px-2 py-1.5 rounded border border-red-800 text-red-300 hover:text-white hover:bg-red-900/20 transition-colors"
                :disabled="creatingEvent"
                @click="openEventConfirmation"
              >
                {{ creatingEvent ? 'Salvando...' : 'Registrar Evento' }}
              </button>
            </div>
          </section>

          <!-- Eventos da Sessão -->
          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#d4a647] mb-3">Eventos da Sessão</h3>
            <div v-if="sessionTimeline.length === 0" class="text-center py-4">
              <p class="text-xs text-[#4a4a5a]">Nenhum evento ainda.</p>
            </div>
            <div v-else class="space-y-1.5 max-h-48 overflow-y-auto">
              <div
                v-for="ev in sessionTimeline"
                :key="ev.id"
                class="rounded border border-[#2d1515] p-2" style="background:rgba(255,255,255,0.02)"
              >
                <p class="text-xs font-medium text-white">{{ ev.title }}</p>
                <p class="text-xs text-[#4a4a5a]">{{ formatTime(new Date(ev.timestamp)) }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- ── Área Central ── -->
        <div class="flex-1 relative overflow-hidden flex flex-col items-center justify-center gap-6 text-center px-8" style="background:#060610">
          <div v-if="spotlightNPC" class="w-full max-w-xl rounded-xl border border-[#7f1d1d] p-4" style="background:rgba(10,10,26,0.85)">
            <div class="flex flex-col items-center gap-3">
              <img
                v-if="spotlightNPC.photo"
                :src="spotlightNPC.photo"
                :alt="spotlightNPC.name"
                class="w-full max-h-[340px] object-contain rounded-lg border border-[#4a4a5a]"
              >
              <div v-else class="w-full h-52 rounded-lg border border-[#4a4a5a] flex items-center justify-center text-[#6b6b7b]">
                Sem retrato disponível
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">{{ spotlightNPC.name }}</h3>
                <p class="text-xs text-[#6b6b7b]">Exibindo para os jogadores conectados</p>
              </div>
            </div>
          </div>

          <svg class="w-20 h-20 text-red-900/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          <div>
            <h2 class="text-xl font-bold text-white mb-2">{{ currentSceneName || 'Sem cena definida' }}</h2>
            <p class="text-sm text-[#4a4a5a] max-w-sm">
              Descreva a cena no painel lateral e gerencie quais NPCs estão visíveis para os jogadores.
            </p>
          </div>

          <!-- NPCs visíveis (barra inferior) -->
          <div
            v-if="visibleNPCs.length > 0"
            class="absolute bottom-0 left-0 right-0 border-t border-[#2d1515] px-4 py-3"
            style="background:rgba(10,10,26,0.95)"
          >
            <p class="text-xs text-[#4a4a5a] uppercase tracking-wider mb-2">Visíveis aos Jogadores</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="npc in visibleNPCs"
                :key="npc.id"
                class="flex items-center gap-2 rounded border border-green-900/40 px-3 py-1.5 text-xs"
                style="background:rgba(21,128,61,0.08)"
              >
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style="background:linear-gradient(135deg,#7f1d1d,#d4a647)">
                  {{ npc.name.charAt(0) }}
                </span>
                <span class="text-green-400 font-medium">{{ npc.name }}</span>
                <span class="text-[#4a4a5a]">{{ npc.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Overlay detalhe de NPC ── -->
        <div
          v-if="selectedNPC"
          class="absolute top-[65px] right-4 w-64 rounded border border-[#4a4a5a] p-4 z-20"
          style="background:#0d0d20; box-shadow:0 4px 24px rgba(0,0,0,0.6)"
        >
          <div class="flex items-start justify-between mb-3">
            <h4 class="font-semibold text-white">{{ selectedNPC.name }}</h4>
            <button class="text-[#4a4a5a] hover:text-white" @click="selectedNPC = null; setNpcSpotlight(null)">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="space-y-1.5 text-sm">
            <p><span class="text-[#4a4a5a]">Tipo: </span><span class="text-white">{{ selectedNPC.type }}</span></p>
            <p v-if="selectedNPC.clan"><span class="text-[#4a4a5a]">Clã: </span><span class="text-white">{{ selectedNPC.clan }}</span></p>
            <p v-if="selectedNPC.description" class="text-[#6b6b7b] text-xs mt-2 leading-relaxed">{{ selectedNPC.description }}</p>
          </div>
        </div>

      </div><!-- /flex layout -->
    </template>

    <!-- Confirmação de evento narrativo -->
    <div
      v-if="showEventConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.65)"
      @click.self="showEventConfirmModal = false"
    >
      <div class="w-full max-w-md rounded-lg border border-[#7f1d1d] p-5" style="background:#0a0a1a; box-shadow:0 6px 30px rgba(0,0,0,0.6)">
        <h3 class="text-sm uppercase tracking-wider text-[#d4a647] mb-3">Confirmar Evento</h3>
        <p class="text-xs text-[#6b6b7b] mb-1">Título</p>
        <p class="text-sm text-white mb-3">{{ eventDraft.title || 'Sem título' }}</p>
        <p class="text-xs text-[#6b6b7b] mb-1">Tipo</p>
        <p class="text-sm text-white mb-3">{{ eventDraft.type }}</p>
        <p v-if="eventDraft.description" class="text-xs text-[#c4c4d4] mb-4">{{ eventDraft.description }}</p>

        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-1.5 text-xs rounded border border-[#4a4a5a]/50 text-[#6b6b7b] hover:text-white"
            @click="showEventConfirmModal = false"
          >
            Cancelar
          </button>
          <button
            class="px-3 py-1.5 text-xs rounded border border-red-800 text-red-300 hover:text-white hover:bg-red-900/20"
            :disabled="creatingEvent"
            @click="confirmAndCreateEvent"
          >
            Confirmar Evento
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmação de encerramento da sessão -->
    <div
      v-if="showStopSessionConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.65)"
      @click.self="showStopSessionConfirmModal = false"
    >
      <div class="w-full max-w-md rounded-lg border border-[#7f1d1d] p-5" style="background:#0a0a1a; box-shadow:0 6px 30px rgba(0,0,0,0.6)">
        <h3 class="text-sm uppercase tracking-wider text-[#d4a647] mb-3">Encerrar Sessão Ao Vivo</h3>
        <p class="text-sm text-[#c4c4d4] mb-4">Deseja realmente encerrar a sessão? Os jogadores serão desconectados da sala.</p>

        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-1.5 text-xs rounded border border-[#4a4a5a]/50 text-[#6b6b7b] hover:text-white"
            @click="showStopSessionConfirmModal = false"
          >
            Cancelar
          </button>
          <button
            class="px-3 py-1.5 text-xs rounded border border-red-800 text-red-300 hover:text-white hover:bg-red-900/20 disabled:opacity-50"
            :disabled="stoppingSession"
            @click="handleStopSession"
          >
            {{ stoppingSession ? 'Encerrando...' : 'Confirmar Encerramento' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// ============================================
// Vue + Nuxt imports
// ============================================
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, definePageMeta, useRuntimeConfig } from '#imports'

// ============================================
// Middleware: only master can access live
// ============================================
definePageMeta({
  middleware: 'is-master',
  layout: false
})

// ============================================
// Composable imports
// ============================================
import { useCampaign } from '~/composables/useCampaign'
import { useAuth } from '~/composables/useAuth'
import { useLiveGame } from '~/composables/useLiveGame'
import { useToast } from '~/composables/useToast'
import { createClient } from '@supabase/supabase-js'

// ============================================
// Route
// ============================================
const route  = useRoute()
const router = useRouter()
const campaignId = route.params.id as string

// ============================================
// Supabase (for NPC queries + realtime)
// ============================================
const config  = useRuntimeConfig()
const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey)

// ============================================
// Composables
// ============================================
const { getCampaignById }  = useCampaign()
const { user }             = useAuth()
const toast                = useToast()
const {
  isGameLive,
  currentNpcs,
  timelineEvents,
  activePlayers,
  startLiveGame,
  stopLiveGame,
  fetchLiveGameState,
  updateCurrentScene,
  subscribeToLiveGame,
  addNPCToGame,
  removeNPCFromGame,
} = useLiveGame()

// ============================================
// Local state
// ============================================
const campaign         = ref<any>(null)
const allNPCs          = ref<any[]>([])
const playerCount      = ref(0)
const selectedNPC      = ref<any>(null)
const currentSceneName = ref('')
const selectedSceneImage = ref('')
const selectedSceneMusic = ref('')
const showNpcPicker    = ref(false)
const npcSearch        = ref('')

const eventDraft = ref({
  title: '',
  description: '',
  type: 'narrative',
})
const showEventConfirmModal = ref(false)
const showStopSessionConfirmModal = ref(false)
const creatingEvent = ref(false)

// Session control
const sessionActive   = computed(() => isGameLive.value)
const startingSession = ref(false)
const stoppingSession = ref(false)
const sessionError    = ref<string | null>(null)

// Timeline from live_game_state (current session events JSONB)
const sessionTimeline = ref<any[]>([])

// Realtime subscription handle
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

// ============================================
// Computed
// ============================================
const inGameNPCs = computed(() => allNPCs.value.filter(n => n.inGame))
const visibleNPCs = computed(() => inGameNPCs.value.filter(n => n.visibleToPlayers))
const spotlightNPC = computed(() => inGameNPCs.value.find((n: any) => n.isSpotlight) ?? null)
const availableNPCs = computed(() => {
  const q = npcSearch.value.toLowerCase()
  return allNPCs.value
    .filter(n => !n.inGame)
    .filter(n => !q || n.name.toLowerCase().includes(q))
})

const normalizeTimeline = (events: any[]) => {
  const seen = new Set<string>()
  return (events || []).filter((event: any) => {
    const key = `${event?.id ?? ''}|${event?.title ?? ''}|${event?.timestamp ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const isTechnicalTimelineEvent = (event: any) => {
  const type = String(event?.type ?? '').toLowerCase()
  const title = String(event?.title ?? '').toLowerCase()
  return (
    type === 'scene-change' ||
    type === 'npc-appears' ||
    title.startsWith('cena alterada para:') ||
    title.includes(' entrou na cena') ||
    title.includes(' saiu da cena')
  )
}

const sanitizeTimeline = (events: any[]) => {
  return normalizeTimeline(events).filter((event: any) => !isTechnicalTimelineEvent(event))
}

const applyLiveNpcState = (liveNpcs: any[] = []) => {
  const inGameNpcIds = new Set((liveNpcs || []).map((npc: any) => npc.id))
  const visibleNpcIds = new Set((liveNpcs || []).filter((npc: any) => npc.isVisible).map((npc: any) => npc.id))
  const spotlightNpcIds = new Set((liveNpcs || []).filter((npc: any) => npc.isSpotlight).map((npc: any) => npc.id))

  allNPCs.value = allNPCs.value.map((npc: any) => ({
    ...npc,
    inGame: inGameNpcIds.has(npc.id),
    visibleToPlayers: visibleNpcIds.has(npc.id),
    isSpotlight: spotlightNpcIds.has(npc.id),
  }))
}

// ============================================
// Load data
// ============================================
const loadCampaignData = async () => {
  try {
    const data = await getCampaignById(campaignId)
    if (data) {
      campaign.value = data
      playerCount.value = data.campaign_players?.length ?? 0
    }
  } catch (e) {
    console.error('LIVE: Erro ao carregar campanha:', e)
  }
}

const loadNPCs = async () => {
  try {
    const { data: npcRows, error: npcErr } = await supabase
      .from('npcs')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('name')

    if (npcErr) throw npcErr

    // Merge with visibility status from live_game_state.current_npcs
    const { data: liveState } = await supabase
      .from('live_game_state')
      .select('current_npcs')
      .eq('campaign_id', campaignId)
      .maybeSingle()

    const liveNpcIds: string[] = (liveState?.current_npcs ?? []).map((n: any) => n.id)
    const liveVisibleIds: string[] = (liveState?.current_npcs ?? [])
      .filter((n: any) => n.isVisible)
      .map((n: any) => n.id)
    const liveSpotlightIds: string[] = (liveState?.current_npcs ?? [])
      .filter((n: any) => n.isSpotlight)
      .map((n: any) => n.id)

    allNPCs.value = (npcRows ?? []).map((npc: any) => ({
      ...npc,
      photo: npc.photo_url ?? null,
      description: npc.bio ?? null,
      inGame: liveNpcIds.includes(npc.id),
      visibleToPlayers: liveVisibleIds.includes(npc.id),
      isSpotlight: liveSpotlightIds.includes(npc.id),
    }))
  } catch (e) {
    console.error('LIVE: Erro ao carregar NPCs:', e)
  }
}

// ============================================
// Session control
// ============================================
const handleStartSession = async () => {
  startingSession.value = true
  sessionError.value = null
  try {
    await startLiveGame(campaignId)
    const { data } = await supabase
      .from('live_game_state')
      .select('current_scene, timeline_events, current_npcs')
      .eq('campaign_id', campaignId)
      .maybeSingle()

    await loadNPCs()

    if (data) {
      currentSceneName.value = (data as any).current_scene ?? ''
      sessionTimeline.value  = sanitizeTimeline((data as any).timeline_events ?? [])
      applyLiveNpcState((data as any).current_npcs ?? [])
    }
  } catch (e: any) {
    sessionError.value = e.message ?? 'Erro ao iniciar sessão'
  } finally {
    startingSession.value = false
  }
}

const openStopSessionConfirmation = () => {
  showStopSessionConfirmModal.value = true
}

const handleStopSession = async () => {
  showStopSessionConfirmModal.value = false
  stoppingSession.value = true
  try {
    await stopLiveGame(campaignId)
    toast.success('Sessão encerrada', 'O jogo ao vivo foi finalizado e voltou ao estado padrão.')
    await router.push(`/campaign/${campaignId}/master`)
  } catch (e: any) {
    console.error('LIVE: Erro ao encerrar sessão:', e)
    toast.error('Erro ao encerrar sessão', e?.message ?? 'Tente novamente em instantes.')
  } finally {
    stoppingSession.value = false
  }
}

// ============================================
// NPC controls
// ============================================
const addNPCInline = async (npc: any) => {
  try {
    await addNPCToGame(campaignId, npc, true)
    // applyLiveNpcState will be triggered by watch(currentNpcs)
  } catch (e: any) {
    console.error('LIVE: Erro ao adicionar NPC:', e)
    toast.error('Erro ao adicionar NPC', e?.message ?? 'Tente novamente.')
  }
}

const removeNPCInline = async (npc: any) => {
  try {
    if (selectedNPC.value?.id === npc.id) selectedNPC.value = null
    await removeNPCFromGame(npc.id, campaignId)
  } catch (e: any) {
    console.error('LIVE: Erro ao remover NPC:', e)
    toast.error('Erro ao remover NPC', e?.message ?? 'Tente novamente.')
  }
}

const selectNPC = (npc: any) => {
  const isClosing = selectedNPC.value?.id === npc.id
  selectedNPC.value = isClosing ? null : npc
  setNpcSpotlight(isClosing ? null : npc.id)
}

const fetchLiveNpcsFromDb = async () => {
  const { data, error } = await supabase
    .from('live_game_state')
    .select('current_npcs')
    .eq('campaign_id', campaignId)
    .maybeSingle()

  if (error) {
    console.error('LIVE: Erro ao buscar current_npcs:', error)
    return []
  }

  return (data?.current_npcs ?? []) as any[]
}

const toggleNPCVisibility = async (npc: any) => {
  const current = await fetchLiveNpcsFromDb()
  const updated = current.map((currentNpc: any) => {
    if (currentNpc.id !== npc.id) return currentNpc
    return { ...currentNpc, isVisible: !currentNpc.isVisible }
  })

  const { error } = await supabase
    .from('live_game_state')
    .update({ current_npcs: updated })
    .eq('campaign_id', campaignId)

  if (error) {
    console.error('LIVE: Erro ao atualizar visibilidade de NPC:', error)
    return
  }

  applyLiveNpcState(updated)
}

const setNpcSpotlight = async (npcId: string | null) => {
  const current = await fetchLiveNpcsFromDb()
  if (!current.length) return

  if (npcId && !current.some((currentNpc: any) => currentNpc.id === npcId)) {
    return
  }

  const updated = current.map((currentNpc: any) => ({
    ...currentNpc,
    isSpotlight: npcId ? currentNpc.id === npcId : false,
  }))

  const { error } = await supabase
    .from('live_game_state')
    .update({ current_npcs: updated })
    .eq('campaign_id', campaignId)

  if (error) {
    console.error('LIVE: Erro ao destacar NPC na cena:', error)
    return
  }

  applyLiveNpcState(updated)
}

// ============================================
// Scene name
// ============================================
const saveSceneName = async () => {
  if (!isGameLive.value) return
  try {
    await updateCurrentScene(currentSceneName.value)
  } catch (e) {
    console.error('LIVE: Erro ao salvar cena:', e)
  }
}

// ============================================
// Helpers
// ============================================
const formatTime = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(d)

const goBackToMaster = () => router.push(`/campaign/${campaignId}/master`)
const goToNPCTab = () => router.push(`/campaign/${campaignId}/master#npcs`)
const goToMediaTab = () => router.push(`/campaign/${campaignId}/master#media`)

const purgeSessionTechnicalEvents = async (timeline: any[]) => {
  const cleanedTimeline = sanitizeTimeline(timeline)
  const changed = cleanedTimeline.length !== (timeline || []).length
  if (!changed) return cleanedTimeline

  const { error } = await supabase
    .from('live_game_state')
    .update({ timeline_events: cleanedTimeline })
    .eq('campaign_id', campaignId)

  if (error) {
    console.error('LIVE: Erro ao limpar eventos técnicos da sessão:', error)
  }

  return cleanedTimeline
}

const openEventConfirmation = () => {
  if (!eventDraft.value.title.trim()) {
    alert('Informe um título para o evento antes de confirmar.')
    return
  }
  showEventConfirmModal.value = true
}

const confirmAndCreateEvent = async () => {
  if (!user.value?.id) {
    alert('Usuário não autenticado para registrar evento.')
    return
  }

  creatingEvent.value = true
  try {
    const payload = {
      campaign_id: campaignId,
      title: eventDraft.value.title.trim(),
      description: eventDraft.value.description.trim() || null,
      type: eventDraft.value.type,
      created_by: user.value.id,
      npc_ids: [],
      player_names: [],
      metadata: { source: 'live-manual' },
    }

    const { error: insertError } = await supabase
      .from('campaign_events')
      .insert(payload)

    if (insertError) throw insertError

    const current = await fetchLiveNpcsFromDb()
    const { data: liveData } = await supabase
      .from('live_game_state')
      .select('timeline_events')
      .eq('campaign_id', campaignId)
      .maybeSingle()

    const newTimelineEvent = {
      id: `story-${Date.now()}`,
      type: eventDraft.value.type,
      title: eventDraft.value.title.trim(),
      description: eventDraft.value.description.trim() || undefined,
      timestamp: new Date().toISOString(),
      isVisible: true,
      source: 'narrative',
    }

    const updatedTimeline = sanitizeTimeline([...(liveData?.timeline_events ?? []), newTimelineEvent])

    await supabase
      .from('live_game_state')
      .update({
        current_npcs: current,
        timeline_events: updatedTimeline,
      })
      .eq('campaign_id', campaignId)

    sessionTimeline.value = updatedTimeline
    showEventConfirmModal.value = false
    eventDraft.value = { title: '', description: '', type: 'narrative' }
  } catch (e) {
    console.error('LIVE: Erro ao criar evento narrativo:', e)
    alert('Não foi possível registrar o evento. Verifique se a migration de campaign_events já foi aplicada no banco.')
  } finally {
    creatingEvent.value = false
  }
}

// ============================================
// Realtime subscription — sync session state
// ============================================
const startRealtime = () => {
  realtimeChannel = subscribeToLiveGame(campaignId)
}

// ============================================
// Lifecycle
// ============================================

// Stop live session when master navigates away (handles logout + manual navigation)
const handleBeforeUnload = () => {
  if (isGameLive.value) {
    // Best-effort stop on tab close/refresh
    stopLiveGame(campaignId)
  }
}

onMounted(async () => {
  await Promise.all([loadCampaignData(), loadNPCs()])

  // Restore state if master refreshed mid-session
  const state = await fetchLiveGameState(campaignId)
  if (state) {
    currentSceneName.value = (state as any).current_scene ?? ''
    sessionTimeline.value  = await purgeSessionTechnicalEvents((state as any).timeline_events ?? [])
    applyLiveNpcState((state as any).current_npcs ?? [])
  }

  startRealtime()
  if (process.client) window.addEventListener('beforeunload', handleBeforeUnload)
})

watch(currentNpcs, (newCurrentNpcs) => {
  applyLiveNpcState(newCurrentNpcs as any[])
}, { deep: true })

watch(inGameNPCs, (newInGameNpcs) => {
  if (selectedNPC.value && !newInGameNpcs.some((npc: any) => npc.id === selectedNPC.value.id)) {
    selectedNPC.value = null
  }
}, { deep: true })

watch(timelineEvents, (newEvents) => {
  sessionTimeline.value = sanitizeTimeline(newEvents as any[])
}, { deep: true })

watch(sessionActive, async (isActive) => {
  if (!isActive) return

  await loadNPCs()
  const state = await fetchLiveGameState(campaignId)
  if (state) {
    applyLiveNpcState((state as any).current_npcs ?? [])
  }
})

onBeforeUnmount(async () => {
  if (process.client) window.removeEventListener('beforeunload', handleBeforeUnload)
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
/* ── Corner decorations ── */
.lc {
  position: absolute;
  width: 12px;
  height: 12px;
  pointer-events: none;
  z-index: 2;
}
.lc::before, .lc::after {
  content: '';
  position: absolute;
  background: #dc2626;
}
.lc::before { width: 12px; height: 1px; }
.lc::after  { width: 1px; height: 12px; }
.lc-tl { top: -1px; left: -1px; }
.lc-tr { top: -1px; right: -1px; }
.lc-tr::before { right: 0; }
.lc-tr::after  { right: 0; }
.lc-bl { bottom: -1px; left: -1px; }
.lc-bl::before { bottom: 0; }
.lc-bl::after  { bottom: 0; }
.lc-br { bottom: -1px; right: -1px; }
.lc-br::before { right: 0; bottom: 0; }
.lc-br::after  { right: 0; bottom: 0; }

/* ── Animations ── */
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes spin  { to{transform:rotate(360deg)} }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
.animate-spin  { animation: spin 1s linear infinite; }
</style>