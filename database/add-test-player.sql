-- ============================================
-- ADICIONAR JOGADOR DE TESTE
-- ============================================

-- Este script adiciona um jogador de teste na campanha FORTALEZA
-- para testar a funcionalidade de campaign_players

-- 1. Verificar campanhas existentes
SELECT id, name, master_id FROM campaigns;

-- 2. Primeiro, limpar dados de teste existentes (se houver)
DELETE FROM campaign_players 
WHERE user_id = '217419ec-ed47-4a12-9fce-fad072cf2c53' 
AND campaign_id = 'b72a44a2-56cc-4eb0-a629-d805c86fbc0a';

-- 3. Adicionar UM jogador de teste à campanha FORTALEZA
-- CONSTRAINT: Um user_id = Uma participação por campanha
-- Usando seu user_id real: 217419ec-ed47-4a12-9fce-fad072cf2c53

INSERT INTO campaign_players (
  user_id,
  campaign_id,
  character_name,
  role,
  joined_at
) VALUES (
  '217419ec-ed47-4a12-9fce-fad072cf2c53', -- Seu user_id real
  'b72a44a2-56cc-4eb0-a629-d805c86fbc0a', -- ID da campanha FORTALEZA
  'Marcus Ventrue',
  'player',
  NOW()
);

-- 4. Verificar se os jogadores foram adicionados
SELECT 
  cp.user_id,
  cp.character_name,
  cp.role,
  cp.joined_at,
  c.name as campaign_name
FROM campaign_players cp
JOIN campaigns c ON cp.campaign_id = c.id
WHERE c.name = 'FORTALEZA';

-- 5. Testar a query como o sistema faz (com JOIN)
SELECT 
  c.*,
  cp.user_id,
  cp.character_name,
  cp.role,
  cp.joined_at
FROM campaigns c
LEFT JOIN campaign_players cp ON c.id = cp.campaign_id
WHERE c.id = 'b72a44a2-56cc-4eb0-a629-d805c86fbc0a';