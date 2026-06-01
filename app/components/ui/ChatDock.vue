<template>
  <Teleport to="body">
    <Transition name="chat-dock">
      <div
        v-if="isVisible"
        class="fixed bottom-0 z-[9999] transition-[width,right] duration-150"
        :class="[dockWidthClass, dockRightClass]"
      >
        <div
          class="w-full rounded-t-vampire border border-border-primary border-b-0 bg-surface-card text-text-primary shadow-panel-df overflow-hidden flex flex-col"
          :class="dockHeightClass"
          style="transition: height 0.15s cubic-bezier(0.4,0,0.2,1)"
        >
          <div
            class="h-10 flex-shrink-0 flex items-center px-2 gap-2 bg-gradient-dark border-b border-border-dark select-none"
            :class="{ 'flash-alert': flashAlert }"
            @click="isMinimized ? (isMinimized = false) : undefined"
            :style="isMinimized ? 'cursor:pointer' : ''"
          >
            <svg class="w-4 h-4 text-df-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>

            <span class="text-sm font-semibold text-text-primary font-cinzel tracking-wide flex-1 truncate">
              <template v-if="activeTab === 'friends'">Amigos</template>
              <template v-else>
                <span class="inline-flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block flex-shrink-0"></span>
                  {{ activeFriendData?.name ?? 'Chat' }}
                </span>
              </template>
            </span>

            <span
              v-if="isMinimized && hasUnreadTotal"
              class="w-2 h-2 rounded-full bg-df-red animate-pulse flex-shrink-0"
            />

            <div class="flex items-center gap-0.5 flex-shrink-0">
              <button
                @click.stop="isMinimized = !isMinimized"
                class="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover rounded transition-colors"
                :title="isMinimized ? 'Expandir' : 'Minimizar'"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/>
                </svg>
              </button>
              <button
                @click.stop="handleUserClose"
                class="w-6 h-6 flex items-center justify-center text-text-muted hover:text-df-red hover:bg-df-red/10 rounded transition-colors"
                title="Fechar"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-show="!isMinimized" class="flex flex-1 min-h-0">
            <div class="w-12 flex-shrink-0 flex flex-col items-center bg-surface-dark border-r border-border-dark py-2 gap-2 overflow-y-auto scrollbar-none">
              <button
                @click="openAddFriendModal"
                class="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ring-1 ring-border-secondary hover:ring-df-gold hover:bg-surface-hover"
                title="Adicionar amigo"
              >
                <svg class="w-4 h-4 text-df-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 19a4 4 0 00-8 0M19 19a4 4 0 00-3-3.87M8 9a3 3 0 106 0 3 3 0 00-6 0M18 8v6M15 11h6"/>
                </svg>
              </button>

              <button
                @click="activeTab = 'friends'"
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ring-1',
                  activeTab === 'friends'
                    ? 'ring-df-red bg-df-red/20 shadow-glow-red'
                    : 'ring-border-secondary hover:ring-df-red hover:bg-df-red/10'
                ]"
                title="Lista de Amigos"
              >
                <svg class="w-4 h-4 text-df-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>

              <div v-if="openConversations.length" class="w-5 h-px bg-border-dark flex-shrink-0"/>

              <div v-for="conv in openConversations" :key="conv.friendId" class="relative flex-shrink-0">
                <button
                  @click="switchToConversation(conv.friendId)"
                  :class="[
                    'w-8 h-8 rounded-full overflow-hidden transition-all duration-150 ring-1 block',
                    activeTab === conv.friendId
                      ? 'ring-df-red shadow-glow-red'
                      : 'ring-border-secondary hover:ring-df-red'
                  ]"
                  :title="conv.name"
                >
                  <img v-if="conv.avatar" :src="conv.avatar" alt="" class="w-full h-full object-cover"/>
                  <span v-else class="w-full h-full bg-surface-hover flex items-center justify-center text-[10px] font-bold text-df-red">
                    {{ initials(conv.name) }}
                  </span>
                </button>
                <span
                  v-if="convUnread(conv.friendId) > 0 && activeTab !== conv.friendId"
                  class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-df-red rounded-full border-2 border-surface-dark pointer-events-none"
                />
                <button
                  @click.stop="openAvatarActions(conv.friendId, $event)"
                  class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-border-secondary bg-surface-dark text-text-muted hover:text-df-gold transition-colors"
                  title="Ações do amigo"
                >
                  <svg class="w-2.5 h-2.5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>
              </div>
            </div>

            <div class="flex-1 flex flex-col min-w-0">
              <div v-if="activeTab === 'friends'" class="flex-1 flex flex-col min-h-0">
                <div v-if="incomingFriendRequests.length" class="px-2.5 py-1.5 border-b border-border-dark flex-shrink-0">
                  <p class="text-[10px] uppercase tracking-widest text-text-muted mb-1.5">Solicitações recebidas</p>
                  <div v-for="req in incomingFriendRequests" :key="req.id" class="flex items-center gap-1.5 py-0.5">
                    <div class="w-6 h-6 rounded-full bg-surface-hover flex items-center justify-center flex-shrink-0 border border-border-secondary">
                      <span class="text-[9px] font-bold text-df-red">{{ initials(req.user.name) }}</span>
                    </div>
                    <span class="text-xs text-text-secondary flex-1 truncate">{{ req.user.name }}</span>
                    <button
                      @click="handleRespond(req.id, true)"
                      :disabled="requestActionLoading"
                      class="w-6 h-6 flex items-center justify-center rounded text-green-400 hover:bg-green-900/20 disabled:opacity-50 text-lg leading-none"
                    >✓</button>
                    <button
                      @click="handleRespond(req.id, false)"
                      :disabled="requestActionLoading"
                      class="w-6 h-6 flex items-center justify-center rounded text-df-red hover:bg-df-red/10 disabled:opacity-50 text-sm leading-none"
                    >✕</button>
                  </div>
                </div>

                <div v-if="outgoingFriendRequests.length" class="px-2.5 py-1.5 border-b border-border-dark flex-shrink-0">
                  <p class="text-[10px] uppercase tracking-widest text-text-muted mb-1">Enviadas</p>
                  <div v-for="req in outgoingFriendRequests" :key="req.id" class="py-0.5 flex items-center gap-2">
                    <span class="text-xs text-text-muted truncate flex-1">{{ req.user.name }}</span>
                    <span class="text-[10px] text-text-muted">aguardando</span>
                  </div>
                </div>

                <div class="flex-1 overflow-y-auto">
                  <div v-if="!friends.length" class="text-xs text-text-muted text-center py-6 px-4 leading-relaxed">
                    Nenhum amigo ainda.
                  </div>
                  <button
                    v-for="friend in friends"
                    :key="friend.id"
                    @click="openConversation(friend)"
                    class="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-surface-hover transition-colors text-left"
                  >
                    <div
                      class="relative w-7 h-7 rounded-full overflow-hidden bg-surface-hover border border-border-secondary flex-shrink-0"
                      @click.stop="openAvatarActions(friend.id, $event)"
                    >
                      <img v-if="friend.avatar" :src="friend.avatar" alt="" class="w-full h-full object-cover"/>
                      <span v-else class="w-full h-full flex items-center justify-center text-[10px] font-bold text-df-red">
                        {{ initials(friend.name) }}
                      </span>
                      <button
                        @click.stop="openAvatarActions(friend.id, $event)"
                        class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-border-secondary bg-surface-dark text-text-muted hover:text-df-gold transition-colors"
                        title="Ações do amigo"
                      >
                        <svg class="w-2.5 h-2.5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                    </div>
                    <span class="text-xs text-text-secondary flex-1 truncate">{{ friend.name }}</span>
                    <span v-if="convUnread(friend.id) > 0" class="w-2 h-2 rounded-full bg-df-red flex-shrink-0 animate-pulse"/>
                  </button>
                </div>
              </div>

              <div v-else class="flex-1 flex flex-col min-h-0">
                <div ref="messagesEl" class="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
                  <div v-if="!messages.length" class="text-xs text-text-muted text-center py-6 px-2">
                    Nenhuma mensagem ainda. Diga ola!
                  </div>
                  <div v-for="msg in messages" :key="msg.id" class="leading-[1.6] break-words">
                    <span
                      :class="msg.senderId === currentUserId ? 'text-df-red' : 'text-df-gold'"
                      class="text-xs font-bold mr-1 select-text"
                    >{{ msg.senderId === currentUserId ? 'Voce' : activeFriendData?.name }}:</span>
                    <span class="text-xs text-text-secondary select-text">{{ msg.content }}</span>
                  </div>
                </div>

                <div class="px-2.5 pb-2.5 pt-1.5 border-t border-border-dark flex-shrink-0">
                  <input
                    ref="inputEl"
                    v-model="messageInput"
                    @keydown.enter.prevent="handleSend"
                    placeholder="Pressione Enter para enviar..."
                    maxlength="500"
                    class="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <BaseModal
          :show="showAddFriendModal"
          title="Convite de Amizade"
          subtitle="Adicionar jogador por codigo unico"
          size="sm"
          @update:show="showAddFriendModal = $event"
        >
          <div class="space-y-3">
            <div>
              <p class="text-xs uppercase tracking-wide text-text-muted mb-1">Seu codigo</p>
              <div class="flex items-center gap-2">
                <div class="flex-1 px-3 py-2 rounded-vampire border border-border-secondary bg-surface text-sm tracking-wider text-df-gold font-semibold text-center">
                  {{ myFriendCode || 'GERANDO...' }}
                </div>
                <button
                  type="button"
                  @click="copyMyCode"
                  :disabled="!myFriendCode"
                  class="h-9 px-3 rounded-vampire border border-border-secondary bg-surface text-xs text-text-secondary hover:text-text-primary hover:border-df-gold disabled:opacity-40"
                >
                  Copiar
                </button>
              </div>
            </div>

            <form @submit.prevent="handleAddByCode" class="space-y-2">
              <label class="text-xs uppercase tracking-wide text-text-muted">Codigo do usuario</label>
              <input
                v-model="friendCodeInput"
                maxlength="12"
                placeholder="Ex: K9H2M7QW"
                class="w-full px-3 py-2 rounded-vampire border border-border bg-surface text-sm tracking-wider uppercase text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-accent"
              />
              <button
                type="submit"
                :disabled="addFriendLoading || !friendCodeInput.trim()"
                class="w-full h-9 rounded-vampire border border-df-red/50 bg-df-red/15 text-df-red hover:bg-df-red/25 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold tracking-wide"
              >
                {{ addFriendLoading ? 'Enviando...' : 'Enviar convite de amizade' }}
              </button>
            </form>

            <p v-if="addFriendError" class="text-xs text-df-red">{{ addFriendError }}</p>
            <p v-if="addFriendSuccess" class="text-xs text-green-400">{{ addFriendSuccess }}</p>
          </div>
        </BaseModal>

        <div
          v-if="showAvatarActions && selectedFriendAction"
          class="fixed inset-0 z-[10050]"
          @click="closeAvatarActions"
        >
          <div
            class="absolute rounded-vampire border border-border-primary bg-surface-card shadow-panel-df min-w-[180px]"
            :style="avatarActionsStyle"
            @click.stop
          >
            <button
              class="w-full text-left px-3 py-2 text-xs text-df-red hover:bg-df-red/10 rounded-vampire transition-colors"
              @click="openRemoveFriendConfirm"
            >
              Remover amigo
            </button>
          </div>
        </div>

        <BaseModal
          :show="showRemoveFriendModal"
          panel-class="border border-border-primary shadow-panel-df"
          title="Remover Amigo"
          subtitle="Confirmacao de acao"
          size="sm"
          @update:show="showRemoveFriendModal = $event"
        >
          <div class="space-y-4">
            <p class="text-sm text-text-secondary">
              Deseja remover
              <span class="font-semibold text-text-primary">{{ selectedFriendAction?.name || 'este amigo' }}</span>
              da sua lista de contatos?
            </p>
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="h-9 px-3 rounded-vampire border border-border-secondary bg-surface text-xs text-text-secondary hover:text-text-primary"
                @click="showRemoveFriendModal = false"
              >
                Cancelar
              </button>
              <button
                type="button"
                :disabled="removeFriendLoading"
                class="inline-flex items-center justify-center h-9 px-4 rounded-vampire border border-df-border-red bg-gradient-to-br from-df-crimson to-[#450a0a] text-[#fca5a5] text-sm font-semibold uppercase tracking-[0.04em] transition-all hover:from-[#b91c1c] hover:to-[#7f1d1d] hover:text-white hover:shadow-glow-red disabled:opacity-50 disabled:cursor-not-allowed"
                @click="confirmRemoveFriend"
              >
                {{ removeFriendLoading ? 'Removendo...' : 'Remover amigo' }}
              </button>
            </div>
            <p v-if="removeFriendError" class="text-xs text-df-red">{{ removeFriendError }}</p>
          </div>
        </BaseModal>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute } from '#imports'
