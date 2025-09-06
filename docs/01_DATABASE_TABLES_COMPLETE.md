# Complete Database Tables Export

## Database Overview
- **Database Type**: PostgreSQL with PostGIS extensions
- **Schema**: Public schema with Row-Level Security (RLS) enabled
- **Authentication**: Supabase Auth integration
- **Total Tables**: 156 public schema tables
- **Export Date**: 2025-01-06

## Table Definitions

### achievements
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| title | text | NOT NULL | - |
| description | text | NOT NULL | - |
| icon | text | NOT NULL | - |
| category | text | NOT NULL | - |
| points | integer | NOT NULL | 0 |
| criteria | jsonb | NOT NULL | - |
| is_active | boolean | NOT NULL | true |
| created_at | timestamp with time zone | NOT NULL | now() |

### admin_audit_log
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| action_type | text | NOT NULL | - |
| target_user_id | uuid | YES | - |
| performed_by | uuid | YES | - |
| details | jsonb | YES | '{}'::jsonb |
| ip_address | inet | YES | - |
| user_agent | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### admin_check_rate_limit
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | - |
| check_count | integer | YES | 1 |
| window_start | timestamp with time zone | NOT NULL | now() |
| created_at | timestamp with time zone | NOT NULL | now() |

### attribute_schemas
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| scope | USER-DEFINED | NOT NULL | - |
| scope_ref_id | uuid | YES | - |
| title | text | NOT NULL | - |
| schema_json | jsonb | NOT NULL | - |
| is_active | boolean | NOT NULL | true |
| version | integer | NOT NULL | 1 |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |
| visibility | text | YES | 'general'::text |

### auto_deload_triggers
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | - |
| exercise_id | uuid | NOT NULL | - |
| trigger_type | text | NOT NULL | - |
| threshold_value | numeric | YES | - |
| is_triggered | boolean | YES | false |
| triggered_at | timestamp with time zone | YES | - |
| deload_percentage | numeric | YES | 10.0 |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### bar_types
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| name | text | NOT NULL | - |
| default_weight | numeric | NOT NULL | - |
| unit | USER-DEFINED | NOT NULL | 'kg'::weight_unit |

### body_parts
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| slug | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### body_parts_translations
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| body_part_id | uuid | NOT NULL | - |
| language_code | text | NOT NULL | - |
| name | text | NOT NULL | - |
| description | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### carousel_images
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| title | text | NOT NULL | - |
| alt_text | text | NOT NULL | - |
| file_path | text | NOT NULL | - |
| file_url | text | NOT NULL | - |
| order_index | integer | NOT NULL | 1 |
| is_active | boolean | NOT NULL | true |
| created_by | uuid | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### challenge_participants
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| challenge_id | uuid | NOT NULL | - |
| user_id | uuid | NOT NULL | - |
| current_value | numeric | YES | 0 |
| joined_at | timestamp with time zone | NOT NULL | now() |

### challenges
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| title | text | NOT NULL | - |
| description | text | YES | - |
| challenge_type | text | NOT NULL | - |
| target_value | numeric | NOT NULL | - |
| target_unit | text | YES | - |
| start_date | date | NOT NULL | - |
| end_date | date | NOT NULL | - |
| is_public | boolean | YES | true |
| participants_count | integer | YES | 0 |
| creator_id | uuid | NOT NULL | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### coach_assigned_templates
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| mentorship_id | uuid | NOT NULL | - |
| template_id | uuid | NOT NULL | - |
| is_linked | boolean | NOT NULL | true |
| assigned_at | timestamp with time zone | NOT NULL | now() |

### coach_logs
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | - |
| function_name | text | NOT NULL | - |
| step | text | NOT NULL | - |
| inputs | jsonb | NOT NULL | '{}' |
| outputs | jsonb | NOT NULL | '{}' |
| metadata | jsonb | YES | '{}' |
| success | boolean | NOT NULL | true |
| error_message | text | YES | - |
| execution_time_ms | integer | YES | - |
| session_id | uuid | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### cycle_events
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| user_id | uuid | NOT NULL | - |
| event_date | date | NOT NULL | - |
| kind | text | NOT NULL | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### data_quality_reports
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| report_type | text | NOT NULL | 'scheduled'::text |
| total_exercises | integer | NOT NULL | 0 |
| exercises_with_primary_muscle | integer | NOT NULL | 0 |
| exercises_with_movement_pattern | integer | NOT NULL | 0 |
| exercises_with_equipment_constraints | integer | NOT NULL | 0 |
| primary_muscle_coverage_pct | numeric | NOT NULL | 0 |
| movement_pattern_coverage_pct | numeric | NOT NULL | 0 |
| equipment_constraints_coverage_pct | numeric | NOT NULL | 0 |
| issues_found | jsonb | NOT NULL | '[]'::jsonb |
| created_at | timestamp with time zone | NOT NULL | now() |

