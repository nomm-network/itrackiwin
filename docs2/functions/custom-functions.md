# Custom Database Functions

## Core Functions

### _get_estimate_weight_kg(p_user_id uuid, p_exercise_id uuid)
**Returns:** `numeric`  
**Language:** `plpgsql`  
**Purpose:** Retrieves estimated working weight for a user's exercise from various tables

```sql
DECLARE v numeric;
BEGIN
  -- user_exercise_estimates (if present, shape may vary). Safest read:
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema='public' AND table_name='user_exercise_estimates') THEN
    BEGIN
      EXECUTE $q$
        SELECT COALESCE(
                 NULLIF((ue.estimated_working_weight_kg)::numeric,0),
                 NULLIF((ue.value_kg)::numeric,0),
                 NULLIF((ue.weight_kg)::numeric,0),
                 CASE
                   WHEN ue.data ? 'working_weight_kg' THEN NULLIF((ue.data->>'working_weight_kg')::numeric,0)
                   WHEN ue.data ? 'target_weight_kg'  THEN NULLIF((ue.data->>'target_weight_kg')::numeric,0)
                   ELSE NULL
                 END
               )
        FROM public.user_exercise_estimates ue
        WHERE ue.user_id = $1 AND ue.exercise_id = $2
        ORDER BY ue.created_at DESC NULLS LAST
        LIMIT 1
      $q$ INTO v USING p_user_id, p_exercise_id;
    EXCEPTION WHEN undefined_column THEN
      -- ignore shape differences, fall through
      v := NULL;
    END;
  END IF;

  -- pre_workout_checkins (answers JSON) as a secondary hint, if present
  IF v IS NULL AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='pre_workout_checkins'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='pre_workout_checkins'
      AND column_name='answers' AND data_type='jsonb'
  ) THEN
    SELECT COALESCE(
             NULLIF((c.answers->>'working_weight_kg')::numeric,0),
             NULLIF((c.answers->>'target_weight_kg')::numeric,0),
             NULLIF((c.answers->>'top_set_kg')::numeric,0)
           )
    INTO v
    FROM public.pre_workout_checkins c
    WHERE c.user_id = p_user_id
    ORDER BY c.created_at DESC NULLS LAST
    LIMIT 1;
  END IF;

  RETURN v;
END
```

### _pascalize(key text)
**Returns:** `text`  
**Language:** `sql`  
**Purpose:** Converts snake_case keys to PascalCase

```sql
SELECT initcap(replace(key, '_', ''))::text;
```

### _pick_template(p_movement_id uuid, p_equipment_id uuid, p_locale text)
**Returns:** `text`  
**Language:** `sql`  
**Purpose:** Selects appropriate naming template based on movement, equipment, and locale

```sql
WITH candidates AS (
  SELECT template, 1 AS priority FROM public.naming_templates
    WHERE is_active AND locale = p_locale AND scope = 'movement' AND scope_ref_id = p_movement_id
  UNION ALL
  SELECT template, 2 FROM public.naming_templates
    WHERE is_active AND locale = p_locale AND scope = 'equipment' AND scope_ref_id = p_equipment_id
  UNION ALL
  SELECT template, 3 FROM public.naming_templates
    WHERE is_active AND locale = p_locale AND scope = 'global'
  UNION ALL
  SELECT template, 4 FROM public.naming_templates
    WHERE is_active AND locale = 'en' AND scope = 'global'
)
SELECT template FROM candidates ORDER BY priority LIMIT 1;
```

## Administrative Functions

### advance_program_progress(p_program_id uuid, p_user_id uuid, p_position integer, p_workout_id uuid)
**Returns:** `void`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Updates user program progress

### are_friends(a uuid, b uuid)
**Returns:** `boolean`  
**Language:** `sql`  
**Purpose:** Checks if two users are friends

