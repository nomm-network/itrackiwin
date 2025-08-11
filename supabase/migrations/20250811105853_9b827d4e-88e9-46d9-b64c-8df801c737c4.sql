-- Delete all exercises and dependent rows using direct subqueries
BEGIN;
  -- Personal records linked via sets of workout_exercises for any exercise
  DELETE FROM public.personal_records
  WHERE workout_set_id IN (
    SELECT ws.id
    FROM public.workout_sets ws
    JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
    WHERE we.exercise_id IN (SELECT id FROM public.exercises)
  );

  -- Personal records linked directly to exercises
  DELETE FROM public.personal_records
  WHERE exercise_id IN (SELECT id FROM public.exercises);

  -- Workout sets for workout_exercises that reference any exercise
  DELETE FROM public.workout_sets
  WHERE workout_exercise_id IN (
    SELECT we.id FROM public.workout_exercises we WHERE we.exercise_id IN (SELECT id FROM public.exercises)
  );

  -- Workout exercises that reference any exercise
  DELETE FROM public.workout_exercises
  WHERE exercise_id IN (SELECT id FROM public.exercises);

  -- Template exercises that reference any exercise
  DELETE FROM public.template_exercises
  WHERE exercise_id IN (SELECT id FROM public.exercises);

  -- Exercise images metadata
  DELETE FROM public.exercise_images
  WHERE exercise_id IN (SELECT id FROM public.exercises);

  -- Finally, delete all exercises
  DELETE FROM public.exercises;
COMMIT;