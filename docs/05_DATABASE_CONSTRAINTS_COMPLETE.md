# Complete Database Constraints Export

## Database Constraints Overview
- **Database Type**: PostgreSQL with comprehensive constraint system
- **Schema**: Public schema constraint definitions
- **Constraint Types**: Primary keys, foreign keys, unique constraints, check constraints
- **Total Constraints**: 500+ constraints across all tables
- **Export Date**: 2025-01-06

## Primary Key Constraints

### Table Primary Keys
| Table | Primary Key | Column(s) |
|-------|-------------|-----------|
| achievements | achievements_pkey | id |
| admin_audit_log | admin_audit_log_pkey | id |
| admin_check_rate_limit | admin_check_rate_limit_pkey | id |
| attribute_schemas | attribute_schemas_pkey | id |
| auto_deload_triggers | auto_deload_triggers_pkey | id |
| bar_types | bar_types_pkey | id |
| body_parts | body_parts_pkey | id |
| body_parts_translations | body_parts_translations_pkey | id |
| carousel_images | carousel_images_pkey | id |
| challenge_participants | challenge_participants_pkey | id |
| challenges | challenges_pkey | id |
| coach_assigned_templates | coach_assigned_templates_pkey | id |
| coach_logs | coach_logs_pkey | id |
| cycle_events | cycle_events_pkey | id |
| data_quality_reports | data_quality_reports_pkey | id |
| equipment | equipment_pkey | id |
| equipment_grip_defaults | equipment_grip_defaults_pkey | id |
| equipment_handle_orientations | equipment_handle_orientations_pkey | id |
| equipment_translations | equipment_translations_pkey | id |
| equipments | equipments_pkey | id |
| exercise_aliases | exercise_aliases_pkey | id |
| exercise_grip_effects | exercise_grip_effects_pkey | id |
| exercise_handle_orientations | exercise_handle_orientations_pkey | id |
| exercise_images | exercise_images_pkey | id |
| exercise_metric_defs | exercise_metric_defs_pkey | id |
| exercises | exercises_pkey | id |
| exercises_translations | exercises_translations_pkey | id |
| friendships | friendships_pkey | id |
| grips | grips_pkey | id |
| grips_translations | grips_translations_pkey | id |
| gym_aliases | gym_aliases_pkey | id |
| gym_equipment | gym_equipment_pkey | id |
| gym_equipment_availability | gym_equipment_availability_pkey | id |
| gym_equipment_overrides | gym_equipment_overrides_pkey | id |
| gym_plate_inventory | gym_plate_inventory_pkey | id |

*Note: All primary keys use UUID data type with gen_random_uuid() defaults*

## Foreign Key Constraints

### Critical Foreign Key Relationships

#### User-Related Foreign Keys
| Constraint | Table | Column | References |
|------------|-------|--------|------------|
| auto_deload_triggers_user_id_fkey | auto_deload_triggers | user_id | auth.users(id) ON DELETE CASCADE |
| carousel_images_created_by_fkey | carousel_images | created_by | auth.users(id) |
| challenge_participants_user_id_fkey | challenge_participants | user_id | auth.users(id) ON DELETE CASCADE |
| challenges_creator_id_fkey | challenges | creator_id | auth.users(id) ON DELETE CASCADE |
| cycle_events_user_id_fkey | cycle_events | user_id | auth.users(id) ON DELETE CASCADE |
| friendships_requester_id_fkey | friendships | requester_id | auth.users(id) ON DELETE CASCADE |
| friendships_addressee_id_fkey | friendships | addressee_id | auth.users(id) ON DELETE CASCADE |

#### Exercise-Related Foreign Keys
| Constraint | Table | Column | References |
|------------|-------|--------|------------|
| auto_deload_triggers_exercise_id_fkey | auto_deload_triggers | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_aliases_exercise_id_fkey | exercise_aliases | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_default_grips_exercise_id_fkey | exercise_default_grips | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_equipment_variants_exercise_id_fkey | exercise_equipment_variants | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_grip_effects_exercise_id_fkey | exercise_grip_effects | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_grips_exercise_id_fkey | exercise_grips | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_handle_orientations_exercise_id_fkey | exercise_handle_orientations | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_images_exercise_id_fkey | exercise_images | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_metric_defs_exercise_id_fkey | exercise_metric_defs | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_similars_exercise_id_fkey | exercise_similars | exercise_id | exercises(id) ON DELETE CASCADE |
| exercise_similars_similar_exercise_id_fkey | exercise_similars | similar_exercise_id | exercises(id) ON DELETE CASCADE |

