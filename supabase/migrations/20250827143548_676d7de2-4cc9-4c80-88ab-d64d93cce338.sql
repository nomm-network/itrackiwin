-- ==========================================
-- PREREQUISITE FIXES FOR EXERCISE SEEDING (CORRECTED)
-- ==========================================

-- 1) Create system user profile for owning exercises
-- The profiles table has both id and user_id, so we use the same UUID for both
INSERT INTO public.profiles (id, user_id, display_name, username)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  '00000000-0000-0000-0000-000000000000', 
  'System', 
  'system'
)
ON CONFLICT (id) DO NOTHING;

-- 2) Add slug column to exercises if missing
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS slug text;

-- 3) Add unique constraints for translation tables
DO $$
BEGIN
  -- exercises_translations
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'exercises_translations_exercise_id_language_code_key'
  ) THEN
    ALTER TABLE public.exercises_translations
      ADD CONSTRAINT exercises_translations_exercise_id_language_code_key
      UNIQUE (exercise_id, language_code);
  END IF;

  -- body_parts_translations
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'body_parts_translations_body_part_id_language_code_key'
  ) THEN
    ALTER TABLE public.body_parts_translations
      ADD CONSTRAINT body_parts_translations_body_part_id_language_code_key
      UNIQUE (body_part_id, language_code);
  END IF;

  -- equipment_translations
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'equipment_translations_equipment_id_language_code_key'
  ) THEN
    ALTER TABLE public.equipment_translations
      ADD CONSTRAINT equipment_translations_equipment_id_language_code_key
      UNIQUE (equipment_id, language_code);
  END IF;

  -- grips_translations
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'grips_translations_grip_id_language_code_key'
  ) THEN
    ALTER TABLE public.grips_translations
      ADD CONSTRAINT grips_translations_grip_id_language_code_key
      UNIQUE (grip_id, language_code);
  END IF;
END$$;

-- 4) Seed body parts with slugs
INSERT INTO public.body_parts (id, slug) VALUES
  (gen_random_uuid(), 'chest'),
  (gen_random_uuid(), 'back'),
  (gen_random_uuid(), 'shoulders'),
  (gen_random_uuid(), 'arms'),
  (gen_random_uuid(), 'legs'),
  (gen_random_uuid(), 'glutes'),
  (gen_random_uuid(), 'calves'),
  (gen_random_uuid(), 'core')
ON CONFLICT (slug) DO NOTHING;

-- 5) Seed equipment with proper load types
INSERT INTO public.equipment (id, slug, load_type, load_medium, equipment_type) VALUES
  (gen_random_uuid(), 'barbell', 'dual_load', 'bar', 'free_weight'),
  (gen_random_uuid(), 'dumbbell', 'single_load', 'other', 'free_weight'),
  (gen_random_uuid(), 'cable', 'stack', 'stack', 'machine'),
  (gen_random_uuid(), 'machine', 'single_load', 'other', 'machine'),
  (gen_random_uuid(), 'smith_machine', 'dual_load', 'bar', 'machine'),
  (gen_random_uuid(), 'bodyweight', 'none', 'other', 'bodyweight'),
  (gen_random_uuid(), 'ez_bar', 'dual_load', 'bar', 'free_weight'),
  (gen_random_uuid(), 't_bar', 'single_load', 'bar', 'free_weight'),
  (gen_random_uuid(), 'landmine', 'single_load', 'bar', 'free_weight')
ON CONFLICT (slug) DO NOTHING;

-- 6) Seed grips with categories
INSERT INTO public.grips (id, slug, category) VALUES
  (gen_random_uuid(), 'overhand', 'pronated'),
  (gen_random_uuid(), 'underhand', 'supinated'),
  (gen_random_uuid(), 'neutral', 'neutral'),
  (gen_random_uuid(), 'overhand_wide', 'pronated'),
  (gen_random_uuid(), 'overhand_close', 'pronated'),
  (gen_random_uuid(), 'rope_neutral', 'neutral')
ON CONFLICT (slug) DO NOTHING;

-- 7) Seed handles if table exists
DO $$
BEGIN
  IF to_regclass('public.handles') IS NOT NULL THEN
    INSERT INTO public.handles (id, slug, category) VALUES
      (gen_random_uuid(), 'straight_bar', 'bar'),
      (gen_random_uuid(), 'ez_bar', 'bar'),
      (gen_random_uuid(), 'v_handle', 'attachment'),
      (gen_random_uuid(), 'triangle_handle', 'attachment'),
      (gen_random_uuid(), 'rope', 'attachment'),
      (gen_random_uuid(), 'single_d_handle', 'attachment')
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END$$;

-- 8) Add basic translations for English
WITH bp_ids AS (
  SELECT id, slug FROM public.body_parts
)
INSERT INTO public.body_parts_translations (body_part_id, language_code, name) 
SELECT id, 'en', 
  CASE slug
    WHEN 'chest' THEN 'Chest'
    WHEN 'back' THEN 'Back'
    WHEN 'shoulders' THEN 'Shoulders'
    WHEN 'arms' THEN 'Arms'
    WHEN 'legs' THEN 'Legs'
    WHEN 'glutes' THEN 'Glutes'
    WHEN 'calves' THEN 'Calves'
    WHEN 'core' THEN 'Core'
    ELSE initcap(replace(slug, '_', ' '))
  END
FROM bp_ids
ON CONFLICT (body_part_id, language_code) DO NOTHING;

WITH eq_ids AS (
  SELECT id, slug FROM public.equipment
)
INSERT INTO public.equipment_translations (equipment_id, language_code, name)
SELECT id, 'en',
  CASE slug
    WHEN 'barbell' THEN 'Barbell'
    WHEN 'dumbbell' THEN 'Dumbbell'
    WHEN 'cable' THEN 'Cable Machine'
    WHEN 'machine' THEN 'Machine'
    WHEN 'smith_machine' THEN 'Smith Machine'
    WHEN 'bodyweight' THEN 'Bodyweight'
    WHEN 'ez_bar' THEN 'EZ Bar'
    WHEN 't_bar' THEN 'T-Bar'
    WHEN 'landmine' THEN 'Landmine'
    ELSE initcap(replace(slug, '_', ' '))
  END
FROM eq_ids
ON CONFLICT (equipment_id, language_code) DO NOTHING;

WITH gr_ids AS (
  SELECT id, slug FROM public.grips
)
INSERT INTO public.grips_translations (grip_id, language_code, name)
SELECT id, 'en',
  CASE slug
    WHEN 'overhand' THEN 'Overhand'
    WHEN 'underhand' THEN 'Underhand'
    WHEN 'neutral' THEN 'Neutral'
    WHEN 'overhand_wide' THEN 'Wide Overhand'
    WHEN 'overhand_close' THEN 'Close Overhand'
    WHEN 'rope_neutral' THEN 'Rope Neutral'
    ELSE initcap(replace(slug, '_', ' '))
  END
FROM gr_ids
ON CONFLICT (grip_id, language_code) DO NOTHING;