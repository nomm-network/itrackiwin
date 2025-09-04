# Database Functions Documentation

## Overview
This document contains all database functions, triggers, and stored procedures in the iTrackiWin application.

## Core Utility Functions

### `compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)`
**Type**: SQL Function (Immutable)  
**Returns**: `numeric`  
**Description**: Calculates total weight based on entry mode (total weight vs per-side loading)

```sql
SELECT CASE
  WHEN p_entry_mode = 'total' THEN COALESCE(p_value,0)
  WHEN p_entry_mode = 'one_side' THEN COALESCE(p_bar_weight,0) + 
    CASE WHEN COALESCE(p_is_symmetrical,true) THEN 2 ELSE 1 END * COALESCE(p_value,0)
  ELSE null
END;
```

---

### `slugify(txt text)`
**Type**: SQL Function (Immutable)  
**Returns**: `text`  
**Description**: Converts text to URL-friendly slug format

```sql
SELECT CASE
  WHEN txt IS NULL OR btrim(txt) = '' THEN NULL
  ELSE btrim(
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
```

---

### `short_hash_uuid(u uuid)`
**Type**: SQL Function (Immutable)  
**Returns**: `text`  
**Description**: Creates a short hash from UUID for display purposes

```sql
SELECT substr(encode(digest(u::text, 'sha256'), 'hex'), 1, 6)
```

---

### `update_updated_at_column()`
**Type**: PL/pgSQL Trigger Function  
**Returns**: `trigger`  
**Description**: Automatically updates `updated_at` timestamp on row modifications

```sql
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
```

---

## Weight and Progression Functions

### `next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)`
**Type**: SQL Function (Immutable)  
**Returns**: `numeric`  
**Description**: Calculates minimum weight increment based on loading type

```sql
SELECT CASE
  WHEN p_load_type = 'dual_load' THEN 2 * COALESCE(p_side_min_plate_kg, 1.25)
  WHEN p_load_type IN ('single_load','stack') THEN COALESCE(p_single_min_increment_kg, 2.5)
  ELSE 0
END;
```

---

### `closest_machine_weight(desired numeric, stack numeric[], aux numeric[])`
**Type**: PL/pgSQL Function (Immutable)  
**Returns**: `numeric`  
**Description**: Finds closest achievable weight on machine with stack and auxiliary plates

```sql
DECLARE
  candidate numeric;
  best numeric := NULL;
  diff numeric := NULL;
  a numeric;
BEGIN
  -- Check stack steps and stack + aux combinations
  FOREACH candidate IN ARRAY stack LOOP
    IF diff IS NULL OR abs(candidate - desired) < diff THEN
      best := candidate; diff := abs(candidate - desired);
    END IF;
    FOREACH a IN ARRAY aux LOOP
      IF diff IS NULL OR abs(candidate + a - desired) < diff THEN
        best := candidate + a; diff := abs(candidate + a - desired);
      END IF;
    END LOOP;
  END LOOP;
  RETURN COALESCE(best, 0);
END
```

---

### `bar_min_increment(_gym_id uuid)`
**Type**: SQL Function (Stable, Security Definer)  
**Returns**: `numeric`  
**Description**: Calculates minimum barbell increment based on available plates

```sql
WITH all_fracs AS (
  SELECT weight FROM public.user_gym_plates WHERE user_gym_id = _gym_id
  UNION
  SELECT weight FROM public.user_gym_miniweights WHERE user_gym_id = _gym_id
)
SELECT COALESCE(MIN(weight), 1)::numeric * 2
FROM all_fracs;
```

---

### `epley_1rm(weight numeric, reps integer)`
**Type**: PL/pgSQL Function (Immutable)  
**Returns**: `numeric`  
**Description**: Calculates 1RM using Epley formula

```sql
BEGIN
  IF weight IS NULL OR reps IS NULL OR reps <= 0 THEN
    RETURN NULL;
  END IF;
  RETURN weight * (1 + reps::numeric / 30.0);
END;
```

---

## Workout Management Functions

### `start_workout(p_template_id uuid)`
**Type**: RPC Function  
**Returns**: `uuid`  
**Description**: Creates a new workout session from template or blank

**Security**: Requires authenticated user (`auth.uid()`)  
**Usage**: Called from frontend to start workout sessions

---

### `end_workout(p_workout_id uuid)`
**Type**: PL/pgSQL Function  
**Returns**: `uuid`  
**Description**: Marks a workout as completed

```sql
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
```

---

### `log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])`
**Type**: PL/pgSQL Function (Security Definer)  
**Returns**: `uuid`  
**Description**: Records a completed workout set with metrics and grips

