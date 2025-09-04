-- Add attribute_values_json column back to workout_exercises table
ALTER TABLE public.workout_exercises 
ADD COLUMN attribute_values_json jsonb DEFAULT '{}'::jsonb;