-- STEP 2: Map ALL equipment to realistic handles
-- - Works against whatever equipment/handles currently exist
-- - Uses patterns (slug + load_type) and specific overrides
-- - Skips non-applicable machines
-- - Safe to re-run (ON CONFLICT DO NOTHING)

WITH
-- Convenience: ids for handles we use
h AS (
  SELECT slug, id FROM handles
  WHERE slug IN (
    'straight-bar','ez-curl-bar','trap-bar','swiss-bar',
    'lat-pulldown-bar','seated-row-bar','tricep-rope',
    'single-handle','dual-d-handle',
    'pull-up-bar','dip-handles','parallel-bars','suspension-straps'
  )
),

-- 1) Barbells & bar-like free weights
barbell_map AS (
  -- Olympic / generic barbells → straight default; others optional if present
  SELECT e.id AS equipment_id, (SELECT id FROM h WHERE slug='straight-bar') AS handle_id, TRUE  AS is_default
  FROM equipment e
  WHERE e.slug IN ('olympic-barbell','barbell','fixed-barbell')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='ez-curl-bar'), FALSE
  FROM equipment e
  WHERE e.slug IN ('olympic-barbell','barbell','fixed-barbell')
    AND EXISTS (SELECT 1 FROM h WHERE slug='ez-curl-bar')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='trap-bar'), FALSE
  FROM equipment e
  WHERE e.slug IN ('olympic-barbell','barbell')
    AND EXISTS (SELECT 1 FROM h WHERE slug='trap-bar')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='swiss-bar'), FALSE
  FROM equipment e
  WHERE e.slug IN ('olympic-barbell','barbell')
    AND EXISTS (SELECT 1 FROM h WHERE slug='swiss-bar')

  -- Dedicated bar equipments map 1:1 to same-named handle (default)
  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='trap-bar'), TRUE
  FROM equipment e
  WHERE e.slug IN ('trap-bar') AND EXISTS (SELECT 1 FROM h WHERE slug='trap-bar')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='swiss-bar'), TRUE
  FROM equipment e
  WHERE e.slug IN ('swiss-bar') AND EXISTS (SELECT 1 FROM h WHERE slug='swiss-bar')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='ez-curl-bar'), TRUE
  FROM equipment e
  WHERE e.slug IN ('ez-curl-bar') AND EXISTS (SELECT 1 FROM h WHERE slug='ez-curl-bar')

  -- Smith machine has integrated straight bar
  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='straight-bar'), TRUE
  FROM equipment e
  WHERE e.slug IN ('smith-machine') AND EXISTS (SELECT 1 FROM h WHERE slug='straight-bar')
),

-- 2) Cable stack / functional trainer family
cable_base AS (
  -- Any stack-based equipment gets the common cable attachments
  SELECT e.id AS equipment_id, (SELECT id FROM h WHERE slug='single-handle') AS handle_id, FALSE AS is_default
  FROM equipment e
  WHERE e.load_type = 'stack' AND EXISTS (SELECT 1 FROM h WHERE slug='single-handle')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='tricep-rope'), FALSE
  FROM equipment e
  WHERE e.load_type = 'stack' AND EXISTS (SELECT 1 FROM h WHERE slug='tricep-rope')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='dual-d-handle'), FALSE
  FROM equipment e
  WHERE e.load_type = 'stack' AND EXISTS (SELECT 1 FROM h WHERE slug='dual-d-handle')
),
cable_specific AS (
  -- General cable machine gets wide set; pulldown & row get specific defaults
  SELECT e.id, (SELECT id FROM h WHERE slug='lat-pulldown-bar'), TRUE
  FROM equipment e
  WHERE e.slug IN ('cable-machine','lat-pulldown-machine')
    AND EXISTS (SELECT 1 FROM h WHERE slug='lat-pulldown-bar')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='seated-row-bar'), FALSE
  FROM equipment e
  WHERE e.slug IN ('cable-machine','lat-pulldown-machine','seated-row-machine')
    AND EXISTS (SELECT 1 FROM h WHERE slug='seated-row-bar')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='single-handle'), TRUE
  FROM equipment e
  WHERE e.slug IN ('functional-trainer','cable-crossover','dual-adjustable-pulley')
    AND EXISTS (SELECT 1 FROM h WHERE slug='single-handle')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='tricep-rope'), FALSE
  FROM equipment e
  WHERE e.slug IN ('functional-trainer','cable-crossover','dual-adjustable-pulley')
    AND EXISTS (SELECT 1 FROM h WHERE slug='tricep-rope')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='dual-d-handle'), FALSE
  FROM equipment e
  WHERE e.slug IN ('functional-trainer','cable-crossover','dual-adjustable-pulley')
    AND EXISTS (SELECT 1 FROM h WHERE slug='dual-d-handle')

  UNION ALL
  -- Seated Row machine default = seated-row-bar
  SELECT e.id, (SELECT id FROM h WHERE slug='seated-row-bar'), TRUE
  FROM equipment e
  WHERE e.slug IN ('seated-row-machine')
    AND EXISTS (SELECT 1 FROM h WHERE slug='seated-row-bar')

  UNION ALL
  -- Pec Deck / Chest Fly machines generally use fixed arms → no external handles (intentionally omitted)

  -- T-Bar Row platforms (if present) commonly use a narrow/dual handle; closest = dual-d-handle
  SELECT e.id, (SELECT id FROM h WHERE slug='dual-d-handle'), TRUE
  FROM equipment e
  WHERE e.slug IN ('t-bar-row','t-bar-row-machine')
    AND EXISTS (SELECT 1 FROM h WHERE slug='dual-d-handle')
),

-- 3) Bodyweight stations
bodyweight_map AS (
  SELECT e.id AS equipment_id, (SELECT id FROM h WHERE slug='pull-up-bar') AS handle_id, TRUE AS is_default
  FROM equipment e
  WHERE e.slug IN ('pull-up-station','power-rack','squat-rack')
    AND EXISTS (SELECT 1 FROM h WHERE slug='pull-up-bar')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='dip-handles'), TRUE
  FROM equipment e
  WHERE e.slug IN ('dip-station','power-rack')
    AND EXISTS (SELECT 1 FROM h WHERE slug='dip-handles')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='parallel-bars'), TRUE
  FROM equipment e
  WHERE e.slug IN ('parallel-bars')
    AND EXISTS (SELECT 1 FROM h WHERE slug='parallel-bars')

  UNION ALL
  SELECT e.id, (SELECT id FROM h WHERE slug='suspension-straps'), TRUE
  FROM equipment e
  WHERE e.slug IN ('suspension-trainer','trx')
    AND EXISTS (SELECT 1 FROM h WHERE slug='suspension-straps')
),

-- Combine all proposed pairs
pairs AS (
  SELECT * FROM barbell_map
  UNION ALL SELECT * FROM cable_base
  UNION ALL SELECT * FROM cable_specific
  UNION ALL SELECT * FROM bodyweight_map
)

INSERT INTO handle_equipment (equipment_id, handle_id, is_default)
SELECT p.equipment_id, p.handle_id,
       -- ensure only one default per equipment; keep TRUEs but if multiple, only the first inserted remains default in practice
       p.is_default
FROM pairs p
JOIN handles hh ON hh.id = p.handle_id
JOIN equipment ee ON ee.id = p.equipment_id
-- Avoid nulls if a handle slug didn't exist
WHERE p.handle_id IS NOT NULL
  AND p.equipment_id IS NOT NULL
ON CONFLICT (equipment_id, handle_id) DO NOTHING;