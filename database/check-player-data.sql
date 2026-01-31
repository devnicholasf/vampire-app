-- Script para diagnosticar dados de jogadores
-- Execute no Supabase SQL Editor para verificar se os dados estão corretos

-- Ver todas as campanhas
SELECT 
    id,
    name,
    master_id,
    invite_code,
    created_at
FROM campaigns
ORDER BY created_at DESC;

-- Ver todos os jogadores em campanhas
SELECT 
    cp.campaign_id,
    c.name as campaign_name,
    cp.user_id,
    cp.character_name,
    cp.role,
    cp.sheet,
    cp.joined_at
FROM campaign_players cp
LEFT JOIN campaigns c ON c.id = cp.campaign_id
ORDER BY cp.joined_at DESC;

-- Ver campanhas COM jogadores (JOIN)
SELECT 
    c.id,
    c.name,
    c.invite_code,
    COUNT(cp.user_id) as total_players,
    json_agg(
        json_build_object(
            'user_id', cp.user_id,
            'character_name', cp.character_name,
            'role', cp.role,
            'joined_at', cp.joined_at
        )
    ) FILTER (WHERE cp.user_id IS NOT NULL) as players
FROM campaigns c
LEFT JOIN campaign_players cp ON cp.campaign_id = c.id
GROUP BY c.id, c.name, c.invite_code
ORDER BY c.created_at DESC;

-- Verificar se RLS está ativo
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('campaigns', 'campaign_players');

-- Ver políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('campaigns', 'campaign_players');
