-- =========================================================
-- BRO COACH UPGRADE - COMBINED MIGRATION (USING EXISTING ENUM)
-- =========================================================

begin;

-- ---------------------------------------------------------
-- A) EXPERIENCE LEVEL: USE EXISTING ENUM + CONFIG TABLE
-- ---------------------------------------------------------

-- 1) Add new column on user_profile_fitness (nullable first)
do $$
begin
  if not exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='user_profile_fitness' and column_name='experience_level_new'
  ) then
    alter table public.user_profile_fitness
      add column experience_level_new public.experience_level;
  end if;
end$$;

-- 2) Set default values and map existing data
update public.user_profile_fitness upf
set experience_level_new = (
  case coalesce(el.slug, 'new')
    when 'new' then 'new'
    when 'returning' then 'returning' 
    when 'regular' then 'intermediate'  -- Map regular to intermediate
    when 'advanced' then 'advanced'
    else 'new'
  end
)::public.experience_level
from public.experience_levels el
where el.id = upf.experience_level_id
  and upf.experience_level_new is null;

-- Set default for any remaining nulls
update public.user_profile_fitness 
set experience_level_new = 'new'
where experience_level_new is null;

-- 3) Make the new enum required
alter table public.user_profile_fitness
  alter column experience_level_new set not null;

-- 4) Create the config table with existing enum values
create table if not exists public.experience_level_configs (
  experience_level public.experience_level primary key,
  start_intensity_low numeric not null,
  start_intensity_high numeric not null,
  warmup_set_count_min smallint not null,
  warmup_set_count_max smallint not null,
  main_rest_seconds_min smallint not null,
  main_rest_seconds_max smallint not null,
  weekly_progress_pct numeric not null,
  allow_high_complexity boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5) Insert config data for existing enum values
insert into public.experience_level_configs (
  experience_level, start_intensity_low, start_intensity_high,
  warmup_set_count_min, warmup_set_count_max,
  main_rest_seconds_min, main_rest_seconds_max,
  weekly_progress_pct, allow_high_complexity
) values
  ('new', 0.60, 0.70, 3, 3, 90, 120, 0.03, false),
  ('returning', 0.65, 0.75, 2, 3, 90, 150, 0.03, false),
  ('intermediate', 0.70, 0.80, 2, 2, 120, 180, 0.025, false),
  ('advanced', 0.75, 0.85, 1, 2, 120, 240, 0.015, true)
on conflict (experience_level) do nothing;

-- 6) Drop old FK and column, then rename new column
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'user_profile_fitness_experience_level_id_fkey'
  ) then
    alter table public.user_profile_fitness
      drop constraint user_profile_fitness_experience_level_id_fkey;
  end if;
exception
  when undefined_table then null;
end$$;

do $$
begin
  if exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='user_profile_fitness' and column_name='experience_level_id'
  ) then
    alter table public.user_profile_fitness
      drop column experience_level_id;
  end if;
end$$;

-- Rename the new column
alter table public.user_profile_fitness
  rename column experience_level_new to experience_level;

-- 7) Drop old tables
do $$
begin
  if to_regclass('public.experience_level_translations') is not null then
    drop table public.experience_level_translations cascade;
  end if;
  if to_regclass('public.experience_level_params') is not null then
    drop table public.experience_level_params cascade;
  end if;
  if to_regclass('public.experience_levels') is not null then
    drop table public.experience_levels cascade;
  end if;
end$$;

-- ---------------------------------------------------------
-- B) USER PRIORITIZED MUSCLE GROUPS
-- ---------------------------------------------------------
create table if not exists public.user_prioritized_muscle_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  muscle_group_id uuid not null references public.muscle_groups(id) on delete cascade,
  priority smallint not null check (priority between 1 and 10),
  created_at timestamptz not null default now(),
  unique (user_id, muscle_group_id)
);

-- ---------------------------------------------------------
-- C) SHARED GYM EQUIPMENT + GYM ADMINS
-- ---------------------------------------------------------

-- 1) User gym memberships
create table if not exists public.user_gym_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gym_id uuid not null references public.gyms(id) on delete cascade,
  joined_at timestamptz not null default now(),
  is_active boolean not null default true,
  unique (user_id, gym_id)
);

-- 2) Shared machines per public gym
create table if not exists public.gym_machines (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete restrict,
  label text,
  stack_values numeric[] default null,
  aux_increment numeric default null,
  quantity smallint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(gym_id, equipment_id, label)
);

-- 3) Usage stats
create table if not exists public.gym_machine_usage_stats (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  usage_count bigint not null default 0,
  last_used_at timestamptz,
  unique (gym_id, equipment_id)
);

-- 4) Gym Admins
create table if not exists public.gym_admins (
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager')),
  created_at timestamptz not null default now(),
  primary key (gym_id, user_id)
);

