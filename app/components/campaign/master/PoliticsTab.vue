<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="df-section-title text-xl flex items-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"/><path d="M5 20V10l7-6 7 6v10"/><path d="M9 20v-6h6v6"/><path d="M3 10l9-7 9 7"/></svg>
        Mapa Político da Crônica
      </h3>
      <button @click="toggleAllEdit()" class="df-btn-ghost px-3 py-1.5 text-sm flex items-center gap-2">
        <svg v-if="!editMode" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        {{ editMode ? 'Visualizar' : 'Editar' }}
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION 1: Governo da Cidade (Hierarchy Tree)   -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-6">
          <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M5 16h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z"/></svg>
          <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Governo da Cidade</h4>
        </div>

        <!-- Hierarchy Tree -->
        <div v-if="politics.government.length > 0" class="hierarchy-tree-wrapper">
          <div class="hierarchy-tree">
            <template v-for="(tier, ti) in governmentByTier" :key="ti">
              <!-- Trunk connector between tiers -->
              <div v-if="ti > 0" class="tree-trunk">
                <div class="trunk-dot"></div>
              </div>

              <!-- Tier nodes -->
              <div class="tree-nodes" :class="{ multi: tier.roles.length > 1 }">
                <div v-for="(role, ri) in tier.roles" :key="ri" class="tree-node">
                  <div
                    class="node-card" :class="{ 'node-card-edit': editGovernment, 'cursor-pointer': !editGovernment && role.npcId }"
                    @click="!editGovernment && role.npcId ? viewingRole = role : null"
                  >
                    <!-- Avatar -->
                    <div class="node-avatar" :class="getTierAvatarClass(tier.tier)">
                      <img v-if="getNpcById(role.npcId)?.photo" :src="getNpcById(role.npcId)!.photo" class="w-full h-full object-cover rounded-full" alt="" />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-df-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                    </div>

                    <!-- Edit mode controls -->
                    <template v-if="editGovernment">
                      <select v-model="role.title" class="df-input text-xs mt-1 text-center">
                        <option value="">Cargo...</option>
                        <option v-for="t in governmentTitles" :key="t" :value="t">{{ t }}</option>
                      </select>
                      <select v-model="role.npcId" class="df-input text-xs mt-1">
                        <option value="">Selecionar NPC...</option>
                        <option v-for="npc in getAvailableNPCsForRole(role)" :key="npc.id" :value="npc.id">
                          {{ npc.name }}{{ npc.clan ? ` (${npc.clan})` : '' }}
                        </option>
                      </select>
                      <input v-model="role.note" class="df-input text-xs mt-1" placeholder="Nota..." />
                      <button @click="removeGovernmentRole(findRoleIndex(role))" class="mt-1.5 text-df-muted hover:text-df-red transition-colors">
                        <svg class="w-3.5 h-3.5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </template>

                    <!-- View mode info -->
                    <template v-else>
                      <span class="node-title" :class="getRoleColor(role.title)">{{ role.title || 'Cargo' }}</span>
                      <span class="node-name">{{ getNpcById(role.npcId)?.name || '—' }}</span>
                      <span v-if="getNpcById(role.npcId)?.clan" class="node-clan">{{ getNpcById(role.npcId)?.clan }}</span>
                      <span v-if="role.note" class="node-note">{{ role.note }}</span>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!editGovernment && politics.government.length === 0" class="text-center py-8 text-df-muted text-sm italic">
          <svg class="w-12 h-12 mx-auto mb-3 text-df-border-silver opacity-40" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M5 16h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z"/></svg>
          Nenhum cargo registrado. Clique em "Editar" para começar.
        </div>

        <button v-if="editGovernment" @click="addGovernmentRole" class="mt-4 w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-gold hover:text-df-gold transition-colors">
          + Adicionar Cargo
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION 2: Facções                              -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Facções</h4>
          </div>
          <button @click="editFactions = !editFactions" class="df-btn-ghost px-2.5 py-1 text-xs flex items-center gap-1.5">
            <svg v-if="!editFactions" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ editFactions ? 'Ver' : 'Editar' }}
          </button>
        </div>

        <div class="space-y-5">
          <div v-for="(faction, fi) in politics.factions" :key="fi" class="df-faction-card">
            <!-- ── EDIT MODE ── -->
            <template v-if="editFactions">
              <!-- Row 1: Name + Delete -->
              <div class="flex items-center gap-2 mb-2">
                <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ background: faction.color || '#dc2626' }"></span>
                <input v-model="faction.name" class="df-input text-sm font-bold flex-1" placeholder="Nome da facção" />
                <button @click="removeFaction(fi)" class="text-df-muted hover:text-df-red transition-colors flex-shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
              <!-- Row 2: Type + Color -->
              <div class="flex items-center gap-2 mb-3">
                <select v-model="faction.type" class="df-input text-xs flex-1">
                  <option value="independente">Independente</option>
                  <option value="anarquista">Anarquista</option>
                </select>
                <input v-model="faction.color" type="color" class="w-8 h-8 rounded cursor-pointer border border-df-border-silver bg-transparent flex-shrink-0" />
              </div>
              <textarea v-model="faction.description" class="df-input text-xs resize-none mb-3" rows="2" placeholder="Descrição / objetivos..." />

              <!-- Members edit -->
              <div class="border-t border-df-border-silver/30 pt-3">
                <h5 class="text-xs font-bold text-df-gold uppercase tracking-wider mb-2">Membros</h5>
                <div class="space-y-2">
                  <div v-for="(member, mi) in faction.members" :key="mi" class="flex items-start gap-2 p-2 rounded-lg border border-df-border-silver/20 bg-df-deep/50">
                    <!-- Avatar preview -->
                    <div class="w-10 h-10 rounded-full overflow-hidden border border-df-border-silver bg-df-input flex-shrink-0 flex items-center justify-center">
                      <img v-if="getMemberPhoto(member)" :src="getMemberPhoto(member)" class="w-full h-full object-cover" alt="" />
                      <svg v-else class="w-5 h-5 text-df-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div class="flex-1 space-y-1 min-w-0">
                      <div class="flex gap-1">
                        <select v-model="member.rank" class="df-input text-xs flex-1">
                          <option value="">Posto...</option>
                          <option v-for="r in getFactionRanks(faction)" :key="r" :value="r">{{ r }}</option>
                        </select>
                      </div>
                      <select v-model="member.npcId" class="df-input text-xs">
                        <option value="">— Personalizado —</option>
                        <option v-for="npc in campaignNPCs" :key="npc.id" :value="npc.id">
                          {{ npc.name }}{{ npc.clan ? ` (${npc.clan})` : '' }}
                        </option>
                      </select>
                      <template v-if="!member.npcId">
                        <input v-model="member.customName" class="df-input text-xs" placeholder="Nome do membro..." />
                        <div class="flex gap-1 items-center">
                          <input v-model="member.customPhoto" class="df-input text-xs flex-1" placeholder="URL da foto..." />
                          <label class="cursor-pointer text-df-muted hover:text-df-gold transition-colors flex-shrink-0 p-1">
                            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <input type="file" accept="image/*" class="hidden" @change="handleMemberPhotoUpload($event, member)" />
                          </label>
                        </div>
                      </template>
                    </div>
                    <button @click="removeFactionMember(faction, mi)" class="text-df-muted hover:text-df-red transition-colors flex-shrink-0 mt-1">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
                <button @click="addFactionMember(faction)" class="mt-2 w-full py-1.5 border border-dashed border-df-border-silver/50 rounded-lg text-df-muted text-xs hover:border-df-gold hover:text-df-gold transition-colors">
                  + Adicionar Membro
                </button>
              </div>
            </template>

            <!-- ── VIEW MODE ── -->
            <template v-else>
              <div class="flex items-center gap-2 mb-2">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: faction.color || '#dc2626' }"></span>
                <h5 class="text-white font-bold text-sm">{{ faction.name }}</h5>
                <span class="text-xs px-2 py-0.5 rounded-full border" :style="{ borderColor: (faction.color || '#dc2626') + '66', color: faction.color || '#dc2626' }">
                  {{ faction.type === 'anarquista' ? 'Anarquista' : 'Independente' }}
                </span>
              </div>
              <p v-if="faction.description" class="text-df-muted text-xs italic mb-3">{{ faction.description }}</p>

              <!-- Faction Hierarchy Tree -->
              <div v-if="faction.members.length > 0" class="hierarchy-tree-wrapper">
                <div class="hierarchy-tree">
                  <template v-for="(tier, ti) in getFactionMembersByTier(faction)" :key="ti">
                    <div v-if="ti > 0" class="tree-trunk">
                      <div class="trunk-dot" :style="{ background: faction.color || '#d4a647' }"></div>
                    </div>
                    <div class="tree-nodes" :class="{ multi: tier.members.length > 1 }">
                      <div v-for="(member, mi) in tier.members" :key="mi" class="tree-node">
                        <div class="node-card cursor-pointer" @click="viewFactionMember(faction, member)">
                          <div class="node-avatar" :class="ti === 0 ? 'avatar-faction-leader' : 'avatar-default'" :style="ti === 0 ? { borderColor: faction.color, boxShadow: `0 0 16px ${faction.color}40` } : {}">
                            <img v-if="getMemberPhoto(member)" :src="getMemberPhoto(member)" class="w-full h-full object-cover rounded-full" alt="" />
                            <div v-else class="w-full h-full flex items-center justify-center">
                              <svg class="w-6 h-6 text-df-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                          </div>
                          <span class="node-title" :style="{ color: faction.color || '#dc2626' }">{{ member.rank }}</span>
                          <span class="node-name">{{ getMemberName(member) }}</span>
                          <span v-if="member.npcId && getNpcById(member.npcId)?.clan" class="node-clan">{{ getNpcById(member.npcId)?.clan }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <div v-else class="text-center py-4 text-df-muted text-xs italic">
                Nenhum membro registrado.
              </div>
            </template>
          </div>
        </div>

        <button v-if="editFactions" @click="addFaction" class="mt-3 w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-gold hover:text-df-gold transition-colors">
          + Adicionar Facção
        </button>

        <!-- Empty state -->
        <div v-if="!editFactions && politics.factions.length === 0" class="text-center py-6 text-df-muted text-sm italic">
          Nenhuma facção registrada. Clique em "Editar" para começar.
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION 3: Relações (Grafo Interativo)          -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Relações</h4>
          </div>
          <button @click="editRelations = !editRelations" class="df-btn-ghost px-2.5 py-1 text-xs flex items-center gap-1.5">
            <svg v-if="!editRelations" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ editRelations ? 'Ver' : 'Editar' }}
          </button>
        </div>

        <!-- ── Filters ── -->
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <label v-for="rt in relationTypes" :key="rt.key" class="rel-filter-label" :style="{ '--filter-color': rt.color }">
            <input type="checkbox" v-model="relFilters[rt.key]" class="rel-filter-check" />
            <span class="rel-filter-box" :style="relFilters[rt.key] ? { background: rt.color, borderColor: rt.color } : {}"></span>
            <span class="text-xs font-semibold uppercase tracking-wider" :style="{ color: relFilters[rt.key] ? rt.color : '#6b6b80' }">{{ rt.label }}</span>
          </label>
          <div class="ml-auto">
            <button @click="showSecretRelations = !showSecretRelations" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs uppercase tracking-wider transition-all" :class="showSecretRelations ? 'bg-purple-700 border border-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.3)]' : 'bg-purple-900/60 border border-purple-700/60 text-white hover:bg-purple-700 hover:shadow-[0_0_12px_rgba(147,51,234,0.3)]'">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>{{ showSecretRelations ? 'Ocultar secretas' : 'Mostrar secretas' }}</span>
            </button>
          </div>
        </div>

        <!-- ── VIEW MODE: Node Graph ── -->
        <template v-if="!editRelations">
          <div v-if="visibleRelations.length > 0" class="rel-graph-wrapper">
            <!-- One graph per unique NPC that has relations -->
            <div v-for="npcId in graphCenterNpcs" :key="npcId" class="rel-graph-row">
              <div class="rel-graph-center-label">
                <div class="rel-graph-avatar rel-graph-avatar-center">
                  <img v-if="getNpcById(npcId)?.photo" :src="getNpcById(npcId)!.photo" class="w-full h-full object-cover rounded-full" alt="" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-df-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </div>
                <span class="text-xs text-white font-semibold mt-1 text-center leading-tight max-w-[80px] truncate">{{ getNpcById(npcId)?.name || '—' }}</span>
              </div>

              <!-- Connected NPCs -->
              <div class="rel-graph-connections">
                <div v-for="(conn, ci) in getRelationsForNpc(npcId)" :key="ci" class="rel-graph-link">
                  <!-- Line -->
                  <div class="rel-graph-line" :class="getRelLineClass(conn.relation)" :style="{ '--rel-color': getRelColor(conn.relation.type) }" @mouseenter="hoveredRelation = conn.relation" @mouseleave="hoveredRelation = null"></div>
                  <!-- Target avatar -->
                  <div class="rel-graph-target">
                    <div class="rel-graph-avatar" :style="{ borderColor: getRelColor(conn.relation.type) }">
                      <img v-if="getNpcById(conn.targetId)?.photo" :src="getNpcById(conn.targetId)!.photo" class="w-full h-full object-cover rounded-full" alt="" />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-df-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    </div>
                    <span class="text-[10px] text-df-silver text-center leading-tight max-w-[70px] truncate">{{ getNpcById(conn.targetId)?.name || '—' }}</span>
                    <svg v-if="conn.relation.secret" class="w-3 h-3 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  </div>

                  <!-- Tooltip -->
                  <div v-if="hoveredRelation === conn.relation" class="rel-tooltip">
                    <div class="flex items-center gap-1.5 mb-1">
                      <span class="w-2 h-2 rounded-full" :style="{ background: getRelColor(conn.relation.type) }"></span>
                      <span class="text-xs font-bold" :style="{ color: getRelColor(conn.relation.type) }">{{ conn.relation.name || getRelLabel(conn.relation.type) }}</span>
                      <span v-if="conn.relation.secret" class="flex items-center gap-0.5 text-[9px] text-purple-400 ml-auto">
                        <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                        Secreta
                      </span>
                    </div>
                    <div class="text-[10px] text-df-silver space-y-0.5">
                      <p><span class="text-df-gold">Nível:</span> {{ getStrengthLabel(conn.relation.strength) }}</p>
                      <p v-if="conn.relation.since"><span class="text-df-gold">Desde:</span> {{ conn.relation.since }}</p>
                      <p v-if="conn.relation.reason"><span class="text-df-gold">Nota:</span> {{ conn.relation.reason }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Secret relations banner -->
          <div v-if="secretRelationsCount > 0 && !showSecretRelations" class="mt-3 flex items-center gap-2 p-2.5 rounded-lg border border-purple-800/40 bg-purple-950/20">
            <svg class="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span class="text-xs text-purple-300">{{ secretRelationsCount }} relação(ões) secreta(s) oculta(s)</span>
            <button @click="showSecretRelations = true" class="ml-auto text-xs text-purple-400 hover:text-purple-200 underline transition-colors">Revelar</button>
          </div>

          <!-- Empty state -->
          <div v-if="visibleRelations.length === 0 && politics.relations.length === 0" class="text-center py-6 text-df-muted text-sm italic">
            Nenhuma relação registrada. Clique em "Editar" para começar.
          </div>
          <div v-else-if="visibleRelations.length === 0" class="text-center py-4 text-df-muted text-sm italic">
            Nenhuma relação visível com os filtros atuais.
          </div>
        </template>

        <!-- ── EDIT MODE: Relation Cards ── -->
        <template v-else>
          <div class="space-y-3">
            <div v-for="(rel, ri) in politics.relations" :key="ri" class="rel-edit-card" :class="getRelBorderClass(rel.type)">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" :style="{ background: getRelColor(rel.type) }"></span>
                  <span class="text-xs font-bold uppercase tracking-wider" :style="{ color: getRelColor(rel.type) }">{{ getRelLabel(rel.type) }}</span>
                  <span v-if="rel.secret" class="flex items-center gap-1 text-[10px] text-purple-400">
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    Secreta
                  </span>
                </div>
                <button @click="removeRelation(rel)" class="text-df-muted hover:text-df-red transition-colors">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
              <!-- Row 1: Type + Strength + Secret -->
              <div class="flex gap-2 mb-2">
                <select v-model="rel.type" class="df-input text-xs flex-1">
                  <option value="alliance">Aliança</option>
                  <option value="hatred">Inimizade</option>
                  <option value="tension">Tensão</option>
                </select>
                <select v-model="rel.strength" class="df-input text-xs flex-1">
                  <option value="strong">Forte</option>
                  <option value="medium">Média</option>
                  <option value="weak">Fraca</option>
                </select>
                <button @click="toggleRelSecret(rel)" class="df-btn-primary flex-shrink-0 px-2.5 py-1 text-[10px] gap-1.5">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Secreta
                </button>
              </div>
              <!-- Row 2: NPCs -->
              <div class="flex items-center gap-2 mb-2">
                <select v-model="rel.fromNpcId" class="df-input text-xs flex-1">
                  <option value="">— Selecionar NPC —</option>
                  <option v-for="npc in campaignNPCs" :key="npc.id" :value="npc.id">{{ npc.name }}{{ npc.clan ? ` (${npc.clan})` : '' }}</option>
                </select>
                <svg class="w-4 h-4 text-df-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                <select v-model="rel.toNpcId" class="df-input text-xs flex-1">
                  <option value="">— Selecionar NPC —</option>
                  <option v-for="npc in campaignNPCs" :key="npc.id" :value="npc.id">{{ npc.name }}{{ npc.clan ? ` (${npc.clan})` : '' }}</option>
                </select>
              </div>
              <!-- Row 3: Name + Since -->
              <div class="flex gap-2 mb-2">
                <input v-model="rel.name" class="df-input text-xs" style="flex: 3 1 0%" placeholder="Nome da relação (Se houver)..." />
                <input v-model="rel.since" class="df-input text-xs" style="flex: 1 1 0%" placeholder="Desde... (Ano)" />
              </div>
              <!-- Row 4: Reason -->
              <textarea v-model="rel.reason" class="df-input text-xs resize-none" rows="2" placeholder="Observações / justificativa..." />
              <!-- Toggle secret visibility -->
              <div v-if="rel.secret" class="mt-2 flex items-center gap-2">
                <button @click="toggleRelSecret(rel)" class="text-[10px] text-purple-400 hover:text-purple-200 underline transition-colors">
                  Tornar pública (revelada aos jogadores)
                </button>
              </div>
            </div>
          </div>

          <button @click="addRelation" class="mt-3 w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-gold hover:text-df-gold transition-colors">
            + Adicionar Relação
          </button>
        </template>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- SECTION 4: Influência por Território            -->
    <!-- ═══════════════════════════════════════════════ -->
    <div class="df-card">
      <div class="df-card-corner df-card-corner-tl"></div>
      <div class="df-card-corner df-card-corner-tr"></div>
      <div class="df-card-corner df-card-corner-bl"></div>
      <div class="df-card-corner df-card-corner-br"></div>
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <h4 class="text-lg font-bold text-df-gold uppercase tracking-wider">Influência por Território</h4>
          </div>
          <button @click="editTerritories = !editTerritories" class="df-btn-ghost px-2.5 py-1 text-xs flex items-center gap-1.5">
            <svg v-if="!editTerritories" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ editTerritories ? 'Ver' : 'Editar' }}
          </button>
        </div>

        <div class="space-y-3">
          <div v-for="(territory, ti) in politics.territories" :key="ti" class="df-territory-card">
            <div class="flex items-center justify-between mb-2">
              <template v-if="editTerritories">
                <input v-model="territory.name" class="df-input text-sm font-bold flex-1 mr-2" placeholder="Nome do território" />
                <button @click="removeTerritory(ti)" class="text-df-muted hover:text-df-red transition-colors flex-shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </template>
              <h5 v-else class="text-white font-bold text-sm">{{ territory.name }}</h5>
            </div>

            <template v-if="editTerritories">
              <input v-model="territory.controlledBy" class="df-input text-xs mb-1" placeholder="Controlado por..." />
              <textarea v-model="territory.description" class="df-input text-xs resize-none" rows="2" placeholder="Descrição do território e seu significado..."></textarea>
              <div class="flex items-center gap-2 mt-2">
                <label class="text-xs text-df-muted">Nível de controle:</label>
                <div class="flex gap-1">
                  <button
                    v-for="n in 5" :key="n" type="button"
                    @click="territory.controlLevel = n"
                    class="w-5 h-5 rounded-full border transition-all"
                    :class="n <= (territory.controlLevel || 0) ? 'bg-df-red border-df-red' : 'bg-transparent border-df-border-silver hover:border-df-red'"
                  ></button>
                </div>
              </div>
            </template>
            <template v-else>
              <p v-if="territory.controlledBy" class="text-df-silver text-xs mb-1">
                <span class="text-df-gold">Domínio:</span> {{ territory.controlledBy }}
              </p>
              <p v-if="territory.description" class="text-df-muted text-xs italic mb-2">{{ territory.description }}</p>
              <div v-if="territory.controlLevel" class="flex items-center gap-1">
                <span class="text-xs text-df-muted mr-1">Controle:</span>
                <span v-for="n in 5" :key="n" class="w-3 h-3 rounded-full border" :class="n <= territory.controlLevel ? 'bg-df-red border-df-red shadow-sm shadow-red-900/50' : 'bg-transparent border-df-border-silver'"></span>
              </div>
            </template>
          </div>
        </div>

        <button v-if="editTerritories" @click="addTerritory" class="mt-3 w-full py-2 border border-dashed border-df-border-silver rounded-lg text-df-muted text-sm hover:border-df-gold hover:text-df-gold transition-colors">
          + Adicionar Território
        </button>

        <!-- Empty state -->
        <div v-if="!editTerritories && politics.territories.length === 0" class="text-center py-6 text-df-muted text-sm italic">
          Nenhum território registrado. Clique em "Editar" para começar.
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- NPC Details popup (from political map)           -->
    <!-- ═══════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="viewingRole" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" @click.self="viewingRole = null">
        <div class="npc-detail-modal w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>

          <div class="relative z-10 overflow-y-auto df-scrollbar p-6" v-if="viewingNPC">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-df-gold" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M5 16h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z"/></svg>
                Membro do Governo
              </h3>
              <button @click="viewingRole = null" class="npc-detail-close">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Profile Header -->
            <div class="flex items-center gap-6 pb-6 border-b border-df-border-red/50">
              <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-df-border-red bg-df-input flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-900/30">
                <img v-if="viewingNPC.photo" :src="viewingNPC.photo" :alt="viewingNPC.name" class="w-full h-full object-cover" />
                <svg v-else class="w-14 h-14 text-df-red/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4C7 4 3 7.5 3 11c0 2 1.5 4 3 5l1 4 2-3h6l2 3 1-4c1.5-1 3-3 3-5 0-3.5-4-7-9-7z"/></svg>
              </div>
              <div>
                <h4 class="text-2xl font-bold text-white">{{ viewingNPC.name }}</h4>
                <p v-if="viewingNPC.clan" class="text-df-red font-medium text-lg">{{ viewingNPC.clan }}</p>
                <p v-if="viewingNPC.generation" class="text-sm text-df-muted">{{ viewingNPC.generation }}ª Geração</p>
                <!-- Government role badge -->
                <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-df-gold/40 bg-df-gold/10">
                  <svg class="w-3.5 h-3.5 text-df-gold" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M5 16h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z"/></svg>
                  <span class="text-df-gold text-xs font-bold uppercase tracking-wider">{{ viewingRole.title }}</span>
                </div>
              </div>
            </div>

            <!-- Note -->
            <div v-if="viewingRole.note" class="mt-5">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-2">Nota Política</h5>
              <p class="text-sm text-df-silver leading-relaxed italic">{{ viewingRole.note }}</p>
            </div>

            <!-- Bio -->
            <div class="mt-5">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-2">Biografia</h5>
              <p class="text-sm text-df-silver leading-relaxed">{{ viewingNPC.bio || 'Nenhuma biografia definida.' }}</p>
            </div>

            <!-- Key Points -->
            <div v-if="viewingNPC.keyPoints && viewingNPC.keyPoints.length > 0" class="mt-5">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-3">Pontos Chave</h5>
              <ul class="space-y-2">
                <li v-for="point in viewingNPC.keyPoints" :key="point" class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-df-red mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/></svg>
                  <span class="text-sm text-df-silver">{{ point }}</span>
                </li>
              </ul>
            </div>

            <!-- Close button -->
            <div class="flex justify-end pt-6 mt-5 border-t border-df-border-red/50">
              <button @click="viewingRole = null" class="df-btn-ghost px-5 py-2 text-sm">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- Faction Member Details popup                    -->
    <!-- ═══════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="viewingFactionData" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" @click.self="viewingFactionData = null">
        <div class="npc-detail-modal w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div class="df-card-corner df-card-corner-tl"></div>
          <div class="df-card-corner df-card-corner-tr"></div>
          <div class="df-card-corner df-card-corner-bl"></div>
          <div class="df-card-corner df-card-corner-br"></div>

          <div class="relative z-10 overflow-y-auto df-scrollbar p-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :style="{ background: viewingFactionData.faction.color }"></span>
                Membro de Facção
              </h3>
              <button @click="viewingFactionData = null" class="npc-detail-close">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Profile Header -->
            <div class="flex items-center gap-6 pb-6 border-b border-df-border-red/50">
              <div class="w-32 h-32 rounded-full overflow-hidden border-2 bg-df-input flex items-center justify-center flex-shrink-0 shadow-lg" :style="{ borderColor: viewingFactionData.faction.color, boxShadow: `0 4px 20px ${viewingFactionData.faction.color}30` }">
                <img v-if="getMemberPhoto(viewingFactionData.member)" :src="getMemberPhoto(viewingFactionData.member)" class="w-full h-full object-cover" alt="" />
                <svg v-else class="w-14 h-14 text-df-red/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <h4 class="text-2xl font-bold text-white">{{ getMemberName(viewingFactionData.member) }}</h4>
                <p v-if="viewingFactionNPC?.clan" class="text-df-red font-medium text-lg">{{ viewingFactionNPC.clan }}</p>
                <p v-if="viewingFactionNPC?.generation" class="text-sm text-df-muted">{{ viewingFactionNPC.generation }}ª Geração</p>
                <!-- Faction + role badge -->
                <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border" :style="{ borderColor: viewingFactionData.faction.color + '66', background: viewingFactionData.faction.color + '15' }">
                  <span class="w-2 h-2 rounded-full" :style="{ background: viewingFactionData.faction.color }"></span>
                  <span class="text-xs font-bold uppercase tracking-wider" :style="{ color: viewingFactionData.faction.color }">{{ viewingFactionData.member.rank }} — {{ viewingFactionData.faction.name }}</span>
                </div>
              </div>
            </div>

            <!-- Bio (NPC only) -->
            <div v-if="viewingFactionNPC" class="mt-5">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-2">Biografia</h5>
              <p class="text-sm text-df-silver leading-relaxed">{{ viewingFactionNPC.bio || 'Nenhuma biografia definida.' }}</p>
            </div>

            <!-- Key Points (NPC only) -->
            <div v-if="viewingFactionNPC?.keyPoints && viewingFactionNPC.keyPoints.length > 0" class="mt-5">
              <h5 class="text-sm font-semibold text-df-gold uppercase tracking-wider mb-3">Pontos Chave</h5>
              <ul class="space-y-2">
                <li v-for="point in viewingFactionNPC.keyPoints" :key="point" class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-df-red mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/></svg>
                  <span class="text-sm text-df-silver">{{ point }}</span>
                </li>
              </ul>
            </div>

            <!-- Close -->
            <div class="flex justify-end pt-6 mt-5 border-t border-df-border-red/50">
              <button @click="viewingFactionData = null" class="df-btn-ghost px-5 py-2 text-sm">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Save bar (when editing) -->
    <div v-if="editMode" class="sticky bottom-4 z-50 flex justify-end gap-3">
      <button @click="cancelEdits" class="df-btn-ghost px-5 py-2 text-sm">Descartar</button>
      <button @click="savePolitics" class="df-btn-primary px-5 py-2 text-sm flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        Salvar Mapa Político
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~/composables/useToast'
import { useCampaign } from '~/composables/useCampaign'

