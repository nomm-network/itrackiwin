-- Step 2: Drop Handle columns and tables (with CASCADE for dependent objects)

BEGIN;

-- A) Drop any handle_id columns on templates/workouts if they exist (with CASCADE)
ALTER TABLE public.template_exercises DROP COLUMN IF EXISTS handle_id CASCADE;
ALTER TABLE public.workout_exercises  DROP COLUMN IF EXISTS handle_id CASCADE;

-- B) Drop handle columns on exercises (with CASCADE)
ALTER TABLE public.exercises
  DROP COLUMN IF EXISTS default_handle_ids CASCADE,
  DROP COLUMN IF EXISTS requires_handle CASCADE;

-- C) Drop 3-way & exercise-specific handle linkage tables (if present)
DROP TABLE IF EXISTS public.exercise_handle_grips       CASCADE;
DROP TABLE IF EXISTS public.exercise_default_handles    CASCADE;
DROP TABLE IF EXISTS public.exercise_handles            CASCADE;
DROP TABLE IF EXISTS public.template_exercise_handles   CASCADE;
DROP TABLE IF EXISTS public.equipment_handle_grips      CASCADE;

-- D) Drop handle compatibility tables
DROP TABLE IF EXISTS public.handle_equipment            CASCADE;
DROP TABLE IF EXISTS public.handle_grip_compatibility   CASCADE;

-- E) Drop handles themselves
DROP TABLE IF EXISTS public.handles_translations        CASCADE;
DROP TABLE IF EXISTS public.handles                     CASCADE;

COMMIT;