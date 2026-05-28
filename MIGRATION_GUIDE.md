# 🔄 Guia de Migração

![Version](https://img.shields.io/badge/Version-5.1.0-blue?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

> Guia completo para migração entre versões e setup de novos ambientes

**Versão Atual:** 5.1.0  
**Última Atualização:** Maio 28, 2026

---

## 📋 Índice

- [⚠️ Ações Obrigatórias](#️-ações-obrigatórias)
- [💥 Breaking Changes](#-breaking-changes)
- [🏗️ Arquitetura de Mídia ao Vivo](#️-arquitetura-de-mídia-ao-vivo)
- [🔧 Pontos de Atenção Técnicos](#-pontos-de-atenção-técnicos)
- [📁 Estrutura de Arquivos Modificados](#-estrutura-de-arquivos-modificados)
- [🔨 Comandos Úteis](#-comandos-úteis)
- [🐛 Troubleshooting](#-troubleshooting)
- [🎯 Próximos Passos](#-próximos-passos)

---

## ⚠️ Ações Obrigatórias

### 1. SQL Migrations Pendentes

Execute estes scripts no Supabase SQL Editor:

```sql
-- 1. Adicionar colunas de mídia ao vivo
-- Arquivo: database/add-live-media-columns.sql
ALTER TABLE live_game_state
  ADD COLUMN IF NOT EXISTS current_image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_audio_url  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_audio_playing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_audio_time DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_audio_volume INTEGER DEFAULT 20;

-- 2. Criar tabela de rolagens de dados
-- Arquivo: database/create-dice-rolls.sql
CREATE TABLE IF NOT EXISTS dice_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  character_name TEXT NOT NULL,
  roll_type TEXT NOT NULL,
  attribute TEXT NOT NULL,
  skill TEXT,
  pool_total INTEGER NOT NULL,
  hunger INTEGER NOT NULL,
  difficulty INTEGER NOT NULL,
  modifier INTEGER DEFAULT 0,
  dice_results JSONB NOT NULL,
  successes INTEGER NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  is_messy_critical BOOLEAN DEFAULT false,
  is_bestial_failure BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dice_rolls_campaign ON dice_rolls(campaign_id, created_at DESC);
```

### 2. Configuração do Supabase Storage

- Criar bucket `campaign-media` (público)
- Configurar RLS policies conforme `database/add-campaign-media-storage.sql`

### 3. Variáveis de Ambiente

```bash
cp .env.example .env
# Preencher com suas credenciais do Supabase
```

---

## 💥 Breaking Changes (v5.0.0)

### 🎮 Sistema de Jogo ao Vivo

**Antes (v4.0):**
- Sem sistema de mídia em tempo real
- NPCs não sincronizavam durante sessão

**Depois (v5.0):**
- Mídia (imagem + áudio) transmitida em tempo real
- Requer novas colunas em `live_game_state`
- `useLiveGame.ts` exporta refs como `readonly`

**Como migrar:**
1. Executar SQL migration (acima)
2. Atualizar código que usa `isGameLive.value = ...` → usar funções do composable
3. Testar fluxo completo: upload → picker → transmissão → jogador vê

---

## 🏗️ Arquitetura de Mídia ao Vivo

### 📡 Fluxo de Transmissão

```
Mestre (live.vue)
  └─ Picker de Imagens/Áudio (Storage bucket 'campaign-media')
       └─ Clica olho → toggleMediaVisibility()
            └─ updateSceneMedia(campaignId, imgUrl, audUrl)
                 └─ Supabase UPDATE live_game_state
                      └─ Realtime NOTIFY
                           └─ Jogador (live-player.vue) recebe update
```

### Novos Exports do useLiveGame

```typescript
// ANTES (v4.0)
const { isGameLive, currentNpcs } = useLiveGame()
isGameLive.value = true  // ✅ Funcionava

// DEPOIS (v5.0)
const { isGameLive, currentSceneMedia, updateSceneMedia } = useLiveGame()
isGameLive.value = true  // ❌ ERRO: readonly
startLiveGame(campaignId)  // ✅ Usar função do composable
```

---

## 🔧 Pontos de Atenção Técnicos

### 🔒 1. Refs Readonly

Os composables exportam refs como `readonly` para prevenir mutações diretas:

```typescript
// ❌ ERRADO
currentNpcs.value = newArray

// ✅ CERTO
updateCurrentNpcs(newArray)  // usar função do composable
```

### 2. TypeScript: EventTarget

```typescript
// ❌ ERRADO
e.currentTarget.style.backgroundColor = '#...'

// ✅ CERTO
const el = e.currentTarget as HTMLElement
el.style.backgroundColor = '#...'
```

### 3. Tailwind CSS Dinâmico

```vue
<!-- ❌ ERRADO: classes arbitrárias dinâmicas não funcionam -->
<div :class="`text-[${cor}]`">

<!-- ✅ CERTO: usar :style inline -->
<div :style="{ color: cor }">
```

### 4. Autoplay de Áudio

Navegadores modernos bloqueiam autoplay. Requer interação do usuário:

```typescript
// Estratégia: tentar autoplay, se falhar, mostrar botão "Play"
audio.play().catch(() => {
  showPlayButton.value = true
})
```

---

## 📁 Estrutura de Arquivos Modificados (v5.0)

```
app/
  ├── composables/
  │   └── useLiveGame.ts          ← currentSceneMedia, updateSceneMedia
  ├── pages/campaign/[id]/
  │   ├── live.vue                ← Redesign mídia (NPC-style picker)
  │   └── live-player.vue         ← Recebe mídia em tempo real
  └── components/campaign/master/
      └── MediaTab.vue            ← Correções visuais e encoding

database/
  └── add-live-media-columns.sql  ← Nova migration (EXECUTAR)
```

---

## 🔨 Comandos Úteis

### ⚙️ Desenvolvimento
```bash
npm run dev
npm run build
```

### Limpar Cache
```bash
rm -rf .nuxt
npm run postinstall
```

### Teste de Mídia ao Vivo
1. Acesse `/campaign/[id]/live` (como mestre)
2. Inicie sessão
3. Adicione imagem/áudio
4. Clique no olho (verde = visível)
5. Em outra aba: `/campaign/[id]/live-player` (como jogador)
6. Verifique se mídia aparece em tempo real

---

## 🐛 Troubleshooting

### 🖼️ Mídia não aparece para jogadores
- ✅ Verificar se SQL migration foi executada
- ✅ Verificar se bucket `campaign-media` é público
- ✅ Verificar console do navegador (erros de CORS?)
- ✅ Verificar Supabase Realtime está habilitado

### Áudio não toca automaticamente
- ✅ Normal - navegadores bloqueiam autoplay
- ✅ Jogador precisa interagir com a página primeiro
- ✅ Implementar botão "Play" como fallback

### TypeScript errors após update
- ✅ Verificar se está usando funções do composable (não mutando .value)
- ✅ Cast de EventTarget quando necessário
- ✅ Usar `?? ''` para strings potencialmente undefined

---

## 🎯 Próximos Passos Recomendados

- [ ] Combat Tracker funcional
- [ ] Chat em tempo real (base 30% completa)
- [ ] Atualizar NPCSheet.vue para V5
- [ ] Sistema de notificações push
- [ ] Deploy em produção
