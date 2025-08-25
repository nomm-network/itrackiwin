-- First drop the slug column since it's generated from name
ALTER TABLE public.exercises DROP COLUMN IF EXISTS slug CASCADE;

-- Now drop the name and description columns
ALTER TABLE public.exercises DROP COLUMN IF EXISTS name CASCADE;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS description CASCADE;