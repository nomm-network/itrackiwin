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
--    (Keeps only the 4 slugs above)
WITH keep AS (
  SELECT id FROM grips WHERE slug IN ('overhand','underhand','neutral','mixed')
),
to_delete AS (
  SELECT id FROM grips WHERE id NOT IN (SELECT id FROM keep)
)
-- child tables first (avoid FK errors)
DELETE FROM equipment_handle_grips  WHERE grip_id IN (SELECT id FROM to_delete);
DELETE FROM exercise_handle_grips   WHERE grip_id IN (SELECT id FROM to_delete);
DELETE FROM handle_grip_compatibility WHERE grip_id IN (SELECT id FROM to_delete);
-- now remove the extra grips
DELETE FROM grips WHERE id IN (SELECT id FROM to_delete);

-- 3) Rebuild handle ↔ grip compatibility for ORIENTATION only
--    Define allowed orientations per handle slug
WITH grips_map AS (
  SELECT slug, id FROM grips
),
handles AS (
  SELECT id, slug FROM handles
),
rules(handle_slug, grip_slug) AS (
  VALUES
  -- Barbells & bars
  ('straight-bar',      'overhand'),
  ('straight-bar',      'underhand'),
  ('straight-bar',      'mixed'),

  ('ez-curl-bar',       'overhand'),
  ('ez-curl-bar',       'underhand'),

  ('trap-bar',          'neutral'),

  ('swiss-bar',         'neutral'),

  -- Cable attachments & bodyweight implements
  ('lat-pulldown-bar',  'overhand'),
  ('lat-pulldown-bar',  'underhand'),
  ('lat-pulldown-bar',  'neutral'),

  ('seated-row-bar',    'neutral'),

  ('tricep-rope',       'neutral'),

  ('single-handle',     'overhand'),
  ('single-handle',     'underhand'),
  ('single-handle',     'neutral'),

  ('dual-d-handle',     'neutral'),

  ('dip-handles',       'neutral'),

  ('pull-up-bar',       'overhand'),
  ('pull-up-bar',       'underhand'),

  ('parallel-bars',     'neutral'),

  ('suspension-straps', 'overhand'),
  ('suspension-straps', 'underhand'),
  ('suspension-straps', 'neutral')
),
resolved AS (
  SELECT h.id AS handle_id, g.id AS grip_id
  FROM rules r
  JOIN handles h     ON h.slug = r.handle_slug
  JOIN grips_map g   ON g.slug = r.grip_slug
)
-- clear & repopulate
DELETE FROM handle_grip_compatibility;
INSERT INTO handle_grip_compatibility (handle_id, grip_id, is_default)
SELECT handle_id, grip_id,
       -- pick a sane default per handle
       CASE
         WHEN h.slug IN ('trap-bar','swiss-bar','seated-row-bar','tricep-rope',
                         'dual-d-handle','dip-handles','parallel-bars') THEN TRUE
         WHEN h.slug IN ('lat-pulldown-bar','pull-up-bar') AND g.slug = 'overhand' THEN TRUE
         WHEN h.slug = 'single-handle'     AND g.slug = 'neutral'  THEN TRUE
         WHEN h.slug = 'suspension-straps' AND g.slug = 'neutral'  THEN TRUE
         WHEN h.slug = 'straight-bar'      AND g.slug = 'overhand' THEN TRUE
         WHEN h.slug = 'ez-curl-bar'       AND g.slug = 'overhand' THEN TRUE
         ELSE FALSE
       END AS is_default
FROM resolved r
JOIN handles h ON h.id = r.handle_id
JOIN grips   g ON g.id = r.grip_id;

-- 4) Rebuild equipment+handle ↔ grip from handle_equipment + handle_grip_compatibility
--    We fan-out allowed grips per (equipment, handle)
WITH heg AS (
  SELECT he.equipment_id, he.handle_id
  FROM handle_equipment he
),
allowed AS (
  SELECT handle_id, grip_id, is_default
  FROM handle_grip_compatibility
)
-- clear & repopulate
DELETE FROM equipment_handle_grips;
INSERT INTO equipment_handle_grips (equipment_id, handle_id, grip_id, is_default)
SELECT e.equipment_id, e.handle_id, a.grip_id,
       -- keep handle default as equipment+handle default (first pass)
       a.is_default
FROM heg e
JOIN allowed a ON a.handle_id = e.handle_id;

-- Ensure each (equipment_id, handle_id) has at least one default;
-- if none flagged TRUE above, set 'overhand' else fallback to first available.
WITH ranked AS (
  SELECT
    ehg.equipment_id, ehg.handle_id, ehg.grip_id, ehg.is_default,
    ROW_NUMBER() OVER (PARTITION BY ehg.equipment_id, ehg.handle_id ORDER BY
                       (g.slug = 'overhand') DESC, g.slug) AS rn,
    SUM( CASE WHEN ehg.is_default THEN 1 ELSE 0 END )
      OVER (PARTITION BY ehg.equipment_id, ehg.handle_id) AS defaults_per_pair
  FROM equipment_handle_grips ehg
  JOIN grips g ON g.id = ehg.grip_id
)
UPDATE equipment_handle_grips t
SET is_default = CASE
  WHEN r.defaults_per_pair = 0 AND r.rn = 1 THEN TRUE
  ELSE r.is_default
END
FROM ranked r
WHERE t.equipment_id = r.equipment_id
  AND t.handle_id    = r.handle_id
  AND t.grip_id      = r.grip_id;

-- 5) (Optional) Clear per-exercise overrides (you can keep them if you already use them)
-- DELETE FROM exercise_handle_grips;

COMMIT;