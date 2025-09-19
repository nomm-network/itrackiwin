# Complete Database Schema Export

## Database Tables

### User Management
- `users` - User accounts and pro status
- `user_profile_fitness` - Fitness profile data (NOT weight/height)
- `user_body_metrics` - Weight, height, body composition data

### Exercise System
- `exercises` - Exercise definitions
- `exercise_translations` - Multi-language exercise names
- `exercises_translations` - Exercise descriptions and translations
- `equipment` - Gym equipment definitions
- `equipment_translations` - Multi-language equipment names
- `grips` - Exercise grip variations
- `exercise_grips` - Exercise-grip relationships

### Workout System
- `workouts` - Workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets within exercises
- `workout_set_grips` - Grip selections for sets
- `workout_templates` - Saved workout templates
- `template_exercises` - Exercises within templates

### Body Parts & Muscles
- `body_parts` - Anatomical body parts
- `body_parts_translations` - Multi-language body part names
- `muscles` - Individual muscles
- `muscle_translations` - Multi-language muscle names

### Personal Records
- `personal_records` - User PRs (heaviest, reps, 1RM)

### Challenges & Social
- `challenges` - User challenges
- `challenge_participants` - Challenge participation
- `social_posts` - Social media posts
- `social_friendships` - User friendships
- `social_post_likes` - Post likes

### Equipment Profiles
- `plate_profiles` - Plate loading configurations
- `stack_profiles` - Machine stack configurations
- `equipment_profiles` - Equipment-profile relationships

### Admin & System
- `admin_notifications` - Admin notifications
- `admin_audit_log` - System audit trail
- `app_flags` - Feature flags
- `data_quality_reports` - Data quality monitoring

## Critical Database Functions

### Set Logging
```sql
CREATE OR REPLACE FUNCTION public.set_log(p_payload jsonb)
RETURNS uuid AS $$
-- Primary function for logging workout sets
-- Handles all set types and grip associations
$$;
```

### Warmup Generation
```sql
CREATE OR REPLACE FUNCTION public.generate_warmup_steps(target_weight numeric)
RETURNS jsonb AS $$
-- Generates progressive warmup sets
$$;
```

### Workout Management
```sql
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid AS $$
-- Creates new workout from template
$$;

CREATE OR REPLACE FUNCTION public.end_workout(p_workout_id uuid)
RETURNS uuid AS $$
-- Finalizes workout session
$$;
```

### Personal Records
```sql
CREATE OR REPLACE FUNCTION public.upsert_personal_record(...)
RETURNS void AS $$
-- Updates user personal records
$$;
```

### Equipment & Load Resolution
```sql
CREATE OR REPLACE FUNCTION public.resolve_load(...)
RETURNS numeric AS $$
-- Resolves equipment-specific loading
$$;

CREATE OR REPLACE FUNCTION public.closest_machine_weight(desired numeric, stack numeric[], aux numeric[])
RETURNS numeric AS $$
-- Finds closest available machine weight
$$;
```

## Key Database Constraints

### Row Level Security (RLS)
- All user data tables have RLS enabled
- Users can only access their own data
- Admin functions require special permissions

### Foreign Key Relationships
- `workout_exercises.exercise_id` → `exercises.id`
- `workout_sets.workout_exercise_id` → `workout_exercises.id`
- `user_body_metrics.user_id` → `auth.users.id`
- `personal_records.user_id` → `auth.users.id`

### Data Integrity Triggers
- Auto-update `updated_at` timestamps
- Auto-assign set indices
- Validate metric value types
- Populate grip keys from workout exercises

## Current Database Issues

### Schema Inconsistencies
1. **Exercise Load Mode**: 
   - Table has `load_type` field
   - Application expects `load_mode` and `effort_mode`
   - Missing mapping between equipment types and load modes

2. **Weight/Height Storage**:
   - `user_profile_fitness` may still have bodyweight/height columns
   - Should be exclusively in `user_body_metrics`

3. **Set Logging**:
   - Multiple functions for same purpose
   - Different parameter structures
   - Potential duplicate logic

### Missing Indexes
- Performance optimization needed for:
  - Exercise search by equipment_id
  - Set queries by user and date
  - Personal record lookups

### Data Quality Issues
- Exercises missing effort_mode and load_mode
- Equipment missing proper categorization
- Inconsistent grip associations