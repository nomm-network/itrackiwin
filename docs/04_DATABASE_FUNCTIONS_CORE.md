# Database Functions - Core Business & System Functions

**Export Date:** 2025-01-08  
**Database Type:** PostgreSQL  
**Schema:** public  

This document provides a comprehensive overview of all core business logic, system, and utility functions in the database. These functions handle the main application workflow, authorization, data processing, and business rules.

---

## Overview

The database contains **899 total functions** split across two documentation files:
- **Core Business & System Functions** (this file): ~475 functions
- **PostGIS & Text Processing Functions**: ~424 functions

### Function Categories in This File

1. **Business Logic Functions**: Workout management, exercise calculations, user operations
2. **Authorization Functions**: Role checking, permissions, security
3. **System Functions**: Triggers, validation, data integrity
4. **Utility Functions**: Helper functions, calculations, formatting
5. **Workflow Functions**: Workout flow, template management

---

## Core Business Functions

### Workout Management Functions

#### `start_workout(p_template_id uuid DEFAULT NULL)`
**Language:** plpgsql  
**Returns:** uuid  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Creates a new workout session, optionally from a template. Handles readiness calculations, exercise copying, and warmup generation.

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
  v_score            numeric;
  v_multiplier       numeric;
  rec                RECORD;
  v_base_weight      numeric;
  v_target_weight    numeric;
  v_attr             jsonb;
BEGIN
  -- Auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create workout shell
  INSERT INTO public.workouts (user_id, started_at, template_id)
  VALUES (v_user_id, now(), p_template_id)
  RETURNING id INTO v_workout_id;

  -- If no template: just return new workout id
  IF p_template_id IS NULL THEN
    RETURN v_workout_id;
  END IF;

  -- Template ownership validation
  IF NOT EXISTS (
    SELECT 1
    FROM public.workout_templates t
    WHERE t.id = p_template_id
      AND t.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Template not found or access denied';
  END IF;

  -- Compute readiness and multiplier
  SELECT public.compute_readiness_for_user(v_user_id)
  INTO v_score;

  SELECT public.readiness_multiplier(COALESCE(v_score, 65))
  INTO v_multiplier;

  -- Copy template exercises to workout
  FOR rec IN
    SELECT te.exercise_id, te.order_index, te.default_sets, 
           te.target_reps, te.target_weight_kg, te.weight_unit
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST
  LOOP
    -- Get base load for progressive calculations
    SELECT public.pick_base_load(v_user_id, rec.exercise_id)
    INTO v_base_weight;

    -- Calculate target weight with readiness adjustment
    v_target_weight :=
      COALESCE(
        rec.target_weight_kg,
        CASE
          WHEN v_base_weight IS NULL THEN NULL
          ELSE ROUND(v_base_weight * v_multiplier, 1)
        END
      );

    -- Build metadata attributes
    v_attr := jsonb_build_object(
      'base_weight_kg',        v_base_weight,
      'readiness_score',       COALESCE(v_score, 65),
      'readiness_multiplier',  COALESCE(v_multiplier, 1.0)
    );

    -- Generate warmup if target weight exists
    IF v_target_weight IS NOT NULL THEN
      v_attr := jsonb_set(
        v_attr,
        '{warmup}',
        public.generate_warmup_steps(v_target_weight),
        true
      );
    END IF;

    -- Insert workout exercise
    INSERT INTO public.workout_exercises (
      workout_id, exercise_id, order_index, target_sets,
      target_reps, target_weight_kg, weight_unit,
      attribute_values_json, readiness_adjusted_from
    )
    VALUES (
      v_workout_id, rec.exercise_id, rec.order_index, rec.default_sets,
      rec.target_reps, v_target_weight, COALESCE(rec.weight_unit, 'kg'),
      v_attr, NULL
    );
  END LOOP;

  -- Store workout-level readiness
  UPDATE public.workouts
  SET readiness_score = COALESCE(v_score, 65)
  WHERE id = v_workout_id;

  RETURN v_workout_id;
END;
$function$
```

#### `end_workout(p_workout_id uuid)`
**Language:** plpgsql  
**Returns:** uuid  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Completes a workout session by setting the end timestamp.

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

#### `log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])`
**Language:** plpgsql  
**Returns:** uuid  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Records a completed workout set with metrics and grip information.

### Exercise & Weight Functions

#### `epley_1rm(weight numeric, reps integer)`
**Language:** plpgsql  
**Returns:** numeric  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates estimated 1-rep max using Epley formula.

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

#### `compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)`
**Language:** sql  
**Returns:** numeric  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates total weight based on entry mode (total vs one-side loading).

#### `closest_machine_weight(desired numeric, stack numeric[], aux numeric[])`
**Language:** plpgsql  
**Returns:** numeric  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Finds the closest achievable weight on a machine given stack and auxiliary weights.

#### `next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)`
**Language:** sql  
**Returns:** numeric  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Calculates the minimum weight increment based on loading type and available plates.

### Template & Exercise Generation

#### `create_demo_template_for_current_user()`
**Language:** plpgsql  
**Returns:** uuid  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Creates a sample "Push Day" workout template for new users.

#### `generate_exercise_name(movement_id uuid, equipment_id uuid, muscle_name text, attributes jsonb, handle_key text, grip_type_key text, locale text)`
**Language:** plpgsql  
**Returns:** text  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Generates human-readable exercise names from components using naming templates.

#### `generate_warmup_steps(target_weight_kg numeric)`
**Language:** plpgsql  
**Returns:** jsonb  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Creates progressive warmup sets as percentages of working weight.

### Coach & AI Functions

#### `fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_working_reps integer)`
**Language:** plpgsql  
**Returns:** jsonb  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Suggests warmup progression for a specific exercise.

#### `fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)`
**Language:** plpgsql  
**Returns:** jsonb  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Recommends set/rep/weight combinations based on progression strategy.

#### `fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text)`
**Language:** plpgsql  
**Returns:** integer  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Calculates recommended rest time between sets based on effort and set type.

#### `fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)`
**Language:** plpgsql  
**Returns:** jsonb  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Analyzes recent performance to detect training plateaus and suggest interventions.

---

## Authorization Functions

### Role Checking Functions

#### `has_role(user_id uuid, role_name app_role)`
**Language:** sql  
**Returns:** boolean  
**Security:** SECURITY DEFINER  
**Volatility:** STABLE  

Checks if a user has a specific role.

#### `is_admin(user_id uuid)`
**Language:** sql  
**Returns:** boolean  
**Security:** SECURITY DEFINER  
**Volatility:** STABLE  

Returns true if user has admin or superadmin role.

#### `is_superadmin_simple()`
**Language:** sql  
**Returns:** boolean  
**Security:** SECURITY DEFINER  
**Volatility:** STABLE  

Quick check for superadmin status of current user.

#### `is_pro_user(user_id uuid)`
**Language:** sql  
**Returns:** boolean  
**Security:** SECURITY DEFINER  
**Volatility:** STABLE  

Checks if user has Pro subscription status.

#### `is_gym_admin(gym_id uuid)`
**Language:** sql  
**Returns:** boolean  
**Security:** SECURITY DEFINER  
**Volatility:** STABLE  

Verifies if current user is admin of specified gym.

### Permission Functions

#### `can_mutate_workout_set(_we_id uuid)`
**Language:** plpgsql  
**Returns:** boolean  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Validates if user can modify a specific workout set.

---

## System Functions

### Trigger Functions

#### `handle_new_user()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Automatically creates user profile when new auth user is created.

