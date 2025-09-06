# Foreign Key Constraints Export

*Generated on: 2025-08-27*

This document outlines all foreign key relationships in the fitness application database, organized by functional areas.

## Core Workout Flow

### Workouts
- **workouts.user_id** → auth.users.id (CASCADE DELETE)
- **workouts.gym_id** → gyms.id (SET NULL DELETE)

### Workout Exercises
- **workout_exercises.workout_id** → workouts.id (CASCADE DELETE)
- **workout_exercises.exercise_id** → exercises.id (RESTRICT DELETE)

### Workout Sets
- **workout_sets.workout_exercise_id** → workout_exercises.id (CASCADE DELETE)

### Workout Checkins (Pre-workout readiness)
- **workout_checkins.workout_id** → workouts.id (CASCADE DELETE)
- **workout_checkins.user_id** → auth.users.id (CASCADE DELETE)

## Templates System

### Workout Templates
- **workout_templates.user_id** → auth.users.id (CASCADE DELETE)

### Template Exercises
- **template_exercises.template_id** → workout_templates.id (CASCADE DELETE)
- **template_exercises.exercise_id** → exercises.id (RESTRICT DELETE)

## Exercise Definition System

### Exercises
- **exercises.owner_user_id** → auth.users.id (SET NULL DELETE)
- **exercises.equipment_id** → equipment.id (RESTRICT DELETE)
- **exercises.body_part_id** → body_parts.id (SET NULL DELETE)
- **exercises.primary_muscle_id** → muscles.id (SET NULL DELETE)
- **exercises.default_bar_type_id** → bar_types.id (SET NULL DELETE)

### Exercise Relationships
- **exercise_handles.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_handles.handle_id** → handles.id (CASCADE DELETE)

- **exercise_grips.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_grips.grip_id** → grips.id (CASCADE DELETE)

- **exercise_handle_grips.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_handle_grips.handle_id** → handles.id (CASCADE DELETE)
- **exercise_handle_grips.grip_id** → grips.id (CASCADE DELETE)

- **exercise_default_handles.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_default_handles.handle_id** → handles.id (CASCADE DELETE)

- **exercise_default_grips.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_default_grips.grip_id** → grips.id (CASCADE DELETE)

### Exercise Advanced Features
- **exercise_equipment_variants.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_equipment_variants.equipment_id** → equipment.id (CASCADE DELETE)

- **exercise_similars.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_similars.similar_exercise_id** → exercises.id (CASCADE DELETE)

- **exercise_grip_effects.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_grip_effects.grip_id** → grips.id (CASCADE DELETE)
- **exercise_grip_effects.muscle_id** → muscles.id (CASCADE DELETE)
- **exercise_grip_effects.equipment_id** → equipment.id (SET NULL DELETE)

## Handles & Grips System

### Handle-Grip Compatibility
- **handle_grip_compatibility.handle_id** → handles.id (CASCADE DELETE)
- **handle_grip_compatibility.grip_id** → grips.id (CASCADE DELETE)

## Personal Records & Progress Tracking

### Personal Records
- **personal_records.user_id** → auth.users.id (CASCADE DELETE)
- **personal_records.exercise_id** → exercises.id (CASCADE DELETE)
- **personal_records.workout_set_id** → workout_sets.id (SET NULL DELETE)

### User Exercise Estimates (New)
- **user_exercise_estimates.user_id** → auth.users.id (CASCADE DELETE)
- **user_exercise_estimates.exercise_id** → exercises.id (CASCADE DELETE)

## User Profile & Preferences

### User Roles
- **user_roles.user_id** → auth.users.id (CASCADE DELETE)

### User Gyms
- **user_gyms.user_id** → auth.users.id (CASCADE DELETE)
- **user_gyms.gym_id** → gyms.id (CASCADE DELETE)

## Gyms & Equipment

### Gym Equipment
- **gym_equipment.gym_id** → gyms.id (CASCADE DELETE)
- **gym_equipment.equipment_id** → equipment.id (CASCADE DELETE)

- **gym_equipment_availability.gym_id** → gyms.id (CASCADE DELETE)
- **gym_equipment_availability.equipment_id** → equipment.id (CASCADE DELETE)

- **gym_equipment_overrides.gym_id** → gyms.id (CASCADE DELETE)
- **gym_equipment_overrides.equipment_id** → equipment.id (CASCADE DELETE)