-- ---------------------------------------------------------
-- D) TEMPLATE MACHINE PREFERENCE: SUPPORT SHARED GYM
-- ---------------------------------------------------------
do $$
begin
  if not exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='template_exercise_machine_pref' and column_name='gym_machine_id'
  ) then
    alter table public.template_exercise_machine_pref
      add column gym_machine_id uuid references public.gym_machines(id) on delete cascade;
  end if;
end$$;

-- Add XOR constraint
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'template_machine_pref_exactly_one_ref'
  ) then
    alter table public.template_exercise_machine_pref
      add constraint template_machine_pref_exactly_one_ref
      check (
        (user_gym_machine_id is null) <> (gym_machine_id is null)
      );
  end if;
end$$;

-- ---------------------------------------------------------
-- E) UNIFIED VIEW FOR AVAILABLE EQUIPMENT
-- ---------------------------------------------------------
create or replace view public.v_available_equipment_for_user as
with memberships as (
  select ugm.user_id, ugm.gym_id
  from public.user_gym_memberships ugm
  where ugm.is_active = true
),
shared as (
  select m.user_id, gm.gym_id, gm.id as machine_id, gm.equipment_id, 'shared'::text as source,
         gm.label, gm.stack_values, gm.aux_increment, gm.quantity
  from memberships m
  join public.gym_machines gm on gm.gym_id = m.gym_id
),
personal as (
  select ug.user_id, null::uuid as gym_id, ugm.id as machine_id, ugm.equipment_id, 'personal'::text as source,
         null::text as label, null::numeric[] as stack_values, null::numeric as aux_increment, 1::smallint as quantity
  from public.user_gyms ug
  join public.user_gym_machines ugm on ugm.user_gym_id = ug.id
)
select * from shared
union all
select * from personal;

-- ---------------------------------------------------------
-- F) TRANSLATIONS: Seed enum names into text_translations
-- ---------------------------------------------------------
insert into public.text_translations (key, language_code, value)
values
  ('enum.experience_level.new', 'en', 'New to fitness'),
  ('enum.experience_level.returning', 'en', 'Returning after a break'),
  ('enum.experience_level.intermediate', 'en', 'Intermediate'),
  ('enum.experience_level.advanced', 'en', 'Advanced'),
  ('enum.experience_level.new', 'ro', 'Nou în fitness'),
  ('enum.experience_level.returning', 'ro', 'Revenire după pauză'),
  ('enum.experience_level.intermediate', 'ro', 'Intermediar'),
  ('enum.experience_level.advanced', 'ro', 'Avansat')
on conflict (key, language_code) do nothing;

-- ---------------------------------------------------------
-- G) RLS POLICIES
-- ---------------------------------------------------------

-- User prioritized muscle groups
alter table public.user_prioritized_muscle_groups enable row level security;

create policy "Users can manage their own muscle priorities"
  on public.user_prioritized_muscle_groups
  for all using (auth.uid() = user_id);

-- Gym memberships
alter table public.user_gym_memberships enable row level security;

create policy "Users can view and manage their own memberships"
  on public.user_gym_memberships
  for all using (auth.uid() = user_id);

-- Gym machines (public read for members)
alter table public.gym_machines enable row level security;

create policy "Members can view gym machines"
  on public.gym_machines
  for select using (
    exists (
      select 1 from public.user_gym_memberships ugm
      where ugm.gym_id = gym_machines.gym_id
        and ugm.user_id = auth.uid()
        and ugm.is_active = true
    )
  );

create policy "Gym admins can manage machines"
  on public.gym_machines
  for all using (
    exists (
      select 1 from public.gym_admins ga
      where ga.gym_id = gym_machines.gym_id
        and ga.user_id = auth.uid()
    )
  );

-- Gym admins
alter table public.gym_admins enable row level security;

create policy "Gym admins can view admins for their gyms"
  on public.gym_admins
  for select using (
    exists (
      select 1 from public.gym_admins ga
      where ga.gym_id = gym_admins.gym_id
        and ga.user_id = auth.uid()
    )
  );

-- Experience level configs (public read)
alter table public.experience_level_configs enable row level security;

create policy "Experience level configs are viewable by everyone"
  on public.experience_level_configs
  for select using (true);

create policy "Admins can manage experience level configs"
  on public.experience_level_configs
  for all using (is_admin(auth.uid()));

-- ---------------------------------------------------------
-- H) INDEXES
-- ---------------------------------------------------------
create index if not exists idx_gym_machines_gym on public.gym_machines(gym_id);
create index if not exists idx_gym_machines_equipment on public.gym_machines(equipment_id);
create index if not exists idx_user_prioritized_muscle_groups_user on public.user_prioritized_muscle_groups(user_id);
create index if not exists idx_user_gym_memberships_user on public.user_gym_memberships(user_id);

commit;