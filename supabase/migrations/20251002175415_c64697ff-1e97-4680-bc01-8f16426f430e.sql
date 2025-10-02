-- Add columns to user_exercise_preferences for persisting settings
ALTER TABLE public.user_exercise_preferences
ADD COLUMN IF NOT EXISTS preferred_target_sets integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS preferred_grip_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unilateral_enabled boolean DEFAULT false;