-- ================================
-- Add popular equipment (no handles) + grip defaults
-- Equipment slugs added:
--   rope-cable-machine, pec-deck-machine, assisted-pullup-dip-machine, leg-extension-machine
-- Grips expected: overhand | underhand | neutral | mixed  (in grips.slug)
-- Tables expected: equipment, equipment_translations, equipment_grip_defaults (equipment_id, grip_id, is_default)
-- ================================

-- 1) Insert equipment (id auto-generates). Uses typical selectorized stacks.
WITH s AS (
  SELECT
    '[5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100]'::jsonb AS stack
)
INSERT INTO public.equipment (
  slug, created_at, equipment_type, kind, notes,
  load_type, load_medium, default_stack
)
SELECT e.slug, now(), e.equipment_type, e.kind, e.notes,
       e.load_type::load_type, e.load_medium::load_medium, s.stack
FROM s
CROSS JOIN LATERAL (VALUES
  -- Rope Cable Machine (selectorized)
  ('rope-cable-machine',       'machine', 'cable_machine', 'Selectorized cable column typically used with rope attachment.', 'stack', 'stack'),
  -- Pec Deck / Chest Fly Machine
  ('pec-deck-machine',         'machine', 'selectorized',  'Chest fly machine (pec deck / rear delt fly variants).',         'stack', 'stack'),
  -- Assisted Pull-Up / Dip Machine
  ('assisted-pullup-dip-machine','machine','selectorized','Assisted pull-up and dip combo with weight stack.',               'stack', 'stack'),
  -- Leg Extension Machine
  ('leg-extension-machine',    'machine', 'selectorized',  'Knee extension machine (quadriceps).',                            'stack', 'stack')
) AS e(slug, equipment_type, kind, notes, load_type, load_medium)
ON CONFLICT (slug) DO NOTHING;

-- 2) Insert basic EN translations (safe to run multiple times)
INSERT INTO public.equipment_translations (equipment_id, language_code, name, description)
SELECT eq.id, 'en',
       CASE eq.slug
         WHEN 'rope-cable-machine'         THEN 'Rope Cable Machine'
         WHEN 'pec-deck-machine'           THEN 'Pec Deck Machine'
         WHEN 'assisted-pullup-dip-machine'THEN 'Assisted Pull-Up/Dip Machine'
         WHEN 'leg-extension-machine'      THEN 'Leg Extension Machine'
       END,
       CASE eq.slug
         WHEN 'rope-cable-machine'         THEN 'Selectorized cable column; commonly used for triceps pressdowns, face pulls, and rope curls.'
         WHEN 'pec-deck-machine'           THEN 'Chest fly machine (pec deck); some models also support rear-delt fly.'
         WHEN 'assisted-pullup-dip-machine'THEN 'Weight-stack machine that assists pull-ups and dips for scalable difficulty.'
         WHEN 'leg-extension-machine'      THEN 'Quadriceps isolation machine with selectorized stack.'
       END
FROM public.equipment eq
WHERE eq.slug IN (
  'rope-cable-machine','pec-deck-machine','assisted-pullup-dip-machine','leg-extension-machine'
)
ON CONFLICT (equipment_id, language_code) DO NOTHING;

-- 3) Configure allowed/default grips per equipment
--    equipment_grip_defaults(equipment_id, grip_id, is_default)
--    We keep it realistic and minimal (no silly grips on leg extension).
WITH
eq AS (
  SELECT id, slug FROM public.equipment
  WHERE slug IN ('rope-cable-machine','pec-deck-machine','assisted-pullup-dip-machine','leg-extension-machine')
),
g AS (
  SELECT id, slug FROM public.grips
  WHERE slug IN ('overhand','underhand','neutral','mixed')
),
pairs AS (
  -- Rope Cable Machine: allow neutral (default), overhand, underhand
  SELECT (SELECT id FROM eq WHERE slug='rope-cable-machine')       AS equipment_id,
         (SELECT id FROM g  WHERE slug='neutral')                  AS grip_id, true  AS is_default
  UNION ALL
  SELECT (SELECT id FROM eq WHERE slug='rope-cable-machine'),
         (SELECT id FROM g  WHERE slug='overhand'),                false
  UNION ALL
  SELECT (SELECT id FROM eq WHERE slug='rope-cable-machine'),
         (SELECT id FROM g  WHERE slug='underhand'),               false

  UNION ALL
  -- Pec Deck Machine: neutral default (handle orientation is neutral on most pec decks)
  SELECT (SELECT id FROM eq WHERE slug='pec-deck-machine'),
         (SELECT id FROM g  WHERE slug='neutral'),                 true

  UNION ALL
  -- Assisted Pull-Up/Dip: overhand default; also allow underhand and neutral
  SELECT (SELECT id FROM eq WHERE slug='assisted-pullup-dip-machine'),
         (SELECT id FROM g  WHERE slug='overhand'),                true
  UNION ALL
  SELECT (SELECT id FROM eq WHERE slug='assisted-pullup-dip-machine'),
         (SELECT id FROM g  WHERE slug='underhand'),               false
  UNION ALL
  SELECT (SELECT id FROM eq WHERE slug='assisted-pullup-dip-machine'),
         (SELECT id FROM g  WHERE slug='neutral'),                 false

  UNION ALL
  -- Leg Extension Machine: grip is irrelevant; keep neutral only to avoid noise
  SELECT (SELECT id FROM eq WHERE slug='leg-extension-machine'),
         (SELECT id FROM g  WHERE slug='neutral'),                 true
)
INSERT INTO public.equipment_grip_defaults (equipment_id, grip_id, is_default)
SELECT equipment_id, grip_id, is_default
FROM pairs
WHERE equipment_id IS NOT NULL AND grip_id IS NOT NULL
ON CONFLICT DO NOTHING;