interface Props { campaignId: string }
const props = defineProps<Props>()
const toast = useToast()
const { campaignNPCs, loadCampaignNPCs } = useCampaign()

const editGovernment = ref(false)
const editFactions = ref(false)
const editRelations = ref(false)
const editTerritories = ref(false)

const editMode = computed(() => editGovernment.value || editFactions.value || editRelations.value || editTerritories.value)

const toggleAllEdit = () => {
  const newVal = !editMode.value
  editGovernment.value = newVal
  editFactions.value = newVal
  editRelations.value = newVal
  editTerritories.value = newVal
}

const resetAllEdit = () => {
  editGovernment.value = false
  editFactions.value = false
  editRelations.value = false
  editTerritories.value = false
}

// ── Government titles used in Camarilla ──
const governmentTitles = [
  'Príncipe', 'Senescal', 'Xerife', 'Harpia', 'Guardião do Elísio',
  'Primogênito', 'Algoz', 'Carrasco', 'Emissário', 'Bispo',
  'Arcebispo', 'Cardeal', 'Barão', 'Outro'
]

// ── Relation types ──
const relationTypes = [
  { key: 'alliance' as const, label: 'Alianças', color: '#22c55e' },
  { key: 'hatred' as const, label: 'Inimigos', color: '#dc2626' },
  { key: 'tension' as const, label: 'Tensões', color: '#f59e0b' }
]

