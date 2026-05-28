-- ============================================================
-- FIX: Presenca online no live_game_state para jogadores
-- ============================================================
-- Problema:
--   Jogadores conseguem ler live_game_state, mas em alguns cenarios
--   de RLS nao conseguem atualizar active_players.
--
-- Solucao:
--   Criar RPCs SECURITY DEFINER para entrar/sair da presenca,
--   validando participacao na campanha sem abrir UPDATE amplo.
-- ============================================================

-- Remove versoes anteriores, se existirem
DROP FUNCTION IF EXISTS join_live_game_presence(UUID);
DROP FUNCTION IF EXISTS leave_live_game_presence(UUID);

-- Entrar na presenca
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

  -- Usuario precisa ser mestre ou jogador da campanha
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

  UPDATE live_game_state lgs
  SET active_players = (
    SELECT ARRAY(
      SELECT DISTINCT p
      FROM unnest(COALESCE(lgs.active_players, '{}'::uuid[]) || auth.uid()) AS p
    )
  )
  WHERE lgs.campaign_id = campaign_id_param
  RETURNING active_players INTO current_players;

  RETURN COALESCE(current_players, '{}'::uuid[]);
END;
$$;

-- Sair da presenca
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

  -- Usuario precisa ser mestre ou jogador da campanha
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

  UPDATE live_game_state lgs
  SET active_players = COALESCE(
    ARRAY(
      SELECT p
      FROM unnest(COALESCE(lgs.active_players, '{}'::uuid[])) AS p
      WHERE p <> auth.uid()
    ),
    '{}'::uuid[]
  )
  WHERE lgs.campaign_id = campaign_id_param
  RETURNING active_players INTO current_players;

  RETURN COALESCE(current_players, '{}'::uuid[]);
END;
$$;

GRANT EXECUTE ON FUNCTION join_live_game_presence(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION leave_live_game_presence(UUID) TO authenticated;
