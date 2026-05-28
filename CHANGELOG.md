# 📝 Changelog

![Version](https://img.shields.io/badge/Latest-v5.1.0-blue?style=flat-square)
![Updated](https://img.shields.io/badge/Updated-May_28_2026-green?style=flat-square)

> Histórico completo de mudanças e atualizações do projeto

---

## 📋 Índice

- [v5.1.0 - Sistema de Dados V5 e Áudio Sincronizado](#-versão-510---sistema-de-dados-v5-e-áudio-sincronizado)
- [v5.0.0 - Sistema de Jogo ao Vivo](#-versão-500---sistema-de-jogo-ao-vivo)
- [v4.0.0 - Ficha de Personagem V5](#-versão-400---ficha-de-personagem-v5)
- [v3.0.0 - Sistema Multi-Usuário](#-versão-300---sistema-multi-usuário)
- [v2.0.0 - Sistema de Campanhas](#-versão-200---sistema-de-campanhas)
- [v1.0.0 - Base do Sistema](#-versão-100---base-do-sistema)

---

## 🎲 Versão 5.1.0 - Sistema de Dados V5 e Áudio Sincronizado
**Data:** Maio 28, 2026

### 🎲 **SISTEMA DE DADOS COMPLETO V5 (DiceEngine.ts)**
- Engine de rolagem Vampire V5 com matemática correta
- RNG validado: `Math.floor(Math.random() * 10) + 1` = 1~10 (50% sucesso em 6+)
- Críticos calculados corretamente: par de 10s = 4 sucessos TOTAIS
- Fome SUBSTITUI dados normais (não soma)
- Suporte para: Normal, Oculta, Resistida, Frenesi, Despertar
- Messy Critical e Bestial Failure detectados automaticamente
- Função de teste estatístico `testeEstatistico()` para validação

### 🎨 **COMPONENTES DE DADOS**
- **DiceFeed.vue**: Feed de rolagens em tempo real com scroll automático
- **DiceCard.vue**: Card de resultado com visual V5 (dados ordenados, cores por tipo)
- **DiceRollModal.vue**: Modal de rolagem com cálculo de pool, modificadores e dificuldade
- **RouseCheckButton.vue**: Botão de Teste de Despertar com animação e resultado

### 🔄 **COMPOSABLE useDice.ts**
- `rollDice()` - Executa rolagem completa e salva no banco
- `rouseCheck()` - Teste de Despertar com aumento de Fome
- `loadRolls()` - Carrega histórico de rolagens
- `subscribeToRolls()` - Realtime sync via Supabase
- Estado: `rolls`, `isRolling`, `lastRollId`

### 🗄️ **BANCO DE DADOS**
- Nova tabela `dice_rolls` com todos os campos V5
- Colunas: pool_total, hunger, difficulty, dice_results (JSONB), successes, is_critical, is_messy_critical, is_bestial_failure
- Script SQL: `database/create-dice-rolls.sql` (⚠️ EXECUTAR)

### 🎵 **SISTEMA DE ÁUDIO SINCRONIZADO**
- Sincronização imediata (0ms) sem debounce
- Volume inicial 20% (correção do bug de 100%)
- Eventos otimizados: @play, @pause, @volumechange, @seeked, @loadeddata
- @timeupdate REMOVIDO (causava delay constante)
- Watch com `flush: 'sync'` no player
- Tolerância de tempo reduzida para 0.3s (era 1s)
- Delay total: ~50-100ms (era 300-700ms) = **3-4x mais rápido**

### 🔒 **SISTEMA DE CONFIRMAÇÃO DE SAÍDA**
- Modal customizado ao clicar em "Dashboard" durante sessão ativa
- Dialog padrão do navegador ao fechar aba/navegador (beforeunload)
- Flag `allowPageExit` para controlar saída sem confirmação
- Sessão continua ativa ao navegar no sistema
- Sessão encerra apenas ao: fechar navegador/aba OU botão "Encerrar Sessão"
- Funções: `goBackToMaster()`, `confirmExitAndNavigate()`, `cancelExit()`

### 🔧 **CORREÇÕES TÉCNICAS**
- ✅ Imports explícitos do Vue em todos os componentes de dados
- ✅ useDice.ts com `ref`, `readonly` do Vue
- ✅ live.vue e live-player.vue sem imports duplicados
- ✅ DiceFeed com tipo flexível para arrays readonly
- ✅ .gitignore atualizado (.vscode/, *.backup, *.CORRUPTED.*)
- ✅ Script `dev:chrome` para desenvolvimento no Chrome
- ✅ OverviewTab.CORRUPTED.vue deletado

### 📦 **NOVOS ARQUIVOS**
- `app/components/live/dice/DiceEngine.ts` - Engine de rolagem V5
- `app/components/live/dice/DiceFeed.vue` - Feed de rolagens
- `app/components/live/dice/DiceCard.vue` - Card de resultado
- `app/components/live/dice/DiceRollModal.vue` - Modal de rolagem
- `app/components/live/dice/RouseCheckButton.vue` - Teste de Despertar
- `app/composables/useDice.ts` - Composable de dados
- `app/types/dice.ts` - Types do sistema de dados
- `app/plugins/dice-test.client.ts` - Plugin de teste
- `database/create-dice-rolls.sql` - SQL migration
- `.vscode/settings.json` - Config do VS Code

---

## 🎮 Versão 5.0.0 - Sistema de Jogo ao Vivo
**Data:** Maio 19, 2026

###  **MÍDIAS NA ABA MÍDIA (MediaTab.vue)**
- Player de áudio com cores douradas (`#d4a647`) e esquema escuro
- Título "Mídia da Campanha" em prata (`#c0c0d0`)
- Sub-tabs em dourado
- Fix de encoding TXT: fallback UTF-8 → Windows-1252 para acentos
- Sem flash branco ao abrir visualizador de documento
- Texto mais claro no visualizador e modal de upload
- Botão X visível no visualizador
- **Filename preservado**: arquivos salvos com nome original (sem prefixo `Date.now()`), `upsert: true`

###  **COMPOSABLE useLiveGame.ts**
- `currentSceneMedia` — `useState<{ imageUrl: string; audioUrl: string }>` compartilhado entre Mestre e Jogador
- `updateSceneMedia(campaignId, imageUrl, audioUrl)` — persiste no banco e sincroniza o estado
- `fetchLiveGameState` e `subscribeToLiveGame` sincronizam `currentSceneMedia` do banco

###  **JOGO AO VIVO — MESTRE (live.vue)**
- **Redesign completo de "Mídia da Cena"** no estilo do painel de NPCs:
  - Bloco **Imagens**: picker expansível com busca, thumbnail, botão olho e botão remover
  - Bloco **Áudio**: picker expansível com busca, ícone, botão olho e botão remover
  - Documentos removidos (ficam apenas na aba Mídia do dashboard)
  - Olho verde = transmitindo para jogadores, cinza = oculto
  - Máximo 1 imagem e 1 áudio ativos por vez
  - `toggleMediaVisibility` → `updateSceneMedia` → Supabase Realtime → jogadores veem instantaneamente
- Botão "Gerenciar na Aba Mídia" removido
- Correções TypeScript: `EventTarget` cast, refs readonly, undefined string

###  **JOGO AO VIVO — JOGADOR (live-player.vue)**
- Exibe imagem transmitida pelo mestre em tempo real
- Toca áudio transmitido com autoplay quando URL muda

###  **BANCO DE DADOS**
- Novo script `database/add-live-media-columns.sql`:
  ```sql
  ALTER TABLE live_game_state
    ADD COLUMN IF NOT EXISTS current_image_url TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS current_audio_url  TEXT DEFAULT '';
  ```
  **⚠️ Executar no Supabase SQL Editor antes de usar o sistema de mídia ao vivo.**

---

## 📝 Versão 4.0.0 - Ficha de Personagem V5
**Data:** Fevereiro 12, 2026

###  **FICHA DE PERSONAGEM V5 (PlayerSheet.vue)**
Reformulação completa da ficha de personagem para seguir o padrão oficial do Vampire: The Masquerade 5ª Edição.

####  **Campos Removidos (não-V5)**
- Campo "Jogador" removido do cabeçalho
- Seção "Notas Gerais" removida do final da ficha
- Seção "Níveis de Saúde" removida (não existe no V5)
- Campos "Idade Verdadeira", "Idade Aparente", "Data de Nascimento", "Data de Morte" substituídos

####  **Campos Adicionados (V5)**
- **Fome** (hunger): 5 bolinhas vermelhas com valor padrão 1
- **Vitalidade** (vitality): 10 bolinhas verdes
- **Condições Narrativas** (conditions): lista dinâmica com adicionar/remover
- **Geração do Abraço** (embraceGeneration): dropdown com Cria/Neófito/Ancião
- **Potência de Sangue** (bloodPotency): 10 círculos + campos texto (Surto, Bônus, Penalidade, Gravidade)
- **Vantagens & Defeitos** (advantages): lista dinâmica nome + 5 círculos nível
- **Ressonância**, **Princípios da Crônica**, **Pilares & Convicções**, **Perdição do Clã**

####  **Habilidades na Ordem V5 Oficial (PT-BR)**
- **Talentos**: Armas Brancas, Armas de Fogo, Atletismo, Briga, Condução, Furtividade, Ladroagem, Ofícios, Sobrevivência
- **Perícias**: Empatia com Animais, Etiqueta, Intimidação, Liderança, Manha, Performance, Persuasão, Sagacidade, Subterfúgio
- **Conhecimentos**: Ciência, Erudição, Finanças, Investigação, Medicina, Ocultismo, Percepção, Política, Tecnologia

####  **Disciplinas como Dropdown V5**
- 15 disciplinas disponíveis: Animalismo, Auspícios, Celeridade, Dominação, Feitiçaria de Sangue, Fortitude, Metamorfose, Ofuscação, Potência, Presença, Tenebrosidade, Serpentis, Quietus, Quimerismo, Vicissitude

####  **Layout e Grid Reorganizados**
- Cabeçalho 3+3 (Nome/Conceito/Clã | Geração/Seita/Refúgio)
- Grid 2 colunas: Disciplinas+Vantagens+Fome | Potência+Experiência
- Grid 2 colunas: Virtudes | Humanidade+Vontade+Vitalidade
- Experiência movida para coluna da Potência (preenchendo espaço)

####  **Design Visual Vampírico**
- Avatar circular com iniciais ou imagem no cabeçalho
- Nome do personagem em vermelho, grande, uppercase, tracking-wider
- Borda vermelha (border-4 border-red-900) com sombra vermelha (box-shadow glow)
- Ornamentos decorativos nos 4 cantos (fora do scroll, sem clipping)
- Header sticky com botões Salvar/Fechar

####  **Sincronização Dashboard**
- Fome, Humanidade, Vontade e Condições salvam e aparecem no dashboard do jogador
- Filtro de condições vazias no save
- Fluxo: sheetData  emit('save')  pai salva no banco  loadCampaignData()  dashboard atualiza

###  **Atualizações de Tipos (TypeScript)**
- Interface `CharacterSheet` atualizada em `app/types/index.ts`
- Campos removidos: `healthLevels`, `trueAge`, `apparentAge`, `dateOfBirth`, `dateOfDeath`
- Campos adicionados: `embraceGeneration`, `hunger`, `conditions`, `vitality`, `bloodPotency`, `advantages`
- `notes` agora é opcional

###  **Correções**
- `getInitials()` com optional chaining para evitar erros
- `removeCondition(idx)` tipagem corrigida com `Number(idx)`
- Ornamentos da borda movidos para div wrapper (correção de clipping no scroll)

---

## 👥 Versão 3.0.0 - Sistema Multi-Usuário
**Data:** Janeiro 28, 2026

###  **Integração Supabase Completa**
-  Autenticação real com Supabase Auth substituindo mocks
-  Tabelas campaigns + campaign_players funcionais
-  Row Level Security (RLS) implementado e testado
-  100% dos mocks removidos e substituídos por dados reais

###  **Sistema de Convites**
-  Códigos únicos gerados automaticamente (ex: GELYL0)
-  Página `/join-campaign` com validação completa
-  `joinCampaignByInviteCode()` integrada ao useCampaign
-  Constraint UNIQUE (campaign_id, user_id) anti-duplicata

###  **Sistema Multi-Usuário**
-  Fluxo testado: Mestre cria  Jogador entra  Ambos veem
-  Permissões mestre vs jogador funcionando
-  Contagem de jogadores em tempo real
-  1 usuário = 1 participação por campanha

###  **Otimizações Técnicas**
-  Imports explícitos em todos os componentes
-  BaseButton reutilizado consistentemente
-  vue-router  navigateTo do Nuxt
-  Mapeamento campaign_players  formato template

---

## 📋 Versão 2.0.0 - Sistema de Campanhas
**Data:** Dezembro 2024

###  **Funcionalidades**
-  Páginas de campanha (index, master, player)
-  Sistema completo de NPCs (CRUD com modais)
-  Timeline interativa com filtros
-  Media Player para música ambiente
-  Dashboard do mestre com 5 abas
-  Layout campaign dedicado

---

## 🎯 Versão 1.0.0 - Base do Sistema
**Data:** Novembro 2024

###  **Base**
-  Sistema de autenticação completo
-  Dashboard principal
-  Composables (useAuth, useCampaign)
-  Middleware de proteção de rotas
-  Tipos TypeScript completos
-  Tema vampire customizado com Tailwind
