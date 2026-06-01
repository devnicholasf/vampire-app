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
          <button
            :class="isGameLive ? 'df-btn-primary' : 'df-btn-primary opacity-50 cursor-not-allowed'"
            :disabled="!isGameLive"
            :title="!isGameLive ? 'O Mestre ainda não iniciou a sessão' : ''"
            @click="goToLiveGame"
          >
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
      :campaign-id="campaignId"
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
                    <p class="text-3xl font-bold text-amber-500 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.physical) }}
                    </p>
                    <p class="text-xs text-white uppercase flex items-center justify-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/></svg>
                      Físico
                    </p>
                  </div>
                  <div class="df-stat-card">
                    <p class="text-3xl font-bold text-amber-500 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.social) }}
                    </p>
                    <p class="text-xs text-white uppercase flex items-center justify-center gap-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
                      Social
                    </p>
                  </div>
                  <div class="df-stat-card">
                    <p class="text-3xl font-bold text-amber-500 mb-1">
                      {{ calculateAttributeSum(myCharacter.sheet.attributes?.mental) }}
                    </p>
                    <p class="text-xs text-white uppercase flex items-center justify-center gap-1">
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
                    <svg class="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
                    Fome Atual
                  </span>
                  <span class="text-2xl font-bold text-red-600">{{ myCharacter.sheet.hunger || 1 }} / 5</span>
                </div>
                <div class="flex gap-1">
                  <div v-for="i in 5" :key="i" class="flex-1 h-3 rounded-sm transition-all" :class="i <= (myCharacter.sheet.hunger || 1) ? 'bg-red-600' : 'bg-[var(--df-bg-input)]'"></div>
                </div>
              </div>

              <!-- Humanity -->
              <div class="df-inner-card">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold df-text-silver flex items-center gap-2">
                    <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    Humanidade
                  </span>
                  <span class="text-2xl font-bold text-amber-600">{{ myCharacter.sheet.humanity || 7 }} / 10</span>
                </div>
                <div class="w-full bg-[var(--df-bg-input)] rounded-full h-3">
                  <div class="bg-amber-600 h-3 rounded-full transition-all" :style="{ width: `${((myCharacter.sheet.humanity || 7) / 10) * 100}%` }"></div>
                </div>
              </div>

              <!-- Vitality -->
              <div class="df-inner-card">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold df-text-silver flex items-center gap-2">
                    <svg class="w-4 h-4 text-red-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
                    Vitalidade
                  </span>
                  <span class="text-2xl font-bold text-red-700">{{ myCharacter.sheet.vitality || 1 }} / 10</span>
                </div>
                <div class="w-full bg-[var(--df-bg-input)] rounded-full h-3">
                  <div class="bg-red-700 h-3 rounded-full transition-all" :style="{ width: `${((myCharacter.sheet.vitality || 1) / 10) * 100}%` }"></div>
                </div>
              </div>

              <!-- Willpower -->
              <div class="df-inner-card">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-semibold df-text-silver flex items-center gap-2">
                    <svg class="w-4 h-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Força de Vontade
                  </span>
                  <span class="text-2xl font-bold text-violet-600">{{ myCharacter.sheet.willpower || 3 }} / 10</span>
                </div>
                <div class="w-full bg-[var(--df-bg-input)] rounded-full h-3">
                  <div class="bg-violet-600 h-3 rounded-full transition-all" :style="{ width: `${((myCharacter.sheet.willpower || 3) / 10) * 100}%` }"></div>
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

              <!-- Convictions & Pillars -->
              <div class="df-inner-card">
                <p class="text-sm font-semibold df-text-silver mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-4.35-9-7.5A5.5 5.5 0 0112 6a5.5 5.5 0 019 7.5C18.5 16.65 12 21 12 21z"/></svg>
                  Pilares & Convicções
                </p>

                <ul v-if="convictionPillarPairs.length > 0" class="space-y-2">
                  <li
                    v-for="(item, idx) in convictionPillarPairs"
                    :key="`conviction-${idx}`"
                    class="text-sm text-[var(--df-text-gold)] leading-relaxed"
                  >
                    • {{ item }}
                  </li>
                </ul>

                <p v-else class="df-text-muted text-sm italic">Nenhuma convicção/pilar definido na ficha.</p>
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
            <!-- My Events -->
            <div class="df-card">
              <h2 class="df-section-title text-lg flex items-center gap-2 mb-4">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Meus Eventos
              </h2>

              <div v-if="myEvents.length > 0">
                <ol class="relative border-l border-red-900/40 space-y-6 ml-3">
                  <li
                    v-for="(event, index) in displayedMyEvents"
                    :key="event.id"
                    class="ml-6"
                  >
                    <span
                      class="absolute flex items-center justify-center rounded-full ring-2 ring-[var(--df-bg-card)]"
                      :class="index === 0 ? '-left-[14px] w-7 h-7' : '-left-[11px] w-[22px] h-[22px]'"
                      :style="`background: ${getEventTypeColor(event.type)}18; border: 1px solid ${getEventTypeColor(event.type)}50;`"
                    >
                      <span
                        v-if="index === 0"
                        class="player-event-dot-ripple absolute inset-0 rounded-full"
                        :style="`background:${getEventTypeColor(event.type)};`"
                      />
                      <span
                        class="rounded-full relative z-10 player-event-dot-core"
                        :class="index === 0 ? 'w-[11px] h-[11px]' : 'w-2 h-2'"
                        :style="`background:${getEventTypeColor(event.type)};`"
                      />
                    </span>

                    <div class="df-inner-card hover:border-[var(--df-border-silver)] transition-colors">
                      <div class="flex items-start justify-between gap-3 mb-1">
                        <h3 class="font-semibold df-text-silver">{{ event.title }}</h3>
                        <span
                          class="shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-semibold tracking-wide"
                          :style="`color:${getEventTypeColor(event.type)}; border-color:${getEventTypeColor(event.type)}55; background:${getEventTypeColor(event.type)}14;`"
                        >
                          {{ getEventTypeLabel(event.type) }}
                        </span>
                      </div>

                      <p v-if="event.description" class="df-text-muted text-sm mb-2">
                        {{ event.description }}
                      </p>

                      <p class="text-xs df-text-muted flex items-center gap-1">
                        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {{ formatEventDate(event.occurredAt) }}
                      </p>
                    </div>
                  </li>
                </ol>

                <div v-if="myEvents.length > displayedMyEvents.length" class="mt-5 flex justify-center">
                  <button class="df-btn-outline" @click="loadMoreMyEvents">
                    Carregar mais eventos
                  </button>
                </div>
              </div>

              <div v-else class="text-center py-8">
                <svg class="w-12 h-12 text-red-900 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                <p class="df-text-muted">Nenhum evento pessoal registrado ainda</p>
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
                <!-- Live game button — disabled when master hasn't started the session -->
                <div class="relative group">
                  <button
                    :class="isGameLive ? 'df-btn-primary w-full justify-center' : 'df-btn-primary w-full justify-center opacity-50 cursor-not-allowed'"
                    :disabled="!isGameLive"
                    @click="goToLiveGame"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
                    <span v-if="isGameLive" class="flex items-center gap-1.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>
                      Entrar no Jogo Ao Vivo
                    </span>
                    <span v-else>Jogo Ao Vivo Indisponível</span>
                  </button>
                  <!-- Tooltip quando sessão não ativa -->
                  <div
                    v-if="!isGameLive"
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none"
                  >
                    <div class="rounded border border-[#4a4a5a] px-3 py-2 text-xs text-center whitespace-nowrap"
                         style="background:#0d0d20; color:#c4c4d4; box-shadow:0 4px 12px rgba(0,0,0,0.6)">
                      O Mestre ainda não iniciou a sessão
                    </div>
                    <div class="w-2 h-2 border-r border-b border-[#4a4a5a] rotate-45 mx-auto -mt-1"
                         style="background:#0d0d20"/>
                  </div>
                </div>
                <button @click="editCharacter" class="df-btn-outline w-full justify-start">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar Personagem
                </button>
              </div>
            </div>

            <div class="df-card">
              <div class="df-card-corner df-card-corner-tl"></div>
              <div class="df-card-corner df-card-corner-tr"></div>
              <div class="df-card-corner df-card-corner-bl"></div>
              <div class="df-card-corner df-card-corner-br"></div>

              <h3 class="df-section-title text-base flex items-center gap-2 mb-4">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 6 4 10 4 14a8 8 0 0016 0c0-4-4-8-8-12z"/></svg>
                Perdição do Clã
              </h3>

              <div class="df-inner-card min-h-[220px] px-5 py-5 flex items-start">
                <p v-if="clanBanePenalty" class="text-[15px] leading-8 italic text-[var(--df-text-silver)]">
                  {{ clanBanePenalty }}
                </p>
                <p v-else class="text-sm italic text-[var(--df-text-muted)]">
                  Nenhuma perdição de clã disponível para este personagem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <DirectMessages />
  </div>
