-- Delete all exercises and their dependent data to satisfy foreign keys
BEGIN;
  -- Gather affected workout_exercise ids first
  WITH ex AS (
    SELECT id FROM public.exercises
  ), we AS (
    SELECT id FROM public.workout_exercises WHERE exercise_id IN (SELECT id FROM ex)
  )
  -- Remove personal records tied to those sets or exercises
  DELETE FROM public.personal_records WHERE workout_set_id IN (
    SELECT id FROM public.workout_sets WHERE workout_exercise_id IN (SELECT id FROM we)
  );

  DELETE FROM public.personal_records WHERE exercise_id IN (SELECT id FROM ex);

  -- Remove workout sets then workout exercises
  DELETE FROM public.workout_sets WHERE workout_exercise_id IN (SELECT id FROM we);
  DELETE FROM public.workout_exercises WHERE id IN (SELECT id FROM we);

  -- Remove template references
  DELETE FROM public.template_exercises WHERE exercise_id IN (SELECT id FROM ex);

  -- Remove exercise images metadata
  DELETE FROM public.exercise_images WHERE exercise_id IN (SELECT id FROM ex);

  -- Finally remove exercises
  DELETE FROM public.exercises;
COMMIT;