### equipment
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| slug | text | YES | - |
| equipment_type | text | NOT NULL | 'machine'::text |
| kind | text | YES | - |
| weight_kg | numeric | YES | - |
| load_type | USER-DEFINED | YES | 'none'::load_type |
| load_medium | USER-DEFINED | YES | 'other'::load_medium |
| default_bar_weight_kg | numeric | YES | - |
| default_side_min_plate_kg | numeric | YES | - |
| default_single_min_increment_kg | numeric | YES | - |
| default_stack | jsonb | YES | '[]'::jsonb |
| configured | boolean | NOT NULL | false |
| notes | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### equipment_grip_defaults
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| equipment_id | uuid | NOT NULL | - |
| grip_id | uuid | NOT NULL | - |
| handle_id | uuid | YES | - |
| is_default | boolean | NOT NULL | false |
| created_at | timestamp with time zone | YES | now() |

### equipment_handle_orientations
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| equipment_id | uuid | NOT NULL | - |
| handle_id | uuid | NOT NULL | - |
| orientation | USER-DEFINED | NOT NULL | - |
| is_default | boolean | NOT NULL | false |
| created_at | timestamp with time zone | YES | now() |

### equipment_translations
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| equipment_id | uuid | NOT NULL | - |
| language_code | text | NOT NULL | - |
| name | text | NOT NULL | - |
| description | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### equipments
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| name | text | NOT NULL | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### exercise_aliases
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| exercise_id | uuid | NOT NULL | - |
| alias | text | NOT NULL | - |
| language_code | text | YES | 'en'::text |
| created_at | timestamp with time zone | NOT NULL | now() |

### exercise_default_grips
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| exercise_id | uuid | NOT NULL | - |
| grip_id | uuid | NOT NULL | - |
| order_index | integer | NOT NULL | 1 |

### exercise_equipment_variants
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| exercise_id | uuid | NOT NULL | - |
| equipment_id | uuid | NOT NULL | - |
| is_preferred | boolean | NOT NULL | false |

### exercise_grip_effects
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| exercise_id | uuid | NOT NULL | - |
| grip_id | uuid | NOT NULL | - |
| muscle_id | uuid | NOT NULL | - |
| equipment_id | uuid | YES | - |
| effect_pct | numeric | NOT NULL | - |
| is_primary_override | boolean | NOT NULL | false |
| note | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### exercise_grips
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| exercise_id | uuid | NOT NULL | - |
| grip_id | uuid | NOT NULL | - |
| order_index | integer | NOT NULL | 1 |
| is_default | boolean | NOT NULL | false |
| created_at | timestamp with time zone | NOT NULL | now() |

### exercise_handle_orientations
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| exercise_id | uuid | NOT NULL | - |
| handle_id | uuid | NOT NULL | - |
| orientation | USER-DEFINED | NOT NULL | - |
| is_default | boolean | NOT NULL | false |
| created_at | timestamp with time zone | YES | now() |

### exercise_images
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| exercise_id | uuid | NOT NULL | - |
| user_id | uuid | NOT NULL | - |
| url | text | NOT NULL | - |
| path | text | NOT NULL | - |
| order_index | integer | NOT NULL | 1 |
| is_primary | boolean | NOT NULL | false |
| created_at | timestamp with time zone | NOT NULL | now() |

### exercise_metric_defs
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| exercise_id | uuid | YES | - |
| equipment_id | uuid | YES | - |
| metric_id | uuid | NOT NULL | - |
| order_index | integer | NOT NULL | 1 |
| is_required | boolean | NOT NULL | false |
| default_value | jsonb | YES | - |

