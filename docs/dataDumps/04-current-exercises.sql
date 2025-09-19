-- Current exercises (to avoid duplicates & see conventions)
-- Export existing exercises to understand patterns and avoid duplicates

select
  id,
  slug,
  display_name,
  equipment_id,
  movement_pattern_id,
  primary_muscle_id,
  effort_mode,    -- enum
  load_mode,      -- enum
  exercise_skill_level,
  is_bar_loaded,
  default_bar_weight,
  is_unilateral,
  allows_grips,
  configured
from public.exercises
order by created_at desc
limit 500;

-- Expected output: CSV/JSON with all current exercises
-- If you have more than 500 exercises, export all rows (remove LIMIT)
-- CG will use this to:
-- 1. Avoid creating duplicate exercises with similar slugs/names
-- 2. Copy your naming and slug conventions
-- 3. Understand your current data patterns