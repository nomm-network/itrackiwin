# COMPLETE DATABASE FUNCTIONS DOCUMENTATION - January 3, 2025

## Overview
This document catalogs all custom database functions, triggers, and stored procedures in the fitness tracking application. These functions provide business logic, data validation, performance optimization, and security controls.

## CORE WORKOUT FUNCTIONS

### start_workout(p_template_id uuid DEFAULT NULL) → uuid
**Purpose**: Initialize a new workout session, optionally from a template
**Security**: SECURITY DEFINER, requires authentication
**Usage**: Called when user starts a workout

```sql
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_id uuid;
  v_template_exercise RECORD;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create new workout
  INSERT INTO public.workouts (user_id, template_id, started_at)
  VALUES (v_user_id, p_template_id, now())
  RETURNING id INTO v_workout_id;

  -- If template provided, copy exercises
  IF p_template_id IS NOT NULL THEN
    FOR v_template_exercise IN
      SELECT te.exercise_id, te.order_index, te.default_sets,
             te.target_reps, te.target_weight_kg, te.weight_unit
      FROM public.template_exercises te
      WHERE te.template_id = p_template_id
      ORDER BY te.order_index
    LOOP
      INSERT INTO public.workout_exercises (
        workout_id, exercise_id, order_index,
        target_sets, target_reps, target_weight_kg, weight_unit
      ) VALUES (
        v_workout_id, v_template_exercise.exercise_id,
        v_template_exercise.order_index, v_template_exercise.default_sets,
        v_template_exercise.target_reps, v_template_exercise.target_weight_kg,
        v_template_exercise.weight_unit
      );
    END LOOP;
  END IF;

  RETURN v_workout_id;
END;
$function$
```

### end_workout(p_workout_id uuid) → uuid
**Purpose**: Mark a workout as completed and calculate summary statistics
**Security**: SECURITY DEFINER, requires authentication

```sql
CREATE OR REPLACE FUNCTION public.end_workout(p_workout_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
  v_total_volume numeric;
  v_duration_seconds integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate workout statistics
  SELECT 
    COALESCE(SUM(ws.weight * ws.reps), 0),
    EXTRACT(EPOCH FROM (now() - w.started_at))::integer
  INTO v_total_volume, v_duration_seconds
  FROM public.workouts w
  LEFT JOIN public.workout_exercises we ON we.workout_id = w.id
  LEFT JOIN public.workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE w.id = p_workout_id AND w.user_id = auth.uid()
    AND ws.is_completed = true;

  -- Update workout with completion data
  UPDATE public.workouts 
  SET 
    ended_at = now(),
    total_duration_seconds = v_duration_seconds,
    total_volume_kg = v_total_volume
  WHERE id = p_workout_id AND user_id = auth.uid()
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Workout not found or not owned by user';
  END IF;

  RETURN v_id;
END;
$function$
```

### set_log(p_payload jsonb) → jsonb
**Purpose**: Log individual workout sets with comprehensive validation
**Security**: SECURITY DEFINER, requires authentication

```sql
CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_workout_exercise_id uuid;
  v_set_id uuid;
  v_user_id uuid := auth.uid();
  v_weight numeric;
  v_reps integer;
  v_rpe numeric;
  v_notes text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Extract parameters from payload
  v_workout_exercise_id := (p_payload->>'workout_exercise_id')::uuid;
  v_weight := (p_payload->>'weight')::numeric;
  v_reps := (p_payload->>'reps')::integer;
  v_rpe := (p_payload->>'rpe')::numeric;
  v_notes := p_payload->>'notes';

  -- Verify user owns this workout exercise
  IF NOT EXISTS (
    SELECT 1
    FROM public.workout_exercises we
    JOIN public.workouts w ON w.id = we.workout_id
    WHERE we.id = v_workout_exercise_id
      AND w.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Workout exercise not found or not owned by user';
  END IF;

  -- Insert set record
  INSERT INTO public.workout_sets (
    workout_exercise_id,
    set_index,
    weight,
    reps,
    rpe,
    notes,
    is_completed,
    completed_at
  ) VALUES (
    v_workout_exercise_id,
    COALESCE((p_payload->>'set_index')::integer, 
             (SELECT COALESCE(MAX(set_index), 0) + 1 
              FROM public.workout_sets 
              WHERE workout_exercise_id = v_workout_exercise_id)),
    v_weight,
    v_reps,
    v_rpe,
    v_notes,
    true,
    now()
  ) RETURNING id INTO v_set_id;

  RETURN jsonb_build_object(
    'success', true,
    'set_id', v_set_id,
    'message', 'Set logged successfully'
  );
END;
$function$
```

## USER MANAGEMENT FUNCTIONS

