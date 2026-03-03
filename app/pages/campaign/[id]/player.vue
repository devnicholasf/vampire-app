<template>
  <div class="df-player min-h-screen relative overflow-hidden">

    <!-- Header -->
    <header class="df-header sticky top-0 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="goBackToDashboard" class="df-btn-ghost" title="Voltar ao Dashboard">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div>
              <h1 class="df-brand-title flex items-center gap-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
                {{ campaign?.name || 'Carregando...' }}
              </h1>
            </div>
          </div>
          <button @click="goToLiveGame" class="df-btn-primary">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
            Entrar no Jogo
          </button>
        </div>
      </div>
    </header>

    <!-- PlayerSheet Modal -->
    <PlayerSheet
      v-if="showCharacterSheet && myCharacter"
      :key="sheetKey"
      :player="myCharacter"
      :canEdit="true"
      @close="closeCharacterSheet"
      @save="saveCharacterSheet"
    />

    <!-- Toast Notification -->
    <BaseToast
      :message="toastMessage"
      :variant="toastVariant"
      :show="showToast"
      @dismiss="hideToast"
      class="fixed top-4 right-4 z-[10000]"
    />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div class="df-spinner"></div>
        <p class="df-text-muted mt-4">Carregando campanha...</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Hero Section - My Character -->
        <div class="df-hero-card">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>

          <div class="relative z-10">
            <div class="mb-6">
              <h2 class="df-section-title text-2xl flex items-center gap-2">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
                Meu Personagem
              </h2>
            </div>

            <div v-if="myCharacter" class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Avatar & Name -->
              <div class="md:col-span-1 flex flex-col items-center text-center">
                <div class="df-avatar-frame mb-4 cursor-pointer" @click="triggerAvatarUpload" title="Clique para alterar avatar">
                  <div class="df-avatar-inner">
                    <img
                      v-if="myCharacter.sheet?.avatar"
                      :src="myCharacter.sheet.avatar"
                      :alt="myCharacter.character_name || myCharacter.name"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="text-red-300 font-bold text-3xl">
                      {{ getCharacterInitials(myCharacter.character_name || myCharacter.name) }}
                    </span>
                  </div>
                  <div class="df-avatar-overlay">
                    <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </div>
                <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
                <h3 class="text-2xl font-bold text-white mb-2">
                  {{ myCharacter.character_name || myCharacter.name }}
                </h3>
                <div class="space-y-1">
                  <p class="text-lg text-red-400 font-semibold">
                    {{ myCharacter.sheet?.clan || 'Clã não definido' }}
                  </p>
                  <p v-if="myCharacter.sheet?.concept" class="text-sm italic df-text-silver">
                    "{{ myCharacter.sheet.concept }}"
                  </p>
                  <p v-if="myCharacter.sheet?.generation" class="text-sm df-text-muted">
                    {{ myCharacter.sheet.generation }}ª Geração
                  </p>
                  <p v-if="myCharacter.sheet?.sect" class="text-sm df-text-muted">
                    {{ myCharacter.sheet.sect }}
                  </p>
                </div>
              </div>

              <!-- Character Stats -->
              <div v-if="myCharacter.sheet" class="md:col-span-2">
                <div class="grid grid-cols-3 gap-4 mb-6">
                  <div class="df-stat-card">
                    <p class="text-3xl font-bold text-red-400 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.physical) }}
                    </p>
                    <p class="text-xs df-text-muted uppercase flex items-center justify-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>
                      Físico
                    </p>
                  </div>
                  <div class="df-stat-card">
                    <p class="text-3xl font-bold text-red-400 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.social) }}
                    </p>
                    <p class="text-xs df-text-muted uppercase flex items-center justify-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
                      Social
                    </p>
                  </div>
                  <div class="df-stat-card">
                    <p class="text-3xl font-bold text-red-400 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.mental) }}
                    </p>
                    <p class="text-xs df-text-muted uppercase flex items-center justify-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      Mental
                    </p>
                  </div>
                </div>

                <!-- Blood Potency -->
                <div class="df-inner-card mb-5">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-semibold text-df-silver flex items-center gap-2">
                      <svg class="w-4 h-4 text-df-red" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
                      Potência de Sangue
                    </span>
                    <span class="text-2xl font-bold text-df-red">{{ myCharacter.sheet.bloodPotency || 0 }} / 10</span>
                  </div>
                  <div class="flex gap-1">
                    <div v-for="i in 10" :key="i" class="flex-1 h-3 rounded-sm transition-all" :class="i <= (myCharacter.sheet.bloodPotency || 0) ? 'bg-gradient-to-r from-df-crimson to-df-red' : 'bg-df-input'"></div>
                  </div>
                </div>

                <div class="text-center">
                  <button @click="openCharacterSheet" class="df-btn-primary">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar Ficha
                  </button>
                </div>
              </div>

              <!-- No Sheet -->
              <div v-else class="md:col-span-2 df-card p-8 text-center">
                <svg class="w-16 h-16 text-red-900 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
                <p class="df-text-silver mb-4">Você ainda não preencheu sua ficha de personagem</p>
                <p class="df-text-muted text-sm mb-6">Crie sua ficha completa com atributos, habilidades, disciplinas e mais!</p>
                <button @click="openCharacterSheet" class="df-btn-primary">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Criar Ficha Agora
                </button>
              </div>
            </div>

            <!-- Not in campaign -->
            <div v-else class="text-center py-12">
              <svg class="w-16 h-16 text-red-900 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
              <p class="df-text-silver text-lg mb-4">Você ainda não faz parte desta campanha</p>
              <p class="df-text-muted text-sm">Entre em contato com o Mestre para receber um convite</p>
            </div>
          </div>
        </div>

        <!-- Vampire State & Stats Grid -->
        <div v-if="myCharacter?.sheet" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Vampire State -->
          <div class="df-card">
            <div class="df-card-corner df-card-corner-tl"></div>
            <div class="df-card-corner df-card-corner-tr"></div>
            <div class="df-card-corner df-card-corner-bl"></div>
            <div class="df-card-corner df-card-corner-br"></div>

            <h2 class="df-section-title text-xl flex items-center gap-2 mb-6">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
              Estado Atual do Vampiro
            </h2>

            <div class="space-y-4">
              <!-- Hunger -->
              <div class="df-inner-card">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold df-text-silver flex items-center gap-2">
                    <svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
                    Fome Atual
                  </span>
                  <span class="text-2xl font-bold text-red-400">{{ myCharacter.sheet.hunger || 1 }} / 5</span>
                </div>
                <div class="flex gap-1">
                  <div v-for="i in 5" :key="i" class="flex-1 h-3 rounded-sm transition-all" :class="i <= (myCharacter.sheet.hunger || 1) ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-[var(--df-bg-input)]'"></div>
                </div>
              </div>

              <!-- Humanity -->
              <div class="df-inner-card">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold df-text-silver flex items-center gap-2">
                    <svg class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    Humanidade
                  </span>
                  <span class="text-2xl font-bold text-red-400">{{ myCharacter.sheet.humanity || 7 }} / 10</span>
                </div>
                <div class="w-full bg-[var(--df-bg-input)] rounded-full h-3">
                  <div class="bg-gradient-to-r from-red-800 to-red-500 h-3 rounded-full transition-all" :style="{ width: `${((myCharacter.sheet.humanity || 7) / 10) * 100}%` }"></div>
                </div>
              </div>

              <!-- Willpower -->
              <div class="df-inner-card">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold df-text-silver flex items-center gap-2">
                    <svg class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Força de Vontade
                  </span>
                  <span class="text-2xl font-bold text-red-400">{{ myCharacter.sheet.willpower || 3 }} / 10</span>
                </div>
                <div class="w-full bg-[var(--df-bg-input)] rounded-full h-3">
                  <div class="bg-gradient-to-r from-red-800 to-red-500 h-3 rounded-full transition-all" :style="{ width: `${((myCharacter.sheet.willpower || 3) / 10) * 100}%` }"></div>
                </div>
              </div>

              <!-- Conditions -->
              <div class="df-inner-card">
                <p class="text-sm font-semibold df-text-silver mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>
                  Condições Ativas
                </p>
                <div v-if="myCharacter.sheet.conditions?.length > 0" class="flex flex-wrap gap-2">
                  <span v-for="(condition, idx) in myCharacter.sheet.conditions" :key="idx" class="df-condition-badge">
                    {{ condition }}
                  </span>
                </div>
                <p v-else class="df-text-muted text-sm italic">Nenhuma condição ativa</p>
              </div>
            </div>
          </div>

          <!-- Key Stats -->
          <div class="df-card">
            <div class="df-card-corner df-card-corner-tl"></div>
            <div class="df-card-corner df-card-corner-tr"></div>
            <div class="df-card-corner df-card-corner-bl"></div>
            <div class="df-card-corner df-card-corner-br"></div>

            <h2 class="df-section-title text-xl flex items-center gap-2 mb-6">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
              Estatísticas-Chave
            </h2>

            <div class="space-y-4">
              <!-- XP -->
              <div class="df-inner-card">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs df-text-muted mb-1 flex items-center gap-1">
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      XP Disponível
                    </p>
                    <p class="text-3xl font-bold text-red-400">{{ (myCharacter.sheet.xpTotal || 0) - (myCharacter.sheet.xpSpent || 0) }}</p>
                  </div>
                  <div>
                    <p class="text-xs df-text-muted mb-1 flex items-center gap-1">
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                      XP Gasto
                    </p>
                    <p class="text-3xl font-bold df-text-silver">{{ myCharacter.sheet.xpSpent || 0 }}</p>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-[var(--df-border-red)]">
                  <p class="text-xs df-text-muted">Total Acumulado</p>
                  <p class="text-lg font-bold text-[var(--df-text-gold)]">{{ myCharacter.sheet.xpTotal || 0 }} XP</p>
                </div>
              </div>

              <!-- Active Disciplines -->
              <div class="df-inner-card">
                <p class="text-sm font-semibold df-text-silver mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
                  Disciplinas Ativas
                </p>
                <div v-if="myCharacter.sheet.disciplines?.filter((d: any) => d.level > 0).length > 0" class="space-y-2">
                  <div v-for="discipline in myCharacter.sheet.disciplines.filter((d: any) => d.name && d.level > 0)" :key="discipline.name" class="flex justify-between items-center">
                    <span class="text-sm df-text-silver">{{ discipline.name }}</span>
                    <span class="text-red-400 font-bold">{{ '●'.repeat(discipline.level) }}</span>
                  </div>
                  <div class="pt-2 mt-2 border-t border-[var(--df-border-red)]">
                    <p class="text-xs df-text-muted">Nível Total</p>
                    <p class="text-xl font-bold text-red-400">
                      {{ myCharacter.sheet.disciplines.reduce((sum: number, d: any) => sum + (d.level || 0), 0) }} pontos
                    </p>
                  </div>
                </div>
                <p v-else class="df-text-muted text-sm italic">Nenhuma disciplina ativa</p>
              </div>

              <!-- Strengths/Weaknesses -->
              <div class="df-inner-card">
                <p class="text-sm font-semibold df-text-silver mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><path d="M5.5 8.5l13 7"/><path d="M5.5 15.5l13-7"/></svg>
                  Resumo
                </p>
                <div class="space-y-2 text-sm">
                  <div class="flex items-start gap-2">
                    <span class="text-green-400">&#10003;</span>
                    <span class="df-text-muted">
                      <strong class="df-text-silver">Forte em:</strong>
                      {{ getStrongestAttribute() }}
                    </span>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-red-400">&#10007;</span>
                    <span class="df-text-muted">
                      <strong class="df-text-silver">Fraco em:</strong>
                      {{ getWeakestAttribute() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Session Notes -->
            <div class="df-card">
              <h2 class="df-section-title text-lg flex items-center gap-2 mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Notas das Sessões
              </h2>

              <div v-if="sessionNotes.length > 0" class="space-y-4">
                <div v-for="note in sessionNotes" :key="note.id" class="df-inner-card hover:border-[var(--df-accent-red)] transition-colors">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold df-text-silver">{{ note.title }}</h3>
                    <span class="text-xs df-text-muted">{{ formatDate(note.date) }}</span>
                  </div>
                  <p class="df-text-muted text-sm">{{ note.content }}</p>
                </div>
              </div>

              <div v-else class="text-center py-8">
                <svg class="w-12 h-12 text-red-900 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <p class="df-text-muted">Nenhuma nota de sessão ainda</p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Quick Actions -->
            <div class="df-card">
              <div class="df-card-corner df-card-corner-tl"></div>
              <div class="df-card-corner df-card-corner-tr"></div>
              <div class="df-card-corner df-card-corner-bl"></div>
              <div class="df-card-corner df-card-corner-br"></div>

              <h3 class="df-section-title text-base flex items-center gap-2 mb-4">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Ações Rápidas
              </h3>

              <div class="space-y-3">
                <button @click="goToLiveGame" class="df-btn-primary w-full justify-center">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
                  Entrar no Jogo Ao Vivo
                </button>
                <button @click="editCharacter" class="df-btn-outline w-full justify-start">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar Personagem
                </button>
                <button @click="viewRules" class="df-btn-ghost w-full justify-start">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                  Ver Regras
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// ============================================
// Vue imports
// ============================================
import { ref, onMounted, computed } from 'vue'

// ============================================
// Nuxt imports
// ============================================
import { useRoute, navigateTo, useSeoMeta, definePageMeta } from '#imports'

// ============================================
// Composable imports
// ============================================
import { useAuth } from '~/composables/useAuth'
import { useCampaign } from '~/composables/useCampaign'
import { useToast } from '~/composables/useToast'

// ============================================
// Explicit component imports
// ============================================
import PlayerSheet from '~/components/campaign/PlayerSheet.vue'
import BaseToast from '~/components/ui/BaseToast.vue'

// ============================================
// Types
// ============================================
interface Campaign {
  id: string
  name: string
  description: string
  masterId: string
  createdAt: Date
}

interface Character {
  id: string
  name: string
  clan: string
  generation: number
  attributes: {
    physical: number
    social: number
    mental: number
  }
}

interface SessionNote {
  id: string
  title: string
  content: string
  date: Date
}

// ============================================
// Route params and middleware
// ============================================
const route = useRoute()
const campaignId = route.params.id as string

definePageMeta({
  // middleware: 'auth' // Removido temporariamente
})

// ============================================
// Composables
// ============================================
const { user } = useAuth()
const { savePlayerSheet, loadPlayerSheet } = useCampaign()
const toast = useToast()

// ============================================
// State
// ============================================
const loading = ref(true)
const campaign = ref<Campaign | null>(null)
const myCharacter = ref<any>(null)
const sessionNotes = ref<SessionNote[]>([])
const showCharacterSheet = ref(false)
const sheetKey = ref(0)

// Toast states
const showToast = ref(false)
const toastMessage = ref('')
const toastVariant = ref<'success' | 'error' | 'warning' | 'info'>('success')

// ============================================
// Methods
// ============================================
const loadCampaignData = async () => {
  try {
    loading.value = true
    console.log('PLAYER.VUE: Carregando dados da campanha...', campaignId)
    
    const { getCampaignById } = useCampaign()
    const campaignData = await getCampaignById(campaignId)
    
    if (campaignData) {
      campaign.value = {
        id: campaignData.id,
        name: campaignData.name,
        description: campaignData.description || 'Sem descrição',
        masterId: campaignData.master_id,
        createdAt: new Date(campaignData.created_at)
      }

      const userPlayer = campaignData.campaign_players?.find(
        (player: any) => player.user_id === user?.value?.id
      )
      
      if (userPlayer) {
        myCharacter.value = {
          user_id: userPlayer.user_id,
          character_name: userPlayer.character_name,
          name: userPlayer.character_name,
          sheet: userPlayer.sheet || null,
          role: userPlayer.role,
          joined_at: userPlayer.joined_at
        }
      }

      console.log('PLAYER.VUE: Dados carregados:', {
        campaign: campaign.value,
        myCharacter: myCharacter.value
      })
    }

    sessionNotes.value = []

    loading.value = false
  } catch (error) {
    console.error('Erro ao carregar dados da campanha:', error)
    loading.value = false
  }
}

const goBackToDashboard = () => {
  navigateTo('/dashboard')
}

const goToLiveGame = () => {
  navigateTo(`/campaign/${campaignId}/live`)
}

const openCharacterSheet = () => {
  showCharacterSheet.value = true
}

const closeCharacterSheet = async () => {
  console.log('CLOSE: closeCharacterSheet chamado')
  showCharacterSheet.value = false
  await loadCampaignData()
  sheetKey.value++
}

const saveCharacterSheet = async (updatedPlayer: any) => {
  console.log('SAVE: saveCharacterSheet chamado')
  console.log('SAVE: Dados recebidos:', updatedPlayer)
  try {
    await savePlayerSheet(campaignId, user.value!.id, updatedPlayer.sheet)
    
    showCharacterSheet.value = false
    
    toastMessage.value = 'Ficha salva com sucesso!'
    toastVariant.value = 'success'
    showToast.value = true
    
    setTimeout(() => {
      showToast.value = false
    }, 4000)
    
    await loadCampaignData()
    sheetKey.value++
    
  } catch (error: any) {
    console.error('Erro ao salvar ficha:', error)
    toastMessage.value = 'Erro ao salvar ficha: ' + error.message
    toastVariant.value = 'error'
    showToast.value = true
    
    setTimeout(() => {
      showToast.value = false
    }, 4000)
  }
}

const createCharacter = () => {
  openCharacterSheet()
}

const editCharacter = () => {
  openCharacterSheet()
}

const hideToast = () => {
  showToast.value = false
}

const viewRules = () => {
  console.log('View rules')
}

const calculateAttributeSum = (attributes: any) => {
  if (!attributes) return 0
  return Object.values(attributes).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
}

const getCharacterInitials = (name: string) => {
  const words = name.split(' ').filter((word: string) => word.length > 0)
  if (words.length >= 2 && words[0]?.[0] && words[1]?.[0]) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return words[0]?.[0]?.toUpperCase() || '?'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getStrongestAttribute = () => {
  if (!myCharacter.value?.sheet?.attributes) return 'N/A'
  
  const attrs = myCharacter.value.sheet.attributes
  const physical = calculateAttributeSum(attrs.physical)
  const social = calculateAttributeSum(attrs.social)
  const mental = calculateAttributeSum(attrs.mental)
  
  const max = Math.max(physical, social, mental)
  if (max === physical) return 'Físico'
  if (max === social) return 'Social'
  return 'Mental'
}

const getWeakestAttribute = () => {
  if (!myCharacter.value?.sheet?.attributes) return 'N/A'
  
  const attrs = myCharacter.value.sheet.attributes
  const physical = calculateAttributeSum(attrs.physical)
  const social = calculateAttributeSum(attrs.social)
  const mental = calculateAttributeSum(attrs.mental)
  
  const min = Math.min(physical, social, mental)
  if (min === physical) return 'Físico'
  if (min === social) return 'Social'
  return 'Mental'
}

const avatarInput = ref<HTMLInputElement | null>(null)

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    toastMessage.value = 'Por favor, selecione apenas arquivos de imagem'
    toastVariant.value = 'error'
    showToast.value = true
    setTimeout(() => showToast.value = false, 4000)
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    toastMessage.value = 'Imagem muito grande. Máximo 2MB'
    toastVariant.value = 'error'
    showToast.value = true
    setTimeout(() => showToast.value = false, 4000)
    return
  }
  
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      
      if (myCharacter.value?.sheet) {
        myCharacter.value.sheet.avatar = base64
        
        await savePlayerSheet(campaignId, user.value!.id, myCharacter.value.sheet)
        
        toastMessage.value = 'Avatar atualizado com sucesso!'
        toastVariant.value = 'success'
        showToast.value = true
        setTimeout(() => showToast.value = false, 4000)
      }
    }
    reader.readAsDataURL(file)
  } catch (error: any) {
    console.error('Erro ao fazer upload do avatar:', error)
    toastMessage.value = 'Erro ao atualizar avatar'
    toastVariant.value = 'error'
    showToast.value = true
    setTimeout(() => showToast.value = false, 4000)
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  loadCampaignData()
})

