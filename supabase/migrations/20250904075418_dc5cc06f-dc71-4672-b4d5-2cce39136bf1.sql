-- Create readiness_logs table to store readiness check-ins
CREATE TABLE IF NOT EXISTS public.readiness_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  energy integer NOT NULL CHECK (energy BETWEEN 1 AND 10),
  sleep_quality integer NOT NULL CHECK (sleep_quality BETWEEN 1 AND 10),
  sleep_hours numeric NOT NULL CHECK (sleep_hours > 0),
  soreness integer NOT NULL CHECK (soreness BETWEEN 1 AND 10),
  stress integer NOT NULL CHECK (stress BETWEEN 1 AND 10),
  illness boolean NOT NULL DEFAULT false,
  alcohol boolean NOT NULL DEFAULT false,
  supplements jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.readiness_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own readiness logs" 
ON public.readiness_logs 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update start_workout to use readiness_logs
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_workout uuid;
  v_readiness_log RECORD;
  v_score numeric := 65; -- default neutral score
  rec RECORD;
  v_base numeric;
  v_base_we uuid;
  v_mult numeric;
  v_target numeric;
  v_est numeric;
  v_steps jsonb;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  INSERT INTO workouts(user_id, started_at, template_id)
  VALUES (v_user, now(), p_template_id)
  RETURNING id INTO v_workout;

  -- Get latest readiness data
  SELECT * INTO v_readiness_log
  FROM readiness_logs
  WHERE user_id = v_user
  ORDER BY created_at DESC
  LIMIT 1;

  -- Compute readiness score if we have data
  IF v_readiness_log IS NOT NULL THEN
    v_score := compute_readiness_score(
      v_readiness_log.energy,
      v_readiness_log.sleep_quality, 
      v_readiness_log.sleep_hours,
      v_readiness_log.soreness,
      v_readiness_log.stress,
      v_readiness_log.illness,
      v_readiness_log.alcohol,
      v_readiness_log.supplements
    );
  END IF;

  UPDATE workouts SET readiness_score = v_score WHERE id = v_workout;

  IF p_template_id IS NOT NULL THEN
    FOR rec IN
      SELECT te.*, e.id AS exercise_id
      FROM template_exercises te
      JOIN exercises e ON e.id = te.exercise_id
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      -- base from last 3 within 60d (prefer high readiness)
      SELECT base_weight, source_workout_exercise_id INTO v_base, v_base_we
      FROM pick_base_load(v_user, rec.exercise_id);

      -- fallback to template target, else user estimates
      IF v_base IS NULL THEN
        v_base := rec.target_weight_kg;
      END IF;

      IF v_base IS NULL THEN
        SELECT ue.estimated_weight::numeric INTO v_est
        FROM user_exercise_estimates ue
        WHERE ue.user_id = v_user AND ue.exercise_id = rec.exercise_id
        ORDER BY updated_at DESC LIMIT 1;
        v_base := v_est;
      END IF;

      v_mult   := readiness_multiplier(v_score);
      v_target := CASE WHEN v_base IS NULL THEN NULL ELSE ROUND(v_base * v_mult, 1) END;

      v_steps  := CASE WHEN v_target IS NULL THEN NULL
                 ELSE generate_warmup_steps(v_target) END;

      INSERT INTO workout_exercises(
        workout_id, exercise_id, order_index,
        target_sets, target_reps, target_weight_kg, weight_unit,
        notes, readiness_adjusted_from, attribute_values_json
      ) VALUES (
        v_workout, rec.exercise_id, rec.order_index,
        rec.default_sets, rec.target_reps, v_target, COALESCE(rec.weight_unit,'kg'),
        rec.notes, v_base_we,
        COALESCE(jsonb_build_object('warmup', v_steps), '{}'::jsonb)
      );
    END LOOP;
  END IF;

  RETURN v_workout;
END$$;