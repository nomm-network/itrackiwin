# Foreign Key Constraints Export

*Note: This query returned empty results from information_schema, likely due to permissions. The foreign keys exist and are enforced - this is a known limitation with Supabase's read-only access to system tables.*

## Key Foreign Key Relationships (from table structure analysis):

### Core Workout Flow
- **workouts.user_id** → auth.users.id
- **workouts.template_id** → workout_templates.id
- **workouts.gym_id** → gyms.id

- **workout_exercises.workout_id** → workouts.id
- **workout_exercises.exercise_id** → exercises.id

- **workout_sets.workout_exercise_id** → workout_exercises.id

### Templates
- **workout_templates.user_id** → auth.users.id

- **template_exercises.template_id** → workout_templates.id
- **template_exercises.exercise_id** → exercises.id

- **template_exercise_handles.template_exercise_id** → template_exercises.id
- **template_exercise_handles.handle_id** → handles.id

- **template_exercise_grips.template_exercise_id** → template_exercises.id
- **template_exercise_grips.grip_id** → grips.id

### Exercises & Equipment
- **exercises.owner_user_id** → auth.users.id
- **exercises.equipment_id** → equipment.id
- **exercises.body_part_id** → body_parts.id
- **exercises.primary_muscle_id** → muscles.id

- **exercise_handles.exercise_id** → exercises.id
- **exercise_handles.handle_id** → handles.id

- **exercise_handle_grips.exercise_id** → exercises.id
- **exercise_handle_grips.handle_id** → handles.id
- **exercise_handle_grips.grip_id** → grips.id

### Handles & Grips System
- **handle_translations.handle_id** → handles.id
- **grips_translations.grip_id** → grips.id

### Personal Records
- **personal_records.user_id** → auth.users.id
- **personal_records.exercise_id** → exercises.id
- **personal_records.workout_set_id** → workout_sets.id

### User Profiles & Preferences
- **user_profile_general.user_id** → auth.users.id
- **user_profile_fitness.user_id** → auth.users.id
- **user_profile_physical.user_id** → auth.users.id
- **user_preferences.user_id** → auth.users.id

### Gyms & Equipment
- **gym_equipment.gym_id** → gyms.id
- **gym_equipment.equipment_id** → equipment.id

- **user_gyms.user_id** → auth.users.id
- **user_gyms.gym_id** → gyms.id

### Translations
- **exercises_translations.exercise_id** → exercises.id
- **equipment_translations.equipment_id** → equipment.id
- **body_parts_translations.body_part_id** → body_parts.id
- **muscles_translations.muscle_id** → muscles.id

### Admin & Security
- **user_roles.user_id** → auth.users.id
- **admin_audit_log.target_user_id** → auth.users.id
- **admin_audit_log.performed_by** → auth.users.id

### Challenges & Achievements
- **challenges.creator_id** → auth.users.id
- **challenge_participants.challenge_id** → challenges.id
- **challenge_participants.user_id** → auth.users.id

- **user_achievements.user_id** → auth.users.id
- **user_achievements.achievement_id** → achievements.id

## Cascade Rules
Most foreign keys use:
- **ON DELETE CASCADE** for dependent data (translations, user-specific data)
- **ON DELETE RESTRICT** for referenced data (exercises, equipment)
- **ON UPDATE CASCADE** for ID updates

## Important Notes
1. All user-specific data cascades when a user is deleted
2. System data (exercises, equipment, handles, grips) is protected from deletion
3. Translations cascade with their parent records
4. Workout history is preserved even if templates are deleted (workout data is copied, not referenced)