import { useChat } from '../../composables/useChat'
import { useToast } from '../../composables/useToast'
import type { ChatConversation } from '../../types/index'
import BaseModal from './BaseModal.vue'

const emit = defineEmits<{
  (e: 'closed-by-user'): void
}>()

interface OpenConv {
  friendId: string
  name: string
  avatar?: string | null
}

const {
  friends,
  conversations,
  messages,
  incomingFriendRequests,
  outgoingFriendRequests,
  myFriendCode,
  currentUserId,
  initialize,
  selectConversation,
  sendMessage,
  sendFriendRequestByCode,
  removeFriend,
  respondToFriendRequest,
} = useChat()
const { success: toastSuccess } = useToast()

const route = useRoute()

const isVisible = ref(false)
const isMinimized = ref(false)
const flashAlert = ref(false)
const activeTab = ref<'friends' | string>('friends')
const openConversations = ref<OpenConv[]>([])

const messageInput = ref('')
const friendCodeInput = ref('')
const addFriendLoading = ref(false)
const addFriendError = ref('')
const addFriendSuccess = ref('')
const requestActionLoading = ref(false)
const requestActionError = ref('')
const showAddFriendModal = ref(false)
const showAvatarActions = ref(false)
const selectedFriendAction = ref<{ id: string; name: string } | null>(null)
const showRemoveFriendModal = ref(false)
const removeFriendLoading = ref(false)
const removeFriendError = ref('')
const avatarActionsX = ref(0)
const avatarActionsY = ref(0)

