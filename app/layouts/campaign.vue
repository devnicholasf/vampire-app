<template>
  <div class="campaign-layout min-h-screen bg-gradient-atmospheric">
    <!-- Campaign Navigation -->
    <nav class="bg-surface/80 backdrop-blur border-b border-border-primary sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Left: Campaign Info -->
          <div class="flex items-center gap-4">
            <BaseButton 
              variant="ghost" 
              size="sm" 
              @click="navigateTo('/dashboard')"
              iconLeft="←"
              class="!text-red-400"
            >
              Dashboard
            </BaseButton>
            
            <div class="hidden md:block w-px h-6 bg-border-primary"></div>
            
            <div class="hidden md:block">
              <h1 class="text-lg font-semibold text-red-400">{{ campaignName || 'Campanha' }}</h1>
              <div class="text-xs text-text-muted">{{ playerCount }} jogadores</div>
            </div>
          </div>

          <!-- Center: Navigation Tabs (Desktop) -->
          <div class="hidden lg:flex items-center gap-1">
            <NuxtLink
              :to="`/campaign/${campaignId}`"
              class="nav-tab"
              :class="{ active: !route.path.includes('/master') }"
            >
              <span class="mr-1">🎭</span>
              Campanha
            </NuxtLink>
            
            <NuxtLink
              v-if="isMaster"
              :to="`/campaign/${campaignId}/master`"
              class="nav-tab"
              :class="{ active: route.path.includes('/master') }"
            >
              <span class="mr-1">👑</span>
              Mestre
            </NuxtLink>
          </div>

          <!-- Right: User Actions -->
          <div class="flex items-center gap-2">
            <!-- Role Badge -->
            <div class="hidden md:flex items-center gap-2">
              <BaseBadge
                :variant="isMaster ? 'primary' : 'outline'"
                :iconLeft="isMaster ? '👑' : '🎭'"
                size="xs"
              >
                {{ isMaster ? 'Mestre' : 'Jogador' }}
              </BaseBadge>
            </div>

            <!-- Mobile Menu -->
            <BaseButton
              variant="ghost"
              size="sm"
              @click="showMobileMenu = !showMobileMenu"
              class="lg:hidden"
              iconLeft="☰"
            />

            <!-- User Menu -->
            <div class="relative">
              <BaseButton
                variant="ghost"
                size="sm"
                @click="showUserMenu = !showUserMenu"
                :iconLeft="user?.username?.charAt(0).toUpperCase() || '👤'"
                class="hidden md:flex"
              />
              
              <!-- User Dropdown -->
              <div 
                v-if="showUserMenu"
                class="absolute right-0 top-full mt-2 w-48 bg-surface-card border border-border-primary rounded-lg shadow-lg z-50"
                @click.stop
              >
                <div class="p-3 border-b border-border-secondary">
                  <div class="font-medium text-text-primary">{{ user?.username }}</div>
                  <div class="text-sm text-text-muted">{{ user?.email }}</div>
                </div>
                <div class="py-1">
                  <button 
                    @click="handleLogout"
                    class="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                  >
                    🚪 Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <div 
          v-if="showMobileMenu"
          class="lg:hidden border-t border-border-primary py-3"
        >
          <div class="space-y-2">
            <NuxtLink
              :to="`/campaign/${campaignId}`"
              class="mobile-nav-item"
              :class="{ active: !route.path.includes('/master') }"
              @click="showMobileMenu = false"
            >
              <span class="mr-2">🎭</span>
              Tela da Campanha
            </NuxtLink>
            
            <NuxtLink
              v-if="isMaster"
              :to="`/campaign/${campaignId}/master`"
              class="mobile-nav-item"
              :class="{ active: route.path.includes('/master') }"
              @click="showMobileMenu = false"
            >
              <span class="mr-2">👑</span>
              Dashboard do Mestre
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Campaign Status Bar (Bottom) -->
    <div 
      v-if="showStatusBar"
      class="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur border-t border-border-primary z-40"
    >
      <div class="container mx-auto px-4 py-2">
        <div class="flex items-center justify-between text-sm">
          <!-- Status -->
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1 text-green-400">
              ● Online
            </span>
            <span class="text-text-muted">
              {{ playerCount }} jogadores conectados
            </span>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center gap-2">
            <BaseButton
              variant="ghost"
              size="sm"
              @click="toggleStatusBar"
              class="!p-1"
            >
              {{ showStatusBar ? '−' : '+' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Click Outside Handler -->
    <div 
      v-if="showUserMenu || showMobileMenu"
      class="fixed inset-0 z-40"
      @click="closeAllMenus"
    ></div>
  </div>
</template>

<script setup lang="ts">
// ============================================
// Campaign Layout - Layout para páginas de campanha
// ============================================

// ============================================
// Imports explícitos dos componentes
// ============================================
import BaseButton from '~/components/ui/BaseButton.vue'
import BaseBadge from '~/components/ui/BaseBadge.vue'

const route = useRoute()

// Composable com fallback para mock
let user, logout
try {
  const auth = useAuth()
  user = auth.user
  logout = auth.logout
} catch (error) {
  console.warn('useAuth não disponível, usando dados mock')
  user = ref({ username: 'Usuário', email: 'user@email.com' })
  logout = async () => { console.log('Mock logout') }
}

// Extract campaign ID from route
const campaignId = computed(() => route.params.id as string)

// Mock data (replace with real composable)
const campaignName = ref('Crônicas de Chicago')
const playerCount = ref(4)
const isMaster = ref(true) // TODO: Get from permissions

// UI State
const showMobileMenu = ref(false)
const showUserMenu = ref(false)
const showStatusBar = ref(true)

// ============================================
// Methods
// ============================================
const closeAllMenus = () => {
  showMobileMenu.value = false
  showUserMenu.value = false
}

const toggleStatusBar = () => {
  showStatusBar.value = !showStatusBar.value
}

const handleLogout = async () => {
  try {
    await logout()
    navigateTo('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
  closeAllMenus()
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  // Load campaign data
  // TODO: Fetch campaign details and permissions
})

// Close menus on route change
watch(route, () => {
  closeAllMenus()
})

// ============================================
// SEO & Meta
// ============================================
useHead({
  bodyAttrs: {
    class: 'campaign-layout-body'
  }
})
</script>

<style scoped>
.campaign-layout {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 100%);
  min-height: 100vh;
}

/* Navigation Tabs */
.nav-tab {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 200ms;
  color: var(--text-muted);
}

.nav-tab:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.nav-tab.active {
  background-color: #dc2626;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Mobile Navigation */
.mobile-nav-item {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 200ms;
  color: var(--text-muted);
}

.mobile-nav-item:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.mobile-nav-item.active {
  background-color: #dc2626;
  color: white;
}

/* Backdrop blur effect */
.backdrop-blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Status bar animation */
.status-bar-enter-active,
.status-bar-leave-active {
  transition: transform 0.3s ease;
}

.status-bar-enter-from,
.status-bar-leave-to {
  transform: translateY(100%);
}
</style>

<style>
/* Global styles for campaign layout */
.campaign-layout-body {
  overflow-x: hidden;
}

/* Custom scrollbar for campaign pages */
.campaign-layout ::-webkit-scrollbar {
  width: 6px;
}

.campaign-layout ::-webkit-scrollbar-track {
  background: #1a1a2e;
}

.campaign-layout ::-webkit-scrollbar-thumb {
  background: #dc2626;
  border-radius: 9999px;
}

.campaign-layout ::-webkit-scrollbar-thumb:hover {
  background: #ef4444;
}
</style>