</template>

<script setup lang="ts">
// ============================================
// Vue imports
// ============================================
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

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
import { EVENT_TYPE_CONFIG, type EventType } from '~/composables/useEvents'
import { clanBanes } from '~/config/clanBanes'

// ============================================
// Explicit component imports
// ============================================
import PlayerSheet from '~/components/campaign/PlayerSheet.vue'
import BaseToast from '~/components/ui/BaseToast.vue'
import DirectMessages from '~/components/ui/DirectMessages.vue'
import { useLiveGame } from '~/composables/useLiveGame'
import { createClient } from '@supabase/supabase-js'

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

interface PlayerEvent {
  id: string
  title: string
  description: string | null
  type: string
  occurredAt: Date
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
const config = useRuntimeConfig()
const supabaseClient = createClient(config.public.supabaseUrl, config.public.supabaseKey)

const {
  isGameLive,
  fetchLiveGameState,
  subscribeToLiveGame,
} = useLiveGame()

// ============================================
// State
// ============================================
const loading = ref(true)
let liveStateChannel: ReturnType<typeof supabaseClient.channel> | null = null
let playerEventsChannel: ReturnType<typeof supabaseClient.channel> | null = null
const campaign = ref<Campaign | null>(null)
const myCharacter = ref<any>(null)
const myEvents = ref<PlayerEvent[]>([])
const MY_EVENTS_PAGE_SIZE = 3
const myEventsVisibleCount = ref(MY_EVENTS_PAGE_SIZE)
const showCharacterSheet = ref(false)
const sheetKey = ref(0)

// Toast states
const showToast = ref(false)
const toastMessage = ref('')
const toastVariant = ref<'success' | 'error' | 'warning' | 'info'>('success')

// ============================================
// Methods
// ============================================
const normalizePlayerName = (value: string | null | undefined) =>
  String(value || '').trim().toLowerCase()

const getCurrentCharacterNames = () => {
  const names = new Set<string>()
  const primaryName = normalizePlayerName(myCharacter.value?.character_name || myCharacter.value?.name)
  const sheetName = normalizePlayerName(myCharacter.value?.sheet?.name)

  if (primaryName) names.add(primaryName)
  if (sheetName) names.add(sheetName)

  return names
}

const loadMyEvents = async () => {
  try {
    const characterNames = getCurrentCharacterNames()
    if (characterNames.size === 0) {
      myEvents.value = []
      myEventsVisibleCount.value = MY_EVENTS_PAGE_SIZE
      return
    }

    const { data, error } = await supabaseClient
      .from('campaign_events')
      .select('id, title, description, type, occurred_at, player_names')
      .eq('campaign_id', campaignId)
      .order('occurred_at', { ascending: false })

    if (error) throw error

    const filtered = (data || []).filter((row: any) => {
      const playerNames: string[] = Array.isArray(row.player_names) ? row.player_names : []
      return playerNames.some((name) => characterNames.has(normalizePlayerName(name)))
    })

    myEvents.value = filtered.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? null,
      type: String(row.type || 'other'),
      occurredAt: new Date(row.occurred_at),
    }))
    myEventsVisibleCount.value = MY_EVENTS_PAGE_SIZE
  } catch (error) {
    console.error('Erro ao carregar eventos do jogador:', error)
    myEvents.value = []
    myEventsVisibleCount.value = MY_EVENTS_PAGE_SIZE
  }
}

