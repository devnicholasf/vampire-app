// ============================================
// useTimeline - Gerenciamento da Timeline
// ============================================

// @ts-ignore - Auto-importado pelo Nuxt
import type { TimelineEvent, TimelineEventType, ApiResponse } from '~/types'

export const useTimeline = (campaignId: string) => {
  // @ts-ignore - Auto-importado pelo Nuxt
  const { token } = useAuth()
  
  // @ts-ignore - Auto-importado pelo Nuxt
  const events = useState<TimelineEvent[]>(`timeline-${campaignId}`, () => [])
  // @ts-ignore - Auto-importado pelo Nuxt
  const loading = useState<boolean>('timeline-loading', () => false)
  // @ts-ignore - Auto-importado pelo Nuxt
  const error = useState<string | null>('timeline-error', () => null)

  // ============================================
  // Buscar eventos da timeline
  // ============================================
  const fetchEvents = async () => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<TimelineEvent[]>>(
        `/api/timeline/${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )

      if (response.success && response.data) {
        events.value = response.data.sort((a: TimelineEvent, b: TimelineEvent) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        return { success: true }
      } else {
        error.value = response.error || 'Erro ao buscar timeline'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao buscar timeline'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Adicionar evento
  // ============================================
  const addEvent = async (data: {
    type: TimelineEventType
    title: string
    description: string
    session?: number
  }) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<TimelineEvent>>(
        `/api/timeline/${campaignId}/add`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`
          },
          body: data
        }
      )

      if (response.success && response.data) {
        events.value.unshift(response.data)
        return { success: true, data: response.data }
      } else {
        error.value = response.error || 'Erro ao adicionar evento'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao adicionar evento'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Atualizar evento
  // ============================================
  const updateEvent = async (eventId: string, data: Partial<TimelineEvent>) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse<TimelineEvent>>(
        `/api/timeline/${campaignId}/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token.value}`
          },
          body: data
        }
      )

      if (response.success && response.data) {
        const index = events.value.findIndex((e: TimelineEvent) => e.id === eventId)
        if (index !== -1) {
          events.value[index] = response.data
        }
        return { success: true }
      } else {
        error.value = response.error || 'Erro ao atualizar evento'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao atualizar evento'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Deletar evento
  // ============================================
  const deleteEvent = async (eventId: string) => {
    loading.value = true
    error.value = null

    try {
      // @ts-ignore - Auto-importado pelo Nuxt
      const response = await $fetch<ApiResponse>(
        `/api/timeline/${campaignId}/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )

      if (response.success) {
        events.value = events.value.filter((e: TimelineEvent) => e.id !== eventId)
        return { success: true }
      } else {
        error.value = response.error || 'Erro ao deletar evento'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.message || 'Erro ao deletar evento'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // Filtrar eventos por tipo
  // ============================================
  const filterByType = (type: TimelineEventType) => {
    // @ts-ignore - Auto-importado pelo Nuxt
    return computed(() => events.value.filter((e: TimelineEvent) => e.type === type))
  }

  // ============================================
  // Filtrar eventos por sessão
  // ============================================
  const filterBySession = (session: number) => {
    // @ts-ignore - Auto-importado pelo Nuxt
    return computed(() => events.value.filter((e: TimelineEvent) => e.session === session))
  }

  return {
    // State
    // @ts-ignore - Auto-importado pelo Nuxt
    events: readonly(events),
    // @ts-ignore - Auto-importado pelo Nuxt
    loading: readonly(loading),
    // @ts-ignore - Auto-importado pelo Nuxt
    error: readonly(error),

    // Methods
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    filterByType,
    filterBySession
  }
}
