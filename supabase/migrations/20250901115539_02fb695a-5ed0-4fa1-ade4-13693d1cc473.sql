-- 0) Ensure enum has 'bodyweight'
DO $$
BEGIN
  PERFORM 1
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  WHERE t.typname = 'load_type_enum'
    AND e.enumlabel = 'bodyweight';

  IF NOT FOUND THEN
    ALTER TYPE load_type_enum ADD VALUE 'bodyweight';
  END IF;
END$$;

-- 1) Lookups
WITH
eq AS (
  SELECT slug, id
  FROM equipment
  WHERE slug IN (
    'cable-machine',        -- for lat pulldown
    'seated-row-machine',   -- for row machine
    'hyperextension-bench', -- try these for back extension
    'back-extension-bench',
    'roman-chair'
  )
),
-- pick best available hyperextension equipment in priority order
hyp_eq AS (
  SELECT id
  FROM eq
  WHERE slug IN ('hyperextension-bench','back-extension-bench','roman-chair')
  ORDER BY CASE slug
             WHEN 'hyperextension-bench' THEN 1
             WHEN 'back-extension-bench' THEN 2
             WHEN 'roman-chair' THEN 3
           END
  LIMIT 1
),
bp AS (
  SELECT slug, id
  FROM body_parts
  WHERE slug IN ('back','core')
),
mg AS (
  SELECT slug, id
  FROM muscles
  WHERE slug IN ('lats','erector_spinae')
),
mgg AS (
  SELECT slug, id
  FROM muscle_groups
  WHERE slug IN ('biceps','shoulders','traps','glutes','hamstrings')
),
mv AS (
  -- movements (use if present; otherwise insert will set NULL)
  SELECT slug, id
  FROM movements
  WHERE slug IN ('pulldown','row','back_extension')
),
mp AS (
  -- movement patterns (broad): 'pull' for first two, 'hinge' for back extension
  SELECT slug, id
  FROM movement_patterns
  WHERE slug IN ('pull','hinge')
),
gr AS (
  SELECT slug, id
  FROM grips
  WHERE slug IN ('overhand','neutral')
)

-- 2) Insert: Lat Pulldown (cable machine, stack)
INSERT INTO exercises (
  slug, display_name, custom_display_name,
  movement_pattern_id, movement_id,
  load_type, exercise_skill_level,
  equipment_id,
  body_part_id, primary_muscle_id, secondary_muscle_group_ids,
  default_grip_ids,
  is_public, allows_grips, is_unilateral,
  complexity_score, loading_hint, popularity_rank, tags
)
SELECT
  'lat-pulldown-cable' AS slug,
  'Lat Pulldown' AS display_name,
  'Lat Pulldown' AS custom_display_name,
  (SELECT id FROM mp WHERE slug='pull') AS movement_pattern_id,
  (SELECT id FROM mv WHERE slug='pulldown') AS movement_id,
  'stack'::load_type_enum AS load_type,
  'medium'::exercise_skill_level AS exercise_skill_level,
  (SELECT id FROM eq WHERE slug='cable-machine') AS equipment_id,
  (SELECT id FROM bp WHERE slug='back') AS body_part_id,
  (SELECT id FROM mg WHERE slug='lats') AS primary_muscle_id,
  ARRAY[
    (SELECT id FROM mgg WHERE slug='biceps'),
    (SELECT id FROM mgg WHERE slug='shoulders'),
    (SELECT id FROM mgg WHERE slug='traps')
  ]::uuid[] AS secondary_muscle_group_ids,
  ARRAY[
    (SELECT id FROM gr WHERE slug='overhand')
  ]::uuid[] AS default_grip_ids,
  true,  -- is_public
  true,  -- allows_grips (orientation-only)
  false, -- is_unilateral (this entry is for bilateral usage)
  3,     -- complexity_score
  'total'::text AS loading_hint,
  92,    -- popularity_rank (tune as you like)
  ARRAY['back','lats','pulldown','cable']::text[] AS tags
WHERE
  (SELECT id FROM eq WHERE slug='cable-machine') IS NOT NULL
  AND (SELECT id FROM mg WHERE slug='lats') IS NOT NULL
  AND (SELECT id FROM bp WHERE slug='back') IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- 3) Insert: Seated Row Machine (dual-load plates)
