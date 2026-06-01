-- ============================================================
-- Direct Messages Retention Optimization
-- ============================================================
-- Objetivo:
--   Apagar mensagens pessoais (direct_messages) com mais de 7 dias
--   para economizar storage e manter consultas mais rapidas.
--
-- Estrategia:
--   1) Criar indice para corte por created_at.
--   2) Limpeza em lote para evitar lock longo.
--   3) Funcao wrapper para execucao facil/manual/cron.
--   4) Agendamento automatico diario quando pg_cron existir.
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at_asc
  ON direct_messages(created_at ASC);

CREATE OR REPLACE FUNCTION cleanup_direct_messages_retention(
  retention_days INTEGER DEFAULT 7,
  batch_size INTEGER DEFAULT 2000
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  total_deleted INTEGER := 0;
BEGIN
  IF retention_days < 1 THEN
    RAISE EXCEPTION 'retention_days deve ser >= 1';
  END IF;

  IF batch_size < 100 THEN
    RAISE EXCEPTION 'batch_size deve ser >= 100';
  END IF;

  LOOP
    WITH rows_to_delete AS (
      SELECT id
      FROM direct_messages
      WHERE created_at < NOW() - make_interval(days => retention_days)
      ORDER BY created_at ASC
      LIMIT batch_size
    )
    DELETE FROM direct_messages dm
    USING rows_to_delete r
    WHERE dm.id = r.id;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    total_deleted := total_deleted + deleted_count;

    EXIT WHEN deleted_count = 0;
  END LOOP;

  RETURN total_deleted;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_old_direct_messages()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM cleanup_direct_messages_retention(7, 2000);
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_direct_messages_retention(INTEGER, INTEGER) TO authenticated;

-- Agendamento diario opcional (02:30 UTC), somente se pg_cron estiver instalado.
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
      WHERE jobname = 'cleanup-old-direct-messages-daily'
    ) THEN
      PERFORM cron.schedule(
        'cleanup-old-direct-messages-daily',
        '30 2 * * *',
        'SELECT cleanup_old_direct_messages();'
      );
    END IF;
  END IF;
END;
$$;

COMMENT ON FUNCTION cleanup_direct_messages_retention(INTEGER, INTEGER)
  IS 'Apaga mensagens diretas antigas em lotes para retencao de storage';
