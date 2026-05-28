-- ============================================
-- Habilitar Realtime na tabela dice_rolls
-- ============================================
-- Execute este SQL no Supabase para garantir que
-- as rolagens apareçam instantaneamente

-- 1. Habilitar Realtime na tabela
alter publication supabase_realtime add table dice_rolls;

-- 2. Verificar se está habilitado (opcional)
-- select * from pg_publication_tables where pubname = 'supabase_realtime';

-- 3. Recriar RLS policies caso necessário
drop policy if exists "Jogadores podem ver rolagens da campanha" on dice_rolls;
drop policy if exists "Jogadores podem criar rolagens" on dice_rolls;
drop policy if exists "Apenas criador pode deletar rolagens" on dice_rolls;

-- Política: Jogadores podem ver rolagens da própria campanha
create policy "Jogadores podem ver rolagens da campanha"
  on dice_rolls
  for select
  using (
    campaign_id in (
      select campaign_id from campaign_players where user_id = auth.uid()
    )
    or
    campaign_id in (
      select id from campaigns where master_id = auth.uid()
    )
  );

-- Política: Jogadores podem inserir suas próprias rolagens
create policy "Jogadores podem criar rolagens"
  on dice_rolls
  for insert
  with check (
    user_id = auth.uid()
    and
    (
      campaign_id in (
        select campaign_id from campaign_players where user_id = auth.uid()
      )
      or
      campaign_id in (
        select id from campaigns where master_id = auth.uid()
      )
    )
  );

-- Política: Apenas o criador pode deletar suas rolagens
create policy "Apenas criador pode deletar rolagens"
  on dice_rolls
  for delete
  using (user_id = auth.uid());
