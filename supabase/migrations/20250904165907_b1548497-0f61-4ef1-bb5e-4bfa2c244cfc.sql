-- Ensure column exists and warmups are initialized
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS attribute_values_json jsonb DEFAULT '{}'::jsonb;

-- For any workout_exercises with a target, populate warmup if missing
UPDATE public.workout_exercises we
SET attribute_values_json = jsonb_set(
      coalesce(we.attribute_values_json,'{}'::jsonb),
      '{warmup}',
      generate_warmup_steps(we.target_weight_kg)
    )
WHERE we.target_weight_kg IS NOT NULL
  AND (we.attribute_values_json->'warmup') IS NULL;