// ============================================
// SEO
// ============================================
const campaignTitle = computed(() => campaign.value?.name || 'Carregando...')

useSeoMeta({
  title: computed(() => `Campanha - ${campaignTitle.value}`),
  description: 'Dashboard do jogador para campanha de Vampire: The Masquerade'
})
</script>

<style scoped>
/* ======================================================
   DARK FANTASY UI – Player Dashboard
   ====================================================== */
.df-player {
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

  background: var(--df-bg-deep);
  background-image: radial-gradient(ellipse at 20% 50%, rgba(127, 29, 29, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(220, 38, 38, 0.04) 0%, transparent 50%);
  color: var(--df-text-silver);
}

/* ─── Header ─── */
.df-header {
  background: var(--df-bg-deep);
  border-bottom: 1px solid var(--df-border-red);
  box-shadow: 0 2px 20px rgba(0,0,0,0.5), 0 1px 0 var(--df-border-silver);
}

.df-brand-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--df-accent-red);
  text-shadow: 0 0 20px var(--df-glow-red);
  letter-spacing: 0.04em;
}

/* ─── Section Title ─── */
.df-section-title {
  color: var(--df-accent-red);
  font-weight: 800;
  text-shadow: 0 0 16px var(--df-glow-red);
}

/* ─── Buttons ─── */
.df-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, var(--df-accent-crimson), #450a0a);
  border: 1px solid var(--df-border-red);
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.df-btn-primary:hover {
  background: linear-gradient(135deg, #b91c1c, #7f1d1d);
  box-shadow: 0 0 16px var(--df-glow-red);
  color: #fff;
}

.df-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: 1px solid var(--df-border-silver);
  color: var(--df-text-silver);
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.df-btn-outline:hover {
  border-color: var(--df-accent-red);
  color: #fca5a5;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.15);
}

.df-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  color: var(--df-text-silver);
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.df-btn-ghost:hover {
  color: var(--df-accent-red);
  border-color: var(--df-border-red);
  background: rgba(127, 29, 29, 0.1);
}

/* ─── Cards ─── */
.df-card {
  position: relative;
  background: var(--df-bg-card);
  border: 1px solid var(--df-border-red);
  box-shadow: 0 0 0 1px var(--df-border-silver), inset 0 1px 6px rgba(0,0,0,0.5);
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.df-hero-card {
  position: relative;
  background: var(--df-bg-card);
  background-image: radial-gradient(ellipse at 80% 20%, rgba(127, 29, 29, 0.1) 0%, transparent 60%);
  border: 2px solid var(--df-border-red);
  box-shadow: 0 0 0 1px var(--df-border-silver), 0 0 40px rgba(220, 38, 38, 0.08);
  border-radius: 0.75rem;
  padding: 2rem;
}

.df-inner-card {
  background: rgba(5, 5, 16, 0.5);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(127, 29, 29, 0.3);
}

.df-stat-card {
  background: var(--df-bg-card);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--df-border-red);
  text-align: center;
  box-shadow: inset 0 1px 4px rgba(0,0,0,0.4);
}

/* ─── Corner Decorations ─── */
.df-card-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 2;
  pointer-events: none;
}
.df-card-corner::before,
.df-card-corner::after {
  content: '';
  position: absolute;
  background: var(--df-accent-crimson);
}
.df-card-corner::before { width: 16px; height: 1px; }
.df-card-corner::after  { width: 1px;  height: 16px; }
.df-card-corner-tl { top: -1px; left: -1px; }
.df-card-corner-tl::before { top: 0; left: 0; }
.df-card-corner-tl::after  { top: 0; left: 0; }
.df-card-corner-tr { top: -1px; right: -1px; }
.df-card-corner-tr::before { top: 0; right: 0; }
.df-card-corner-tr::after  { top: 0; right: 0; }
.df-card-corner-bl { bottom: -1px; left: -1px; }
.df-card-corner-bl::before { bottom: 0; left: 0; }
.df-card-corner-bl::after  { bottom: 0; left: 0; }
.df-card-corner-br { bottom: -1px; right: -1px; }
.df-card-corner-br::before { bottom: 0; right: 0; }
.df-card-corner-br::after  { bottom: 0; right: 0; }

