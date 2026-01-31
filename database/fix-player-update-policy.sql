-- ============================================
-- FIX: Permitir que jogadores atualizem suas próprias fichas
-- ============================================

-- Remover política de UPDATE existente
DROP POLICY IF EXISTS "campaign_players_update_policy" ON campaign_players;

-- Criar nova política que permite:
-- 1. Jogadores atualizarem sua própria ficha (user_id = auth.uid())
-- 2. Mestres atualizarem fichas de jogadores em suas campanhas
CREATE POLICY "campaign_players_update_policy" ON campaign_players
FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
  )
);
