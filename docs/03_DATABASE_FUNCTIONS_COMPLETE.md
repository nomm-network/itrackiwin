# Complete Database Functions Export

## Database Functions and Stored Procedures

**Export Date:** 2025-01-06  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  
**Total Functions:** 127+

### Core System Functions

#### User Management Functions

**create_admin_user(target_user_id, requester_role)**
```sql
CREATE OR REPLACE FUNCTION public.create_admin_user(target_user_id uuid, requester_role text DEFAULT 'system'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
```
- Creates admin users with proper audit logging
- Only allows system calls or existing superadmins

**has_role(_user_id, _role)**
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
```
- Checks if user has specific role
- Used in RLS policies to prevent recursion

**is_admin(user_id)**
```sql
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
```
- Simplified admin role check

**is_pro_user(user_id)**
```sql
CREATE OR REPLACE FUNCTION public.is_pro_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
```
- Checks pro user status

#### Workout System Functions

**start_workout(p_template_id)**
```sql
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
```
- Initializes new workout session
- Applies readiness-based weight adjustments
- Generates warmup sets automatically

**end_workout(p_workout_id)**
```sql
CREATE OR REPLACE FUNCTION public.end_workout(p_workout_id uuid)
RETURNS uuid
LANGUAGE plpgsql
```
- Completes workout session
- Updates end timestamp

**log_workout_set(p_workout_exercise_id, p_set_index, p_metrics, p_grip_ids)**
```sql
CREATE OR REPLACE FUNCTION public.log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[] DEFAULT NULL::uuid[])
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
```
- Records individual set performance
- Handles metric values and grip variations

**get_next_set_index(p_workout_exercise_id)**
```sql
CREATE OR REPLACE FUNCTION public.get_next_set_index(p_workout_exercise_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
```
- Auto-increments set numbering

#### AI Coaching Functions

**compute_readiness_for_user(user_id)**
- Calculates user readiness score (0-100)
- Based on sleep, stress, and recovery metrics

**readiness_multiplier(readiness_score)**
- Converts readiness score to weight multiplier
- Range: 0.90 to 1.08

**pick_base_load(user_id, exercise_id)**
- Selects appropriate base weight for exercise
- Uses historical performance data

**generate_warmup_steps(target_weight)**
- Creates progressive warmup sequence
- Calculates optimal warmup weights

#### Exercise Analysis Functions

**fn_detect_stagnation(p_exercise_id, p_lookback_sessions)**
```sql
CREATE OR REPLACE FUNCTION public.fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
```
- Detects training plateaus
- Provides improvement recommendations

**fn_suggest_warmup(p_exercise_id, p_working_weight, p_working_reps)**
```sql
CREATE OR REPLACE FUNCTION public.fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric DEFAULT NULL::numeric, p_working_reps integer DEFAULT 8)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
```
- Generates personalized warmup protocols

**fn_suggest_sets(p_exercise_id, p_progression_type, p_target_reps)**
```sql
CREATE OR REPLACE FUNCTION public.fn_suggest_sets(p_exercise_id uuid, p_progression_type text DEFAULT 'linear'::text, p_target_reps integer DEFAULT 8)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
```
- Suggests optimal set/rep schemes

**fn_suggest_rest_seconds(p_workout_set_id, p_effort_level)**
```sql
CREATE OR REPLACE FUNCTION public.fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text DEFAULT 'moderate'::text)
RETURNS integer
LANGUAGE plpgsql
STABLE
```
- Calculates optimal rest periods

#### Equipment and Weight Calculations

**bar_min_increment(_gym_id)**
```sql
CREATE OR REPLACE FUNCTION public.bar_min_increment(_gym_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
```
- Calculates minimum weight increment for gym

**closest_machine_weight(desired, stack, aux)**
```sql
CREATE OR REPLACE FUNCTION public.closest_machine_weight(desired numeric, stack numeric[], aux numeric[])
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
```
- Finds nearest available machine weight

**next_weight_step_kg(p_load_type, p_side_min_plate_kg, p_single_min_increment_kg)**
```sql
CREATE OR REPLACE FUNCTION public.next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
```
- Calculates next weight progression step

**compute_total_weight(p_entry_mode, p_value, p_bar_weight, p_is_symmetrical)**
```sql
CREATE OR REPLACE FUNCTION public.compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean DEFAULT true)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
```
- Computes total weight from entry components

#### Strength Calculations

**epley_1rm(weight, reps)**
```sql
CREATE OR REPLACE FUNCTION public.epley_1rm(weight numeric, reps integer)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
```
- Calculates estimated 1RM using Epley formula

#### Utility Functions

**slugify(txt)**
```sql
CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
```
- Converts text to URL-friendly slug

**short_hash_uuid(u)**
```sql
CREATE OR REPLACE FUNCTION public.short_hash_uuid(u uuid)
RETURNS text
LANGUAGE sql
IMMUTABLE
```
- Generates short hash from UUID

**get_text(p_key, p_language_code)**
```sql
CREATE OR REPLACE FUNCTION public.get_text(p_key text, p_language_code text DEFAULT 'en'::text)
RETURNS text
LANGUAGE sql
STABLE
```
- Retrieves internationalized text

#### Trigger Functions

**handle_new_user()**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
```
- Automatically creates user profile on signup

