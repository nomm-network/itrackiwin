-- ===== ENUMS =====
do $$ begin
  create type coach_type as enum ('ai','human');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active','trialing','canceled');
exception when duplicate_object then null; end $$;

-- ===== TABLES =====
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  icon_name text default 'category',
  sort_order int default 100,
  is_active boolean default true
);

create table if not exists coaches (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  type coach_type not null default 'ai',
  name text not null,          -- internal key
  display_name text not null,  -- UI label
  avatar_url text,
  price_cents int default 0,
  is_default boolean default false,
  is_active boolean default true,
  unique (category_id, name)
);

create table if not exists coach_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references coaches(id) on delete cascade,
  status subscription_status not null default 'active',
  starts_at timestamptz default now(),
  ends_at timestamptz
);

create table if not exists user_category_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  selected_coach_id uuid references coaches(id) on delete set null,
  is_enabled boolean not null default true,
  priority_rank int default 100,    -- lower = earlier in nav
  nav_pinned boolean default true,
  unique (user_id, category_id)
);

-- ===== RLS =====
alter table categories enable row level security;
alter table coaches enable row level security;
alter table coach_subscriptions enable row level security;
alter table user_category_settings enable row level security;

-- everyone can read categories & coaches
drop policy if exists cat_read on categories;
create policy cat_read on categories for select using (true);

drop policy if exists coach_read on coaches;
create policy coach_read on coaches for select using (true);

-- users can read/write only their own subscriptions & settings
drop policy if exists subs_rw on coach_subscriptions;
create policy subs_rw on coach_subscriptions
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists ucs_rw on user_category_settings;
create policy ucs_rw on user_category_settings
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ===== SEED =====
insert into categories (slug, name, icon_name, sort_order) values
  ('health','Health','heart',10),
  ('wealth','Wealth','wallet',20),
  ('productivity','Productivity','clock',30),
  ('spirituality','Spirituality','sparkles',40),
  ('purpose','Purpose','target',50),
  ('relationships','Relationships','users',60)
on conflict (slug) do nothing;

-- default AI coaches (category-scoped)
insert into coaches (category_id, type, name, display_name, is_default, is_active)
select id, 'ai', 'bro_default', 'Bro — Health Coach', true, true from categories where slug='health'
union all
select id, 'ai', 'wealth_default', 'Wealth Coach', true, true from categories where slug='wealth'
union all
select id, 'ai', 'prod_default', 'Productivity Coach', true, true from categories where slug='productivity'
union all
select id, 'ai', 'spirit_default', 'Spirituality Coach', true, true from categories where slug='spirituality'
union all
select id, 'ai', 'purpose_default', 'Purpose Coach', true, true from categories where slug='purpose'
union all
select id, 'ai', 'rel_default', 'Relationships Coach', true, true from categories where slug='relationships'
on conflict do nothing;

-- ===== Helper function: compute bottom nav for a user =====
create schema if not exists app;

create or replace function app.user_bottom_nav(u uuid)
returns table (
  slot int,
  item_type text,
  label text,
  slug text,
  icon text
)
language sql stable as $$
with dyn as (
  select
    row_number() over (
      order by ucs.priority_rank asc, c.sort_order asc, c.name asc
    ) as rn,
    'category'::text as item_type,
    c.name as label,
    c.slug as slug,
    c.icon_name as icon
  from user_category_settings ucs
  join categories c on c.id = ucs.category_id
  left join coach_subscriptions cs
    on cs.user_id = ucs.user_id
   and cs.coach_id = coalesce(ucs.selected_coach_id,
                               (select id from coaches where category_id = c.id and is_default limit 1))
   and cs.status = 'active'
  where ucs.user_id = u
    and ucs.is_enabled is true
    and ucs.nav_pinned is true
    -- require either no specific coach selected OR an active sub for the selected coach
    and (ucs.selected_coach_id is null or cs.id is not null)
)
select * from (values
  (1, 'fixed', 'Dashboard', 'dashboard', 'home'),
  (2, 'fixed', 'Atlas',     'atlas',     'globe')
) fixed(slot,item_type,label,slug,icon)
union all
select 2 + rn as slot, item_type, label, slug, icon
from dyn
order by slot
limit 5;
$$;