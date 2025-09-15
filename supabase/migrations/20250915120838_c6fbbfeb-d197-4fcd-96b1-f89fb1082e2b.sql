-- Fix the deferrable constraint issue with ON CONFLICT

-- Drop the deferrable constraint that's causing the problem
ALTER TABLE public.readiness_checkins 
DROP CONSTRAINT IF EXISTS unique_user_workout;

-- Create a proper non-deferrable unique constraint for ON CONFLICT
-- This will work with ON CONFLICT (user_id, workout_id)
ALTER TABLE public.readiness_checkins 
ADD CONSTRAINT unique_user_workout 
UNIQUE (user_id, workout_id);