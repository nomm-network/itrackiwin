BEGIN;

-- 0) Quick sanity check: you can rollback if something looks wrong before COMMIT

-- 1) Optional backups (temp copies – vanish on session end). 
--    If you want durable backups, copy to real tables instead.
CREATE TEMP TABLE bk_exercises                AS SELECT * FROM public.exercises;
CREATE TEMP TABLE bk_exercise_translations    AS SELECT * FROM public.exercises_translations;
CREATE TEMP TABLE bk_exercise_muscles         AS SELECT * FROM public.exercise_muscles;
CREATE TEMP TABLE bk_exercise_grips           AS SELECT * FROM public.exercise_grips;
CREATE TEMP TABLE bk_exercise_handles         AS SELECT * FROM public.exercise_handles;
CREATE TEMP TABLE bk_exercise_handle_grips    AS SELECT * FROM public.exercise_handle_grips;
CREATE TEMP TABLE bk_template_exercises       AS SELECT * FROM public.template_exercises;
CREATE TEMP TABLE bk_templates                AS SELECT * FROM public.workout_templates;

-- 2) If you **do NOT** want to delete user workout history, leave this section commented.
--    If you DO want a full reset including history, uncomment these two deletes first.
-- DELETE FROM public.workout_sets;
-- DELETE FROM public.workout_exercises;

-- 3) Clear any template layers that reference exercises (so FKs don't block).
DELETE FROM public.template_exercises;
DELETE FROM public.workout_templates
WHERE id NOT IN (
  SELECT DISTINCT template_id FROM public.program_blocks_exercises
) OR TRUE; -- remove this WHERE if nothing depends on templates

-- 4) Clear exercise relationship tables (order matters less if FKs have ON DELETE CASCADE,
--    but we do it explicitly to be safe across environments).
DELETE FROM public.exercise_handle_grips;
DELETE FROM public.exercise_grips;
DELETE FROM public.exercise_handles;
DELETE FROM public.exercise_muscles;
DELETE FROM public.exercises_translations;

-- 5) Finally clear the exercises table.
DELETE FROM public.exercises;

-- 6) Keep equipment / handles / grips and their translations as-is.
--    If you said to keep them, we're done.

COMMIT;