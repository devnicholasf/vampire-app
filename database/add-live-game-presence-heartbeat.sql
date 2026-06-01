-- ============================================================
-- Presence heartbeat for live_game_state.active_players
-- ============================================================
-- Objetivo:
--   Evitar "online fantasma" quando o jogador fecha aba/navegador
--   sem conseguir executar leave.
--
-- Estrategia:
--   1) Registrar heartbeat por jogador em tabela dedicada.
--   2) join/leave/touch atualizam essa tabela.
--   3) active_players e recalculado apenas com heartbeats recentes.
-- ============================================================

CREATE TABLE IF NOT EXISTS live_game_presence (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (campaign_id, user_id)
);

ALTER TABLE live_game_presence ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_live_game_presence_campaign_seen
  ON live_game_presence(campaign_id, last_seen_at DESC);

DROP POLICY IF EXISTS "Users can view own or master live presence" ON live_game_presence;
DROP POLICY IF EXISTS "Users can insert own live presence" ON live_game_presence;
DROP POLICY IF EXISTS "Users can update own live presence" ON live_game_presence;
DROP POLICY IF EXISTS "Users can delete own live presence" ON live_game_presence;

CREATE POLICY "Users can view own or master live presence"
  ON live_game_presence
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR campaign_id IN (
      SELECT id FROM campaigns WHERE master_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own live presence"
  ON live_game_presence
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      campaign_id IN (
        SELECT campaign_id FROM campaign_players WHERE user_id = auth.uid()
      )
      OR campaign_id IN (
        SELECT id FROM campaigns WHERE master_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own live presence"
  ON live_game_presence
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own live presence"
  ON live_game_presence
  FOR DELETE
  USING (user_id = auth.uid());

-- Remove versoes anteriores para garantir assinatura consistente
DROP FUNCTION IF EXISTS join_live_game_presence(UUID);
DROP FUNCTION IF EXISTS leave_live_game_presence(UUID);
DROP FUNCTION IF EXISTS touch_live_game_presence(UUID);
DROP FUNCTION IF EXISTS cleanup_stale_live_game_presence(UUID);

CREATE OR REPLACE FUNCTION join_live_game_presence(campaign_id_param UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_players UUID[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM campaigns c
    WHERE c.id = campaign_id_param
      AND (
        c.master_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM campaign_players cp
          WHERE cp.campaign_id = c.id
            AND cp.user_id = auth.uid()
        )
      )
  ) THEN
    RAISE EXCEPTION 'Access denied to campaign';
  END IF;

  INSERT INTO live_game_presence (campaign_id, user_id, last_seen_at)
  VALUES (campaign_id_param, auth.uid(), NOW())
  ON CONFLICT (campaign_id, user_id)
  DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at;

  UPDATE live_game_state lgs
  SET active_players = COALESCE(
    ARRAY(
      SELECT p.user_id
      FROM live_game_presence p
      WHERE p.campaign_id = campaign_id_param
        AND p.last_seen_at >= NOW() - INTERVAL '90 seconds'
      ORDER BY p.last_seen_at DESC
    ),
    '{}'::uuid[]
  )
  WHERE lgs.campaign_id = campaign_id_param
  RETURNING active_players INTO current_players;

  RETURN COALESCE(current_players, '{}'::uuid[]);
END;
$$;

CREATE OR REPLACE FUNCTION touch_live_game_presence(campaign_id_param UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_players UUID[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM campaigns c
    WHERE c.id = campaign_id_param
      AND (
        c.master_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM campaign_players cp
          WHERE cp.campaign_id = c.id
            AND cp.user_id = auth.uid()
        )
      )
  ) THEN
    RAISE EXCEPTION 'Access denied to campaign';
  END IF;

  INSERT INTO live_game_presence (campaign_id, user_id, last_seen_at)
  VALUES (campaign_id_param, auth.uid(), NOW())
  ON CONFLICT (campaign_id, user_id)
  DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at;

  DELETE FROM live_game_presence
  WHERE campaign_id = campaign_id_param
    AND last_seen_at < NOW() - INTERVAL '90 seconds';

  UPDATE live_game_state lgs
  SET active_players = COALESCE(
    ARRAY(
      SELECT p.user_id
      FROM live_game_presence p
      WHERE p.campaign_id = campaign_id_param
        AND p.last_seen_at >= NOW() - INTERVAL '90 seconds'
      ORDER BY p.last_seen_at DESC
    ),
    '{}'::uuid[]
  )
  WHERE lgs.campaign_id = campaign_id_param
  RETURNING active_players INTO current_players;

  RETURN COALESCE(current_players, '{}'::uuid[]);
END;
$$;

CREATE OR REPLACE FUNCTION leave_live_game_presence(campaign_id_param UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_players UUID[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM campaigns c
    WHERE c.id = campaign_id_param
      AND (
        c.master_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM campaign_players cp
          WHERE cp.campaign_id = c.id
            AND cp.user_id = auth.uid()
        )
      )
  ) THEN
    RAISE EXCEPTION 'Access denied to campaign';
  END IF;

  DELETE FROM live_game_presence
  WHERE campaign_id = campaign_id_param
    AND user_id = auth.uid();

  DELETE FROM live_game_presence
  WHERE campaign_id = campaign_id_param
    AND last_seen_at < NOW() - INTERVAL '90 seconds';

  UPDATE live_game_state lgs
  SET active_players = COALESCE(
    ARRAY(
      SELECT p.user_id
      FROM live_game_presence p
      WHERE p.campaign_id = campaign_id_param
        AND p.last_seen_at >= NOW() - INTERVAL '90 seconds'
      ORDER BY p.last_seen_at DESC
    ),
    '{}'::uuid[]
  )
  WHERE lgs.campaign_id = campaign_id_param
  RETURNING active_players INTO current_players;

  RETURN COALESCE(current_players, '{}'::uuid[]);
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_stale_live_game_presence(campaign_id_param UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_players UUID[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM campaigns c
    WHERE c.id = campaign_id_param
      AND (
        c.master_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM campaign_players cp
          WHERE cp.campaign_id = c.id
            AND cp.user_id = auth.uid()
        )
      )
  ) THEN
    RAISE EXCEPTION 'Access denied to campaign';
  END IF;

  DELETE FROM live_game_presence
  WHERE campaign_id = campaign_id_param
    AND last_seen_at < NOW() - INTERVAL '90 seconds';

  UPDATE live_game_state lgs
  SET active_players = COALESCE(
    ARRAY(
      SELECT p.user_id
      FROM live_game_presence p
      WHERE p.campaign_id = campaign_id_param
        AND p.last_seen_at >= NOW() - INTERVAL '90 seconds'
      ORDER BY p.last_seen_at DESC
    ),
    '{}'::uuid[]
  )
  WHERE lgs.campaign_id = campaign_id_param
  RETURNING active_players INTO current_players;

  RETURN COALESCE(current_players, '{}'::uuid[]);
END;
$$;

GRANT EXECUTE ON FUNCTION join_live_game_presence(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION touch_live_game_presence(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION leave_live_game_presence(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_stale_live_game_presence(UUID) TO authenticated;

COMMENT ON TABLE live_game_presence IS 'Heartbeat de presenca de usuarios no live por campanha';