#### Equipment-Related Foreign Keys
| Constraint | Table | Column | References |
|------------|-------|--------|------------|
| equipment_grip_defaults_equipment_id_fkey | equipment_grip_defaults | equipment_id | equipment(id) ON DELETE CASCADE |
| equipment_handle_orientations_equipment_id_fkey | equipment_handle_orientations | equipment_id | equipment(id) ON DELETE CASCADE |
| equipment_translations_equipment_id_fkey | equipment_translations | equipment_id | equipment(id) ON DELETE CASCADE |
| exercise_equipment_variants_equipment_id_fkey | exercise_equipment_variants | equipment_id | equipment(id) ON DELETE CASCADE |
| exercise_grip_effects_equipment_id_fkey | exercise_grip_effects | equipment_id | equipment(id) |
| exercise_metric_defs_equipment_id_fkey | exercise_metric_defs | equipment_id | equipment(id) |

#### Workout-Related Foreign Keys
| Constraint | Table | Column | References |
|------------|-------|--------|------------|
| workout_exercises_workout_id_fkey | workout_exercises | workout_id | workouts(id) ON DELETE CASCADE |
| workout_exercises_exercise_id_fkey | workout_exercises | exercise_id | exercises(id) |
| workout_sets_workout_exercise_id_fkey | workout_sets | workout_exercise_id | workout_exercises(id) ON DELETE CASCADE |
| workout_set_grips_workout_set_id_fkey | workout_set_grips | workout_set_id | workout_sets(id) ON DELETE CASCADE |
| workout_set_metric_values_workout_set_id_fkey | workout_set_metric_values | workout_set_id | workout_sets(id) ON DELETE CASCADE |

#### Template-Related Foreign Keys
| Constraint | Table | Column | References |
|------------|-------|--------|------------|
| template_exercises_template_id_fkey | template_exercises | template_id | workout_templates(id) ON DELETE CASCADE |
| template_exercises_exercise_id_fkey | template_exercises | exercise_id | exercises(id) |
| coach_assigned_templates_template_id_fkey | coach_assigned_templates | template_id | workout_templates(id) ON DELETE CASCADE |
| coach_assigned_templates_mentorship_id_fkey | coach_assigned_templates | mentorship_id | mentorships(id) ON DELETE CASCADE |

## Unique Constraints

### Business Logic Unique Constraints
| Constraint | Table | Columns | Purpose |
|------------|-------|---------|---------|
| bar_types_name_default_weight_unit_key | bar_types | name, default_weight, unit | Prevent duplicate bar type definitions |
| body_parts_slug_key | body_parts | slug | Ensure unique body part identifiers |
| body_parts_translations_body_part_id_language_code_key | body_parts_translations | body_part_id, language_code | One translation per language |
| challenge_participants_challenge_id_user_id_key | challenge_participants | challenge_id, user_id | Prevent duplicate challenge participation |
| coach_assigned_templates_mentorship_id_template_id_key | coach_assigned_templates | mentorship_id, template_id | Prevent duplicate template assignments |
| equipment_slug_key | equipment | slug | Ensure unique equipment identifiers |
| equipment_translations_equipment_id_language_code_key | equipment_translations | equipment_id, language_code | One translation per language |
| exercise_aliases_exercise_id_alias_key | exercise_aliases | exercise_id, alias | Prevent duplicate aliases per exercise |
| exercise_default_grips_exercise_id_grip_id_key | exercise_default_grips | exercise_id, grip_id | Prevent duplicate grip assignments |
| exercise_equipment_variants_exercise_id_equipment_id_key | exercise_equipment_variants | exercise_id, equipment_id | Prevent duplicate equipment variants |
| exercise_grips_exercise_id_grip_id_key | exercise_grips | exercise_id, grip_id | Prevent duplicate grip options |
| exercises_slug_key | exercises | slug | Ensure unique exercise identifiers |
| exercises_translations_exercise_id_language_code_key | exercises_translations | exercise_id, language_code | One translation per language |
| friendships_requester_id_addressee_id_key | friendships | requester_id, addressee_id | Prevent duplicate friendship requests |
| grips_slug_key | grips | slug | Ensure unique grip identifiers |
| grips_translations_grip_id_language_code_key | grips_translations | grip_id, language_code | One translation per language |
| gym_admins_user_id_gym_id_key | gym_admins | user_id, gym_id | One admin role per user per gym |
| gym_equipment_gym_id_equipment_id_key | gym_equipment | gym_id, equipment_id | Prevent duplicate equipment entries per gym |

