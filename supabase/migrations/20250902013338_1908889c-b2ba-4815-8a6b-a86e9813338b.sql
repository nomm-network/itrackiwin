-- =========================
-- DEADLIFT (Barbell)
-- =========================
WITH
eq AS (
  SELECT id FROM equipment WHERE slug = 'olympic-barbell'
),
bp AS (
  SELECT id FROM body_parts WHERE slug = 'legs'
),
mp AS (
  SELECT id FROM movement_patterns WHERE slug = 'hinge'
),
mv AS (
  -- movement is optional; if slug doesn't exist the join below will leave it NULL
  SELECT id FROM movements WHERE slug = 'deadlift'
),
pm AS (
  -- primary muscle: spinal erectors
  SELECT id FROM muscles WHERE slug = 'erector_spinae'
),
sec AS (
  -- secondary muscle GROUPS (array)
  SELECT ARRAY(
    SELECT id FROM muscle_groups
    WHERE slug IN ('glutes','hamstrings','traps','forearms')
    ORDER BY slug
  )::uuid[] AS ids
)
INSERT INTO exercises (
  slug,
  display_name,
  custom_display_name,
  movement_pattern_id,
  movement_id,
  load_type,
  exercise_skill_level,
  equipment_id,
  primary_muscle_id,
  body_part_id,
  complexity_score,
  is_bar_loaded,
  default_bar_weight,
  loading_hint,
  popularity_rank,
  is_public,
  owner_user_id,
  tags,
  secondary_muscle_group_ids
)
SELECT
  'barbell-deadlift',
  'Barbell Deadlift',
  'Barbell Deadlift',
  mp.id,
  mv.id,
  'dual_load'::load_type,
  'high'::exercise_skill_level,
  eq.id,
  pm.id,
  bp.id,
  7,                     -- complexity
  TRUE,                  -- bar loaded
  20,                    -- default bar (kg)
  'per_side',            -- how weight is entered
  98,                    -- popularity (tune as you like)
  TRUE,
  NULL,
  ARRAY['compound','strength','hinge']::text[],
  sec.ids
FROM eq, bp, mp, pm, sec
LEFT JOIN mv ON TRUE
WHERE eq.id IS NOT NULL AND bp.id IS NOT NULL AND mp.id IS NOT NULL AND pm.id IS NOT NULL
ON CONFLICT (slug) DO NOTHING;


-- =========================
-- LEG CURL (Machine, Stack)
-- Will pick the first matching machine slug it finds
-- =========================
WITH
eq AS (
  SELECT id FROM equipment
  WHERE slug IN ('leg-curl-machine','seated-leg-curl-machine','hamstring-curl-machine')
  ORDER BY CASE slug
    WHEN 'leg-curl-machine' THEN 1
    WHEN 'seated-leg-curl-machine' THEN 2
    WHEN 'hamstring-curl-machine' THEN 3
    ELSE 999
  END
  LIMIT 1
),
bp AS (
  SELECT id FROM body_parts WHERE slug = 'legs'
),
mp AS (
  SELECT id FROM movement_patterns WHERE slug = 'isolation'
),
mv AS (
  SELECT id FROM movements WHERE slug = 'leg_curl'
),
pm AS (
  -- prefer the specific hamstring head if present; else fall back to a generic 'hamstrings' muscle if you keep one
  SELECT id FROM muscles
  WHERE slug IN ('biceps_femoris','hamstrings')
  ORDER BY CASE slug WHEN 'biceps_femoris' THEN 1 ELSE 2 END
  LIMIT 1
),
sec AS (
  SELECT ARRAY(
    SELECT id FROM muscle_groups
    WHERE slug IN ('glutes','calves')
    ORDER BY slug
  )::uuid[] AS ids
)
INSERT INTO exercises (
  slug,
  display_name,
  custom_display_name,
  movement_pattern_id,
  movement_id,
  load_type,
  exercise_skill_level,
  equipment_id,
  primary_muscle_id,
  body_part_id,
  complexity_score,
  is_bar_loaded,
  default_bar_weight,
  loading_hint,
  popularity_rank,
  is_public,
  owner_user_id,
  tags,
  secondary_muscle_group_ids
)
SELECT
  'machine-leg-curl',
  'Leg Curl (Machine)',
  'Leg Curl (Machine)',
  mp.id,
  mv.id,
  'stack'::load_type,         -- stack-loaded
  'low'::exercise_skill_level,
  eq.id,
  pm.id,
  bp.id,
  3,
  FALSE,                      -- not bar loaded
  NULL,                       -- no default bar
  'total',                    -- weight is total on stack
  86,
  TRUE,
  NULL,
  ARRAY['isolation','hamstrings']::text[],
  sec.ids
FROM eq, bp, mp, pm, sec
LEFT JOIN mv ON TRUE
WHERE eq.id IS NOT NULL AND bp.id IS NOT NULL AND mp.id IS NOT NULL AND pm.id IS NOT NULL
ON CONFLICT (slug) DO NOTHING;