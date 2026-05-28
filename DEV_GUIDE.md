# 📖 Guia de Desenvolvimento

![Version](https://img.shields.io/badge/Version-5.1.0-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> Guia completo para desenvolvedores trabalhando no sistema Vampire RPG

**Versão Atual:** 5.1.0  
**Última Atualização:** Maio 28, 2026

---

## 📋 Índice

- [🚀 Como Começar](#-como-começar)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [📁 Estrutura Principal](#-estrutura-principal)
- [📝 Ficha de Personagem V5](#-ficha-de-personagem-v5)
- [🎭 Dashboard do Jogador](#-dashboard-do-jogador)
- [🗄️ Banco de Dados](#️-banco-de-dados)
- [📋 Convenções e Padrões](#-convenções-e-padrões)
- [🎨 Tema Vampire](#-tema-vampire)
- [🔐 Autenticação e Permissões](#-autenticação-e-permissões)
- [⚠️ Pontos de Atenção](#️-pontos-de-atenção)
- [🎯 Próximos Passos](#-próximos-passos)

---

## 🚀 Como Começar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:3000

### 3. Build de Produção
```bash
npm run build
npm run preview
```

### 4. Limpar Cache (se necessário)
```bash
rm -rf .nuxt
npm run postinstall
```

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|-----------|-----|
| Vue 3 | Framework frontend (Composition API) |
| Nuxt 4 | Meta-framework com SSR e file-based routing |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização com tema vampire customizado |
| Supabase | Autenticação + Banco PostgreSQL + RLS |

---

## 📁 Estrutura Principal

```
app/
 components/campaign/PlayerSheet.vue    Ficha V5 (~1206 linhas)
 pages/campaign/[id]/player.vue         Dashboard jogador (~851 linhas)
 pages/campaign/[id]/master.vue        Dashboard mestre
 types/index.ts                        Interface CharacterSheet
 composables/useCampaign.ts            CRUD campanhas + savePlayerSheet
 composables/useAuth.ts                Autenticação Supabase
```

---

## 📝 Ficha de Personagem V5 (PlayerSheet.vue)

### 📋 Visão Geral
Componente modal que renderiza a ficha oficial do V5 com ~1206 linhas. Aberto a partir do dashboard do jogador (`player.vue`).

### Estrutura das Seções
```
Cabeçalho: Avatar + Nome vermelho uppercase + Salvar/Fechar
Campos: Nome/Conceito/Clã | Geração/Seita/Refúgio (grid 3+3)
Atributos: Físicos/Sociais/Mentais (3  3  5 bolinhas)
Habilidades: Talentos/Perícias/Conhecimentos (3  9  5 bolinhas, ordem V5 PT-BR)
Grid 1: Disciplinas+Vantagens+Fome | Potência+Experiência
Grid 2: Virtudes | Humanidade+Vontade+Vitalidade
Extras: Ressonância, Princípios, Pilares, Perdição, Geração do Abraço
Final: Aparência, Traços, Condições, História
```

### Props
```typescript
const props = defineProps<{
  player: any       // Dados do jogador (com sheet)
  canEdit: boolean  // Permissão de edição
}>()
```

### Emits
```typescript
const emit = defineEmits<{
  save: [player: any]  // Jogador com sheet atualizada
  close: []            // Fechar modal
}>()
```

### Fluxo de Salvamento
```
1. Usuário clica "Salvar"  saveSheet() valida campos obrigatórios
2. Modal de confirmação aparece
3. confirmSave() filtra condições vazias
4. emit('save', { ...player, sheet: sheetData })
5. player.vue recebe  saveCharacterSheet()  savePlayerSheet()  Supabase
6. loadCampaignData() recarrega tudo  dashboard atualiza
```

### Campos da sheetData
```typescript
{
  // Identificação
  name, concept, clan, generation, sect, haven, player,
  
  // V5 específicos
  resonance, chronicleTenets, touchstonesConvictions, clanBane,
  advantages: [{ name, level }],  // Vantagens & Defeitos
  bloodPotency,                   // 0-10
  bloodSurge, powerBonus, feedingPenalty, baneSeverity,
  xpTotal, xpSpent,
  embraceGeneration,              // Cria/Neófito/Ancião
  
  // Pessoal
  appearance, distinguishingFeatures, history,
  
  // Mecânicas
  attributes: { physical, social, mental },
  skills: { talents, skills, knowledges },
  disciplines: [{ name, level }],
  virtues: { conscience, selfControl, courage },
  humanity, willpower, vitality,
  hunger,      // Padrão: 1
  conditions   // Array de strings
}
```

---

## 🎭 Dashboard do Jogador (player.vue)

### ⚙️ Como funciona
- Exibe "Estado Atual do Vampiro" (Fome, Humanidade, Vontade, Condições)
- Botão "Editar Ficha" abre PlayerSheet.vue como modal
- Após salvar, recarrega dados do banco e atualiza todas as barras

### Leitura de dados
```typescript
const hunger = computed(() => playerData.value?.sheet?.hunger ?? 1)
const humanity = computed(() => playerData.value?.sheet?.humanity ?? 7)
const willpower = computed(() => playerData.value?.sheet?.willpower ?? 3)
const conditions = computed(() => playerData.value?.sheet?.conditions ?? [])
```

---

## 🗄️ Banco de Dados (Supabase)

### 📊 Tabelas
```sql
campaigns (id, name, description, master_id, invite_code, is_active, timestamps)
campaign_players (user_id, campaign_id, character_name, role, sheet JSONB, joined_at)
```

A coluna `sheet` armazena toda a ficha V5 como JSON.

### Salvamento da Ficha
```typescript
// Em useCampaign.ts
const savePlayerSheet = async (campaignId, playerId, sheetData) => {
  await supabase
    .from('campaign_players')
    .update({ sheet: sheetData })
    .eq('campaign_id', campaignId)
    .eq('user_id', playerId)
}
```

---

## 📋 Convenções e Padrões

### 📦 Imports
```vue
<!-- SEMPRE usar imports explícitos -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import type { CharacterSheet } from '~/types'
</script>
```

### Navegação
```typescript
// CORRETO
navigateTo('/dashboard')

// ERRADO (não usar)
$router.push('/dashboard')
```

### Botões
```vue
<!-- SEMPRE usar BaseButton -->
<BaseButton variant="primary" size="sm" @click="action">Texto</BaseButton>
<!-- Variantes: primary, secondary, ghost, danger, outline -->
```

### Modais
```vue
<!-- Sem Teleport, usar z-index alto -->
<div class="fixed inset-0 z-[9999]">
  <!-- conteúdo do modal -->
</div>
```

---

## 🎨 Tema Vampire (Tailwind)

### 🎨 Cores principais
- **Vermelho**: `text-red-400`, `border-red-900`, `border-red-600`
- **Superfícies**: `bg-surface-card`, `bg-surface-secondary`
- **Texto**: `text-text-primary`, `text-text-secondary`
- **Bolinhas de atributo**: `bg-white` (preenchida), `bg-gray-700` (vazia)
- **Fome**: `bg-red-600` (vermelha)
- **Humanidade**: `bg-red-500` (vermelha)
- **Vontade**: `bg-blue-500` (azul)
- **Vitalidade**: `bg-green-500` (verde)
- **Virtudes**: `bg-yellow-500` (amarela)

### Design Vampírico da Ficha
```css
/* Borda com glow */
border-4 border-red-900
box-shadow: 0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 20px rgba(220, 38, 38, 0.1)

/* Ornamentos nos cantos */
border-t-4 border-l-4 border-red-600 opacity-60
```

---

## 🔐 Autenticação e Permissões

### 🛡️ Middleware
- `auth.global.ts` - Protege rotas privadas
- `is-master.ts` - Só mestres acessam /master
- `is-player.ts` - Jogadores e mestres acessam campanha

### Permissões no componente
```typescript
const { permissions } = useCampaign(campaignId)
// permissions.isMaster, permissions.isPlayer, permissions.canEdit
```

### PlayerSheet e permissões
- `canEdit=true`  jogador editando própria ficha (botão salvar visível)
- `canEdit=false`  mestre visualizando ficha de jogador (somente leitura)

---

## ⚠️ Pontos de Atenção

1. **NPCSheet.vue** ainda usa modelo antigo - pode precisar atualizar para V5
2. **Auto-import do Nuxt 4** nem sempre funciona - sempre usar imports explícitos
3. **Condições vazias** são filtradas no `confirmSave()` antes de salvar
4. **Fome padrão** é 1 (usando `??` nullish coalescing, não `||`)
5. **Ornamentos da borda** ficam FORA do container com scroll (evita clipping)
6. **Validação** exige Nome, Conceito, Clã e Geração (3-15) preenchidos

---

## 🎯 Próximos Passos

### ✅ Concluído (v5.0.0)
- [x] Integrar NPCs com Supabase (live.vue)
- [x] Timeline persistente no banco
- [x] Upload real de mídia (Supabase Storage — MediaTab.vue)
- [x] Jogo ao vivo funcional (live.vue + live-player.vue)
  - [x] Transmissão de imagens e áudio em tempo real
  - [x] NPCs visíveis com spotlight
  - [x] Eventos narrativos na timeline

### ⚠️ Pendente imediato
- [ ] **EXECUTAR SQL 1**: `database/add-live-media-columns.sql` no Supabase SQL Editor
- [ ] **EXECUTAR SQL 2**: `database/create-dice-rolls.sql` no Supabase SQL Editor (tabela dice_rolls)
- [ ] **EXECUTAR SQL 3**: `database/add-live-session-timeout.sql` (timeout por inatividade)
- [ ] **EXECUTAR SQL 4**: `database/optimize-dice-retention.sql` (limpeza em lotes de rolagens)
- [ ] Testar fluxo completo: upload → picker → adicionar à cena → olho → jogador vê
- [ ] Testar autoplay de áudio nos navegadores (pode precisar de interação do usuário primeiro)

### Pendente (v6.0+)
- [ ] Chat em tempo real (30% concluído)
- [ ] Combat Tracker funcional
- [ ] Atualizar NPCSheet.vue para V5
- [ ] Transmissão de documentos no jogo ao vivo (live-player.vue)
