-- Add two arm exercises with proper equipment lookups

-- 1) EZ-Bar Curl (fixed rack bars)
WITH eq AS (
  SELECT id
  FROM equipment
  WHERE slug = 'ez-curl-bar'  -- your actual slug
  LIMIT 1
),
bp AS ( SELECT id FROM body_parts   WHERE slug = 'arms'         LIMIT 1 ),
pm AS ( SELECT id FROM muscle_groups WHERE slug = 'biceps'      LIMIT 1 ),
mp AS ( SELECT id FROM movement_patterns WHERE slug = 'isolation' LIMIT 1 ),
mv AS ( SELECT id FROM movements    WHERE slug = 'curl'          LIMIT 1 ),
gr AS ( SELECT id FROM grips        WHERE slug = 'underhand'     LIMIT 1 )
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
  secondary_muscle_group_ids,
  default_grip_ids,
  allows_grips
)
SELECT
  'ez-bar-curl',
  'EZ-Bar Curl',
  'EZ-Bar Curl',
  mp.id,
  mv.id,
  'single_load',
  'low',
  eq.id,
  pm.id,
  bp.id,
  2,
  true,                    -- EZ bars are typically loaded with plates
  15.0,                    -- standard EZ bar weight
  'total',
  80,
  true,
  NULL,
  ARRAY['arms','biceps','curl']::text[],
  ARRAY[
    (SELECT id FROM muscle_groups WHERE slug = 'forearms')
  ]::uuid[],
  ARRAY[gr.id]::uuid[],
  true
FROM eq, bp, pm, mp, mv, gr
WHERE eq.id IS NOT NULL AND bp.id IS NOT NULL AND pm.id IS NOT NULL
  AND mp.id IS NOT NULL AND mv.id IS NOT NULL AND gr.id IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- 2) Seated Hammer Curl (Dumbbells)
WITH eq AS (
  SELECT id
  FROM equipment
  WHERE slug = 'dumbbell'
  LIMIT 1
),
bp AS ( SELECT id FROM body_parts   WHERE slug = 'arms'           LIMIT 1 ),
pm AS ( SELECT id FROM muscle_groups WHERE slug = 'forearms'      LIMIT 1 ),
mp AS ( SELECT id FROM movement_patterns WHERE slug = 'isolation'  LIMIT 1 ),
mv AS ( SELECT id FROM movements    WHERE slug = 'curl'            LIMIT 1 ),
gr AS ( SELECT id FROM grips        WHERE slug = 'neutral'         LIMIT 1 )
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
  secondary_muscle_group_ids,
  default_grip_ids,
  allows_grips,
  is_unilateral
)
SELECT
  'seated-hammer-curl-dumbbells',
  'Seated Hammer Curl',
  'Seated Hammer Curl',
  mp.id,
  mv.id,
  'single_load',
  'low',
  eq.id,
  pm.id,
  bp.id,
  2,
  false,
  NULL,
  'total',
  78,
  true,
  NULL,
  ARRAY['arms','biceps','curl','hammer','seated']::text[],
  ARRAY[
    (SELECT id FROM muscle_groups WHERE slug = 'biceps')
  ]::uuid[],
  ARRAY[gr.id]::uuid[],
  true,
  true
FROM eq, bp, pm, mp, mv, gr
WHERE eq.id IS NOT NULL AND bp.id IS NOT NULL AND pm.id IS NOT NULL
  AND mp.id IS NOT NULL AND mv.id IS NOT NULL AND gr.id IS NOT NULL
ON CONFLICT (slug) DO NOTHING;