/* ─── Avatar ─── */
.df-avatar-frame {
  position: relative;
  border-radius: 0.75rem;
  padding: 3px;
  background: linear-gradient(135deg, var(--df-accent-red), var(--df-border-silver), var(--df-accent-crimson));
  box-shadow: 0 0 14px var(--df-glow-red);
  animation: df-pulse 4s ease-in-out infinite;
  width: 132px;
  height: 132px;
}
.df-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 0.625rem;
  overflow: hidden;
  background: linear-gradient(135deg, #450a0a, #1a0505);
  display: flex;
  align-items: center;
  justify-content: center;
}
.df-avatar-overlay {
  position: absolute;
  inset: 3px;
  border-radius: 0.625rem;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.df-avatar-frame:hover .df-avatar-overlay {
  opacity: 1;
}
@keyframes df-pulse {
  0%, 100% { box-shadow: 0 0 14px var(--df-glow-red); }
  50%      { box-shadow: 0 0 24px var(--df-glow-red), 0 0 40px rgba(220, 38, 38, 0.1); }
}

/* ─── Text Helpers ─── */
.df-text-muted { color: #6b6b80; }
.df-text-silver { color: var(--df-text-silver); }

/* ─── Condition Badge ─── */
.df-condition-badge {
  background: rgba(217, 119, 6, 0.1);
  border: 1px solid rgba(217, 119, 6, 0.3);
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  color: #fbbf24;
}

/* ─── Spinner ─── */
.df-spinner {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 2px solid var(--df-border-red);
  border-top-color: var(--df-accent-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Scrollbar ─── */
.df-player::-webkit-scrollbar { width: 6px; }
.df-player::-webkit-scrollbar-track { background: var(--df-bg-deep); }
.df-player::-webkit-scrollbar-thumb { background: var(--df-border-red); border-radius: 3px; }
.df-player::-webkit-scrollbar-thumb:hover { background: var(--df-accent-red); }
</style>
