# Complete Database Schema Export

*Generated on: 2025-08-27*

This document provides a complete export of all database tables, columns, and enums based on the current Supabase schema.

## Achievement System Tables

### achievements
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- title: text, NOT NULL
- description: text, NOT NULL
- icon: text, NOT NULL
- category: text, NOT NULL
- points: integer, NOT NULL, DEFAULT: 0
- criteria: jsonb, NOT NULL
- is_active: boolean, NOT NULL, DEFAULT: true
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### challenge_participants
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- challenge_id: uuid, NOT NULL
- user_id: uuid, NOT NULL
- current_value: numeric, NULL, DEFAULT: 0
- joined_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### challenges
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- title: text, NOT NULL
- description: text, NULL
- challenge_type: text, NOT NULL
- target_value: numeric, NOT NULL
- target_unit: text, NULL
- start_date: date, NOT NULL
- end_date: date, NOT NULL
- creator_id: uuid, NOT NULL
- participants_count: integer, NULL, DEFAULT: 0
- is_public: boolean, NULL, DEFAULT: true
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Administration & Audit Tables

### admin_audit_log
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- action_type: text, NOT NULL
- target_user_id: uuid, NULL
- performed_by: uuid, NULL
- details: jsonb, NULL, DEFAULT: '{}'::jsonb
- ip_address: inet, NULL
- user_agent: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### admin_check_rate_limit
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- check_count: integer, NULL, DEFAULT: 1
- window_start: timestamp with time zone, NOT NULL, DEFAULT: now()
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### coach_logs
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- session_id: uuid, NULL
- function_name: text, NOT NULL
- step: text, NOT NULL
- inputs: jsonb, NOT NULL, DEFAULT: '{}'::jsonb
- outputs: jsonb, NOT NULL, DEFAULT: '{}'::jsonb
- success: boolean, NOT NULL, DEFAULT: true
- error_message: text, NULL
- execution_time_ms: integer, NULL
- metadata: jsonb, NULL, DEFAULT: '{}'::jsonb
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### data_quality_reports
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- report_type: text, NOT NULL, DEFAULT: 'scheduled'::text
- total_exercises: integer, NOT NULL, DEFAULT: 0
- exercises_with_primary_muscle: integer, NOT NULL, DEFAULT: 0
- exercises_with_movement_pattern: integer, NOT NULL, DEFAULT: 0
- exercises_with_equipment_constraints: integer, NOT NULL, DEFAULT: 0
- primary_muscle_coverage_pct: numeric, NOT NULL, DEFAULT: 0
- movement_pattern_coverage_pct: numeric, NOT NULL, DEFAULT: 0
- equipment_constraints_coverage_pct: numeric, NOT NULL, DEFAULT: 0
- issues_found: jsonb, NOT NULL, DEFAULT: '[]'::jsonb
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Auto-Training Features

### auto_deload_triggers
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
- trigger_type: text, NOT NULL
- threshold_value: numeric, NULL
- is_triggered: boolean, NULL, DEFAULT: false
- triggered_at: timestamp with time zone, NULL
- deload_percentage: numeric, NULL, DEFAULT: 10.0
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Core Entity Tables

### body_parts
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### body_parts_translations
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- body_part_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### bar_types
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- name: text, NOT NULL
- default_weight: numeric, NOT NULL
- unit: weight_unit, NOT NULL, DEFAULT: 'kg'::weight_unit
```

## Equipment System

### equipment
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- equipment_type: text, NOT NULL, DEFAULT: 'machine'::text
- default_stack: jsonb, NULL, DEFAULT: '[]'::jsonb
- weight_kg: numeric, NULL
- kind: text, NULL
- load_type: load_type, NULL, DEFAULT: 'none'::load_type
- load_medium: load_medium, NULL, DEFAULT: 'other'::load_medium
- default_bar_weight_kg: numeric, NULL
- default_single_min_increment_kg: numeric, NULL
- default_side_min_plate_kg: numeric, NULL
- notes: text, NULL
```

