-- ============================================
-- Tabela de Rolagens de Dados - VTM V5
-- ============================================

-- Criar tabela dice_rolls
create table if not exists dice_rolls (
  id uuid primary key default gen_random_uuid(),
  
  -- Relacionamentos
  campaign_id uuid not null references campaigns(id) on delete cascade,
  session_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid,
  character_name text not null,
  
  -- Tipo de rolagem
  roll_type text not null check (roll_type in ('normal', 'oculta', 'resistida', 'frenesi', 'despertar')),
  
  -- Configuração da rolagem
  attribute text not null,
  skill text not null,
  modifier int default 0,
  
  -- Pool
  pool_total int not null,
  hunger int default 0 check (hunger >= 0 and hunger <= 5),
  
  -- Dificuldade
  difficulty int not null check (difficulty >= 1 and difficulty <= 10),
  
  -- Resultados dos dados (JSON)
  dice_results jsonb not null,
  -- Estrutura: { "normal": [10,8,7,2], "hunger": [10,1] }
  
  -- Resultados calculados
  successes int not null default 0,
  
  -- Flags especiais
  is_critical boolean default false,
  is_messy_critical boolean default false,
  is_bestial_failure boolean default false,
  
  -- Descrição narrativa
  description text,
  
  -- Metadados
  created_at timestamp with time zone default now(),
  
  -- Índices para performance
  constraint dice_rolls_pool_total_check check (pool_total >= 1)
);

-- Índices
create index if not exists dice_rolls_campaign_id_idx on dice_rolls(campaign_id);
create index if not exists dice_rolls_user_id_idx on dice_rolls(user_id);
create index if not exists dice_rolls_created_at_idx on dice_rolls(created_at desc);
create index if not exists dice_rolls_roll_type_idx on dice_rolls(roll_type);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS
alter table dice_rolls enable row level security;

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

-- ============================================
-- Função para limpar rolagens antigas
-- ============================================

create or replace function cleanup_old_dice_rolls()
returns void
language plpgsql
security definer
as $$
begin
  -- Deletar rolagens com mais de 30 dias
  delete from dice_rolls
  where created_at < now() - interval '30 days';
end;
$$;

-- ============================================
-- Comentários
-- ============================================

comment on table dice_rolls is 'Histórico de rolagens de dados VTM V5';
comment on column dice_rolls.roll_type is 'Tipo: normal, oculta, resistida, frenesi, despertar';
comment on column dice_rolls.dice_results is 'JSON com resultados: {"normal": [10,8,7], "hunger": [1,6]}';
comment on column dice_rolls.is_messy_critical is 'Crítico com dado de fome = 10';
comment on column dice_rolls.is_bestial_failure is 'Falha total com dado de fome = 1';
