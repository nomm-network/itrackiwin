BEGIN;

-- 0) Backups (optional but handy)
CREATE TEMP TABLE _bak_handle_grip_compat AS
SELECT * FROM handle_grip_compatibility;
CREATE TEMP TABLE _bak_equipment_handle_grips AS
SELECT * FROM equipment_handle_grips;
CREATE TEMP TABLE _bak_grips AS
SELECT * FROM grips;

-- 1) Ensure ONLY the 4 orientation grips exist (upsert by slug)
WITH upserts AS (
  SELECT * FROM (VALUES
    ('overhand','orientation'),
    ('underhand','orientation'),
    ('neutral','orientation'),
    ('mixed','orientation')
  ) v(slug, category)
)
INSERT INTO grips (id, slug, category, is_compatible_with, created_at)
SELECT gen_random_uuid(), u.slug, u.category, '[]'::jsonb, NOW()
FROM upserts u
LEFT JOIN grips g ON g.slug = u.slug
WHERE g.id IS NULL;

-- 2) Delete all NON-orientation grips (width etc.) and their compat rows
-- First delete from child tables to avoid FK errors
DELETE FROM equipment_handle_grips 
WHERE grip_id IN (
  SELECT id FROM grips 
  WHERE slug NOT IN ('overhand','underhand','neutral','mixed')
);

DELETE FROM exercise_handle_grips 
WHERE grip_id IN (
  SELECT id FROM grips 
  WHERE slug NOT IN ('overhand','underhand','neutral','mixed')
);

DELETE FROM handle_grip_compatibility 
WHERE grip_id IN (
  SELECT id FROM grips 
  WHERE slug NOT IN ('overhand','underhand','neutral','mixed')
);

-- Now remove the extra grips
DELETE FROM grips 
WHERE slug NOT IN ('overhand','underhand','neutral','mixed');

-- 3) Rebuild handle ↔ grip compatibility for ORIENTATION only
DELETE FROM handle_grip_compatibility;

-- Insert handle-grip combinations with proper compatibility rules
INSERT INTO handle_grip_compatibility (handle_id, grip_id, is_default)
SELECT 
  h.id as handle_id,
  g.id as grip_id,
  CASE
    WHEN h.slug IN ('trap-bar','swiss-bar','seated-row-bar','tricep-rope',
                    'dual-d-handle','dip-handles','parallel-bars') AND g.slug = 'neutral' THEN TRUE
    WHEN h.slug IN ('lat-pulldown-bar','pull-up-bar') AND g.slug = 'overhand' THEN TRUE
    WHEN h.slug = 'single-handle' AND g.slug = 'neutral' THEN TRUE
    WHEN h.slug = 'suspension-straps' AND g.slug = 'neutral' THEN TRUE
    WHEN h.slug = 'straight-bar' AND g.slug = 'overhand' THEN TRUE
    WHEN h.slug = 'ez-curl-bar' AND g.slug = 'overhand' THEN TRUE
    ELSE FALSE
  END AS is_default
FROM handles h
CROSS JOIN grips g
WHERE 
  -- Define allowed combinations
  (h.slug = 'straight-bar' AND g.slug IN ('overhand', 'underhand', 'mixed')) OR
  (h.slug = 'ez-curl-bar' AND g.slug IN ('overhand', 'underhand')) OR
  (h.slug = 'trap-bar' AND g.slug = 'neutral') OR
  (h.slug = 'swiss-bar' AND g.slug = 'neutral') OR
  (h.slug = 'lat-pulldown-bar' AND g.slug IN ('overhand', 'underhand', 'neutral')) OR
  (h.slug = 'seated-row-bar' AND g.slug = 'neutral') OR
  (h.slug = 'tricep-rope' AND g.slug = 'neutral') OR
  (h.slug = 'single-handle' AND g.slug IN ('overhand', 'underhand', 'neutral')) OR
  (h.slug = 'dual-d-handle' AND g.slug = 'neutral') OR
  (h.slug = 'dip-handles' AND g.slug = 'neutral') OR
  (h.slug = 'pull-up-bar' AND g.slug IN ('overhand', 'underhand')) OR
  (h.slug = 'parallel-bars' AND g.slug = 'neutral') OR
  (h.slug = 'suspension-straps' AND g.slug IN ('overhand', 'underhand', 'neutral'));

-- 4) Rebuild equipment+handle ↔ grip from handle_equipment + handle_grip_compatibility
DELETE FROM equipment_handle_grips;

INSERT INTO equipment_handle_grips (equipment_id, handle_id, grip_id, is_default)
SELECT 
  he.equipment_id, 
  he.handle_id, 
  hgc.grip_id,
  hgc.is_default
FROM handle_equipment he
JOIN handle_grip_compatibility hgc ON hgc.handle_id = he.handle_id;

COMMIT;