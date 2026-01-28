-- ============================================
-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS para Debugar
-- ============================================

-- Desabilitar RLS em todas as tabelas temporariamente
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE npcs DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_game_state DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "campaigns_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_policy" ON campaigns;

DROP POLICY IF EXISTS "campaign_players_select_policy" ON campaign_players;
DROP POLICY IF EXISTS "campaign_players_insert_policy" ON campaign_players;
DROP POLICY IF EXISTS "campaign_players_update_policy" ON campaign_players;
DROP POLICY IF EXISTS "campaign_players_delete_policy" ON campaign_players;

DROP POLICY IF EXISTS "npcs_policy" ON npcs;
DROP POLICY IF EXISTS "campaign_notes_policy" ON campaign_notes;
DROP POLICY IF EXISTS "campaign_sessions_policy" ON campaign_sessions;
DROP POLICY IF EXISTS "live_game_state_policy" ON live_game_state;

-- Verificar se RLS foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('campaigns', 'campaign_players', 'npcs', 'campaign_notes', 'campaign_sessions', 'live_game_state');