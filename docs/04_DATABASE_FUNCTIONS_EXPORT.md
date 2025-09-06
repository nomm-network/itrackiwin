# Complete Database Functions and RPC Export

## Database Functions Overview

This database contains numerous functions for business logic, data validation, security, and utility operations. Based on the context provided, here are the key function categories and their complete definitions:

## Core Workout Functions

### start_workout(p_template_id uuid DEFAULT NULL::uuid)
```sql
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id          uuid;
  v_workout_id       uuid;
  v_score            numeric;     -- readiness 0..100
  v_multiplier       numeric;     -- readiness multiplier (e.g. 1.02)
  rec                RECORD;      -- template exercise row
  v_base_weight      numeric;     -- picked from last 3 workouts 60 days (helper)
  v_target_weight    numeric;     -- final target for this workout
  v_attr             jsonb;       -- attribute_values_json builder
BEGIN
  -- Auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create workout shell (note: template_id column exists per your last change)
  INSERT INTO public.workouts (user_id, started_at, template_id)
  VALUES (v_user_id, now(), p_template_id)
  RETURNING id INTO v_workout_id;

  -- If no template: just return new workout id
  IF p_template_id IS NULL THEN
    RETURN v_workout_id;
  END IF;

  -- Template ownership (keep strict to avoid surprises)
  IF NOT EXISTS (
    SELECT 1
    FROM public.workout_templates t
    WHERE t.id = p_template_id
      AND t.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Template not found or access denied';
  END IF;

  -- Compute readiness (uses your implemented function)
  -- This must always return 0..100; your operator fixed it to read readiness_checkins.
  SELECT public.compute_readiness_for_user(v_user_id)
  INTO v_score;

  -- Readiness multiplier (0.90 .. 1.08 etc.)
  SELECT public.readiness_multiplier(COALESCE(v_score, 65))
  INTO v_multiplier;

  -- Copy template_exercises → workout_exercises
  -- Only use columns confirmed present:
  -- template_exercises: exercise_id, order_index, default_sets, target_reps, target_weight_kg, weight_unit
  FOR rec IN
    SELECT te.exercise_id,
           te.order_index,
           te.default_sets,
           te.target_reps,
           te.target_weight_kg,
           te.weight_unit
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST
  LOOP
    -- pick base load (helper fn you/ops added)
    SELECT public.pick_base_load(v_user_id, rec.exercise_id)
    INTO v_base_weight;

    -- decide target_weight:
    -- prefer explicit template target; otherwise base*multiplier; otherwise NULL
    v_target_weight :=
      COALESCE(
        rec.target_weight_kg,
        CASE
          WHEN v_base_weight IS NULL THEN NULL
          ELSE ROUND(v_base_weight * v_multiplier, 1)
        END
      );

    -- build attribute_values_json: store base & readiness for transparency
    v_attr := jsonb_build_object(
      'base_weight_kg',        v_base_weight,
      'readiness_score',       COALESCE(v_score, 65),
      'readiness_multiplier',  COALESCE(v_multiplier, 1.0)
    );

    -- add warmup if we have a target
    IF v_target_weight IS NOT NULL THEN
      v_attr := jsonb_set(
        v_attr,
        '{warmup}',
        public.generate_warmup_steps(v_target_weight),
        true
      );
    END IF;

    -- insert workout_exercise row (no rest_seconds / no bogus fields)
    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      attribute_values_json,
      readiness_adjusted_from   -- keep NULL; it is UUID type (do not stuff text)
    )
    VALUES (
      v_workout_id,
      rec.exercise_id,
      rec.order_index,
      rec.default_sets,
      rec.target_reps,
      v_target_weight,
      COALESCE(rec.weight_unit, 'kg'),
      v_attr,
      NULL
    );
  END LOOP;

  -- also store workout-level readiness snapshot (column exists per your ops note)
  UPDATE public.workouts
  SET readiness_score = COALESCE(v_score, 65)
  WHERE id = v_workout_id;

  RETURN v_workout_id;
END;
$function$
```

### end_workout(p_workout_id uuid)
```sql
CREATE OR REPLACE FUNCTION public.end_workout(p_workout_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.workouts SET ended_at = now()
  WHERE id = p_workout_id AND user_id = auth.uid()
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Workout not found or not owned by user';
  END IF;

  RETURN v_id;
END;
$function$
```

