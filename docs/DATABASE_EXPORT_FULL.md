# COMPLETE DATABASE EXPORT - ALL TABLES AND RELATIONSHIPS

## Database Overview
**Total Tables**: 128 base tables in public schema
**Primary Keys**: All tables use UUID primary keys with gen_random_uuid() defaults
**RLS Status**: Row Level Security enabled on most tables
**Search Path**: "$user", public

## All Tables by Category

### Core Workout System (CRITICAL FOR CURRENT ISSUE)
```sql
-- WORKOUTS TABLE (14 columns)
workouts: id, user_id, started_at, ended_at, name, notes, total_duration_minutes, 
         template_id, is_active, workout_feedback_json, created_at, updated_at, 
         estimated_duration_minutes, actual_duration_minutes

-- WORKOUT_EXERCISES TABLE (15 columns)  
workout_exercises: id, workout_id, exercise_id, order_index, target_sets, target_reps,
                  target_weight, weight_unit, rest_seconds, notes, target_rpe, grip_id,
                  created_at, updated_at, target_duration_seconds

-- WORKOUT_SETS TABLE (17 columns)
workout_sets: id, workout_exercise_id, set_index, weight, reps, is_completed, completed_at,
             rpe, notes, rest_seconds, set_kind, created_at, updated_at, duration_seconds,
             distance_meters, grip_key, target_weight

-- PRE_WORKOUT_CHECKINS TABLE (7 columns) - READINESS SYSTEM
pre_workout_checkins: id, user_id, workout_id, answers, notes, created_at, updated_at
```

### Exercise System (36 columns in exercises table)
```sql
-- EXERCISES TABLE (Most complex - 36 columns)
exercises: id, slug, owner_user_id, is_public, display_name, custom_display_name, 
          name_locale, name_version, body_part_id, primary_muscle_id, 
          secondary_muscle_group_ids, equipment_id, movement_id, equipment_ref_id,
          movement_pattern_id, attribute_values_json, exercise_skill_level,
          complexity_score, is_unilateral, load_type, allows_grips, is_bar_loaded,
          default_bar_weight, default_bar_type_id, default_grip_ids, tags,
          capability_schema, contraindications, source_url, thumbnail_url,
          image_url, loading_hint, popularity_rank, display_name_tsv, created_at, configured

-- Related Exercise Tables
exercise_aliases (5 columns): id, exercise_id, alias, language_code, created_at
exercise_equipment_variants (3 columns): exercise_id, equipment_id, is_preferred  
exercise_similars (5 columns): exercise_id, similar_exercise_id, similarity_score, reason, created_at
exercise_grips (5 columns): exercise_id, grip_id, created_at, order_index, is_default
exercise_images (8 columns): id, exercise_id, user_id, path, url, is_primary, order_index, created_at
```

### User and Profile System
```sql
-- PROFILES TABLE (13 columns)
profiles: id, user_id, email, first_name, last_name, avatar_url, bio, date_of_birth,
         location, time_zone, preferred_language, created_at, updated_at

-- USER_PROFILE_FITNESS TABLE (14 columns)
user_profile_fitness: id, user_id, experience_level_id, height_cm, weight_kg, 
                     body_fat_percentage, training_goal, preferred_units,
                     training_frequency, mobility_level, injury_history,
                     preferred_training_time, created_at, updated_at

-- USER_ROLES TABLE (4 columns)
user_roles: id, user_id, role, created_at
```

### Template System
```sql
-- WORKOUT_TEMPLATES TABLE (7 columns)
workout_templates: id, user_id, name, description, is_public, created_at, updated_at

-- TEMPLATE_EXERCISES TABLE (15 columns)
template_exercises: id, template_id, exercise_id, order_index, default_sets, target_reps,
                   target_weight, weight_unit, rest_seconds, notes, target_rpe,
                   created_at, updated_at, target_duration_seconds, grip_id
```

### Equipment and Gear System
```sql
-- EQUIPMENT TABLE (14 columns)
equipment: id, slug, equipment_type, load_type, load_medium, default_stack, weight_kg,
          default_bar_weight_kg, default_single_min_increment_kg, default_side_min_plate_kg,
          kind, notes, created_at, configured

-- GRIPS TABLE (5 columns)  
grips: id, slug, category, is_compatible_with, created_at

-- Equipment Translation and Relationship Tables
equipment_translations (7 columns): id, equipment_id, language_code, name, description, created_at, updated_at
grips_translations (7 columns): id, grip_id, language_code, name, description, created_at, updated_at
```

### Anatomy and Movement System
```sql
-- BODY_PARTS TABLE (3 columns)
body_parts: id, slug, created_at

-- MUSCLE_GROUPS TABLE (4 columns) 
muscle_groups: id, slug, body_part_id, created_at

-- MUSCLES TABLE (4 columns)
muscles: id, slug, muscle_group_id, created_at

-- MOVEMENTS TABLE (4 columns)
movements: id, slug, movement_pattern_id, created_at

-- MOVEMENT_PATTERNS TABLE (3 columns)
movement_patterns: id, slug, created_at

-- All anatomy tables have corresponding translation tables with 7 columns each
```