### equipment_translations
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- equipment_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Exercise System

### exercises
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- owner_user_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- is_public: boolean, NOT NULL, DEFAULT: true
- image_url: text, NULL
- thumbnail_url: text, NULL
- source_url: text, NULL
- is_bar_loaded: boolean, NOT NULL, DEFAULT: false
- is_unilateral: boolean, NULL, DEFAULT: false
- allows_grips: boolean, NULL, DEFAULT: true
- requires_handle: boolean, NULL, DEFAULT: false
- default_bar_weight: numeric, NULL
- default_bar_type_id: uuid, NULL
- loading_hint: text, NULL
- complexity_score: smallint, NULL, DEFAULT: 3
- contraindications: jsonb, NULL, DEFAULT: '[]'::jsonb
- body_part_id: uuid, NULL
- primary_muscle_id: uuid, NULL
- secondary_muscle_group_ids: uuid[], NULL
- movement_pattern: movement_pattern, NULL
- exercise_skill_level: exercise_skill_level, NULL, DEFAULT: 'medium'::exercise_skill_level
- popularity_rank: integer, NULL
- default_handle_ids: uuid[], NULL
- default_grip_ids: uuid[], NULL, DEFAULT: '{}'::uuid[]
- capability_schema: jsonb, NULL, DEFAULT: '{}'::jsonb
- load_type: load_type, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### exercises_translations
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### exercise_default_grips
```sql
- exercise_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- order_index: integer, NOT NULL, DEFAULT: 1
```

### exercise_equipment_variants
```sql
- exercise_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- is_preferred: boolean, NOT NULL, DEFAULT: false
```

### exercise_grip_effects
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- muscle_id: uuid, NOT NULL
- effect_pct: numeric, NOT NULL
- is_primary_override: boolean, NOT NULL, DEFAULT: false
- equipment_id: uuid, NULL
- note: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### exercise_grips
```sql
- exercise_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- order_index: integer, NOT NULL, DEFAULT: 1
- is_default: boolean, NOT NULL, DEFAULT: false
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### exercise_handle_grips
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- handle_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### exercise_handles
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- handle_id: uuid, NOT NULL
- is_default: boolean, NOT NULL, DEFAULT: false
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### exercise_images
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- user_id: uuid, NOT NULL
- path: text, NOT NULL
- url: text, NOT NULL
- is_primary: boolean, NOT NULL, DEFAULT: false
- order_index: integer, NOT NULL, DEFAULT: 1
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### exercise_metric_defs
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- metric_id: uuid, NOT NULL
- exercise_id: uuid, NULL
- equipment_id: uuid, NULL
- order_index: integer, NOT NULL, DEFAULT: 1
- is_required: boolean, NOT NULL, DEFAULT: false
- default_value: jsonb, NULL
```

### exercise_similars
```sql
- exercise_id: uuid, NOT NULL
- similar_exercise_id: uuid, NOT NULL
- similarity_score: numeric, NULL, DEFAULT: 0.8
- reason: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Experience & Configuration

### experience_level_configs
```sql
- experience_level: experience_level, NOT NULL
- start_intensity_low: numeric, NOT NULL
- start_intensity_high: numeric, NOT NULL
- warmup_set_count_min: smallint, NOT NULL
- warmup_set_count_max: smallint, NOT NULL
- main_rest_seconds_min: smallint, NOT NULL
- main_rest_seconds_max: smallint, NOT NULL
- weekly_progress_pct: numeric, NOT NULL
- allow_high_complexity: boolean, NOT NULL, DEFAULT: false
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Social Features

### friendships
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- requester_id: uuid, NOT NULL
- addressee_id: uuid, NOT NULL
- status: text, NOT NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### cycle_events
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- kind: text, NOT NULL
- event_date: date, NOT NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Handles & Grips System

