-- Drop all workout-related functions

-- Workout set and exercise functions
DROP FUNCTION IF EXISTS public.compute_total_weight(text, numeric, numeric, boolean);
DROP FUNCTION IF EXISTS public.can_mutate_workout_set(uuid);
DROP FUNCTION IF EXISTS public.trigger_initialize_warmup();
DROP FUNCTION IF EXISTS public.trg_after_set_logged();
DROP FUNCTION IF EXISTS public.populate_grip_key_from_workout_exercise();
DROP FUNCTION IF EXISTS public.trg_te_sync_weights();
DROP FUNCTION IF EXISTS public.end_workout(uuid);
DROP FUNCTION IF EXISTS public.log_workout_set(uuid, integer, jsonb, uuid[]);
DROP FUNCTION IF EXISTS public.assign_next_set_index();
DROP FUNCTION IF EXISTS public.get_next_set_index(uuid);
DROP FUNCTION IF EXISTS public.trg_init_warmup();

-- Exercise and workout calculation functions
DROP FUNCTION IF EXISTS public.closest_machine_weight(numeric, numeric[], numeric[]);
DROP FUNCTION IF EXISTS public.bar_min_increment(uuid);
DROP FUNCTION IF EXISTS public.epley_1rm(numeric, integer);
DROP FUNCTION IF EXISTS public._get_exercise_load_mode_and_bw_pct(uuid);
DROP FUNCTION IF EXISTS public.make_grip_key(uuid[]);
DROP FUNCTION IF EXISTS public.validate_metric_value_type();

-- Workout analysis and suggestion functions
DROP FUNCTION IF EXISTS public.fn_detect_stagnation(uuid, integer);
DROP FUNCTION IF EXISTS public.fn_suggest_warmup(uuid, numeric, integer);
DROP FUNCTION IF EXISTS public.fn_suggest_rest_seconds(uuid, text);
DROP FUNCTION IF EXISTS public.fn_suggest_sets(uuid, text, integer);

-- Workout history and performance functions
DROP FUNCTION IF EXISTS public.get_last_sets_for_exercises(uuid[]);
DROP FUNCTION IF EXISTS public.get_user_last_set_for_exercise(uuid);
DROP FUNCTION IF EXISTS public.get_user_pr_for_exercise(uuid);

-- Training program and coaching functions
DROP FUNCTION IF EXISTS public.get_user_coach_params(uuid);
DROP FUNCTION IF EXISTS public.get_next_program_template(uuid, uuid);

-- Also drop any referenced functions that might exist
DROP FUNCTION IF EXISTS public.recalc_warmup_from_last_set(uuid);
DROP FUNCTION IF EXISTS public.generate_warmup_steps(numeric);