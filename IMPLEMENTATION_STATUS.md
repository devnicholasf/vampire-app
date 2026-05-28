# 📊 Status de Implementação

![Version](https://img.shields.io/badge/Version-5.1.0-blue?style=flat-square)
![Progress](https://img.shields.io/badge/Overall-92%25-success?style=flat-square)
![Last_Updated](https://img.shields.io/badge/Updated-May_28_2026-green?style=flat-square)

> Rastreamento detalhado do progresso de implementação de todas as funcionalidades

**Última Atualização:** Maio 28, 2026  
**Versão Atual:** 5.1.0

---

## 📋 Índice

- [📈 Resumo Geral](#-resumo-geral)
- [⚠️ Ação Pendente](#️-ação-pendente)
- [🎮 Sistema de Jogo ao Vivo](#-sistema-de-jogo-ao-vivo)
- [📁 Aba Mídia](#-aba-mídia)
- [📝 Ficha de Personagem V5](#-ficha-de-personagem-v5)
- [🎨 Componentes](#-componentes)
- [📄 Páginas](#-páginas)
- [⚙️ Composables](#️-composables)
- [📐 Tipos TypeScript](#-tipos-typescript)
- [🎯 Próximos Passos](#-próximos-passos)

---

## 📈 Resumo Geral

| Área | Status | Progresso |
|------|--------|-----------|
| Autenticação | ✅ Completo | 100% |
| Campanhas | ✅ Completo | 100% |
| Convites | ✅ Completo | 100% |
| Dashboard Jogador | ✅ Completo | 100% |
| Ficha V5 (PlayerSheet) | ✅ Completo | 100% |
| Dashboard Mestre | ✅ Completo | 95% |
| NPCs | ✅ Funcional | 90% |
| Timeline | ✅ Funcional | 85% |
| Mídia/Upload (MediaTab) | ✅ Funcional | 85% |
| Jogo ao Vivo — Mestre (live.vue) | ✅ Funcional | 95% |
| Jogo ao Vivo — Jogador (live-player.vue) | ✅ Funcional | 95% |
| Sistema de Dados V5 (DiceEngine/useDice) | ✅ Completo | 100% |
| Chat | ⚠️ Parcial | 30% |
| Combate | ❌ Pendente | 10% |

---

## 🧭 Sessão Atual (Maio 28, 2026)

### ✅ Concluído nesta sessão
- Sistema de Dados V5 implementado e integrado em `live.vue` e `live-player.vue`
- Engine RNG corrigida com validação estatística (`testeEstatistico()`)
- Feed de rolagens visível para mestre e jogador
- Sincronização de áudio otimizada (volume inicial 20%, sem debounce, latência reduzida)
- Fluxo de saída revisado para manter sessão ativa em navegação interna
- Modal de confirmação para saída via botão "Dashboard"

### ⚠️ Ponto em validação
- Confirmação/encerramento ao fechar aba/navegador depende de comportamento do `beforeunload` do navegador
- Navegadores modernos não permitem modal customizado no fechamento da aba; usam diálogo nativo

### 📌 Próximo chat deve validar
1. Se a sessão está encerrando corretamente ao fechar aba/navegador do mestre
2. Se o fluxo "Dashboard" está: cancelar mantém online, confirmar encerra e sai
3. Se o script SQL `database/create-dice-rolls.sql` já foi executado no Supabase

---

## ⚠️ AÇÃO PENDENTE — BANCO DE DADOS

Execute estes SQLs no Supabase SQL Editor:

```sql
-- database/add-live-media-columns.sql
ALTER TABLE live_game_state
  ADD COLUMN IF NOT EXISTS current_image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_audio_url  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS current_audio_playing BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_audio_time DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_audio_volume INTEGER DEFAULT 20;

-- database/create-dice-rolls.sql
-- Criar tabela dice_rolls e índices (arquivo completo na pasta database)
```

---

## 🎮 Sistema de Jogo ao Vivo (v5.1.0)

### 🏗️ Arquitetura de Mídia ao Vivo

```
Mestre (live.vue)
  └─ Picker de Imagens / Áudio (do Storage bucket 'campaign-media')
       └─ Clica olho → toggleMediaVisibility()
            └─ updateSceneMedia(campaignId, imgUrl, audUrl)
                 └─ Supabase UPDATE live_game_state
                      └─ Realtime NOTIFY
                           └─ Jogador (live-player.vue) recebe e exibe
```

### Componentes/Composables do Sistema ao Vivo

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `app/pages/campaign/[id]/live.vue` | ✅ | Tela do mestre — NPCs, cena, mídia, eventos |
| `app/pages/campaign/[id]/live-player.vue` | ✅ | Tela do jogador — recebe estado ao vivo |
| `app/composables/useLiveGame.ts` | ✅ | Estado compartilhado + updateSceneMedia |
| `app/components/campaign/master/MediaTab.vue` | ✅ | Upload/gerência de arquivos |
| `database/add-live-media-columns.sql` | ⚠️ | EXECUTAR NO SUPABASE |

### Tabela live_game_state — Colunas relevantes
```sql
campaign_id        uuid FK
is_live            boolean
current_scene      text
current_npcs       jsonb   -- array de NPCs com isVisible, isSpotlight
timeline_events    jsonb   -- eventos da sessão
current_image_url  text    -- URL da imagem transmitida (NOVA)
current_audio_url  text    -- URL do áudio transmitido (NOVA)
```

### Interface MediaItem (live.vue)
```typescript
interface MediaItem {
  name: string
  url: string
  type: 'image' | 'audio'
  visibleToPlayers: boolean
}
```

### Funções principais em live.vue
```typescript
loadMediaFiles()           // Carrega imagens/áudios do Storage bucket
addMediaToScene(item, type)  // Adiciona ao painel da cena
removeMediaFromScene(item)   // Remove; limpa transmissão se visível
toggleMediaVisibility(item)  // Alterna olho + chama updateSceneMedia
```

---

## 📁 Aba Mídia — MediaTab.vue

### 🗂️ Bucket Storage: `campaign-media`
- Arquivos organizados em pastas: `{campaignId}/{filename}`
- Nome do arquivo preservado (sem timestamp)
- `upsert: true` permite re-upload do mesmo arquivo

### Tipos suportados
| Tipo | Extensões |
|------|-----------|
| Imagem | .jpg, .jpeg, .png, .gif, .webp, .svg |
| Áudio | .mp3, .wav, .ogg, .flac, .m4a, .aac |
| Documento | .pdf, .txt, .doc, .docx, .ppt, .pptx, .xls, .xlsx |

---



### Componente: `app/components/campaign/PlayerSheet.vue` (~1206 linhas)

**Status:  COMPLETO E FUNCIONAL**

### Estrutura do Componente

#### Seções da Ficha (template):
- **Linhas 1-50**: Cabeçalho com avatar + nome + borda vampírica + ornamentos
- **Linhas ~60-120**: Campos do cabeçalho (3+3 grid: Nome/Conceito/Clã | Geração/Seita/Refúgio)
- **Linhas ~120-200**: Atributos (Físicos/Sociais/Mentais  5 bolinhas cada)
- **Linhas ~200-280**: Habilidades V5 (Talentos/Perícias/Conhecimentos  5 bolinhas)
- **Linhas ~280-520**: Grid 1 - Disciplinas+Vantagens+Fome | Potência+Experiência
- **Linhas ~520-640**: Grid 2 - Virtudes | Humanidade+Vontade+Vitalidade
- **Linhas ~640-700**: Ressonância, Princípios, Pilares, Perdição
- **Linhas ~700-710**: Geração do Abraço (dropdown Cria/Neófito/Ancião)
- **Linhas ~710-780**: Aparência, Traços Distintivos, Condições, História
- **Linhas ~780-890**: Modais de confirmação (fechar + salvar)

#### Script (lógica):
- **Linhas ~885-890**: Refs do modal (showConfirmModal, showSaveConfirmModal)
- **Linhas ~893-915**: getInitials() helper
- **Linhas ~895-900**: vampireClans array (14 clãs)
- **Linhas ~900-920**: vampireDisciplines array (15 disciplinas V5)
- **Linhas ~920-940**: Atributos (physicalAttributes, socialAttributes, mentalAttributes)
- **Linhas ~940-980**: Habilidades V5 (talents, skills, knowledges - ordem oficial PT-BR)
- **Linhas ~980-985**: Virtudes array
- **Linhas ~985-1030**: sheetData ref (todos campos da ficha)
- **Linhas ~1035-1110**: Métodos (setAttribute, setSkill, setDiscipline, setVirtue, add/remove)
- **Linhas ~1110-1130**: addCondition/removeCondition, setBloodPotency
- **Linhas ~1130-1206**: validateRequiredFields, saveSheet, confirmSave, handleClose

### Campos da sheetData:
```typescript
{
  name, concept, clan, generation, sect, haven, player,
  resonance, chronicleTenets, touchstonesConvictions, clanBane,
  advantages: [{ name, level }],
  bloodPotency, bloodSurge, powerBonus, feedingPenalty, baneSeverity,
  xpTotal, xpSpent, embraceGeneration,
  appearance, distinguishingFeatures, history,
  attributes: { physical, social, mental },
  skills: { talents, skills, knowledges },
  disciplines: [{ name, level }],
  virtues: { conscience, selfControl, courage },
  humanity, willpower, vitality,
  hunger (padrão: 1),
  conditions: ['']
}
```

### Fluxo de Salvamento:
1. Usuário clica "Salvar"  `saveSheet()` valida campos
2. Modal de confirmação aparece  usuário confirma
3. `confirmSave()` filtra condições vazias
4. `emit('save', { ...player, sheet: sheetData })`  componente pai
5. Pai chama `saveCharacterSheet()`  `savePlayerSheet()`  banco Supabase
6. `loadCampaignData()` recarrega dados  dashboard atualiza

---

## 🎨 Componentes

### 📁 Campanha (`app/components/campaign/`)
| Componente | Status | Descrição |
|-----------|--------|-----------|
| PlayerSheet.vue |  | Ficha V5 completa (~1206 linhas) |
| PlayerAvatar.vue |  | Avatar com atributos VtM |
| Timeline.vue |  | Timeline interativa |
| TimelineItem.vue |  | Item da timeline |
| MediaPlayer.vue |  | Player de música |
| AddEventModal.vue |  | Modal de evento |
| CombatTracker.vue |  | Estrutura base |
| MapViewer.vue |  | Estrutura base |

### Mestre (`app/components/campaign/master/`)
| Componente | Status | Descrição |
|-----------|--------|-----------|
| NPCsTab.vue |  | Gerenciamento de NPCs |
| NPCModal.vue |  | Criar/editar NPC |
| NPCDetailsModal.vue |  | Detalhes do NPC |
| NPCSheet.vue |  | Ficha do NPC |
| PlayersTab.vue |  | Gestão de jogadores |
| MediaTab.vue |  | Biblioteca de mídia |
| NotesTab.vue |  | Anotações privadas |
| SettingsTab.vue |  | Configurações |

### UI (`app/components/ui/`)
| Componente | Status | Descrição |
|-----------|--------|-----------|
| BaseButton.vue |  | Botão com variantes |
| BaseCard.vue |  | Card estilo vampire |
| BaseInput.vue |  | Input com CAPS LOCK |
| BaseModal.vue |  | Modal genérico |
| BaseBadge.vue |  | Badge para status |
| BaseTabs.vue |  | Abas genéricas |
| BaseToast.vue |  | Notificação toast |
| ToastContainer.vue |  | Container de toasts |
| ChatModal.vue |  | Modal de chat |
| WodButton.vue |  | Botão WoD flutuante |
| UserProfile.vue |  | Perfil do usuário |
| NotificationsDropdown.vue |  | Notificações |
| DirectMessages.vue |  | Mensagens diretas |

---

## 📄 Páginas

| Página | Status | Descrição |
|--------|--------|-----------|
| `/` (index) |  | Página inicial |
| `/login` |  | Login com Supabase |
| `/register` |  | Registro de conta |
| `/dashboard` |  | Lista de campanhas |
| `/join-campaign` |  | Entrar via código |
| `/forgot-password` |  | Recuperar senha |
| `/terms` |  | Termos de uso |
| `/privacy` |  | Privacidade |
| `/debug` |  | Página de debug |
| `/campaign/[id]` |  | Tela compartilhada |
| `/campaign/[id]/player` |  | Dashboard do jogador |
| `/campaign/[id]/master` |  | Dashboard do mestre |
| `/campaign/[id]/live` |  | Jogo ao vivo (parcial) |

---

## ⚙️ Composables

| Composable | Status | Funções Principais |
|-----------|--------|-------------------|
| useAuth.ts |  | login, register, logout, restoreSession |
| useCampaign.ts |  | fetchCampaigns, createCampaign, joinByInviteCode, savePlayerSheet |
| useChat.ts |  | Sistema de chat (parcial) |
| useLiveGame.ts |  | Jogo ao vivo (parcial) |
| useNotifications.ts |  | Sistema de notificações |
| useSeo.ts |  | Meta tags e SEO |
| useToast.ts |  | Toasts profissionais |

---

## 📐 Tipos TypeScript (`app/types/index.ts`)

### 📝 Interface CharacterSheet (atualizada V5):
```typescript
export interface CharacterSheet {
  name: string
  concept: string
  clan: string
  generation: number
  sect: string
  haven: string
  player: string
  avatar?: string
  resonance?: string
  chronicleTenets?: string
  touchstonesConvictions?: string
  clanBane?: string
  advantages?: Array<{ name: string; level: number }>
  bloodPotency?: number
  bloodSurge?: string
  powerBonus?: string
  feedingPenalty?: string
  baneSeverity?: string
  embraceGeneration?: string   // Cria/Neófito/Ancião
  appearance?: string
  distinguishingFeatures?: string
  history?: string
  attributes: { physical, social, mental }
  skills: { talents, skills, knowledges }
  disciplines: Array<{ name: string; level: number }>
  virtues: { conscience: number; selfControl: number; courage: number }
  humanity: number
  willpower: number
  vitality?: number            // Vitalidade (V5)
  hunger?: number              // Fome (1-5, padrão 1)
  conditions?: string[]        // Condições narrativas
  xpTotal?: number
  xpAvailable?: number
  xpSpent?: number
  notes?: string               // Opcional
}
```

---

## 🎯 Próximos Passos

### 🔴 Prioridade Alta
- [ ] Integrar NPCs com Supabase (tabela `npcs`)
- [ ] Sistema de timeline persistente (tabela `timeline_events`)
- [ ] Upload real de mídia via Supabase Storage
- [ ] Completar jogo ao vivo (`/campaign/[id]/live`)

### Prioridade Média
- [ ] Combat Tracker funcional
- [ ] Sistema de chat em tempo real
- [ ] Supabase Realtime para atualizações ao vivo
- [ ] NPCSheet.vue - atualizar para padrão V5 (ainda usa healthLevels)

### Prioridade Baixa
- [ ] Gerador automático de NPCs
- [ ] Sistema de dados (rolagem)
- [ ] Map Viewer com zoom/pan
- [ ] Temas customizáveis
- [ ] Deploy Vercel/Netlify
