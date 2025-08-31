-- Fix the personal records constraint issue by updating the trigger to handle duplicates properly
-- The issue is that the unique constraint is on (user_id, exercise_id, kind) but the trigger doesn't handle the case
-- where a record already exists but with a different grip_key

-- First, let's check the current constraint
-- The constraint should be on (user_id, exercise_id, kind, grip_key) not just (user_id, exercise_id, kind)

-- Drop the old constraint
ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS personal_records_user_ex_kind_unique;

-- Add the correct constraint that includes grip_key
ALTER TABLE public.personal_records ADD CONSTRAINT personal_records_user_ex_kind_grip_unique 
UNIQUE (user_id, exercise_id, kind, grip_key);