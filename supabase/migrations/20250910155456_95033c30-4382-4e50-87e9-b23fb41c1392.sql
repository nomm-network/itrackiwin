-- Phase 1: Smart warm-up function based on muscle groups already warmed
CREATE OR REPLACE FUNCTION public.fn_warmup_sets_for_exercise(p_workout_exercise_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_we RECORD;
  v_primary_body_part_id uuid;
  v_done_same_primary int := 0;
  v_seen_as_secondary int := 0;
BEGIN
  -- Get current workout exercise details
  SELECT we.workout_id, we.exercise_id, we.order_index
  INTO v_we
  FROM workout_exercises we
  WHERE we.id = p_workout_exercise_id;

  IF v_we IS NULL THEN
    RETURN 3; -- Default fallback
  END IF;

  -- Get the primary muscle's body part (our grouping level)
  SELECT mg.body_part_id
  INTO v_primary_body_part_id
  FROM exercises e
  JOIN muscle_groups mg ON mg.id = e.primary_muscle_id
  WHERE e.id = v_we.exercise_id;

  IF v_primary_body_part_id IS NULL THEN
    RETURN 3; -- Default if no muscle group found
  END IF;

  -- Count prior exercises in this workout that hit the SAME body part as primary
  SELECT COUNT(*)
  INTO v_done_same_primary
  FROM workout_exercises we2
  JOIN exercises e2 ON e2.id = we2.exercise_id
  JOIN muscle_groups mg2 ON mg2.id = e2.primary_muscle_id
  WHERE we2.workout_id = v_we.workout_id
    AND we2.order_index < v_we.order_index
    AND mg2.body_part_id = v_primary_body_part_id;

  -- For now, we'll skip secondary muscle detection since the table doesn't exist yet
  -- This can be added later when secondary muscle tracking is implemented

  -- Decision tree based on primary muscle group usage
  IF v_done_same_primary >= 2 THEN
    RETURN 1; -- 3rd+ exercise for same body part
  ELSIF v_done_same_primary = 1 THEN
    RETURN 2; -- 2nd exercise for same body part  
  ELSE
    RETURN 3; -- First exercise for this body part
  END IF;
END;
$$;

-- Phase 2: Readiness-adapted target calculation
CREATE OR REPLACE FUNCTION public.fn_next_target_for_exercise(
  p_exercise_id uuid,
  p_prev_weight_kg numeric,
  p_prev_reps integer,
  p_target_reps integer,
  p_readiness_prev integer,   -- 0..100
  p_readiness_today integer   -- 0..100
) 
RETURNS TABLE(next_weight_kg numeric, next_reps integer, bump_pct numeric)
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_pct   numeric := 0.010;                              -- +1.0% base progression
  delta_r    integer := p_readiness_today - p_readiness_prev;   -- can be negative
  delta_pct  numeric := delta_r * 0.001;                    -- ±0.10% per readiness point
  raw_pct    numeric := base_pct + delta_pct;
  min_pct    numeric := CASE WHEN delta_r < -10 THEN -0.020 ELSE 0.000 END; -- floor
  max_pct    numeric := 0.035;                              -- ceiling
  applied_pct numeric := LEAST(GREATEST(raw_pct, min_pct), max_pct);
  proposed_weight numeric := p_prev_weight_kg * (1 + applied_pct);
  output_reps integer := p_prev_reps;
BEGIN
  -- Handle null inputs with sensible defaults
  IF p_prev_weight_kg IS NULL OR p_prev_weight_kg <= 0 THEN
    RETURN QUERY SELECT 20.0::numeric, COALESCE(p_target_reps, 8), 0.0::numeric;
    RETURN;
  END IF;
  
  IF p_prev_reps IS NULL OR p_prev_reps <= 0 THEN
    output_reps := COALESCE(p_target_reps, 8);
  END IF;

  -- Rep progression first if under target
  IF output_reps < COALESCE(p_target_reps, 8) THEN
    output_reps := output_reps + 1;
    -- Keep weight same or tiny bump (half of applied_pct)
    proposed_weight := p_prev_weight_kg * (1 + GREATEST(applied_pct * 0.5, 0));
  END IF;

  -- Round weight to nearest 0.5kg for practical gym use
  proposed_weight := ROUND(proposed_weight * 2) / 2;

  RETURN QUERY SELECT proposed_weight, output_reps, applied_pct;
END;
$$;

-- Helper function to get last readiness for an exercise
CREATE OR REPLACE FUNCTION public.fn_last_readiness_for_exercise(
  p_user_id uuid,
  p_exercise_id uuid
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_readiness integer;
BEGIN
  -- Find the most recent completed workout that contained this exercise
  SELECT w.readiness_score
  INTO v_last_readiness
  FROM workouts w
  JOIN workout_exercises we ON we.workout_id = w.id
  WHERE w.user_id = p_user_id
    AND we.exercise_id = p_exercise_id
    AND w.ended_at IS NOT NULL
    AND w.readiness_score IS NOT NULL
  ORDER BY w.ended_at DESC
  LIMIT 1;

  RETURN COALESCE(v_last_readiness, 65); -- Default readiness if no history
END;
$$;

-- Function to get last performance data for an exercise
CREATE OR REPLACE FUNCTION public.fn_last_performance_for_exercise(
  p_user_id uuid,
  p_exercise_id uuid
)
RETURNS TABLE(weight_kg numeric, reps integer, readiness_score integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ws.weight,
    ws.reps,
    w.readiness_score::integer
  FROM workouts w
  JOIN workout_exercises we ON we.workout_id = w.id
  JOIN workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE w.user_id = p_user_id
    AND we.exercise_id = p_exercise_id
    AND w.ended_at IS NOT NULL
    AND ws.is_completed = true
    AND ws.set_kind IN ('normal', 'top_set', 'working')
  ORDER BY w.ended_at DESC, ws.set_index DESC
  LIMIT 1;
END;
$$;