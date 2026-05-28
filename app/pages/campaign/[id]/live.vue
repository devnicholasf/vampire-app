<template>
  <div class="min-h-screen" style="background:#080810; color:#c4c4d4;">

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- CARREGANDO — evita flash do pré-lobby                  -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-if="pageLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="df-spinner"></div>
        <p class="df-text-muted mt-4">Carregando sessão...</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- PRÉ-LOBBY — sessão não iniciada                       -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div v-else-if="!sessionActive" class="flex flex-col items-center justify-center min-h-screen px-4">
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
            :disabled="startingSession"
            style="display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 28px;border-radius:6px;border:1px solid #b91c1c;background:linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%);color:#fff;font-size:0.8rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 12px rgba(127,29,29,0.5);"
            @mouseover="($event.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#dc2626 0%,#991b1b 100%)'"
            @mouseout="($event.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%)'"
            @click="handleStartSession"
          >
            <svg v-if="startingSession" style="width:16px;height:16px;animation:spin 1s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            <svg v-else style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            {{ startingSession ? 'Iniciando...' : 'Iniciar Sessão Ao Vivo' }}
          </button>
          <button
            style="display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 28px;border-radius:6px;border:1px solid #4a4a5a;background:transparent;color:#9b9bbb;font-size:0.8rem;font-weight:600;letter-spacing:0.05em;cursor:pointer;transition:all 0.2s;"
            @mouseover="e => { const el = e.currentTarget as HTMLElement; el.style.color='#fff'; el.style.borderColor='#9b9bbb'; el.style.background='rgba(255,255,255,0.05)'; }"
            @mouseout="e => { const el = e.currentTarget as HTMLElement; el.style.color='#9b9bbb'; el.style.borderColor='#4a4a5a'; el.style.background='transparent'; }"
            @click="goBackToMaster"
          >
            <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
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
        <div class="grid grid-cols-3 items-center gap-4">
          <!-- Coluna esquerda: status + nome da crônica -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"/>
              <span class="text-red-400 font-semibold text-xs uppercase tracking-widest">Ao Vivo</span>
            </div>
            <h1 class="text-lg font-bold text-white">{{ campaign?.name }}</h1>
          </div>

          <!-- Coluna central: Coterie (avatares dos jogadores) -->
          <div class="flex justify-center">
            <CoterieAvatars
              :players="coteriePlayers"
              :active-players="(activePlayers as string[])"
              mode="horizontal"
            />
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:5px;border:1px solid #4a4a5a;background:transparent;color:#9b9bbb;font-size:0.75rem;font-weight:600;cursor:pointer;transition:all 0.2s;"
              @mouseover="e => { const el = e.currentTarget as HTMLElement; el.style.color='#fff'; el.style.borderColor='#9b9bbb'; }"
              @mouseout="e => { const el = e.currentTarget as HTMLElement; el.style.color='#9b9bbb'; el.style.borderColor='#4a4a5a'; }"
              @click="goBackToMaster"
            >
              <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </button>
            <button
              :disabled="stoppingSession"
              style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:5px;border:1px solid #b91c1c;background:linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%);color:#fff;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(127,29,29,0.4);"
              @mouseover="e => { if (!stoppingSession) (e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#dc2626 0%,#991b1b 100%)'; }"
              @mouseout="e => { (e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%)'; }"
              @click="openStopSessionConfirmation"
            >
              <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
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
              maxlength="85"
              placeholder="Descreva a cena atual..."
              class="w-full rounded border border-[#4a4a5a]/50 px-3 py-2 text-sm text-white placeholder-[#4a4a5a] bg-[#0d0d20] focus:outline-none focus:border-[#d4a647] transition-colors"
              @blur="saveSceneName"
            />
          </section>

          <!-- Mídia da Cena -->
          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#d4a647] mb-5">Mídia da Cena</h3>

            <!-- ── Imagens ── -->
            <div class="mb-3">
              <p class="text-[11px] uppercase tracking-wider mb-1.5" style="color:#ffffff">Imagens</p>

              <div v-if="inSceneImages.length === 0 && !showImagePicker" class="text-center py-1.5 mb-1">
                <p class="text-xs text-[#4a4a5a]">Nenhuma imagem na cena.</p>
              </div>

              <div v-if="inSceneImages.length > 0" class="space-y-1.5 mb-2">
                <div
                  v-for="item in inSceneImages"
                  :key="item.url"
                  class="rounded border p-2 flex items-center justify-between gap-1.5 transition-all"
                  :style="`border-color:${item.visibleToPlayers ? 'rgba(22,101,52,0.6)' : '#2d1515'};background:${item.visibleToPlayers ? 'rgba(0,50,0,0.18)' : 'rgba(255,255,255,0.02)'};`"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded shrink-0 overflow-hidden" style="background:#0d0d20">
                      <img :src="item.url" :alt="item.name" class="w-full h-full object-cover">
                    </div>
                    <p class="text-xs font-medium truncate" style="color:#ffffff">{{ item.name }}</p>
                  </div>
                  <div class="flex items-center gap-0.5 shrink-0">
                    <button
                      class="p-1 rounded transition-colors"
                      :class="item.visibleToPlayers ? 'text-green-400 hover:text-green-300' : 'text-[#4a4a5a] hover:text-[#6b6b7b]'"
                      :title="item.visibleToPlayers ? 'Visível aos jogadores — clique para ocultar' : 'Oculto — clique para mostrar'"
                      @click="toggleMediaVisibility(item)"
                    >
                      <svg v-if="item.visibleToPlayers" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                    <button
                      class="p-1 rounded text-[#4a4a5a] hover:text-red-400 transition-colors"
                      title="Remover da cena"
                      @click="removeMediaFromScene(item)"
                    >
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <button
                class="w-full text-xs px-2 py-1.5 rounded border transition-colors flex items-center justify-center gap-1.5"
                :class="showImagePicker ? 'border-red-800 text-red-400 hover:bg-red-950/20' : 'border-[#4a4a5a]/40 text-[#d4a647] hover:border-[#d4a647] hover:text-white'"
                @click="showImagePicker = !showImagePicker; showAudioPicker = false; mediaPickerSearch = ''"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line v-if="!showImagePicker" x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {{ showImagePicker ? 'Fechar' : 'Adicionar Imagem' }}
              </button>

              <div v-if="showImagePicker" class="mt-2 space-y-1.5">
                <input
                  v-model="mediaPickerSearch"
                  type="text"
                  placeholder="Buscar imagem..."
                  class="w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white placeholder-[#4a4a5a] bg-[#0d0d20] focus:outline-none focus:border-[#d4a647]"
                />
                <div v-if="availableImagesPicker.length === 0" class="text-center py-3">
                  <p class="text-xs text-[#4a4a5a]">{{ loadingMedia ? 'Carregando...' : 'Nenhuma imagem disponível.' }}</p>
                </div>
                <div
                  v-for="img in availableImagesPicker"
                  :key="img.url"
                  class="flex items-center justify-between rounded border border-[#2d1515] px-2 py-1.5 hover:border-red-900/60 transition-colors"
                  style="background:rgba(255,255,255,0.02)"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-7 h-7 rounded shrink-0 overflow-hidden" style="background:#0d0d20">
                      <img :src="img.url" :alt="img.name" class="w-full h-full object-cover">
                    </div>
                    <p class="text-xs font-medium truncate" style="color:#ffffff">{{ img.name }}</p>
                  </div>
                  <button
                    class="shrink-0 p-1 rounded border border-[#4a4a5a]/40 text-[#d4a647] hover:border-[#d4a647] hover:bg-red-950/20 transition-colors"
                    title="Adicionar à cena"
                    @click="addMediaToScene(img, 'image')"
                  >
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- ── Áudio ── -->
            <div class="mb-3">
              <p class="text-[11px] uppercase tracking-wider mb-1.5" style="color:#ffffff">Áudio</p>

              <div v-if="inSceneAudios.length === 0 && !showAudioPicker" class="text-center py-1.5 mb-1">
                <p class="text-xs text-[#4a4a5a]">Nenhuma música na cena.</p>
              </div>

              <div v-if="inSceneAudios.length > 0" class="space-y-1.5 mb-2">
                <div
                  v-for="item in inSceneAudios"
                  :key="item.url"
                  class="rounded border p-2 flex items-center justify-between gap-1.5 transition-all"
                  :style="`border-color:${item.visibleToPlayers ? 'rgba(22,101,52,0.6)' : '#2d1515'};background:${item.visibleToPlayers ? 'rgba(0,50,0,0.18)' : 'rgba(255,255,255,0.02)'};`"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center" style="background:linear-gradient(135deg,#4a4a5a,#6b6b7b)">
                      <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                    <p class="text-xs font-medium truncate" style="color:#ffffff">{{ item.name }}</p>
                  </div>
                  <div class="flex items-center gap-0.5 shrink-0">
                    <button
                      class="p-1 rounded transition-colors"
                      :class="item.visibleToPlayers ? 'text-green-400 hover:text-green-300' : 'text-[#4a4a5a] hover:text-[#6b6b7b]'"
                      :title="item.visibleToPlayers ? 'Tocando para jogadores — clique para parar' : 'Parado — clique para tocar'"
                      @click="toggleMediaVisibility(item)"
                    >
                      <svg v-if="item.visibleToPlayers" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    </button>
                    <button
                      class="p-1 rounded text-[#4a4a5a] hover:text-red-400 transition-colors"
                      title="Remover da cena"
                      @click="removeMediaFromScene(item)"
                    >
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <button
                class="w-full text-xs px-2 py-1.5 rounded border transition-colors flex items-center justify-center gap-1.5"
                :class="showAudioPicker ? 'border-red-800 text-red-400 hover:bg-red-950/20' : 'border-[#4a4a5a]/40 text-[#d4a647] hover:border-[#d4a647] hover:text-white'"
                @click="showAudioPicker = !showAudioPicker; showImagePicker = false; mediaPickerSearch = ''"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line v-if="!showAudioPicker" x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                {{ showAudioPicker ? 'Fechar' : 'Adicionar Áudio' }}
              </button>

              <div v-if="showAudioPicker" class="mt-2 space-y-1.5">
                <input
                  v-model="mediaPickerSearch"
                  type="text"
                  placeholder="Buscar áudio..."
                  class="w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white placeholder-[#4a4a5a] bg-[#0d0d20] focus:outline-none focus:border-[#d4a647]"
                />
                <div v-if="availableAudiosPicker.length === 0" class="text-center py-3">
                  <p class="text-xs text-[#4a4a5a]">{{ loadingMedia ? 'Carregando...' : 'Nenhum áudio disponível.' }}</p>
                </div>
                <div
                  v-for="aud in availableAudiosPicker"
                  :key="aud.url"
                  class="flex items-center justify-between rounded border border-[#2d1515] px-2 py-1.5 hover:border-red-900/60 transition-colors"
                  style="background:rgba(255,255,255,0.02)"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" style="background:linear-gradient(135deg,#4a4a5a,#6b6b7b)">
                      <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                    <p class="text-xs font-medium truncate" style="color:#ffffff">{{ aud.name }}</p>
                  </div>
                  <button
                    class="shrink-0 p-1 rounded border border-[#4a4a5a]/40 text-[#d4a647] hover:border-[#d4a647] hover:bg-red-950/20 transition-colors"
                    title="Adicionar à cena"
                    @click="addMediaToScene(aud, 'audio')"
                  >
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>
            </div>

          </section>

          <!-- Mapa de Territórios -->
          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#d4a647] mb-3">Mapa de Territórios</h3>
            
            <div class="rounded border border-[#2d1515] p-3 space-y-2" style="background:rgba(255,255,255,0.02)">
              <div class="flex items-center justify-between">
                <span class="text-xs text-[#c4c4d4]">Mostrar aos jogadores</span>
                <button
                  class="p-1.5 rounded transition-colors"
                  :class="showTerritoryMap ? 'text-green-400 hover:text-green-300' : 'text-[#4a4a5a] hover:text-[#6b6b7b]'"
                  :title="showTerritoryMap ? 'Mapa visível — clique para ocultar' : 'Mapa oculto — clique para mostrar'"
                  @click="toggleTerritoryMapVisibility"
                >
                  <svg v-if="showTerritoryMap" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <p class="text-[10px] text-[#6b6b7b]">
                {{ showTerritoryMap 
                  ? 'Jogadores podem ver o mapa político da cidade (sem porcentagens)' 
                  : 'Mapa de territórios oculto dos jogadores' 
                }}
              </p>
            </div>
          </section>

          <!-- Criar Evento Narrativo -->
          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#d4a647] mb-3">Criar Evento Narrativo</h3>
            <div class="space-y-2 rounded border border-[#2d1515] p-3" style="background:rgba(255,255,255,0.02)">
              <input
                v-model="eventDraft.title"
                type="text"
                maxlength="20"
                placeholder="Título do acontecimento"
                class="w-full rounded border border-[#4a4a5a]/50 px-2 py-1.5 text-xs text-white placeholder-[#4a4a5a] bg-[#0d0d20] focus:outline-none"
              >
              <textarea
                v-model="eventDraft.description"
                rows="2"
                maxlength="60"
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
            <div v-else class="space-y-1.5">
              <div
                v-for="ev in visibleSessionTimeline"
                :key="ev.id"
                class="rounded border border-[#2d1515] p-2 flex items-start justify-between gap-2" style="background:rgba(255,255,255,0.02)"
              >
                <div class="min-w-0">
                  <p class="text-xs font-medium text-white">{{ ev.title }}</p>
                  <p class="text-xs text-[#4a4a5a]">{{ formatTime(new Date(ev.timestamp)) }}</p>
                </div>
                <button
                  class="shrink-0 p-0.5 rounded text-[#4a4a5a] hover:text-red-400 transition-colors"
                  title="Apagar evento"
                  @click="openDeleteEventConfirm(ev)"
                >
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- ── Área Central — Preview do Jogador ── -->
        <div class="flex-1 overflow-y-auto flex flex-col items-center gap-8 px-8 py-8" style="background:#060610">

          <!-- Label de contexto -->
          <p class="text-[10px] uppercase tracking-widest text-[#4a4a5a] self-start">Preview — Visão dos Jogadores</p>

          <!-- Cena Atual -->
          <div v-if="currentSceneName" class="text-center">
            <p class="text-[11px] uppercase tracking-[0.25em] text-[#6b6b7b] mb-1">Cena</p>
            <h2 class="text-2xl font-bold text-white">{{ currentSceneName }}</h2>
          </div>
          <div v-else class="text-center">
            <p class="text-sm text-[#4a4a5a]">Descreva a cena no painel lateral...</p>
          </div>

          <!-- Imagem da Cena Ativa -->
          <div v-if="currentSceneMedia.imageUrl" class="w-full max-w-2xl rounded-xl overflow-hidden border border-[#7f1d1d]"
               style="box-shadow:0 4px 32px rgba(127,29,29,0.3)">
            <img :src="currentSceneMedia.imageUrl" alt="Imagem da cena" style="width:100%;object-fit:cover;max-height:400px;display:block;">
          </div>

          <!-- Áudio da Cena Ativo -->
          <div v-if="currentSceneMedia.audioUrl" class="w-full max-w-2xl rounded-lg border border-[#2d1515] px-4 py-3"
               style="background:#0a0a1a">
            <p class="text-[10px] uppercase tracking-[0.25em] text-[#6b6b7b] mb-2">Música da Cena</p>
            <audio
              ref="masterAudioRef"
              controls
              :src="currentSceneMedia.audioUrl"
              class="w-full"
              style="color-scheme:dark;accent-color:#d4a647;"
              @loadeddata="initializeAudioVolume"
              @play="syncAudioImmediate"
              @pause="syncAudioImmediate"
              @volumechange="syncAudioImmediate"
              @seeked="syncAudioImmediate"
            ></audio>
          </div>

          <!-- Grid de NPCs visíveis -->
          <div v-if="visibleNPCs.length > 0" class="w-full max-w-4xl">
            <div
              class="grid gap-4"
              :class="{
                'grid-cols-1 max-w-sm mx-auto': visibleNPCs.slice(0,3).length === 1,
                'grid-cols-2 max-w-2xl mx-auto': visibleNPCs.slice(0,3).length === 2,
                'grid-cols-3':                   visibleNPCs.slice(0,3).length >= 3,
              }"
            >
              <div
                v-for="npc in visibleNPCs.slice(0, 3)"
                :key="npc.id"
                class="flex flex-col rounded-xl border border-[#7f1d1d] overflow-hidden"
                style="background:rgba(10,10,26,0.9)"
              >
                <div class="w-full overflow-hidden h-[380px]">
                  <img v-if="npc.photo" :src="npc.photo" :alt="npc.name" class="w-full h-full object-cover object-top">
                  <div v-else class="w-full h-full flex items-center justify-center" style="background:linear-gradient(135deg,#1a0a0a,#0d0d20)">
                    <span class="text-5xl font-bold" style="color:rgba(255,255,255,0.15)">{{ npc.name.charAt(0) }}</span>
                  </div>
                </div>
                <div class="px-3 py-2 text-center">
                  <p class="font-semibold text-white text-sm leading-tight">{{ npc.name }}</p>
                  <p v-if="npc.type" class="text-xs text-[#6b6b7b] mt-0.5">{{ npc.type }}</p>
                </div>
              </div>
            </div>
            <p v-if="visibleNPCs.length > 3" class="text-center text-xs text-[#4a4a5a] mt-3">
              +{{ visibleNPCs.length - 3 }} personagem{{ visibleNPCs.length - 3 > 1 ? 's' : '' }} na cena
            </p>
          </div>

          <div v-else class="flex flex-col items-center gap-3 text-center mt-8">
            <svg class="w-16 h-16 text-red-900/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <polygon points="3 11 22 2 13 21 11 13 3 11"/>
            </svg>
            <p class="text-sm text-[#4a4a5a]">Nenhum personagem visível para os jogadores.</p>
          </div>

          <!-- Mapa de Territórios -->
          <div v-if="showTerritoryMap && territoryZones.length > 0" class="w-full max-w-5xl">
            <div class="mb-4">
              <h3 class="text-center text-base font-semibold text-[#d4a647] mb-1">🗺️ Mapa de Territórios</h3>
              <p class="text-center text-xs text-[#6b6b7b]">Visão compartilhada com os jogadores</p>
            </div>
            
            <TerritoryMapViewer
              :territories="territoryZones"
              :map-image-url="territoryMapUrl"
            />
          </div>

        </div>

        <!-- ── Painel Direito — Sistema de Dados ── -->
        <div class="w-96 border-l border-[#2d1515] shrink-0" style="background:#0a0a1a;">
          <DiceFeed 
            :rolls="diceRolls"
            @open-roll-modal="showDiceRollModal = true"
          />
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

    <!-- Modal de Rolagem de Dados -->
    <DiceRollModal 
      v-model="showDiceRollModal"
      :current-hunger="currentHunger"
      @roll="handleDiceRoll"
    />

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
      style="background:rgba(0,0,0,0.75); backdrop-filter:blur(2px);"
      @click.self="showStopSessionConfirmModal = false"
    >
      <div class="relative w-full max-w-md rounded-lg border border-[#7f1d1d] p-6" style="background:#0a0a1a; box-shadow:0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(127,29,29,0.3);">
        <!-- Corner accents -->
        <span class="lc lc-tl"/><span class="lc lc-tr"/>
        <span class="lc lc-bl"/><span class="lc lc-br"/>

        <!-- Header -->
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
          <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4a647]">Encerrar Sessão Ao Vivo</h3>
        </div>

        <div class="h-px bg-gradient-to-r from-[#7f1d1d]/60 via-[#7f1d1d]/20 to-transparent mb-4"/>

        <p class="text-sm text-[#c4c4d4] leading-relaxed mb-6">Deseja realmente encerrar a sessão? Os jogadores serão desconectados da sala.</p>

        <div class="flex justify-end gap-2">
          <button
            style="padding:8px 16px;border-radius:5px;border:1px solid #4a4a5a;background:transparent;color:#9b9bbb;font-size:0.75rem;font-weight:600;cursor:pointer;transition:all 0.2s;"
            @mouseover="e => { const el = e.currentTarget as HTMLElement; el.style.color='#fff'; el.style.borderColor='#9b9bbb'; }"
            @mouseout="e => { const el = e.currentTarget as HTMLElement; el.style.color='#9b9bbb'; el.style.borderColor='#4a4a5a'; }"
            @click="showStopSessionConfirmModal = false"
          >
            Cancelar
          </button>
          <button
            :disabled="stoppingSession"
            style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:5px;border:1px solid #b91c1c;background:linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%);color:#fff;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(127,29,29,0.4);"
            @mouseover="e => { if (!stoppingSession) (e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#dc2626 0%,#991b1b 100%)'; }"
            @mouseout="e => { (e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%)'; }"
            @click="handleStopSession"
          >
            <svg v-if="stoppingSession" style="width:13px;height:13px;animation:spin 1s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            {{ stoppingSession ? 'Encerrando...' : 'Confirmar Encerramento' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmação de exclusão de evento -->
    <div
      v-if="showDeleteEventModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.75); backdrop-filter:blur(2px);"
      @click.self="showDeleteEventModal = false"
    >
      <div class="relative w-full max-w-md rounded-lg border border-[#7f1d1d] p-6" style="background:#0a0a1a; box-shadow:0 8px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(127,29,29,0.3);">
        <span class="lc lc-tl"/><span class="lc lc-tr"/>
        <span class="lc lc-bl"/><span class="lc lc-br"/>

        <div class="flex items-center gap-3 mb-4">
          <svg class="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          <h3 class="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4a647]">Apagar Evento</h3>
        </div>

        <div class="h-px bg-gradient-to-r from-[#7f1d1d]/60 via-[#7f1d1d]/20 to-transparent mb-4"/>

        <p class="text-sm text-[#c4c4d4] leading-relaxed mb-1">Deseja apagar o evento:</p>
        <p class="text-sm font-semibold text-white mb-5 truncate">{{ eventToDelete?.title }}</p>
        <p class="text-xs text-[#6b6b7b] mb-6">Esta ação removerá o evento do histórico permanentemente.</p>

        <div class="flex justify-end gap-2">
          <button
            style="padding:8px 16px;border-radius:5px;border:1px solid #4a4a5a;background:transparent;color:#9b9bbb;font-size:0.75rem;font-weight:600;cursor:pointer;transition:all 0.2s;"
            @mouseover="e => { const el = e.currentTarget as HTMLElement; el.style.color='#fff'; el.style.borderColor='#9b9bbb'; }"
            @mouseout="e => { const el = e.currentTarget as HTMLElement; el.style.color='#9b9bbb'; el.style.borderColor='#4a4a5a'; }"
            @click="showDeleteEventModal = false"
          >
            Cancelar
          </button>
          <button
            :disabled="deletingEvent"
            style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:5px;border:1px solid #b91c1c;background:linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%);color:#fff;font-size:0.75rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(127,29,29,0.4);"
            @mouseover="e => { if (!deletingEvent) (e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#dc2626 0%,#991b1b 100%)'; }"
            @mouseout="e => { (e.currentTarget as HTMLElement).style.background='linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%)'; }"
            @click="confirmDeleteEvent"
          >
            <svg v-if="deletingEvent" style="width:13px;height:13px;animation:spin 1s linear infinite" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            {{ deletingEvent ? 'Apagando...' : 'Confirmar Exclusão' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
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
import { useDice } from '~/composables/useDice'
import { createClient } from '@supabase/supabase-js'
import TerritoryMapViewer from '~/components/campaign/TerritoryMapViewer.vue'
import DiceFeed from '~/components/live/dice/DiceFeed.vue'
import DiceRollModal from '~/components/live/dice/DiceRollModal.vue'
import CoterieAvatars from '~/components/live/CoterieAvatars.vue'
import type { DiceRollConfig } from '~/types/dice'
import type { CoteriePlayer } from '~/components/live/CoterieAvatars.vue'

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
  activePlayers,
  currentSceneMedia,
  startLiveGame,
  stopLiveGame,
  fetchLiveGameState,
  updateCurrentScene,
  updateSceneMedia,
  addNPCToGame,
  removeNPCFromGame,
  setActivePlayers,
} = useLiveGame()

// Sistema de dados
const { rolls, rollDice, loadRolls, subscribeToRolls, unsubscribeFromRolls } = useDice()

// Sistema de dados - Estados
const showDiceRollModal = ref(false)
const currentHunger = ref(2) // TODO: Pegar da ficha do mestre

// Converter rolls readonly para array normal (compatibilidade com componente)
const diceRolls = computed(() => [...rolls.value] as any[])

// Jogadores da crônica para exibição da Coterie
const coteriePlayers = computed<CoteriePlayer[]>(() => {
  const raw = campaign.value?.campaign_players ?? []
  return raw
    .filter((p: any) => p.role !== 'master')
    .map((p: any) => ({
      user_id: p.user_id,
      character_name: p.character_name ?? null,
      sheet: p.sheet ?? null,
      role: p.role ?? 'player',
    }))
})

// ============================================
// Local state
// ============================================
const campaign         = ref<any>(null)
const allNPCs          = ref<any[]>([])
const playerCount      = ref(0)
const selectedNPC      = ref<any>(null)
const currentSceneName = ref('')
const showNpcPicker    = ref(false)
const npcSearch        = ref('')

// Media items in scene (NPC-style picker)
interface MediaItem { name: string; url: string; type: 'image' | 'audio'; visibleToPlayers: boolean }
const sceneMediaItems   = ref<MediaItem[]>([])
const showImagePicker   = ref(false)
const showAudioPicker   = ref(false)
const mediaPickerSearch = ref('')
// Available files from Storage (populated by loadMediaFiles)
const sceneImages = ref<{ name: string; url: string }[]>([])
const sceneAudios = ref<{ name: string; url: string }[]>([])
const loadingMedia = ref(false)

// Territory Map visibility
const showTerritoryMap = ref(false)
const territoryZones = ref<any[]>([])
const territoryMapUrl = ref('')

// Master audio player ref (for syncing with players)
const masterAudioRef = ref<HTMLAudioElement | null>(null)

const eventDraft = ref({
  title: '',
  description: '',
  type: 'narrative',
})
const showEventConfirmModal = ref(false)
const showStopSessionConfirmModal = ref(false)
const showDeleteEventModal = ref(false)
const eventToDelete = ref<any>(null)
const deletingEvent = ref(false)
const creatingEvent = ref(false)

// Session control
const sessionActive   = computed(() => isGameLive.value)
const startingSession = ref(false)
const stoppingSession = ref(false)
const sessionError    = ref<string | null>(null)
const pageLoading     = ref(true)

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

// Media computed
const inSceneImages = computed(() => sceneMediaItems.value.filter(m => m.type === 'image'))
const inSceneAudios = computed(() => sceneMediaItems.value.filter(m => m.type === 'audio'))

// Show only the 4 most recent events; older ones are kept in DB but hidden
const visibleSessionTimeline = computed(() => sessionTimeline.value.slice(-4).reverse())
const availableImagesPicker = computed(() => {
  const q = mediaPickerSearch.value.toLowerCase()
  return sceneImages.value.filter(i =>
    !sceneMediaItems.value.some(m => m.url === i.url) && (!q || i.name.toLowerCase().includes(q))
  )
})
const availableAudiosPicker = computed(() => {
  const q = mediaPickerSearch.value.toLowerCase()
  return sceneAudios.value.filter(a =>
    !sceneMediaItems.value.some(m => m.url === a.url) && (!q || a.name.toLowerCase().includes(q))
  )
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
      // Load territory data for map display
      if (data.politics) {
        territoryZones.value = data.politics.territoryZones || []
        territoryMapUrl.value = data.politics.territoryMapImage || ''
        console.log('🗺️ Territory Map URL loaded:', territoryMapUrl.value)
        console.log('🗺️ Territory Zones loaded:', territoryZones.value.length)
      }
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
  pageLoading.value = true
  try {
    await stopLiveGame(campaignId)
    toast.success('Sessão encerrada', 'O jogo ao vivo foi finalizado e voltou ao estado padrão.')
    await router.push(`/campaign/${campaignId}/master`)
  } catch (e: any) {
    console.error('LIVE: Erro ao encerrar sessão:', e)
    toast.error('Erro ao encerrar sessão', e?.message ?? 'Tente novamente em instantes.')
    pageLoading.value = false
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
    applyLiveNpcState(currentNpcs.value as any[])
  } catch (e: any) {
    console.error('LIVE: Erro ao adicionar NPC:', e)
    toast.error('Erro ao adicionar NPC', e?.message ?? 'Tente novamente.')
  }
}

const removeNPCInline = async (npc: any) => {
  try {
    if (selectedNPC.value?.id === npc.id) selectedNPC.value = null
    await removeNPCFromGame(npc.id, campaignId)
    applyLiveNpcState(currentNpcs.value as any[])
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
  // Use estado local (já sincronizado via realtime) ao invés de buscar do banco
  const inGameNpcs = allNPCs.value.filter(n => n.inGame)
  if (inGameNpcs.length === 0) return

  // Capturar valor original ANTES de modificar
  const targetNpc = allNPCs.value.find(n => n.id === npc.id)
  if (!targetNpc) return
  
  const originalValue = targetNpc.visibleToPlayers
  const newValue = !originalValue

  // Aplicar mudança localmente primeiro (otimista)
  targetNpc.visibleToPlayers = newValue

  // Construir array atualizado para o banco usando o NOVO valor
  const updated = inGameNpcs.map((currentNpc: any) => ({
    id: currentNpc.id,
    name: currentNpc.name,
    photo_url: currentNpc.photo,
    type: currentNpc.type,
    isVisible: currentNpc.id === npc.id ? newValue : currentNpc.visibleToPlayers,
    isSpotlight: currentNpc.isSpotlight
  }))

  // Atualizar banco (assíncrono)
  const { error } = await supabase
    .from('live_game_state')
    .update({ current_npcs: updated })
    .eq('campaign_id', campaignId)

  if (error) {
    console.error('LIVE: Erro ao atualizar visibilidade de NPC:', error)
    // Reverter para valor original em caso de erro
    targetNpc.visibleToPlayers = originalValue
    toast.error('Erro ao atualizar visibilidade', 'Tente novamente')
  }
}

const setNpcSpotlight = async (npcId: string | null) => {
  // Use estado local ao invés de buscar do banco
  const inGameNpcs = allNPCs.value.filter(n => n.inGame)
  if (inGameNpcs.length === 0) return

  if (npcId && !inGameNpcs.some(n => n.id === npcId)) {
    return
  }

  // Capturar estados originais ANTES de modificar
  const originalStates = new Map(allNPCs.value.map(n => [n.id, n.isSpotlight]))

  // Aplicar mudança localmente primeiro (otimista)
  allNPCs.value.forEach(n => {
    n.isSpotlight = npcId ? n.id === npcId : false
  })

  // Construir array atualizado para o banco
  const updated = inGameNpcs.map((currentNpc: any) => ({
    id: currentNpc.id,
    name: currentNpc.name,
    photo_url: currentNpc.photo,
    type: currentNpc.type,
    isVisible: currentNpc.visibleToPlayers,
    isSpotlight: npcId ? currentNpc.id === npcId : false
  }))

  // Atualizar banco (assíncrono)
  const { error } = await supabase
    .from('live_game_state')
    .update({ current_npcs: updated })
    .eq('campaign_id', campaignId)

  if (error) {
    console.error('LIVE: Erro ao destacar NPC na cena:', error)
    // Reverter para estados originais em caso de erro
    allNPCs.value.forEach(n => {
      n.isSpotlight = originalStates.get(n.id) ?? false
    })
    toast.error('Erro ao destacar NPC', 'Tente novamente')
  }
}

// ============================================
// Scene name
// ============================================
let saveSceneTimeout: NodeJS.Timeout | null = null

const saveSceneName = async () => {
  if (!isGameLive.value) return
  
  // Debounce: aguarda 300ms após última edição antes de salvar
  if (saveSceneTimeout) clearTimeout(saveSceneTimeout)
  
  saveSceneTimeout = setTimeout(async () => {
    try {
      await updateCurrentScene(currentSceneName.value)
    } catch (e) {
      console.error('LIVE: Erro ao salvar cena:', e)
    }
  }, 300)
}

// ============================================
// Audio sync to players
// ============================================

// Definir volume inicial do player quando a música carrega
const initializeAudioVolume = () => {
  if (!masterAudioRef.value) return
  masterAudioRef.value.volume = 0.2 // 20%
  console.log('🎵 Mestre: Volume inicial definido para 20%')
  syncAudioImmediate() // Sincronizar imediatamente
}

// Sincronização IMEDIATA (sem delay) para play/pause/volume/seek
const syncAudioImmediate = async () => {
  if (!masterAudioRef.value || !isGameLive.value) return
  
  try {
    const audio = masterAudioRef.value
    
    console.log('🔄 Mestre: Sincronizando áudio com jogadores', {
      playing: !audio.paused,
      time: audio.currentTime.toFixed(2),
      volume: Math.round(audio.volume * 100)
    })
    
    await supabase
      .from('live_game_state')
      .update({
        current_audio_playing: !audio.paused,
        current_audio_time: audio.currentTime,
        current_audio_volume: Math.round(audio.volume * 100)
      })
      .eq('campaign_id', campaignId)
    
  } catch (e) {
    console.error('LIVE: Erro ao sincronizar áudio:', e)
  }
}

// ============================================
// Helpers
// ============================================
const formatTime = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(d)

const getFileName = (url: string) => {
  const parts = url.split('/')
  return decodeURIComponent(parts[parts.length - 1] ?? '')
}

const loadMediaFiles = async () => {
  loadingMedia.value = true
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('campaign-media')
      .list(campaignId, { sortBy: { column: 'name', order: 'asc' } })

    if (listError) throw listError

    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']

    sceneImages.value = []
    sceneAudios.value = []

    for (const file of (files ?? [])) {
      if (!file.name || file.name === '.emptyFolderPlaceholder') continue
      const lower = file.name.toLowerCase()
      const { data: urlData } = supabase.storage
        .from('campaign-media')
        .getPublicUrl(`${campaignId}/${file.name}`)
      const url = urlData.publicUrl

      if (imageExts.some(ext => lower.endsWith(ext))) {
        sceneImages.value.push({ name: file.name, url })
      } else if (audioExts.some(ext => lower.endsWith(ext))) {
        sceneAudios.value.push({ name: file.name, url })
      }
    }
  } catch (e) {
    console.error('LIVE: Erro ao carregar mídias do Storage:', e)
  } finally {
    loadingMedia.value = false
  }
}

const addMediaToScene = (item: { name: string; url: string }, type: 'image' | 'audio') => {
  sceneMediaItems.value.push({ ...item, type, visibleToPlayers: false })
  showImagePicker.value = false
  showAudioPicker.value = false
  mediaPickerSearch.value = ''
}

const removeMediaFromScene = async (item: MediaItem) => {
  sceneMediaItems.value = sceneMediaItems.value.filter(m => m.url !== item.url)
  if (item.visibleToPlayers) {
    const visImg = sceneMediaItems.value.find(m => m.type === 'image' && m.visibleToPlayers)?.url ?? ''
    const visAud = sceneMediaItems.value.find(m => m.type === 'audio' && m.visibleToPlayers)?.url ?? ''
    await updateSceneMedia(campaignId, visImg, visAud)
  }
}

const toggleMediaVisibility = async (item: MediaItem) => {
  const newVisible = !item.visibleToPlayers
  sceneMediaItems.value = sceneMediaItems.value.map(m => {
    if (m.url === item.url) return { ...m, visibleToPlayers: newVisible }
    if (m.type === item.type && newVisible) return { ...m, visibleToPlayers: false }
    return m
  })
  const visImg = sceneMediaItems.value.find(m => m.type === 'image' && m.visibleToPlayers)?.url ?? ''
  const visAud = sceneMediaItems.value.find(m => m.type === 'audio' && m.visibleToPlayers)?.url ?? ''
  await updateSceneMedia(campaignId, visImg, visAud)
}

const toggleTerritoryMapVisibility = async () => {
  const newValue = !showTerritoryMap.value
  console.log('🗺️ Toggling territory map visibility to:', newValue)
  
  try {
    // First check if live_game_state exists
    const { data: existingState, error: fetchError } = await supabase
      .from('live_game_state')
      .select('id, show_territory_map')
      .eq('campaign_id', campaignId)
      .maybeSingle()
    
    if (fetchError) {
      console.error('LIVE: Erro ao buscar estado do jogo:', fetchError)
      throw fetchError
    }
    
    if (!existingState) {
      console.error('LIVE: live_game_state não encontrado para campaign_id:', campaignId)
      throw new Error('Estado do jogo não encontrado. Inicie uma sessão primeiro.')
    }
    
    // Update the state
    const { error: updateError } = await supabase
      .from('live_game_state')
      .update({ show_territory_map: newValue })
      .eq('campaign_id', campaignId)
    
    if (updateError) {
      console.error('LIVE: Erro ao atualizar show_territory_map:', updateError)
      throw updateError
    }
    
    showTerritoryMap.value = newValue
    console.log('🗺️ Territory map visibility updated successfully')
    
    toast.success(
      newValue ? 'Mapa revelado' : 'Mapa ocultado',
      newValue 
        ? 'Os jogadores agora podem ver o mapa de territórios'
        : 'O mapa de territórios foi ocultado dos jogadores'
    )
  } catch (e: any) {
    console.error('LIVE: Erro ao atualizar visibilidade do mapa:', e)
    toast.error('Erro ao atualizar visibilidade do mapa', e?.message || 'Erro desconhecido')
  }
}

const goBackToMaster = () => router.push(`/campaign/${campaignId}/master`)
const goToNPCTab = () => router.push(`/campaign/${campaignId}/master#npcs`)

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

    const { data: insertedEvent, error: insertError } = await supabase
      .from('campaign_events')
      .insert(payload)
      .select('id')
      .single()

    if (insertError) throw insertError

    const current = await fetchLiveNpcsFromDb()
    const { data: liveData } = await supabase
      .from('live_game_state')
      .select('timeline_events')
      .eq('campaign_id', campaignId)
      .maybeSingle()

    const newTimelineEvent = {
      id: `story-${Date.now()}`,
      dbId: insertedEvent?.id ?? null,
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

const openDeleteEventConfirm = (ev: any) => {
  eventToDelete.value = ev
  showDeleteEventModal.value = true
}

const confirmDeleteEvent = async () => {
  if (!eventToDelete.value) return
  deletingEvent.value = true
  try {
    // Step 1: Resolve the real DB UUID — prefer stored dbId, else query by title+type
    let resolvedId: string | null = eventToDelete.value.dbId ?? null

    if (!resolvedId) {
      const { data: found, error: findError } = await supabase
        .from('campaign_events')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('title', eventToDelete.value.title)
        .eq('type', eventToDelete.value.type)
        .order('occurred_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (findError) throw findError
      resolvedId = found?.id ?? null
    }

    // Step 2: Delete from campaign_events
    if (resolvedId) {
      const { error: deleteError } = await supabase
        .from('campaign_events')
        .delete()
        .eq('id', resolvedId)

      if (deleteError) throw deleteError
    }

    // Step 3: Remove from live_game_state.timeline_events
    const { data: liveData } = await supabase
      .from('live_game_state')
      .select('timeline_events')
      .eq('campaign_id', campaignId)
      .maybeSingle()

    const updatedTimeline = (liveData?.timeline_events ?? []).filter(
      (ev: any) => ev.id !== eventToDelete.value!.id
    )

    const { error: updateError } = await supabase
      .from('live_game_state')
      .update({ timeline_events: updatedTimeline })
      .eq('campaign_id', campaignId)

    if (updateError) throw updateError

    sessionTimeline.value = sanitizeTimeline(updatedTimeline)
    showDeleteEventModal.value = false
    eventToDelete.value = null
  } catch (e) {
    console.error('LIVE: Erro ao apagar evento:', e)
    alert('Não foi possível apagar o evento: ' + (e as any)?.message)
  } finally {
    deletingEvent.value = false
  }
}

// ============================================
// Sistema de Dados - Handlers
// ============================================
const handleDiceRoll = async (config: DiceRollConfig) => {
  try {
    const characterName = campaign.value?.master_name || 'Mestre'
    await rollDice(campaignId, config, characterName)
    showDiceRollModal.value = false
    toast.success('Rolagem realizada!', 'Os dados foram lançados.')
  } catch (e: any) {
    console.error('LIVE: Erro ao rolar dados:', e)
    toast.error('Erro ao rolar dados', e?.message ?? 'Tente novamente.')
  }
}

// ============================================
// Realtime subscription — sync session state
// ============================================
const startRealtime = () => {
  realtimeChannel = supabase
    .channel(`live_master:${campaignId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'live_game_state', filter: `campaign_id=eq.${campaignId}` },
      (payload) => {
        const ns = payload.new as any

        // Drive NPC display directly from realtime payload — avoids shared-state race conditions
        if (Array.isArray(ns.current_npcs)) {
          applyLiveNpcState(ns.current_npcs)
        }

        // Sync active players list (needed for CoterieAvatars online status)
        if (Array.isArray(ns.active_players)) {
          setActivePlayers(ns.active_players)
        }

        // Sync local session timeline
        if (Array.isArray(ns.timeline_events)) {
          sessionTimeline.value = sanitizeTimeline(ns.timeline_events)
        }

        // Sync territory map visibility
        if (typeof ns.show_territory_map === 'boolean') {
          showTerritoryMap.value = ns.show_territory_map
        }
      }
    )
    .subscribe()
}

// ============================================
// Lifecycle
// ============================================

// Stop live session ONLY when master closes browser/tab (NOT when navigating)
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!isGameLive.value) return
  
  console.log('⚠️ MESTRE: Encerrando sessão (fechando navegador/aba)')
  
  // Usar sendBeacon para garantir que a requisição seja enviada mesmo após fechar
  // Essa é a forma mais confiável de enviar dados ao fechar a página
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey
  
  // Criar payload para encerrar sessão
  const payload = {
    is_live: false,
    active_players: [],
    current_scene: '',
    timeline_events: [],
    show_territory_map: false
  }
  
  // Tentar com fetch + keepalive (mais confiável que async/await no beforeunload)
  try {
    fetch(`${supabaseUrl}/rest/v1/live_game_state?campaign_id=eq.${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload),
      keepalive: true // Garante que a requisição continue mesmo após fechar a página
    })
  } catch (e) {
    console.error('❌ Erro ao encerrar sessão:', e)
  }
  
  // Opcional: Adicionar mensagem de confirmação (alguns navegadores não mostram mais)
  // event.preventDefault()
  // event.returnValue = ''
}

onMounted(async () => {
  await Promise.all([loadCampaignData(), loadNPCs(), loadMediaFiles()])

  // Restore state if master refreshed mid-session
  const state = await fetchLiveGameState(campaignId)
  if (state) {
    currentSceneName.value = (state as any).current_scene ?? ''
    sessionTimeline.value  = await purgeSessionTechnicalEvents((state as any).timeline_events ?? [])
    applyLiveNpcState((state as any).current_npcs ?? [])
    showTerritoryMap.value = (state as any).show_territory_map ?? false
    // Restore active media into scene items
    sceneMediaItems.value = []
    const imgUrl = (state as any).current_image_url ?? ''
    const audUrl = (state as any).current_audio_url ?? ''
    if (imgUrl) sceneMediaItems.value.push({ name: getFileName(imgUrl), url: imgUrl, type: 'image', visibleToPlayers: true })
    if (audUrl) sceneMediaItems.value.push({ name: getFileName(audUrl), url: audUrl, type: 'audio', visibleToPlayers: true })
  }

  startRealtime()
  
  // Carregar e sincronizar rolagens de dados
  await loadRolls(campaignId)
  subscribeToRolls(campaignId)
  
  if (process.client) window.addEventListener('beforeunload', handleBeforeUnload)
  pageLoading.value = false
})

watch(inGameNPCs, (newInGameNpcs) => {
  if (selectedNPC.value && !newInGameNpcs.some((npc: any) => npc.id === selectedNPC.value.id)) {
    selectedNPC.value = null
  }
}, { deep: true })

watch(sessionActive, async (isActive) => {
  if (!isActive) return

  await loadNPCs()
  const state = await fetchLiveGameState(campaignId)
  if (state) {
    applyLiveNpcState((state as any).current_npcs ?? [])
  }
})

onBeforeUnmount(() => {
  console.log('🔄 MESTRE: Componente sendo desmontado (navegando no sistema)')
  
  // Remover event listener
  if (process.client) {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
  
  // NÃO encerrar sessão ao navegar - apenas ao fechar navegador/aba
  // A sessão continua ativa quando o mestre vai para outras páginas do sistema
  console.log('✅ Sessão permanece ativa (navegação interna)')
  
  // Limpar canal realtime
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
  
  // Desinscrever do canal de dados
  unsubscribeFromRolls()
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

/* ── Spinner padrão do sistema ── */
.df-spinner {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 2px solid #7f1d1d;
  border-top-color: #dc2626;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
.df-text-muted {
  color: #6b6b7b;
  font-size: 0.8rem;
}

/* ── Animations ── */
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes spin  { to{transform:rotate(360deg)} }
.animate-pulse { animation: pulse 2s ease-in-out infinite; }
.animate-spin  { animation: spin 1s linear infinite; }
</style>