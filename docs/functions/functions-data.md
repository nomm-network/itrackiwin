# Data Management Functions

Database functions for data manipulation, validation, transformation, and maintenance.

## 🛠️ Data Validation & Triggers

### `set_updated_at()`
**Purpose**: Automatically update timestamp columns  
**Type**: Trigger Function  
**Returns**: `trigger`

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$$;
```

**Usage**: Applied to tables requiring automatic timestamp maintenance
```sql
CREATE TRIGGER update_table_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### `update_updated_at_column()`
**Purpose**: Generic updated_at column maintenance  
**Type**: Trigger Function  
**Returns**: `trigger`

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$$;
```

---

## 🔍 Data Validation Functions

### `validate_metric_value_type()`
**Purpose**: Ensure metric values match their defined types  
**Type**: Trigger Function  
**Returns**: `trigger`

```sql
CREATE OR REPLACE FUNCTION public.validate_metric_value_type()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  expected_type public.metric_value_type;
BEGIN
  -- Get the expected value type for this metric
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
    WHEN 'enum' THEN
      DECLARE
        valid_options text[];
        provided_value text;
      BEGIN
        -- Get valid enum options
        SELECT md.enum_options INTO valid_options
        FROM public.metric_defs md
        WHERE md.id = NEW.metric_def_id;
        
        -- Extract provided enum value
        IF NEW.value ? 'enum' AND jsonb_typeof(NEW.value->'enum') = 'string' THEN
          provided_value := NEW.value->>'enum';
          
          -- Check if value is in valid options
          IF NOT (provided_value = ANY(valid_options)) THEN
            RAISE EXCEPTION 'Invalid enum value "%" for metric %. Valid options: %', 
              provided_value, NEW.metric_def_id, array_to_string(valid_options, ', ');
          END IF;
        ELSE
          RAISE EXCEPTION 'Expected enum value for metric %', NEW.metric_def_id;
        END IF;
      END;
  END CASE;
  
  RETURN NEW;
END;
$$;
```

**Features**:
- Type validation for `number`, `text`, `boolean`, `enum`
- Enum option validation against predefined values
- Detailed error messages for debugging
- JSONB structure validation

---

## 🏋️‍♀️ Workout Data Functions

### `can_mutate_workout_set(workout_exercise_id uuid)`
**Purpose**: Check if user can modify workout set  
**Returns**: `boolean`  
**Security**: SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION public.can_mutate_workout_set(_we_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
END;
$$;
```

