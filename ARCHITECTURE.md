# 🧛 VAMPIRE RPG - Arquitetura do Sistema

## 📋 Visão Geral

Sistema completo de gerenciamento de campanhas de **Vampire: The Masquerade** desenvolvido com **Vue 3 + Nuxt 3 + Tailwind CSS**.

---

## 🏗️ Estrutura de Pastas

```
vampire-app/
├── app/
│   ├── components/
│   │   ├── auth/              # ✅ Componentes de autenticação
│   │   │   ├── AuthForm.vue       # ✅ Container de formulários auth
│   │   │   ├── AuthHeader.vue     # ✅ Cabeçalho auth
│   │   │   └── LoginForm.vue      # ✅ Formulário de login
│   │   ├── campaign/          # ✅ Componentes da tela de campanha
│   │   │   └── PlayerAvatar.vue   # ✅ Avatar do jogador
│   │   ├── ui/                # ✅ Componentes UI reutilizáveis
│   │   │   ├── BaseButton.vue     # ✅ Botão genérico
│   │   │   ├── BaseCard.vue       # ✅ Card genérico
│   │   │   └── BaseInput.vue      # ✅ Input genérico
│   │   └── WodButton.vue      # ✅ Botão World of Darkness
│   ├── layouts/
│   │   └── auth.vue           # ✅ Layout de autenticação
│   ├── pages/
│   │   ├── index.vue          # ✅ Página inicial
│   │   ├── login.vue          # ✅ Login
│   │   ├── register.vue       # ✅ Registro
│   │   ├── dashboard.vue      # ✅ Dashboard do usuário
│   │   ├── forgot-password.vue# ✅ Recuperar senha
│   │   ├── terms.vue          # ✅ Termos de uso
│   │   ├── privacy.vue        # ✅ Política de privacidade
│   │   └── campaign/          # 🔥 Pasta criada
│   │       ├── [id].vue       # ⚪ Tela de campanha compartilhada
│   │       └── [id]/
│   │           └── master.vue # ⚪ Dashboard do mestre
│   └── app.vue
├── composables/
│   ├── useAuth.ts             # ✅ Autenticação
│   ├── useCampaign.ts         # ✅ Gerenciamento de campanhas
│   ├── useTimeline.ts         # ✅ Timeline de eventos
│   └── useUpload.ts           # ✅ Upload de arquivos
├── middleware/
│   ├── auth.global.ts         # ✅ Proteção de rotas privadas
│   ├── isMaster.ts            # ✅ Verificação de mestre
│   └── isPlayer.ts            # ✅ Verificação de jogador/mestre
├── server/
│   └── api/
│       ├── auth/
│       │   ├── login.post.ts
│       │   └── register.post.ts
│       ├── campaigns/
│       │   ├── user.get.ts
│       │   ├── [id].get.ts
│       │   ├── create.post.ts
│       │   ├── join.post.ts
│       │   └── [id]/
│       │       └── media.patch.ts
│       ├── timeline/
│       │   ├── [campaignId].get.ts
│       │   ├── [campaignId]/add.post.ts
│       │   └── [campaignId]/[eventId].patch.ts
│       └── upload/
│           ├── index.post.ts
│           └── [fileId].delete.ts
├── types/
│   └── index.ts               # ✅ Tipos TypeScript
├── utils/
│   ├── validators.ts
│   └── helpers.ts
├── public/
│   └── images/
├── nuxt.config.ts             # ✅ Configuração do Nuxt
├── tailwind.config.js         # ✅ Configuração do Tailwind
└── package.json
```

---

## 🎯 Fluxo de Funcionalidades

### 1️⃣ **Autenticação**

#### Registro
1. Usuário preenche formulário (`/register`)
2. Dados validados no cliente
3. POST `/api/auth/register`
4. Server cria usuário e retorna JWT
5. Token salvo no localStorage
6. Redirecionado para `/dashboard`

#### Login
1. Usuário preenche credenciais (`/login`)
2. POST `/api/auth/login`
3. Server valida e retorna JWT + dados do usuário
4. Token salvo no localStorage
5. Redirecionado para `/dashboard`

#### Proteção de Rotas
- `auth.global.ts` verifica autenticação em todas as rotas
- Rotas públicas: `/`, `/login`, `/register`
- Rotas privadas: todas as outras

---

### 2️⃣ **Campanhas**

#### Criar Campanha
1. Usuário clica em "Nova Campanha" no `/dashboard`
2. Modal de criação aparece com nome e descrição
3. POST `/api/campaigns/create`
4. **Criador automaticamente vira MESTRE da campanha**
5. Redirecionado para `/campaign/[id]` (tela compartilhada)
6. **Mestre tem acesso adicional ao `/campaign/[id]/master` (dashboard exclusivo)**

#### Entrar em Campanha (como jogador)
1. Usuário recebe link/convite
2. POST `/api/campaigns/join` com dados do personagem
3. Adicionado como jogador
4. Acesso à tela de campanha

