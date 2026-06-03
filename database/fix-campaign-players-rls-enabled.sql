-- Fix Security Advisor errors for campaign_players
-- Ensures RLS is enabled on a table that already has policies.

ALTER TABLE IF EXISTS campaign_players ENABLE ROW LEVEL SECURITY;