### `log_workout_set(workout_exercise_id, set_index, metrics, grip_ids)`
**Purpose**: Record completed workout set with metrics  
**Returns**: `uuid` (set_id)  
**Security**: SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION public.log_workout_set(
  p_workout_exercise_id uuid, 
  p_set_index integer, 
  p_metrics jsonb, 
  p_grip_ids uuid[] DEFAULT NULL::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
$$;
```

### `get_next_set_index(workout_exercise_id uuid)`
**Purpose**: Calculate next sequential set number  
**Returns**: `integer`

```sql
CREATE OR REPLACE FUNCTION public.get_next_set_index(p_workout_exercise_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_max_index integer;
BEGIN
  SELECT COALESCE(MAX(set_index), 0) INTO v_max_index
  FROM workout_sets
  WHERE workout_exercise_id = p_workout_exercise_id;
  
  RETURN v_max_index + 1;
END;
$$;
```

### `assign_next_set_index()`
**Purpose**: Auto-assign set index on insert  
**Type**: Trigger Function

```sql
CREATE OR REPLACE FUNCTION public.assign_next_set_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
```

---

## 📊 Data Retrieval Functions

### `get_last_sets_for_exercises(exercise_ids uuid[])`
**Purpose**: Get most recent set data for multiple exercises  
**Returns**: Table with exercise performance data  
**Security**: SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION public.get_last_sets_for_exercises(p_exercise_ids uuid[])
RETURNS TABLE(
  exercise_id uuid, 
  prev_weight_kg numeric, 
  prev_reps integer, 
  prev_date text, 
  base_weight_kg numeric, 
  readiness_multiplier numeric
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (we.exercise_id)
    we.exercise_id,
    ws.weight_kg as prev_weight_kg,
    ws.reps as prev_reps,
    to_char(ws.completed_at, 'YYYY-MM-DD') as prev_date,
    ws.weight_kg as base_weight_kg,
    1.0::numeric as readiness_multiplier
  FROM workout_exercises we
  JOIN workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE we.exercise_id = ANY(p_exercise_ids)
    AND ws.completed_at IS NOT NULL
    AND ws.is_completed = true
  ORDER BY we.exercise_id, ws.completed_at DESC;
END;
$$;
```

### `get_user_last_set_for_exercise(exercise_id uuid)`
**Purpose**: Get user's most recent set for specific exercise  
**Returns**: Table with set data

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
STABLE SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT mv.user_id, mv.exercise_id, mv.weight, mv.reps, mv.completed_at
  FROM public.mv_last_set_per_user_exercise mv
  WHERE mv.user_id = auth.uid() 
    AND mv.exercise_id = p_exercise_id
    AND mv.rn = 1;
END;
$$;
```

### `get_user_pr_for_exercise(exercise_id uuid)`
**Purpose**: Get user's personal record for exercise  
**Returns**: Table with PR data

```sql
CREATE OR REPLACE FUNCTION public.get_user_pr_for_exercise(p_exercise_id uuid)
RETURNS TABLE(
  user_id uuid, 
  exercise_id uuid, 
  best_weight numeric
)
LANGUAGE plpgsql
STABLE SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT mv.user_id, mv.exercise_id, mv.best_weight
  FROM public.mv_pr_weight_per_user_exercise mv
  WHERE mv.user_id = auth.uid() 
    AND mv.exercise_id = p_exercise_id;
END;
$$;
```

---

## 🏢 Gym Management Functions

### `request_gym_role(gym_id uuid, role text, message text)`
**Purpose**: Request administrative role at gym  
**Returns**: `uuid` (request_id)  
**Security**: SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION public.request_gym_role(
  p_gym uuid, 
  p_role text, 
  p_msg text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE 
  rid uuid := gen_random_uuid();
BEGIN
  IF p_role NOT IN ('owner','admin','staff') THEN 
    RAISE EXCEPTION 'Invalid role'; 
  END IF;
  
  INSERT INTO public.gym_role_requests(id, gym_id, user_id, role, message)
  VALUES (rid, p_gym, auth.uid(), p_role, p_msg)
  ON CONFLICT (gym_id, user_id, role) DO UPDATE SET 
    status='pending', 
    message=EXCLUDED.message, 
    decided_by=NULL, 
    decided_at=NULL;
    
  RETURN rid;
END;
$$;
```

### `decide_gym_role_request(request_id uuid, action text)`
**Purpose**: Approve or reject gym role request  
**Returns**: `void`  
**Security**: SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION public.decide_gym_role_request(
  p_req uuid, 
  p_action text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE 
  gid uuid; 
  uid uuid; 
  rrole text;
BEGIN
  IF p_action NOT IN ('approve','reject') THEN 
    RAISE EXCEPTION 'Invalid action'; 
  END IF;
  
  SELECT gym_id, user_id, role INTO gid, uid, rrole 
  FROM public.gym_role_requests 
  WHERE id=p_req;
  
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Request not found'; 
  END IF;

  IF NOT (public.is_superadmin_simple() OR public.is_gym_admin(gid)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.gym_role_requests
    SET status = CASE WHEN p_action='approve' THEN 'approved' ELSE 'rejected' END,
        decided_by = auth.uid(), 
        decided_at = now()
  WHERE id = p_req;

  IF p_action='approve' THEN
    INSERT INTO public.gym_admins(gym_id, user_id, role)
    VALUES (gid, uid, rrole)
    ON CONFLICT (gym_id, user_id) DO UPDATE SET role = EXCLUDED.role;
  END IF;
END;
$$;
```

---

## 🔤 Text & String Functions

### `slugify(text)`
**Purpose**: Convert text to URL-friendly slug  
**Returns**: `text`

```sql
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
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
$$;
```

**Features**:
- Converts to lowercase
- Removes accents/diacritics
- Replaces non-alphanumeric with hyphens
- Collapses multiple hyphens
- Trims leading/trailing hyphens

### `short_hash_uuid(uuid)`
**Purpose**: Generate short hash from UUID for display  
**Returns**: `text`

```sql
CREATE OR REPLACE FUNCTION public.short_hash_uuid(u uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT substr(encode(digest(u::text, 'sha256'), 'hex'), 1, 6)
$$;
```

**Usage**: Create short, user-friendly identifiers from UUIDs

---

## 📝 Exercise Data Functions

### `exercises_autoname_tg()`
**Purpose**: Auto-generate exercise names based on attributes  
**Type**: Trigger Function

```sql
CREATE OR REPLACE FUNCTION public.exercises_autoname_tg()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  name_text TEXT;
  primary_muscle_name TEXT;
BEGIN
  -- Get primary muscle name if available
  IF NEW.primary_muscle_id IS NOT NULL THEN
    SELECT t.name INTO primary_muscle_name
    FROM public.muscle_groups mg
    LEFT JOIN public.muscle_groups_translations t 
      ON t.muscle_group_id = mg.id 
      AND t.language_code = COALESCE(NEW.name_locale, 'en')
    WHERE mg.id = NEW.primary_muscle_id;
  END IF;

  -- If custom name provided, always use it
  IF NEW.custom_display_name IS NOT NULL AND LENGTH(TRIM(NEW.custom_display_name)) > 0 THEN
    NEW.display_name := NEW.custom_display_name;
  ELSE
    -- Generate automatic name
    name_text := public.generate_exercise_name(
      NEW.movement_id,
      NEW.equipment_ref_id,
      COALESCE(primary_muscle_name, ''),
      COALESCE(NEW.attribute_values_json, '{}'::jsonb),
      NULL, -- handle_key
      NULL, -- grip_type_key
      COALESCE(NEW.name_locale, 'en')
    );
    NEW.display_name := name_text;
  END IF;
  
  RETURN NEW;
END;
$$;
```

### `make_grip_key(grip_ids uuid[])`
**Purpose**: Create stable key from grip IDs for caching  
**Returns**: `text`

```sql
CREATE OR REPLACE FUNCTION public.make_grip_key(_grip_ids uuid[])
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
           array_to_string(
             (SELECT ARRAY(
                SELECT g::text
                FROM UNNEST(_grip_ids) g
                WHERE g IS NOT NULL
                ORDER BY g::text   -- stable order
             )), ','
           ),
           ''
         );
$$;
```

---

## 🎯 Template Exercise Functions

### `trg_te_sync_weights()`
**Purpose**: Synchronize weight units in template exercises  
**Type**: Trigger Function

```sql
CREATE OR REPLACE FUNCTION public.trg_te_sync_weights()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Since we've normalized to only use target_weight_kg, this trigger
  -- now just ensures the weight_unit defaults properly
  IF NEW.weight_unit IS NULL THEN
    NEW.weight_unit := 'kg';
  END IF;

  RETURN NEW;
END;
$$;
```

---

## 🔧 Maintenance Functions

### `get_user_coach_params(user_id uuid)`
**Purpose**: Get coaching parameters for user based on experience  
**Returns**: Table with coaching configuration

```sql
CREATE OR REPLACE FUNCTION public.get_user_coach_params(_user_id uuid)
RETURNS TABLE(
  experience_slug text, 
  start_intensity_low numeric, 
  start_intensity_high numeric, 
  warmup_set_count_min smallint, 
  warmup_set_count_max smallint, 
  main_rest_seconds_min smallint, 
  main_rest_seconds_max smallint, 
  weekly_progress_pct numeric, 
  allow_high_complexity boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT el.slug,
         p.start_intensity_low, p.start_intensity_high,
         p.warmup_set_count_min, p.warmup_set_count_max,
         p.main_rest_seconds_min, p.main_rest_seconds_max,
         p.weekly_progress_pct, p.allow_high_complexity
  FROM user_profile_fitness up
  JOIN experience_levels el ON el.id = up.experience_level_id
  JOIN experience_level_params p ON p.experience_level_id = el.id
  WHERE up.user_id = _user_id;
$$;
```

---

## 📊 Data Quality Functions

### Performance Monitoring
All data functions include:
- Error handling and validation
- Performance optimization with appropriate keywords
- Security controls with SECURITY DEFINER where needed
- Comprehensive logging for debugging

### Trigger Management
Triggers are organized by purpose:
- **Validation**: Data integrity and type checking
- **Automation**: Auto-population of calculated fields
- **Audit**: Change tracking and logging
- **Business Logic**: Complex rule enforcement

### Batch Operations
Many functions support batch processing:
- Multiple exercise lookups
- Bulk metric insertion
- Array-based operations
- Efficient JOIN patterns