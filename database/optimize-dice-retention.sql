-- ============================================================
-- Dice Retention Optimization (no archive)
-- - Limpeza em lotes para reduzir lock/impacto
-- - Retenção configurável por dias
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_dice_rolls_created_at_asc
  ON dice_rolls(created_at ASC);

CREATE OR REPLACE FUNCTION cleanup_dice_rolls_retention(
  retention_days INTEGER DEFAULT 90,
  batch_size INTEGER DEFAULT 5000
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_batch INTEGER := 0;
  deleted_total INTEGER := 0;
BEGIN
  LOOP
    WITH doomed AS (
      SELECT id
      FROM dice_rolls
      WHERE created_at < NOW() - make_interval(days => retention_days)
      ORDER BY created_at ASC
      LIMIT batch_size
    )
    DELETE FROM dice_rolls d
    USING doomed
    WHERE d.id = doomed.id;

    GET DIAGNOSTICS deleted_batch = ROW_COUNT;
    deleted_total := deleted_total + deleted_batch;

    EXIT WHEN deleted_batch = 0;
  END LOOP;

  RETURN deleted_total;
END;
$$;

-- Compatibilidade com função anterior citada na base
CREATE OR REPLACE FUNCTION cleanup_old_dice_rolls()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM cleanup_dice_rolls_retention(90, 5000);
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_dice_rolls_retention(INTEGER, INTEGER) TO authenticated;
