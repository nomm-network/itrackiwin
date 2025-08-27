-- =========================================
-- CLEAN & BACKUP: workouts + exercise catalog
-- Schema-aware (checks table existence)
-- =========================================
DO $$
DECLARE 
  t text;
BEGIN
  -- 1) BACKUP anything we're going to touch (only if the table exists)
  FOR t IN SELECT unnest(ARRAY[
    'workout_sets',
    'workout_exercise_grips',           -- if you have a per-set/per-exercise grip link table
    'workout_exercises',
    'workouts',

    'template_exercises',
    'workout_templates',

    'exercise_handle_grips',            -- exercise + handle + grip tri-map
    'exercise_grips',                   -- exercise + grip map
    'exercise_handles',                 -- exercise + handle map

    'exercise_primary_muscles',         -- primary muscles map (your actual table name)
    'exercise_secondary_muscles',       -- secondary muscles map (your actual table name)

    'exercises_translations',
    'exercises'
  ]) LOOP
    IF to_regclass('public.'||t) IS NOT NULL THEN
      -- create backup table if not exists (structure only)
      EXECUTE format(
        'CREATE TABLE IF NOT EXISTS public.bak_%I (LIKE public.%I INCLUDING ALL);',
        t, t
      );
      -- append current rows
      EXECUTE format('INSERT INTO public.bak_%I SELECT * FROM public.%I;', t, t);
    END IF;
  END LOOP;

  -- 2) DELETE in FK-safe order (only if tables exist)
  -- ---- Workout history first
  IF to_regclass('public.workout_sets') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.workout_sets;';
  END IF;

  IF to_regclass('public.workout_exercise_grips') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.workout_exercise_grips;';
  END IF;

  IF to_regclass('public.workout_exercises') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.workout_exercises;';
  END IF;

  IF to_regclass('public.workouts') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.workouts;';
  END IF;

  -- ---- Templates
  IF to_regclass('public.template_exercises') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.template_exercises;';
  END IF;

  -- NOTE: your table is 'workout_templates' (NOT 'templates')
  IF to_regclass('public.workout_templates') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.workout_templates;';
  END IF;

  -- ---- Exercise <-> (handles / grips / muscles) mappings
  IF to_regclass('public.exercise_handle_grips') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.exercise_handle_grips;';
  END IF;

  IF to_regclass('public.exercise_grips') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.exercise_grips;';
  END IF;

  IF to_regclass('public.exercise_handles') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.exercise_handles;';
  END IF;

  IF to_regclass('public.exercise_secondary_muscles') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.exercise_secondary_muscles;';
  END IF;

  IF to_regclass('public.exercise_primary_muscles') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.exercise_primary_muscles;';
  END IF;

  -- ---- Translations then base catalog
  IF to_regclass('public.exercises_translations') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.exercises_translations;';
  END IF;

  IF to_regclass('public.exercises') IS NOT NULL THEN
    EXECUTE 'DELETE FROM public.exercises;';
  END IF;

END $$;