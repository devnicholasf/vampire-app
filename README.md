#  Vampire RPG - Sistema de Gerenciamento de Campanhas

Sistema completo para gerenciar campanhas de **Vampire: The Masquerade V5** com Nuxt 4 + Vue 3 + TypeScript + Tailwind CSS + Supabase.

##  STATUS: v4.0.0 - Ficha V5 Completa

> **Última Atualização:** Fevereiro 12, 2026
> Ficha de personagem V5 totalmente funcional com design vampírico.

---

##  Funcionalidades

###  Para Jogadores
-  Dashboard com estado atual do vampiro (Fome, Humanidade, Vontade, Condições)
-  Ficha de personagem V5 completa e editável
-  Layout oficial com habilidades, disciplinas, virtudes, potência de sangue
-  Design vampírico com borda vermelha, ornamentos e avatar
-  Salvamento automático com sincronização do dashboard

###  Para Mestres
-  Dashboard avançado com 5 abas (Jogadores, NPCs, Mídia, Notas, Configurações)
-  Gerenciamento completo de NPCs (criar, editar, visualizar)
-  Visualização de fichas dos jogadores (somente leitura)
-  Sistema de convites por código único
-  Anotações privadas organizadas

###  Sistema de Campanhas
-  Criação de campanhas com código de convite automático
-  Múltiplos papéis: mesmo usuário pode ser Mestre em uma e Jogador em outra
-  Dados persistentes no Supabase com RLS
-  Constraint anti-duplicata (1 usuário = 1 participação por campanha)

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
vampire-app/
 app/
    components/
       auth/              # Autenticação
       campaign/          # Componentes da campanha
          PlayerSheet.vue    #  Ficha V5 (~1206 linhas)
          master/            # Dashboard do mestre
       ui/                # Componentes reutilizáveis
    composables/           # Lógica reutilizável
    layouts/               # Layouts (auth, campaign)
    middleware/             # Proteção de rotas
    pages/                 # Páginas (file-based routing)
       campaign/[id]/
           player.vue     #  Dashboard do jogador
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
npm install
npm run dev
```
Acesse: http://localhost:3000

### Build
```bash
npm run build
npm run preview
```

### Limpar Cache
```bash
rm -rf .nuxt
npm run postinstall
```

---

##  Variáveis de Ambiente

Criar arquivo `.env`:
```bash
SUPABASE_URL=https://xxx.supabase.co
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