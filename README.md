<div align="center">
 
 # 🩸 VTM V5 - Sistema de Gerenciamento de Campanhas

![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge)

> Sistema completo de gerenciamento de campanhas de **Vampire: The Masquerade V5** com jogo ao vivo em tempo real, eventos persistentes e integração total com Supabase.

</div>

---

## 📋 Índice

- [✨ Visão Geral](#-visão-geral)
- [🎯 Status do Projeto](#-status-do-projeto)
- [🎮 Funcionalidades](#-funcionalidades)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🚀 Instalação e Uso](#-instalação-e-uso)
- [🗄️ Banco de Dados](#️-banco-de-dados)
- [📚 Documentação](#-documentação)

---

## ✨ Visão Geral

**Versão Atual:** 5.0.0 - Sistema de Jogo ao Vivo Completo  
**Última Atualização:** Maio 19, 2026

Uma plataforma web completa para mestres e jogadores gerenciarem suas crônicas de Vampire: The Masquerade V5. Sistema desenvolvido com foco em experiência do usuário, sincronização em tempo real e design vampírico imersivo.

### 🎯 Objetivo

Proporcionar uma experiência digital completa para campanhas de V5, desde a criação de personagens até sessões de jogo ao vivo com transmissão de mídia em tempo real.

---

## 🎯 Status do Projeto

### ✅ Funcionalidades Completas (100%)

| Área | Implementação |
|------|--------------|
| 🔐 Autenticação | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) |
| 👥 Sistema de Campanhas | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) |
| 🎭 NPCs Integrados | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) |
| 📜 Eventos Persistentes | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) |
| 🎮 Jogo ao Vivo | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) |
| 🖼️ Upload de Mídia | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) | 
| 🗺️ Mapa interativo com Marcadores | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) |
| 🗺️ Mapa Político | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) |
| ⚡ Real-time Sync | ![100%](https://img.shields.io/badge/100%25-success?style=flat-square) |

### 🚧 Em Desenvolvimento

| Área | Progresso |
|------|-----------|
| 📝 Ficha V5 | ![80%](https://img.shields.io/badge/80%25-yellow?style=flat-square) |
| 💬 Chat em Tempo Real | ![30%](https://img.shields.io/badge/30%25-yellow?style=flat-square) |
| ⚔️ Combat Tracker | ![10%](https://img.shields.io/badge/10%25-red?style=flat-square) |

---

## 🎮 Funcionalidades

### 🎭 Para Jogadores

- ✅ Dashboard com estado atual do vampiro (Fome, Humanidade, Vontade, Condições)
- ✅ Ficha de personagem V5 completa e editável
- ✅ Layout oficial com habilidades, disciplinas, virtudes, potência de sangue
- ✅ Design vampírico com borda vermelha, ornamentos e avatar
- ✅ Salvamento automático com sincronização do dashboard
- ✅ **Modo Jogo ao Vivo**: visualização da cena atual com imagem e áudio sincronizados
- ✅ **Timeline da sessão**: eventos em tempo real durante o jogo

### 🎬 Para Mestres

- ✅ Dashboard avançado com **6 abas especializadas**:
  - **Visão Geral**: resumo da campanha e informações principais
  - **Jogadores**: gerenciar jogadores e visualizar fichas (somente leitura)
  - **NPCs**: criar, editar e gerenciar NPCs (integrado com Supabase)
  - **Eventos**: timeline persistente com filtros por tipo e personagem
  - **Política**: mapa político completo (governo, facções, relações, territórios)
  - **Mídia**: upload e gerenciamento de imagens, áudio e documentos
- ✅ **Sistema de Sessão ao Vivo** (`live.vue`):
  - Controle de cena com imagem e áudio em tempo real
  - Timeline de eventos da sessão
  - Gerenciamento de NPCs ativos na cena
  - Sincronização instantânea com jogadores via Supabase Realtime
- ✅ Sistema de convites por código único
- ✅ Event Sourcing para histórico completo da campanha

### 📋 Sistema de Campanhas

- ✅ Criação de campanhas com código de convite automático
- ✅ Múltiplos papéis: mesmo usuário pode ser Mestre em uma e Jogador em outra
- ✅ Dados persistentes no Supabase com Row Level Security (RLS)
- ✅ Constraint anti-duplicata (1 usuário = 1 participação por campanha)
- ✅ **Sistema de Eventos Persistentes**: histórico completo da crônica com filtros
- ✅ **Jogo ao Vivo**: sessões síncronas com mídia em tempo real
- ✅ **Real-time**: atualizações instantâneas via Supabase Realtime subscriptions

### 📝 Ficha V5 (PlayerSheet)

- ✅ Atributos: Físicos/Sociais/Mentais com bolinhas interativas
- ✅ Habilidades na ordem oficial V5 em português
- ✅ Disciplinas como dropdown (15 opções V5)
- ✅ Fome: 5 bolinhas vermelhas (padrão 1)
- ✅ Vitalidade: 10 bolinhas verdes
- ✅ Humanidade: 10 bolinhas vermelhas
- ✅ Vontade: 10 bolinhas azuis
- ✅ Virtudes: 3 × 5 bolinhas amarelas
- ✅ Potência de Sangue: 10 círculos + modificadores
- ✅ Vantagens & Defeitos: lista dinâmica com níveis
- ✅ Condições Narrativas: adicionar/remover
- ✅ Geração do Abraço: Cria/Neófito/Ancião
- ✅ Design vampírico: borda vermelha, ornamentos, avatar, sombra glow

---

## 🛠️ Stack Tecnológica

### Core

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| [Vue 3](https://vuejs.org/) | 3.x | Framework JavaScript reativo |
| [Nuxt](https://nuxt.com/) | 4.x | Meta-framework Vue.js com SSR |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Superset tipado do JavaScript |

### Styling

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| [Tailwind CSS](https://tailwindcss.com/) | 3.4+ | Framework CSS utility-first |
| Custom Theme | - | Tema vampírico dark customizado |

### Backend & Database

| Tecnologia | Descrição |
|-----------|-----------|
| [Supabase](https://supabase.com/) | Auth + PostgreSQL + Storage + Realtime |
| Row Level Security | Políticas de segurança em nível de linha |
| Supabase Realtime | WebSockets para sincronização instantânea |
| Supabase Storage | Armazenamento de mídias (imagens/áudio/docs) |

---

## 📁 Estrutura do Projeto

```
vampire-app/
├── 📁 app/
│   ├── 📁 components/
│   │   ├── 📁 auth/
│   │   │   ├── AuthForm.vue
│   │   │   ├── AuthHeader.vue
│   │   │   └── LoginForm.vue
│   │   ├── 📁 campaign/
│   │   │   ├── PlayerSheet.vue          # 📝 Ficha V5 (~1206 linhas)
│   │   │   ├── Timeline.vue
│   │   │   ├── TimelineItem.vue
│   │   │   ├── MediaPlayer.vue
│   │   │   ├── MapViewer.vue
│   │   │   └── 📁 master/
│   │   │       ├── OverviewTab.vue
│   │   │       ├── PlayersTab.vue
│   │   │       ├── NPCsTab.vue
│   │   │       ├── EventsTab.vue        # 📜 Eventos persistentes
│   │   │       ├── PoliticsTab.vue      # 🗺️ Mapa político
│   │   │       ├── MediaTab.vue
│   │   │       ├── SettingsTab.vue
│   │   │       └── EventCard.vue
│   │   └── 📁 ui/
│   │       ├── BaseButton.vue
│   │       ├── BaseCard.vue
│   │       ├── BaseModal.vue
│   │       └── ...
│   ├── 📁 composables/
│   │   ├── useAuth.ts                   # 🔐 Autenticação
│   │   ├── useCampaign.ts               # 👥 Campanhas e NPCs
│   │   ├── useEvents.ts                 # 📜 Event Sourcing
│   │   ├── useLiveGame.ts               # 🎮 Jogo ao vivo
│   │   └── useToast.ts
│   ├── 📁 pages/
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── dashboard.vue
│   │   └── 📁 campaign/[id]/
│   │       ├── player.vue               # 🎭 Dashboard jogador
│   │       ├── master.vue               # 🎬 Dashboard mestre
│   │       ├── live.vue                 # 🎮 Sessão ao vivo (Mestre)
│   │       └── live-player.vue          # 🎮 Sessão ao vivo (Jogador)
│   └── types/index.ts                   # 📐 Tipos TypeScript
├── 📁 database/                          # 🗄️ Scripts SQL
│   ├── supabase-schema.sql
│   ├── add-campaign-events.sql
│   ├── add-live-media-columns.sql
│   └── README.md
├── 📄 nuxt.config.ts
├── 📄 tailwind.config.js
└── 📄 package.json
```

---

## 🚀 Instalação e Uso

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/devnicholasf/vampire-app.git
cd vampire-app

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### Build de Produção

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

### Limpar Cache

```bash
# Se necessário
rm -rf .nuxt
npm run postinstall
```

---

## 🗄️ Banco de Dados

### Tabelas Principais

```sql
campaigns              -- Dados da campanha
campaign_players       -- Jogadores (coluna sheet JSONB com ficha V5)
live_game_state       -- Estado da sessão ao vivo
campaign_events       -- Event Sourcing (timeline persistente)
npcs                  -- NPCs integrados no sistema
```

### Setup Inicial

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL na pasta `database/` na ordem:

```sql
-- 1. Schema principal
database/supabase-schema.sql

-- 2. Features adicionais
database/add-campaign-events.sql
database/add-invite-code.sql
database/add-live-media-columns.sql
database/add-npc-fields.sql
database/add-player-sheet-column.sql
database/add-campaign-media-storage.sql
```

3. Configure o Storage bucket `campaign-media` (público) no Supabase Dashboard

### Scripts Úteis

- `database/check-player-data.sql` - Queries de diagnóstico
- `database/supabase-clean-and-fix.sql` - Correção de políticas RLS
- `database/README.md` - Documentação completa dos scripts

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura completa do sistema |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de mudanças detalhado |
| [DEV_GUIDE.md](./DEV_GUIDE.md) | Guia de desenvolvimento |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | Status detalhado de implementação |
| [ARCHITECTURAL_CHANGES.md](./ARCHITECTURAL_CHANGES.md) | Mudanças arquiteturais |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Guia de migração técnica |
| [database/README.md](./database/README.md) | Documentação do banco de dados |

---

## 🔧 Funcionalidades Técnicas

### ⚡ Performance

- SSR (Server-Side Rendering) com Nuxt 4
- Code splitting automático
- Otimização de assets
- Real-time com WebSockets

### 🎨 Design

- Tema vampírico dark customizado
- Design responsivo mobile-first
- Componentes reutilizáveis
- Animações suaves

### 🔒 Segurança

- Row Level Security (RLS) no Supabase
- Autenticação segura com tokens JWT
- Proteção de rotas com middleware
- Variáveis de ambiente protegidas

### 🔄 Real-time

- Sincronização instantânea via Supabase Realtime
- Atualizações de mídia ao vivo
- Timeline de eventos em tempo real
- Estado do jogo sincronizado

---

## 🎯 Próximos Passos

- [ ] Combat Tracker funcional
- [ ] Chat em tempo real completo
- [ ] Sistema de notificações push
- [ ] Deploy em produção 
- [ ] Atualizar NPCSheet para padrão V5 completo

---

<div align="center">

## 👨‍💻 Desenvolvido por

**Nicholas Freitas**

[![GitHub](https://img.shields.io/badge/GitHub-devnicholasf-181717?style=for-the-badge&logo=github)](https://github.com/devnicholasf)

---

**Sistema desenvolvido para campanhas épicas de Vampire: The Masquerade V5! 🦇**
