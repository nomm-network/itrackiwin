# Complete Database Schema Export

## Database Overview
- **Database Type**: PostgreSQL with PostGIS extensions
- **Schema**: Public schema with Row-Level Security (RLS) enabled
- **Authentication**: Supabase Auth integration
- **Total Tables**: 126+ public schema tables

## Table Schema Details

### achievements
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **title** | text | NOT NULL
- **description** | text | NOT NULL
- **icon** | text | NOT NULL
- **category** | text | NOT NULL
- **points** | integer | NOT NULL | DEFAULT: 0
- **criteria** | jsonb | NOT NULL
- **is_active** | boolean | NOT NULL | DEFAULT: true
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### admin_audit_log
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **action_type** | text | NOT NULL
- **target_user_id** | uuid | NULLABLE
- **performed_by** | uuid | NULLABLE
- **details** | jsonb | NULLABLE | DEFAULT: '{}'::jsonb
- **ip_address** | inet | NULLABLE
- **user_agent** | text | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### admin_check_rate_limit
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **user_id** | uuid | NOT NULL
- **check_count** | integer | NULLABLE | DEFAULT: 1
- **window_start** | timestamp with time zone | NOT NULL | DEFAULT: now()
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### attribute_schemas
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **scope** | USER-DEFINED | NOT NULL
- **scope_ref_id** | uuid | NULLABLE
- **title** | text | NOT NULL
- **schema_json** | jsonb | NOT NULL
- **visibility** | text | NULLABLE | DEFAULT: 'general'::text
- **version** | integer | NOT NULL | DEFAULT: 1
- **is_active** | boolean | NOT NULL | DEFAULT: true
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()
- **updated_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### auto_deload_triggers
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **user_id** | uuid | NOT NULL
- **exercise_id** | uuid | NOT NULL
- **trigger_type** | text | NOT NULL
- **threshold_value** | numeric | NULLABLE
- **deload_percentage** | numeric | NULLABLE | DEFAULT: 10.0
- **is_triggered** | boolean | NULLABLE | DEFAULT: false
- **triggered_at** | timestamp with time zone | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()
- **updated_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### bar_types
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **name** | text | NOT NULL
- **default_weight** | numeric | NOT NULL
- **unit** | USER-DEFINED | NOT NULL | DEFAULT: 'kg'::weight_unit

### body_parts
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **slug** | text | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### body_parts_translations
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **body_part_id** | uuid | NOT NULL
- **language_code** | text | NOT NULL
- **name** | text | NOT NULL
- **description** | text | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()
- **updated_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### carousel_images
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **title** | text | NOT NULL
- **alt_text** | text | NOT NULL
- **file_path** | text | NOT NULL
- **file_url** | text | NOT NULL
- **order_index** | integer | NOT NULL | DEFAULT: 1
- **is_active** | boolean | NOT NULL | DEFAULT: true
- **created_by** | uuid | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()
- **updated_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### challenge_participants
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **challenge_id** | uuid | NOT NULL
- **user_id** | uuid | NOT NULL
- **current_value** | numeric | NULLABLE | DEFAULT: 0
- **joined_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### challenges
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **title** | text | NOT NULL
- **description** | text | NULLABLE
- **challenge_type** | text | NOT NULL
- **target_value** | numeric | NOT NULL
- **target_unit** | text | NULLABLE
- **start_date** | date | NOT NULL
- **end_date** | date | NOT NULL
- **is_public** | boolean | NULLABLE | DEFAULT: true
- **creator_id** | uuid | NOT NULL
- **participants_count** | integer | NULLABLE | DEFAULT: 0
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### coach_assigned_templates
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **mentorship_id** | uuid | NOT NULL
- **template_id** | uuid | NOT NULL
- **assigned_at** | timestamp with time zone | NOT NULL | DEFAULT: now()
- **is_linked** | boolean | NOT NULL | DEFAULT: true

