-- =========================================================
-- BRO COACH UPGRADE - COMBINED MIGRATION (STEP BY STEP)
-- =========================================================

begin;

-- ---------------------------------------------------------
-- A) EXPERIENCE LEVEL: REPLACE TABLE WITH ENUM + CONFIG TABLE
-- ---------------------------------------------------------

-- 1) Create enum with all values
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'experience_level' and n.nspname = 'public'
  ) then
    create type public.experience_level as enum (
      'new',
      'returning', 
      'regular',
      'very_experienced'
    );
  end if;
end$$;

-- 2) Add new column on user_profile_fitness (nullable first)
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

-- 3) Set default values for users without experience level
update public.user_profile_fitness 
set experience_level_new = 'regular'
where experience_level_new is null;

-- 4) Map existing data from the old experience_levels table
update public.user_profile_fitness upf
set experience_level_new = (
  case el.slug
    when 'new' then 'new'
    when 'returning' then 'returning' 
    when 'regular' then 'regular'
    when 'advanced' then 'very_experienced'
    else 'regular'
  end
)::public.experience_level
from public.experience_levels el
where el.id = upf.experience_level_id;

-- 5) Make the new enum required
alter table public.user_profile_fitness
  alter column experience_level_new set not null;

-- 6) Create the config table
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

-- 7) Insert config data
insert into public.experience_level_configs (
  experience_level, start_intensity_low, start_intensity_high,
  warmup_set_count_min, warmup_set_count_max,
  main_rest_seconds_min, main_rest_seconds_max,
  weekly_progress_pct, allow_high_complexity
) values
  ('new', 0.60, 0.70, 3, 3, 90, 120, 0.03, false),
  ('returning', 0.65, 0.75, 2, 3, 90, 150, 0.03, false),
  ('regular', 0.70, 0.80, 2, 2, 120, 180, 0.025, false),
  ('very_experienced', 0.75, 0.85, 1, 2, 120, 240, 0.015, true)
on conflict (experience_level) do nothing;

-- 8) Drop old FK and column, then rename new column
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

-- 9) Drop old tables
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

commit;