### User Data Unique Constraints
| Constraint | Table | Columns | Purpose |
|------------|-------|---------|---------|
| user_profile_fitness_user_id_key | user_profile_fitness | user_id | One fitness profile per user |
| user_profile_general_user_id_key | user_profile_general | user_id | One general profile per user |
| user_profile_goals_user_id_key | user_profile_goals | user_id | One goals profile per user |
| user_roles_user_id_role_key | user_roles | user_id, role | Prevent duplicate role assignments |
| user_settings_user_id_setting_key_key | user_settings | user_id, setting_key | One value per setting per user |
| user_streak_data_user_id_streak_type_key | user_streak_data | user_id, streak_type | One streak record per type per user |
| user_xp_user_id_key | user_xp | user_id | One XP record per user |

### Workout Data Unique Constraints
| Constraint | Table | Columns | Purpose |
|------------|-------|---------|---------|
| workout_exercises_workout_id_exercise_id_key | workout_exercises | workout_id, exercise_id | Prevent duplicate exercises in workout |
| workout_sets_workout_exercise_id_set_index_key | workout_sets | workout_exercise_id, set_index | Ensure unique set ordering |
| workout_templates_user_id_name_key | workout_templates | user_id, name | Prevent duplicate template names per user |
| template_exercises_template_id_exercise_id_key | template_exercises | template_id, exercise_id | Prevent duplicate exercises in template |

## Check Constraints

### Value Range Constraints
| Constraint | Table | Condition | Purpose |
|------------|-------|-----------|---------|
| ck_workout_sets_weight_nonneg | workout_sets | weight >= 0 | Prevent negative weights |
| ck_workout_sets_reps_nonneg | workout_sets | reps >= 0 | Prevent negative reps |
| ck_workout_sets_distance_nonneg | workout_sets | distance >= 0 | Prevent negative distances |
| ck_workout_sets_duration_nonneg | workout_sets | duration_seconds >= 0 | Prevent negative durations |
| ck_workout_sets_rpe_range | workout_sets | rpe BETWEEN 0 AND 10 | Valid RPE range |
| ck_ws_metrics_nonneg | workout_set_metric_values | int_value >= 0 AND numeric_value >= 0 | Prevent negative metric values |
| pain_events_severity_score_check | pain_events | severity_score BETWEEN 1 AND 10 | Valid pain severity range |
| readiness_checkins_energy_check | readiness_checkins | energy BETWEEN 1 AND 10 | Valid energy range |
| readiness_checkins_motivation_check | readiness_checkins | motivation BETWEEN 1 AND 10 | Valid motivation range |
| readiness_checkins_sleep_hours_check | readiness_checkins | sleep_hours BETWEEN 0 AND 24 | Valid sleep hours |
| readiness_checkins_stress_check | readiness_checkins | stress BETWEEN 1 AND 10 | Valid stress range |

### Enum Value Constraints
| Constraint | Table | Column | Valid Values |
|------------|-------|--------|--------------|
| attribute_schemas_visibility_check | attribute_schemas | visibility | 'general', 'pro_only', 'deprecated' |
| auto_deload_triggers_trigger_type_check | auto_deload_triggers | trigger_type | 'failed_sessions', 'rpe_too_high', 'volume_drop', 'readiness_low' |
| challenges_challenge_type_check | challenges | challenge_type | 'distance', 'weight', 'reps', 'time', 'workouts' |
| cycle_events_kind_check | cycle_events | kind | 'period_start', 'period_end' |
| friendships_status_check | friendships | status | 'pending', 'accepted', 'declined', 'blocked' |
| gym_admins_role_check | gym_admins | role | 'owner', 'admin', 'staff' |
| gym_equipment_loading_mode_check | gym_equipment | loading_mode | 'plates', 'stack', 'fixed', 'bodyweight', 'band' |
| mentor_profiles_status_check | mentor_profiles | status | 'active', 'inactive', 'pending_approval' |
| mentorships_status_check | mentorships | status | 'active', 'paused', 'completed', 'cancelled' |
| pain_events_body_region_check | pain_events | body_region | 'neck', 'shoulders', 'back', 'hips', 'knees', 'ankles', 'wrists', 'elbows', 'other' |
| personal_records_record_type_check | personal_records | record_type | 'weight', 'reps', '1rm', 'volume', 'time', 'distance' |
| user_gym_memberships_status_check | user_gym_memberships | status | 'active', 'inactive', 'pending' |
| user_settings_setting_key_check | user_settings | setting_key | 'weight_unit', 'language', 'theme', 'notifications' |
| user_streak_data_streak_type_check | user_streak_data | streak_type | 'workout', 'checkin', 'goal_progress' |
| workout_exercise_groups_group_type_check | workout_exercise_groups | group_type | 'superset', 'circuit', 'giant_set' |

