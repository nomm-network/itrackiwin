-- Final cleanup: Remove name columns from original tables
ALTER TABLE public.body_parts DROP COLUMN IF EXISTS name;
ALTER TABLE public.equipment DROP COLUMN IF EXISTS name;
ALTER TABLE public.muscle_groups DROP COLUMN IF EXISTS name;
ALTER TABLE public.muscles DROP COLUMN IF EXISTS name;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS name;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS description;
ALTER TABLE public.workout_templates DROP COLUMN IF EXISTS name;