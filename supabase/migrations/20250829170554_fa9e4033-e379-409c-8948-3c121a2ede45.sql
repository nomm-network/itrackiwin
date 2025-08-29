-- Migration to seed compatibility tables and create basic data

BEGIN;

-- 1) Seed some basic equipment if empty
INSERT INTO public.equipment (id, slug, load_type, equipment_type) VALUES 
  (gen_random_uuid(), 'barbell', 'dual_load', 'free_weight'),
  (gen_random_uuid(), 'dumbbell', 'dual_load', 'free_weight'),
  (gen_random_uuid(), 'cable-machine', 'stack', 'machine'),
  (gen_random_uuid(), 'flat-bench', 'none', 'bench')
ON CONFLICT (slug) DO NOTHING;

-- 2) Seed basic handles if empty
INSERT INTO public.handles (id, slug) VALUES 
  (gen_random_uuid(), 'straight-bar'),
  (gen_random_uuid(), 'ez-curl-bar'),
  (gen_random_uuid(), 'dumbbell-handle'),
  (gen_random_uuid(), 'cable-handle')
ON CONFLICT (slug) DO NOTHING;

-- 3) Seed basic grips if empty  
INSERT INTO public.grips (id, slug, category) VALUES 
  (gen_random_uuid(), 'overhand', 'orientation'),
  (gen_random_uuid(), 'underhand', 'orientation'),
  (gen_random_uuid(), 'neutral', 'orientation'),
  (gen_random_uuid(), 'mixed', 'orientation')
ON CONFLICT (slug) DO NOTHING;

-- 4) Seed handle-equipment compatibility
WITH equipment_data AS (
  SELECT id as equipment_id, slug FROM public.equipment WHERE slug IN ('barbell', 'cable-machine', 'dumbbell')
),
handle_data AS (
  SELECT id as handle_id, slug FROM public.handles WHERE slug IN ('straight-bar', 'ez-curl-bar', 'cable-handle', 'dumbbell-handle')
)
INSERT INTO public.handle_equipment (handle_id, equipment_id, is_default)
SELECT h.handle_id, e.equipment_id, 
  CASE WHEN (h.slug = 'straight-bar' AND e.slug = 'barbell') 
       OR (h.slug = 'cable-handle' AND e.slug = 'cable-machine')
       OR (h.slug = 'dumbbell-handle' AND e.slug = 'dumbbell')
       THEN true ELSE false END as is_default
FROM handle_data h
CROSS JOIN equipment_data e
WHERE (h.slug = 'straight-bar' AND e.slug = 'barbell')
   OR (h.slug = 'ez-curl-bar' AND e.slug = 'barbell')
   OR (h.slug = 'cable-handle' AND e.slug = 'cable-machine')
   OR (h.slug = 'dumbbell-handle' AND e.slug = 'dumbbell')
ON CONFLICT (handle_id, equipment_id) DO NOTHING;

-- 5) Seed handle-grip compatibility (all handles can use all basic grips)
WITH handle_data AS (
  SELECT id as handle_id FROM public.handles WHERE slug IN ('straight-bar', 'ez-curl-bar', 'cable-handle', 'dumbbell-handle')
),
grip_data AS (
  SELECT id as grip_id FROM public.grips WHERE category = 'orientation'
)
INSERT INTO public.handle_grip_compatibility (handle_id, grip_id)
SELECT h.handle_id, g.grip_id
FROM handle_data h
CROSS JOIN grip_data g
ON CONFLICT (handle_id, grip_id) DO NOTHING;

-- 6) Seed equipment-handle-grips (three-way defaults)
WITH equipment_data AS (
  SELECT id as equipment_id, slug as eq_slug FROM public.equipment WHERE slug IN ('barbell', 'cable-machine', 'dumbbell')
),
handle_data AS (
  SELECT id as handle_id, slug as h_slug FROM public.handles WHERE slug IN ('straight-bar', 'ez-curl-bar', 'cable-handle', 'dumbbell-handle')
),
grip_data AS (
  SELECT id as grip_id, slug as g_slug FROM public.grips WHERE category = 'orientation'
)
INSERT INTO public.equipment_handle_grips (equipment_id, handle_id, grip_id, is_default)
SELECT e.equipment_id, h.handle_id, g.grip_id,
  CASE WHEN g.g_slug = 'overhand' THEN true ELSE false END as is_default
FROM equipment_data e
JOIN handle_data h ON (
  (e.eq_slug = 'barbell' AND h.h_slug IN ('straight-bar', 'ez-curl-bar'))
  OR (e.eq_slug = 'cable-machine' AND h.h_slug = 'cable-handle')
  OR (e.eq_slug = 'dumbbell' AND h.h_slug = 'dumbbell-handle')
)
CROSS JOIN grip_data g
ON CONFLICT (equipment_id, handle_id, grip_id) DO NOTHING;

-- 7) Seed exercise default grips for existing exercises
WITH grip_overhand AS (
  SELECT id FROM public.grips WHERE slug = 'overhand' LIMIT 1
)
INSERT INTO public.exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM public.exercises e
CROSS JOIN grip_overhand g
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercise_default_grips edg WHERE edg.exercise_id = e.id
)
LIMIT 10; -- Limit to first 10 exercises to avoid too many insertions

-- 8) Seed equipment translations
WITH equipment_data AS (
  SELECT id, slug FROM public.equipment WHERE slug IN ('barbell', 'dumbbell', 'cable-machine', 'flat-bench')
)
INSERT INTO public.equipment_translations (equipment_id, language_code, name, description)
SELECT 
  e.id,
  'en',
  CASE e.slug
    WHEN 'barbell' THEN 'Barbell'
    WHEN 'dumbbell' THEN 'Dumbbell'
    WHEN 'cable-machine' THEN 'Cable Machine'
    WHEN 'flat-bench' THEN 'Flat Bench'
  END,
  CASE e.slug
    WHEN 'barbell' THEN 'Olympic barbell for compound movements'
    WHEN 'dumbbell' THEN 'Free weight dumbbells for unilateral training'
    WHEN 'cable-machine' THEN 'Cable machine with adjustable resistance'
    WHEN 'flat-bench' THEN 'Flat bench for pressing movements'
  END
FROM equipment_data e
ON CONFLICT (equipment_id, language_code) DO NOTHING;

COMMIT;