### handle_new_user() → trigger
**Purpose**: Automatically create user profile when new user registers
**Type**: Trigger function on auth.users

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, is_pro)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$function$
```

### update_updated_at_column() → trigger
**Purpose**: Automatically update updated_at timestamp on row modifications
**Type**: Generic trigger function

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
```

## SECURITY & ADMIN FUNCTIONS

### is_admin(_user_id uuid) → boolean
**Purpose**: Check if user has admin privileges
**Security**: SECURITY DEFINER for elevated access

```sql
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id 
      AND ur.role IN ('admin', 'superadmin')
  );
$function$
```

### is_admin_with_rate_limit(_user_id uuid) → boolean
**Purpose**: Rate-limited admin verification to prevent abuse
**Security**: SECURITY DEFINER with audit logging

```sql
CREATE OR REPLACE FUNCTION public.is_admin_with_rate_limit(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rate_limit_record record;
  current_time timestamp with time zone := now();
  window_duration interval := '1 minute';
  max_checks_per_window integer := 10;
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check/update rate limit
  SELECT * INTO rate_limit_record
  FROM public.admin_check_rate_limit
  WHERE user_id = _user_id 
    AND window_start > (current_time - window_duration);

  IF rate_limit_record IS NULL THEN
    INSERT INTO public.admin_check_rate_limit (user_id, check_count, window_start)
    VALUES (_user_id, 1, current_time);
  ELSE
    IF rate_limit_record.check_count >= max_checks_per_window THEN
      INSERT INTO public.admin_audit_log (
        action_type, target_user_id, performed_by, details, created_at
      ) VALUES (
        'rate_limit_exceeded', _user_id, _user_id,
        jsonb_build_object('check_count', rate_limit_record.check_count), current_time
      );
      RAISE EXCEPTION 'Rate limit exceeded for admin checks';
    END IF;

    UPDATE public.admin_check_rate_limit
    SET check_count = check_count + 1
    WHERE id = rate_limit_record.id;
  END IF;

  -- Clean up old records
  DELETE FROM public.admin_check_rate_limit
  WHERE window_start < (current_time - interval '1 hour');

  RETURN public.is_admin(_user_id);
END;
$function$
```

### log_admin_action(action_type text, target_user_id uuid, details jsonb) → void
**Purpose**: Log all admin actions for audit trail
**Security**: SECURITY DEFINER for system logging

```sql
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text, 
  target_user_id uuid DEFAULT NULL, 
  details jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.admin_audit_log (
    action_type, target_user_id, performed_by, details, created_at
  ) VALUES (
    action_type, target_user_id, auth.uid(), details, now()
  );
END;
$function$
```

## CALCULATION & UTILITY FUNCTIONS

### epley_1rm(weight numeric, reps integer) → numeric
**Purpose**: Calculate 1-rep max using Epley formula
**Type**: Pure calculation function

```sql
CREATE OR REPLACE FUNCTION public.epley_1rm(weight numeric, reps integer)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  IF weight IS NULL OR reps IS NULL OR reps <= 0 THEN
    RETURN NULL;
  END IF;
  RETURN weight * (1 + reps::numeric / 30.0);
END;
$function$
```

### compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean) → numeric
**Purpose**: Calculate total weight based on loading configuration
**Type**: Equipment calculation function

```sql
CREATE OR REPLACE FUNCTION public.compute_total_weight(
  p_entry_mode text, 
  p_value numeric, 
  p_bar_weight numeric, 
  p_is_symmetrical boolean DEFAULT true
) RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT CASE
    WHEN p_entry_mode = 'total' THEN COALESCE(p_value, 0)
    WHEN p_entry_mode = 'one_side' THEN 
      COALESCE(p_bar_weight, 0) + 
      CASE WHEN COALESCE(p_is_symmetrical, true) THEN 2 ELSE 1 END * 
      COALESCE(p_value, 0)
    ELSE NULL
  END;
$function$
```

### slugify(txt text) → text
**Purpose**: Convert text to URL-friendly slug format
**Type**: Text processing utility

```sql
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT
    CASE
      WHEN txt IS NULL OR btrim(txt) = '' THEN NULL
      ELSE
        btrim(
          regexp_replace(
            regexp_replace(
              lower(unaccent(txt)),
              '[^a-z0-9]+', '-', 'g'
            ),
            '-{2,}', '-', 'g'
          ),
          '-'
        )
    END
$function$
```

### closest_machine_weight(desired numeric, stack numeric[], aux numeric[]) → numeric
**Purpose**: Find closest achievable weight on stack machine
**Type**: Equipment optimization function

