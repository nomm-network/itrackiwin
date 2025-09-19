-- Drop user_category_settings table and add missing fields to user_category_prefs
DROP TABLE IF EXISTS public.user_category_settings;

-- Add missing fields to user_category_prefs
ALTER TABLE public.user_category_prefs 
ADD COLUMN IF NOT EXISTS selected_coach_id uuid REFERENCES public.coaches(id),
ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS nav_pinned boolean NOT NULL DEFAULT false;

-- Update RLS policies for user_category_prefs to include new fields
DROP POLICY IF EXISTS "Users can manage their own category preferences" ON public.user_category_prefs;

CREATE POLICY "Users can manage their own category preferences"
ON public.user_category_prefs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update the app.user_priorities function to use user_category_prefs
CREATE OR REPLACE FUNCTION app.user_priorities(u uuid)
RETURNS table (
  category_id uuid,
  slug text,
  name text,
  icon text,
  priority_rank int
)
LANGUAGE sql stable AS $$
select
  lc.id as category_id,
  lc.slug,
  lc.name,
  coalesce(lc.icon, 'category') as icon,
  ucp.display_order as priority_rank
from user_category_prefs ucp
join life_categories lc on lc.id = ucp.category_id
where ucp.user_id = u
  and ucp.is_enabled is true
  and ucp.nav_pinned is true
order by ucp.display_order nulls last, lc.display_order nulls last, lc.name asc;
$$;

-- Update the next_best_category function to use user_category_prefs
CREATE OR REPLACE FUNCTION app.next_best_category(u uuid)
RETURNS table (slug text, name text)
LANGUAGE sql stable AS $$
with p as (
  select row_number() over (order by ucp.display_order nulls last, lc.name) as rn, lc.slug, lc.name
  from user_category_prefs ucp
  join life_categories lc on lc.id = ucp.category_id
  where ucp.user_id = u
    and ucp.is_enabled is true
    and ucp.nav_pinned is true
)
select slug, name from p where rn = 2;
$$;