const messagesEl = ref<HTMLElement>()
const inputEl = ref<HTMLInputElement>()

const activeFriendData = computed<OpenConv | null>(() =>
  activeTab.value === 'friends'
    ? null
    : openConversations.value.find(c => c.friendId === activeTab.value) ?? null
)

const hasUnreadTotal = computed(() =>
  conversations.value.some(c => c.unreadCount > 0)
)

const dockHeightClass = computed(() => {
  if (isMinimized.value) return 'h-10'

  // Home de amigos fica compacto; conversa ativa expande um pouco,
  // sem ocupar muito espaco da tela.
  if (activeTab.value === 'friends') return 'h-[180px]'
  return 'h-[280px]'
})

const dockWidthClass = computed(() => {
  // Em repouso (minimizado), ocupar menos espaco na tela.
  if (isMinimized.value) return 'w-[180px]'

  // Em uso, manter a largura maior para conversa.
  return 'w-[450px]'
})

const dockRightClass = computed(() => {
  const path = route.path || ''
  const isLiveRoute = path.includes('/live')
  return isLiveRoute ? 'right-[25rem]' : 'right-4'
})

const avatarActionsStyle = computed(() => ({
  left: `${avatarActionsX.value}px`,
  top: `${avatarActionsY.value}px`,
}))

