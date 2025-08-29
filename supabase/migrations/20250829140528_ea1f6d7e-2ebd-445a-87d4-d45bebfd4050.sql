-- Populate handle orientation compatibility data
-- Straight Bar: overhand (default), underhand, mixed
WITH h AS (SELECT id, slug FROM handles WHERE slug = 'straight-bar')
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation::grip_orientation, (o.orientation = 'overhand')::boolean
FROM h
CROSS JOIN (VALUES ('overhand'),('underhand'),('mixed')) AS o(orientation)
ON CONFLICT DO NOTHING;

-- EZ Curl Bar: overhand (default), underhand
WITH h AS (SELECT id, slug FROM handles WHERE slug = 'ez-curl-bar')
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation::grip_orientation, (o.orientation = 'overhand')::boolean
FROM h
CROSS JOIN (VALUES ('overhand'),('underhand')) AS o(orientation)
ON CONFLICT DO NOTHING;

-- Trap Bar: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT id, 'neutral'::grip_orientation, true
FROM handles WHERE slug = 'trap-bar'
ON CONFLICT DO NOTHING;

-- Swiss Bar: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT id, 'neutral'::grip_orientation, true
FROM handles WHERE slug = 'swiss-bar'
ON CONFLICT DO NOTHING;

-- Lat Pulldown Bar: overhand (default), underhand
WITH h AS (SELECT id, slug FROM handles WHERE slug = 'lat-pulldown-bar')
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation::grip_orientation, (o.orientation = 'overhand')::boolean
FROM h
CROSS JOIN (VALUES ('overhand'),('underhand')) AS o(orientation)
ON CONFLICT DO NOTHING;

-- Seated Row Bar: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT id, 'neutral'::grip_orientation, true
FROM handles WHERE slug = 'seated-row-bar'
ON CONFLICT DO NOTHING;

-- Tricep Rope: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT id, 'neutral'::grip_orientation, true
FROM handles WHERE slug = 'tricep-rope'
ON CONFLICT DO NOTHING;

-- Single Handle: overhand (default), underhand, neutral
WITH h AS (SELECT id, slug FROM handles WHERE slug = 'single-handle')
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT h.id, o.orientation::grip_orientation, (o.orientation = 'overhand')::boolean
FROM h
CROSS JOIN (VALUES ('overhand'),('underhand'),('neutral')) AS o(orientation)
ON CONFLICT DO NOTHING;

-- Dual D-Handle: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT id, 'neutral'::grip_orientation, true
FROM handles WHERE slug = 'dual-d-handle'
ON CONFLICT DO NOTHING;

-- Dip Handles: neutral (default)
INSERT INTO handle_orientation_compatibility (handle_id, orientation, is_default)
SELECT id, 'neutral'::grip_orientation, true
FROM handles WHERE slug = 'dip-handles'
ON CONFLICT DO NOTHING;