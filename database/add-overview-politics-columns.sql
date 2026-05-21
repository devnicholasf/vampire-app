-- ============================================================
-- MIGRAÇÃO: Adicionar colunas de Overview e Política
-- ============================================================
-- Descrição: Adiciona colunas JSONB para armazenar dados de 
--            Overview e Política das campanhas
-- Data: 2026-05-21
-- ============================================================

-- Adicionar coluna overview (Visão Geral)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS overview JSONB DEFAULT '{
    "name": "",
    "status": "",
    "principles": "",
    "tones": [],
    "customTones": []
  }'::jsonb;

-- Adicionar coluna politics (Política)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS politics JSONB DEFAULT '{
    "government": [],
    "factions": [],
    "relations": [],
    "territories": [],
    "territoryMapImage": "",
    "territoryZones": []
  }'::jsonb;

-- Comentários nas colunas
COMMENT ON COLUMN campaigns.overview IS 'Dados da Visão Geral da campanha (nome, status, princípios, tons)';
COMMENT ON COLUMN campaigns.politics IS 'Dados da Política da campanha (governo, facções, relações, territórios)';

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Execute esta query para verificar se as colunas foram criadas:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'campaigns' 
-- AND column_name IN ('overview', 'politics');
