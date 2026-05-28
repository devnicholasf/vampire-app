-- ============================================================
-- FIX: Evitar conflito de UNIQUE ao recusar/aceitar convites
-- ============================================================
-- Problema:
--   A constraint UNIQUE(campaign_id, invited_user_id, status) permite
--   apenas 1 linha por status. Se já existir uma linha "declined" antiga,
--   converter um novo convite pending -> declined gera erro 23505.
--
-- Solucao:
--   Manter unicidade apenas para convites pendentes (status='pending').
-- ============================================================

-- 1) Remover constraint antiga (se existir)
ALTER TABLE campaign_invites
DROP CONSTRAINT IF EXISTS campaign_invites_campaign_id_invited_user_id_status_key;

-- 2) Limpar indice antigo com mesmo objetivo (se existir)
DROP INDEX IF EXISTS campaign_invites_campaign_id_invited_user_id_status_key;

-- 3) Garantir apenas 1 convite pendente por campanha+usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_invites_unique_pending
  ON campaign_invites(campaign_id, invited_user_id)
  WHERE status = 'pending';
