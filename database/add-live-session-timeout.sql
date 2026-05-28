-- ============================================================
-- Live Session Timeout Optimization
-- - Rastreia atividade da sessão ao vivo
-- - Encerra sessões inativas automaticamente via RPC
-- ============================================================

-- 1) Coluna de atividade
ALTER TABLE live_game_state
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE live_game_state
SET last_activity_at = COALESCE(last_activity_at, updated_at, created_at, NOW())
WHERE last_activity_at IS NULL;

ALTER TABLE live_game_state
  ALTER COLUMN last_activity_at SET NOT NULL;

-- 2) Trigger unificado para updated_at + activity timestamp
CREATE OR REPLACE FUNCTION set_live_game_state_activity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Só atualiza atividade quando a sessão está online.
  IF NEW.is_live THEN
    NEW.last_activity_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_live_game_state_updated_at ON live_game_state;
DROP TRIGGER IF EXISTS trg_live_game_state_activity_timestamp ON live_game_state;

CREATE TRIGGER trg_live_game_state_activity_timestamp
  BEFORE INSERT OR UPDATE ON live_game_state
  FOR EACH ROW EXECUTE FUNCTION set_live_game_state_activity_timestamp();

CREATE INDEX IF NOT EXISTS idx_live_game_state_live_last_activity
  ON live_game_state(is_live, last_activity_at DESC);

-- 3) RPC: encerra sessões inativas
CREATE OR REPLACE FUNCTION cleanup_inactive_live_sessions(timeout_minutes INTEGER DEFAULT 30)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INTEGER := 0;
BEGIN
  UPDATE live_game_state
  SET
    is_live = false,
    current_scene = '',
    active_players = '{}'::uuid[],
    timeline_events = '[]'::jsonb
  WHERE is_live = true
    AND COALESCE(last_activity_at, updated_at, created_at) < NOW() - make_interval(mins => timeout_minutes);

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_inactive_live_sessions(INTEGER) TO authenticated;
