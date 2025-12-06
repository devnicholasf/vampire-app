# 💡 EXEMPLOS DE USO - Vampire RPG

## 🎭 Como usar os Composables

### 1. useAuth - Autenticação

```vue
<script setup lang="ts">
// Importar (automático no Nuxt 3)
const { user, login, logout, isAuthenticated } = useAuth()

// Login
const handleLogin = async () => {
  const result = await login({
    email: 'jogador@email.com',
    password: '123456'
  })
  
  if (result.success) {
    navigateTo('/dashboard')
  }
}

// Verificar se está autenticado
if (isAuthenticated.value) {
  console.log('Usuário logado:', user.value?.username)
}
</script>
```

### 2. useCampaign - Gerenciar Campanhas

```vue
<script setup lang="ts">
const campaignId = 'abc123'
const { 
  campaign, 
  campaigns,
  permissions,
  fetchCampaign,
  createCampaign,
  updateCurrentMedia 
} = useCampaign(campaignId)

// Buscar campanha específica
onMounted(async () => {
  await fetchCampaign(campaignId)
})

// Verificar permissões
if (permissions.value.isMaster) {
  console.log('Você é o mestre!')
}

// Criar nova campanha
const criarCampanha = async () => {
  const result = await createCampaign({
    name: 'Crônicas de Chicago',
    description: 'Uma história sombria nas ruas de Chicago...'
  })
  
  if (result.success) {
    console.log('Campanha criada:', result.data)
  }
}

// Atualizar música atual
const trocarMusica = async () => {
  await updateCurrentMedia('music', '/audio/suspense.mp3')
}
</script>
```

### 3. useTimeline - Timeline de Eventos

```vue
<script setup lang="ts">
const campaignId = 'abc123'
const { events, addEvent, fetchEvents } = useTimeline(campaignId)

// Buscar eventos
onMounted(async () => {
  await fetchEvents()
})

// Adicionar evento
const adicionarEvento = async () => {
  await addEvent({
    type: 'combat',
    title: 'Emboscada no Beco',
    description: 'Os personagens foram emboscados por uma gangue rival',
    session: 1
  })
}

// Exibir eventos
events.value.forEach(event => {
  console.log(`${event.title} - ${event.type}`)
})
</script>
```

### 4. useUpload - Upload de Arquivos

```vue
<template>
  <div>
    <input type="file" @change="handleUpload" />
    <div v-if="uploading">
      Upload: {{ progress }}%
    </div>
  </div>
</template>

<script setup lang="ts">
const campaignId = 'abc123'
const { uploadFile, uploading, progress } = useUpload(campaignId)

const handleUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  
  if (file) {
    const result = await uploadFile(file, 'image', true)
    
    if (result.success) {
      console.log('Arquivo uploaded:', result.data?.url)
    }
  }
}
</script>
```

---

## 🎨 Como usar Componentes

### PlayerAvatar Component

```vue
<template>
  <PlayerAvatar
    :character="personagem"
    :editable="true"
    :compact="false"
    @update:avatar="handleAvatarUpdate"
  />
</template>

<script setup lang="ts">
import type { Character } from '~/types'

const personagem = ref<Character>({
  name: 'Marcus Ventrue',
  clan: 'Ventrue',
  generation: 10,
  avatar: '/images/marcus.jpg',
  attributes: {
    hunger: 2,
    humanity: 7,
    willpower: 8,
    health: 10
  },
  disciplines: ['Dominação', 'Presença', 'Fortitude']
})

const handleAvatarUpdate = async (file: File) => {
  // Upload do arquivo
  const { uploadFile } = useUpload()
  const result = await uploadFile(file, 'image')
  
  if (result.success && result.data) {
    personagem.value.avatar = result.data.url
  }
}
</script>
```

### BaseButton Component

```vue
<template>
  <!-- Botão Primary -->
  <BaseButton variant="primary" @click="salvar">
    Salvar
  </BaseButton>

  <!-- Botão Secondary -->
  <BaseButton variant="secondary" @click="cancelar">
    Cancelar
  </BaseButton>

  <!-- Botão Ghost -->
  <BaseButton variant="ghost" @click="fechar">
    Fechar
  </BaseButton>

  <!-- Botão com Loading -->
  <BaseButton variant="primary" :disabled="loading">
    {{ loading ? 'Salvando...' : 'Salvar' }}
  </BaseButton>
</template>
```

---

## 🔐 Como usar Middleware

### Proteger Rota (apenas autenticados)

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'] // Rota protegida
})
</script>
```

### Apenas Mestres

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'isMaster'] // Só mestre acessa
})
</script>
```

