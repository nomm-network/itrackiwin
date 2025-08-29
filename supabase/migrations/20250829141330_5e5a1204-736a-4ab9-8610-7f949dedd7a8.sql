-- 3) Curls (barbell/ez + cable) - 4) Triceps (pushdowns/extensions/dips) - 5) Cable work (lat pulldown & general cable attachments)
-- Combined for efficiency
BEGIN;

-- 3) Curls setup
WITH h AS (
  SELECT id, slug FROM handles WHERE slug IN ('straight-bar','ez-curl-bar','single-handle','tricep-rope')
), e AS (
  -- free-weight station for barbells, plus cable machine for attachments
  SELECT id, slug FROM equipment WHERE slug IN ('free-weight-station','cable-machine')
), he AS (
  INSERT INTO handle_equipment (handle_id, equipment_id, is_default)
  SELECT h.id, e.id,
         -- defaults: ez-curl-bar on free-weights; single-handle on cable (for single-arm)
         ( (h.slug='ez-curl-bar' AND e.slug='free-weight-station')
           OR (h.slug='single-handle' AND e.slug='cable-machine') )
  FROM h JOIN e ON TRUE
  ON CONFLICT DO NOTHING
  RETURNING handle_id, equipment_id
)
INSERT INTO equipment_handle_orientations (equipment_id, handle_id, orientation, is_default)
SELECT e.id, h.id, o.orientation::grip_orientation,
       -- defaults: UNDERHAND for curls (straight/ez/single), NEUTRAL for rope (hammer curl)
       ( (h.slug IN ('straight-bar','ez-curl-bar','single-handle') AND o.orientation='underhand')
         OR (h.slug='tricep-rope' AND o.orientation='neutral') )
FROM e JOIN h ON TRUE 
CROSS JOIN (VALUES ('overhand'),('underhand'),('neutral')) AS o(orientation)
ON CONFLICT DO NOTHING;

-- 4) Triceps setup
WITH h AS (
  SELECT id, slug FROM handles WHERE slug IN ('tricep-rope','straight-bar','single-handle','dip-handles')
), e AS (
  SELECT id, slug FROM equipment WHERE slug IN ('cable-machine','dip-station')
), he AS (
  INSERT INTO handle_equipment (handle_id, equipment_id, is_default)
  SELECT h.id, e.id,
         -- defaults: rope on cable-machine, dip-handles on dip-station
         ( (h.slug='tricep-rope' AND e.slug='cable-machine')
           OR (h.slug='dip-handles' AND e.slug='dip-station') )
  FROM h JOIN e ON TRUE
  ON CONFLICT DO NOTHING
  RETURNING handle_id, equipment_id
)
INSERT INTO equipment_handle_orientations (equipment_id, handle_id, orientation, is_default)
SELECT e.id, h.id, o.orientation::grip_orientation,
       -- defaults: NEUTRAL on rope & dips, OVERHAND on straight-bar
       ( (h.slug IN ('tricep-rope','dip-handles') AND o.orientation='neutral')
         OR (h.slug='straight-bar' AND o.orientation='overhand') )
FROM e JOIN h ON TRUE 
CROSS JOIN (VALUES ('overhand'),('underhand'),('neutral')) AS o(orientation)
ON CONFLICT DO NOTHING;

-- 5) Cable work setup
WITH h AS (
  SELECT id, slug FROM handles WHERE slug IN ('lat-pulldown-bar','seated-row-bar','dual-d-handle','single-handle','tricep-rope')
), e AS (
  SELECT id, slug FROM equipment WHERE slug IN ('lat-pulldown-machine','cable-machine')
), he AS (
  INSERT INTO handle_equipment (handle_id, equipment_id, is_default)
  SELECT h.id, e.id,
         -- defaults: lat-pulldown-bar on lat machine; dual-d-handle on generic cable
         ( (h.slug='lat-pulldown-bar' AND e.slug='lat-pulldown-machine')
           OR (h.slug='dual-d-handle' AND e.slug='cable-machine') )
  FROM h JOIN e ON TRUE
  ON CONFLICT DO NOTHING
  RETURNING handle_id, equipment_id
)
INSERT INTO equipment_handle_orientations (equipment_id, handle_id, orientation, is_default)
SELECT e.id, h.id, o.orientation::grip_orientation,
       -- defaults: overhand for lat bar, neutral for D-handles, overhand for row bar & single-handle as general default
       ( (h.slug='lat-pulldown-bar' AND o.orientation='overhand')
         OR (h.slug='dual-d-handle' AND o.orientation='neutral')
         OR (h.slug IN ('seated-row-bar','single-handle') AND o.orientation='overhand')
         OR (h.slug='tricep-rope' AND o.orientation='neutral') )
FROM e JOIN h ON TRUE 
CROSS JOIN (VALUES ('overhand'),('underhand'),('neutral')) AS o(orientation)
ON CONFLICT DO NOTHING;

COMMIT;