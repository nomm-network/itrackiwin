-- Movement references (FK targets for exercises)
-- Export all reference tables that exercises link to

-- 3.1 Movement patterns (FK: exercises.movement_pattern_id)
select
  id,
  coalesce(display_name, name, slug, id::text) as label
from public.movement_patterns
order by label;

-- 3.2 Movements (FK: exercises.movement_id)
select
  id,
  coalesce(display_name, name, slug, id::text) as label
from public.movements
order by label;

-- 3.3 Body parts (FK: exercises.body_part_id)
select
  id,
  coalesce(display_name, name, slug, id::text) as label
from public.body_parts
order by label;

-- 3.4 Muscles / muscle groups
-- Your exercises table has primary_muscle_id and secondary_muscle_group_ids uuid[]
-- Export the tables you actually use for those FKs:

-- If you have muscles:
select id, coalesce(display_name, name, slug, id::text) as label
from public.muscles
order by label;

-- If you have muscle_groups (or similar):
select id, coalesce(display_name, name, slug, id::text) as label
from public.muscle_groups
order by label;

-- 3.5 Grips (used by exercises.default_grip_ids and UI)
select id, coalesce(display_name, name, slug, id::text) as label
from public.grips
order by label;

-- 3.6 Bar types (FK: exercises.default_bar_type_id)
select id, coalesce(display_name, name, slug, id::text) as label
from public.bar_types
order by label;

-- Expected output: CSV for each table with id,label columns
-- Run each query separately and export as individual CSV files
-- CG will use the IDs for proper FK references in exercise inserts