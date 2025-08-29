-- Now populate the data with your handle-orientation defaults
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