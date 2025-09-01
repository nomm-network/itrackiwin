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

-- 1) Insert: Lat Pulldown (cable machine, stack)
WITH
eq AS (SELECT id FROM equipment WHERE slug = 'cable-machine'),
bp AS (SELECT id FROM body_parts WHERE slug = 'back'),
mg AS (SELECT id FROM muscles WHERE slug = 'lats'),
mgg AS (
  SELECT slug, id
  FROM muscle_groups
  WHERE slug IN ('biceps','shoulders','traps')
),
mv AS (SELECT id FROM movements WHERE slug = 'pulldown'),
mp AS (SELECT id FROM movement_patterns WHERE slug = 'pull'),
gr AS (SELECT id FROM grips WHERE slug = 'overhand')
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
  'lat-pulldown-cable',
  'Lat Pulldown',
  'Lat Pulldown',
  (SELECT id FROM mp),
  (SELECT id FROM mv),
  'stack'::load_type_enum,
  'medium'::exercise_skill_level,
  (SELECT id FROM eq),
  (SELECT id FROM bp),
  (SELECT id FROM mg),
  ARRAY[
    (SELECT id FROM mgg WHERE slug='biceps'),
    (SELECT id FROM mgg WHERE slug='shoulders'),
    (SELECT id FROM mgg WHERE slug='traps')
  ]::uuid[],
  ARRAY[(SELECT id FROM gr)]::uuid[],
  true, true, false, 3, 'total', 92,
  ARRAY['back','lats','pulldown','cable']::text[]
WHERE
  (SELECT id FROM eq) IS NOT NULL
  AND (SELECT id FROM mg) IS NOT NULL
  AND (SELECT id FROM bp) IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- 2) Insert: Seated Row Machine (dual-load plates)
WITH
eq AS (SELECT id FROM equipment WHERE slug = 'seated-row-machine'),
bp AS (SELECT id FROM body_parts WHERE slug = 'back'),
mg AS (SELECT id FROM muscles WHERE slug = 'lats'),
mgg AS (
  SELECT slug, id
  FROM muscle_groups
  WHERE slug IN ('biceps','shoulders','traps')
),
mv AS (SELECT id FROM movements WHERE slug = 'row'),
mp AS (SELECT id FROM movement_patterns WHERE slug = 'pull'),
gr AS (SELECT id FROM grips WHERE slug = 'neutral')
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
  'seated-row-machine',
  'Seated Row Machine',
  'Seated Row Machine',
  (SELECT id FROM mp),
  (SELECT id FROM mv),
  'dual_load'::load_type_enum,
  'medium'::exercise_skill_level,
  (SELECT id FROM eq),
  (SELECT id FROM bp),
  (SELECT id FROM mg),
  ARRAY[
    (SELECT id FROM mgg WHERE slug='biceps'),
    (SELECT id FROM mgg WHERE slug='shoulders'),
    (SELECT id FROM mgg WHERE slug='traps')
  ]::uuid[],
  ARRAY[(SELECT id FROM gr)]::uuid[],
  true, true, false, 3, 'total', 88,
  ARRAY['back','lats','row','machine']::text[]
WHERE
  (SELECT id FROM eq) IS NOT NULL
  AND (SELECT id FROM mg) IS NOT NULL
  AND (SELECT id FROM bp) IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- 3) Insert: Back Extension / Hyperextension (bodyweight default)
WITH
eq AS (
  SELECT id FROM equipment 
  WHERE slug IN ('hyperextension-bench','back-extension-bench','roman-chair')
  ORDER BY CASE slug
             WHEN 'hyperextension-bench' THEN 1
             WHEN 'back-extension-bench' THEN 2
             WHEN 'roman-chair' THEN 3
           END
  LIMIT 1
),
bp AS (SELECT id FROM body_parts WHERE slug = 'core'),
mg AS (SELECT id FROM muscles WHERE slug = 'erector_spinae'),
mgg AS (
  SELECT slug, id
  FROM muscle_groups
  WHERE slug IN ('glutes','hamstrings')
),
mv AS (SELECT id FROM movements WHERE slug = 'back_extension'),
mp AS (SELECT id FROM movement_patterns WHERE slug = 'hinge')
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
  'back-extension',
  'Back Extension',
  'Back Extension',
  (SELECT id FROM mp),
  (SELECT id FROM mv),
  'bodyweight'::load_type_enum,
  'low'::exercise_skill_level,
  (SELECT id FROM eq),
  (SELECT id FROM bp),
  (SELECT id FROM mg),
  ARRAY[
    (SELECT id FROM mgg WHERE slug='glutes'),
    (SELECT id FROM mgg WHERE slug='hamstrings')
  ]::uuid[],
  NULL::uuid[],
  true, false, false, 2, 'total', 80,
  ARRAY['lower_back','hinge','bodyweight']::text[]
WHERE
  (SELECT id FROM eq) IS NOT NULL
  AND (SELECT id FROM mg) IS NOT NULL
  AND (SELECT id FROM bp) IS NOT NULL
ON CONFLICT (slug) DO NOTHING;