const convUnread = (friendId: string): number =>
  conversations.value.find(c => c.id === friendId)?.unreadCount ?? 0

const initials = (name: string): string => {
  const words = String(name || 'U').split(' ').filter(w => w.length > 0)
  if (words.length >= 2) return ((words[0]![0] ?? '') + (words[1]![0] ?? '')).toUpperCase()
  return (words[0] ?? 'U').substring(0, 2).toUpperCase()
}

const scrollToBottom = () => {
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

const triggerFlash = () => {
  flashAlert.value = false
  void nextTick(() => { flashAlert.value = true })
  setTimeout(() => { flashAlert.value = false }, 3200)
}

const open = async (): Promise<void> => {
  isVisible.value = true
  isMinimized.value = false
  await initialize()
}

const close = (): void => {
  isVisible.value = false
}

const handleUserClose = (): void => {
  isVisible.value = false
  emit('closed-by-user')
}

const openMinimized = async (): Promise<void> => {
  isVisible.value = true
  isMinimized.value = true
  await initialize()
}

const openConversation = async (friend: { id: string; name: string; avatar?: string | null }): Promise<void> => {
  if (!openConversations.value.find(c => c.friendId === friend.id)) {
    openConversations.value.push({ friendId: friend.id, name: friend.name, avatar: friend.avatar })
  }
  await switchToConversation(friend.id)
}

const switchToConversation = async (friendId: string): Promise<void> => {
  activeTab.value = friendId
  const existingConv = conversations.value.find(c => c.id === friendId)
  const friendEntry = friends.value.find(f => f.id === friendId)
  const friendName = friendEntry?.name ?? openConversations.value.find(c => c.friendId === friendId)?.name ?? 'Usuario'

  const conv: ChatConversation = existingConv
    ? (existingConv as ChatConversation)
    : { id: friendId, otherUser: { id: friendId, name: friendName }, unreadCount: 0 }

  await selectConversation(conv)
  await nextTick()
  scrollToBottom()
  inputEl.value?.focus()
}

const handleSend = async (): Promise<void> => {
  const text = messageInput.value.trim()
  if (!text) return
  const ok = await sendMessage(text)
  if (ok) {
    messageInput.value = ''
    await nextTick()
    scrollToBottom()
  }
}

const openAddFriendModal = (): void => {
  addFriendError.value = ''
  addFriendSuccess.value = ''
  friendCodeInput.value = ''
  showAddFriendModal.value = true
}

const openAvatarActions = (friendId: string, event?: MouseEvent): void => {
  const friend = friends.value.find(f => f.id === friendId)
    || openConversations.value.find(f => f.friendId === friendId)

  if (!friend) return

  selectedFriendAction.value = { id: friendId, name: friend.name }
  showAvatarActions.value = true

  const menuWidth = 190
  const menuHeight = 46
  const margin = 8

  const target = event?.currentTarget
  if (target instanceof HTMLElement) {
    const rect = target.getBoundingClientRect()

    const preferredLeft = rect.right - menuWidth
    const preferredTop = rect.bottom + 6

    avatarActionsX.value = Math.min(
      Math.max(margin, preferredLeft),
      window.innerWidth - menuWidth - margin
    )
    avatarActionsY.value = Math.min(
      Math.max(margin, preferredTop),
      window.innerHeight - menuHeight - margin
    )
    return
  }

  avatarActionsX.value = window.innerWidth - menuWidth - margin
  avatarActionsY.value = window.innerHeight - (isMinimized.value ? 90 : 220)
}

const closeAvatarActions = (): void => {
  showAvatarActions.value = false
}

const openRemoveFriendConfirm = (): void => {
  closeAvatarActions()
  showRemoveFriendModal.value = true
  removeFriendError.value = ''
}

const confirmRemoveFriend = async (): Promise<void> => {
  if (!selectedFriendAction.value) return

  removeFriendLoading.value = true
  removeFriendError.value = ''

  try {
    await removeFriend(selectedFriendAction.value.id)
    openConversations.value = openConversations.value.filter(c => c.friendId !== selectedFriendAction.value?.id)
    if (activeTab.value === selectedFriendAction.value.id) {
      activeTab.value = 'friends'
    }
    toastSuccess('Amigo removido', `${selectedFriendAction.value.name} foi removido da sua lista de contatos.`)
    showRemoveFriendModal.value = false
    selectedFriendAction.value = null
  } catch (e: unknown) {
    removeFriendError.value = (e instanceof Error ? e.message : null) ?? 'Nao foi possivel remover este amigo.'
  } finally {
    removeFriendLoading.value = false
  }
}

const handleAddByCode = async (): Promise<void> => {
  const code = friendCodeInput.value.trim()
  if (!code) {
    addFriendError.value = 'Informe um codigo para enviar o convite.'
    addFriendSuccess.value = ''
    return
  }

  addFriendError.value = ''
  addFriendSuccess.value = ''
  addFriendLoading.value = true

  try {
    await sendFriendRequestByCode(code)
    friendCodeInput.value = ''
    addFriendSuccess.value = 'Convite enviado com sucesso.'
  } catch (e: unknown) {
    addFriendError.value = (e instanceof Error ? e.message : null) ?? 'Nao foi possivel enviar por codigo.'
  } finally {
    addFriendLoading.value = false
  }
}

const copyMyCode = async (): Promise<void> => {
  const code = myFriendCode.value
  if (!code) return

  try {
    await navigator.clipboard.writeText(code)
    addFriendError.value = ''
    addFriendSuccess.value = 'Codigo copiado.'
  } catch {
    addFriendError.value = 'Nao foi possivel copiar o codigo.'
    addFriendSuccess.value = ''
  }
}

const handleRespond = async (requestId: string, accept: boolean): Promise<void> => {
  requestActionLoading.value = true
  requestActionError.value = ''

  try {
    await respondToFriendRequest(requestId, accept)
  } catch (e: unknown) {
    requestActionError.value = (e instanceof Error ? e.message : null) ?? 'Erro ao responder solicitacao.'
  } finally {
    requestActionLoading.value = false
  }
}

watch(messages, () => void nextTick(scrollToBottom), { deep: true })

watch(
  () => conversations.value.reduce((t, c) => t + c.unreadCount, 0),
  (next, prev) => {
    if (next > (prev ?? 0) && isMinimized.value) triggerFlash()
  }
)

onMounted(() => void initialize())

defineExpose({ open, openMinimized, close, isVisible })
</script>

<style scoped>
@keyframes flashBlink {
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(220, 38, 38, 0.2); }
}

.flash-alert {
  animation: flashBlink 0.8s ease-in-out 4;
}

.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.scrollbar-none {
  scrollbar-width: none;
}

.chat-dock-enter-active,
.chat-dock-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.chat-dock-enter-from,
.chat-dock-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
