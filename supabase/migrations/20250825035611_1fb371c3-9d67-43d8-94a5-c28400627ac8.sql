-- Fix the workout_open function to use correct column names from updated view
CREATE OR REPLACE FUNCTION workout_open(p_workout_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    template_id UUID,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    exercises JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.user_id,
        w.template_id,
        w.start_time,
        w.end_time,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', we.id,
                    'exercise_id', we.exercise_id,
                    'position', we.position,
                    'rest_seconds', we.rest_seconds,
                    'notes', we.notes,
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
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'id', ws.id,
                                    'set_number', ws.set_number,
                                    'weight', ws.weight,
                                    'reps', ws.reps,
                                    'distance', ws.distance,
                                    'duration', ws.duration,
                                    'feel', ws.feel,
                                    'effort', ws.effort,
                                    'notes', ws.notes,
                                    'is_warmup', ws.is_warmup,
                                    'is_completed', ws.is_completed,
                                    'grip_ids', ws.grip_ids,
                                    'equipment_id', ws.equipment_id,
                                    'created_at', ws.created_at,
                                    'completed_at', ws.completed_at
                                ) ORDER BY ws.set_number
                            )
                            FROM workout_sets ws
                            WHERE ws.workout_exercise_id = we.id
                        ),
                        '[]'::jsonb
                    )
                ) ORDER BY we.position
            ) FILTER (WHERE we.id IS NOT NULL),
            '[]'::jsonb
        ) as exercises
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN v_exercises_with_translations e ON e.id = we.exercise_id
    WHERE w.id = p_workout_id
      AND (w.user_id = auth.uid() OR auth.uid() IN (
          SELECT user_id FROM user_profiles WHERE is_admin = true
      ))
    GROUP BY w.id, w.user_id, w.template_id, w.start_time, w.end_time;
END;
$$;