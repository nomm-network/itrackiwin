-- Remove stance category grips since they don't fit with hand grips concept
DELETE FROM public.grips WHERE category = 'stance';

-- Add default_grips column to exercises table to store required grips
ALTER TABLE public.exercises 
ADD COLUMN default_grips JSONB DEFAULT '[]'::jsonb;