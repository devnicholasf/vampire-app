<template>
  <div class="df-join min-h-screen flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <div class="df-join-panel">
        <!-- Corner Decorations -->
        <div class="df-corner df-corner-tl"></div>
        <div class="df-corner df-corner-tr"></div>
        <div class="df-corner df-corner-bl"></div>
        <div class="df-corner df-corner-br"></div>

        <!-- Header -->
        <div class="text-center mb-8">
          <div class="df-join-icon mx-auto mb-4">
            <svg class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <h1 class="df-join-title">Entrar em Campanha</h1>
          <p class="df-text-muted mt-2">
            Use o código de convite para entrar em uma campanha
          </p>
        </div>

        <form @submit.prevent="handleJoin" class="space-y-6">
          <!-- Código de Convite -->
          <div>
            <label class="df-label">Código de Convite <span class="text-red-400">*</span></label>
            <input
              v-model="inviteCode"
              placeholder="Ex: GELYL0"
              :disabled="loading"
              required
              class="df-input uppercase"
              maxlength="6"
            />
            <p class="text-xs df-text-muted mt-1.5">
              Código fornecido pelo Mestre da campanha
            </p>
          </div>

          <!-- Nome do Personagem -->
          <div>
            <label class="df-label">Nome do seu Personagem <span class="text-red-400">*</span></label>
            <input
              v-model="characterName"
              placeholder="Ex: Marcus Ventrue"
              :disabled="loading"
              required
              class="df-input"
            />
            <p class="text-xs df-text-muted mt-1.5">
              Como seu personagem será conhecido na campanha
            </p>
          </div>

          <!-- Botões -->
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              :disabled="loading || !inviteCode || !characterName"
              class="df-btn-primary flex-1"
            >
              <svg v-if="!loading" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              <div v-else class="df-spinner-sm"></div>
              {{ loading ? 'Entrando...' : 'Entrar na Campanha' }}
            </button>
            
            <button
              type="button"
              @click="$router.push('/dashboard')"
              :disabled="loading"
              class="df-btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div 
          v-if="successMessage" 
          class="df-alert df-alert-success mt-6"
        >
          <svg class="w-5 h-5 text-green-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div>
            <p class="text-green-400 font-semibold text-sm">Sucesso!</p>
            <p class="text-green-400/80 text-xs mt-0.5">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div 
          v-if="errorMessage" 
          class="df-alert df-alert-error mt-6"
        >
          <svg class="w-5 h-5 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <div>
            <p class="text-red-400 font-semibold text-sm">Erro</p>
            <p class="text-red-400/80 text-xs mt-0.5">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, navigateTo } from 'nuxt/app'



// State
const inviteCode = ref('')
const characterName = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Composables
const { joinCampaignByInviteCode } = useCampaign()
const router = useRouter()

// Methods
const handleJoin = async () => {
  if (!inviteCode.value || !characterName.value) return

  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    console.log('Tentando entrar na campanha:', {
      inviteCode: inviteCode.value,
      characterName: characterName.value
    })

    const result = await joinCampaignByInviteCode(
      inviteCode.value.trim().toUpperCase(),
      characterName.value.trim()
    )

    console.log('Resultado:', result)

    successMessage.value = `Você entrou na campanha "${result.campaign.name}" como ${result.player.name}!`
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

  } catch (error: any) {
    console.error('Erro ao entrar na campanha:', error)
    errorMessage.value = error.message || 'Erro desconhecido ao entrar na campanha'
  } finally {
    loading.value = false
  }
}

// SEO
useSeoMeta({
  title: 'Entrar em Campanha - Vampire RPG',
  description: 'Use o código de convite para entrar em uma campanha de Vampire: The Masquerade'
})
</script>

<style scoped>
/* ======================================================
   DARK FANTASY UI – Join Campaign
   ====================================================== */