#### Permissões e Dashboards
- **Mestre**: 
  - Acesso total à campanha compartilhada (`/campaign/[id]`)
  - Dashboard exclusivo do mestre (`/campaign/[id]/master`)
  - Pode editar, adicionar eventos, fazer uploads
  - Controla mídia (músicas, imagens, mapas)
- **Jogador**: 
  - Apenas acesso à tela de campanha compartilhada (`/campaign/[id]`)
  - Pode ver timeline, party team, mídia atual
  - Não pode editar ou controlar mídia
- Middleware `isMaster.ts` protege rotas exclusivas do mestre
- Middleware `isPlayer.ts` protege a tela de campanha compartilhada

---

### 3️⃣ **Tela de Campanha Compartilhada** (`/campaign/[id]`)

#### Componentes Principais

##### 🎵 **Painel de Mídia**
- Mestre pode fazer upload de:
  - Músicas (MP3, WAV)
  - Imagens (PNG, JPG, WebP)
  - Mapas
  - Documentos (PDF)
- Controle de reprodução de áudio
- Exibição de imagem/mapa atual
- Todos veem as mudanças em tempo real

##### 🧍 **Party Team (PT)**
- Avatares dos jogadores em molduras quadradas
- Upload de avatar local
- Nome + Clã + Geração
- Barra de Fome, Humanidade, Força de Vontade

##### 📜 **Timeline**
- Registro cronológico de eventos
- Tipos: Combate, Roleplay, Descoberta, Social, etc.
- Mestre pode adicionar/editar
- Jogadores podem visualizar
- Filtro por sessão
- Rolagem infinita

##### 🗺️ **Map Viewer**
- Exibe mapa/imagem atual
- Zoom e pan
- Mestre controla

##### 📄 **Documentos**
- Biblioteca de arquivos da campanha
- PDFs, textos, anotações
- Organizados por tipo

---

### 4️⃣ **Dashboard do Mestre** (`/campaign/[id]/master`)

#### Recursos Avançados

##### 📊 **Estatísticas dos Jogadores**
- Visão geral de todos os personagens
- Atributos (Fome, Humanidade, Força de Vontade, Saúde)
- Disciplinas
- Background

##### 📝 **Anotações Privadas**
- Notas que só o mestre vê
- Sistema de tags
- Busca por palavra-chave

##### 👥 **NPC Manager**
- Cadastro de NPCs
- Estatísticas
- Imagens
- Notas privadas
- Clãs e disciplinas

##### 🗺️ **Biblioteca de Mapas**
- Upload e organização de mapas
- Preview
- Usar rapidamente na campanha

##### 🎵 **Biblioteca de Músicas**
- Upload de trilhas sonoras
- Playlists
- Controle de volume

##### ⚔️ **Combat Tracker**
- Gerenciamento de turnos
- Iniciativa
- HP e condições
- Ordem de combate

##### 🎲 **Gerador de NPC**
- Gera NPCs aleatórios
- Clã, disciplinas, background
- Statblock completo

##### 📚 **Histórico Completo**
- Todas as ações da campanha
- Logs de combate
- Eventos da timeline

---

## 🧩 Componentes Implementados

### ✅ **Já Criados e Funcionais**

#### `/app/components/ui/` - UI Reutilizáveis
- **BaseButton.vue** - Botão genérico com variantes (primary, secondary, ghost)
- **BaseCard.vue** - Card genérico com estilo vampire
- **BaseInput.vue** - Input com toggle de senha, detecção CAPS LOCK

#### `/app/components/auth/` - Autenticação
- **AuthForm.vue** - Container para formulários de auth
- **AuthHeader.vue** - Cabeçalho com título e subtítulo
- **LoginForm.vue** - Formulário de login (não usado atualmente)

#### `/app/components/campaign/` - Campanha
- **PlayerAvatar.vue** - Avatar do jogador com atributos VtM

#### `/app/components/` - Especiais
- **WodButton.vue** - Botão flutuante World of Darkness

---

## 🔥 Componentes a Criar

### ⚪ **Pendentes - Tela Compartilhada**

#### `Timeline.vue`
```vue
Props: campaignId, canEdit
Lista de eventos cronológicos
Botão "Adicionar evento" (mestre)
Filtros por tipo e sessão
```

#### `TimelineItem.vue`
```vue
Props: event, canEdit
Card com tipo, título, descrição
Badge de tipo (combate, roleplay, etc)
Editar/deletar (mestre)
```

#### `MediaPlayer.vue`
```vue
Props: campaignId, isMaster
Player de áudio
Controles (play, pause, volume)
Lista de músicas disponíveis
Upload (mestre)
```

#### `MapViewer.vue`
```vue
Props: imageUrl, editable
Exibição de mapa/imagem
Zoom e pan
Trocar imagem (mestre)
```

#### `PartyTeam.vue`
```vue
Props: players
Grid horizontal de avatares
Cada jogador com nome e stats
```

### ⚪ **Pendentes - Dashboard do Mestre**