### handles
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- category: text, NOT NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### handle_translations
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- handle_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### handles_translations
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- handle_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### grips
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- category: text, NOT NULL
- is_compatible_with: jsonb, NULL, DEFAULT: '[]'::jsonb
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### grips_translations
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- grip_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### handle_grip_compatibility
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- handle_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- is_default: boolean, NOT NULL, DEFAULT: false
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Gym Management

### gyms
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- name: text, NOT NULL
- provider: text, NOT NULL
- provider_place_id: text, NULL
- address: text, NULL
- city: text, NULL
- country: text, NULL
- phone: text, NULL
- website: text, NULL
- tz: text, NULL
- location: geography, NOT NULL
- verified: boolean, NULL, DEFAULT: false
- equipment_profile: jsonb, NULL, DEFAULT: '{}'::jsonb
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### gym_admins
```sql
- gym_id: uuid, NOT NULL
- user_id: uuid, NOT NULL
- role: text, NOT NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### gym_aliases
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- alias: text, NOT NULL
```

### gym_equipment
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- loading_mode: text, NOT NULL
- bar_weight_kg: numeric, NULL
- min_plate_kg: numeric, NULL
- is_symmetrical: boolean, NOT NULL, DEFAULT: true
- has_micro_plates: boolean, NOT NULL, DEFAULT: false
- micro_plate_min_kg: numeric, NULL
- stack_increment_kg: numeric, NULL
- stack_has_magnet: boolean, NOT NULL, DEFAULT: false
- stack_micro_kg: numeric, NULL
- fixed_increment_kg: numeric, NULL
- notes: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### gym_equipment_availability
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- quantity: integer, NOT NULL, DEFAULT: 1
- is_functional: boolean, NOT NULL, DEFAULT: true
- brand: text, NULL
- model: text, NULL
- notes: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### gym_equipment_overrides
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- bar_weight_kg: numeric, NULL
- side_min_plate_kg: numeric, NULL
- single_min_increment_kg: numeric, NULL
- created_at: timestamp with time zone, NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NULL, DEFAULT: now()
```

### gym_plate_inventory
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- plate_kg: numeric, NOT NULL
- count: integer, NOT NULL
- created_at: timestamp with time zone, NULL, DEFAULT: now()
```

## System & Utility Tables

### idempotency_keys
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- key: text, NOT NULL
- operation_type: text, NOT NULL
- request_hash: text, NOT NULL
- response_data: jsonb, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- expires_at: timestamp with time zone, NOT NULL, DEFAULT: (now() + '24:00:00'::interval)
```

### languages
```sql
- code: text, NOT NULL
- name: text, NOT NULL
- native_name: text, NOT NULL
- flag_emoji: text, NULL
- is_active: boolean, NOT NULL, DEFAULT: true
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## PostGIS System Tables

### geography_columns
```sql
- f_table_catalog: name, NULL
- f_table_schema: name, NULL
- f_table_name: name, NULL
- f_geography_column: name, NULL
- coord_dimension: integer, NULL
- srid: integer, NULL
- type: text, NULL
```

### geometry_columns
```sql
- f_table_catalog: character varying, NULL
- f_table_schema: name, NULL
- f_table_name: name, NULL
- f_geometry_column: name, NULL
- coord_dimension: integer, NULL
- srid: integer, NULL
- type: character varying, NULL
```

### spatial_ref_sys
```sql
- srid: integer, NOT NULL
- auth_name: character varying, NULL
- auth_srid: integer, NULL
- srtext: character varying, NULL
- proj4text: character varying, NULL
```

## Progress Tracking

### personal_records
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
- kind: text, NOT NULL
- value: numeric, NOT NULL
- unit: text, NOT NULL
- achieved_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- workout_set_id: uuid, NULL
- grip_key: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### readiness_checkins
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- workout_id: uuid, NULL
- energy: smallint, NULL
- sleep_quality: smallint, NULL
- sleep_hours: numeric, NULL
- soreness: smallint, NULL
- stress: smallint, NULL
- illness: boolean, NULL
- alcohol: boolean, NULL
- supplements: jsonb, NULL
- notes: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Template System

