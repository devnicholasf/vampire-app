# 🧛 VAMPIRE RPG - Guia de Desenvolvimento

## 🚀 Como Começar

### 1. Instalar Dependências (se necessário)
```bash
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

### 3. Estrutura de Arquivos Criados

#### ✅ **Já Implementado**

**Types** (`/types/index.ts`)
- User, Campaign, Character, Timeline, NPC, MediaFile
- Tipos de resposta da API
- Permissões

**Composables** (`/composables/`)
- `useAuth.ts` - Login, registro, logout, sessão
- `useCampaign.ts` - CRUD de campanhas, permissões
- `useTimeline.ts` - Eventos da timeline
- `useUpload.ts` - Upload e gerenciamento de arquivos

**Middleware** (`/middleware/`)
- `auth.global.ts` - Protege rotas privadas
- `isMaster.ts` - Verifica se é mestre
- `isPlayer.ts` - Verifica se é jogador/mestre

**Páginas** (`/app/pages/`)
- `index.vue` - Template inicial genérico
- `login.vue` - Página de login
- `register.vue` - Página de registro
- `dashboard.vue` - Dashboard do usuário

**Configurações**
- `nuxt.config.ts` - Configuração do Nuxt
- `tailwind.config.js` - Tema customizado rico

---

## 📋 Próximos Passos de Desenvolvimento

### **Etapa 1: Implementar Backend (APIs)**

Criar os endpoints no `/server/api/`:

#### Auth (`/server/api/auth/`)
```typescript
// login.post.ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  // Validar credenciais
  // Gerar JWT
  // Retornar user + token
})

// register.post.ts
export default defineEventHandler(async (event) => {
  const { email, username, password } = await readBody(event)
  // Validar dados
  // Hash da senha
  // Criar usuário no DB
  // Gerar JWT
  // Retornar user + token
})
```

#### Campaigns (`/server/api/campaigns/`)
```typescript
// user.get.ts - Buscar campanhas do usuário
// [id].get.ts - Buscar campanha específica
// create.post.ts - Criar campanha
// join.post.ts - Entrar em campanha
// [id]/media.patch.ts - Atualizar mídia atual
```

#### Timeline (`/server/api/timeline/`)
```typescript
// [campaignId].get.ts - Buscar eventos
// [campaignId]/add.post.ts - Adicionar evento
// [campaignId]/[eventId].patch.ts - Editar evento
// [campaignId]/[eventId].delete.ts - Deletar evento
```

#### Upload (`/server/api/upload/`)
```typescript
// index.post.ts - Upload de arquivo
// [fileId].delete.ts - Deletar arquivo
// campaign/[campaignId].get.ts - Listar arquivos
```

#### NPCs (`/server/api/npcs/`) - NOVO
```typescript
// [campaignId].get.ts - Buscar NPCs da campanha
// [campaignId]/create.post.ts - Criar NPC
// [campaignId]/[npcId].get.ts - Buscar NPC específico
// [campaignId]/[npcId].patch.ts - Editar NPC
// [campaignId]/[npcId].delete.ts - Deletar NPC
// [campaignId]/[npcId]/avatar.patch.ts - Upload avatar
```

---

### **ATUALIZAÇÃO: Sistema de Campanhas Implementado ✅**

> **📋 Status:** As páginas de campanha e o sistema de NPCs já foram implementados!
> O próximo passo é implementar o backend (APIs) para persistência de dados.

#### ✅ **Já Implementado:**
- `/app/pages/campaign/[id]/index.vue` - Tela compartilhada da campanha
- `/app/pages/campaign/[id]/master.vue` - Dashboard completo do mestre
- `/app/pages/campaign/[id]/player.vue` - Tela específica do jogador
- `/app/layouts/campaign.vue` - Layout para campanhas
- Sistema completo de NPCs com modais funcionais
- Timeline interativa de eventos
- Media Player para música ambiente
- Sistema de abas do mestre (NPCs, Players, Media, Notes, Settings)

#### 🔥 **Funcionalidades Testadas:**
- Criação e edição de NPCs via modal
- Sistema de clãs Vampire implementado
- Atributos VtM (Fome, Humanidade, Força de Vontade, Saúde)
- Timeline com tipos de eventos
- Upload simulado de avatares
- Navegação entre abas do dashboard

---

### **Etapa 2: Componentes da Campanha ✅ IMPLEMENTADOS**

#### `/app/components/campaign/` - ✅ **CONCLUÍDOS**

**PlayerAvatar.vue** ✅ **IMPLEMENTADO**
- Avatar do personagem com upload
- Nome, clã, geração
- Barras de atributos VtM
- Modo compacto e editável
- Lista de disciplinas

**Timeline.vue** ✅ **IMPLEMENTADO**
- Timeline interativa de eventos
- Filtros por tipo e sessão
- Adição de eventos (mestres)
- Integração com composable useTimeline

**TimelineItem.vue** ✅ **IMPLEMENTADO**
- Item individual da timeline
- Ícones por tipo de evento
- Ações de edição/exclusão
- Design responsivo

**MediaPlayer.vue** ✅ **IMPLEMENTADO**
- Player de música ambiente
- Controles de play/pause/volume
- Upload de música (mestres)
- Integração com composable useUpload

#### `/app/components/campaign/master/` - ✅ **NOVOS IMPLEMENTADOS**

**NPCsTab.vue** ✅ **IMPLEMENTADO**
- Gerenciador completo de NPCs
- Botão de criar NPC funcional
- Lista de NPCs existentes
- Integração com modais

**NPCModal.vue** ✅ **IMPLEMENTADO**
- Modal de criação/edição
- Formulário com validação
- Seleção de clã vampire
- Atributos VtM customizáveis
- Upload de avatar

**NPCDetailsModal.vue** ✅ **IMPLEMENTADO**
- Modal de detalhes do NPC
- Ações (editar, adicionar ao jogo, deletar)
- Design consistente com tema vampire

**PlayersTab.vue, MediaTab.vue, NotesTab.vue, SettingsTab.vue** ✅ **IMPLEMENTADOS**
- Estrutura base para gestão do mestre
- Design consistente com sistema de abas
- Prontos para expansão de funcionalidades
    <button v-if="isMaster" @click="uploadMusic">
      Upload Música
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  campaignId: string
  isMaster: boolean
}>()

const audioRef = ref<HTMLAudioElement>()
const volume = ref(50)

const play = () => audioRef.value?.play()
const pause = () => audioRef.value?.pause()
</script>
```

