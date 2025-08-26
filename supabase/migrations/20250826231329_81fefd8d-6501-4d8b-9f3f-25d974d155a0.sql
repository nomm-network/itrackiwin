-- 1. Schema: Add handles as first-class concept
create table if not exists public.handles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- 1.2 Handle translations for i18n
create table if not exists public.handles_translations (
  id uuid primary key default gen_random_uuid(),
  handle_id uuid not null references public.handles(id) on delete cascade,
  language_code text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(handle_id, language_code)
);

-- 1.3 Handle-grip compatibility mapping
create table if not exists public.handle_grip_compatibility (
  id uuid primary key default gen_random_uuid(),
  handle_id uuid not null references public.handles(id) on delete cascade,
  grip_id uuid not null references public.grips(id) on delete cascade,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique(handle_id, grip_id)
);

-- 1.4 Add handle to workout exercises
alter table public.workout_exercises
  add column if not exists handle_id uuid null references public.handles(id);

-- 1.5 Add default handles to exercises
alter table public.exercises
  add column if not exists default_handle_ids uuid[] null;

-- 2. Seed common handles
insert into public.handles (name, slug, description)
values
  ('Straight Bar', 'straight-bar', 'Straight cable bar. Good for pronated/supinated/wide/close.'),
  ('EZ Bar', 'ez-bar', 'Curved EZ bar – friendly on wrists.'),
  ('V-Handle', 'v-handle', 'Narrow neutral V handle (often used on rows).'),
  ('Triangle Row Handle', 'triangle-handle', 'Triangle neutral row handle (very close neutral).'),
  ('Rope', 'rope', 'Dual-ended triceps rope / neutral rope.'),
  ('Single D-Handle', 'single-d-handle', 'Single grip D handle for unilateral work.')
on conflict (slug) do update
set name = excluded.name, description = excluded.description;

-- 2.2 Add English translations
insert into public.handles_translations (handle_id, language_code, name, description)
select h.id, t.lang, t.name, t.description
from public.handles h
cross join (
  values
  -- Straight Bar
  ('straight-bar','en','Straight Bar','Straight cable bar'),
  -- EZ Bar
  ('ez-bar','en','EZ Bar','Curved EZ bar'),
  -- V-Handle
  ('v-handle','en','V Handle','Narrow neutral V handle'),
  -- Triangle
  ('triangle-handle','en','Triangle Row Handle','Close neutral triangle handle'),
  -- Rope
  ('rope','en','Rope','Dual rope attachment'),
  -- Single D
  ('single-d-handle','en','Single D-Handle','Single grip for unilateral work')
) as t(slug,lang,name,description)
where h.slug = t.slug
on conflict (handle_id, language_code) do update
set name = excluded.name,
    description = excluded.description,
    updated_at = now();

-- 3. Wire up handle-grip compatibility
with h as (
  select id, slug from public.handles
),
g as (
  select id, slug from public.grips
  where slug in ('pronated','supinated','neutral','wide','close','mixed','overhand','underhand')
)
insert into public.handle_grip_compatibility (handle_id, grip_id, is_default)
select h.id, g.id, x.is_def
from (
  values
  -- Straight bar: very flexible; default to pronated & supinated
  ('straight-bar','pronated', true),
  ('straight-bar','supinated', true),
  ('straight-bar','overhand', true),
  ('straight-bar','underhand', true),
  ('straight-bar','neutral',  false),
  ('straight-bar','wide',     false),
  ('straight-bar','close',    false),
  ('straight-bar','mixed',    false),

  -- EZ bar: best for supinated/pronated; neutral/mixed allowed but not default
  ('ez-bar','supinated', true),
  ('ez-bar','pronated',  true),
  ('ez-bar','underhand', true),
  ('ez-bar','overhand',  true),
  ('ez-bar','neutral',   false),
  ('ez-bar','mixed',     false),

  -- V-handle: neutral close by design
  ('v-handle','neutral', true),
  ('v-handle','close',   true),

  -- Triangle handle: very close neutral; make both default
  ('triangle-handle','neutral', true),
  ('triangle-handle','close',   true),

  -- Rope: neutral primary; mixed/over-under possible but keep neutral default
  ('rope','neutral',  true),
  ('rope','mixed',    false),

  -- Single D-handle: neutral default; pronated/supinated OK depending on path
  ('single-d-handle','neutral',   true),
  ('single-d-handle','pronated',  false),
  ('single-d-handle','supinated', false),
  ('single-d-handle','overhand',  false),
  ('single-d-handle','underhand', false)
) as x(handle_slug, grip_slug, is_def)
join h on h.slug = x.handle_slug
join g on g.slug = x.grip_slug
on conflict (handle_id, grip_id) do update
set is_default = excluded.is_default;

-- 4. RLS Policies for new tables
-- Handles policies (copy from grips pattern)
alter table public.handles enable row level security;

create policy "handles_select_all" 
on public.handles for select 
using (true);

create policy "handles_admin_manage" 
on public.handles for all 
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

-- Handle translations policies
alter table public.handles_translations enable row level security;

create policy "handles_translations_select_all" 
on public.handles_translations for select 
using (true);

create policy "handles_translations_admin_manage" 
on public.handles_translations for all 
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

-- Handle grip compatibility policies
alter table public.handle_grip_compatibility enable row level security;

create policy "handle_grip_compatibility_select_all" 
on public.handle_grip_compatibility for select 
using (true);

create policy "handle_grip_compatibility_admin_manage" 
on public.handle_grip_compatibility for all 
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

-- 5. Create function to update workout exercise updated_at on handle changes
create or replace function public.update_workout_exercise_updated_at()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add trigger for workout_exercises handle updates
drop trigger if exists update_workout_exercises_handle_updated_at on public.workout_exercises;
create trigger update_workout_exercises_handle_updated_at
  before update of handle_id on public.workout_exercises
  for each row
  execute function public.update_workout_exercise_updated_at();