const subscribeToMyEvents = () => {
  if (playerEventsChannel) {
    supabaseClient.removeChannel(playerEventsChannel)
    playerEventsChannel = null
  }

  playerEventsChannel = supabaseClient
    .channel(`player_events:${campaignId}:${user.value?.id || 'anon'}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'campaign_events', filter: `campaign_id=eq.${campaignId}` },
      async () => {
        await loadMyEvents()
      }
    )
    .subscribe()
}

const getEventTypeColor = (type: string) =>
  EVENT_TYPE_CONFIG[type as EventType]?.color ?? '#6b6b80'

const getEventTypeLabel = (type: string) =>
  (EVENT_TYPE_CONFIG[type as EventType]?.label ?? type).toUpperCase()

const formatEventDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const displayedMyEvents = computed(() =>
  myEvents.value.slice(0, myEventsVisibleCount.value)
)

const loadMoreMyEvents = () => {
  myEventsVisibleCount.value += MY_EVENTS_PAGE_SIZE
}

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

    await loadMyEvents()

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
  if (!isGameLive.value) return
  navigateTo(`/campaign/${campaignId}/live-player`)
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

const convictionPillarPairs = computed(() => {
  const raw = myCharacter.value?.sheet?.touchstonesConvictions

  if (!raw) return [] as string[]

  if (Array.isArray(raw)) {
    return raw
      .map((entry: any) => {
        const conviction = String(entry?.conviction || '').trim()
        const pillar = String(entry?.pillar || '').trim()
        if (!conviction && !pillar) return ''
        if (!pillar) return conviction
        if (!conviction) return pillar
        return `${conviction} (${pillar})`
      })
      .filter((entry: string) => entry.length > 0)
  }

  if (typeof raw === 'string') {
    const legacy = raw.trim()
    return legacy ? [legacy] : []
  }

  return [] as string[]
})

const clanBanePenalty = computed(() => {
  const clan = String(myCharacter.value?.sheet?.clan || '').trim()
  if (!clan) return ''

  const baneText = clanBanes[clan]
  if (!baneText) return ''

  const penaltyMatch = baneText.match(/Penalidade:\s*([\s\S]+)/i)
  if (penaltyMatch?.[1]) {
    return penaltyMatch[1].trim()
  }

  const disadvantageMatch = baneText.match(/Desvantagem:\s*([\s\S]+)/i)
  if (disadvantageMatch?.[1]) {
    return disadvantageMatch[1].trim()
  }

  return ''
})

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
onMounted(async () => {
  await loadCampaignData()

  // Check if the session is already live
  await fetchLiveGameState(campaignId)

  // Subscribe to realtime updates so the button reacts when master starts/stops
  liveStateChannel = subscribeToLiveGame(campaignId)
  subscribeToMyEvents()
})

onBeforeUnmount(() => {
  if (liveStateChannel) supabaseClient.removeChannel(liveStateChannel)
  if (playerEventsChannel) supabaseClient.removeChannel(playerEventsChannel)
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
  color: #ffffff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  letter-spacing: 0.04em;
}

/* ─── Section Title ─── */
.df-section-title {
  color: var(--df-text-gold);
  font-weight: 800;
  text-shadow: 0 0 16px rgba(212, 166, 71, 0.3);
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

/* ─── Player Events Timeline Dot Animations ─── */
@keyframes player-event-dot-core-breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.75; }
}

@keyframes player-event-dot-ripple-expand {
  0% { transform: scale(0.45); opacity: 0.55; }
  70% { opacity: 0.12; }
  100% { transform: scale(2.6); opacity: 0; }
}

.player-event-dot-core {
  animation: player-event-dot-core-breathe 3s ease-in-out infinite;
}

.player-event-dot-ripple {
  opacity: 0;
  animation: player-event-dot-ripple-expand 2.4s ease-out infinite;
}

/* ─── Scrollbar ─── */
.df-player::-webkit-scrollbar { width: 6px; }
.df-player::-webkit-scrollbar-track { background: var(--df-bg-deep); }
.df-player::-webkit-scrollbar-thumb { background: var(--df-border-red); border-radius: 3px; }
.df-player::-webkit-scrollbar-thumb:hover { background: var(--df-accent-red); }
</style>