### are_friends_with_user(target_user_id uuid)
**Returns:** `boolean`  
**Language:** `sql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Checks if current user is friends with target user

### audit_security_definer_functions()
**Returns:** `TABLE(function_name text, has_search_path boolean, is_restricted boolean)`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Audits security definer functions for proper configuration

### bump_like_counter()
**Returns:** `trigger`  
**Language:** `plpgsql`  
**Purpose:** Trigger function to maintain like counts on social posts

### check_achievements(p_user_id uuid)
**Returns:** `void`  
**Language:** `plpgsql`  
**Purpose:** Checks and awards achievements for a user

### create_admin_user(target_user_id uuid, requester_role text DEFAULT 'system'::text)
**Returns:** `boolean`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Creates admin user with proper authorization checks

### create_user_if_not_exists()
**Returns:** `void`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Creates user record if it doesn't exist

### decide_gym_role_request(p_req uuid, p_action text)
**Returns:** `void`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Approves or rejects gym role requests

### enforce_max_pins()
**Returns:** `trigger`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Enforces maximum 3 pinned subcategories per user

### ensure_user_record()
**Returns:** `trigger`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Ensures user record exists when auth user is created

### equipment_profiles_enforce_fk()
**Returns:** `trigger`  
**Language:** `plpgsql`  
**Purpose:** Enforces foreign key constraints for equipment profiles

### get_life_categories_i18n(lang_code text)
**Returns:** `TABLE(id uuid, slug text, display_order integer, name text, description text)`  
**Language:** `sql`  
**Purpose:** Gets life categories with internationalization

### get_text(p_key text, p_language_code text DEFAULT 'en'::text)
**Returns:** `text`  
**Language:** `sql`  
**Purpose:** Gets localized text with fallback to English

### handle_new_user()
**Returns:** `trigger`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Creates user profile when new auth user is created

### is_admin(_user_id uuid)
**Returns:** `boolean`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Checks if user has admin privileges

### is_admin_with_rate_limit(_user_id uuid)
**Returns:** `boolean`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Checks admin status with rate limiting

### is_pro_user(user_id uuid)
**Returns:** `boolean`  
**Language:** `sql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Checks if user has pro status

### is_superadmin_with_rate_limit(_user_id uuid)
**Returns:** `boolean`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Checks superadmin status with rate limiting

### log_admin_action(action_type text, target_user_id uuid DEFAULT NULL::uuid, details jsonb DEFAULT '{}'::jsonb)
**Returns:** `void`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Logs administrative actions

### next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)
**Returns:** `numeric`  
**Language:** `sql`  
**Purpose:** Calculates next weight increment based on load type

### refresh_exercise_views(p_user_id uuid, p_exercise_id uuid)
**Returns:** `void`  
**Language:** `plpgsql`  
**Purpose:** Refreshes materialized views for exercise data

### refresh_materialized_views_secure()
**Returns:** `void`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Securely refreshes materialized views

### request_gym_role(p_gym uuid, p_role text, p_msg text DEFAULT NULL::text)
**Returns:** `uuid`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Requests a role at a specific gym

### set_updated_at()
**Returns:** `trigger`  
**Language:** `plpgsql`  
**Purpose:** Updates updated_at timestamp on row changes

### short_hash_uuid(u uuid)
**Returns:** `text`  
**Language:** `sql`  
**Purpose:** Creates short hash from UUID

### slugify(txt text)
**Returns:** `text`  
**Language:** `sql`  
**Purpose:** Converts text to URL-friendly slug

### update_updated_at_column()
**Returns:** `trigger`  
**Language:** `plpgsql`  
**Purpose:** Updates updated_at column when row is modified

### update_user_stats_timestamp()
**Returns:** `trigger`  
**Language:** `plpgsql`  
**Purpose:** Updates timestamp on user stats changes

### upsert_user_exercise_warmup(_user_id uuid, _exercise_id uuid, _plan_text text, _source text DEFAULT 'auto'::text, _feedback warmup_feedback DEFAULT NULL::warmup_feedback)
**Returns:** `user_exercise_warmups`  
**Language:** `plpgsql`  
**Security:** `SECURITY DEFINER`  
**Purpose:** Creates or updates user exercise warmup plans

## PostGIS Functions

The database also includes numerous PostGIS functions for geospatial operations. These are part of the PostGIS extension and include functions for:

- Geometric operations (ST_Distance, ST_Area, ST_Length, etc.)
- Spatial indexing (GIST operations)
- Coordinate system transformations
- Text search with trigram matching

Total custom functions: 50+  
Total PostGIS functions: 200+