type RelationType = 'alliance' | 'hatred' | 'tension'
const relFilters = ref<{ alliance: boolean; hatred: boolean; tension: boolean }>({ alliance: true, hatred: true, tension: true })
const showSecretRelations = ref(false)

interface GovernmentRole { title: string; npcId: string; note: string }
type FactionType = 'independente' | 'anarquista'
interface FactionMember { npcId: string; customName: string; customPhoto: string; rank: string }
interface Faction { name: string; type: FactionType; color: string; description: string; members: FactionMember[] }
type RelationStrength = 'strong' | 'medium' | 'weak'
interface Relation { type: RelationType; fromNpcId: string; toNpcId: string; name: string; strength: RelationStrength; since: string; reason: string; secret: boolean }
interface Territory { name: string; controlledBy: string; description: string; controlLevel: number }

interface PoliticsData {
  government: GovernmentRole[]
  factions: Faction[]
  relations: Relation[]
  territories: Territory[]
}

const defaultPolitics = (): PoliticsData => ({
  government: [],
  factions: [],
  relations: [],
  territories: []
})

const politics = ref<PoliticsData>(defaultPolitics())
let savedSnapshot = ''

// ── Persistence via localStorage ──
const storageKey = computed(() => `vamp-politics-${props.campaignId}`)

