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

-- 2. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR SE TODAS AS POLÍTICAS FORAM REMOVIDAS
SELECT policyname FROM pg_policies WHERE tablename = 'campaigns';

-- 4. REABILITAR RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

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

-- 6. VERIFICAR SE AS NOVAS POLÍTICAS FORAM CRIADAS
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'campaigns';

-- 7. TESTAR SE FUNCIONA (execute uma consulta simples)
-- SELECT * FROM campaigns LIMIT 1;