INSERT INTO exercises (
  slug, display_name, custom_display_name,
  movement_pattern_id, movement_id,
  load_type, exercise_skill_level,
  equipment_id,
  body_part_id, primary_muscle_id, secondary_muscle_group_ids,
  default_grip_ids,
  is_public, allows_grips, is_unilateral,
  complexity_score, loading_hint, popularity_rank, tags
)
SELECT
  'seated-row-machine' AS slug,
  'Seated Row Machine' AS display_name,
  'Seated Row Machine' AS custom_display_name,
  (SELECT id FROM mp WHERE slug='pull') AS movement_pattern_id,
  (SELECT id FROM mv WHERE slug='row') AS movement_id,
  'dual_load'::load_type_enum AS load_type,
  'medium'::exercise_skill_level AS exercise_skill_level,
  (SELECT id FROM eq WHERE slug='seated-row-machine') AS equipment_id,
  (SELECT id FROM bp WHERE slug='back') AS body_part_id,
  (SELECT id FROM mg WHERE slug='lats') AS primary_muscle_id,
  ARRAY[
    (SELECT id FROM mgg WHERE slug='biceps'),
    (SELECT id FROM mgg WHERE slug='shoulders'),
    (SELECT id FROM mgg WHERE slug='traps')
  ]::uuid[] AS secondary_muscle_group_ids,
  ARRAY[
    (SELECT id FROM gr WHERE slug='neutral')
  ]::uuid[] AS default_grip_ids,
  true,   -- is_public
  true,   -- allows_grips
  false,  -- is_unilateral (your note: you use both sides simultaneously)
  3,      -- complexity_score
  'total'::text AS loading_hint,
  88,     -- popularity_rank
  ARRAY['back','lats','row','machine']::text[] AS tags
WHERE
  (SELECT id FROM eq WHERE slug='seated-row-machine') IS NOT NULL
  AND (SELECT id FROM mg WHERE slug='lats') IS NOT NULL
  AND (SELECT id FROM bp WHERE slug='back') IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- 4) Insert: Back Extension / Hyperextension (bodyweight default)
INSERT INTO exercises (
  slug, display_name, custom_display_name,
  movement_pattern_id, movement_id,
  load_type, exercise_skill_level,
  equipment_id,
  body_part_id, primary_muscle_id, secondary_muscle_group_ids,
  default_grip_ids,
  is_public, allows_grips, is_unilateral,
  complexity_score, loading_hint, popularity_rank, tags
)
SELECT
  'back-extension' AS slug,
  'Back Extension' AS display_name,
  'Back Extension' AS custom_display_name,
  (SELECT id FROM mp WHERE slug='hinge') AS movement_pattern_id,
  (SELECT id FROM mv WHERE slug='back_extension') AS movement_id,
  'bodyweight'::load_type_enum AS load_type,  -- default (can add plate in workout)
  'low'::exercise_skill_level AS exercise_skill_level,
  (SELECT id FROM hyp_eq) AS equipment_id, -- best available hyperextension device
  (SELECT id FROM bp WHERE slug='core') AS body_part_id,
  (SELECT id FROM mg WHERE slug='erector_spinae') AS primary_muscle_id,
  ARRAY[
    (SELECT id FROM mgg WHERE slug='glutes'),
    (SELECT id FROM mgg WHERE slug='hamstrings')
  ]::uuid[] AS secondary_muscle_group_ids,
  NULL::uuid[] AS default_grip_ids,  -- no grips here
  true,  -- is_public
  false, -- allows_grips
  false, -- is_unilateral
  2,     -- complexity_score
  'total'::text AS loading_hint,
  80,    -- popularity_rank
  ARRAY['lower_back','hinge','bodyweight']::text[] AS tags
WHERE
  (SELECT id FROM hyp_eq) IS NOT NULL
  AND (SELECT id FROM mg WHERE slug='erector_spinae') IS NOT NULL
  AND (SELECT id FROM bp WHERE slug='core') IS NOT NULL
ON CONFLICT (slug) DO NOTHING;