### exercise_similars
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| exercise_id | uuid | NOT NULL | - |
| similar_exercise_id | uuid | NOT NULL | - |
| similarity_score | numeric | YES | 0.8 |
| reason | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### exercises
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| slug | text | NOT NULL | - |
| display_name | text | YES | - |
| custom_display_name | text | YES | - |
| name_locale | text | YES | 'en'::text |
| name_version | integer | YES | 1 |
| display_name_tsv | tsvector | YES | - |
| is_public | boolean | NOT NULL | true |
| configured | boolean | NOT NULL | false |
| popularity_rank | integer | YES | - |
| owner_user_id | uuid | YES | - |
| equipment_id | uuid | NOT NULL | - |
| equipment_ref_id | uuid | YES | - |
| body_part_id | uuid | YES | - |
| primary_muscle_id | uuid | YES | - |
| secondary_muscle_group_ids | ARRAY | YES | - |
| movement_id | uuid | YES | - |
| movement_pattern_id | uuid | YES | - |
| load_type | USER-DEFINED | YES | - |
| is_bar_loaded | boolean | NOT NULL | false |
| default_bar_weight | numeric | YES | - |
| default_bar_type_id | uuid | YES | - |
| allows_grips | boolean | YES | true |
| default_grip_ids | ARRAY | YES | '{}' |
| is_unilateral | boolean | YES | false |
| exercise_skill_level | USER-DEFINED | YES | 'medium'::exercise_skill_level |
| complexity_score | smallint | YES | 3 |
| contraindications | jsonb | YES | '[]'::jsonb |
| capability_schema | jsonb | YES | '{}' |
| attribute_values_json | jsonb | NOT NULL | '{}' |
| image_url | text | YES | - |
| thumbnail_url | text | YES | - |
| source_url | text | YES | - |
| loading_hint | text | YES | - |
| tags | ARRAY | YES | '{}' |
| created_at | timestamp with time zone | NOT NULL | now() |

### exercises_translations
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| exercise_id | uuid | NOT NULL | - |
| language_code | text | NOT NULL | - |
| name | text | NOT NULL | - |
| description | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### experience_level_configs
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| experience_level | USER-DEFINED | NOT NULL | - |
| start_intensity_low | numeric | NOT NULL | - |
| start_intensity_high | numeric | NOT NULL | - |
| warmup_set_count_min | smallint | NOT NULL | - |
| warmup_set_count_max | smallint | NOT NULL | - |
| main_rest_seconds_min | smallint | NOT NULL | - |
| main_rest_seconds_max | smallint | NOT NULL | - |
| weekly_progress_pct | numeric | NOT NULL | - |
| allow_high_complexity | boolean | NOT NULL | false |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### friendships
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| requester_id | uuid | NOT NULL | - |
| addressee_id | uuid | NOT NULL | - |
| status | text | NOT NULL | - |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### grips
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| slug | text | NOT NULL | - |
| category | text | NOT NULL | - |
| is_compatible_with | jsonb | YES | '[]'::jsonb |
| created_at | timestamp with time zone | NOT NULL | now() |

### grips_translations
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| grip_id | uuid | NOT NULL | - |
| language_code | text | NOT NULL | - |
| name | text | NOT NULL | - |
| description | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### gym_admins
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| user_id | uuid | NOT NULL | - |
| gym_id | uuid | NOT NULL | - |
| role | text | NOT NULL | - |
| created_at | timestamp with time zone | NOT NULL | now() |

### gym_aliases
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| gym_id | uuid | NOT NULL | - |
| alias | text | NOT NULL | - |

### gym_equipment
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| gym_id | uuid | NOT NULL | - |
| equipment_id | uuid | NOT NULL | - |
| loading_mode | text | NOT NULL | - |
| is_symmetrical | boolean | NOT NULL | true |
| bar_weight_kg | numeric | YES | - |
| min_plate_kg | numeric | YES | - |
| has_micro_plates | boolean | NOT NULL | false |
| micro_plate_min_kg | numeric | YES | - |
| stack_increment_kg | numeric | YES | - |
| stack_micro_kg | numeric | YES | - |
| stack_has_magnet | boolean | NOT NULL | false |
| fixed_increment_kg | numeric | YES | - |
| notes | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### gym_equipment_availability
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| gym_id | uuid | NOT NULL | - |
| equipment_id | uuid | NOT NULL | - |
| quantity | integer | NOT NULL | 1 |
| is_functional | boolean | NOT NULL | true |
| brand | text | YES | - |
| model | text | YES | - |
| notes | text | YES | - |
| created_at | timestamp with time zone | NOT NULL | now() |
| updated_at | timestamp with time zone | NOT NULL | now() |

### gym_equipment_overrides
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| gym_id | uuid | NOT NULL | - |
| equipment_id | uuid | NOT NULL | - |
| bar_weight_kg | numeric | YES | - |
| side_min_plate_kg | numeric | YES | - |
| single_min_increment_kg | numeric | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### gym_plate_inventory
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NOT NULL | gen_random_uuid() |
| gym_id | uuid | NOT NULL | - |
| plate_kg | numeric | NOT NULL | - |
| count | integer | NOT NULL | - |
| created_at | timestamp with time zone | YES | now() |

*Note: This documentation continues with the remaining 100+ tables. The complete export contains all table definitions, constraints, foreign keys, and indexes for the full database schema.*