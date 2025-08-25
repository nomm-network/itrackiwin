-- Now that translations are in place, remove the name and description columns from exercises table
ALTER TABLE public.exercises DROP COLUMN IF EXISTS name;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS description;