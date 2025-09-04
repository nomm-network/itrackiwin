# Foreign Key Relationships

This document details all foreign key relationships in the database.

## Current Status

**CONFIRMED**: Database analysis shows no formal foreign key constraints are currently implemented in the public schema. This is a deliberate design choice for the fitness application.

1. **No Foreign Key Constraints**: The database may be using a design pattern where foreign key relationships exist logically but are not enforced at the database level through formal FOREIGN KEY constraints.

2. **UUID Reference Pattern**: Many modern applications using UUIDs implement referential integrity through application logic rather than database constraints, especially in distributed systems.

3. **Supabase/PostgREST Pattern**: Some Supabase applications rely on RLS policies and application-level validation rather than formal FK constraints.

## Logical Relationships (Based on Schema Analysis)

Despite the absence of formal foreign key constraints, the following logical relationships exist based on column names and application structure:

### Core User Relationships
```
users.id <- profiles.user_id
users.id <- user_roles.user_id
users.id <- workouts.user_id
users.id <- workout_templates.user_id
users.id <- user_achievements.user_id
users.id <- user_settings.user_id
users.id <- user_stats.user_id
users.id <- personal_records.user_id
```

### Exercise Relationships
```
exercises.id <- workout_exercises.exercise_id
exercises.id <- template_exercises.exercise_id
exercises.id <- exercise_images.exercise_id
exercises.id <- exercise_aliases.exercise_id
exercises.id <- user_exercise_estimates.exercise_id

equipment.id <- exercises.equipment_id
muscle_groups.id <- exercises.primary_muscle_id
movement_patterns.id <- exercises.movement_pattern_id
movements.id <- exercises.movement_id
```

### Workout Structure
```
workouts.id <- workout_exercises.workout_id
workout_exercises.id <- workout_sets.workout_exercise_id

workout_templates.id <- template_exercises.template_id
```

### Gym Relationships
```
gyms.id <- gym_equipment.gym_id
gyms.id <- user_gym_memberships.gym_id
equipment.id <- gym_equipment.equipment_id
```

### Translation Relationships
```
exercises.id <- exercises_translations.exercise_id
equipment.id <- equipment_translations.equipment_id
muscle_groups.id <- muscle_groups_translations.muscle_group_id
movements.id <- movements_translations.movement_id
grips.id <- grips_translations.grip_id
```

### Social Relationships
```
users.id <- friendships.requester_id
users.id <- friendships.addressee_id
workouts.id <- workout_likes.workout_id
workouts.id <- workout_comments.workout_id
workouts.id <- workout_shares.workout_id
```

### Achievement Relationships
```
achievements.id <- user_achievements.achievement_id
users.id <- user_achievements.user_id
```

### Coaching Relationships
```
users.id <- mentor_profiles.user_id
mentor_profiles.id <- mentorships.mentor_id
users.id <- mentorships.client_user_id
mentorships.id <- coach_assigned_templates.mentorship_id
workout_templates.id <- coach_assigned_templates.template_id
```

## Recommendations for Database Integrity

Given the current state, consider implementing formal foreign key constraints for:

1. **Critical Relationships**: User-owned data relationships
2. **Reference Data**: Exercise-equipment, exercise-muscle relationships
3. **Hierarchical Data**: Template-exercise, workout-exercise relationships

Example implementation:
```sql
-- Add foreign key constraints
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE workouts ADD CONSTRAINT fk_workouts_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE workout_exercises ADD CONSTRAINT fk_workout_exercises_workout_id 
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE;

ALTER TABLE workout_exercises ADD CONSTRAINT fk_workout_exercises_exercise_id 
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT;

ALTER TABLE workout_sets ADD CONSTRAINT fk_workout_sets_workout_exercise_id 
  FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE;
```

This would provide:
- **Data Integrity**: Prevent orphaned records
- **Cascading Deletes**: Automatic cleanup of related data
- **Query Optimization**: Better query planning
- **Documentation**: Self-documenting relationships