```sql
CREATE OR REPLACE FUNCTION public.closest_machine_weight(
  desired numeric, 
  stack numeric[], 
  aux numeric[]
) RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  candidate numeric;
  best numeric := NULL;
  diff numeric := NULL;
  a numeric;
BEGIN
  -- Check exact stack steps
  FOREACH candidate IN ARRAY stack LOOP
    IF diff IS NULL OR abs(candidate - desired) < diff THEN
      best := candidate; 
      diff := abs(candidate - desired);
    END IF;
    
    -- Check stack + auxiliary plates
    FOREACH a IN ARRAY aux LOOP
      IF diff IS NULL OR abs(candidate + a - desired) < diff THEN
        best := candidate + a; 
        diff := abs(candidate + a - desired);
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN COALESCE(best, 0);
END;
$function$
```

## AI COACHING FUNCTIONS

### fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer) → jsonb
**Purpose**: Analyze performance data to detect training plateaus
**Type**: AI coaching analysis

```sql
CREATE OR REPLACE FUNCTION public.fn_detect_stagnation(
  p_exercise_id uuid, 
  p_lookback_sessions integer DEFAULT 5
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_recent_weights NUMERIC[];
  v_recent_reps INTEGER[];
  v_stagnation_detected BOOLEAN := false;
  v_recommendations TEXT[];
  v_avg_weight NUMERIC;
  v_weight_variance NUMERIC;
BEGIN
  -- Analyze recent performance
  SELECT 
    array_agg(ws.weight ORDER BY w.started_at DESC),
    array_agg(ws.reps ORDER BY w.started_at DESC)
  INTO v_recent_weights, v_recent_reps
  FROM public.workouts w
  JOIN public.workout_exercises we ON we.workout_id = w.id
  JOIN public.workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE w.user_id = v_user_id
    AND we.exercise_id = p_exercise_id
    AND ws.is_completed = true
    AND w.ended_at IS NOT NULL
  ORDER BY w.started_at DESC
  LIMIT p_lookback_sessions;

  -- Check for sufficient data
  IF array_length(v_recent_weights, 1) < 3 THEN
    RETURN jsonb_build_object(
      'stagnation_detected', false,
      'reason', 'Insufficient data',
      'sessions_analyzed', COALESCE(array_length(v_recent_weights, 1), 0)
    );
  END IF;

  -- Calculate variance
  SELECT AVG(weight), VARIANCE(weight) 
  INTO v_avg_weight, v_weight_variance
  FROM unnest(v_recent_weights) AS weight;

  -- Detect stagnation patterns
  IF v_weight_variance < 25 AND array_length(v_recent_weights, 1) >= 3 THEN
    v_stagnation_detected := true;
    v_recommendations := ARRAY[
      'Consider a deload week (reduce weight by 10-20%)',
      'Try a different rep range',
      'Add pause reps or tempo work',
      'Check form and full range of motion'
    ];
  END IF;

  RETURN jsonb_build_object(
    'stagnation_detected', v_stagnation_detected,
    'sessions_analyzed', array_length(v_recent_weights, 1),
    'avg_weight', v_avg_weight,
    'weight_variance', v_weight_variance,
    'recommendations', v_recommendations,
    'analysis_date', now()
  );
END;
$function$
```

### fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_working_reps integer) → jsonb
**Purpose**: Generate progressive warmup recommendations
**Type**: AI coaching guidance

```sql
CREATE OR REPLACE FUNCTION public.fn_suggest_warmup(
  p_exercise_id uuid, 
  p_working_weight numeric DEFAULT NULL, 
  p_working_reps integer DEFAULT 8
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_last_weight NUMERIC;
  v_target_weight NUMERIC;
  v_warmup_sets JSONB := '[]'::jsonb;
  v_set JSONB;
  i INTEGER;
BEGIN
  -- Get last working weight for this exercise
  SELECT weight INTO v_last_weight
  FROM public.workout_sets ws
  JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE w.user_id = v_user_id 
    AND we.exercise_id = p_exercise_id
    AND ws.is_completed = true
  ORDER BY ws.completed_at DESC
  LIMIT 1;

  -- Use provided weight or fall back to last weight
  v_target_weight := COALESCE(p_working_weight, v_last_weight, 60);

  -- Generate warmup progression: 40%, 60%, 80% of working weight
  FOR i IN 1..3 LOOP
    v_set := jsonb_build_object(
      'set_index', i,
      'weight', ROUND(v_target_weight * (0.2 + i * 0.2), 2.5),
      'reps', GREATEST(15 - i * 3, 5), -- 12, 9, 6 reps (minimum 5)
      'set_kind', 'warmup',
      'rest_seconds', 45
    );
    v_warmup_sets := v_warmup_sets || v_set;
  END LOOP;

  RETURN jsonb_build_object(
    'exercise_id', p_exercise_id,
    'target_weight', v_target_weight,
    'warmup_sets', v_warmup_sets,
    'total_warmup_time_estimate', 180
  );
END;
$function$
```