onMounted(async () => {
  // Ensure NPCs are loaded (needed on page refresh)
  await loadCampaignNPCs(props.campaignId)

  const stored = localStorage.getItem(storageKey.value)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Migrate old government format: { title, name, clan, note } → { title, npcId, note }
      if (parsed.government) {
        parsed.government = parsed.government.map((role: any) => ({
          title: role.title || '',
          npcId: role.npcId || '',
          note: role.note || (role.name ? `${role.name}${role.clan ? ' (' + role.clan + ')' : ''}` : '')
        }))
      }
      // Migrate old faction format: { leader, membersText } → { type, members[] }
      if (parsed.factions) {
        parsed.factions = parsed.factions.map((f: any) => {
          if (f.members) return { ...f, type: f.type || 'independente' }
          const members: any[] = []
          if (f.leader) members.push({ npcId: '', customName: f.leader, customPhoto: '', rank: 'Líder' })
          if (f.membersText) {
            f.membersText.split('\n').map((m: string) => m.trim()).filter(Boolean).forEach((name: string) => {
              members.push({ npcId: '', customName: name, customPhoto: '', rank: 'Membro' })
            })
          }
          return { name: f.name || '', type: 'independente' as const, color: f.color || '#dc2626', description: f.description || '', members }
        })
      }
      // Migrate old relation format: { from, to } → { fromNpcId, toNpcId, name, strength, since, secret }
      if (parsed.relations) {
        parsed.relations = parsed.relations.map((r: any) => ({
          type: r.type || 'alliance',
          fromNpcId: r.fromNpcId || '',
          toNpcId: r.toNpcId || '',
          name: r.name || '',
          strength: r.strength || 'medium',
          since: r.since || '',
          reason: r.reason || '',
          secret: r.secret ?? false
        }))
      }
      politics.value = { ...defaultPolitics(), ...parsed }
    } catch { /* ignore */ }
  }
  savedSnapshot = JSON.stringify(politics.value)
})