### coach_logs
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **user_id** | uuid | NOT NULL
- **session_id** | uuid | NULLABLE
- **function_name** | text | NOT NULL
- **step** | text | NOT NULL
- **inputs** | jsonb | NOT NULL | DEFAULT: '{}'::jsonb
- **outputs** | jsonb | NOT NULL | DEFAULT: '{}'::jsonb
- **success** | boolean | NOT NULL | DEFAULT: true
- **error_message** | text | NULLABLE
- **execution_time_ms** | integer | NULLABLE
- **metadata** | jsonb | NULLABLE | DEFAULT: '{}'::jsonb
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### cycle_events
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **user_id** | uuid | NOT NULL
- **event_date** | date | NOT NULL
- **kind** | text | NOT NULL
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### data_quality_reports
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **report_type** | text | NOT NULL | DEFAULT: 'scheduled'::text
- **total_exercises** | integer | NOT NULL | DEFAULT: 0
- **exercises_with_primary_muscle** | integer | NOT NULL | DEFAULT: 0
- **exercises_with_movement_pattern** | integer | NOT NULL | DEFAULT: 0
- **exercises_with_equipment_constraints** | integer | NOT NULL | DEFAULT: 0
- **primary_muscle_coverage_pct** | numeric | NOT NULL | DEFAULT: 0
- **movement_pattern_coverage_pct** | numeric | NOT NULL | DEFAULT: 0
- **equipment_constraints_coverage_pct** | numeric | NOT NULL | DEFAULT: 0
- **issues_found** | jsonb | NOT NULL | DEFAULT: '[]'::jsonb
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### equipment
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **slug** | text | NULLABLE
- **kind** | text | NULLABLE
- **equipment_type** | text | NOT NULL | DEFAULT: 'machine'::text
- **load_type** | USER-DEFINED | NULLABLE | DEFAULT: 'none'::load_type
- **load_medium** | USER-DEFINED | NULLABLE | DEFAULT: 'other'::load_medium
- **weight_kg** | numeric | NULLABLE
- **default_bar_weight_kg** | numeric | NULLABLE
- **default_side_min_plate_kg** | numeric | NULLABLE
- **default_single_min_increment_kg** | numeric | NULLABLE
- **default_stack** | jsonb | NULLABLE | DEFAULT: '[]'::jsonb
- **configured** | boolean | NOT NULL | DEFAULT: false
- **notes** | text | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### equipment_grip_defaults
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **equipment_id** | uuid | NOT NULL
- **grip_id** | uuid | NOT NULL
- **handle_id** | uuid | NULLABLE
- **is_default** | boolean | NOT NULL | DEFAULT: false
- **created_at** | timestamp with time zone | NULLABLE | DEFAULT: now()

### equipment_handle_orientations
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **equipment_id** | uuid | NOT NULL
- **handle_id** | uuid | NOT NULL
- **orientation** | USER-DEFINED | NOT NULL
- **is_default** | boolean | NOT NULL | DEFAULT: false
- **created_at** | timestamp with time zone | NULLABLE | DEFAULT: now()

### equipment_translations
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **equipment_id** | uuid | NOT NULL
- **language_code** | text | NOT NULL
- **name** | text | NOT NULL
- **description** | text | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()
- **updated_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### equipments
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **name** | text | NOT NULL
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### exercise_aliases
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **exercise_id** | uuid | NOT NULL
- **alias** | text | NOT NULL
- **language_code** | text | NULLABLE | DEFAULT: 'en'::text
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### exercise_default_grips
- **exercise_id** | uuid | NOT NULL
- **grip_id** | uuid | NOT NULL
- **order_index** | integer | NOT NULL | DEFAULT: 1

### exercise_equipment_variants
- **exercise_id** | uuid | NOT NULL
- **equipment_id** | uuid | NOT NULL
- **is_preferred** | boolean | NOT NULL | DEFAULT: false

### exercise_grip_effects
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **exercise_id** | uuid | NOT NULL
- **grip_id** | uuid | NOT NULL
- **muscle_id** | uuid | NOT NULL
- **equipment_id** | uuid | NULLABLE
- **effect_pct** | numeric | NOT NULL
- **is_primary_override** | boolean | NOT NULL | DEFAULT: false
- **note** | text | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### exercise_grips
- **exercise_id** | uuid | NOT NULL
- **grip_id** | uuid | NOT NULL
- **is_default** | boolean | NOT NULL | DEFAULT: false
- **order_index** | integer | NOT NULL | DEFAULT: 1
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### exercise_handle_orientations
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **exercise_id** | uuid | NOT NULL
- **handle_id** | uuid | NOT NULL
- **orientation** | USER-DEFINED | NOT NULL
- **is_default** | boolean | NOT NULL | DEFAULT: false
- **created_at** | timestamp with time zone | NULLABLE | DEFAULT: now()

