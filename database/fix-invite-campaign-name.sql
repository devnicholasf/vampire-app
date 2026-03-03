-- ============================================
-- Fix: Add campaign_name to campaign_invites
-- ============================================
-- The invited user can't see the campaigns table via RLS
-- (they're not a member yet), so the join returns null.
-- We store the campaign name directly in the invite.

ALTER TABLE campaign_invites 
ADD COLUMN IF NOT EXISTS campaign_name TEXT;
