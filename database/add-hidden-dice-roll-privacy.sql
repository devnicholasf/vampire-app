-- ============================================
-- Hidden dice rolls privacy
-- ============================================

alter table if exists dice_rolls
  add column if not exists is_hidden boolean not null default false;

create index if not exists dice_rolls_is_hidden_idx on dice_rolls(is_hidden);

create table if not exists dice_roll_private_details (
  roll_id uuid primary key references dice_rolls(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid,
  character_name text not null,
  roll_type text not null check (roll_type in ('normal', 'oculta', 'resistida', 'frenesi', 'despertar')),
  attribute text not null,
  skill text not null,
  modifier int default 0,
  pool_total int not null check (pool_total >= 1),
  hunger int default 0 check (hunger >= 0 and hunger <= 5),
  difficulty int not null check (difficulty >= 1 and difficulty <= 10),
  dice_results jsonb not null,
  successes int not null default 0,
  is_critical boolean default false,
  is_messy_critical boolean default false,
  is_bestial_failure boolean default false,
  description text,
  created_at timestamp with time zone default now()
);

create index if not exists dice_roll_private_details_campaign_id_idx on dice_roll_private_details(campaign_id);
create index if not exists dice_roll_private_details_user_id_idx on dice_roll_private_details(user_id);
create index if not exists dice_roll_private_details_created_at_idx on dice_roll_private_details(created_at desc);

alter table dice_roll_private_details enable row level security;

drop policy if exists "Owner or master can view hidden dice roll details" on dice_roll_private_details;
drop policy if exists "Players can create hidden dice roll details" on dice_roll_private_details;
drop policy if exists "Owner can delete hidden dice roll details" on dice_roll_private_details;

create policy "Owner or master can view hidden dice roll details"
  on dice_roll_private_details
  for select
  using (
    user_id = auth.uid()
    or campaign_id in (
      select id from campaigns where master_id = auth.uid()
    )
  );

create policy "Players can create hidden dice roll details"
  on dice_roll_private_details
  for insert
  with check (
    user_id = auth.uid()
    and (
      campaign_id in (
        select campaign_id from campaign_players where user_id = auth.uid()
      )
      or campaign_id in (
        select id from campaigns where master_id = auth.uid()
      )
    )
  );

create policy "Owner can delete hidden dice roll details"
  on dice_roll_private_details
  for delete
  using (user_id = auth.uid());

alter publication supabase_realtime add table dice_roll_private_details;

comment on column dice_rolls.is_hidden is 'Indica que a linha publica representa apenas o resumo de uma rolagem oculta';
comment on table dice_roll_private_details is 'Detalhes privados de rolagens ocultas; apenas mestre e autor podem ver';