### Gym Management System
```sql
-- GYMS TABLE (14 columns)
gyms: id, name, address, city, country, postal_code, phone, website, description,
     latitude, longitude, is_active, created_at, updated_at

-- GYM_EQUIPMENT TABLE (16 columns) 
gym_equipment: id, gym_id, equipment_id, loading_mode, bar_weight_kg, min_plate_kg,
              fixed_increment_kg, stack_increment_kg, stack_micro_kg, stack_has_magnet,
              micro_plate_min_kg, has_micro_plates, is_symmetrical, notes, created_at, updated_at

-- GYM_ADMINS TABLE (4 columns)
gym_admins: gym_id, user_id, role, created_at
```

### Performance Tracking
```sql
-- PERSONAL_RECORDS TABLE (12 columns)
personal_records: id, user_id, exercise_id, record_type, value, unit, reps, date_achieved,
                 workout_id, workout_set_id, notes, created_at

-- READINESS_CHECKINS TABLE (16 columns) 
readiness_checkins: id, user_id, workout_id, energy, sleep_quality, sleep_hours, soreness,
                   stress, motivation, hydration, nutrition, illness, alcohol, supplements,
                   notes, created_at

-- USER_EXERCISE_ESTIMATES TABLE (9 columns)
user_exercise_estimates: id, user_id, exercise_id, type, estimated_weight, unit,
                        confidence_level, created_at, updated_at
```

### Social and Achievement System  
```sql
-- ACHIEVEMENTS TABLE (9 columns)
achievements: id, title, description, icon, category, criteria, points, is_active, created_at

-- CHALLENGES TABLE (12 columns)
challenges: id, title, description, challenge_type, target_value, target_unit,
           start_date, end_date, creator_id, is_public, participants_count, created_at

-- FRIENDSHIPS TABLE (6 columns)
friendships: id, requester_id, addressee_id, status, created_at, updated_at
```

### Health Tracking
```sql
-- CYCLE_EVENTS TABLE (5 columns)
cycle_events: id, user_id, event_date, kind, created_at

-- PAIN_EVENTS TABLE (8 columns) 
pain_events: id, user_id, body_part, pain_level, description, occurred_at, resolved_at, created_at
```

### System Administration
```sql
-- ADMIN_AUDIT_LOG TABLE (8 columns)
admin_audit_log: id, action_type, target_user_id, performed_by, details, 
                ip_address, user_agent, created_at

-- COACH_LOGS TABLE (12 columns)
coach_logs: id, user_id, session_id, function_name, step, inputs, outputs,
           metadata, success, error_message, execution_time_ms, created_at

-- DATA_QUALITY_REPORTS TABLE (11 columns)
data_quality_reports: id, report_type, total_exercises, exercises_with_primary_muscle,
                     exercises_with_movement_pattern, exercises_with_equipment_constraints,
                     primary_muscle_coverage_pct, movement_pattern_coverage_pct,
                     equipment_constraints_coverage_pct, issues_found, created_at
```

### Configuration and Metadata
```sql
-- EXPERIENCE_LEVEL_CONFIGS TABLE (11 columns)
experience_level_configs: experience_level, start_intensity_low, start_intensity_high,
                         warmup_set_count_min, warmup_set_count_max, main_rest_seconds_min,
                         main_rest_seconds_max, weekly_progress_pct, allow_high_complexity,
                         created_at, updated_at

-- METRIC_DEFS TABLE (7 columns)
metric_defs: id, slug, name, description, value_type, enum_options, order_index

-- ATTRIBUTE_SCHEMAS TABLE (10 columns)
attribute_schemas: id, scope, scope_ref_id, title, schema_json, visibility,
                  is_active, version, created_at, updated_at
```

### Translation and Localization
```sql
-- LANGUAGES TABLE (6 columns) 
languages: id, code, name, native_name, is_active, created_at

-- TEXT_TRANSLATIONS TABLE (5 columns)
text_translations: id, key, language_code, value, created_at

-- All major entities have corresponding translation tables:
- body_parts_translations, muscle_groups_translations, muscles_translations
- equipment_translations, grips_translations  
- exercises_translations, movements_translations, movement_patterns_translations
- life_category_translations, life_subcategory_translations
```

### Specialized Systems
```sql
-- AUTO_DELOAD_TRIGGERS TABLE (10 columns)
auto_deload_triggers: id, user_id, exercise_id, trigger_type, threshold_value,
                     deload_percentage, is_triggered, triggered_at, created_at, updated_at

-- IDEMPOTENCY_KEYS TABLE (8 columns)
idempotency_keys: id, key, operation_type, request_hash, response_data,
                 status, expires_at, created_at

-- CAROUSEL_IMAGES TABLE (10 columns) 
carousel_images: id, title, alt_text, file_path, file_url, order_index,
                is_active, created_by, created_at, updated_at
```