---

### **Etapa 3: Criar Dashboard do Mestre**

#### `/app/pages/campaign/[id]/master.vue`

```vue
<template>
  <div class="master-dashboard">
    <h1>Dashboard do Mestre</h1>
    
    <!-- Tabs -->
    <div class="tabs">
      <button @click="tab = 'stats'">Estatísticas</button>
      <button @click="tab = 'npcs'">NPCs</button>
      <button @click="tab = 'notes'">Anotações</button>
      <button @click="tab = 'combat'">Combate</button>
    </div>

    <!-- Conteúdo -->
    <PlayerStats v-if="tab === 'stats'" :campaign="campaign" />
    <NPCManager v-if="tab === 'npcs'" :campaignId="campaignId" />
    <MasterNotes v-if="tab === 'notes'" :campaignId="campaignId" />
    <CombatTracker v-if="tab === 'combat'" :campaignId="campaignId" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'isMaster']
})

const route = useRoute()
const campaignId = route.params.id as string
const tab = ref('stats')

const { campaign, fetchCampaign } = useCampaign(campaignId)

onMounted(() => fetchCampaign(campaignId))
</script>
```

---

### **Etapa 4: Implementar Banco de Dados**

#### Opção 1: Supabase (Recomendado)
```bash
npm install @supabase/supabase-js
```

```typescript
// utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)
```

#### Opção 2: Prisma + PostgreSQL
```bash
npm install @prisma/client prisma
npx prisma init
```

---

### **Etapa 5: Implementar Realtime**

#### Com Supabase Realtime
```typescript
// composables/useRealtimeCampaign.ts
export const useRealtimeCampaign = (campaignId: string) => {
  const supabase = useSupabaseClient()

  supabase
    .channel(`campaign:${campaignId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'campaigns' },
      (payload) => {
        // Atualizar dados em tempo real
      }
    )
    .subscribe()
}
```

---

## 🎨 Componentes UI Reutilizáveis

### BaseButton.vue (já existe)
✅ Componente de botão genérico

### Componentes a criar em `/app/components/ui/`:

**BaseInput.vue**
```vue
<template>
  <input 
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :class="inputClasses"
  />
</template>
```

**BaseModal.vue**
```vue
<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
```

**BaseCard.vue**
```vue
<template>
  <div class="bg-surface-card rounded-lg border border-border-primary p-4">
    <slot />
  </div>
</template>
```

---

## 🔧 Utils Úteis

### `/utils/validators.ts`
```typescript
export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password: string) => {
  return password.length >= 6
}
```

### `/utils/helpers.ts`
```typescript
export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

export const truncate = (text: string, length: number) => {
  return text.length > length 
    ? text.substring(0, length) + '...' 
    : text
}
```

---

## 🧪 Testes

### Testar Fluxo Completo

1. **Registro**
   - Acessar `/register`
   - Criar conta
   - Verificar redirecionamento para `/dashboard`

2. **Criar Campanha**
   - No dashboard, clicar em "Nova Campanha"
   - Preencher formulário
   - Verificar se vira mestre automaticamente

3. **Acessar Campanha**
   - Clicar na campanha criada
   - Verificar acesso à tela de campanha
   - Testar upload de mídia (mestre)
   - Testar criação de evento na timeline

4. **Dashboard do Mestre**
   - Acessar `/campaign/[id]/master`
   - Verificar ferramentas do mestre

---

## 📦 Variáveis de Ambiente

Criar `.env`:

```bash
# JWT
JWT_SECRET=seu-secret-super-seguro-aqui

# Database (Supabase)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=seu-key-aqui

# Storage (opcional)
CLOUDINARY_URL=cloudinary://xxx
```

---

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run generate
# Upload da pasta .output/public
```

---

## 📚 Recursos

- [Nuxt 3 Docs](https://nuxt.com)
- [Vue 3 Docs](https://vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)
- [Vampire The Masquerade Wiki](https://whitewolf.fandom.com)

---

**Boa sorte com o desenvolvimento! 🧛‍♂️🎲**