```sql
DECLARE
  v_set_id uuid;
  v_metric_def RECORD;
  v_grip_id uuid;
BEGIN
  -- Insert workout set
  INSERT INTO workout_sets (
    workout_exercise_id, set_index, is_completed, completed_at
  ) VALUES (
    p_workout_exercise_id, p_set_index, true, now()
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
        workout_set_id, metric_def_id, value
      ) VALUES (
        v_set_id, v_metric_def.id, p_metrics -> v_metric_def.slug
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
```

---

### `get_next_set_index(p_workout_exercise_id uuid)`
**Type**: PL/pgSQL Function (Security Definer)  
**Returns**: `integer`  
**Description**: Gets the next set index for a workout exercise

```sql
DECLARE
  v_max_index integer;
BEGIN
  SELECT COALESCE(MAX(set_index), 0) INTO v_max_index
  FROM workout_sets
  WHERE workout_exercise_id = p_workout_exercise_id;
  
  RETURN v_max_index + 1;
END;
```

---

## AI Coaching and Suggestion Functions

### `fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_working_reps integer)`
**Type**: PL/pgSQL Function (Stable)  
**Returns**: `jsonb`  
**Description**: Suggests warmup progression for an exercise

```sql
DECLARE
  v_user_id UUID := auth.uid();
  v_last_weight NUMERIC;
  v_target_weight NUMERIC;
  v_warmup_sets JSONB := '[]'::jsonb;
  v_set JSONB;
  i INTEGER;
BEGIN
  -- Get last working weight for this exercise
  SELECT lws.weight INTO v_last_weight
  FROM public.v_last_working_set lws
  WHERE lws.user_id = v_user_id 
    AND lws.exercise_id = p_exercise_id;

  -- Use provided weight or fall back to last weight
  v_target_weight := COALESCE(p_working_weight, v_last_weight, 60);

  -- Generate warmup progression: 40%, 60%, 80% of working weight
  FOR i IN 1..3 LOOP
    v_set := jsonb_build_object(
      'set_index', i,
      'weight', ROUND(v_target_weight * (0.2 + i * 0.2), 2.5),
      'reps', GREATEST(15 - i * 3, 5),
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
```

---

### `fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)`
**Type**: PL/pgSQL Function (Stable)  
**Returns**: `jsonb`  
**Description**: Suggests working sets based on progression strategy

**Progression Types:**
- `linear`: Simple weight progression
- `percentage`: Based on estimated 1RM
- `pyramid`: Multiple sets building up

---

### `fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text)`
**Type**: PL/pgSQL Function (Stable)  
**Returns**: `integer`  
**Description**: Suggests rest time based on set type and effort level

**Effort Levels:** `easy`, `moderate`, `hard`, `max`  
**Base Rest Times:**
- Warmup: 30s
- Normal: 180s (3 min)
- Top Set: 240s (4 min)
- AMRAP: 300s (5 min)

---

### `fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)`
**Type**: PL/pgSQL Function (Stable)  
**Returns**: `jsonb`  
**Description**: Analyzes recent performance to detect plateaus

```sql
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

  -- Analysis logic for detecting stagnation patterns
  -- Returns recommendations for breaking plateaus
END;
```

---

## Data Quality and Analysis Functions

### `generate_exercise_name(movement_id uuid, equipment_ref_id uuid, primary_muscle_name text, attributes jsonb, handle_key text, grip_type_key text, language_code text)`
**Type**: Function  
**Returns**: `text`  
**Description**: Automatically generates exercise names based on components

---

### `get_last_sets_for_exercises(p_exercise_ids uuid[])`
**Type**: PL/pgSQL Function (Stable, Security Definer)  
**Returns**: Table with exercise performance history  
**Description**: Retrieves last performance data for multiple exercises

---

### `get_user_last_set_for_exercise(p_exercise_id uuid)`
**Type**: PL/pgSQL Function (Stable)  
**Returns**: Table with last set data  
**Description**: Gets most recent set data for specific exercise

---

### `get_user_pr_for_exercise(p_exercise_id uuid)`
**Type**: PL/pgSQL Function (Stable)  
**Returns**: Table with PR data  
**Description**: Retrieves personal record for specific exercise

---

## Security and Admin Functions

### `is_admin(_user_id uuid)`
**Type**: Function (Security Definer)  
**Returns**: `boolean`  
**Description**: Checks if user has admin privileges

---

### `has_role(_user_id uuid, _role app_role)`
**Type**: SQL Function (Stable, Security Definer)  
**Returns**: `boolean`  
**Description**: Checks if user has specific role

```sql
SELECT EXISTS (
  SELECT 1
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = _role
)
```

---

### `is_admin_with_rate_limit(_user_id uuid)`
**Type**: PL/pgSQL Function (Security Definer)  
**Returns**: `boolean`  
**Description**: Admin check with rate limiting to prevent abuse

---

