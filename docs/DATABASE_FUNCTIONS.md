# Database Functions Documentation

This document lists all custom functions, stored procedures, and RPC functions in the database.

## Function Categories

### Weight Calculation Functions
- `compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)` - Calculates total weight based on entry mode
- `next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)` - Determines next weight increment
- `closest_machine_weight(desired numeric, stack numeric[], aux numeric[])` - Finds closest achievable weight on machines
- `bar_min_increment(_gym_id uuid)` - Gets minimum increment for barbell at gym

### Exercise Analysis & Recommendations
- `fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)` - Detects training plateaus
- `fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_working_reps integer)` - Generates warmup suggestions
- `fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text)` - Calculates optimal rest time
- `fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)` - Suggests set/rep schemes

### User Data & Progress Tracking
- `get_user_last_set_for_exercise(p_exercise_id uuid)` - Gets user's last performance for exercise
- `get_user_pr_for_exercise(p_exercise_id uuid)` - Gets user's personal record
- `epley_1rm(weight numeric, reps integer)` - Calculates 1RM estimate using Epley formula
- `get_user_coach_params(_user_id uuid)` - Retrieves user's coaching parameters

### Workout Management
- `log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])` - Logs a workout set
- `end_workout(p_workout_id uuid)` - Ends a workout session
- `get_next_set_index(p_workout_exercise_id uuid)` - Gets next set number
- `can_mutate_workout_set(_we_id uuid)` - Checks permissions for set modifications

### Warmup & Programming
- `generate_warmup_steps(p_top_kg numeric)` - Creates warmup progression
- `recalc_warmup_from_last_set(p_workout_exercise_id uuid)` - Recalculates warmup based on performance

### Text & Translation
- `get_text(p_key text, p_language_code text)` - Gets translated text
- `slugify(txt text)` - Creates URL-friendly slugs
- `short_hash_uuid(u uuid)` - Creates short hash from UUID

### Admin & Security
- `is_admin(user_id uuid)` - Checks admin status
- `has_role(_user_id uuid, _role app_role)` - Checks user role
- `is_admin_with_rate_limit(_user_id uuid)` - Rate-limited admin check
- `create_admin_user(target_user_id uuid, requester_role text)` - Creates admin users
- `log_admin_action(action_type text, target_user_id uuid, details jsonb)` - Logs admin actions
- `is_pro_user(user_id uuid)` - Checks pro subscription status

### Exercise Name Generation
- `generate_exercise_name(...)` - Generates exercise names from components
- `_pick_template(p_movement_id uuid, p_equipment_id uuid, p_locale text)` - Selects naming template
- `_pascalize(key text)` - Converts snake_case to PascalCase
- `_get_estimate_weight_kg(p_user_id uuid, p_exercise_id uuid)` - Gets weight estimates

### Achievement System
- `check_achievements(p_user_id uuid)` - Checks and awards achievements

### Demo & Setup
- `create_demo_template_for_current_user()` - Creates demo workout template

### Trigger Functions
- `handle_new_user()` - Creates profile when user signs up
- `update_updated_at_column()` - Updates timestamp triggers
- `assign_next_set_index()` - Auto-assigns set numbers
- `trg_after_set_logged()` - Post-set logging actions
- `trg_te_sync_weights()` - Syncs weight units
- `populate_grip_key_from_workout_exercise()` - Populates grip keys
- `exercises_autoname_tg()` - Auto-generates exercise names
- `enforce_max_pins()` - Enforces pinned item limits
- `validate_metric_value_type()` - Validates metric data types

### Utility Functions
- `make_grip_key(_grip_ids uuid[])` - Creates grip key from IDs
- Various PostGIS geometry functions (ST_* functions)
- Text search and similarity functions (pg_trgm extension)

## Key RPC Functions (Callable from Client)

### Workout Functions
```sql
-- Start a workout from template
SELECT start_workout(template_id) 

-- Log a set
SELECT log_workout_set(
  workout_exercise_id, 
  set_index, 
  '{"weight": 80, "reps": 10}'::jsonb
)

-- End workout
SELECT end_workout(workout_id)
```

### Analysis Functions
```sql
-- Check for stagnation
SELECT fn_detect_stagnation(exercise_id, 5)

-- Get warmup suggestions
SELECT fn_suggest_warmup(exercise_id, 80, 8)

-- Get set suggestions
SELECT fn_suggest_sets(exercise_id, 'linear', 8)
```

### User Functions
```sql
-- Check user status
SELECT is_pro_user(user_id)
SELECT has_role(user_id, 'admin'::app_role)

-- Get exercise history
SELECT get_user_last_set_for_exercise(exercise_id)
SELECT get_user_pr_for_exercise(exercise_id)
```

## Security Considerations

### Security Definer Functions
Several functions run with elevated privileges using `SECURITY DEFINER`:
- Admin checking functions
- User role management
- Audit logging
- Rate limiting

### RLS Integration
Functions respect Row Level Security policies and include user ID checks where appropriate.

### Rate Limiting
Admin functions include built-in rate limiting to prevent abuse.

## Performance Notes

### Indexed Functions
Functions that query large tables use appropriate indexes for performance.

### Materialized Views
Some functions reference materialized views for better performance on aggregated data.

### Caching
Translation and reference data functions are marked as `STABLE` or `IMMUTABLE` for query optimization.