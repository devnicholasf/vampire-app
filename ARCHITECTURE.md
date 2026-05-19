# 🏗️ Arquitetura do Sistema

![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat-square&logo=nuxt.js)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)

> Documentação completa da arquitetura do sistema de gerenciamento de campanhas de **Vampire: The Masquerade V5**

---

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [📁 Estrutura de Pastas](#-estrutura-de-pastas)
- [🔄 Fluxo de Funcionalidades](#-fluxo-de-funcionalidades)
- [🗄️ Banco de Dados](#️-banco-de-dados)
- [🔐 Sistema de Permissões](#-sistema-de-permissões)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [📝 Convenções de Código](#-convenções-de-código)

---

## 🎯 Visão Geral

Sistema completo de gerenciamento de campanhas de **Vampire: The Masquerade V5** desenvolvido com **Vue 3 + Nuxt 4 + TypeScript + Tailwind CSS + Supabase**.

---

##  Estrutura de Pastas

```
vampire-app/
 app/
    app.vue
    components/
       auth/
          AuthForm.vue           # Container de formulários auth
          AuthHeader.vue         # Cabeçalho auth
          LoginForm.vue          # Formulário de login
       campaign/
          AddEventModal.vue      # Modal adicionar evento
          CombatTracker.vue      # Rastreador de combate
          MapViewer.vue          # Visualizador de mapas
          MediaPlayer.vue        # Player de música ambiente
          PlayerAvatar.vue       # Avatar do jogador
          PlayerSheet.vue        #  FICHA V5 COMPLETA (~1206 linhas)
          Timeline.vue           # Timeline de eventos
          TimelineItem.vue       # Item da timeline
          master/
              MediaTab.vue       # Aba de mídia
              NotesTab.vue       # Aba de anotações
              NPCDetailsModal.vue # Detalhes do NPC
              NPCModal.vue       # Modal de NPC
              NPCSheet.vue       # Ficha do NPC
              NPCsTab.vue        # Aba de NPCs
              PlayersTab.vue     # Aba de jogadores
              SettingsTab.vue    # Aba de configurações
       ui/
           BaseBadge.vue          # Badge genérico
           BaseButton.vue         # Botão genérico
           BaseCard.vue           # Card genérico
           BaseInput.vue          # Input genérico
           BaseModal.vue          # Modal genérico
           BaseTabs.vue           # Tabs genérico
           BaseToast.vue          # Toast genérico
           ChatModal.vue          # Modal de chat
           DirectMessages.vue     # Mensagens diretas
           NotificationsDropdown.vue # Notificações
           ToastContainer.vue     # Container de toasts
           UserProfile.vue        # Perfil do usuário
           WodButton.vue          # Botão World of Darkness
    composables/
       useAuth.ts                 # Autenticação Supabase
       useCampaign.ts             # Gerenciamento de campanhas
       useChat.ts                 # Sistema de chat
       useLiveGame.ts             # Jogo ao vivo
       useNotifications.ts        # Notificações
       useSeo.ts                  # SEO
       useToast.ts               # Sistema de toasts
    layouts/
       auth.vue                   # Layout autenticação
       campaign.vue               # Layout campanha
    middleware/
       auth.global.ts             # Proteção de rotas
       campaign-redirect.ts       # Redirecionamento campanha
       is-master.ts               # Verificação de mestre
       is-player.ts              # Verificação de jogador
    pages/
       index.vue                  # Página inicial
       login.vue                  # Login
       register.vue               # Registro
       dashboard.vue              # Dashboard principal
       debug.vue                  # Página de debug
       forgot-password.vue        # Recuperar senha
       join-campaign.vue          # Entrar em campanha
       privacy.vue               # Política de privacidade
       terms.vue                  # Termos de uso
       campaign/[id]/
           index.vue              # Tela compartilhada
           live.vue               # Jogo ao vivo
           master.vue             # Dashboard do mestre
           player.vue             #  Dashboard do jogador
    types/
        index.ts                   # Tipos TypeScript
 database/                          # Scripts SQL Supabase
 plugins/
 public/
 server/api/auth/                   # APIs do servidor
 nuxt.config.ts
 package.json
 tailwind.config.js
 tsconfig.json
```

---

## 🔄 Fluxo de Funcionalidades

### 🔐 1. Autenticação
- Registro e login via Supabase Auth
- Token salvo automaticamente
- `auth.global.ts` protege rotas privadas
- Rotas públicas: `/`, `/login`, `/register`, `/terms`, `/privacy`

### 👥 2. Campanhas
- Mestre cria campanha  código de convite gerado automaticamente
- Jogador usa `/join-campaign` com código  entra como jogador
- Constraint UNIQUE (campaign_id, user_id) previne duplicatas
- Middleware `is-master.ts` e `is-player.ts` controlam acesso

### 🎭 3. Dashboard do Jogador (`/campaign/[id]/player`)
- **Estado Atual do Vampiro**: Barras de Fome, Humanidade, Vontade, Condições Ativas
- **Estatísticas-Chave**: XP, atributos principais
- **Botão "Editar Ficha"**  abre PlayerSheet.vue como modal
- Fluxo de salvamento: `saveCharacterSheet()`  `savePlayerSheet()`  banco  `loadCampaignData()`

### 📝 4. Ficha de Personagem V5 (PlayerSheet.vue)
Componente modal completo (~1206 linhas) seguindo a ficha oficial V5:

**Cabeçalho:**
- Avatar circular + nome grande vermelho uppercase
- Borda vampírica com ornamentos nos cantos
- Header sticky com Salvar/Fechar

**Campos do Cabeçalho (3+3 grid):**
- Nome / Conceito / Clã
- Geração / Seita / Refúgio

**Atributos (3 categorias  3  5 bolinhas):**
- Físicos: Força, Destreza, Vigor
- Sociais: Carisma, Manipulação, Aparência
- Mentais: Percepção, Inteligência, Raciocínio

**Habilidades (3 categorias  9  5 bolinhas, ordem V5 PT-BR):**
- Talentos: Armas Brancas, Armas de Fogo, Atletismo, Briga, Condução, Furtividade, Ladroagem, Ofícios, Sobrevivência
- Perícias: Empatia com Animais, Etiqueta, Intimidação, Liderança, Manha, Performance, Persuasão, Sagacidade, Subterfúgio
- Conhecimentos: Ciência, Erudição, Finanças, Investigação, Medicina, Ocultismo, Percepção, Política, Tecnologia

**Grid 1 (2 colunas):**
- Esquerda: Disciplinas (dropdown 15 opções) + Vantagens & Defeitos + Fome (5 bolinhas vermelhas)
- Direita: Potência de Sangue (10 círculos + 4 campos texto) + Experiência (Total/Gasto/Disponível)

**Grid 2 (2 colunas):**
- Esquerda: Virtudes (Consciência/Autocontrole/Coragem  5 bolinhas amarelas)
- Direita: Humanidade (10 vermelhas) + Vontade (10 azuis) + Vitalidade (10 verdes)

**Campos adicionais:**
- Ressonância, Princípios da Crônica, Pilares & Convicções, Perdição do Clã
- Geração do Abraço (dropdown: Cria/Neófito/Ancião)
- Aparência, Traços Distintivos, Condições Narrativas, História

### 🎬 5. Dashboard do Mestre (`/campaign/[id]/master`)
- **Abas**: Jogadores, NPCs, Mídia, Notas, Configurações
- Sistema completo de NPCs (CRUD com modais)
- Anotações privadas do mestre
- Gestão de mídia e configurações

---

## 🗄️ Banco de Dados (Supabase)

### 📊 Tabelas Implementadas

```sql
-- Campanhas
campaigns (
  id uuid PK,
  name text,
  description text,
  master_id uuid FK auth.users,
  invite_code text UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp
)

-- Jogadores da campanha
campaign_players (
  user_id uuid FK auth.users,
  campaign_id uuid FK campaigns,
  character_name text,
  role text DEFAULT 'player',
  sheet jsonb,                    --  Ficha completa V5 como JSON
  joined_at timestamp,
  UNIQUE(campaign_id, user_id)
)
```

### Coluna `sheet` (JSONB) - Estrutura da Ficha V5

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
  humanity, willpower, vitality, hunger, conditions: []
}
```

---

## 🔐 Sistema de Permissões

```typescript
const { permissions } = useCampaign(campaignId)
permissions.isMaster   // É mestre?
permissions.isPlayer   // É jogador?
permissions.canEdit    // Pode editar?
```

- **Mestre**: acesso total + dashboard exclusivo + editar fichas de todos
- **Jogador**: vê campanha compartilhada + edita própria ficha

---

## 🛠️ Stack Tecnológica

- **Frontend**: Vue 3 + Nuxt 4 + TypeScript (Composition API)
- **Estilização**: Tailwind CSS (tema vampire customizado)
- **Backend**: Supabase (Auth + Database + RLS)
- **Banco**: PostgreSQL via Supabase
- **Estado**: Composables reativos com `ref()` e `computed()`
- **Roteamento**: Nuxt file-based routing com middleware

---

## 📝 Convenções de Código

- **Componentes**: PascalCase (`PlayerSheet.vue`)
- **Composables**: camelCase com `use` (`useAuth.ts`)
- **Tipos**: PascalCase (`CharacterSheet`)
- **Imports**: Sempre explícitos (não confiar no auto-import do Nuxt)
- **Navegação**: `navigateTo()` do Nuxt (nunca `$router.push`)
- **Botões**: Sempre usar `BaseButton` com variantes
