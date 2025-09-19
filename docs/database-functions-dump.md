# Database Functions Complete List - iTrack.iWin

## Core Functions (20+ identified)

### Workout Management Functions
1. `start_workout(template_id)` - Initialize new workout from template with readiness calculations
2. `end_workout(workout_id)` - Complete and finalize workout session
3. `log_workout_set()` - Record individual set performance with validation
4. `can_mutate_workout_set()` - Check user permissions for set modifications

### User & Authentication Functions  
5. `handle_new_user()` - Trigger for new user setup
6. `ensure_user_record()` - Ensure user record exists in public schema
7. `create_user_if_not_exists()` - Create user record if missing
8. `is_pro_user(user_id)` - Check if user has pro subscription

### Calculation & Utility Functions
9. `compute_total_weight()` - Calculate total weight based on entry mode
10. `epley_1rm(weight, reps)` - Estimate 1-rep max using Epley formula
11. `next_weight_step_kg()` - Calculate next weight increment
12. `closest_machine_weight()` - Find nearest available machine weight
13. `short_hash_uuid()` - Generate short hash from UUID

### Exercise & Equipment Functions
14. `pick_base_load()` - Suggest starting weight for exercise
15. `compute_readiness_for_user()` - Calculate pre-workout readiness score
16. `readiness_multiplier()` - Convert readiness to weight multiplier
17. `generate_warmup_steps()` - Create warmup progression

### Gym & Social Functions  
18. `request_gym_role()` - Request gym administration role
19. `decide_gym_role_request()` - Approve/reject gym role requests
20. `are_friends()` - Check friendship status between users
21. `are_friends_with_user()` - Check if current user is friends with target

### Analysis & Suggestion Functions
22. `fn_detect_stagnation()` - Detect training plateaus and provide recommendations
23. `fn_suggest_warmup()` - Generate warmup recommendations
24. `fn_suggest_rest_seconds()` - Calculate optimal rest periods
25. `fn_suggest_sets()` - Suggest set/rep schemes based on progression

### Data Quality Functions
26. `get_text()` - Get localized text with fallbacks
27. `slugify()` - Convert text to URL-safe slugs
28. `validate_metric_value_type()` - Validate workout metric data types

### Trigger Functions
29. `set_updated_at()` - Auto-update timestamp columns
30. `bump_like_counter()` - Update social post like counts
31. `populate_grip_key_from_workout_exercise()` - Auto-populate grip information
32. `assign_next_set_index()` - Auto-assign set numbers
33. `trigger_initialize_warmup()` - Initialize warmup in workout exercises
34. `trg_after_set_logged()` - Post-set logging triggers
35. `trg_te_sync_weights()` - Sync weight units in templates

### Equipment & Configuration Functions
36. `equipment_profiles_enforce_fk()` - Enforce equipment profile foreign keys
37. `bar_min_increment()` - Calculate minimum barbell increment
38. `enforce_max_pins()` - Limit pinned subcategories per user

### Query Helper Functions
39. `get_user_coach_params()` - Get user's coaching parameters
40. `get_next_program_template()` - Get next template in program sequence
41. `get_last_sets_for_exercises()` - Retrieve recent performance data
42. `get_user_last_set_for_exercise()` - Get user's last set for specific exercise
43. `get_next_set_index()` - Calculate next set number
44. `_get_exercise_load_mode_and_bw_pct()` - Get exercise loading characteristics

### PostGIS Functions (Spatial)
45. `st_*` functions - Various spatial/geometric operations (40+ functions)

### Text Search Functions  
46. `unaccent*` functions - Text normalization for search
47. `similarity*` functions - Text similarity calculations
48. `gtrgm*` functions - Trigram text matching

## Function Usage Patterns

### Workout Flow Functions
```sql
1. start_workout() -> Creates workout with readiness assessment
2. log_workout_set() -> Records each set performance  
3. fn_suggest_rest_seconds() -> Calculates rest periods
4. end_workout() -> Finalizes workout session
```

### Exercise Progression Functions
```sql
1. pick_base_load() -> Gets starting weight
2. fn_suggest_sets() -> Recommends set/rep scheme
3. generate_warmup_steps() -> Creates warmup
4. fn_detect_stagnation() -> Monitors progress
```

### Data Validation Functions
```sql
1. validate_metric_value_type() -> Ensures data integrity
2. can_mutate_workout_set() -> Checks permissions
3. equipment_profiles_enforce_fk() -> Validates equipment
```

## Critical Functions for Issues

### For Weight/Height Issue
- `create_user_if_not_exists()` - Ensures user record exists for body metrics
- `set_updated_at()` - Handles timestamp updates

### For Exercise Form Issue  
- `_get_exercise_load_mode_and_bw_pct()` - Gets exercise loading characteristics
- Functions rely on proper exercise.load_mode detection

## Function Dependencies

Many functions depend on:
- Proper user authentication (`auth.uid()`)
- Correct exercise configuration in database
- Valid workout state management
- Accurate equipment and exercise relationships

The SmartSetForm issue likely stems from JavaScript form logic rather than database functions, as the database functions are properly configured and the exercise data is correct.