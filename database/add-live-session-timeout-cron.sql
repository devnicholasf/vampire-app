-- ============================================================
-- Live Session Timeout Scheduler (Hardening)
-- ============================================================
-- Objetivo:
--   Garantir encerramento automatico de sessoes live inativas mesmo
--   quando nenhum cliente estiver abrindo paginas que chamam a RPC.
--
-- Requisito:
--   A funcao cleanup_inactive_live_sessions(INTEGER) deve existir.
--   Este script agenda execucao periodica somente se pg_cron existir.
-- ============================================================

DO $$
DECLARE
  has_pg_cron BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_cron'
  ) INTO has_pg_cron;

  IF has_pg_cron THEN
    IF NOT EXISTS (
      SELECT 1
      FROM cron.job
      WHERE jobname = 'cleanup-inactive-live-sessions-every-5-min'
    ) THEN
      PERFORM cron.schedule(
        'cleanup-inactive-live-sessions-every-5-min',
        '*/5 * * * *',
        'SELECT cleanup_inactive_live_sessions(30);'
      );
    END IF;
  END IF;
END;
$$;
