-- Extend existing user_exercise_warmups table with new columns for warmup policy
ALTER TABLE public.user_exercise_warmups 
ADD COLUMN IF NOT EXISTS preferred_set_count INTEGER,
ADD COLUMN IF NOT EXISTS preferred_intensity_adjustment NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS adaptation_history JSONB DEFAULT '[]'::jsonb;

-- Add index for the new columns (without USING GIN syntax for JSONB)
CREATE INDEX IF NOT EXISTS idx_user_exercise_warmups_adaptation 
ON public.user_exercise_warmups USING GIN(adaptation_history);