- **gym_plate_inventory.gym_id** → gyms.id (CASCADE DELETE)

### Gym Administration
- **gym_admins.user_id** → auth.users.id (CASCADE DELETE)
- **gym_admins.gym_id** → gyms.id (CASCADE DELETE)

- **gym_aliases.gym_id** → gyms.id (CASCADE DELETE)

## Translation System

### Exercise Translations
- **exercises_translations.exercise_id** → exercises.id (CASCADE DELETE)

### Equipment Translations
- **equipment_translations.equipment_id** → equipment.id (CASCADE DELETE)

### Body Part Translations
- **body_parts_translations.body_part_id** → body_parts.id (CASCADE DELETE)

### Muscle Translations
- **muscles_translations.muscle_id** → muscles.id (CASCADE DELETE)

### Handle Translations
- **handle_translations.handle_id** → handles.id (CASCADE DELETE)
- **handles_translations.handle_id** → handles.id (CASCADE DELETE)

### Grip Translations
- **grips_translations.grip_id** → grips.id (CASCADE DELETE)

## Administrative & Audit

### Admin Audit Log
- **admin_audit_log.target_user_id** → auth.users.id (SET NULL DELETE)
- **admin_audit_log.performed_by** → auth.users.id (SET NULL DELETE)

### Rate Limiting
- **admin_check_rate_limit.user_id** → auth.users.id (CASCADE DELETE)

## Achievement System

### User Achievements
- **user_achievements.user_id** → auth.users.id (CASCADE DELETE)
- **user_achievements.achievement_id** → achievements.id (CASCADE DELETE)

## Auto-Training Features

### Auto Deload Triggers
- **auto_deload_triggers.user_id** → auth.users.id (CASCADE DELETE)
- **auto_deload_triggers.exercise_id** → exercises.id (CASCADE DELETE)

## Challenges & Social

### Challenges
- **challenges.creator_id** → auth.users.id (CASCADE DELETE)

### Challenge Participants
- **challenge_participants.challenge_id** → challenges.id (CASCADE DELETE)
- **challenge_participants.user_id** → auth.users.id (CASCADE DELETE)

### Friendships
- **friendships.requester_id** → auth.users.id (CASCADE DELETE)
- **friendships.addressee_id** → auth.users.id (CASCADE DELETE)

## Monitoring & Quality

### Coach Logs
- **coach_logs.user_id** → auth.users.id (CASCADE DELETE)

### Exercise Images
- **exercise_images.exercise_id** → exercises.id (CASCADE DELETE)
- **exercise_images.user_id** → auth.users.id (CASCADE DELETE)

### Idempotency
- **idempotency_keys.user_id** → auth.users.id (CASCADE DELETE)

## Cascade Rules Summary

### CASCADE DELETE (Dependent data)
- All user-specific data (workouts, templates, records, etc.)
- Translation data (cascades with parent records)
- Join tables and relationship mappings
- User preferences and settings

### RESTRICT DELETE (Referenced data protection)
- Core exercise definitions
- Equipment definitions
- System reference data (body parts, muscles)

### SET NULL DELETE (Optional references)
- Gym references in workouts
- Bar type references in exercises
- Workout set references in personal records

## Unique Constraints

### Multi-column Unique Constraints
- **workout_checkins**: (workout_id, user_id) - One readiness check per workout
- **user_exercise_estimates**: (user_id, exercise_id) - One estimate per user per exercise
- **personal_records**: (user_id, exercise_id, kind, grip_key) - One PR per type per grip
- **exercise_grips**: (exercise_id, grip_id) - No duplicate grips per exercise
- **exercise_handles**: (exercise_id, handle_id) - No duplicate handles per exercise
- **user_roles**: (user_id, role) - No duplicate role assignments
- **user_gyms**: (user_id, gym_id) - No duplicate gym memberships

## Important Notes

1. **Data Integrity**: All user-specific data cascades when a user is deleted
2. **System Protection**: Core exercise and equipment data is protected from deletion
3. **Translation Consistency**: All translation data cascades with parent records
4. **Workout History**: Workout data is preserved even if templates are deleted (data is copied, not referenced)
5. **Grip Tracking**: Personal records can be tracked per grip type for more granular progress tracking
6. **Readiness Tracking**: Pre-workout readiness data is linked to specific workouts for correlation analysis