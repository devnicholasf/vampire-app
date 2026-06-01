import { ref, computed, readonly } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#imports'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { ChatConversation, ChatMessage } from '../types/index'
import { useAuth } from './useAuth'

interface FriendUser {
  id: string
  name: string
  avatar?: string | null
}

interface FriendRequestItem {
  id: string
  requesterId: string
  receiverId: string
  user: FriendUser
  createdAt: Date
}

interface DirectMessageRow {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read_at: string | null
}

// Estado global compartilhado do chat
const conversations = ref<ChatConversation[]>([])
const activeConversation = ref<ChatConversation | null>(null)
const messages = ref<ChatMessage[]>([])
const friends = ref<FriendUser[]>([])
const incomingFriendRequests = ref<FriendRequestItem[]>([])
const outgoingFriendRequests = ref<FriendRequestItem[]>([])
const userSearchResults = ref<FriendUser[]>([])
const unreadByFriend = ref<Record<string, number>>({})

const globalLoading = ref(false)
const initialized = ref(false)
const selectedFriendId = ref<string | null>(null)

let dmChannel: RealtimeChannel | null = null
let requestChannel: RealtimeChannel | null = null
let sharedSupabaseClient: ReturnType<typeof createClient> | null = null

export const useChat = () => {
  const config = useRuntimeConfig()
  if (!sharedSupabaseClient) {
    sharedSupabaseClient = createClient(config.public.supabaseUrl, config.public.supabaseKey)
  }
  const supabase = sharedSupabaseClient
  const { user, restoreSession } = useAuth()

  const currentUserId = computed(() => String(user.value?.id || ''))
  const isLoading = computed(() => globalLoading.value)

  const unreadCount = computed(() => {
    return Object.values(unreadByFriend.value).reduce((total, count) => total + count, 0)
  })

  const filteredConversations = computed(() => (searchQuery: string) => {
    if (!searchQuery) return conversations.value
    return conversations.value.filter(conv =>
      conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const mapProfileToFriend = (profile: any): FriendUser => {
    const username = String(profile?.username || '').trim()
    return {
      id: String(profile?.user_id || ''),
      name: username || 'Usuário',
      avatar: profile?.avatar || null,
    }
  }

  const toChatMessage = (row: DirectMessageRow): ChatMessage => ({
    id: row.id,
    content: row.content,
    senderId: row.sender_id,
    createdAt: new Date(row.created_at),
  })

  const ensureMyProfile = async () => {
    if (!user.value) return

    const fallbackName = String(user.value.email || '').split('@')[0] || 'Usuário'

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.value.id,
        username: user.value.username || fallbackName,
        avatar: user.value.avatar || null,
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('CHAT: erro ao sincronizar perfil público:', error)
    }
  }

  const getProfilesByIds = async (ids: string[]) => {
    if (ids.length === 0) return []

    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, username, avatar')
      .in('user_id', ids)

    if (error) {
      console.error('CHAT: erro ao buscar perfis:', error)
      return []
    }

    return data || []
  }

  const loadFriendRequests = async () => {
    if (!currentUserId.value) return

    const me = currentUserId.value

    const [incomingRes, outgoingRes] = await Promise.all([
      supabase
        .from('friend_requests')
        .select('id, requester_id, receiver_id, created_at')
        .eq('receiver_id', me)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('friend_requests')
        .select('id, requester_id, receiver_id, created_at')
        .eq('requester_id', me)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ])

    if (incomingRes.error) {
      console.error('CHAT: erro ao carregar solicitações recebidas:', incomingRes.error)
    }

    if (outgoingRes.error) {
      console.error('CHAT: erro ao carregar solicitações enviadas:', outgoingRes.error)
    }

    const incomingRows = incomingRes.data || []
    const outgoingRows = outgoingRes.data || []

    const profileIds = [
      ...incomingRows.map(row => String(row.requester_id)),
      ...outgoingRows.map(row => String(row.receiver_id)),
    ]

    const uniqueIds = [...new Set(profileIds)]
    const profiles = await getProfilesByIds(uniqueIds)
    const profileById = new Map(profiles.map(profile => [String(profile.user_id), profile]))

    incomingFriendRequests.value = incomingRows.map(row => {
      const profile = profileById.get(String(row.requester_id))
      return {
        id: String(row.id),
        requesterId: String(row.requester_id),
        receiverId: String(row.receiver_id),
        user: mapProfileToFriend(profile),
        createdAt: new Date(row.created_at),
      }
    })

    outgoingFriendRequests.value = outgoingRows.map(row => {
      const profile = profileById.get(String(row.receiver_id))
      return {
        id: String(row.id),
        requesterId: String(row.requester_id),
        receiverId: String(row.receiver_id),
        user: mapProfileToFriend(profile),
        createdAt: new Date(row.created_at),
      }
    })
  }

  const loadFriends = async () => {
    if (!currentUserId.value) return

    const me = currentUserId.value
    const { data, error } = await supabase
      .from('friend_requests')
      .select('requester_id, receiver_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${me},receiver_id.eq.${me}`)

    if (error) {
      console.error('CHAT: erro ao carregar amizades:', error)
      friends.value = []
      return
    }

    const otherIds = (data || []).map((row: any) => {
      const requester = String(row.requester_id)
      const receiver = String(row.receiver_id)
      return requester === me ? receiver : requester
    }).filter(Boolean)

    const uniqueIds = [...new Set(otherIds)]
    const profiles = await getProfilesByIds(uniqueIds)
    friends.value = profiles.map(mapProfileToFriend).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }

  const loadConversationSummaries = async () => {
    if (!currentUserId.value) return

    const me = currentUserId.value
    const friendById = new Map(friends.value.map(friend => [friend.id, friend]))

    const { data, error } = await supabase
      .from('direct_messages')
      .select('id, sender_id, receiver_id, content, created_at, read_at')
      .or(`sender_id.eq.${me},receiver_id.eq.${me}`)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      console.error('CHAT: erro ao carregar resumo das conversas:', error)
      conversations.value = friends.value.map(friend => ({
        id: friend.id,
        otherUser: { id: friend.id, name: friend.name },
        unreadCount: 0,
      }))
      unreadByFriend.value = {}
      return
    }

    const lastByFriend = new Map<string, DirectMessageRow>()
    const unreadMap: Record<string, number> = {}

    for (const row of (data || []) as DirectMessageRow[]) {
      const senderId = String(row.sender_id)
      const receiverId = String(row.receiver_id)
      const friendId = senderId === me ? receiverId : senderId

      if (!friendById.has(friendId)) continue

      if (!lastByFriend.has(friendId)) {
        lastByFriend.set(friendId, row)
      }

      if (receiverId === me && !row.read_at) {
        unreadMap[friendId] = (unreadMap[friendId] || 0) + 1
      }
    }

    const convs: ChatConversation[] = friends.value.map(friend => {
      const lastRow = lastByFriend.get(friend.id)
      return {
        id: friend.id,
        otherUser: { id: friend.id, name: friend.name },
        lastMessage: lastRow ? toChatMessage(lastRow) : undefined,
        unreadCount: unreadMap[friend.id] || 0,
      }
    })

    convs.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt?.getTime() || 0
      const bTime = b.lastMessage?.createdAt?.getTime() || 0
      return bTime - aTime
    })

    conversations.value = convs
    unreadByFriend.value = unreadMap
  }

  const loadConversations = async () => {
    await loadFriends()
    await loadConversationSummaries()
  }

  const markConversationAsRead = async (friendId: string) => {
    if (!currentUserId.value || !friendId) return

    const me = currentUserId.value
    const { error } = await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', friendId)
      .eq('receiver_id', me)
      .is('read_at', null)

    if (error) {
      console.error('CHAT: erro ao marcar conversa como lida:', error)
    }

    unreadByFriend.value = {
      ...unreadByFriend.value,
      [friendId]: 0,
    }

    conversations.value = conversations.value.map(conv =>
      conv.id === friendId ? { ...conv, unreadCount: 0 } : conv
    )
  }

  const loadMessages = async (friendId: string) => {
    if (!currentUserId.value || !friendId) {
      messages.value = []
      return
    }

    globalLoading.value = true

    try {
      const me = currentUserId.value
      const { data, error } = await supabase
        .from('direct_messages')
        .select('id, sender_id, receiver_id, content, created_at, read_at')
        .or(`and(sender_id.eq.${me},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${me})`)
        .order('created_at', { ascending: true })
        .limit(300)

      if (error) {
        console.error('CHAT: erro ao carregar mensagens:', error)
        messages.value = []
        return
      }

      messages.value = ((data || []) as DirectMessageRow[]).map(toChatMessage)
      await markConversationAsRead(friendId)
      await loadConversationSummaries()
    } finally {
      globalLoading.value = false
    }
  }

  const selectConversation = async (conversation: ChatConversation) => {
    activeConversation.value = conversation
    selectedFriendId.value = conversation.id
    await loadMessages(conversation.id)
  }

  const sendMessage = async (content: string): Promise<boolean> => {
    const friendId = selectedFriendId.value
    if (!currentUserId.value || !friendId || !content.trim()) return false

    const me = currentUserId.value

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: me,
        receiver_id: friendId,
        content: content.trim(),
      })
      .select('id, sender_id, receiver_id, content, created_at, read_at')
      .single()

    if (error) {
      console.error('CHAT: erro ao enviar mensagem:', error)
      return false
    }

    messages.value = [...messages.value, toChatMessage(data as DirectMessageRow)]
    await loadConversationSummaries()
    return true
  }

  const searchUsers = async (searchQuery: string) => {
    if (!currentUserId.value || searchQuery.trim().length < 2) {
      userSearchResults.value = []
      return
    }

    const me = currentUserId.value
    const query = searchQuery.trim()
    const friendIds = new Set(friends.value.map(friend => friend.id))
    const outgoingIds = new Set(outgoingFriendRequests.value.map(request => request.user.id))
    const incomingIds = new Set(incomingFriendRequests.value.map(request => request.user.id))

    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id, username, avatar')
      .ilike('username', `%${query}%`)
      .neq('user_id', me)
      .limit(12)

    if (error) {
      console.error('CHAT: erro ao buscar usuários:', error)
      userSearchResults.value = []
      return
    }

    userSearchResults.value = (data || [])
      .map(mapProfileToFriend)
      .filter(profile => !friendIds.has(profile.id))
      .filter(profile => !outgoingIds.has(profile.id))
      .filter(profile => !incomingIds.has(profile.id))
  }

  const sendFriendRequest = async (targetUserId: string) => {
    if (!currentUserId.value || !targetUserId || targetUserId === currentUserId.value) return

    const me = currentUserId.value

    const { data: existing, error: existingError } = await supabase
      .from('friend_requests')
      .select('id, requester_id, receiver_id, status')
      .or(`and(requester_id.eq.${me},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${me})`)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingError) {
      throw new Error('Não foi possível verificar amizade existente')
    }

    const current = existing?.[0]
    if (current?.status === 'accepted') {
      throw new Error('Vocês já são amigos')
    }

    if (current?.status === 'pending') {
      if (String(current.receiver_id) === me) {
        await respondToFriendRequest(String(current.id), true)
        return
      }
      throw new Error('Solicitação de amizade já enviada')
    }

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        requester_id: me,
        receiver_id: targetUserId,
        status: 'pending',
      })

    if (error) {
      throw new Error('Não foi possível enviar solicitação de amizade')
    }

    await loadFriendRequests()
  }

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    if (!currentUserId.value || !requestId) return

    const nextStatus = accept ? 'accepted' : 'rejected'
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: nextStatus })
      .eq('id', requestId)
      .eq('receiver_id', currentUserId.value)
      .eq('status', 'pending')

    if (error) {
      throw new Error('Não foi possível processar solicitação de amizade')
    }

    await Promise.all([
      loadFriendRequests(),
      loadFriends(),
      loadConversationSummaries(),
    ])
  }

  const handleRealtimeRefresh = async () => {
    if (!currentUserId.value) return

    await Promise.all([
      loadFriendRequests(),
      loadFriends(),
      loadConversationSummaries(),
    ])

    if (selectedFriendId.value) {
      await loadMessages(selectedFriendId.value)
    }
  }

  const subscribeRealtime = () => {
    if (!currentUserId.value) return

    if (dmChannel) {
      supabase.removeChannel(dmChannel)
      dmChannel = null
    }

    if (requestChannel) {
      supabase.removeChannel(requestChannel)
      requestChannel = null
    }

    const me = currentUserId.value

    dmChannel = supabase
      .channel(`chat-dm-${me}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, (payload: any) => {
        const row = payload?.new || payload?.old
        const senderId = String(row?.sender_id || '')
        const receiverId = String(row?.receiver_id || '')
        if (senderId === me || receiverId === me) {
          handleRealtimeRefresh()
        }
      })
      .subscribe()

    requestChannel = supabase
      .channel(`chat-friend-requests-${me}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, (payload: any) => {
        const row = payload?.new || payload?.old
        const requesterId = String(row?.requester_id || '')
        const receiverId = String(row?.receiver_id || '')
        if (requesterId === me || receiverId === me) {
          handleRealtimeRefresh()
        }
      })
      .subscribe()
  }

  const addConversation = (conversation: ChatConversation) => {
    const existingIndex = conversations.value.findIndex(c => c.id === conversation.id)
    if (existingIndex >= 0) {
      conversations.value[existingIndex] = conversation
    } else {
      conversations.value.unshift(conversation)
    }
  }

  const removeConversation = (conversationId: string) => {
    const index = conversations.value.findIndex(c => c.id === conversationId)
    if (index >= 0) {
      conversations.value.splice(index, 1)
    }

    if (activeConversation.value?.id === conversationId) {
      activeConversation.value = null
      selectedFriendId.value = null
      messages.value = []
    }
  }

  const initialize = async () => {
    if (globalLoading.value) return

    globalLoading.value = true

    try {
      await restoreSession()
      if (!currentUserId.value) {
        conversations.value = []
        friends.value = []
        incomingFriendRequests.value = []
        outgoingFriendRequests.value = []
        userSearchResults.value = []
        messages.value = []
        activeConversation.value = null
        selectedFriendId.value = null
        return
      }

      await ensureMyProfile()

      await Promise.all([
        loadFriendRequests(),
        loadConversations(),
      ])

      subscribeRealtime()
      initialized.value = true
    } finally {
      globalLoading.value = false
    }
  }

  return {
    conversations: readonly(conversations),
    activeConversation: readonly(activeConversation),
    messages: readonly(messages),
    friends: readonly(friends),
    incomingFriendRequests: readonly(incomingFriendRequests),
    outgoingFriendRequests: readonly(outgoingFriendRequests),
    userSearchResults: readonly(userSearchResults),
    isLoading: readonly(isLoading),
    currentUserId,
    initialized: readonly(initialized),

    unreadCount,
    filteredConversations,

    initialize,
    loadConversations,
    loadMessages,
    selectConversation,
    sendMessage,
    markConversationAsRead,
    addConversation,
    removeConversation,
    searchUsers,
    sendFriendRequest,
    respondToFriendRequest,
    loadFriendRequests,
    loadFriends,
  }
}