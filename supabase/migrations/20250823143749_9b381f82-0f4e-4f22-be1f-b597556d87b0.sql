-- Create workout_open RPC function to fetch workout with all related data
CREATE OR REPLACE FUNCTION workout_open(p_workout_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_workout_data jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get workout with exercises and sets
  SELECT jsonb_build_object(
    'id', w.id,
    'title', w.title,
    'user_id', w.user_id,
    'started_at', w.started_at,
    'ended_at', w.ended_at,
    'created_at', w.created_at,
    'exercises', COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', we.id,
          'exercise_id', we.exercise_id,
          'order_index', we.order_index,
          'exercise', jsonb_build_object(
            'id', e.id,
            'name', e.name,
            'description', e.description
          ),
          'sets', COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', ws.id,
                'set_index', ws.set_index,
                'set_kind', ws.set_kind,
                'weight', ws.weight,
                'reps', ws.reps,
                'weight_unit', ws.weight_unit,
                'duration_seconds', ws.duration_seconds,
                'distance', ws.distance,
                'rpe', ws.rpe,
                'notes', ws.notes,
                'is_completed', ws.is_completed,
                'completed_at', ws.completed_at
              ) ORDER BY ws.set_index
            )
            FROM workout_sets ws 
            WHERE ws.workout_exercise_id = we.id
          ), '[]'::jsonb)
        ) ORDER BY we.order_index
      )
      FROM workout_exercises we
      JOIN exercises e ON e.id = we.exercise_id
      WHERE we.workout_id = w.id
    ), '[]'::jsonb)
  ) INTO v_workout_data
  FROM workouts w
  WHERE w.id = p_workout_id AND w.user_id = v_user_id;

  IF v_workout_data IS NULL THEN
    RAISE EXCEPTION 'Workout not found or access denied';
  END IF;

  RETURN v_workout_data;
END;
$$;