-- ================================
-- 1) CANDIDATE RESOLVERS (CTEs)
-- ================================
WITH
mg_chest AS (
  SELECT id FROM muscle_groups WHERE slug IN ('chest') LIMIT 1
),
mg_shoulders AS (
  SELECT id FROM muscle_groups WHERE slug IN ('shoulders','delts') LIMIT 1
),

mp_press_incline AS (
  SELECT id FROM movement_patterns 
  WHERE slug IN ('incline-press','press-incline','press-vertical','press')
  ORDER BY CASE slug 
    WHEN 'incline-press' THEN 0 
    WHEN 'press-incline' THEN 1
    WHEN 'press-vertical' THEN 2
    ELSE 9 END
  LIMIT 1
),
mp_press_horizontal AS (
  SELECT id FROM movement_patterns 
  WHERE slug IN ('horizontal-press','bench-press','press-horizontal','press')
  ORDER BY CASE slug 
    WHEN 'horizontal-press' THEN 0 
    WHEN 'bench-press' THEN 1
    WHEN 'press-horizontal' THEN 2
    ELSE 9 END
  LIMIT 1
),
mp_raise AS (
  SELECT id FROM movement_patterns 
  WHERE slug IN ('front-raise','shoulder-raise','raise','lateral-raise','shoulder-isolation')
  ORDER BY CASE slug 
    WHEN 'front-raise' THEN 0
    WHEN 'shoulder-raise' THEN 1
    WHEN 'raise' THEN 2
    ELSE 9 END
  LIMIT 1
),

-- Equipment candidates
eq_incline_chest_machine AS (
  SELECT id FROM equipment 
  WHERE slug IN (
    'incline-chest-press-machine','selectorized-incline-chest-press',
    'incline-chest-press','chest-press-machine-incline','machine-chest-press-incline'
  )
  ORDER BY CASE slug 
    WHEN 'incline-chest-press-machine' THEN 0
    WHEN 'selectorized-incline-chest-press' THEN 1
    WHEN 'incline-chest-press' THEN 2
    ELSE 9 END
  LIMIT 1
),
eq_mid_chest_machine AS (
  SELECT id FROM equipment 
  WHERE slug IN (
    'chest-press-machine','selectorized-chest-press',
    'machine-chest-press','seated-chest-press'
  )
  ORDER BY CASE slug 
    WHEN 'chest-press-machine' THEN 0
    WHEN 'selectorized-chest-press' THEN 1
    WHEN 'machine-chest-press' THEN 2
    ELSE 9 END
  LIMIT 1
),
eq_dumbbells AS (
  SELECT id FROM equipment 
  WHERE slug IN ('dumbbells','dumbbell-pair','adjustable-dumbbells','fixed-dumbbells')
  ORDER BY CASE slug 
    WHEN 'dumbbells' THEN 0
    WHEN 'dumbbell-pair' THEN 1
    WHEN 'adjustable-dumbbells' THEN 2
    ELSE 9 END
  LIMIT 1
),
eq_flat_bench AS (
  SELECT id FROM equipment 
  WHERE slug IN ('flat-bench','bench-flat','bench')
  ORDER BY CASE slug 
    WHEN 'flat-bench' THEN 0
    WHEN 'bench-flat' THEN 1
    ELSE 9 END
  LIMIT 1
)

-- ================================
-- 2) INSERT EXERCISES
-- ================================

-- 1) Inclined Upper Chest Machine (stack)
INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, created_at)
SELECT 
  'incline-chest-press-machine' AS slug,
  (SELECT id FROM eq_incline_chest_machine),
  'press'::movement_pattern,
  (SELECT id FROM mg_chest),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE slug = 'incline-chest-press-machine');

-- 2) Mid Chest Press Machine (stack)
INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, created_at)
SELECT 
  'chest-press-machine' AS slug,
  (SELECT id FROM eq_mid_chest_machine),
  'press'::movement_pattern,
  (SELECT id FROM mg_chest),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE slug = 'chest-press-machine');

-- 3) Upper chest, Front Raises (dumbbells)
INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, created_at)
SELECT 
  'dumbbell-front-raise' AS slug,
  (SELECT id FROM eq_dumbbells),
  'raise'::movement_pattern,
  (SELECT id FROM mg_shoulders),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE slug = 'dumbbell-front-raise');

-- 4) Flat bench chest press (bar loaded w/ weights)
INSERT INTO exercises (slug, equipment_id, movement_pattern, primary_muscle_id, created_at)
SELECT 
  'flat-bench-press' AS slug,
  (SELECT id FROM eq_flat_bench),
  'press'::movement_pattern,
  (SELECT id FROM mg_chest),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE slug = 'flat-bench-press');

-- Optional: show what got inserted
SELECT slug, equipment_id, movement_pattern, primary_muscle_id
FROM exercises
WHERE slug IN ('incline-chest-press-machine','chest-press-machine','dumbbell-front-raise','flat-bench-press');