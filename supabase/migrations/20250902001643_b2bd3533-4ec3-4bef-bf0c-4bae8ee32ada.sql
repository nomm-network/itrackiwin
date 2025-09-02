-- Fix apply_initial_targets function to use correct column names
CREATE OR REPLACE FUNCTION public.apply_initial_targets(p_workout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
BEGIN
  -- Get owner of this workout
  SELECT w.user_id INTO v_user
  FROM workouts w
  WHERE w.id = p_workout_id;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Workout not found';
  END IF;

  /*
    Update every workout_exercises row with the best available targets:
      template -> last set -> PR -> readiness -> defaults
  */
  WITH
  we AS (
    SELECT id, workout_id, exercise_id
    FROM workout_exercises
    WHERE workout_id = p_workout_id
  ),
  tmpl AS (
    SELECT te.exercise_id,
           te.target_weight_kg as t_weight,
           te.target_reps     as t_reps
    FROM template_exercises te
    JOIN workout_templates wt ON wt.id = te.template_id
    JOIN workouts w ON w.id = p_workout_id AND w.template_id = wt.id
  ),
  last_set AS (
    SELECT DISTINCT ON (wex.exercise_id) 
           wex.exercise_id,
           ws.weight as l_weight,
           ws.reps as l_reps
    FROM workout_exercises wex
    JOIN workouts w2 ON w2.id = wex.workout_id
    JOIN workout_sets ws ON ws.workout_exercise_id = wex.id
    WHERE w2.user_id = v_user
      AND ws.is_completed = true
      AND w2.ended_at IS NOT NULL  -- Only consider completed workouts
    ORDER BY wex.exercise_id, w2.started_at DESC, ws.set_index DESC
  ),
  prs AS (
    SELECT pr.exercise_id,
           CASE WHEN pr.unit = 'kg' THEN pr.value
                WHEN pr.unit = 'lb' THEN ROUND(pr.value * 0.453592, 1)
           END as p_weight
    FROM personal_records pr
    WHERE pr.user_id = v_user
      AND pr.kind = 'heaviest'
  ),
  ready AS (
    SELECT r.exercise_id, 
           r.estimated_top_weight_kg as r_weight, 
           r.target_reps as r_reps
    FROM workout_readiness r
    WHERE r.user_id = v_user
      AND (r.workout_id = p_workout_id OR r.workout_id IS NULL)
  )
  UPDATE workout_exercises x
  SET
    target_weight_kg = COALESCE(
      x.target_weight_kg,
      (SELECT t_weight FROM tmpl t WHERE t.exercise_id = x.exercise_id),
      (SELECT l_weight FROM last_set s WHERE s.exercise_id = x.exercise_id),
      (SELECT p_weight FROM prs p WHERE p.exercise_id = x.exercise_id),
      (SELECT r_weight FROM ready r WHERE r.exercise_id = x.exercise_id),
      20.0  -- safe default (bar / mid stack)
    ),
    target_reps = COALESCE(
      x.target_reps,
      (SELECT t_reps FROM tmpl t WHERE t.exercise_id = x.exercise_id),
      (SELECT l_reps FROM last_set s WHERE s.exercise_id = x.exercise_id),
      (SELECT r_reps FROM ready r WHERE r.exercise_id = x.exercise_id),
      12
    )
  FROM we
  WHERE x.id = we.id;
END
$$;