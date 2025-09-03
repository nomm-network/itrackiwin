# Foreign Key Relationships

*Generated on: 2025-01-03*

## Overview
This document details all foreign key relationships in the database, showing how tables are connected.

## Authentication & User System

### Core User References
```sql
-- Most tables reference users
profiles.user_id → auth.users.id
user_roles.user_id → auth.users.id  
user_settings.user_id → auth.users.id
user_stats.user_id → auth.users.id
```

### Admin System
```sql
admin_audit_log.target_user_id → auth.users.id
admin_audit_log.performed_by → auth.users.id
admin_check_rate_limit.user_id → auth.users.id
```

## Exercise & Equipment System

### Exercise Relationships
```sql
-- Exercise core
exercises.primary_muscle_id → muscle_groups.id
exercises.equipment_id → equipment.id
exercises.movement_id → movements.id
exercises.equipment_ref_id → equipment.id
exercises.owner_user_id → auth.users.id

-- Exercise associations
exercise_grips.exercise_id → exercises.id
exercise_grips.grip_id → grips.id
exercise_images.exercise_id → exercises.id
exercise_images.user_id → auth.users.id
exercise_aliases.exercise_id → exercises.id
exercise_similars.exercise_id → exercises.id
exercise_similars.similar_exercise_id → exercises.id
```

### Equipment Relationships
```sql
-- Equipment associations
equipment_grip_defaults.equipment_id → equipment.id
equipment_grip_defaults.grip_id → grips.id
equipment_handle_orientations.equipment_id → equipment.id
```

### Translation Relationships
```sql
-- Multi-language support
exercises_translations.exercise_id → exercises.id
equipment_translations.equipment_id → equipment.id
grips_translations.grip_id → grips.id
muscle_groups_translations.muscle_group_id → muscle_groups.id
movements_translations.movement_id → movements.id
```

## Workout System

### Workout Core
```sql
-- Workout structure
workouts.user_id → auth.users.id
workout_exercises.workout_id → workouts.id
workout_exercises.exercise_id → exercises.id
workout_sets.workout_exercise_id → workout_exercises.id

-- Workout metadata
workout_set_grips.workout_set_id → workout_sets.id
workout_set_grips.grip_id → grips.id
workout_set_metric_values.workout_set_id → workout_sets.id
workout_set_metric_values.metric_def_id → metric_defs.id
```

### Workout Social Features
```sql
workout_comments.workout_id → workouts.id
workout_comments.user_id → auth.users.id
workout_likes.workout_id → workouts.id
workout_likes.user_id → auth.users.id
workout_shares.workout_id → workouts.id
workout_shares.shared_by → auth.users.id
```

### Workout Templates
```sql
-- Template system
workout_templates.user_id → auth.users.id
template_exercises.template_id → workout_templates.id
template_exercises.exercise_id → exercises.id
template_exercise_grips.template_exercise_id → template_exercises.id
template_exercise_grips.grip_id → grips.id
```

## Health & Wellness

### Readiness & Health Tracking
```sql
pre_workout_checkins.user_id → auth.users.id
pre_workout_checkins.workout_id → workouts.id
readiness_checkins.user_id → auth.users.id
cycle_events.user_id → auth.users.id
pain_events.user_id → auth.users.id
user_injuries.user_id → auth.users.id
```

## Gym Management

### Gym System
```sql
-- Gym structure
gyms.owner_id → auth.users.id (if present)
gym_admins.gym_id → gyms.id
gym_admins.user_id → auth.users.id
gym_equipment.gym_id → gyms.id
gym_equipment.equipment_id → equipment.id

-- User gym relationships
user_gyms.user_id → auth.users.id
user_gyms.gym_id → gyms.id
user_gym_memberships.user_id → auth.users.id
user_gym_memberships.gym_id → gyms.id
```

## Training Programs

### Program Structure
```sql
training_programs.user_id → auth.users.id
training_program_blocks.program_id → training_programs.id
training_program_blocks.template_id → workout_templates.id
user_program_state.user_id → auth.users.id
user_program_state.program_id → training_programs.id
```

## Social Features

### Relationships & Community
```sql
-- User connections
friendships.requester_id → auth.users.id
friendships.addressee_id → auth.users.id

-- Challenges
challenges.creator_id → auth.users.id
challenge_participants.challenge_id → challenges.id
challenge_participants.user_id → auth.users.id

-- Mentoring
mentorships.mentor_id → mentor_profiles.id
mentorships.client_user_id → auth.users.id
mentor_profiles.user_id → auth.users.id
```

## User Preferences & Data

### Personal Records & Estimates
```sql
personal_records.user_id → auth.users.id
personal_records.exercise_id → exercises.id
user_exercise_estimates.user_id → auth.users.id
user_exercise_estimates.exercise_id → exercises.id
```

### User Preferences
```sql
user_equipment_preferences.user_id → auth.users.id
user_equipment_preferences.equipment_id → equipment.id
user_muscle_priorities.user_id → auth.users.id
user_muscle_priorities.muscle_group_id → muscle_groups.id
user_exercise_overrides.user_id → auth.users.id
user_exercise_overrides.exercise_id → exercises.id
```

## Life Categories System

### Category Structure
```sql
life_subcategories.category_id → life_categories.id
life_category_translations.category_id → life_categories.id
life_subcategory_translations.subcategory_id → life_subcategories.id
user_pinned_subcategories.user_id → auth.users.id
user_pinned_subcategories.subcategory_id → life_subcategories.id
```

## Key Patterns

### Common FK Patterns
1. **User Ownership**: Most tables have `user_id → auth.users.id`
2. **Exercise References**: Many tables reference `exercises.id`
3. **Translation Pattern**: `_translations` tables reference parent entities
4. **Workout Hierarchy**: `workouts → workout_exercises → workout_sets`
5. **Template System**: Templates mirror workout structure
6. **Gym Association**: Equipment and preferences link to gyms

### Orphaned Prevention
- CASCADE deletes configured for user data
- RESTRICT deletes for reference data
- SET NULL for optional relationships

*This documentation reflects the current database foreign key structure.*