#### `set_updated_at()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Updates the updated_at timestamp on row modifications.

#### `update_updated_at_column()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Standard trigger function for maintaining updated_at columns.

#### `assign_next_set_index()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Auto-assigns sequential set numbers within a workout exercise.

#### `populate_grip_key_from_workout_exercise()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Automatically populates grip_key field from related grip data.

#### `exercises_autoname_tg()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Generates display names for exercises based on naming templates.

#### `trigger_initialize_warmup()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Sets up warmup progression when workout exercises are created.

#### `trg_after_set_logged()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Recalculates warmup recommendations after sets are completed.

#### `trg_te_sync_weights()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Synchronizes weight units across template exercises.

### Validation Functions

#### `validate_metric_value_type()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY INVOKER  
**Volatility:** VOLATILE  

Ensures metric values match their defined data types.

#### `enforce_max_pins()`
**Language:** plpgsql  
**Returns:** trigger  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Limits users to maximum 3 pinned subcategories.

---

## Utility Functions

### Text Processing

#### `slugify(txt text)`
**Language:** sql  
**Returns:** text  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Converts text to URL-friendly slugs.

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

#### `short_hash_uuid(u uuid)`
**Language:** sql  
**Returns:** text  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Creates short hash from UUID for display purposes.

#### `get_text(p_key text, p_language_code text)`
**Language:** sql  
**Returns:** text  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Retrieves internationalized text with fallback to English.

### Data Management

#### `make_grip_key(_grip_ids uuid[])`
**Language:** sql  
**Returns:** text  
**Security:** SECURITY INVOKER  
**Volatility:** IMMUTABLE  

Creates stable key from array of grip IDs for caching.

#### `get_next_set_index(p_workout_exercise_id uuid)`
**Language:** plpgsql  
**Returns:** integer  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Returns the next available set index for a workout exercise.

#### `bar_min_increment(_gym_id uuid)`
**Language:** sql  
**Returns:** numeric  
**Security:** SECURITY DEFINER  
**Volatility:** STABLE  

Calculates minimum barbell increment based on available plates.

### Specialized Query Functions

#### `get_life_categories_i18n(lang_code text)`
**Language:** sql  
**Returns:** TABLE  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Returns localized life categories with translation fallbacks.

#### `get_user_coach_params(_user_id uuid)`
**Language:** sql  
**Returns:** TABLE  
**Security:** SECURITY DEFINER  
**Volatility:** STABLE  

Retrieves coaching parameters based on user experience level.

#### `get_last_sets_for_exercises(p_exercise_ids uuid[])`
**Language:** plpgsql  
**Returns:** TABLE  
**Security:** SECURITY DEFINER  
**Volatility:** STABLE  

Bulk fetches last performance data for multiple exercises.

#### `get_user_last_set_for_exercise(p_exercise_id uuid)`
**Language:** plpgsql  
**Returns:** TABLE  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Gets most recent set data for a specific exercise.

#### `get_user_pr_for_exercise(p_exercise_id uuid)`
**Language:** plpgsql  
**Returns:** TABLE  
**Security:** SECURITY INVOKER  
**Volatility:** STABLE  

Retrieves personal record weight for an exercise.

---

## Admin Functions

#### `create_admin_user(target_user_id uuid, requester_role text)`
**Language:** plpgsql  
**Returns:** boolean  
**Security:** SECURITY DEFINER  
**Volatility:** VOLATILE  

Creates admin users with proper authorization and audit logging.

---

## Notes

- All functions include proper error handling and security checks
- Many functions use SECURITY DEFINER for elevated permissions with explicit user validation
- Trigger functions maintain data consistency and automate business logic
- Coach functions provide AI-driven recommendations for training
- Authorization functions enforce role-based access control throughout the application

This represents the core business logic of the fitness platform, handling everything from workout execution to user management and AI coaching features.