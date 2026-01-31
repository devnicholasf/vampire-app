-- ============================================
-- FIX: Corrigir Políticas RLS para Campaigns
-- ============================================

-- 1. Remover todas as políticas existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Users can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Masters can manage their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Players can view joined campaigns" ON campaigns;

-- 2. Desabilitar RLS temporariamente para limpeza
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- 3. Reabilitar RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas simples e seguras

-- Política para SELECT: Usuários podem ver campanhas onde são mestres OU jogadores
CREATE POLICY "campaigns_select_policy" ON campaigns
FOR SELECT TO authenticated
USING (
  master_id = auth.uid() 
  OR 
  id IN (
    SELECT campaign_id 
    FROM campaign_players 
    WHERE user_id = auth.uid()
  )
);

-- Política para INSERT: Usuários autenticados podem criar campanhas
CREATE POLICY "campaigns_insert_policy" ON campaigns
FOR INSERT TO authenticated
WITH CHECK (master_id = auth.uid());

-- Política para UPDATE: Apenas mestres podem atualizar suas campanhas
CREATE POLICY "campaigns_update_policy" ON campaigns
FOR UPDATE TO authenticated
USING (master_id = auth.uid())
WITH CHECK (master_id = auth.uid());

-- Política para DELETE: Apenas mestres podem deletar suas campanhas  
CREATE POLICY "campaigns_delete_policy" ON campaigns
FOR DELETE TO authenticated
USING (master_id = auth.uid());

-- ============================================
-- Corrigir políticas para campaign_players também
-- ============================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Masters can manage campaign players" ON campaign_players;
DROP POLICY IF EXISTS "Players can view their participations" ON campaign_players;

-- Desabilitar e reabilitar RLS
ALTER TABLE campaign_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_players ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples
CREATE POLICY "campaign_players_select_policy" ON campaign_players
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR 
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
  )
);

CREATE POLICY "campaign_players_insert_policy" ON campaign_players
FOR INSERT TO authenticated
WITH CHECK (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
  )
);

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

CREATE POLICY "campaign_players_delete_policy" ON campaign_players
FOR DELETE TO authenticated
USING (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
  )
);

-- ============================================
-- Corrigir políticas para outras tabelas
-- ============================================

-- NPCs
DROP POLICY IF EXISTS "Users can manage NPCs in their campaigns" ON npcs;
ALTER TABLE npcs DISABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "npcs_policy" ON npcs
FOR ALL TO authenticated
USING (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
      OR id IN (
        SELECT campaign_id 
        FROM campaign_players 
        WHERE user_id = auth.uid()
      )
  )
)
WITH CHECK (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
  )
);

-- Campaign Notes
DROP POLICY IF EXISTS "Users can manage notes in their campaigns" ON campaign_notes;
ALTER TABLE campaign_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_notes_policy" ON campaign_notes
FOR ALL TO authenticated
USING (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
      OR id IN (
        SELECT campaign_id 
        FROM campaign_players 
        WHERE user_id = auth.uid()
      )
  )
)
WITH CHECK (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
      OR id IN (
        SELECT campaign_id 
        FROM campaign_players 
        WHERE user_id = auth.uid() AND role = 'player'
      )
  )
);

-- Campaign Sessions
DROP POLICY IF EXISTS "Users can manage sessions in their campaigns" ON campaign_sessions;
ALTER TABLE campaign_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_sessions_policy" ON campaign_sessions
FOR ALL TO authenticated
USING (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
      OR id IN (
        SELECT campaign_id 
        FROM campaign_players 
        WHERE user_id = auth.uid()
      )
  )
)
WITH CHECK (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
  )
);

-- Live Game State
DROP POLICY IF EXISTS "Users can manage live game state in their campaigns" ON live_game_state;
ALTER TABLE live_game_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE live_game_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_game_state_policy" ON live_game_state
FOR ALL TO authenticated
USING (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
      OR id IN (
        SELECT campaign_id 
        FROM campaign_players 
        WHERE user_id = auth.uid()
      )
  )
)
WITH CHECK (
  campaign_id IN (
    SELECT id 
    FROM campaigns 
    WHERE master_id = auth.uid()
  )
);

-- ============================================
-- Verificar se as políticas foram criadas corretamente
-- ============================================

-- Listar políticas para campaigns
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'campaigns';