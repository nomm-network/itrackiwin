# Complete Foreign Keys Export

## Foreign Key Relationships

Based on the database schema analysis, here are the foreign key relationships identified in the fitness tracking application:

### Primary Foreign Key Constraints

**Note**: This database primarily uses UUID-based relationships without explicit foreign key constraints in many cases for flexibility. However, the logical relationships exist through:

#### User-Related Relationships
- `users.id` → Referenced by most user-specific tables
- `auth.users` → Primary authentication table (Supabase managed)

#### Exercise-Related Relationships
- `exercises.id` → Referenced by:
  - `exercise_aliases.exercise_id`
  - `exercise_equipment_variants.exercise_id` 
  - `exercise_grip_effects.exercise_id`
  - `exercise_grips.exercise_id`
  - `exercise_handle_orientations.exercise_id`
  - `exercise_images.exercise_id`
  - `exercise_similars.exercise_id`
  - `exercise_similars.similar_exercise_id`
  - `template_exercises.exercise_id`
  - `workout_exercises.exercise_id`

#### Equipment-Related Relationships
- `equipment.id` → Referenced by:
  - `exercises.equipment_id`
  - `equipment_grip_defaults.equipment_id`
  - `equipment_handle_orientations.equipment_id`
  - `equipment_translations.equipment_id`
  - `exercise_equipment_variants.equipment_id`
  - `exercise_grip_effects.equipment_id`
  - `exercise_metric_defs.equipment_id`
  - `gym_equipment.equipment_id`
  - `gym_equipment_availability.equipment_id`
  - `gym_equipment_overrides.equipment_id`

#### Grip-Related Relationships
- `grips.id` → Referenced by:
  - `equipment_grip_defaults.grip_id`
  - `grips_translations.grip_id`
  - `exercise_default_grips.grip_id`
  - `exercise_grip_effects.grip_id`
  - `exercise_grips.grip_id`
  - `template_exercise_grips.grip_id`
  - `workout_set_grips.grip_id`

#### Muscle Group Relationships
- `muscle_groups.id` → Referenced by:
  - `exercises.primary_muscle_id`
  - `muscle_groups_translations.muscle_group_id`
  - `exercise_grip_effects.muscle_id`
  - `user_muscle_priorities.muscle_group_id`
  - `user_prioritized_muscle_groups.muscle_group_id`

#### Workout-Related Relationships
- `workouts.id` → Referenced by:
  - `workout_exercises.workout_id`
  - `workout_checkins.workout_id`

- `workout_exercises.id` → Referenced by:
  - `workout_sets.workout_exercise_id`
  - `workout_exercise_feedback.workout_exercise_id`

- `workout_sets.id` → Referenced by:
  - `workout_set_grips.workout_set_id`
  - `workout_set_metric_values.workout_set_id`

#### Template Relationships
- `workout_templates.id` → Referenced by:
  - `template_exercises.template_id`
  - `coach_assigned_templates.template_id`
  - `user_active_templates.template_id`
  - `user_favorite_templates.template_id`

#### Gym-Related Relationships
- `gyms.id` → Referenced by:
  - `gym_admins.gym_id`
  - `gym_aliases.gym_id`
  - `gym_equipment.gym_id`
  - `gym_equipment_availability.gym_id`
  - `gym_equipment_overrides.gym_id`
  - `gym_plate_inventory.gym_id`
  - `user_gym_memberships.gym_id`
  - `user_gym_visits.gym_id`

#### Translation Relationships
- `languages.code` → Referenced by:
  - `body_parts_translations.language_code`
  - `equipment_translations.language_code`
  - `exercises_translations.language_code`
  - `grips_translations.language_code`
  - `life_category_translations.language_code`
  - `muscle_groups_translations.language_code`
  - `movements_translations.language_code`

## Referential Integrity Notes

1. **Soft Foreign Keys**: Many relationships use UUID references without explicit constraints for flexibility
2. **User References**: Most user-related tables reference `auth.users.id` indirectly through application logic
3. **Cascade Behaviors**: Where constraints exist, most use CASCADE DELETE for cleanup
4. **Optional References**: Many foreign key columns are nullable to support partial data

## Data Integrity Patterns

- **User Isolation**: Most data is isolated by user_id for multi-tenancy
- **Soft Deletes**: Some tables use `is_active` flags instead of hard deletes
- **Audit Trails**: Admin actions and changes are logged in audit tables
- **Versioning**: Some entities support versioning for data evolution

This foreign key structure supports a flexible, scalable fitness tracking application with strong data relationships while maintaining performance and development agility.