### exercise_images
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **exercise_id** | uuid | NOT NULL
- **user_id** | uuid | NOT NULL
- **url** | text | NOT NULL
- **path** | text | NOT NULL
- **is_primary** | boolean | NOT NULL | DEFAULT: false
- **order_index** | integer | NOT NULL | DEFAULT: 1
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### exercise_metric_defs
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **metric_id** | uuid | NOT NULL
- **exercise_id** | uuid | NULLABLE
- **equipment_id** | uuid | NULLABLE
- **is_required** | boolean | NOT NULL | DEFAULT: false
- **order_index** | integer | NOT NULL | DEFAULT: 1
- **default_value** | jsonb | NULLABLE

### exercise_similars
- **exercise_id** | uuid | NOT NULL
- **similar_exercise_id** | uuid | NOT NULL
- **similarity_score** | numeric | NULLABLE | DEFAULT: 0.8
- **reason** | text | NULLABLE
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

### exercises
- **id** | uuid | NOT NULL | DEFAULT: gen_random_uuid()
- **slug** | text | NOT NULL
- **display_name** | text | NULLABLE
- **custom_display_name** | text | NULLABLE
- **name_locale** | text | NULLABLE | DEFAULT: 'en'::text
- **name_version** | integer | NULLABLE | DEFAULT: 1
- **display_name_tsv** | tsvector | NULLABLE
- **movement_id** | uuid | NULLABLE
- **movement_pattern_id** | uuid | NULLABLE
- **equipment_id** | uuid | NOT NULL
- **equipment_ref_id** | uuid | NULLABLE
- **primary_muscle_id** | uuid | NULLABLE
- **secondary_muscle_group_ids** | ARRAY | NULLABLE
- **body_part_id** | uuid | NULLABLE
- **default_grip_ids** | ARRAY | NULLABLE | DEFAULT: '{}'::uuid[]
- **is_unilateral** | boolean | NULLABLE | DEFAULT: false
- **allows_grips** | boolean | NULLABLE | DEFAULT: true
- **exercise_skill_level** | USER-DEFINED | NULLABLE | DEFAULT: 'medium'::exercise_skill_level
- **complexity_score** | smallint | NULLABLE | DEFAULT: 3
- **is_bar_loaded** | boolean | NOT NULL | DEFAULT: false
- **default_bar_type_id** | uuid | NULLABLE
- **default_bar_weight** | numeric | NULLABLE
- **load_type** | USER-DEFINED | NULLABLE
- **loading_hint** | text | NULLABLE
- **capability_schema** | jsonb | NULLABLE | DEFAULT: '{}'::jsonb
- **attribute_values_json** | jsonb | NOT NULL | DEFAULT: '{}'::jsonb
- **contraindications** | jsonb | NULLABLE | DEFAULT: '[]'::jsonb
- **configured** | boolean | NOT NULL | DEFAULT: false
- **is_public** | boolean | NOT NULL | DEFAULT: true
- **owner_user_id** | uuid | NULLABLE
- **image_url** | text | NULLABLE
- **thumbnail_url** | text | NULLABLE
- **source_url** | text | NULLABLE
- **popularity_rank** | integer | NULLABLE
- **tags** | ARRAY | NULLABLE | DEFAULT: '{}'::text[]
- **created_at** | timestamp with time zone | NOT NULL | DEFAULT: now()

## Additional Schema Information

**User-Defined Types:**
- load_type: ENUM for equipment load types
- load_medium: ENUM for load mediums  
- weight_unit: ENUM for weight units (kg, lb)
- exercise_skill_level: ENUM for exercise difficulty levels

**Row-Level Security:**
- All tables have RLS enabled
- Policies vary by table based on access patterns
- Authentication-based access control

**Indexes:**
- Primary keys on all tables
- Additional indexes on frequently queried columns
- Full-text search indexes where applicable

**Triggers:**
- Updated_at timestamp triggers on relevant tables
- Validation triggers for data integrity
- Audit logging triggers

This schema represents a comprehensive fitness tracking application with support for exercises, workouts, equipment, user management, coaching features, and more.