const savePolitics = () => {
  localStorage.setItem(storageKey.value, JSON.stringify(politics.value))
  savedSnapshot = JSON.stringify(politics.value)
  resetAllEdit()
  toast.success('Mapa Político salvo!', 'Todas as alterações foram registradas.')
}

const cancelEdits = () => {
  try { politics.value = JSON.parse(savedSnapshot) } catch { /* ignore */ }
  resetAllEdit()
}

// ── Government: hierarchy tiers ──
const hierarchyTiers = [
  { tier: 0, label: 'Líder Supremo', titles: ['Príncipe'] },
  { tier: 1, label: 'Braço Direito', titles: ['Senescal'] },
  { tier: 2, label: 'Oficiais', titles: ['Xerife', 'Harpia', 'Guardião do Elísio'] },
  { tier: 3, label: 'Representantes', titles: ['Primogênito'] },
  { tier: 4, label: 'Executores', titles: ['Algoz', 'Carrasco', 'Emissário'] },
  { tier: 5, label: 'Outros', titles: ['Bispo', 'Arcebispo', 'Cardeal', 'Barão', 'Outro'] }
]

const allKnownTitles = hierarchyTiers.flatMap(t => t.titles)

const governmentByTier = computed(() => {
  const result = hierarchyTiers.map(tier => ({
    ...tier,
    roles: politics.value.government
      .filter(r => tier.titles.includes(r.title))
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
  }))
  // Unassigned roles (empty or unrecognized titles)
  const unassigned = politics.value.government.filter(r => !r.title || !allKnownTitles.includes(r.title))
  if (unassigned.length > 0) {
    result.push({ tier: 99, label: 'Não Atribuído', titles: [], roles: unassigned })
  }
  return result.filter(t => t.roles.length > 0)
})

