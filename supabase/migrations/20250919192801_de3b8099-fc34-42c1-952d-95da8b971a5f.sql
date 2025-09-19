-- Step 4A: Create Atlas DB functions
create schema if not exists app;

-- ordered list of categories the user pinned/enabled
create or replace function app.user_priorities(u uuid)
returns table (
  category_id uuid,
  slug text,
  name text,
  icon text,
  priority_rank int
)
language sql stable as $$
select
  lc.id as category_id,
  lc.slug,
  lc.name,
  coalesce(lc.icon, 'category') as icon,
  coalesce(ucs.priority_rank, 999) as priority_rank
from user_category_settings ucs
join life_categories lc on lc.id = ucs.category_id
where ucs.user_id = u
  and ucs.is_enabled is true
order by priority_rank nulls last, lc.display_order nulls last, lc.name asc;
$$;

revoke all on function app.user_priorities(uuid) from public;
grant execute on function app.user_priorities(uuid) to authenticated;

-- naive next-best: return the 2nd item in the priority list
create or replace function app.next_best_category(u uuid)
returns table (slug text, name text)
language sql stable as $$
with p as (
  select row_number() over (order by priority_rank nulls last, name) as rn, slug, name
  from app.user_priorities(u)
)
select slug, name from p where rn = 2;
$$;

revoke all on function app.next_best_category(uuid) from public;
grant execute on function app.next_best_category(uuid) to authenticated;