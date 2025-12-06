# 🧛 Vampire RPG - Sistema de Gerenciamento de Campanhas

Sistema completo para gerenciar campanhas de **Vampire: The Masquerade** Nuxt 4 + Tailwind CSS.

## ✨ Características

### 🎭 **Para Jogadores**
- Criação e gerenciamento de personagens
- Acompanhamento de atributos (Fome, Humanidade, Força de Vontade)
- Timeline de eventos da campanha
- Visualização de mapas e documentos compartilhados
- Upload de avatar personalizado

### 👑 **Para Mestres**
- Dashboard avançado com ferramentas profissionais
- Gerenciamento de NPCs
- Biblioteca de mapas e músicas
- Anotações privadas
- Sistema de combate (iniciativa e turnos)
- Controle de mídia em tempo real
- Gerador de NPCs
- Estatísticas dos jogadores

### 🎯 **Sistema de Campanhas**
- Qualquer usuário pode criar campanhas
- Criador automático vira Mestre
- Mesmo usuário pode ser Mestre em uma e Jogador em outra
- Sistema de permissões granular
- Timeline organizada por sessões

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
│   │   ├── auth/              # Login, registro
│   │   ├── campaign/          # Componentes da campanha
│   │   ├── master/            # Dashboard do mestre
│   │   └── ui/                # Componentes reutilizáveis
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

### Cadastro & Login
- Validação de formulários
- JWT para autenticação
- Sessão persistente (localStorage)

### Campanhas
- Criação ilimitada (futuramente premium)
- Sistema multi-papel (mestre em uma, jogador em outra)
- Permissões granulares

### Tela de Campanha
- Party Team com avatares
- Timeline de eventos
- Player de áudio
- Visualizador de mapas
- Biblioteca de documentos

### Dashboard do Mestre
- Estatísticas dos jogadores
- Gerenciador de NPCs
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
