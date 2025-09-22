-- Create the missing can_mutate_workout_set function
CREATE OR REPLACE FUNCTION public.can_mutate_workout_set(workout_set_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Allow users to mutate workout sets if they own the workout
  SELECT EXISTS (
    SELECT 1 FROM workout_sets ws
    JOIN workout_exercises we ON we.id = ws.workout_exercise_id
    JOIN workouts w ON w.id = we.workout_id
    WHERE ws.id = workout_set_id
    AND w.user_id = auth.uid()
  );
$function$;