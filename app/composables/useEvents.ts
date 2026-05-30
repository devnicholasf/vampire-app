// ============================================
// useEvents — Event Sourcing read layer
// ============================================
// Architecture:
//   Live Game  → INSERT into campaign_events
//   This file  → SELECT / subscribe to campaign_events
//   Dashboard  → calls this composable (read-only)
// ============================================

import { createClient } from '@supabase/supabase-js'
import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#imports'

// ── Types ──────────────────────────────────────────────────

export type EventType =
  | 'narrative'
  | 'combat'
  | 'social'
  | 'discovery'
  | 'death'
  | 'embrace'
  | 'diablerie'
  | 'political'
  | 'feeding'
  | 'other'

export interface CampaignEvent {
  id: string
  campaignId: string
  title: string
  description: string | null
  type: EventType
  npcIds: string[]
  playerNames: string[]
  location: string | null
  occurredAt: Date
  ingameDate: string | null
  sessionId: string | null
  isSecret: boolean
  metadata: Record<string, any>
  createdBy: string
  createdAt: Date
}

// Labels & colours for each event type
export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; icon: string }> = {
  narrative:  { label: 'Narrativa',   color: '#c4c4d4', icon: 'book' },
  combat:     { label: 'Combate',     color: '#dc2626', icon: 'sword' },
  social:     { label: 'Social',      color: '#3b82f6', icon: 'users' },
  discovery:  { label: 'Descoberta',  color: '#d4a647', icon: 'search' },
  death:      { label: 'Morte',       color: '#6b21a8', icon: 'skull' },
  embrace:    { label: 'Abraço',      color: '#db2777', icon: 'droplet' },
  diablerie:  { label: 'Diablerie',   color: '#b91c1c', icon: 'zap' },
  political:  { label: 'Político',    color: '#d97706', icon: 'flag' },
  feeding:    { label: 'Caçada',      color: '#16a34a', icon: 'moon' },
  other:      { label: 'Outro',       color: '#4a4a5a', icon: 'circle' },
}

// ── Composable ─────────────────────────────────────────────

export const useEvents = (campaignId: string) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  // ── State ──
  const events        = ref<CampaignEvent[]>([])
  const loading       = ref(false)
  const error         = ref<string | null>(null)
  const showSecret    = ref(false)

  // ── Helpers ──
  const mapRow = (row: any): CampaignEvent => ({
    id:           row.id,
    campaignId:   row.campaign_id,
    title:        row.title,
    description:  row.description ?? null,
    type:         (row.type as EventType) ?? 'narrative',
    npcIds:       row.npc_ids ?? [],
    playerNames:  row.player_names ?? [],
    location:     row.location ?? null,
    occurredAt:   new Date(row.occurred_at),
    ingameDate:   row.ingame_date ?? null,
    sessionId:    row.session_id ?? null,
    isSecret:     row.is_secret ?? false,
    metadata:     row.metadata ?? {},
    createdBy:    row.created_by,
    createdAt:    new Date(row.created_at),
  })

  // ── Fetch all events for the campaign ──
  const fetchEvents = async () => {
    loading.value = true
    error.value = null
    try {
      const { data, error: sbErr } = await supabase
        .from('campaign_events')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('occurred_at', { ascending: false })

      if (sbErr) throw sbErr
      events.value = (data ?? []).map(mapRow)
    } catch (err: any) {
      error.value = err.message ?? 'Erro ao carregar eventos'
    } finally {
      loading.value = false
    }
  }

  // ── Computed helpers ──

  /** Visible events (respects secret toggle) */
  const visibleEvents = computed(() =>
    showSecret.value
      ? events.value
      : events.value.filter(e => !e.isSecret)
  )

  /** Count per event type */
  const countByType = computed(() => {
    const map: Record<string, number> = {}
    for (const e of visibleEvents.value) {
      map[e.type] = (map[e.type] ?? 0) + 1
    }
    return map
  })

  /** Events grouped by session (null = no session) */
  const bySession = computed(() => {
    const map = new Map<string | null, CampaignEvent[]>()
    for (const e of visibleEvents.value) {
      const key = e.sessionId ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return map
  })

  /**
   * Events that mention a specific NPC id.
   * Used by the "history per character" view in the dashboard.
   */
  const eventsForNpc = (npcId: string) =>
    visibleEvents.value.filter(e => e.npcIds.includes(npcId))

  /** Secret events count — shown to master only */
  const secretCount = computed(() =>
    events.value.filter(e => e.isSecret).length
  )

  // ── Realtime subscription ──
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

  const subscribeToEvents = () => {
    realtimeChannel = supabase
      .channel(`campaign_events:${campaignId}`)
      .on(
        'postgres_changes',
        // No filter here — DELETE payloads don't carry row data for filtered channels
        { event: 'INSERT', schema: 'public', table: 'campaign_events' },
        (payload) => {
          if ((payload.new as any)?.campaign_id === campaignId) {
            fetchEvents()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'campaign_events' },
        (payload) => {
          // payload.old contains the deleted row (requires REPLICA IDENTITY FULL)
          // As a safe fallback, always re-fetch on delete
          const deletedId = (payload.old as any)?.id
          if (deletedId) {
            events.value = events.value.filter(e => e.id !== deletedId)
          } else {
            fetchEvents()
          }
        }
      )
      .subscribe()
  }

  const unsubscribeFromEvents = () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  const deleteEvent = async (eventId: string): Promise<void> => {
    const { error: deleteError } = await supabase
      .from('campaign_events')
      .delete()
      .eq('id', eventId)
    if (deleteError) throw deleteError
    // Optimistic update — remove from local state immediately
    events.value = events.value.filter(e => e.id !== eventId)
  }

  return {
    events,
    visibleEvents,
    countByType,
    bySession,
    eventsForNpc,
    secretCount,
    showSecret,
    loading,
    error,
    fetchEvents,
    deleteEvent,
    subscribeToEvents,
    unsubscribeFromEvents,
    EVENT_TYPE_CONFIG,
  }
}
