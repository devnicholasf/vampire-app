-- ============================================
-- CORREÇÃO DEFINITIVA: Busca por código de convite via RPC Function
-- ============================================

-- PROBLEMA: RLS não consegue distinguir "listar campanhas" de "buscar por código"
-- SOLUÇÃO: Usar RPC function que bypassa RLS para busca específica por código

-- 1. Remover políticas antigas problemáticas
DROP POLICY IF EXISTS "simple_campaigns_select" ON campaigns;
DROP POLICY IF EXISTS "campaigns_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_select_restricted" ON campaigns;

-- 2. Criar política RESTRITIVA de SELECT (apenas mestre OU jogador)
CREATE POLICY "campaigns_select_restricted" ON campaigns
FOR SELECT TO authenticated
USING (
  -- Usuário é o mestre da campanha
  master_id = auth.uid()
  OR
  -- Usuário é jogador da campanha
  EXISTS (
    SELECT 1 FROM campaign_players
    WHERE campaign_players.campaign_id = campaigns.id
    AND campaign_players.user_id = auth.uid()
  )
);

-- 3. Remover função antiga (se existir) antes de criar com nova estrutura
DROP FUNCTION IF EXISTS find_campaign_by_invite_code(TEXT);

-- 4. Criar função RPC para buscar campanha por código de convite
-- Esta função bypassa RLS e permite buscar APENAS por código
-- Usa SETOF campaigns ao invés de RETURNS TABLE para evitar problemas de estrutura
CREATE OR REPLACE FUNCTION find_campaign_by_invite_code(invite_code_param TEXT)
RETURNS SETOF campaigns
SECURITY DEFINER -- Executa com privilégios do owner, não do usuário
SET search_path = public
LANGUAGE sql
AS $$
  SELECT *
  FROM campaigns
  WHERE invite_code = UPPER(invite_code_param)
  AND is_active = true
  LIMIT 1;
$$;

-- 5. Verificar se a política e função foram criadas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'campaigns';

-- 6. NOTA IMPORTANTE:
-- Agora use esta função RPC no código:
-- const { data } = await supabase.rpc('find_campaign_by_invite_code', { invite_code_param: 'GELYLO' })
