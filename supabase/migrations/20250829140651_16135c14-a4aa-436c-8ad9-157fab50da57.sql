-- Finish the remaining steps without the bench exercises issue for now
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