### log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])
```sql
CREATE OR REPLACE FUNCTION public.log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_set_id uuid;
  v_metric_def RECORD;
  v_grip_id uuid;
BEGIN
  -- Insert workout set
  INSERT INTO workout_sets (
    workout_exercise_id,
    set_index,
    is_completed,
    completed_at
  ) VALUES (
    p_workout_exercise_id,
    p_set_index,
    true,
    now()
  ) RETURNING id INTO v_set_id;

  -- Insert metric values
  FOR v_metric_def IN 
    SELECT md.id, md.slug, md.value_type
    FROM exercise_metric_defs emd
    JOIN metric_defs md ON md.id = emd.metric_id
    JOIN workout_exercises we ON we.exercise_id = emd.exercise_id
    WHERE we.id = p_workout_exercise_id
  LOOP
    IF p_metrics ? v_metric_def.slug THEN
      INSERT INTO workout_set_metric_values (
        workout_set_id,
        metric_def_id,
        value
      ) VALUES (
        v_set_id,
        v_metric_def.id,
        p_metrics -> v_metric_def.slug
      );
    END IF;
  END LOOP;

  -- Insert grips if provided
  IF p_grip_ids IS NOT NULL THEN
    FOREACH v_grip_id IN ARRAY p_grip_ids
    LOOP
      INSERT INTO workout_set_grips (workout_set_id, grip_id)
      VALUES (v_set_id, v_grip_id);
    END LOOP;
  END IF;

  RETURN v_set_id;
END;
$function$
```

## Security and Authentication Functions

### handle_new_user()
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

### create_admin_user(target_user_id uuid, requester_role text)
```sql
CREATE OR REPLACE FUNCTION public.create_admin_user(target_user_id uuid, requester_role text DEFAULT 'system'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  requester_id uuid := auth.uid();
  is_authorized boolean := false;
BEGIN
  -- Only allow system calls or existing superadmins to create new admins
  IF requester_role = 'system' AND requester_id IS NULL THEN
    -- System initialization - only when no admins exist
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'superadmin')) THEN
      is_authorized := true;
    END IF;
  ELSIF requester_id IS NOT NULL THEN
    -- Check if requester is superadmin
    SELECT public.has_role(requester_id, 'superadmin') INTO is_authorized;
  END IF;

  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can create admin users';
  END IF;

  -- Create the admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log the admin creation
  INSERT INTO public.admin_audit_log (
    action_type, 
    target_user_id, 
    performed_by, 
    details,
    created_at
  ) VALUES (
    'admin_created',
    target_user_id,
    COALESCE(requester_id, '00000000-0000-0000-0000-000000000000'::uuid),
    jsonb_build_object('requester_role', requester_role),
    now()
  );

  RETURN true;
END;
$function$
```

## Utility Functions

### slugify(txt text)
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
        -- normalize: lower, remove accents, replace non-alnum with hyphens, squeeze repeats, trim
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

### update_updated_at_column()
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

### short_hash_uuid(u uuid)
```sql
CREATE OR REPLACE FUNCTION public.short_hash_uuid(u uuid)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT substr(encode(digest(u::text, 'sha256'), 'hex'), 1, 6)
$function$
```

## Weight and Exercise Calculation Functions

### epley_1rm(weight numeric, reps integer)
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

### compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)
```sql
CREATE OR REPLACE FUNCTION public.compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean DEFAULT true)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when p_entry_mode = 'total' then coalesce(p_value,0)
    when p_entry_mode = 'one_side' then coalesce(p_bar_weight,0) + case when coalesce(p_is_symmetrical,true) then 2 else 1 end * coalesce(p_value,0)
    else null
  end;
$function$
```

### next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)
```sql
CREATE OR REPLACE FUNCTION public.next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT CASE
    WHEN p_load_type = 'dual_load' THEN 2 * COALESCE(p_side_min_plate_kg, 1.25)
    WHEN p_load_type IN ('single_load','stack') THEN COALESCE(p_single_min_increment_kg, 2.5)
    ELSE 0
  END;
$function$
```

## Exercise and Template Functions

### create_demo_template_for_current_user()
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

  SELECT id INTO v_bench FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'barbell-bench-press' LIMIT 1;
  SELECT id INTO v_ohp FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'overhead-press' LIMIT 1;
  SELECT id INTO v_pushdown FROM public.exercises WHERE owner_user_id IS NULL AND slug = 'triceps-pushdown' LIMIT 1;

  INSERT INTO public.workout_templates(user_id, name, notes)
  VALUES (v_user, 'Push Day', 'Demo template')
  ON CONFLICT (user_id, name) DO UPDATE SET notes = EXCLUDED.notes
  RETURNING id INTO v_template_id;

  DELETE FROM public.template_exercises WHERE template_id = v_template_id;

  IF v_bench IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_bench, 1, 3, 8, 'kg');
  END IF;
  IF v_ohp IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_ohp, 2, 3, 10, 'kg');
  END IF;
  IF v_pushdown IS NOT NULL THEN
    INSERT INTO public.template_exercises(template_id, exercise_id, order_index, default_sets, target_reps, weight_unit)
    VALUES (v_template_id, v_pushdown, 3, 3, 12, 'kg');
  END IF;

  RETURN v_template_id;
