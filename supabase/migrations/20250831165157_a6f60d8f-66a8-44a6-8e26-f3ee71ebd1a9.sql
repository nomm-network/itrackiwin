-- Fix personal records constraint to include grip_key for grip-aware PR tracking
-- Drop the old constraint
ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique;

-- Add new constraint that includes grip_key 
ALTER TABLE public.personal_records ADD CONSTRAINT personal_records_user_ex_kind_grip_unique 
  UNIQUE (user_id, exercise_id, kind, grip_key);