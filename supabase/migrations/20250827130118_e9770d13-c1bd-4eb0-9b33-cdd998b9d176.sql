-- =====================================================
-- WORKOUT CATALOG CLEANUP: SCHEMA MIGRATION (Step 2) - FIXED
-- =====================================================

-- 2.1 Add slug to exercises (canonical key, required)
-- =================================================

-- 1) Add column if missing
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS slug text;

-- 2) Create slugify helper function (improved version)
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT
    CASE
      WHEN txt IS NULL OR btrim(txt) = '' THEN NULL
      ELSE
        -- normalize: lower, remove accents, replace non-alnum with hyphens, squeeze repeats, trim
        btrim(
          regexp_replace(
            regexp_replace(
              lower(unaccent(txt)),
              '[^a-z0-9]+', '-', 'g'
            ),
            '-{2,}', '-', 'g'
          ),
          '-'
        )
    END
$$;

-- 3) Populate slug from EN translation (fallback: first translation) - FIXED
UPDATE exercises 
SET slug = slugify(
  COALESCE(
    (SELECT et.name FROM exercises_translations et 
     WHERE et.exercise_id = exercises.id AND et.language_code = 'en' LIMIT 1),
    (SELECT et.name FROM exercises_translations et 
     WHERE et.exercise_id = exercises.id ORDER BY et.language_code LIMIT 1)
  )
)
WHERE slug IS NULL OR slug = '';

-- 4) Enforce uniqueness (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_exercises_slug
  ON public.exercises (lower(slug));

-- 2.2 Remove/retire legacy "name" columns
-- ========================================

-- Rename legacy name columns to avoid runtime crashes
DO $$
BEGIN
  -- Exercises
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='exercises' AND column_name='name'
  ) THEN
    ALTER TABLE public.exercises RENAME COLUMN name TO name__deprecated;
  END IF;
  
  -- Equipment
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='equipment' AND column_name='name'
  ) THEN
    ALTER TABLE public.equipment RENAME COLUMN name TO name__deprecated;
  END IF;
  
  -- Handles
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='handles' AND column_name='name'
  ) THEN
    ALTER TABLE public.handles RENAME COLUMN name TO name__deprecated;
  END IF;
  
  -- Grips
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='grips' AND column_name='name'
  ) THEN
    ALTER TABLE public.grips RENAME COLUMN name TO name__deprecated;
  END IF;
END $$;

-- 2.3 Template exercise → add optional handle & default grips
-- ===========================================================

-- Handle selected per template exercise instance
ALTER TABLE public.template_exercises
  ADD COLUMN IF NOT EXISTS handle_id uuid 
  REFERENCES public.handles(id);

-- Store fixed set of grip ids as array for template exercise
ALTER TABLE public.template_exercises
  ADD COLUMN IF NOT EXISTS grip_ids uuid[];

-- 2.4 Workout exercise → record actual chosen handle/grips/bar meta
-- ================================================================

-- Add handle selection
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS handle_id uuid 
  REFERENCES public.handles(id);

-- Add grip selection array
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS grip_ids uuid[];

-- Add bar type reference
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS bar_type_id uuid 
  REFERENCES public.bar_types(id);

-- Add load type (reuse existing enum)
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS load_type load_type;

-- Add per-side weight for dual-loaded exercises
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS per_side_weight numeric;