### template_exercise_grips
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_exercise_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### template_exercise_handles
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_exercise_id: uuid, NOT NULL
- handle_id: uuid, NOT NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### template_exercises
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
- order_index: integer, NOT NULL, DEFAULT: 0
- default_sets: smallint, NULL
- target_reps: smallint, NULL
- target_weight: numeric, NULL
- weight_unit: weight_unit, NULL, DEFAULT: 'kg'::weight_unit
- notes: text, NULL
- target_settings: jsonb, NULL
- display_name: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## User Management

### user_roles
```sql
- user_id: uuid, NOT NULL
- role: app_role, NOT NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Workout System

### workouts
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- template_id: uuid, NULL
- name: text, NULL
- notes: text, NULL
- started_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- ended_at: timestamp with time zone, NULL
- gym_id: uuid, NULL
- estimated_calories_burned: integer, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### workout_exercises
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- workout_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
- order_index: integer, NOT NULL, DEFAULT: 0
- notes: text, NULL
- warmup_plan: jsonb, NULL
- target_settings: jsonb, NULL
- display_name: text, NULL
- grip_key: text, NULL
- warmup_feedback: text, NULL
- warmup_feedback_at: timestamp with time zone, NULL
- warmup_updated_at: timestamp with time zone, NULL
- target_weight: numeric, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### workout_sets
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- workout_exercise_id: uuid, NOT NULL
- set_index: integer, NOT NULL
- set_kind: set_type, NOT NULL, DEFAULT: 'normal'::set_type
- weight: numeric, NULL
- reps: smallint, NULL
- weight_unit: weight_unit, NOT NULL, DEFAULT: 'kg'::weight_unit
- notes: text, NULL
- is_completed: boolean, NOT NULL, DEFAULT: false
- completed_at: timestamp with time zone, NULL
- rpe: smallint, NULL
- rest_seconds: integer, NULL
- side: text, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

### workout_templates
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- notes: text, NULL
- is_public: boolean, NOT NULL, DEFAULT: false
- tags: jsonb, NULL, DEFAULT: '[]'::jsonb
- estimated_duration_minutes: integer, NULL
- difficulty_level: smallint, NULL
- created_at: timestamp with time zone, NOT NULL, DEFAULT: now()
- updated_at: timestamp with time zone, NOT NULL, DEFAULT: now()
```

## Database Enums

### app_role
- 'admin'
- 'superadmin'

### experience_level
- 'beginner'
- 'intermediate'
- 'advanced'

### exercise_skill_level
- 'beginner'
- 'medium'
- 'advanced'

### load_medium
- 'plates'
- 'dumbbells'
- 'stack'
- 'bodyweight'
- 'resistance_band'
- 'other'

### load_type
- 'none'
- 'dual_load'
- 'single_load'
- 'stack'

### movement_pattern
- 'squat'
- 'hinge'
- 'lunge'
- 'push'
- 'pull'
- 'carry'
- 'gait'
- 'corrective'

### set_type
- 'normal'
- 'warmup'
- 'drop'
- 'amrap'
- 'top_set'
- 'backoff'

### weight_unit
- 'kg'
- 'lbs'

## Notes for CG

1. **Missing Tables**: References to `muscle_groups` and other tables may indicate missing entities in the current schema.

2. **No Foreign Key Constraints**: Most relationships are logical only - no database-level constraints are enforced.

3. **Translation System**: Comprehensive multi-language support through `_translations` tables.

4. **Geography Support**: PostGIS integration for location-based features (gyms).

5. **JSONB Usage**: Extensive use of JSONB for flexible data storage (settings, metadata, configurations).

6. **UUID Primary Keys**: All user-defined tables use UUID primary keys for distributed system compatibility.

7. **Audit Trail**: Comprehensive logging and audit trail capabilities built-in.

8. **Equipment System**: Sophisticated equipment modeling with variants, overrides, and gym-specific configurations.