-- Adiciona coluna 'sheet' JSONB na tabela campaign_players para armazenar fichas de personagens
-- Execute no Supabase SQL Editor

-- Adicionar coluna sheet se não existir
ALTER TABLE campaign_players
ADD COLUMN IF NOT EXISTS sheet JSONB DEFAULT NULL;

-- Adicionar coluna character_name se não existir (para armazenar o nome do personagem)
ALTER TABLE campaign_players
ADD COLUMN IF NOT EXISTS character_name TEXT DEFAULT NULL;

-- Criar índice para melhor performance em buscas por sheet
CREATE INDEX IF NOT EXISTS idx_campaign_players_sheet ON campaign_players USING GIN (sheet);

-- Comentários para documentação
COMMENT ON COLUMN campaign_players.sheet IS 'Ficha completa do personagem em formato JSONB (atributos, habilidades, disciplinas, etc.)';
COMMENT ON COLUMN campaign_players.character_name IS 'Nome do personagem do jogador';
