#  Vampire RPG - Sistema de Gerenciamento de Campanhas

Sistema completo para gerenciar campanhas de **Vampire: The Masquerade V5** com Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS + Supabase.

##  STATUS: v5.0.0 - Sistema de Jogo ao Vivo Completo

> **Última Atualização:** Maio 5, 2026
> Sistema completo de jogo ao vivo com mídia em tempo real, eventos persistentes e mapa político.

---

##  Funcionalidades

###  Para Jogadores
-  Dashboard com estado atual do vampiro (Fome, Humanidade, Vontade, Condições)
-  Ficha de personagem V5 completa e editável
-  Layout oficial com habilidades, disciplinas, virtudes, potência de sangue
-  Design vampírico com borda vermelha, ornamentos e avatar
-  Salvamento automático com sincronização do dashboard
-  **Modo Jogo ao Vivo**: visualização da cena atual com imagem e áudio sincronizados
-  **Timeline da sessão**: eventos em tempo real durante o jogo

###  Para Mestres
-  Dashboard avançado com **6 abas especializadas**:
   - **Visão Geral**: resumo da campanha e informações principais
   - **Jogadores**: gerenciar jogadores e visualizar fichas (somente leitura)
   - **NPCs**: criar, editar e gerenciar NPCs (integrado com Supabase)
   - **Eventos**: timeline persistente com filtros por tipo e personagem
   - **Política**: mapa político completo (governo, facções, relações, territórios)
   - **Mídia**: upload e gerenciamento de imagens, áudio e documentos
-  **Sistema de Sessão ao Vivo** (`live.vue`):
   - Controle de cena com imagem e áudio em tempo real
   - Timeline de eventos da sessão
   - Gerenciamento de NPCs ativos na cena
   - Sincronização instantânea com jogadores via Supabase Realtime
-  Sistema de convites por código único
-  Event Sourcing para histórico completo da campanha

###  Sistema de Campanhas
-  Criação de campanhas com código de convite automático
-  Múltiplos papéis: mesmo usuário pode ser Mestre em uma e Jogador em outra
-  Dados persistentes no Supabase com Row Level Security (RLS)
-  Constraint anti-duplicata (1 usuário = 1 participação por campanha)
-  **Sistema de Eventos Persistentes**: histórico completo da crônica com filtros
-  **Jogo ao Vivo**: sessões síncronas com mídia em tempo real
-  **Real-time**: atualizações instantâneas via Supabase Realtime subscriptions

###  Ficha V5 (PlayerSheet)
-  Atributos: Físicos/Sociais/Mentais com bolinhas interativas
-  Habilidades na ordem oficial V5 em português
-  Disciplinas como dropdown (15 opções V5)
-  Fome: 5 bolinhas vermelhas (padrão 1)
-  Vitalidade: 10 bolinhas verdes
-  Humanidade: 10 bolinhas vermelhas
-  Vontade: 10 bolinhas azuis
-  Virtudes: 3  5 bolinhas amarelas
-  Potência de Sangue: 10 círculos + modificadores
-  Vantagens & Defeitos: lista dinâmica com níveis
-  Condições Narrativas: adicionar/remover
-  Geração do Abraço: Cria/Neófito/Ancião
-  Design vampírico: borda vermelha, ornamentos, avatar, sombra glow

---

##  Stack Tecnológica

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Vue 3 | 3.x | Framework frontend |
| Nuxt | 4.x | Meta-framework SSR |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 3.4+ | Estilização |
| Supabase | - | Auth + Database + RLS |

---

##  Estrutura do Projeto