#### `NPCManager.vue`
```vue
Lista de NPCs
CRUD de NPCs
Filtros e busca
```

#### `CombatTracker.vue`
```vue
Adicionar participantes
Rolar iniciativa
Gerenciar turnos
HP e condições
```

#### `MasterNotes.vue`
```vue
Lista de anotações
Editor rich text
Sistema de tags
Busca
```

#### `PlayerStats.vue`
```vue
Cards com estatísticas de cada jogador
Gráficos de atributos
Histórico de mudanças
```

---

## 🔐 Sistema de Permissões

### Checagem no Composable
```typescript
const { permissions } = useCampaign(campaignId)

permissions.value = {
  isMaster: boolean,    // É o mestre da campanha?
  isPlayer: boolean,    // É jogador da campanha?
  canEdit: boolean,     // Pode editar? (mestre)
  canDelete: boolean    // Pode deletar? (mestre)
}
```

### Uso em Componentes
```vue
<template>
  <button v-if="permissions.isMaster" @click="addNPC">
    Adicionar NPC
  </button>
</template>
```

---

## 📊 Banco de Dados (Sugestão)

### Tabelas Principais

```sql
users
  - id
  - email
  - username
  - password_hash
  - avatar
  - created_at

campaigns
  - id
  - name
  - description
  - master_id (FK users)
  - current_image
  - current_music
  - is_premium
  - created_at

campaign_players
  - id
  - campaign_id (FK campaigns)
  - user_id (FK users)
  - character (JSON)
  - joined_at

timeline_events
  - id
  - campaign_id (FK campaigns)
  - author_id (FK users)
  - type (enum)
  - title
  - description
  - session
  - created_at

npcs
  - id
  - campaign_id (FK campaigns)
  - name
  - clan
  - image
  - stats (JSON)
  - notes
  - created_at

media_files
  - id
  - campaign_id (FK campaigns)
  - uploaded_by (FK users)
  - type (enum)
  - name
  - url
  - size
  - created_at

master_notes
  - id
  - campaign_id (FK campaigns)
  - title
  - content
  - tags (JSON)
  - created_at
```

---

## 🚀 Próximos Passos

### Fase 1: Base do Sistema ✅ **COMPLETA**
- [x] Estrutura de pastas (reorganizada seguindo Nuxt 4)
- [x] Types TypeScript completos
- [x] Composables completos (auth, campaign, timeline, upload)
- [x] Middleware completo (auth.global, isMaster, isPlayer)
- [x] Páginas de autenticação (login, register, forgot-password)
- [x] Dashboard principal funcional
- [x] Componentes UI básicos (BaseButton, BaseInput, BaseCard)
- [x] Sistema de cores vampire completo
- [x] Middleware de proteção de rotas

### Fase 2: Páginas de Campanha 🔥 **EM ANDAMENTO**
- [ ] `/campaign/[id].vue` - Tela compartilhada (mestre + jogadores)
- [ ] `/campaign/[id]/master.vue` - Dashboard exclusivo do mestre
- [ ] Layout específico para campanhas

### Fase 3: Componentes da Campanha ⚪ **PENDENTE**
- [x] PlayerAvatar.vue (já criado)
- [ ] Timeline.vue e TimelineItem.vue
- [ ] MediaPlayer.vue
- [ ] MapViewer.vue
- [ ] PartyTeam.vue

### Fase 4: Componentes do Mestre ⚪ **PENDENTE**
- [ ] NPCManager.vue e NPCCard.vue
- [ ] CombatTracker.vue
- [ ] MasterNotes.vue
- [ ] PlayerStats.vue

### Fase 5: Backend (APIs) ⚪ **PENDENTE**
- [ ] Endpoints de autenticação
- [ ] Endpoints de campanhas
- [ ] Endpoints de timeline
- [ ] Endpoints de upload
- [ ] Integração com banco de dados

### Fase 6: Features Avançadas ⚪ **FUTURO**
- [ ] Realtime com WebSockets
- [ ] Sistema de notificações
- [ ] Chat entre jogadores
- [ ] Gerador de NPCs
- [ ] Sistema de dados (rolagem)
- [ ] Premium features

---

## 🛠️ Tecnologias

- **Frontend**: Vue 3, Nuxt 3, TypeScript
- **Styling**: Tailwind CSS (tema customizado)
- **Backend**: Nuxt Server API
- **Database**: PostgreSQL (ou Firebase/Supabase)
- **Storage**: S3/Cloudinary (para uploads)
- **Realtime**: Socket.io ou Supabase Realtime
- **Auth**: JWT

---

## 📝 Convenções de Código

- **Componentes**: PascalCase (`PlayerAvatar.vue`)
- **Composables**: camelCase com `use` (`useAuth.ts`)
- **Tipos**: PascalCase (`User`, `Campaign`)
- **Variáveis**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

---

**Projeto criado para gerenciar campanhas épicas de Vampire: The Masquerade! 🧛‍♂️🎲**
