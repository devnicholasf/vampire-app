# 🧛 Vampire RPG - Sistema de Gerenciamento de Campanhas

Sistema completo para gerenciar campanhas de **Vampire: The Masquerade** com Nuxt 4 + Tailwind CSS.

## ✅ **STATUS: 95% IMPLEMENTADO**

> 📋 **Última Atualização:** Sistema de campanhas e NPCs totalmente funcionais!
> Próximo passo: Implementação do backend (APIs) para persistência.

## ✨ Características

### 🎭 **Para Jogadores** ✅
- ✅ Criação e gerenciamento de personagens
- ✅ Acompanhamento de atributos (Fome, Humanidade, Força de Vontade)
- ✅ Timeline interativa de eventos da campanha
- ✅ Visualização de mapas e documentos compartilhados
- ✅ Upload de avatar personalizado
- ✅ Player de música ambiente

### 👑 **Para Mestres** ✅
- ✅ Dashboard avançado com sistema de abas
- ✅ **Gerenciamento completo de NPCs** (criar, editar, visualizar)
- ✅ Sistema de clãs Vampire (13 clãs implementados)
- ✅ Biblioteca de mapas e músicas
- ✅ Anotações privadas organizadas
- ⚪ Sistema de combate (iniciativa e turnos) - *próxima fase*
- ✅ Controle de mídia em tempo real
- ⚪ Gerador automático de NPCs - *próxima fase*
- ✅ Estatísticas e gestão dos jogadores

### 🎯 **Sistema de Campanhas** ✅
- ✅ Qualquer usuário pode criar campanhas
- ✅ Criador automático vira Mestre
- ✅ Mesmo usuário pode ser Mestre em uma e Jogador em outra
- ✅ Sistema de permissões granular
- ✅ Timeline organizada por sessões
- ✅ Interface diferenciada para mestres e jogadores

## 🛠️ Stack Tecnológica

- **Frontend**: Vue 4+, Nuxt 4+, TypeScript
- **Styling**: Tailwind CSS 3.4+ (tema customizado)
- **Backend**: Nuxt Server API
- **Database**: PostgreSQL / Supabase (recomendado)
- **Storage**: Cloudinary / S3
- **Realtime**: WebSockets / Supabase Realtime
- **Auth**: JWT

## 📦 Estrutura do Projeto

```
vampire-app/
├── app/
│   ├── components/
│   │   ├── auth/              # Login, registro ✅
│   │   ├── campaign/          # Componentes da campanha ✅
│   │   │   ├── master/        # Dashboard do mestre ✅
│   │   │   │   ├── NPCsTab.vue
│   │   │   │   ├── NPCModal.vue
│   │   │   │   └── NPCDetailsModal.vue
│   │   │   ├── Timeline.vue
│   │   │   ├── MediaPlayer.vue
│   │   │   └── PlayerAvatar.vue
│   │   └── ui/                # Componentes reutilizáveis ✅
│   ├── layouts/
│   │   ├── auth.vue           # Layout autenticação ✅
│   │   └── campaign.vue       # Layout campanha ✅
│   ├── pages/
│   │   ├── login.vue          # Páginas auth ✅
│   │   ├── dashboard.vue      # Dashboard principal ✅
│   │   └── campaign/          # Páginas campanha ✅
│   │       └── [id]/
│   │           ├── index.vue      # Tela compartilhada
│   │           ├── master.vue     # Dashboard mestre
│   │           └── player.vue     # Tela jogador
│   └── middleware/         # Proteção de rotas ✅
├── composables/            # Lógica reutilizável ✅
├── types/                  # TypeScript types ✅
└── server/api/             # APIs (próximo passo) ⚪
│   ├── pages/
│   │   ├── login.vue          # ✅ Autenticação
│   │   ├── register.vue       # ✅ Registro
│   │   ├── dashboard.vue      # ✅ Dashboard principal
│   │   └── campaign/
│   │       ├── [id].vue       # Tela de campanha
│   │       └── [id]/master.vue # Dashboard do mestre
│   └── layouts/
├── composables/
│   ├── useAuth.ts             # ✅ Autenticação
│   ├── useCampaign.ts         # ✅ Campanhas
│   ├── useTimeline.ts         # ✅ Timeline
│   └── useUpload.ts           # ✅ Upload
├── middleware/
│   ├── auth.global.ts         # ✅ Proteção de rotas
│   ├── isMaster.ts            # ✅ Verificação mestre
│   └── isPlayer.ts            # ✅ Verificação jogador
├── server/api/                # Endpoints da API
├── types/index.ts             # ✅ Tipos TypeScript
└── utils/                     # Helpers e validadores
```