### Jogadores e Mestres

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'isPlayer'] // Jogadores e mestre acessam
})
</script>
```

---

## 📊 Exemplo Completo: Página de Campanha

```vue
<template>
  <div class="campaign-page">
    <!-- Header -->
    <header>
      <h1>{{ campaign?.name }}</h1>
      <p>{{ campaign?.description }}</p>
    </header>

    <!-- Party Team -->
    <section class="party-team">
      <h2>Party</h2>
      <div class="grid grid-cols-4 gap-4">
        <PlayerAvatar
          v-for="player in campaign?.players"
          :key="player.userId"
          :character="player.character"
          :compact="true"
        />
      </div>
    </section>

    <!-- Mapa Atual -->
    <section v-if="campaign?.currentImage" class="map-viewer">
      <img :src="campaign.currentImage" alt="Mapa atual" />
    </section>

    <!-- Controles do Mestre -->
    <section v-if="permissions.isMaster" class="master-controls">
      <BaseButton @click="showUploadModal = true">
        📷 Upload Imagem
      </BaseButton>
      <BaseButton @click="showMusicModal = true">
        🎵 Trocar Música
      </BaseButton>
      <BaseButton @click="showAddEventModal = true">
        📝 Adicionar Evento
      </BaseButton>
    </section>

    <!-- Timeline -->
    <section class="timeline">
      <h2>Timeline da Campanha</h2>
      <Timeline
        :campaignId="campaignId"
        :canEdit="permissions.isMaster"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'isPlayer']
})

const route = useRoute()
const campaignId = route.params.id as string

const { campaign, permissions, fetchCampaign } = useCampaign(campaignId)

onMounted(async () => {
  await fetchCampaign(campaignId)
})

const showUploadModal = ref(false)
const showMusicModal = ref(false)
const showAddEventModal = ref(false)
</script>
```

---

## 🎲 Exemplo: Dashboard do Mestre

```vue
<template>
  <div class="master-dashboard">
    <h1>Dashboard do Mestre</h1>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: currentTab === tab }"
        @click="currentTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Conteúdo -->
    <div class="tab-content">
      <!-- Estatísticas dos Jogadores -->
      <div v-if="currentTab === 'Stats'">
        <h2>Estatísticas dos Jogadores</h2>
        <div class="grid grid-cols-2 gap-4">
          <PlayerAvatar
            v-for="player in campaign?.players"
            :key="player.userId"
            :character="player.character"
          />
        </div>
      </div>

      <!-- NPCs -->
      <div v-if="currentTab === 'NPCs'">
        <h2>Gerenciador de NPCs</h2>
        <BaseButton @click="showAddNPC = true">
          + Adicionar NPC
        </BaseButton>
        <!-- Lista de NPCs -->
      </div>

      <!-- Anotações -->
      <div v-if="currentTab === 'Notes'">
        <h2>Anotações Privadas</h2>
        <!-- Editor de notas -->
      </div>

      <!-- Combate -->
      <div v-if="currentTab === 'Combat'">
        <h2>Tracker de Combate</h2>
        <!-- Sistema de iniciativa -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'isMaster']
})

const route = useRoute()
const campaignId = route.params.id as string

const { campaign, fetchCampaign } = useCampaign(campaignId)

const tabs = ['Stats', 'NPCs', 'Notes', 'Combat']
const currentTab = ref('Stats')

onMounted(async () => {
  await fetchCampaign(campaignId)
})
</script>
```

---

## 🎯 Classes CSS do Tailwind (Customizadas)

### Cores
```vue
<!-- Dourado (Brand) -->
<div class="bg-brand-primary text-black">
<div class="text-brand-secondary">
<div class="border-brand-primary">

<!-- Superfícies -->
<div class="bg-surface-dark">
<div class="bg-surface-card">
<div class="bg-surface-card-hover">

<!-- Texto -->
<div class="text-text-primary">
<div class="text-text-secondary">
<div class="text-text-muted">

<!-- Bordas -->
<div class="border-border-primary">
<div class="border-border-secondary">
```

### Gradientes
```vue
<div class="bg-gradient-barber">
<div class="bg-gradient-gold">
<div class="bg-gradient-card">
```

### Sombras
```vue
<div class="shadow-glow-gold">
<div class="shadow-card-hover">
```

### Animações
```vue
<div class="animate-fade-in">
<div class="animate-slide-up">
<div class="animate-scale-hover">
```

---

## 🔍 Dicas de Desenvolvimento

### 1. Verificar erros TypeScript
```bash
npx nuxi typecheck
```

### 2. Limpar cache
```bash
rm -rf .nuxt
npm run postinstall
```

### 3. Ver estrutura de tipos
```typescript
// No VSCode, hover sobre qualquer tipo para ver definição
const campaign: Campaign = { ... }
```

### 4. Debug de composables
```typescript
const { campaign } = useCampaign(id)

watchEffect(() => {
  console.log('Campaign atualizada:', campaign.value)
})
```

### 5. Auto-import funcionando
```typescript
// Não precisa importar! Nuxt faz automaticamente:
// - Composables de /composables/
// - Componentes de /components/
// - Utils de /utils/
```

---

**Exemplos prontos para copiar e adaptar! 🚀🧛‍♂️**