### Business Logic Constraints
| Constraint | Table | Condition | Purpose |
|------------|-------|-----------|---------|
| template_exercises_reps_weight_check | template_exercises | (target_reps IS NULL AND target_weight_kg IS NULL) = false | At least one target must be specified |
| workout_exercises_target_check | workout_exercises | (target_sets IS NULL AND target_reps IS NULL AND target_weight_kg IS NULL) = false | At least one target must be specified |
| user_profile_fitness_height_check | user_profile_fitness | height_cm BETWEEN 50 AND 300 | Realistic height range |
| user_profile_fitness_weight_check | user_profile_fitness | weight_kg BETWEEN 20 AND 500 | Realistic weight range |
| user_profile_goals_target_weight_check | user_profile_goals | target_weight_kg BETWEEN 20 AND 500 | Realistic target weight |
| user_xp_check | user_xp | total_xp >= 0 AND current_level >= 1 | Valid XP and level values |
| workout_sets_completed_check | workout_sets | (is_completed = true) = (completed_at IS NOT NULL) | Completion consistency |

### Date and Time Constraints
| Constraint | Table | Condition | Purpose |
|------------|-------|-----------|---------|
| challenges_date_order_check | challenges | end_date >= start_date | Logical date ordering |
| mentorships_date_order_check | mentorships | (ended_at IS NULL) OR (ended_at >= started_at) | Logical date ordering |
| pain_events_date_check | pain_events | event_date <= CURRENT_DATE | No future pain events |
| user_profile_fitness_birth_date_check | user_profile_fitness | birth_date <= CURRENT_DATE | Valid birth date |
| workout_duration_check | workouts | (ended_at IS NULL) OR (ended_at >= started_at) | Logical workout duration |

## Constraint Naming Conventions

### Primary Keys
- Format: `{table_name}_pkey`
- Example: `exercises_pkey`, `workout_sets_pkey`

### Foreign Keys
- Format: `{table_name}_{column_name}_fkey`
- Example: `exercises_equipment_id_fkey`, `workout_sets_workout_exercise_id_fkey`

### Unique Constraints
- Format: `{table_name}_{column_name(s)}_key`
- Example: `exercises_slug_key`, `user_roles_user_id_role_key`

### Check Constraints
- Format: `{table_name}_{column_name}_{constraint_type}_check` or `ck_{table_name}_{description}`
- Example: `ck_workout_sets_weight_nonneg`, `challenges_challenge_type_check`

## Constraint Performance Impact

### Indexed Constraints
- All primary key constraints automatically create unique indexes
- Foreign key constraints benefit from indexes on referencing columns
- Unique constraints automatically create unique indexes

### Validation Overhead
- Check constraints add validation overhead on INSERT/UPDATE
- Enum constraints are validated against enum definitions
- Range constraints use efficient numeric comparisons

### Cascade Behavior
- ON DELETE CASCADE used for parent-child relationships
- Ensures data consistency when parent records are deleted
- Reduces orphaned records and maintains referential integrity

## Constraint Maintenance

### Adding Constraints
- New constraints should be added via database migrations
- Consider impact on existing data when adding constraints
- Test constraint performance with production-like data volumes

### Modifying Constraints
- Constraint modifications typically require DROP/ADD operations
- Plan for application downtime during constraint changes
- Validate data before applying new constraints

### Monitoring Constraints
- Monitor constraint violation errors in application logs
- Track constraint check performance for large tables
- Regular validation of constraint effectiveness and necessity

This comprehensive constraint system ensures data integrity, business logic enforcement, and optimal database performance across the entire application.