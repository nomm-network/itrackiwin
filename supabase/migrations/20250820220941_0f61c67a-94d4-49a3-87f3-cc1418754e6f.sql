-- PHASE 5: Validations and Constraints + Seed Data
-- Add constraints for workout_sets
ALTER TABLE public.workout_sets
  ADD CONSTRAINT IF NOT EXISTS ck_workout_sets_reps_nonneg 
    CHECK (reps IS NULL OR reps >= 0),
  ADD CONSTRAINT IF NOT EXISTS ck_workout_sets_weight_nonneg 
    CHECK (weight IS NULL OR weight >= 0),
  ADD CONSTRAINT IF NOT EXISTS ck_workout_sets_duration_nonneg 
    CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  ADD CONSTRAINT IF NOT EXISTS ck_workout_sets_distance_nonneg 
    CHECK (distance IS NULL OR distance >= 0),
  ADD CONSTRAINT IF NOT EXISTS ck_workout_sets_rpe_range 
    CHECK (rpe IS NULL OR (rpe >= 0 AND rpe <= 10));

-- Add constraint for metric values
ALTER TABLE public.workout_set_metric_values
  ADD CONSTRAINT IF NOT EXISTS ck_ws_metrics_nonneg
  CHECK (
    COALESCE(int_value, 0) >= 0
    AND COALESCE(numeric_value, 0) >= 0
  );

-- Seed standard metrics
INSERT INTO public.metric_defs (key, label, value_type, unit)
VALUES
  ('incline', 'Incline', 'numeric', '%'),
  ('resistance_level', 'Resistance Level', 'int', 'level'),
  ('speed', 'Speed', 'numeric', 'km/h'),
  ('cadence', 'Cadence', 'int', 'rpm'),
  ('power', 'Power', 'numeric', 'W'),
  ('heart_rate', 'Heart Rate', 'int', 'bpm'),
  ('grade', 'Grade', 'numeric', '%'),
  ('pace', 'Pace', 'numeric', 'min/km'),
  ('stroke_rate', 'Stroke Rate', 'int', 'spm'),
  ('resistance', 'Resistance', 'int', 'level')
ON CONFLICT (key) DO NOTHING;

-- Ensure standard equipment exists (seed if missing)
INSERT INTO public.equipment (slug)
VALUES 
  ('treadmill'),
  ('bike'),
  ('spin-bike'),
  ('rower'),
  ('elliptical'),
  ('stair-climber')
ON CONFLICT DO NOTHING;

-- Map metrics to equipment
-- Treadmill -> incline, speed
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false, 
  CASE md.key 
    WHEN 'incline' THEN 1
    WHEN 'speed' THEN 2
    ELSE 3
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('incline','speed')
WHERE e.slug = 'treadmill'
ON CONFLICT DO NOTHING;

-- Bike/Spin-bike -> resistance_level, cadence, power, speed
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false,
  CASE md.key 
    WHEN 'resistance_level' THEN 1
    WHEN 'cadence' THEN 2
    WHEN 'power' THEN 3
    WHEN 'speed' THEN 4
    ELSE 5
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('resistance_level','cadence','power','speed')
WHERE e.slug IN ('bike', 'spin-bike')
ON CONFLICT DO NOTHING;

-- Rower -> resistance_level, stroke_rate, power
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false,
  CASE md.key 
    WHEN 'resistance_level' THEN 1
    WHEN 'stroke_rate' THEN 2
    WHEN 'power' THEN 3
    ELSE 4
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('resistance_level','stroke_rate','power')
WHERE e.slug = 'rower'
ON CONFLICT DO NOTHING;

-- Elliptical -> resistance_level, cadence
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false,
  CASE md.key 
    WHEN 'resistance_level' THEN 1
    WHEN 'cadence' THEN 2
    ELSE 3
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('resistance_level','cadence')
WHERE e.slug = 'elliptical'
ON CONFLICT DO NOTHING;

-- Stair-climber -> resistance_level, pace
INSERT INTO public.exercise_metric_defs (equipment_id, metric_id, is_required, order_index)
SELECT e.id, md.id, false,
  CASE md.key 
    WHEN 'resistance_level' THEN 1
    WHEN 'pace' THEN 2
    ELSE 3
  END
FROM public.equipment e
JOIN public.metric_defs md ON md.key IN ('resistance_level','pace')
WHERE e.slug = 'stair-climber'
ON CONFLICT DO NOTHING;