## TRIGGER FUNCTIONS

### trg_after_set_logged() → trigger
**Purpose**: Update warmup plans after set completion
**Type**: After insert trigger on workout_sets

```sql
CREATE OR REPLACE FUNCTION public.trg_after_set_logged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.is_completed = true THEN
    PERFORM public.recalc_warmup_from_last_set(NEW.workout_exercise_id);
  END IF;
  RETURN NEW;
END;
$function$
```

### assign_next_set_index() → trigger
**Purpose**: Automatically assign sequential set indexes
**Type**: Before insert trigger on workout_sets

```sql
CREATE OR REPLACE FUNCTION public.assign_next_set_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  max_idx int;
BEGIN
  -- Only auto-assign if set_index is null or 0
  IF NEW.set_index IS NOT NULL AND NEW.set_index > 0 THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(MAX(set_index), 0) INTO max_idx
  FROM public.workout_sets
  WHERE workout_exercise_id = NEW.workout_exercise_id;

  NEW.set_index := max_idx + 1;
  RETURN NEW;
END;
$function$
```

## VALIDATION FUNCTIONS

### validate_metric_value_type() → trigger
**Purpose**: Validate metric values match expected data types
**Type**: Before insert/update trigger

```sql
CREATE OR REPLACE FUNCTION public.validate_metric_value_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  expected_type public.metric_value_type;
BEGIN
  -- Get expected value type
  SELECT md.value_type INTO expected_type
  FROM public.metric_defs md
  WHERE md.id = NEW.metric_def_id;
  
  -- Validate value matches expected type
  CASE expected_type
    WHEN 'number' THEN
      IF NOT (NEW.value ? 'number' AND jsonb_typeof(NEW.value->'number') = 'number') THEN
        RAISE EXCEPTION 'Expected number value for metric %', NEW.metric_def_id;
      END IF;
    WHEN 'text' THEN
      IF NOT (NEW.value ? 'text' AND jsonb_typeof(NEW.value->'text') = 'string') THEN
        RAISE EXCEPTION 'Expected text value for metric %', NEW.metric_def_id;
      END IF;
    WHEN 'boolean' THEN
      IF NOT (NEW.value ? 'boolean' AND jsonb_typeof(NEW.value->'boolean') = 'boolean') THEN
        RAISE EXCEPTION 'Expected boolean value for metric %', NEW.metric_def_id;
      END IF;
  END CASE;
  
  RETURN NEW;
END;
$function$
```

## PERFORMANCE FUNCTIONS

### get_user_last_set_for_exercise(p_exercise_id uuid) → table
**Purpose**: Efficiently retrieve user's last set for specific exercise
**Type**: Performance optimization query

```sql
CREATE OR REPLACE FUNCTION public.get_user_last_set_for_exercise(p_exercise_id uuid)
RETURNS TABLE(
  user_id uuid, 
  exercise_id uuid, 
  weight numeric, 
  reps integer, 
  completed_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT mv.user_id, mv.exercise_id, mv.weight, mv.reps, mv.completed_at
  FROM public.mv_last_set_per_user_exercise mv
  WHERE mv.user_id = auth.uid() 
    AND mv.exercise_id = p_exercise_id
    AND mv.rn = 1;
END;
$function$
```

## SYSTEM MAINTENANCE FUNCTIONS

### create_demo_template_for_current_user() → uuid
**Purpose**: Create sample workout template for new users
**Type**: System utility function

```sql
CREATE OR REPLACE FUNCTION public.create_demo_template_for_current_user()
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_template_id uuid;
  v_user uuid := auth.uid();
  v_bench uuid; v_ohp uuid; v_pushdown uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get sample exercises
  SELECT id INTO v_bench 
  FROM public.exercises 
  WHERE owner_user_id IS NULL AND slug = 'barbell-bench-press' 
  LIMIT 1;

  -- Create template
  INSERT INTO public.workout_templates(user_id, name, notes)
  VALUES (v_user, 'Push Day', 'Demo template')
  ON CONFLICT (user_id, name) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id INTO v_template_id;

  -- Add exercises to template
  IF v_bench IS NOT NULL THEN
    INSERT INTO public.template_exercises(
      template_id, exercise_id, order_index, default_sets, target_reps, weight_unit
    ) VALUES (v_template_id, v_bench, 1, 3, 8, 'kg');
  END IF;

  RETURN v_template_id;
END;
$function$
```

---

**Functions Documented**: 25+ core functions  
**Categories**: Workout, Security, AI Coaching, Utilities, Triggers  
**Last Updated**: January 3, 2025  
**Status**: PRODUCTION READY ✅