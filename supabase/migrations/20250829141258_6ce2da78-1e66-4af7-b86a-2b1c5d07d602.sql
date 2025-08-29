-- 2) Rows (seated cable row + lat pulldown used as row bar)
BEGIN;

WITH h AS (
  SELECT id, slug FROM handles WHERE slug IN ('seated-row-bar','dual-d-handle','single-handle')
), e AS (
  SELECT id, slug FROM equipment WHERE slug IN ('seated-row-machine','cable-machine')
), he AS (
  INSERT INTO handle_equipment (handle_id, equipment_id, is_default)
  SELECT h.id, e.id,
         -- seated-row-bar default on seated-row-machine; dual-d-handle default on cable-machine
         ( (h.slug='seated-row-bar' AND e.slug='seated-row-machine')
           OR (h.slug='dual-d-handle' AND e.slug='cable-machine') )
  FROM h JOIN e ON TRUE
  ON CONFLICT DO NOTHING
  RETURNING handle_id, equipment_id
)
INSERT INTO equipment_handle_orientations (equipment_id, handle_id, orientation, is_default)
SELECT e.id, h.id, o.orientation::grip_orientation,
       -- defaults: neutral with D-handle(s), overhand with row bar
       ( (h.slug IN ('dual-d-handle','single-handle') AND o.orientation='neutral')
         OR (h.slug='seated-row-bar' AND o.orientation='overhand') )
FROM e JOIN h ON TRUE 
CROSS JOIN (VALUES ('overhand'),('underhand'),('neutral')) AS o(orientation)
ON CONFLICT DO NOTHING;

COMMIT;