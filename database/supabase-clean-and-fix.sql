-- ============================================
-- LIMPEZA COMPLETA E CORREÇÃO DEFINITIVA
-- ============================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES (incluindo as antigas que não foram removidas)
DROP POLICY IF EXISTS "Masters can delete their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can view campaigns they're part of" ON campaigns;
DROP POLICY IF EXISTS "campaigns_delete_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_select_policy" ON campaigns;
DROP POLICY IF EXISTS "campaigns_update_policy" ON campaigns;

-- Remover qualquer outra política que possa existir
DROP POLICY IF EXISTS "Users can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can manage their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Players can view joined campaigns" ON campaigns;

-- Remover as políticas simples se já existirem
DROP POLICY IF EXISTS "simple_campaigns_select" ON campaigns;
DROP POLICY IF EXISTS "simple_campaigns_insert" ON campaigns;
DROP POLICY IF EXISTS "simple_campaigns_update" ON campaigns;
DROP POLICY IF EXISTS "simple_campaigns_delete" ON campaigns;

-- Remover políticas problemáticas de campaign_players
DROP POLICY IF EXISTS "simple_campaign_players_select" ON campaign_players;
DROP POLICY IF EXISTS "simple_campaign_players_insert" ON campaign_players;
DROP POLICY IF EXISTS "simple_campaign_players_update" ON campaign_players;
DROP POLICY IF EXISTS "simple_campaign_players_delete" ON campaign_players;

-- 2. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- Também desabilitar RLS na tabela campaign_players (causa da recursão)
ALTER TABLE campaign_players DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR SE TODAS AS POLÍTICAS FORAM REMOVIDAS
SELECT policyname FROM pg_policies WHERE tablename = 'campaigns';

-- 4. REABILITAR RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- TEMPORARIAMENTE desabilitar RLS para campaign_players até funcionar 100%
-- ALTER TABLE campaign_players ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR POLÍTICAS SIMPLES E SEGURAS (SEM SUBQUERIES COMPLEXAS)

-- Política para SELECT: Apenas ver suas próprias campanhas como mestre
CREATE POLICY "simple_campaigns_select" ON campaigns
FOR SELECT TO authenticated
USING (master_id = auth.uid());

-- Política para INSERT: Apenas criar campanhas para si mesmo
CREATE POLICY "simple_campaigns_insert" ON campaigns
FOR INSERT TO authenticated
WITH CHECK (master_id = auth.uid());

-- Política para UPDATE: Apenas mestres podem atualizar suas campanhas
CREATE POLICY "simple_campaigns_update" ON campaigns
FOR UPDATE TO authenticated
USING (master_id = auth.uid())
WITH CHECK (master_id = auth.uid());

-- Política para DELETE: Apenas mestres podem deletar suas campanhas
CREATE POLICY "simple_campaigns_delete" ON campaigns
FOR DELETE TO authenticated
USING (master_id = auth.uid());

-- POLÍTICAS PARA CAMPAIGN_PLAYERS (TEMPORARIAMENTE DESABILITADAS)
-- Vamos reativar depois que testarmos com dados reais

/*
-- Players podem ver apenas seus próprios registros
CREATE POLICY "simple_campaign_players_select" ON campaign_players
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Players podem se adicionar às campanhas
CREATE POLICY "simple_campaign_players_insert" ON campaign_players
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Players podem atualizar apenas seus próprios dados
CREATE POLICY "simple_campaign_players_update" ON campaign_players
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Players podem se remover das campanhas
CREATE POLICY "simple_campaign_players_delete" ON campaign_players
FOR DELETE TO authenticated
USING (user_id = auth.uid());
*/

-- 6. VERIFICAR SE AS NOVAS POLÍTICAS FORAM CRIADAS
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'campaigns';

-- 7. TESTAR SE FUNCIONA (execute uma consulta simples)
-- SELECT * FROM campaigns LIMIT 1;