const assignedNpcIds = computed(() =>
  new Set(politics.value.government.map(r => r.npcId).filter(Boolean))
)

const getNpcById = (id: string) =>
  id ? campaignNPCs.value.find(n => n.id === id) : undefined

const getAvailableNPCsForRole = (role: GovernmentRole) =>
  campaignNPCs.value
    .filter(npc => npc.id === role.npcId || !assignedNpcIds.value.has(npc.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

const findRoleIndex = (role: GovernmentRole) =>
  politics.value.government.indexOf(role)

const getTierAvatarClass = (tier: number) => {
  if (tier === 0) return 'avatar-prince'
  if (tier === 1) return 'avatar-seneschal'
  return 'avatar-default'
}

const addGovernmentRole = () => { politics.value.government.push({ title: '', npcId: '', note: '' }) }
const removeGovernmentRole = (i: number) => { politics.value.government.splice(i, 1) }

// ── NPC Detail popup ──
const viewingRole = ref<GovernmentRole | null>(null)
const viewingNPC = computed(() =>
  viewingRole.value?.npcId ? getNpcById(viewingRole.value.npcId) : undefined
)

// ── Factions ──
const independentRanks = ['Líder', 'Co-Líder', 'Oficial', 'Membro']
const anarchistRanks = ['Barão', 'Tenente', 'Conselheiro Anarquista', 'Revolucionário', 'Membro']

const getFactionRanks = (faction: Faction): string[] =>
  faction.type === 'anarquista' ? anarchistRanks : independentRanks

const getFactionMembersByTier = (faction: Faction) => {
  const ranks = getFactionRanks(faction)
  return ranks
    .map((rank, index) => ({
      rank,
      tier: index,
      members: faction.members.filter(m => m.rank === rank)
    }))
    .filter(t => t.members.length > 0)
}

const getMemberName = (member: FactionMember): string =>
  member.npcId ? (getNpcById(member.npcId)?.name || '—') : (member.customName || '—')

const getMemberPhoto = (member: FactionMember): string | undefined =>
  member.npcId ? getNpcById(member.npcId)?.photo : (member.customPhoto || undefined)

const addFaction = () => {
  politics.value.factions.push({
    name: '', type: 'independente', color: '#dc2626', description: '', members: []
  })
}
const removeFaction = (i: number) => { politics.value.factions.splice(i, 1) }

const addFactionMember = (faction: Faction) => {
  const ranks = getFactionRanks(faction)
  faction.members.push({ npcId: '', customName: '', customPhoto: '', rank: ranks[ranks.length - 1] || 'Membro' })
}
const removeFactionMember = (faction: Faction, index: number) => {
  faction.members.splice(index, 1)
}

const handleMemberPhotoUpload = (event: Event, member: FactionMember) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { member.customPhoto = reader.result as string }
  reader.readAsDataURL(file)
}

// ── Faction Detail popup ──
const viewingFactionData = ref<{ faction: Faction; member: FactionMember } | null>(null)
const viewFactionMember = (faction: Faction, member: FactionMember) => {
  viewingFactionData.value = { faction, member }
}
const viewingFactionNPC = computed(() =>
  viewingFactionData.value?.member.npcId
    ? getNpcById(viewingFactionData.value.member.npcId)
    : undefined
)

// ── Relations ──
const hoveredRelation = ref<Relation | null>(null)

const visibleRelations = computed(() => {
  return politics.value.relations.filter(r => {
    if (!relFilters.value[r.type]) return false
    if (r.secret && !showSecretRelations.value) return false
    return true
  })
})

const secretRelationsCount = computed(() =>
  politics.value.relations.filter(r => r.secret).length
)

// Build list of unique center NPCs from visible relations
const graphCenterNpcs = computed(() => {
  const seen = new Set<string>()
  const centers: string[] = []
  for (const r of visibleRelations.value) {
    if (r.fromNpcId && !seen.has(r.fromNpcId)) {
      seen.add(r.fromNpcId)
      centers.push(r.fromNpcId)
    }
  }
  return centers
})

// Get all relations where npcId is the "from" side
const getRelationsForNpc = (npcId: string) => {
  return visibleRelations.value
    .filter(r => r.fromNpcId === npcId && r.toNpcId)
    .map(r => ({ relation: r, targetId: r.toNpcId }))
}

const getStrengthLabel = (s: string) => {
  if (s === 'strong') return 'Forte'
  if (s === 'medium') return 'Média'
  return 'Fraca'
}

const getRelLineClass = (rel: Relation) => {
  const classes = ['rel-line']
  if (rel.type === 'alliance') classes.push('rel-line-alliance')
  else if (rel.type === 'hatred') classes.push('rel-line-hatred')
  else classes.push('rel-line-tension')
  if (rel.secret) classes.push('rel-line-secret')
  return classes.join(' ')
}

const addRelation = () => {
  politics.value.relations.push({
    type: 'alliance', fromNpcId: '', toNpcId: '', name: '', strength: 'medium', since: '', reason: '', secret: false
  })
}
const removeRelation = (rel: Relation) => {
  const i = politics.value.relations.indexOf(rel)
  if (i !== -1) politics.value.relations.splice(i, 1)
}

const toggleRelSecret = (rel: Relation) => {
  rel.secret = !rel.secret
  if (rel.secret) {
    toast.success('Relação Secreta', 'Esta relação agora está oculta para os jogadores.')
  } else {
    toast.success('Relação Pública', 'Esta relação agora está visível para os jogadores.')
  }
}

const getRelColor = (type: string) => {
  if (type === 'alliance') return '#22c55e'
  if (type === 'hatred') return '#dc2626'
  return '#f59e0b'
}
const getRelLabel = (type: string) => {
  if (type === 'alliance') return 'Aliança'
  if (type === 'hatred') return 'Inimizade'
  return 'Tensão'
}
const getRelBorderClass = (type: string) => {
  if (type === 'alliance') return 'border-green-900/40 bg-green-950/20'
  if (type === 'hatred') return 'border-red-900/40 bg-red-950/20'
  return 'border-yellow-900/40 bg-yellow-950/20'
}

const getRoleColor = (title: string) => {
  if (title === 'Príncipe') return 'text-df-gold'
  if (title === 'Senescal') return 'text-blue-400'
  if (title === 'Xerife') return 'text-df-red'
  if (title === 'Harpia') return 'text-purple-400'
  return 'text-df-silver'
}

// ── Territories ──
const addTerritory = () => { politics.value.territories.push({ name: '', controlledBy: '', description: '', controlLevel: 0 }) }
const removeTerritory = (i: number) => { politics.value.territories.splice(i, 1) }

// Expose count for parent
defineExpose({ count: computed(() => politics.value.factions.length) })
</script>

<style scoped>
/* ═══ Cards ═══ */
.df-card {
  position: relative;
  background: #0a0a1a;
  border: 1px solid #7f1d1d;
  box-shadow: 0 0 0 1px #4a4a5a, inset 0 1px 6px rgba(0,0,0,0.5);
  border-radius: 0.5rem;
  padding: 1rem;
}
.df-card-corner { position: absolute; width: 14px; height: 14px; pointer-events: none; z-index: 2; }
.df-card-corner::before, .df-card-corner::after { content: ''; position: absolute; background: #dc2626; }
.df-card-corner::before { width: 14px; height: 1px; }
.df-card-corner::after  { width: 1px; height: 14px; }
.df-card-corner-tl { top: -1px; left: -1px; }
.df-card-corner-tr { top: -1px; right: -1px; }
.df-card-corner-tr::before { right: 0; }
.df-card-corner-tr::after  { right: 0; }
.df-card-corner-bl { bottom: -1px; left: -1px; }
.df-card-corner-bl::before { bottom: 0; }
.df-card-corner-bl::after  { bottom: 0; }
.df-card-corner-br { bottom: -1px; right: -1px; }
.df-card-corner-br::before { right: 0; bottom: 0; }
.df-card-corner-br::after  { right: 0; bottom: 0; }

/* ═══ Inner cards ═══ */
.df-role-card, .df-faction-card, .df-territory-card {
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s ease;
}
.df-role-card:hover, .df-faction-card:hover, .df-territory-card:hover {
  border-color: #7f1d1d;
}

/* ═══ Hierarchy Tree ═══ */
.hierarchy-tree-wrapper {
  overflow-x: auto;
  padding: 0.5rem 0;
}
.hierarchy-tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: fit-content;
}

/* Trunk line between tiers */
.tree-trunk {
  width: 2px;
  height: 28px;
  background: linear-gradient(to bottom, #7f1d1d, #d4a647);
  position: relative;
}
.trunk-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d4a647;
  box-shadow: 0 0 6px rgba(212, 166, 71, 0.6);
}

/* Tier nodes container */
.tree-nodes {
  display: flex;
  justify-content: center;
  position: relative;
}

/* Individual node wrapper */
.tree-node {
  position: relative;
  padding: 0 10px;
}

/* Multi-node tiers: connector lines */
.tree-nodes.multi > .tree-node {
  padding-top: 22px;
}

/* Vertical line from horizontal connector down to node */
.tree-nodes.multi > .tree-node::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 22px;
  background: #7f1d1d;
}