### PostGIS Geographic Tables
```sql
-- GEOGRAPHY_COLUMNS TABLE (7 columns)
geography_columns: f_table_catalog, f_table_schema, f_table_name, f_geography_column,
                  coord_dimension, srid, type

-- GEOMETRY_COLUMNS TABLE (7 columns)  
geometry_columns: f_table_catalog, f_table_schema, f_table_name, f_geometry_column,
                 coord_dimension, srid, type

-- SPATIAL_REF_SYS TABLE (5 columns)
spatial_ref_sys: srid, auth_name, auth_srid, srtext, proj4text
```

## Critical Foreign Key Relationships

### Workout Flow (CRITICAL FOR DEBUGGING)
```sql
workouts.user_id → auth.users.id
workout_exercises.workout_id → workouts.id  
workout_exercises.exercise_id → exercises.id
workout_sets.workout_exercise_id → workout_exercises.id
pre_workout_checkins.workout_id → workouts.id
pre_workout_checkins.user_id → auth.users.id
```

### Exercise System Relationships
```sql
exercises.equipment_id → equipment.id
exercises.primary_muscle_id → muscle_groups.id  
exercises.body_part_id → body_parts.id
exercises.movement_id → movements.id
exercises.movement_pattern_id → movement_patterns.id
exercise_equipment_variants.exercise_id → exercises.id
exercise_equipment_variants.equipment_id → equipment.id
```

### Template System Relationships  
```sql
workout_templates.user_id → auth.users.id
template_exercises.template_id → workout_templates.id
template_exercises.exercise_id → exercises.id
```

### User Profile Relationships
```sql
profiles.user_id → auth.users.id
user_profile_fitness.user_id → profiles.user_id
user_exercise_estimates.user_id → auth.users.id
user_roles.user_id → auth.users.id
```

### Anatomy Hierarchy
```sql  
muscle_groups.body_part_id → body_parts.id
muscles.muscle_group_id → muscle_groups.id
movements.movement_pattern_id → movement_patterns.id
```

## Database Enums

```sql
app_role: 'admin', 'superadmin'
experience_level: 'beginner', 'intermediate', 'advanced'  
set_type: 'warmup', 'normal', 'top_set', 'drop', 'amrap', 'backoff'
weight_unit: 'kg', 'lbs'
load_type: 'none', 'fixed', 'barbell', 'single_load', 'dual_load', 'stack', 'bodyweight'
load_medium: 'other', 'stack', 'plates', 'bar', 'chain', 'band', 'bodyweight'
exercise_skill_level: 'low', 'medium', 'high'
metric_value_type: 'number', 'text', 'boolean', 'enum'
handle_orientation: 'horizontal', 'vertical', 'angled', 'neutral'
attribute_schema_scope: 'exercise', 'equipment', 'movement'
```

## Critical Views and Functions

### Views (CRITICAL FOR READINESS SYSTEM)
```sql
v_latest_readiness - Extracts latest readiness data from pre_workout_checkins.answers JSONB
v_last_working_set - User's last working set per exercise  
mv_user_exercise_1rm - 1RM estimates per user/exercise
mv_last_set_per_user_exercise - Last set tracking
mv_pr_weight_per_user_exercise - Personal record tracking
```

### Key RPC Functions
```sql
start_workout(p_template_id) - Creates workout, returns UUID
compute_readiness_for_user(user_id) - Calculates readiness score
log_workout_set() - Records workout set data
end_workout(workout_id) - Completes workout session
```

## Row Level Security Status

**RLS Enabled**: All major tables have RLS policies
**User Data**: Enforced via auth.uid() = user_id patterns
**Public Data**: Readable by authenticated users  
**Admin Data**: Requires admin role verification
**System Data**: Uses security definer functions

## Storage Buckets

```sql
-- Storage buckets for file uploads
exercise_images - Exercise photos and videos
user_avatars - Profile pictures  
workout_media - Workout-related files
```

## Critical Notes for Auditor

1. **No explicit FK constraints** - Relationships maintained at application level
2. **JSONB heavy usage** - Flexible attribute storage in multiple tables
3. **Translation system** - Extensive i18n support via *_translations tables  
4. **UUID primary keys** - All tables use UUID identifiers
5. **Audit trail system** - Comprehensive logging in admin_audit_log
6. **PostGIS integration** - Geographic capabilities for gym locations
7. **Complex equipment system** - Handles/grips for exercise variations
8. **Readiness system uses JSONB** - `pre_workout_checkins.answers` stores readiness data
9. **Recent view changes** - `v_latest_readiness` modified to extract from JSONB
10. **RPC dependencies** - `start_workout` relies on views and functions that may be broken