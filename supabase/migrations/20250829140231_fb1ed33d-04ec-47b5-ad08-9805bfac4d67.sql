-- 1) HANDLE ↔ ORIENTATION COMPATIBILITY
WITH h AS (SELECT id, slug FROM handles)

-- Straight Bar: overhand (default), underhand, mixed
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation, (o.orientation = 'overhand')::boolean
FROM h
JOIN LATERAL (VALUES ('overhand'),('underhand'),('mixed')) AS o(orientation) ON TRUE
WHERE h.slug = 'straight-bar'
ON CONFLICT DO NOTHING;

-- EZ Curl Bar: overhand (default), underhand
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation, (o.orientation = 'overhand')::boolean
FROM h
JOIN LATERAL (VALUES ('overhand'),('underhand')) AS o(orientation) ON TRUE
WHERE h.slug = 'ez-curl-bar'
ON CONFLICT DO NOTHING;

-- Trap Bar: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, 'neutral', true
FROM h WHERE h.slug = 'trap-bar'
ON CONFLICT DO NOTHING;

-- Swiss Bar: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, 'neutral', true
FROM h WHERE h.slug = 'swiss-bar'
ON CONFLICT DO NOTHING;

-- Lat Pulldown Bar: overhand (default), underhand
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation, (o.orientation = 'overhand')::boolean
FROM h
JOIN LATERAL (VALUES ('overhand'),('underhand')) AS o(orientation) ON TRUE
WHERE h.slug = 'lat-pulldown-bar'
ON CONFLICT DO NOTHING;

-- Seated Row Bar (close-grip V): neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, 'neutral', true
FROM h WHERE h.slug = 'seated-row-bar'
ON CONFLICT DO NOTHING;

-- Tricep Rope: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, 'neutral', true
FROM h WHERE h.slug = 'tricep-rope'
ON CONFLICT DO NOTHING;

-- Single Handle: overhand (default), underhand, neutral
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation, (o.orientation = 'overhand')::boolean
FROM h
JOIN LATERAL (VALUES ('overhand'),('underhand'),('neutral')) AS o(orientation) ON TRUE
WHERE h.slug = 'single-handle'
ON CONFLICT DO NOTHING;

-- Dual D-Handle: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, 'neutral', true
FROM h WHERE h.slug = 'dual-d-handle'
ON CONFLICT DO NOTHING;

-- Dip Handles: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, 'neutral', true
FROM h WHERE h.slug = 'dip-handles'
ON CONFLICT DO NOTHING;

-- Pull-up Bar: overhand (default), underhand
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation, (o.orientation = 'overhand')::boolean
FROM h
JOIN LATERAL (VALUES ('overhand'),('underhand')) AS o(orientation) ON TRUE
WHERE h.slug = 'pull-up-bar'
ON CONFLICT DO NOTHING;

-- Parallel Bars: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, 'neutral', true
FROM h WHERE h.slug = 'parallel-bars'
ON CONFLICT DO NOTHING;

-- Suspension Straps: neutral (default), overhand, underhand
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation, (o.orientation = 'neutral')::boolean
FROM h
JOIN LATERAL (VALUES ('neutral'),('overhand'),('underhand')) AS o(orientation) ON TRUE
WHERE h.slug = 'suspension-straps'
ON CONFLICT DO NOTHING;

-- 2) EQUIPMENT ↔ HANDLE ↔ ORIENTATION
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
  AND eho.orientation <> 'overhand';

-- 3) EXERCISE DEFAULTS for Bench Press family
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

-- (Optional) remove any non-overhand orientations accidentally attached to benches
DELETE FROM exercise_handle_orientations eho
USING bench_ex be, bar
WHERE eho.exercise_id = be.exercise_id
  AND eho.handle_id   = bar.handle_id
  AND eho.orientation <> 'overhand';