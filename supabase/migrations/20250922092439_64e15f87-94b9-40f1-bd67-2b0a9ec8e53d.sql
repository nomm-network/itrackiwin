-- Update get_workout_detail_optimized to include effort_mode and load_mode
CREATE OR REPLACE FUNCTION get_workout_detail_optimized(p_workout_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  workout_data jsonb;
  exercises_data jsonb;
BEGIN
  -- Get workout basic info
  SELECT jsonb_build_object(
    'id', w.id,
    'user_id', w.user_id,
    'started_at', w.started_at,
    'ended_at', w.ended_at,
    'title', w.title,
    'notes', w.notes,
    'perceived_exertion', w.perceived_exertion
  )
  INTO workout_data
  FROM workouts w
  WHERE w.id = p_workout_id AND w.user_id = p_user_id;
  
  IF workout_data IS NULL THEN
    RAISE EXCEPTION 'Workout not found or access denied';
  END IF;
  
  -- Get exercises with sets - NOW INCLUDING effort_mode and load_mode
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', we.id,
      'exercise_id', we.exercise_id,
      'order_index', we.order_index,
      'notes', we.notes,
      'exercise_name', COALESCE(
        e.custom_display_name,
        jsonb_extract_path_text(e.attribute_values_json, 'translations', 'en', 'name'),
        e.display_name,
        e.slug
      ),
      'exercise_slug', e.slug,
      'exercise', jsonb_build_object(
        'id', e.id,
        'effort_mode', e.effort_mode,
        'load_mode', e.load_mode,
        'slug', e.slug,
        'display_name', e.display_name,
        'equipment_id', e.equipment_id,
        'primary_muscle_id', e.primary_muscle_id,
        'is_unilateral', e.is_unilateral,
        'allows_grips', e.allows_grips,
        'load_type', e.load_type
      ),
      'sets', COALESCE(sets.sets_data, '[]'::jsonb)
    )
    ORDER BY we.order_index
  )
  INTO exercises_data
  FROM workout_exercises we
  JOIN exercises e ON e.id = we.exercise_id
  LEFT JOIN (
    SELECT 
      workout_exercise_id,
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'set_index', set_index,
          'set_kind', set_kind,
          'weight', COALESCE(weight_kg, weight),
          'weight_unit', weight_unit,
          'reps', reps,
          'duration_seconds', duration_seconds,
          'distance', distance,
          'rpe', rpe,
          'notes', notes,
          'is_completed', is_completed,
          'completed_at', completed_at
        )
        ORDER BY set_index
      ) as sets_data
    FROM workout_sets
    GROUP BY workout_exercise_id
  ) sets ON sets.workout_exercise_id = we.id
  WHERE we.workout_id = p_workout_id;
  
  -- Build final result
  result := jsonb_build_object(
    'workout', workout_data,
    'exercises', COALESCE(exercises_data, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$;