-- Add slug column to exercises table
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug (allows NULL values but requires uniqueness when not NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_slug_unique 
ON public.exercises(slug) WHERE slug IS NOT NULL;

-- Backfill slug from exercise translations where possible
UPDATE public.exercises e
SET slug = lower(regexp_replace(regexp_replace(t.name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
FROM public.exercises_translations t
WHERE t.exercise_id = e.id
  AND t.language_code = 'en'
  AND e.slug IS NULL
  AND t.name IS NOT NULL;