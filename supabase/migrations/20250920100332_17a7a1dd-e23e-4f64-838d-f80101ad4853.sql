-- First drop dependent policies and triggers, then drop functions

-- Drop RLS policies that depend on workout functions
DROP POLICY IF EXISTS workout_sets_per_user_select ON workout_sets;
DROP POLICY IF EXISTS workout_sets_per_user_mutate ON workout_sets;

-- Drop triggers that use workout functions
DROP TRIGGER IF EXISTS set_updated_at ON workout_sets;
DROP TRIGGER IF EXISTS after_set_logged ON workout_sets;
DROP TRIGGER IF EXISTS te_sync_weights ON template_exercises;
DROP TRIGGER IF EXISTS initialize_warmup ON workout_exercises;
DROP TRIGGER IF EXISTS init_warmup ON workout_exercises;
DROP TRIGGER IF EXISTS populate_grip_key ON workout_sets;

-- Now drop all workout-related functions with CASCADE
DROP FUNCTION IF EXISTS public.compute_total_weight(text, numeric, numeric, boolean) CASCADE;
DROP FUNCTION IF EXISTS public.can_mutate_workout_set(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_initialize_warmup() CASCADE;
DROP FUNCTION IF EXISTS public.trg_after_set_logged() CASCADE;
DROP FUNCTION IF EXISTS public.populate_grip_key_from_workout_exercise() CASCADE;
DROP FUNCTION IF EXISTS public.trg_te_sync_weights() CASCADE;
DROP FUNCTION IF EXISTS public.end_workout(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.log_workout_set(uuid, integer, jsonb, uuid[]) CASCADE;
DROP FUNCTION IF EXISTS public.assign_next_set_index() CASCADE;
DROP FUNCTION IF EXISTS public.get_next_set_index(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.trg_init_warmup() CASCADE;

-- Exercise and workout calculation functions
DROP FUNCTION IF EXISTS public.closest_machine_weight(numeric, numeric[], numeric[]) CASCADE;
DROP FUNCTION IF EXISTS public.bar_min_increment(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.epley_1rm(numeric, integer) CASCADE;
DROP FUNCTION IF EXISTS public._get_exercise_load_mode_and_bw_pct(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.make_grip_key(uuid[]) CASCADE;
DROP FUNCTION IF EXISTS public.validate_metric_value_type() CASCADE;

-- Workout analysis and suggestion functions
DROP FUNCTION IF EXISTS public.fn_detect_stagnation(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.fn_suggest_warmup(uuid, numeric, integer) CASCADE;
DROP FUNCTION IF EXISTS public.fn_suggest_rest_seconds(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.fn_suggest_sets(uuid, text, integer) CASCADE;

-- Workout history and performance functions
DROP FUNCTION IF EXISTS public.get_last_sets_for_exercises(uuid[]) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_last_set_for_exercise(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_pr_for_exercise(uuid) CASCADE;

-- Training program and coaching functions
DROP FUNCTION IF EXISTS public.get_user_coach_params(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_next_program_template(uuid, uuid) CASCADE;

-- Referenced functions that might exist
DROP FUNCTION IF EXISTS public.recalc_warmup_from_last_set(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.generate_warmup_steps(numeric) CASCADE;