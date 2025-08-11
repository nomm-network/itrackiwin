-- Ensure new columns exist on exercises
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS popularity_rank integer;

-- Helpful composite index for public search/sort by popularity then name
CREATE INDEX IF NOT EXISTS idx_exercises_public_popularity
  ON public.exercises (is_public DESC, popularity_rank ASC, name ASC);