### `create_admin_user(target_user_id uuid, requester_role text)`
**Type**: PL/pgSQL Function (Security Definer)  
**Returns**: `boolean`  
**Description**: Creates admin user with proper authorization checks

---

### `log_admin_action(action_type text, target_user_id uuid, details jsonb)`
**Type**: PL/pgSQL Function (Security Definer)  
**Returns**: `void`  
**Description**: Logs administrative actions for audit trail

---

## Trigger Functions

### `assign_next_set_index()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Automatically assigns sequential set indexes

---

### `trg_after_set_logged()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Recalculates warmup recommendations after set completion

---

### `trg_init_warmup()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Initializes warmup plan for new workout exercises

---

### `trg_te_sync_weights()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Synchronizes weight units across related records

---

### `exercises_autoname_tg()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Automatically generates exercise display names

---

### `populate_grip_key_from_workout_exercise()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Populates grip keys from workout exercise data

---

### `enforce_max_pins()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Enforces maximum number of pinned subcategories per user

---

### `handle_new_user()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Creates user profile when new auth user is created

---

## Validation Functions

### `validate_metric_value_type()`
**Type**: PL/pgSQL Trigger Function  
**Description**: Validates that metric values match expected data types

```sql
DECLARE
  expected_type public.metric_value_type;
BEGIN
  SELECT md.value_type INTO expected_type
  FROM public.metric_defs md
  WHERE md.id = NEW.metric_def_id;
  
  CASE expected_type
    WHEN 'number' THEN
      IF NOT (NEW.value ? 'number' AND jsonb_typeof(NEW.value->'number') = 'number') THEN
        RAISE EXCEPTION 'Expected number value for metric %', NEW.metric_def_id;
      END IF;
    -- Additional type validations...
  END CASE;
  
  RETURN NEW;
END;
```

---

### `can_mutate_workout_set(_we_id uuid)`
**Type**: PL/pgSQL Function (Security Definer)  
**Returns**: `boolean`  
**Description**: Checks if user can modify workout set

```sql
DECLARE
  u uuid := auth.uid();
BEGIN
  IF u IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.workout_exercises we
    JOIN public.workouts w ON w.id = we.workout_id
    WHERE we.id = _we_id
      AND w.user_id = u
  );
END
```

---

## Utility and Helper Functions

### `get_text(p_key text, p_language_code text)`
**Type**: SQL Function (Stable)  
**Returns**: `text`  
**Description**: Retrieves localized text with fallback to English

---

### `get_life_categories_i18n(lang_code text)`
**Type**: SQL Function (Stable)  
**Returns**: Table with localized categories  
**Description**: Returns life categories with translations

---

### `get_user_coach_params(_user_id uuid)`
**Type**: SQL Function (Stable, Security Definer)  
**Returns**: Table with coaching parameters  
**Description**: Retrieves user's coaching configuration

---

### `generate_warmup_steps(p_top_kg numeric)`
**Type**: PL/pgSQL Function  
**Returns**: `jsonb`  
**Description**: Generates standard warmup progression

```sql
BEGIN
  RETURN jsonb_build_array(
    jsonb_build_object('percent', 0.40, 'reps', 10, 'rest_s', 60,  'kg', ROUND(p_top_kg*0.40,1)),
    jsonb_build_object('percent', 0.60, 'reps', 8,  'rest_s', 90,  'kg', ROUND(p_top_kg*0.60,1)),
    jsonb_build_object('percent', 0.80, 'reps', 5,  'rest_s', 120, 'kg', ROUND(p_top_kg*0.80,1))
  );
END;
```

---

### `make_grip_key(_grip_ids uuid[])`
**Type**: SQL Function (Immutable)  
**Returns**: `text`  
**Description**: Creates consistent grip key from array of grip IDs

---

### `create_demo_template_for_current_user()`
**Type**: PL/pgSQL Function  
**Returns**: `uuid`  
**Description**: Creates demo workout template for new users

---

## Special Database Functions

### PostGIS Functions
The database includes PostGIS extension functions for spatial data:
- `st_distance()`, `st_area()`, `st_length()`
- `st_force2d()`, `st_force3d()`, `st_azimuth()`
- Geometry input/output functions

### Text Search Functions
- `unaccent()`: Removes accents from text
- `similarity()`: Text similarity scoring
- `word_similarity()`: Word-level similarity
- Various trigram functions for fuzzy matching

---

## Function Usage Patterns

### Security Model
1. **Security Definer**: Functions that need elevated privileges
2. **Stable/Immutable**: Functions that don't modify data
3. **RLS Integration**: Functions respect row-level security

### Error Handling
Most functions include proper error handling:
- Authentication checks
- Input validation
- Meaningful error messages
- Transaction safety

### Performance Considerations
- Functions use appropriate indexes
- Set-based operations preferred over loops
- Materialized views for expensive calculations
- Proper query planning for complex joins