.df-join {
  --df-bg-deep: #050510;
  --df-bg-card: #0a0a1a;
  --df-bg-input: #0d0d20;
  --df-border-red: #7f1d1d;
  --df-border-silver: #4a4a5a;
  --df-accent-red: #dc2626;
  --df-accent-crimson: #991b1b;
  --df-text-silver: #c0c0d0;
  --df-glow-red: rgba(220, 38, 38, 0.3);

  background: var(--df-bg-deep);
  background-image:
    radial-gradient(ellipse at 50% 30%, rgba(127, 29, 29, 0.08) 0%, transparent 60%);
  color: var(--df-text-silver);
}

/* ─── Panel ─── */
.df-join-panel {
  position: relative;
  background: var(--df-bg-deep);
  border: 2px solid var(--df-border-red);
  box-shadow:
    0 0 0 1px var(--df-border-silver),
    0 0 40px rgba(220, 38, 38, 0.12),
    inset 0 0 60px rgba(0, 0, 0, 0.5);
  border-radius: 0.75rem;
  padding: 2rem;
}

/* ─── Corner Decorations ─── */
.df-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  z-index: 2;
  pointer-events: none;
}
.df-corner::before,
.df-corner::after {
  content: '';
  position: absolute;
  background: var(--df-accent-crimson);
}
.df-corner::before { width: 20px; height: 2px; }
.df-corner::after  { width: 2px;  height: 20px; }
.df-corner-tl { top: -1px; left: -1px; }
.df-corner-tl::before { top: 0; left: 0; }
.df-corner-tl::after  { top: 0; left: 0; }
.df-corner-tr { top: -1px; right: -1px; }
.df-corner-tr::before { top: 0; right: 0; }
.df-corner-tr::after  { top: 0; right: 0; }
.df-corner-bl { bottom: -1px; left: -1px; }
.df-corner-bl::before { bottom: 0; left: 0; }
.df-corner-bl::after  { bottom: 0; left: 0; }
.df-corner-br { bottom: -1px; right: -1px; }
.df-corner-br::before { bottom: 0; right: 0; }
.df-corner-br::after  { bottom: 0; right: 0; }

/* ─── Icon ─── */
.df-join-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid var(--df-border-red);
  background: rgba(127, 29, 29, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px var(--df-glow-red);
}

/* ─── Title ─── */
.df-join-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--df-accent-red);
  text-shadow: 0 0 20px var(--df-glow-red), 0 2px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.02em;
}

/* ─── Text ─── */
.df-text-muted {
  color: #6b6b80;
}

/* ─── Label ─── */
.df-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--df-text-silver);
  margin-bottom: 0.5rem;
}

/* ─── Input ─── */
.df-input {
  width: 100%;
  padding: 0.7rem 0.85rem;
  background: var(--df-bg-input);
  border: 1px solid var(--df-border-red);
  border-radius: 0.375rem;
  color: var(--df-text-silver);
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.df-input::placeholder {
  color: #4a4a5a;
}
.df-input:focus {
  border-color: var(--df-accent-red);
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
}
.df-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── Buttons ─── */
.df-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.2rem;
  background: linear-gradient(135deg, var(--df-accent-crimson), #450a0a);
  border: 1px solid var(--df-border-red);
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.df-btn-primary:hover {
  background: linear-gradient(135deg, #b91c1c, #7f1d1d);
  box-shadow: 0 0 16px var(--df-glow-red);
  color: #fff;
}
.df-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.df-btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.2rem;
  background: transparent;
  border: 1px solid var(--df-border-silver);
  color: var(--df-text-silver);
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.df-btn-outline:hover {
  border-color: var(--df-accent-red);
  color: #fca5a5;
}
.df-btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── Spinner ─── */
.df-spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--df-border-red);
  border-top-color: #fca5a5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── Alerts ─── */
.df-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
}
.df-alert-success {
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.25);
}
.df-alert-error {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.25);
}

/* ─── Uppercase input ─── */
.uppercase {
  text-transform: uppercase;
}
</style>