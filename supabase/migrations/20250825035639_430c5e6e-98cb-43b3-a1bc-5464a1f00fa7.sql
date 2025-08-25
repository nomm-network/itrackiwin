-- Drop and recreate the workout_open function with correct return type
DROP FUNCTION IF EXISTS workout_open(uuid);

CREATE OR REPLACE FUNCTION workout_open(p_workout_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_workout_data jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get workout with exercises and sets using updated view columns
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
            'name', COALESCE(e.translations->>'en'->>'name', e.slug),
            'slug', e.slug,
            'muscle_slug', e.muscle_slug,
            'muscle_group_slug', e.muscle_group_slug,
            'equipment_slug', e.equipment_slug,
            'equipment_type', e.equipment_type,
            'body_part_slug', e.body_part_slug,
            'muscle_name', e.muscle_name,
            'muscle_group_name', e.muscle_group_name,
            'image_url', e.image_url,
            'thumbnail_url', e.thumbnail_url,
            'capability_schema', e.capability_schema,
            'contraindications', e.contraindications,
            'complexity_score', e.complexity_score,
            'exercise_skill_level', e.exercise_skill_level,
            'movement_pattern', e.movement_pattern,
            'primary_muscle_id', e.primary_muscle_id,
            'equipment_id', e.equipment_id,
            'secondary_muscle_group_ids', e.secondary_muscle_group_ids,
            'default_grip_ids', e.default_grip_ids,
            'body_part_id', e.body_part_id,
            'translations', e.translations
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
      JOIN v_exercises_with_translations e ON e.id = we.exercise_id
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