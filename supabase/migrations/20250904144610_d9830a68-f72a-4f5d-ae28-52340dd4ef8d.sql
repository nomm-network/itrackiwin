-- Add storage for warm-up/etc. attributes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='workout_exercises' AND column_name='attribute_values_json'
  ) THEN
    ALTER TABLE public.workout_exercises
      ADD COLUMN attribute_values_json jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='template_exercises' AND column_name='attribute_values_json'
  ) THEN
    ALTER TABLE public.template_exercises
      ADD COLUMN attribute_values_json jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END$$;