-- Add energisers_taken field to pre_workout_checkins table
ALTER TABLE public.pre_workout_checkins 
ADD COLUMN energisers_taken boolean DEFAULT false;