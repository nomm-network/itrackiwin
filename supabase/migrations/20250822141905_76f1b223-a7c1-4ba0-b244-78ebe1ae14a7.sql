-- Make set_index nullable so the trigger can set it
ALTER TABLE public.workout_sets ALTER COLUMN set_index DROP NOT NULL;
ALTER TABLE public.workout_sets ALTER COLUMN set_index SET DEFAULT 1;