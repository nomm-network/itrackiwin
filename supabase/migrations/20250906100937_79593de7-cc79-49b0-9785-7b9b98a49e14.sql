-- Create mentor category assignments table
create table if not exists public.mentor_category_assignments (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid not null,         -- -> users.id
  life_category_id uuid not null,       -- -> life_categories.id
  mentor_type text not null check (mentor_type in ('coach','mentor')),
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid()
);

-- indexes
create index if not exists idx_mca_user on public.mentor_category_assignments(mentor_user_id);
create index if not exists idx_mca_cat on public.mentor_category_assignments(life_category_id);
create unique index if not exists uq_mca_unique
on public.mentor_category_assignments(mentor_user_id, life_category_id, mentor_type);

-- RLS (admins bypass via SECURITY DEFINER RPCs; keep simple)
alter table public.mentor_category_assignments enable row level security;
drop policy if exists mca_select_own on public.mentor_category_assignments;
create policy mca_select_own on public.mentor_category_assignments
for select using (true);

-- Admin view (read-only list for UI) - using auth.users for user info
create or replace view public.v_admin_users_overview as
select
  au.id as user_id,
  coalesce(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'full_name', au.email, 'User') as name,
  au.email,
  au.created_at,
  coalesce(jsonb_agg(
    case when mca.id is not null then
      jsonb_build_object(
        'life_category_id', mca.life_category_id,
        'mentor_type', mca.mentor_type,
        'is_active', mca.is_active
      )
    end
  ) filter (where mca.id is not null), '[]'::jsonb) as assignments
from auth.users au
left join public.mentor_category_assignments mca
  on mca.mentor_user_id = au.id and mca.is_active
group by au.id, au.email, au.created_at, au.raw_user_meta_data;

-- toggle/set a coach assignment
create or replace function public.admin_set_coach(
  p_user_id uuid,
  p_life_category_id uuid,
  p_is_coach boolean
) returns boolean
language plpgsql security definer set search_path=public as $$
begin
  if p_is_coach then
    insert into public.mentor_category_assignments(mentor_user_id, life_category_id, mentor_type, is_active)
    values (p_user_id, p_life_category_id, 'coach', true)
    on conflict (mentor_user_id, life_category_id, mentor_type)
    do update set is_active = true, notes = null;
  else
    update public.mentor_category_assignments
      set is_active = false
    where mentor_user_id = p_user_id
      and life_category_id = p_life_category_id
      and mentor_type = 'coach';
  end if;
  return true;
end $$;

-- read categories (for dropdown) - just use life_categories directly
create or replace function public.admin_list_categories()
returns table (id uuid, slug text, name text)
language sql stable security definer set search_path=public as $$
  select lc.id, lc.slug, lc.slug as name
  from public.life_categories lc
  order by lc.slug;
$$;