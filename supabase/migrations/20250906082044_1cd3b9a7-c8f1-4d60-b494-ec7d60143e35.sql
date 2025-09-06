-- Add favorite column to workout_templates
ALTER TABLE public.workout_templates 
ADD COLUMN IF NOT EXISTS favorite boolean DEFAULT false;