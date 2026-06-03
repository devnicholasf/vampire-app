-- Diagnostic only (read-only)
-- Goal: check if campaigns were deleted or only hidden by RLS/policies.

-- 1) Global counts (executed in SQL Editor as postgres/service role should bypass RLS)
SELECT COUNT(*) AS campaigns_total FROM campaigns;
SELECT COUNT(*) AS campaign_players_total FROM campaign_players;

-- 2) Recent campaigns present in DB
SELECT id, name, master_id, created_at
FROM campaigns
ORDER BY created_at DESC
LIMIT 50;

-- 3) Membership rows for recent campaigns
SELECT cp.campaign_id, cp.user_id, cp.role, cp.joined_at
FROM campaign_players cp
JOIN campaigns c ON c.id = cp.campaign_id
ORDER BY cp.joined_at DESC
LIMIT 100;

-- 4) Validate RLS status for critical tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('campaigns', 'campaign_players', 'live_game_state')
ORDER BY tablename;

-- 5) List policies currently attached
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('campaigns', 'campaign_players', 'live_game_state')
ORDER BY tablename, policyname;
