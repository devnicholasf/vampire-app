# 📐 Relatório de Mudanças Arquiteturais

![Version](https://img.shields.io/badge/Version-5.0.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live_Gaming-success?style=flat-square)

> Histórico completo de mudanças arquiteturais e decisões técnicas do projeto

**Versão Atual:** 5.0.0 - Sistema de Jogo ao Vivo com Mídia em Tempo Real  
**Última Atualização:** Maio 19, 2026

---

## 📋 Índice

- [🆕 Sessão Atual (Abril/Maio 2026)](#-sessão-atual-abrilmaio-2026)
- [📝 Sessão Anterior (Fevereiro 2026)](#-sessão-anterior-fevereiro-2026)
- [🔄 Sessão Anterior (Janeiro 2026)](#-sessão-anterior-janeiro-2026)
- [🗄️ Banco de Dados](#️-banco-de-dados)
- [✅ Estado Validado](#-estado-validado)

---

## 🆕 Sessão Atual (Abril/Maio 2026)

### 1. Extensão do Composable useLiveGame.ts

**Padrão: `useState` para estado compartilhado entre Mestre e Jogador**

```typescript
// Novo estado global de mídia da cena
const currentSceneMedia = useState<{ imageUrl: string; audioUrl: string }>(
  'liveGame.sceneMedia',
  () => ({ imageUrl: '', audioUrl: '' })
)

// Nova função: persiste no banco + sincroniza estado local
async function updateSceneMedia(campaignId: string, imageUrl: string, audioUrl: string) {
  await supabase
    .from('live_game_state')
    .update({ current_image_url: imageUrl, current_audio_url: audioUrl })
    .eq('campaign_id', campaignId)
  currentSceneMedia.value = { imageUrl, audioUrl }
}
```

**Exports são `readonly`** — componentes externos não podem atribuir `.value` diretamente:
```typescript
export const useLiveGame = () => ({
  isGameLive: readonly(isGameLive),
  currentNpcs: readonly(currentNpcs),
  timelineEvents: readonly(timelineEvents),
  currentSceneMedia: readonly(currentSceneMedia),  // NOVO
  updateSceneMedia,  // NOVO
  // ...
})
```

### 2. Novo Schema de Banco de Dados

**Tabela: `live_game_state` — colunas adicionadas:**
```sql
ALTER TABLE live_game_state
  ADD COLUMN IF NOT EXISTS current_image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_audio_url  TEXT DEFAULT '';
```

**Script**: `database/add-live-media-columns.sql` (executar no Supabase SQL Editor).

### 3. Padrão de Design "NPC-style Picker" para Mídia

**Antes (v4.x):** seção de mídia usava dropdowns simples.

**Depois (v5.0):** cada tipo de mídia tem um painel colapsável com:
- Lista de itens em cena (com thumbnail ou ícone)
- Botão olho (verde = visível para jogadores)
- Botão X (remover da cena)
- Botão "Adicionar [tipo]" que expande picker com campo de busca e itens do Storage

```
[ IMAGENS ]
  ┌─ imagem1.jpg  [👁] [✕]
  ├─ imagem2.png  [   ] [✕]
  └─ [+ Adicionar Imagem]
       └─ [Busca...] → lista de arquivos do Storage

[ ÁUDIO ]
  ┌─ musica.mp3   [👁] [✕]
  └─ [+ Adicionar Áudio]
       └─ [Busca...] → lista de arquivos do Storage
```

Documentos removidos do painel ao vivo (disponíveis apenas na aba Mídia do dashboard).

### 4. Fluxo de Transmissão de Mídia em Tempo Real

```
1. Mestre clica no olho de uma imagem/áudio em live.vue
2. toggleMediaVisibility(item) é chamada
3. Somente 1 imagem e 1 áudio podem estar visíveis por vez
4. updateSceneMedia(campaignId, imageUrl, audioUrl) é chamada
5. Supabase UPDATE em live_game_state
6. Supabase Realtime NOTIFY para todos os subscribers
7. live-player.vue recebe UPDATE via subscribeToLiveGame
8. applyState(data) seta currentImageUrl e currentAudioUrl
9. Template reativo exibe <img> e <audio> ao jogador
```

### 5. Regras de TypeScript Aprendidas

**EventTarget não tem `.style`:**
```typescript
// ERRADO:
e.currentTarget.style.backgroundColor = '#...'

// CERTO:
const el = e.currentTarget as HTMLElement
el.style.backgroundColor = '#...'
```

**Refs readonly de composable:**
```typescript
// ERRADO (em live.vue):
isGameLive.value = data.is_live  // TypeError: readonly

// CERTO: usar função do composable ou ref local
applyLiveNpcState(data.current_npcs)
sessionTimeline.value = sanitizeTimeline(data.timeline_events)  // ref local
```

**String possivelmente undefined:**
```typescript
// ERRADO:
const name = parts[parts.length - 1]  // string | undefined

// CERTO:
const name = parts[parts.length - 1] ?? ''
```

---

## 📝 Sessão Anterior (Fevereiro 2026 — v4.0.0)

### 🎭 1. Reformulação Completa da Ficha de Personagem V5

#### Componente: `PlayerSheet.vue` (~1206 linhas)

**ANTES (v3.0):**
- Ficha genérica com campos misturados (V20 + V5)
- Campo "Jogador" no cabeçalho
- Seção "Notas Gerais" no final
- Seção "Níveis de Saúde" (estilo V20)
- 4 campos de Idade e Datas
- Habilidades em ordem alfabética inglesa
- Disciplinas como campo de texto livre
- Sem Fome, Condições, Vitalidade
- Sem design visual vampírico

**DEPOIS (v4.0):**
- Ficha 100% V5 com layout oficial
- Campo "Jogador" removido
- "Notas Gerais" e "Níveis de Saúde" removidos
- "Geração do Abraço" (dropdown Cria/Neófito/Ancião) substituiu 4 campos
- Habilidades na ordem oficial V5 em PT-BR
- Disciplinas como dropdown (15 opções V5)
- Fome (5 bolinhas vermelhas, padrão 1)
- Condições Narrativas (lista dinâmica)
- Vitalidade (10 bolinhas verdes)
- Potência de Sangue (10 círculos + campos de modificadores)
- Vantagens & Defeitos (lista dinâmica com níveis)
- Avatar circular + nome vermelho grande no cabeçalho
- Borda vampírica vermelha com ornamentos nos cantos
- Sombra vermelha (glow) com box-shadow

### 2. Atualização da Interface TypeScript

#### Arquivo: `app/types/index.ts`

**Campos removidos:**
- `healthLevels` (não existe no V5)
- `trueAge` (substituído por embraceGeneration)
- `apparentAge` (substituído)
- `dateOfBirth` (substituído)
- `dateOfDeath` (substituído)

**Campos adicionados:**
- `embraceGeneration?: string`
- `hunger?: number`
- `conditions?: string[]`
- `vitality?: number`
- `bloodPotency?: number`
- `advantages?: Array<{ name: string; level: number }>`
- `bloodSurge?: string`
- `powerBonus?: string`
- `feedingPenalty?: string`
- `baneSeverity?: string`
- `resonance?: string`
- `chronicleTenets?: string`
- `touchstonesConvictions?: string`
- `clanBane?: string`
- `appearance?: string`
- `distinguishingFeatures?: string`

### 3. Layout Responsivo Reorganizado

**Grid do cabeçalho:**
```
ANTES: grid-cols-2 sm:grid-cols-4 (4 campos por linha)
DEPOIS: sm:grid-cols-3 (3 campos por linha, 2 linhas)
  Linha 1: Nome / Conceito / Clã
  Linha 2: Geração / Seita / Refúgio
```

**Grid principal (2 colunas):**
```
Grid 1:
  Esquerda: Disciplinas + Vantagens & Defeitos + Fome
  Direita:  Potência de Sangue + Experiência

Grid 2:
  Esquerda: Virtudes (3  5 amarelas)
  Direita:  Humanidade (10 vermelhas) + Vontade (10 azuis) + Vitalidade (10 verdes)
```

### 4. Design Visual Vampírico

```css
/* Borda principal */
border-4 border-red-900
box-shadow: 0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 20px rgba(220, 38, 38, 0.1)

/* Ornamentos nos cantos (fora do scroll) */
border-t-4 border-l-4 border-red-600 opacity-60

/* Nome do personagem */
text-xl sm:text-2xl md:text-4xl font-bold text-red-400 tracking-wider uppercase
```

---

## 🔄 Sessão Anterior (Janeiro 2026)

### 🔗 Integração Supabase
- Autenticação real com Supabase Auth
- Tabelas campaigns + campaign_players
- RLS policies implementadas
- 100% dos mocks removidos

### Sistema de Convites
- Códigos únicos de 6 caracteres
- Página /join-campaign
- Constraint UNIQUE anti-duplicata

### Otimizações Técnicas
- Imports explícitos em todos os componentes
- BaseButton reutilizado consistentemente
- vue-router substituído por navigateTo do Nuxt

---

## 🗄️ Banco de Dados

### 📊 Tabelas Supabase:

```sql
campaigns (
  id uuid PK, name text, description text,
  master_id uuid FK, invite_code text UNIQUE,
  is_active boolean, created_at timestamp, updated_at timestamp
)

campaign_players (
  user_id uuid FK, campaign_id uuid FK,
  character_name text, role text DEFAULT 'player',
  sheet jsonb,        -- Ficha V5 completa como JSON
  joined_at timestamp,
  UNIQUE(campaign_id, user_id)
)
```

### RLS Policies:
- campaigns: usuários veem apenas suas campanhas
- campaign_players: permissões por papel (mestre/jogador)

---

## ✅ Estado Validado

- ✅ Build sem erros (exit code 0)
- Nenhum campo antigo (trueAge, healthLevels etc.) restante nos arquivos
- TypeScript sem erros de tipo
- Ficha V5 funcional com salvamento e sync para dashboard
- Borda vampírica sem clipping no scroll
- Condições filtradas (vazias removidas) no salvamento