```
vampire-app/         # Autenticação
       campaign/                   # Componentes da campanha
          PlayerSheet.vue          #  Ficha V5 (~1206 linhas)
          Timeline.vue             #  Timeline de eventos
          TimelineItem.vue         #  Item individual da timeline
          MediaPlayer.vue          #  Player de mídia ao vivo
          MapViewer.vue            #  Visualizador de mapas
          master/                  # Dashboard do mestre
             OverviewTab.vue       # Visão geral da campanha
             PlayersTab.vue        # Gerenciar jogadores
             NPCsTab.vue           # Gerenciar NPCs
             EventsTab.vue         #  Eventos e timeline
             PoliticsTab.vue       #  Mapa político
             MediaTab.vue          # Upload e mídia
             SettingsTab.vue       # Configurações
             TerritoryMap.vue      # Mapa de territórios
             EventCard.vue         # Card de evento reutilizável
       ui/                         # Componentes reutilizáveis
    composables/                   # Lógica reutilizável
       useAuth.ts                  # Autenticação
       useCampaign.ts              # Campanhas e NPCs
       useEvents.ts                #  Event Sourcing
       useLiveGame.ts              #  Jogo ao vivo
       useChat.ts                  # Chat
       useToast.ts                 # Notificações
    layouts/                       # Layouts (auth, campaign)
    middleware/                    # Proteção de rotas
    pages/                         # Páginas (file-based routing)
       campaign/[id]/
           player.vue              #  Dashboard do jogador
           master.vue              # Dashboard do mestre
           live.vue                #  Sessão ao vivo (Mestre)
           live-player.vue         #  Sessão ao vivo (Jogador)
           index.vue               # Tela compartilhada
    types/index.ts        vue     #  Dashboard do jogador
           master.vue     # Dashboard do mestre
           index.vue      # Tela compartilhada
    types/index.ts         # Tipos TypeScript
 database/                  # Scripts SQL Supabase
 nuxt.config.ts
 tailwind.config.js
 package.json
```

---

##  Como Usar

### Desenvolvimento
```bash
nopie `.env.example` para `.env` e preencha com suas credenciais:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key-here

# JWT Secret (opcional)
JWT_SECRET=your-secret-key-change-in-production
```

**Obtenha suas credenciais em:** Supabase Dashboard → Settings → API

---

##  Banco de Dados

### Setup Inicial

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL na pasta `database/` na ordem:
   ```sql
   -- 1. Schema principal
   database/supabase-schema.sql
   
   -- 2. Migrations de features
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
### Build
```bash
npm run build
npm run preview
```

### Limpar Cache
```bash
rm -rf .nuxt
npm O que funciona agora? ✅

- ✅ Autenticação completa com Supabase Auth
- ✅ Criação e gerenciamento de campanhas
- ✅ Sistema de convites por código único
- ✅ Ficha de personagem V5 completa e editável
- ✅ Dashboard do jogador com sincronização
- ✅ Dashboard do mestre com 6 abas especializadas
- ✅ NPCs integrados com Supabase
- ✅ Sistema de eventos persistentes (Event Sourcing)
- ✅ Timeline de campanha com filtros
- ✅ Mapa político completo (governo, facções, relações, territórios)
- ✅ Upload de mídia (Supabase Storage)
- ✅ Jogo ao vivo com sincronização em tempo real
- ✅ Media Player sincronizado entre mestre e jogadores
- ✅ Timeline de sessão ao vivo
- ✅ Real-time updates via Supabase Realtime

##  Próximos Passos 🚀

- [ ] Combat Tracker funcional
- [ ] Chat em tempo real (base já implementada)
- [ ] Atualizar NPCSheet para padrão V5 completo
- [ ] Sistema de notificações push
- [ ] Mapa interativo com marcadores
- [ ] Deploy em produção=https://xxx.supabase.co
SUPABASE_KEY=sua-key-aqui
```

---

##  Documentação

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura completa do sistema |
| [DEV_GUIDE.md](./DEV_GUIDE.md) | Guia de desenvolvimento |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | Status detalhado |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de mudanças |
| [ARCHITECTURAL_CHANGES.md](./ARCHITECTURAL_CHANGES.md) | Mudanças arquiteturais |
| [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) | Notas para continuidade |

---

##  Próximos Passos

- [ ] Integrar NPCs com Supabase
- [ ] Timeline persistente no banco
- [ ] Upload real de mídia (Supabase Storage)
- [ ] Jogo ao vivo completo
- [ ] Combat Tracker funcional
- [ ] Chat em tempo real
- [ ] Atualizar NPCSheet para padrão V5
- [ ] Deploy (Vercel/Netlify)

---

**Sistema desenvolvido para campanhas épicas de Vampire: The Masquerade V5! **