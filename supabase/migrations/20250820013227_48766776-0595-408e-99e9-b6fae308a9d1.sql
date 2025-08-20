-- Remove name columns from main tables since we'll use translation tables
ALTER TABLE public.body_parts DROP COLUMN IF EXISTS name;
ALTER TABLE public.muscle_groups DROP COLUMN IF EXISTS name;
ALTER TABLE public.muscles DROP COLUMN IF EXISTS name;