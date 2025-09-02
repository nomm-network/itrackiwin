# COMPLETE DATABASE TABLES

## All Public Schema Tables (Total: 100+ tables)

### Core System
- achievements
- admin_audit_log
- admin_check_rate_limit
- attribute_schemas
- auto_deload_triggers
- bar_types
- data_quality_reports
- experience_level_configs
- idempotency_keys
- languages
- mentor_categories
- mentors
- metric_defs
- naming_templates
- spatial_ref_sys
- text_translations

### Body Taxonomy
- body_parts
- body_parts_translations
- muscle_groups
- muscle_groups_translations
- muscles
- muscles_translations

### Equipment & Grips
- equipment
- equipment_grip_defaults
- equipment_handle_orientations
- equipment_translations
- equipments
- grips
- grips_translations
- handle_equipment_rules
- handle_orientation_compatibility

### Exercise System
- exercise_aliases
- exercise_default_grips
- exercise_equipment_variants
- exercise_grip_effects
- exercise_grips
- exercise_handle_orientations
- exercise_images
- exercise_metric_defs
- exercise_similars
- exercises
- exercises_translations

### Movement System
- movement_patterns
- movement_patterns_translations
- movements
- movements_translations

### Gym Management
- gym_admins
- gym_aliases
- gym_equipment
- gym_equipment_availability
- gym_equipment_overrides
- gym_plate_inventory
- gyms

### Workout System
- workout_exercise_feedback
- workout_exercise_groups
- workout_exercises
- workout_set_grips
- workout_set_metric_values
- workout_sets
- workout_templates
- workouts

### Template System
- template_exercise_grips
- template_exercise_machine_pref
- template_exercise_preferences
- template_exercises

### User Management
- profiles
- user_achievements
- user_active_templates
- user_category_prefs
- user_equipment_preferences
- user_exercise_estimates
- user_exercise_overrides
- user_exercise_warmup_prefs
- user_exercise_warmups
- user_features
- user_fitness_profile
- user_gamification
- user_goals
- user_gym_bars
- user_gym_dumbbells
- user_gym_machines
- user_gym_memberships
- user_gym_miniweights
- user_gym_plates
- user_gym_stacks
- user_pinned_subcategories
- user_profile_fitness
- user_roles
- user_routine_notes
- user_session_sets
- user_target_muscle_groups
- user_workout_notes
- users

### Social & Challenges
- challenge_participants
- challenges
- friendships

### Health & Wellness
- cycle_events
- pain_events
- readiness_checkins
- pre_workout_checkins
- preworkout_checkins

### Life Categories
- life_categories
- life_category_translations
- life_subcategories
- life_subcategory_translations

### Progress Tracking
- personal_records
- progressive_overload_plans
- progression_policies
- rest_timer_sessions
- streaks
- training_program_blocks
- training_programs

### System Logs
- coach_logs

## Views and Materialized Views
- v_exercises_with_translations
- v_body_parts_with_translations
- v_muscle_groups_with_translations
- v_muscles_with_translations
- v_last_working_set
- mv_user_exercise_1rm
- mv_last_set_per_user_exercise
- mv_pr_weight_per_user_exercise

## PostGIS Tables (Spatial)
- geography_columns
- geometry_columns
- spatial_ref_sys

**Total Tables: 100+**
**Key Pattern: Multi-language support through translation tables**
**Architecture: Modular design with clear separation of concerns**