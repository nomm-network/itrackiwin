-- ==========================================
-- PREREQUISITE FIXES - FINAL VERSION
-- ==========================================

-- 1) Add slug column to exercises if missing
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS slug text;

-- 2) Add unique constraints for translation tables
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

-- 3) Seed body parts with slugs (only if empty)
INSERT INTO public.body_parts (id, slug) 
SELECT gen_random_uuid(), slug FROM (VALUES
  ('chest'),
  ('back'),
  ('shoulders'),
  ('arms'),
  ('legs'),
  ('glutes'),
  ('calves'),
  ('core')
) AS v(slug)
WHERE NOT EXISTS (SELECT 1 FROM public.body_parts WHERE body_parts.slug = v.slug);

-- 4) Seed equipment with proper load types (only if empty)
INSERT INTO public.equipment (id, slug, load_type, load_medium, equipment_type)
SELECT gen_random_uuid(), slug, load_type::load_type, load_medium::load_medium, equipment_type FROM (VALUES
  ('barbell', 'dual_load', 'bar', 'free_weight'),
  ('dumbbell', 'single_load', 'other', 'free_weight'),
  ('cable', 'stack', 'stack', 'machine'),
  ('machine', 'single_load', 'other', 'machine'),
  ('smith_machine', 'dual_load', 'bar', 'machine'),
  ('bodyweight', 'none', 'other', 'bodyweight'),
  ('ez_bar', 'dual_load', 'bar', 'free_weight'),
  ('t_bar', 'single_load', 'bar', 'free_weight'),
  ('landmine', 'single_load', 'bar', 'free_weight')
) AS v(slug, load_type, load_medium, equipment_type)
WHERE NOT EXISTS (SELECT 1 FROM public.equipment WHERE equipment.slug = v.slug);

-- 5) Seed grips with categories (only if empty)
INSERT INTO public.grips (id, slug, category)
SELECT gen_random_uuid(), slug, category FROM (VALUES
  ('overhand', 'pronated'),
  ('underhand', 'supinated'),
  ('neutral', 'neutral'),
  ('overhand_wide', 'pronated'),
  ('overhand_close', 'pronated'),
  ('rope_neutral', 'neutral')
) AS v(slug, category)
WHERE NOT EXISTS (SELECT 1 FROM public.grips WHERE grips.slug = v.slug);

-- 6) Seed handles with correct categories (only if empty)
DO $$
BEGIN
  IF to_regclass('public.handles') IS NOT NULL THEN
    INSERT INTO public.handles (id, slug, category)
    SELECT gen_random_uuid(), slug, category FROM (VALUES
      ('straight_bar', 'bar'),
      ('ez_bar', 'ez-bar'),
      ('v_handle', 'v-bar'),
      ('triangle_handle', 'triangle'),
      ('rope', 'rope'),
      ('single_d_handle', 'd-handle')
    ) AS v(slug, category)
    WHERE NOT EXISTS (SELECT 1 FROM public.handles WHERE handles.slug = v.slug);
  END IF;
END$$;

-- 7) Add basic translations for English
-- Body parts translations
INSERT INTO public.body_parts_translations (body_part_id, language_code, name)
SELECT bp.id, 'en', 
  CASE bp.slug
    WHEN 'chest' THEN 'Chest'
    WHEN 'back' THEN 'Back'
    WHEN 'shoulders' THEN 'Shoulders'
    WHEN 'arms' THEN 'Arms'
    WHEN 'legs' THEN 'Legs'
    WHEN 'glutes' THEN 'Glutes'
    WHEN 'calves' THEN 'Calves'
    WHEN 'core' THEN 'Core'
    ELSE initcap(replace(bp.slug, '_', ' '))
  END
FROM public.body_parts bp
WHERE NOT EXISTS (
  SELECT 1 FROM public.body_parts_translations bpt 
  WHERE bpt.body_part_id = bp.id AND bpt.language_code = 'en'
);

-- Equipment translations
INSERT INTO public.equipment_translations (equipment_id, language_code, name)
SELECT eq.id, 'en',
  CASE eq.slug
    WHEN 'barbell' THEN 'Barbell'
    WHEN 'dumbbell' THEN 'Dumbbell'
    WHEN 'cable' THEN 'Cable Machine'
    WHEN 'machine' THEN 'Machine'
    WHEN 'smith_machine' THEN 'Smith Machine'
    WHEN 'bodyweight' THEN 'Bodyweight'
    WHEN 'ez_bar' THEN 'EZ Bar'
    WHEN 't_bar' THEN 'T-Bar'
    WHEN 'landmine' THEN 'Landmine'
    ELSE initcap(replace(eq.slug, '_', ' '))
  END
FROM public.equipment eq
WHERE NOT EXISTS (
  SELECT 1 FROM public.equipment_translations eqt 
  WHERE eqt.equipment_id = eq.id AND eqt.language_code = 'en'
);

-- Grips translations
INSERT INTO public.grips_translations (grip_id, language_code, name)
SELECT gr.id, 'en',
  CASE gr.slug
    WHEN 'overhand' THEN 'Overhand'
    WHEN 'underhand' THEN 'Underhand'
    WHEN 'neutral' THEN 'Neutral'
    WHEN 'overhand_wide' THEN 'Wide Overhand'
    WHEN 'overhand_close' THEN 'Close Overhand'
    WHEN 'rope_neutral' THEN 'Rope Neutral'
    ELSE initcap(replace(gr.slug, '_', ' '))
  END
FROM public.grips gr
WHERE NOT EXISTS (
  SELECT 1 FROM public.grips_translations grt 
  WHERE grt.grip_id = gr.id AND grt.language_code = 'en'
);

-- Handles translations (if table exists)
DO $$
BEGIN
  IF to_regclass('public.handles') IS NOT NULL AND to_regclass('public.handle_translations') IS NOT NULL THEN
    INSERT INTO public.handle_translations (handle_id, language_code, name)
    SELECT h.id, 'en',
      CASE h.slug
        WHEN 'straight_bar' THEN 'Straight Bar'
        WHEN 'ez_bar' THEN 'EZ Bar'
        WHEN 'v_handle' THEN 'V Handle'
        WHEN 'triangle_handle' THEN 'Triangle Handle'
        WHEN 'rope' THEN 'Rope'
        WHEN 'single_d_handle' THEN 'Single D Handle'
        ELSE initcap(replace(h.slug, '_', ' '))
      END
    FROM public.handles h
    WHERE NOT EXISTS (
      SELECT 1 FROM public.handle_translations ht 
      WHERE ht.handle_id = h.id AND ht.language_code = 'en'
    );
  END IF;
END$$;