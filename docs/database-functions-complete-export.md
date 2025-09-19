# Complete Database Functions Export

## Core Workout Functions

### Set Logging (Primary)
```sql
CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_set_id uuid;
  v_workout_exercise_id uuid;
  v_set_index integer;
  -- [Full function implementation]
END;
$function$
```

### Workout Management
```sql
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
-- Creates new workout from template with readiness adjustments

CREATE OR REPLACE FUNCTION public.end_workout(p_workout_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
-- Finalizes workout session
```

### Warmup Generation
```sql
CREATE OR REPLACE FUNCTION public.generate_warmup_steps(target_weight numeric)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
-- Generates progressive warmup sets

CREATE OR REPLACE FUNCTION public.fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric DEFAULT NULL::numeric, p_working_reps integer DEFAULT 8)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
-- Suggests warmup based on exercise history
```

## Equipment & Load Resolution

### Weight Calculation
```sql
CREATE OR REPLACE FUNCTION public.compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean DEFAULT true)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
-- Computes total weight based on entry mode

CREATE OR REPLACE FUNCTION public.next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
-- Calculates next weight increment
```

### Equipment Matching
```sql
CREATE OR REPLACE FUNCTION public.closest_machine_weight(desired numeric, stack numeric[], aux numeric[])
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
-- Finds closest available machine weight

CREATE OR REPLACE FUNCTION public.bar_min_increment(_gym_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
-- Gets minimum bar increment for gym
```

## Personal Records & Performance

### 1RM Calculation
```sql
CREATE OR REPLACE FUNCTION public.epley_1rm(weight numeric, reps integer)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
-- Calculates 1RM using Epley formula
```

### Performance Analysis
```sql
CREATE OR REPLACE FUNCTION public.fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
-- Detects training stagnation

CREATE OR REPLACE FUNCTION public.fn_suggest_sets(p_exercise_id uuid, p_progression_type text DEFAULT 'linear'::text, p_target_reps integer DEFAULT 8)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
-- Suggests sets based on progression type
```

## User Management & Authentication

### User Creation
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
-- Triggered on new user signup

CREATE OR REPLACE FUNCTION public.ensure_user_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
-- Ensures user record exists
```

### Permissions
```sql
CREATE OR REPLACE FUNCTION public.is_pro_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
-- Checks if user has pro status

CREATE OR REPLACE FUNCTION public.can_mutate_workout_set(_we_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
-- Checks workout set mutation permissions
```

## Data Integrity & Triggers

### Auto-assignment
```sql
CREATE OR REPLACE FUNCTION public.assign_next_set_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
-- Auto-assigns set indices

CREATE OR REPLACE FUNCTION public.get_next_set_index(p_workout_exercise_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
-- Gets next available set index
```

### Data Updates
```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
-- Updates updated_at timestamps

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
-- Alternative timestamp updater
```

### Validation
```sql
CREATE OR REPLACE FUNCTION public.validate_metric_value_type()
RETURNS trigger
LANGUAGE plpgsql
-- Validates metric value types

CREATE OR REPLACE FUNCTION public.equipment_profiles_enforce_fk()
RETURNS trigger
LANGUAGE plpgsql
-- Enforces equipment profile foreign keys
```

## Specialized Features

### Gym Management
```sql
CREATE OR REPLACE FUNCTION public.request_gym_role(p_gym uuid, p_role text, p_msg text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
-- Requests gym role

CREATE OR REPLACE FUNCTION public.decide_gym_role_request(p_req uuid, p_action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
-- Approves/rejects gym role requests
```

### Social Features
```sql
CREATE OR REPLACE FUNCTION public.are_friends(a uuid, b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
-- Checks friendship status

CREATE OR REPLACE FUNCTION public.bump_like_counter()
RETURNS trigger
LANGUAGE plpgsql
-- Updates post like counts
```

### Localization
```sql
CREATE OR REPLACE FUNCTION public.get_text(p_key text, p_language_code text DEFAULT 'en'::text)
RETURNS text
LANGUAGE sql
STABLE
-- Gets localized text

CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
-- Creates URL-safe slugs
```

## Utility Functions

### Hashing & IDs
```sql
CREATE OR REPLACE FUNCTION public.short_hash_uuid(u uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
-- Creates short hash from UUID

CREATE OR REPLACE FUNCTION public.make_grip_key(_grip_ids uuid[])
RETURNS text
LANGUAGE sql
IMMUTABLE
-- Creates grip key from grip IDs
```

### PostGIS & Geometry (System)
- Various PostGIS functions for spatial operations
- Not directly used in fitness application

### Text Search & Similarity
- pg_trgm functions for text similarity
- Used for exercise search functionality

## Critical Issues with Functions

### Duplicate Set Logging
1. `set_log()` - Primary function
2. `log_workout_set()` - Alternative function
3. Multiple versions with different parameters

### Missing Load Mode Functions
- No function to map `load_type` to `load_mode`
- No equipment-based load mode detection
- Missing `effort_mode` population

### Bodyweight Integration Issues
- Functions don't properly handle bodyweight exercises
- Missing total weight calculation for bodyweight + added weight
- No triggers to populate `total_weight_kg` field

### Performance Concerns
- Some functions missing proper indexing
- Recursive queries without limits
- Heavy JSON operations in frequently called functions