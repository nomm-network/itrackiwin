-- Backfill warmup data for existing workout_exercises that are missing it
UPDATE public.workout_exercises 
SET attribute_values_json = jsonb_set(
  COALESCE(attribute_values_json, '{}'::jsonb),
  '{warmup}',
  public.generate_warmup_steps(COALESCE(target_weight_kg, 60))
)
WHERE (attribute_values_json->'warmup') IS NULL;