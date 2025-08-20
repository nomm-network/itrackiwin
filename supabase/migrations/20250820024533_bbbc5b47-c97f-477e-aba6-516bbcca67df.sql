-- Update exercises table to use secondary muscle groups instead of muscles
ALTER TABLE public.exercises 
DROP COLUMN IF EXISTS secondary_muscle_ids;

ALTER TABLE public.exercises 
ADD COLUMN secondary_muscle_group_ids uuid[] DEFAULT NULL;