/* Horizontal connector segments */
.tree-nodes.multi > .tree-node::after {
  content: '';
  position: absolute;
  top: 0;
  height: 2px;
  background: #7f1d1d;
}
.tree-nodes.multi > .tree-node:first-child::after {
  left: 50%;
  right: 0;
}
.tree-nodes.multi > .tree-node:last-child::after {
  left: 0;
  right: 50%;
}
.tree-nodes.multi > .tree-node:not(:first-child):not(:last-child)::after {
  left: 0;
  right: 0;
}

/* Node card */
.node-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.75rem;
  padding: 0.75rem 0.625rem;
  min-width: 110px;
  max-width: 150px;
  transition: all 0.3s ease;
}
.node-card:hover {
  border-color: #7f1d1d;
  box-shadow: 0 0 16px rgba(127, 29, 29, 0.25);
}
.node-card-edit {
  min-width: 140px;
  max-width: 170px;
}

/* Avatar styles */
.node-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #4a4a5a;
  background: #0a0a1a;
  margin-bottom: 0.4rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.node-avatar.avatar-prince {
  width: 68px;
  height: 68px;
  border-color: #d4a647;
  box-shadow: 0 0 20px rgba(212, 166, 71, 0.35), inset 0 0 8px rgba(212, 166, 71, 0.1);
}
.node-avatar.avatar-seneschal {
  width: 60px;
  height: 60px;
  border-color: #60a5fa;
  box-shadow: 0 0 14px rgba(96, 165, 250, 0.25);
}
.node-avatar.avatar-default {
  border-color: #4a4a5a;
}
.node-avatar.avatar-faction-leader {
  width: 64px;
  height: 64px;
}

