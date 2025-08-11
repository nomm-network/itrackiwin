-- Add body_part to categorize exercises by high-level muscle group (e.g., back, biceps)
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS body_part text;

-- Index for quick filtering by group
CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON public.exercises (body_part);
