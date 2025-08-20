-- PHASE 5: Validations and Constraints + Seed Data (Fixed syntax)
-- Add constraints for workout_sets (one by one to avoid syntax issues)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_workout_sets_reps_nonneg') THEN
    ALTER TABLE public.workout_sets ADD CONSTRAINT ck_workout_sets_reps_nonneg 
      CHECK (reps IS NULL OR reps >= 0);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_workout_sets_weight_nonneg') THEN
    ALTER TABLE public.workout_sets ADD CONSTRAINT ck_workout_sets_weight_nonneg 
      CHECK (weight IS NULL OR weight >= 0);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_workout_sets_duration_nonneg') THEN
    ALTER TABLE public.workout_sets ADD CONSTRAINT ck_workout_sets_duration_nonneg 
      CHECK (duration_seconds IS NULL OR duration_seconds >= 0);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_workout_sets_distance_nonneg') THEN
    ALTER TABLE public.workout_sets ADD CONSTRAINT ck_workout_sets_distance_nonneg 
      CHECK (distance IS NULL OR distance >= 0);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_workout_sets_rpe_range') THEN
    ALTER TABLE public.workout_sets ADD CONSTRAINT ck_workout_sets_rpe_range 
      CHECK (rpe IS NULL OR (rpe >= 0 AND rpe <= 10));
  END IF;
END$$;

-- Add constraint for metric values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_ws_metrics_nonneg') THEN
    ALTER TABLE public.workout_set_metric_values ADD CONSTRAINT ck_ws_metrics_nonneg
    CHECK (
      COALESCE(int_value, 0) >= 0
      AND COALESCE(numeric_value, 0) >= 0
    );
  END IF;
END$$;

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