/* Node text elements */
.node-title {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 0.125rem;
}
.node-name {
  color: #fff;
  font-weight: 600;
  font-size: 0.75rem;
  margin-top: 0.125rem;
  line-height: 1.2;
}
.node-clan {
  color: #dc2626;
  font-size: 0.65rem;
}
.node-note {
  color: #6b6b80;
  font-size: 0.6rem;
  font-style: italic;
  margin-top: 0.125rem;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══ Inputs ═══ */
.df-input {
  width: 100%;
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.375rem;
  padding: 0.375rem 0.625rem;
  color: #c0c0d0;
  transition: border-color 0.2s;
}
.df-input:focus { outline: none; border-color: #dc2626; }
.df-input::placeholder { color: #6b6b80; }
select.df-input option {
  background: #0d0d20;
  color: #c0c0d0;
}

/* ═══ Buttons ═══ */
.df-btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em;
  background: linear-gradient(135deg, #991b1b, #7f1d1d); color: #fecaca;
  border: 1px solid #dc2626; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease; box-shadow: 0 0 12px rgba(220,38,38,0.2);
}
.df-btn-primary:hover { background: linear-gradient(135deg, #b91c1c, #991b1b); box-shadow: 0 0 20px rgba(220,38,38,0.4); color: #fff; }

.df-btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em;
  background: transparent; color: #6b6b80;
  border: 1px solid #4a4a5a; border-radius: 0.5rem; cursor: pointer;
  transition: all 0.2s ease;
}
.df-btn-ghost:hover { border-color: #dc2626; color: #c0c0d0; background: rgba(127,29,29,0.1); }

/* ═══ NPC Detail Modal ═══ */
.npc-detail-modal {
  background: #0a0a1a;
  border: 1px solid #7f1d1d;
  border-radius: 0.75rem;
  position: relative;
  box-shadow: 0 0 40px rgba(220,38,38,0.15), inset 0 1px 6px rgba(0,0,0,0.5);
  overflow: hidden;
}
.npc-detail-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid transparent;
  color: #6b6b80;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}
.npc-detail-close:hover { color: #dc2626; border-color: #7f1d1d; background: rgba(127,29,29,0.15); }
.df-scrollbar::-webkit-scrollbar { width: 6px; }
.df-scrollbar::-webkit-scrollbar-track { background: #050510; }
.df-scrollbar::-webkit-scrollbar-thumb { background: #7f1d1d; border-radius: 3px; }

/* ═══ Relation Graph ═══ */
.rel-graph-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.rel-graph-row {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0.75rem 0;
}
.rel-graph-center-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 90px;
}
.rel-graph-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #4a4a5a;
  background: #0a0a1a;
  flex-shrink: 0;
  transition: all 0.3s ease;
}
.rel-graph-avatar-center {
  width: 56px;
  height: 56px;
  border-color: #d4a647;
  box-shadow: 0 0 14px rgba(212, 166, 71, 0.3);
}
.rel-graph-connections {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}
.rel-graph-link {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
}
.rel-graph-line {
  height: 2px;
  flex: 1;
  min-width: 40px;
  max-width: 120px;
  position: relative;
  cursor: pointer;
}
/* Invisible hover zone so thin lines are easy to target */
.rel-graph-line::before {
  content: '';
  position: absolute;
  top: -8px;
  bottom: -8px;
  left: 0;
  right: 0;
}
/* Alliance: solid green */
.rel-line-alliance {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.35);
}
/* Hatred: thick solid red */
.rel-line-hatred {
  height: 4px;
  background: #dc2626;
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
}
/* Tension: dashed yellow */
.rel-line-tension {
  height: 2px;
  background: transparent;
  border-top: 2px dashed #f59e0b;
  box-shadow: 0 0 4px rgba(245, 158, 11, 0.2);
}
/* Secret: add purple glow */
.rel-line-secret {
  opacity: 0.7;
  filter: saturate(0.6);
}
.rel-graph-target {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 80px;
}

/* Tooltip */
.rel-tooltip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(100% + 8px);
  z-index: 50;
  background: #0d0d20;
  border: 1px solid #7f1d1d;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  min-width: 180px;
  max-width: 260px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.6), 0 0 12px rgba(127,29,29,0.2);
  pointer-events: none;
  animation: tooltipFade 0.15s ease;
}
@keyframes tooltipFade {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Filter checkboxes */
.rel-filter-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  user-select: none;
}
.rel-filter-check { display: none; }
.rel-filter-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1.5px solid #4a4a5a;
  background: transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

/* Edit card */
.rel-edit-card {
  background: #0d0d20;
  border: 1px solid #4a4a5a;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s ease;
}
.rel-edit-card:hover {
  border-color: #7f1d1d;
}
</style>