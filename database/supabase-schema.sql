-- ============================================
-- Supabase Database Schema for Vampire Campaigns
-- ============================================

-- Enable RLS (Row Level Security) for all tables
-- Enable Real-time replication for all tables

-- ============================================
-- 1. CAMPAIGNS Table
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  master_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_image_url TEXT,
  current_music_url TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CAMPAIGN_PLAYERS Table
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'player', -- 'player', 'co-master'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- ============================================
-- 3. NPCS Table
-- ============================================
CREATE TABLE IF NOT EXISTS npcs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100), -- 'Antagonista', 'Aliado', 'Neutro'
  clan VARCHAR(100),
  generation INTEGER,
  bio TEXT,
  key_points TEXT[], -- Array de strings
  photo_url TEXT,
  sheet_data JSONB DEFAULT '{}', -- Dados da ficha completa
  is_visible_to_players BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. CAMPAIGN_NOTES Table
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) DEFAULT 'note', -- 'note', 'plot', 'character', 'location'
  is_private BOOLEAN DEFAULT true, -- Apenas para mestres
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. CAMPAIGN_SESSIONS Table
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  session_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  players_present UUID[], -- Array de user IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. LIVE_GAME_STATE Table (para tempo real)
-- ============================================
CREATE TABLE IF NOT EXISTS live_game_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  is_live BOOLEAN DEFAULT false,
  current_scene VARCHAR(255),
  current_npcs JSONB DEFAULT '[]', -- NPCs ativos na cena atual
  active_players UUID[], -- Players ativos no momento
  timeline_events JSONB DEFAULT '[]', -- Eventos da timeline atual
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id)
);

-- ============================================
-- ENABLE RLS FOR ALL TABLES
-- ============================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_game_state ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Policies for campaigns
CREATE POLICY "Users can view campaigns they're part of" ON campaigns
  FOR SELECT USING (
    master_id = auth.uid() OR 
    id IN (
      SELECT campaign_id FROM campaign_players 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Masters can update their campaigns" ON campaigns
  FOR UPDATE USING (master_id = auth.uid());

CREATE POLICY "Users can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (master_id = auth.uid());

CREATE POLICY "Masters can delete their campaigns" ON campaigns
  FOR DELETE USING (master_id = auth.uid());

-- Policies for campaign_players
CREATE POLICY "Users can view players in their campaigns" ON campaign_players
  FOR SELECT USING (
    user_id = auth.uid() OR
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    ) OR
    campaign_id IN (
      SELECT campaign_id FROM campaign_players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Masters can manage players" ON campaign_players
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

CREATE POLICY "Users can join campaigns" ON campaign_players
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies for npcs
CREATE POLICY "Campaign members can view NPCs" ON npcs
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    ) OR
    campaign_id IN (
      SELECT campaign_id FROM campaign_players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Masters can manage NPCs" ON npcs
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

-- Policies for campaign_notes
CREATE POLICY "Campaign members can view allowed notes" ON campaign_notes
  FOR SELECT USING (
    (is_private = false AND campaign_id IN (
      SELECT campaign_id FROM campaign_players WHERE user_id = auth.uid()
    )) OR
    author_id = auth.uid() OR
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own notes" ON campaign_notes
  FOR ALL USING (author_id = auth.uid());

-- Policies for campaign_sessions
CREATE POLICY "Campaign members can view sessions" ON campaign_sessions
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    ) OR
    campaign_id IN (
      SELECT campaign_id FROM campaign_players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Masters can manage sessions" ON campaign_sessions
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

-- Policies for live_game_state
CREATE POLICY "Campaign members can view game state" ON live_game_state
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    ) OR
    campaign_id IN (
      SELECT campaign_id FROM campaign_players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Masters can manage game state" ON live_game_state
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

-- ============================================
-- Enable Real-time for all tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_players;
ALTER PUBLICATION supabase_realtime ADD TABLE npcs;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE live_game_state;

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_npcs_updated_at
  BEFORE UPDATE ON npcs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaign_notes_updated_at
  BEFORE UPDATE ON campaign_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaign_sessions_updated_at
  BEFORE UPDATE ON campaign_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_live_game_state_updated_at
  BEFORE UPDATE ON live_game_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================
/*
INSERT INTO campaigns (name, description, master_id) VALUES 
  ('Sombras de Lisboa', 'Uma campanha de Vampire: The Masquerade ambientada em Lisboa.', '00000000-0000-0000-0000-000000000000');

INSERT INTO npcs (campaign_id, name, type, clan, generation, bio, key_points) VALUES 
  ((SELECT id FROM campaigns LIMIT 1), 'Marcus Ventrue', 'Antagonista', 'Ventrue', 8, 'Um ancião político poderoso', ARRAY['Político', 'Rico', 'Influente']);
*/