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

-- Insert: Lat Pulldown (cable machine, stack)
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
  mp.id AS movement_pattern_id,
  mv.id AS movement_id,
  'stack'::load_type_enum AS load_type,
  'medium'::exercise_skill_level AS exercise_skill_level,
  eq.id AS equipment_id,
  bp.id AS body_part_id,
  mg.id AS primary_muscle_id,
  ARRAY[biceps.id, shoulders.id, traps.id]::uuid[] AS secondary_muscle_group_ids,
  ARRAY[overhand.id]::uuid[] AS default_grip_ids,
  true,  -- is_public
  true,  -- allows_grips
  false, -- is_unilateral
  3,     -- complexity_score
  'total'::text AS loading_hint,
  92,    -- popularity_rank
  ARRAY['back','lats','pulldown','cable']::text[] AS tags
FROM 
  equipment eq,
  body_parts bp,
  muscles mg,
  muscle_groups biceps,
  muscle_groups shoulders,
  muscle_groups traps,
  movements mv,
  movement_patterns mp,
  grips overhand
WHERE
  eq.slug = 'cable-machine'
  AND bp.slug = 'back'
  AND mg.slug = 'lats'
  AND biceps.slug = 'biceps'
  AND shoulders.slug = 'shoulders'
  AND traps.slug = 'traps'
  AND mv.slug = 'pulldown'
  AND mp.slug = 'pull'
  AND overhand.slug = 'overhand'
ON CONFLICT (slug) DO NOTHING;

-- Insert: Seated Row Machine (dual-load plates)
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
  mp.id AS movement_pattern_id,
  mv.id AS movement_id,
  'dual_load'::load_type_enum AS load_type,
  'medium'::exercise_skill_level AS exercise_skill_level,
  eq.id AS equipment_id,
  bp.id AS body_part_id,
  mg.id AS primary_muscle_id,
  ARRAY[biceps.id, shoulders.id, traps.id]::uuid[] AS secondary_muscle_group_ids,
  ARRAY[neutral.id]::uuid[] AS default_grip_ids,
  true,   -- is_public
  true,   -- allows_grips
  false,  -- is_unilateral
  3,      -- complexity_score
  'per_side'::text AS loading_hint,
  88,     -- popularity_rank
  ARRAY['back','lats','row','machine']::text[] AS tags
FROM 
  equipment eq,
  body_parts bp,
  muscles mg,
  muscle_groups biceps,
  muscle_groups shoulders,
  muscle_groups traps,
  movements mv,
  movement_patterns mp,
  grips neutral
WHERE
  eq.slug = 'seated-row-machine'
  AND bp.slug = 'back'
  AND mg.slug = 'lats'
  AND biceps.slug = 'biceps'
  AND shoulders.slug = 'shoulders'
  AND traps.slug = 'traps'
  AND mv.slug = 'row'
  AND mp.slug = 'pull'
  AND neutral.slug = 'neutral'
ON CONFLICT (slug) DO NOTHING;

-- Insert: Back Extension / Hyperextension (bodyweight default)
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
  mp.id AS movement_pattern_id,
  mv.id AS movement_id,
  'bodyweight'::load_type_enum AS load_type,
  'low'::exercise_skill_level AS exercise_skill_level,
  eq.id AS equipment_id,
  bp.id AS body_part_id,
  mg.id AS primary_muscle_id,
  ARRAY[glutes.id, hamstrings.id]::uuid[] AS secondary_muscle_group_ids,
  NULL::uuid[] AS default_grip_ids,
  true,  -- is_public
  false, -- allows_grips
  false, -- is_unilateral
  2,     -- complexity_score
  'total'::text AS loading_hint,
  80,    -- popularity_rank
  ARRAY['lower_back','hinge','bodyweight']::text[] AS tags
FROM 
  equipment eq,
  body_parts bp,
  muscles mg,
  muscle_groups glutes,
  muscle_groups hamstrings,
  movements mv,
  movement_patterns mp
WHERE
  eq.slug = 'hyperextension-bench'
  AND bp.slug = 'core'
  AND mg.slug = 'erector_spinae'
  AND glutes.slug = 'glutes'
  AND hamstrings.slug = 'hamstrings'
  AND mv.slug = 'back_extension'
  AND mp.slug = 'hinge'
ON CONFLICT (slug) DO NOTHING;