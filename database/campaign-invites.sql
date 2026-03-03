-- ============================================
-- Campaign Invites System
-- ============================================
-- Execute this SQL in your Supabase SQL Editor

-- ============================================
-- 1. CAMPAIGN_INVITES Table
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_email TEXT NOT NULL,
  invited_user_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate pending invites for same user+campaign
  UNIQUE(campaign_id, invited_user_id, status)
);

-- ============================================
-- 2. Enable RLS
-- ============================================
ALTER TABLE campaign_invites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS Policies
-- ============================================

-- Masters can view invites for their campaigns
CREATE POLICY "Masters can view campaign invites" ON campaign_invites
  FOR SELECT USING (
    invited_by = auth.uid() OR
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

-- Invited users can view their own invites
CREATE POLICY "Users can view their invites" ON campaign_invites
  FOR SELECT USING (invited_user_id = auth.uid());

-- Masters can create invites for their campaigns
CREATE POLICY "Masters can create invites" ON campaign_invites
  FOR INSERT WITH CHECK (
    invited_by = auth.uid() AND
    campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

-- Masters and invited users can update invite status
CREATE POLICY "Users can update their invite status" ON campaign_invites
  FOR UPDATE USING (
    invited_user_id = auth.uid() OR
    invited_by = auth.uid()
  );

-- ============================================
-- 4. Enable Real-time
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_invites;

-- ============================================
-- 5. RPC: Check if email exists in auth.users
-- ============================================
CREATE OR REPLACE FUNCTION check_user_by_email(email_param TEXT)
RETURNS TABLE(user_id UUID, user_email TEXT) AS $$
BEGIN
  RETURN QUERY 
    SELECT id, email::TEXT 
    FROM auth.users 
    WHERE email = lower(email_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. RPC: Accept invite (atomic: update invite + add player)
-- ============================================
CREATE OR REPLACE FUNCTION accept_campaign_invite(invite_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  v_invite campaign_invites%ROWTYPE;
  v_campaign campaigns%ROWTYPE;
  v_existing campaign_players%ROWTYPE;
BEGIN
  -- Get the invite
  SELECT * INTO v_invite FROM campaign_invites 
  WHERE id = invite_id_param AND invited_user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;
  
  IF v_invite.status != 'pending' THEN
    RAISE EXCEPTION 'Este convite já foi respondido ou expirou';
  END IF;
  
  IF v_invite.expires_at < NOW() THEN
    -- Auto-expire
    UPDATE campaign_invites SET status = 'expired' WHERE id = invite_id_param;
    RAISE EXCEPTION 'Este convite expirou';
  END IF;
  
  -- Get campaign info
  SELECT * INTO v_campaign FROM campaigns WHERE id = v_invite.campaign_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campanha não encontrada';
  END IF;
  
  -- Check if already in campaign
  SELECT * INTO v_existing FROM campaign_players 
  WHERE campaign_id = v_invite.campaign_id AND user_id = auth.uid();
  
  IF FOUND THEN
    -- Already in campaign, just mark invite as accepted
    UPDATE campaign_invites 
    SET status = 'accepted', responded_at = NOW() 
    WHERE id = invite_id_param;
    
    RETURN jsonb_build_object(
      'success', true, 
      'campaign_id', v_invite.campaign_id,
      'campaign_name', v_campaign.name,
      'already_member', true
    );
  END IF;
  
  -- Update invite status
  UPDATE campaign_invites 
  SET status = 'accepted', responded_at = NOW() 
  WHERE id = invite_id_param;
  
  -- Add player to campaign
  INSERT INTO campaign_players (campaign_id, user_id, character_name, role, joined_at, sheet)
  VALUES (
    v_invite.campaign_id, 
    auth.uid(), 
    'Novo Personagem',
    'player', 
    NOW(),
    '{
      "name": "Novo Personagem",
      "concept": "",
      "clan": "",
      "generation": 13,
      "sect": "",
      "haven": "",
      "player": "",
      "avatar": "",
      "bloodPotency": 0,
      "humanity": 7,
      "willpower": 3,
      "hunger": 1,
      "xpTotal": 0,
      "xpSpent": 0,
      "attributes": {
        "physical": {"strength": 1, "dexterity": 1, "stamina": 1},
        "social": {"charisma": 1, "manipulation": 1, "appearance": 1},
        "mental": {"perception": 1, "intelligence": 1, "wits": 1}
      },
      "skills": {
        "talents": {"alertness": 1, "athletics": 1, "awareness": 1, "brawl": 1, "empathy": 1, "expression": 1, "intimidation": 1, "leadership": 1, "streetwise": 1, "subterfuge": 1},
        "skills": {"animalKen": 1, "craft": 1, "drive": 1, "etiquette": 1, "firearms": 1, "larceny": 1, "melee": 1, "performance": 1, "stealth": 1, "survival": 1},
        "knowledges": {"academics": 1, "computer": 1, "finance": 1, "investigation": 1, "law": 1, "medicine": 1, "occult": 1, "politics": 1, "science": 1, "technology": 1}
      },
      "disciplines": [{"name": "", "level": 0}],
      "virtues": {"conscience": 1, "selfControl": 1, "courage": 1},
      "conditions": [""],
      "notes": ""
    }'::jsonb
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'campaign_id', v_invite.campaign_id,
    'campaign_name', v_campaign.name,
    'already_member', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. RPC: Decline invite
-- ============================================
CREATE OR REPLACE FUNCTION decline_campaign_invite(invite_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE campaign_invites 
  SET status = 'declined', responded_at = NOW() 
  WHERE id = invite_id_param 
    AND invited_user_id = auth.uid()
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. Index for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_campaign_invites_user 
  ON campaign_invites(invited_user_id, status);

CREATE INDEX IF NOT EXISTS idx_campaign_invites_campaign 
  ON campaign_invites(campaign_id, status);