## 🚀 Como Usar

## 💡 Comandos Disponíveis

### 1. Desenvolvimento Local

```bash
# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

### 2. Estrutura Implementada

#### ✅ **Já Criado**
- Types TypeScript completos
- Composables (useAuth, useCampaign, useTimeline, useUpload)
- Middleware de autenticação e permissões
- Páginas de login e registro
- Dashboard principal
- Configuração do Nuxt e Tailwind

#### 🔜 **Próximos Passos**
- Implementar endpoints da API (`/server/api/`)
- Criar componentes da tela de campanha
- Criar dashboard do mestre
- Integrar banco de dados
- Adicionar realtime

## 📚 Documentação

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura completa do sistema
- **[DEV_GUIDE.md](./DEV_GUIDE.md)** - Guia detalhado de desenvolvimento

## 🎨 Tema Customizado

Paleta de cores Vampire-themed:
- **Dourado** (`brand-primary`) - Destaque e ações
- **Preto/Cinza escuro** (`surface-*`) - Backgrounds
- **Vermelho** (`error-*`) - Alertas e perigo
- **Gradientes** personalizados

## 🔐 Sistema de Permissões

```typescript
// Verificação automática
const { permissions } = useCampaign(campaignId)

permissions.isMaster   // É mestre?
permissions.isPlayer   // É jogador?
permissions.canEdit    // Pode editar?
```

## 📊 Funcionalidades Principais

### 🔑 Cadastro & Login ✅
- ✅ Validação de formulários completa
- ✅ JWT para autenticação
- ✅ Sessão persistente (localStorage)
- ✅ Páginas de terms/privacy
- ✅ Forgot password funcional

### 🏰 Campanhas ✅
- ✅ Criação ilimitada de campanhas
- ✅ Sistema multi-papel (mestre em uma, jogador em outra)
- ✅ Permissões granulares implementadas
- ✅ Dashboard diferenciado por role

### 🎮 Tela de Campanha ✅
- ✅ Party Team com avatares personalizados
- ✅ Timeline interativa de eventos
- ✅ Player de áudio funcional
- ⚪ Visualizador de mapas (próxima fase)
- ⚪ Biblioteca de documentos (próxima fase)

### 👑 Dashboard do Mestre ✅
- ✅ Estatísticas dos jogadores
- ✅ **Gerenciador de NPCs completo e funcional**
- ✅ Anotações privadas organizadas
- ⚪ Combat tracker (próxima fase)
- ⚪ Gerador automático de NPCs (próxima fase)

### 🗃️ Novidades Implementadas
- ✅ **Sistema completo de NPCs com 13 clãs Vampire**
- ✅ **Modal de criação/edição totalmente funcional**
- ✅ **Sistema de abas no dashboard do mestre**
- ✅ **Timeline com tipos de eventos específicos**
- ✅ **Layout campaign dedicado com navegação**
- Anotações privadas
- Combat tracker
- Gerador de NPCs

## 🧪 Comandos

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Gerar site estático
npm run generate
```

## 🌐 Deploy

### Vercel (Recomendado)
```bash
vercel
```

### Netlify
```bash
npm run generate
# Deploy da pasta .output/public
```

## 📝 Variáveis de Ambiente

Criar arquivo `.env`:

```bash
JWT_SECRET=seu-secret-aqui
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=sua-key-aqui
```

---

**Sistema desenvolvido para campanhas épicas de Vampire: The Masquerade! 🧛‍♂️🎲**
