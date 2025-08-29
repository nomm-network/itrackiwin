-- 1) Pull-ups (bar + assisted machine)
-- Adapted for orientation-based system
BEGIN;

WITH h AS (
  SELECT id, slug FROM handles WHERE slug IN ('pull-up-bar')
), e AS (
  SELECT id, slug FROM equipment WHERE slug IN ('pull-up-station','assisted-pullup-machine')
), he AS (
  -- link handle to both equipments (default to pull-up bar on station)
  INSERT INTO handle_equipment (handle_id, equipment_id, is_default)
  SELECT h.id, e.id, (e.slug = 'pull-up-station')
  FROM h JOIN e ON TRUE
  ON CONFLICT DO NOTHING
  RETURNING handle_id, equipment_id
)
-- default orientations per equipment+handle:
INSERT INTO equipment_handle_orientations (equipment_id, handle_id, orientation, is_default)
SELECT e.id, h.id, o.orientation::grip_orientation,
       -- defaults: overhand on pull-up-station, neutral on assisted machine
       ( (e.slug='pull-up-station' AND o.orientation='overhand')
         OR (e.slug='assisted-pullup-machine' AND o.orientation='neutral') )
FROM e
JOIN h ON TRUE
CROSS JOIN (VALUES ('overhand'),('underhand'),('neutral')) AS o(orientation)
ON CONFLICT DO NOTHING;

COMMIT;