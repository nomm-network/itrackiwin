-- Fix missing unique constraints for readiness checkins

-- First, let's see what constraints exist on readiness_checkins
-- Drop any existing problematic indexes
DROP INDEX IF EXISTS ux_readiness_user_workout;
DROP INDEX IF EXISTS ux_readiness_user_date_nullwk;

-- Create the proper unique constraints that match our ON CONFLICT usage
-- For per-workout checkins (when workout_id IS NOT NULL)
CREATE UNIQUE INDEX ux_readiness_user_workout
ON public.readiness_checkins(user_id, workout_id)
WHERE workout_id IS NOT NULL;

-- For daily checkins (when workout_id IS NULL)  
CREATE UNIQUE INDEX ux_readiness_user_date_nullwk
ON public.readiness_checkins(user_id, checkin_date)
WHERE workout_id IS NULL;

-- Also add a regular unique constraint for the primary use case
-- This ensures our ON CONFLICT (user_id, workout_id) works
ALTER TABLE public.readiness_checkins 
ADD CONSTRAINT unique_user_workout 
UNIQUE (user_id, workout_id) DEFERRABLE INITIALLY DEFERRED;