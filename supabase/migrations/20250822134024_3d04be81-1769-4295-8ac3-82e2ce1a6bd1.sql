-- Make most workout_sets columns nullable to simplify inserts
ALTER TABLE public.workout_sets 
ALTER COLUMN weight_unit DROP NOT NULL,
ALTER COLUMN is_completed DROP NOT NULL,
ALTER COLUMN set_kind DROP NOT NULL,
ALTER COLUMN had_pain DROP NOT NULL;

-- Set default values for the columns
ALTER TABLE public.workout_sets 
ALTER COLUMN weight_unit SET DEFAULT 'kg',
ALTER COLUMN is_completed SET DEFAULT true,
ALTER COLUMN set_kind SET DEFAULT 'normal',
ALTER COLUMN had_pain SET DEFAULT false;