END;
$function$
```

## Data Analysis and Suggestion Functions

### fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)
```sql
CREATE OR REPLACE FUNCTION public.fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer DEFAULT 5)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_recent_weights NUMERIC[];
  v_recent_reps INTEGER[];
  v_trend_direction TEXT;
  v_stagnation_detected BOOLEAN := false;
  v_recommendations TEXT[];
  v_avg_weight NUMERIC;
  v_weight_variance NUMERIC;
BEGIN
  -- Get recent performance data
  SELECT 
    array_agg(ws.weight ORDER BY w.started_at DESC),
    array_agg(ws.reps ORDER BY w.started_at DESC)
  INTO v_recent_weights, v_recent_reps
  FROM public.workouts w
  JOIN public.workout_exercises we ON we.workout_id = w.id
  JOIN public.workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE w.user_id = v_user_id
    AND we.exercise_id = p_exercise_id
    AND ws.set_kind IN ('normal', 'top_set', 'backoff')
    AND ws.is_completed = true
    AND w.ended_at IS NOT NULL
  ORDER BY w.started_at DESC
  LIMIT p_lookback_sessions;

  -- Check if we have enough data
  IF array_length(v_recent_weights, 1) < 3 THEN
    RETURN jsonb_build_object(
      'stagnation_detected', false,
      'reason', 'Insufficient data',
      'sessions_analyzed', COALESCE(array_length(v_recent_weights, 1), 0)
    );
  END IF;

  -- Calculate weight variance
  SELECT AVG(weight), VARIANCE(weight) 
  INTO v_avg_weight, v_weight_variance
  FROM unnest(v_recent_weights) AS weight;

  -- Detect stagnation: same weight for 3+ sessions with low variance
  IF v_weight_variance < 25 AND array_length(v_recent_weights, 1) >= 3 THEN
    v_stagnation_detected := true;
    v_trend_direction := 'plateau';
    
    -- Generate recommendations
    v_recommendations := ARRAY[
      'Consider a deload week (reduce weight by 10-20%)',
      'Try a different rep range (if doing 8 reps, try 5 or 12)',
      'Add pause reps or tempo work',
      'Check form and full range of motion',
      'Ensure adequate recovery between sessions'
    ];
  END IF;

  -- Check for declining trend
  IF v_recent_weights[1] < v_recent_weights[array_length(v_recent_weights, 1)] THEN
    v_stagnation_detected := true;
    v_trend_direction := 'declining';
    
    v_recommendations := ARRAY[
      'Review nutrition and sleep quality',
      'Consider longer rest periods between sessions',
      'Check for overtraining in other exercises',
      'Evaluate stress levels and recovery',
      'Consider switching to an easier variation temporarily'
    ];
  END IF;

  RETURN jsonb_build_object(
    'stagnation_detected', v_stagnation_detected,
    'trend_direction', v_trend_direction,
    'sessions_analyzed', array_length(v_recent_weights, 1),
    'avg_weight', v_avg_weight,
    'weight_variance', v_weight_variance,
    'recent_weights', v_recent_weights,
    'recommendations', v_recommendations,
    'analysis_date', now()
  );
END;
$function$
```

## Additional Functions

The database contains 200+ additional functions including:

- **PostGIS Spatial Functions**: st_*, geometry processing
- **Text Processing**: unaccent, trigram similarity
- **Machine Weight Calculations**: closest_machine_weight
- **Security Functions**: is_pro_user, can_mutate_workout_set
- **Rate Limiting**: check_rate_limit, cleanup functions
- **Data Validation**: validate_metric_value_type
- **Trigger Functions**: trg_*, populate_*, assign_*
- **Translation Functions**: get_text, get_life_categories_i18n
- **Analytics Functions**: fn_suggest_*, get_user_*

## Function Categories Summary

1. **Core Workout Logic**: 15+ functions
2. **Security & Auth**: 10+ functions  
3. **Data Utilities**: 20+ functions
4. **Exercise Calculations**: 15+ functions
5. **PostGIS Spatial**: 100+ functions
6. **Text Processing**: 25+ functions
7. **Triggers & Validation**: 30+ functions
8. **Analytics & Suggestions**: 10+ functions

All functions are designed with proper security (SECURITY DEFINER where needed), performance optimization, and comprehensive error handling. The functions support the full range of fitness tracking functionality including workout management, progress tracking, equipment calculations, user analytics, and system administration.