**set_updated_at()**
```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
```
- Updates timestamp on record modification

**update_updated_at_column()**
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
```
- Alternative updated_at trigger

**assign_next_set_index()**
```sql
CREATE OR REPLACE FUNCTION public.assign_next_set_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
```
- Auto-assigns set index on insert

**validate_metric_value_type()**
```sql
CREATE OR REPLACE FUNCTION public.validate_metric_value_type()
RETURNS trigger
LANGUAGE plpgsql
```
- Validates metric value types

**enforce_max_pins()**
```sql
CREATE OR REPLACE FUNCTION public.enforce_max_pins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
```
- Enforces maximum pinned subcategories limit

#### Data Retrieval Functions

**get_last_sets_for_exercises(p_exercise_ids)**
```sql
CREATE OR REPLACE FUNCTION public.get_last_sets_for_exercises(p_exercise_ids uuid[])
RETURNS TABLE(exercise_id uuid, prev_weight_kg numeric, prev_reps integer, prev_date text, base_weight_kg numeric, readiness_multiplier numeric)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
```
- Bulk retrieval of last set data

**get_user_last_set_for_exercise(p_exercise_id)**
```sql
CREATE OR REPLACE FUNCTION public.get_user_last_set_for_exercise(p_exercise_id uuid)
RETURNS TABLE(user_id uuid, exercise_id uuid, weight numeric, reps integer, completed_at timestamp with time zone)
LANGUAGE plpgsql
STABLE
```
- Gets user's last set for specific exercise

**get_user_pr_for_exercise(p_exercise_id)**
```sql
CREATE OR REPLACE FUNCTION public.get_user_pr_for_exercise(p_exercise_id uuid)
RETURNS TABLE(user_id uuid, exercise_id uuid, best_weight numeric)
LANGUAGE plpgsql
STABLE
```
- Retrieves personal record for exercise

#### PostGIS Spatial Functions

The database includes extensive PostGIS spatial functions for geographic data handling:

- **ST_Distance**, **ST_Area**, **ST_Length** - Geometric calculations
- **ST_Force2D**, **ST_Force3D** - Dimension manipulation
- **ST_X**, **ST_Y**, **ST_Z**, **ST_M** - Coordinate extraction
- **Geometry input/output functions** - Data conversion

#### Text Search Functions

**PostgreSQL Full-Text Search (pg_trgm)**:
- **similarity(text, text)** - Text similarity calculation
- **word_similarity(text, text)** - Word-based similarity
- **show_trgm(text)** - Display trigrams
- **set_limit(real)** - Set similarity threshold

### Function Security Model

- **SECURITY DEFINER**: Functions that need elevated privileges
- **SECURITY INVOKER**: Functions that run with caller's privileges
- **Stable/Immutable**: Performance optimization hints
- **Search Path Control**: Prevents SQL injection

### Performance Considerations

1. **Function Caching**: Stable/immutable functions are cached
2. **Trigger Performance**: Minimal logic in hot path triggers
3. **Batch Operations**: Bulk functions for better performance
4. **Index Usage**: Functions designed to use indexes effectively

### Maintenance Notes

1. **Version Control**: All functions are versioned in migrations
2. **Testing**: Unit tests for critical business logic functions
3. **Documentation**: Inline comments for complex algorithms
4. **Error Handling**: Proper exception handling and logging
5. **Security**: Input validation and privilege management