-- ============================================
-- Event Sourcing: campaign_events table
-- ============================================
-- Architecture:
--   Live Game  →  creates events (INSERT)
--   This table →  stores the chronicle history
--   Dashboard  →  reads & summarizes (SELECT)
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_events (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id      UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- What happened
  title            VARCHAR(255) NOT NULL,
  description      TEXT,
  type             VARCHAR(50) NOT NULL DEFAULT 'narrative',
  -- types: 'narrative' | 'combat' | 'social' | 'discovery' | 'death'
  --        | 'embrace' | 'diablerie' | 'political' | 'feeding' | 'other'

  -- Who was involved (NPC ids from the npcs table, or free-text player names)
  npc_ids          UUID[] DEFAULT '{}',
  player_names     TEXT[] DEFAULT '{}',
  location         VARCHAR(255),

  -- When (both real-time and in-game narrative time)
  occurred_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ingame_date      VARCHAR(100),   -- e.g. "Noite de 12 de Março, 1998"
  session_id       UUID REFERENCES campaign_sessions(id) ON DELETE SET NULL,

  -- Visibility
  is_secret        BOOLEAN DEFAULT false,  -- only master can see if true

  -- Who logged it
  created_by       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Extra flexible data (tags, custom fields, etc.)
  metadata         JSONB DEFAULT '{}',

  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign_id
  ON campaign_events(campaign_id);

CREATE INDEX IF NOT EXISTS idx_campaign_events_occurred_at
  ON campaign_events(campaign_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_events_type
  ON campaign_events(campaign_id, type);

-- ── Updated_at trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_campaign_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_campaign_events_updated_at ON campaign_events;
CREATE TRIGGER trg_campaign_events_updated_at
  BEFORE UPDATE ON campaign_events
  FOR EACH ROW EXECUTE FUNCTION update_campaign_events_updated_at();

-- ── Row Level Security ─────────────────────────────────────
ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;

-- Masters can do everything in their campaigns
CREATE POLICY "Masters can manage events"
  ON campaign_events FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

-- Players can read non-secret events in campaigns they're part of
CREATE POLICY "Players can view non-secret events"
  ON campaign_events FOR SELECT
  USING (
    is_secret = false
    AND campaign_id IN (
      SELECT campaign_id FROM campaign_players WHERE user_id = auth.uid()
    )
  );

-- Enable realtime
ALTER TABLE campaign_events REPLICA IDENTITY FULL;
-- Note: if supabase_realtime publication already includes this table, skip the line below
-- ALTER PUBLICATION supabase_realtime ADD TABLE campaign_events;
