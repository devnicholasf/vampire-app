-- Adicionar campo de código de convite às campanhas (apenas se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaigns' AND column_name = 'invite_code') THEN
        ALTER TABLE campaigns ADD COLUMN invite_code VARCHAR(8) UNIQUE;
    END IF;
END $$;

-- Criar índice para busca rápida por código de convite (apenas se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_campaigns_invite_code') THEN
        CREATE INDEX idx_campaigns_invite_code ON campaigns(invite_code);
    END IF;
END $$;

-- Gerar códigos únicos para campanhas existentes (se houver)
UPDATE campaigns SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8)) WHERE invite_code IS NULL;

-- Verificar se os códigos foram gerados
SELECT id, name, invite_code FROM campaigns;