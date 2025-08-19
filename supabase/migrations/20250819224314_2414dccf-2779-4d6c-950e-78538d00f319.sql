-- Make name field optional in workout_templates since we're using translations
ALTER TABLE public.workout_templates ALTER COLUMN name DROP NOT NULL;