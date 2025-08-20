-- First, fix the clone_template_to_workout function to not create empty sets
CREATE OR REPLACE FUNCTION clone_template_to_workout(template_id uuid, workout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    te record;
BEGIN
    -- Copy exercises from template to workout without creating empty sets
    FOR te IN 
        SELECT exercise_id, order_index, notes
        FROM template_exercises 
        WHERE template_id = clone_template_to_workout.template_id
        ORDER BY order_index
    LOOP
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index, notes)
        VALUES (clone_template_to_workout.workout_id, te.exercise_id, te.order_index, te.notes);
    END LOOP;
END;
$$;