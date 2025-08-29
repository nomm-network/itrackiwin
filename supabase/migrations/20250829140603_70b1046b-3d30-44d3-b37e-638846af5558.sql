-- Continue with remaining handle orientations (Pull-up Bar and Suspension Straps)
-- Pull-up Bar: overhand (default), underhand
WITH h AS (SELECT id, slug FROM handles WHERE slug = 'pull-up-bar')
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation::grip_orientation, (o.orientation = 'overhand')::boolean
FROM h
CROSS JOIN (VALUES ('overhand'),('underhand')) AS o(orientation)
ON CONFLICT DO NOTHING;

-- Parallel Bars: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT id, 'neutral'::grip_orientation, true
FROM handles WHERE slug = 'parallel-bars'
ON CONFLICT DO NOTHING;

-- Suspension Straps: neutral (default), overhand, underhand
WITH h AS (SELECT id, slug FROM handles WHERE slug = 'suspension-straps')
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation::grip_orientation, (o.orientation = 'neutral')::boolean
FROM h
CROSS JOIN (VALUES ('neutral'),('overhand'),('underhand')) AS o(orientation)
ON CONFLICT DO NOTHING;

-- 2) EQUIPMENT ↔ HANDLE ↔ ORIENTATION
-- Build equipment_handle_orientations from existing handle_equipment + the rules above
WITH he AS (
  SELECT handle_id, equipment_id, is_default FROM handle_equipment
),
hoc AS (
  SELECT handle_id, orientation, is_default FROM handle_orientation_compatibility
)
INSERT INTO equipment_handle_orientations (equipment_id, handle_id, orientation, is_default)
SELECT he.equipment_id,
       he.handle_id,
       hoc.orientation,
       -- default at equipment level = default at handle level
       hoc.is_default
FROM he
JOIN hoc USING (handle_id)
ON CONFLICT DO NOTHING;

-- Optional: benches with straight bar = overhand only
WITH e AS (SELECT id FROM equipment WHERE slug IN ('flat-bench','incline-bench','decline-bench')),
     h AS (SELECT id FROM handles WHERE slug = 'straight-bar')
DELETE FROM equipment_handle_orientations eho
USING e, h
WHERE eho.equipment_id = e.id
  AND eho.handle_id   = h.id
  AND eho.orientation <> 'overhand'::grip_orientation;

-- 3) EXERCISE DEFAULTS for Bench Press family
-- Check if we have handle_equipment table first
-- Then set up exercise defaults for benches
WITH bencheq AS (
  SELECT id AS equipment_id
  FROM equipment
  WHERE slug IN ('flat-bench','incline-bench','decline-bench')
),
bench_ex AS (
  SELECT ex.id AS exercise_id
  FROM exercises ex
  JOIN bencheq be ON be.equipment_id = ex.equipment_id
),
bar AS (
  SELECT id AS handle_id FROM handles WHERE slug = 'straight-bar'
)
-- ensure handle mapping exists
INSERT INTO exercise_handles (exercise_id, handle_id, is_default)
SELECT be.exercise_id, bar.handle_id, TRUE
FROM bench_ex be, bar
ON CONFLICT DO NOTHING;

-- ensure default orientation mapping exists
INSERT INTO exercise_handle_orientations (exercise_id, handle_id, orientation, is_default)
SELECT be.exercise_id, bar.handle_id, 'overhand'::grip_orientation, TRUE
FROM bench_ex be, bar
ON CONFLICT DO NOTHING;