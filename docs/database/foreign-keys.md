# Foreign Key Relationships

## Exercise System Relationships

### Core Exercise References
```sql
-- exercises table
exercises.body_part_id → body_parts.id
exercises.equipment_id → equipment.id
exercises.default_bar_type_id → bar_types.id

-- Translation references
exercises_translations.exercise_id → exercises.id
equipment_translations.equipment_id → equipment.id
body_parts_translations.body_part_id → body_parts.id
handle_translations.handle_id → handles.id
grips_translations.grip_id → grips.id
```

### Exercise-Handle-Grip Relationships
```sql
-- Handle associations
exercise_handles.exercise_id → exercises.id
exercise_handles.handle_id → handles.id

-- Grip associations  
exercise_grips.exercise_id → exercises.id
exercise_grips.grip_id → grips.id

-- Combined handle-grip mappings
exercise_handle_grips.exercise_id → exercises.id
exercise_handle_grips.handle_id → handles.id
exercise_handle_grips.grip_id → grips.id

-- Equipment compatibility (KEY for new exercises)
equipment_handle_grips.equipment_id → equipment.id
equipment_handle_grips.handle_id → handles.id
equipment_handle_grips.grip_id → grips.id
```

### Exercise Effects & Variants
```sql
-- Grip effects on muscle activation
exercise_grip_effects.exercise_id → exercises.id
exercise_grip_effects.grip_id → grips.id
exercise_grip_effects.equipment_id → equipment.id

-- Similar exercises
exercise_similars.exercise_id → exercises.id
exercise_similars.similar_exercise_id → exercises.id

-- Equipment variants
exercise_equipment_variants.exercise_id → exercises.id
exercise_equipment_variants.equipment_id → equipment.id
```

## Workout System Relationships

### Core Workout Flow
```sql
-- Workout hierarchy
workouts.user_id → auth.users.id (Supabase managed)
workout_exercises.workout_id → workouts.id
workout_exercises.exercise_id → exercises.id
workout_sets.workout_exercise_id → workout_exercises.id

-- Equipment selections in workouts
workout_exercises.handle_id → handles.id
workout_exercises.bar_type_id → bar_types.id
workout_sets.bar_type_id → bar_types.id
```

### Template System
```sql
-- Template structure
workout_templates.user_id → auth.users.id (Supabase managed)
template_exercises.template_id → workout_templates.id
template_exercises.exercise_id → exercises.id
template_exercises.handle_id → handles.id
```

### Performance Tracking
```sql
-- Personal records
personal_records.user_id → auth.users.id (Supabase managed)
personal_records.exercise_id → exercises.id
personal_records.workout_set_id → workout_sets.id

-- Readiness tracking
readiness_checkins.user_id → auth.users.id (Supabase managed)
readiness_checkins.workout_id → workouts.id

-- Auto deload
auto_deload_triggers.user_id → auth.users.id (Supabase managed)
auto_deload_triggers.exercise_id → exercises.id
```

## User & Social Relationships

### User Profiles & Roles
```sql
-- User profile extensions
user_profile_fitness.user_id → auth.users.id (Supabase managed)
user_roles.user_id → auth.users.id (Supabase managed)

-- Achievements
user_achievements.user_id → auth.users.id (Supabase managed)
user_achievements.achievement_id → achievements.id
```

### Social Features
```sql
-- Friendships
friendships.requester_id → auth.users.id (Supabase managed)
friendships.addressee_id → auth.users.id (Supabase managed)

-- Challenges
challenges.creator_id → auth.users.id (Supabase managed)
challenge_participants.user_id → auth.users.id (Supabase managed)
challenge_participants.challenge_id → challenges.id
```

## Health & Tracking Relationships

### Cycle & Health Tracking
```sql
-- Menstrual cycle
cycle_events.user_id → auth.users.id (Supabase managed)

-- Custom metrics
metric_entries.user_id → auth.users.id (Supabase managed)
metric_entries.metric_def_id → metric_defs.id

-- Exercise-specific metrics
exercise_metric_defs.metric_id → metric_defs.id
exercise_metric_defs.exercise_id → exercises.id
exercise_metric_defs.equipment_id → equipment.id
```

## Gym & Equipment Relationships

### Gym Management
```sql
-- Gym administration
gym_admins.user_id → auth.users.id (Supabase managed)
gym_admins.gym_id → gyms.id

-- Gym aliases
gym_aliases.gym_id → gyms.id

-- User gym equipment
user_gym_equipment.user_id → auth.users.id (Supabase managed)
user_gym_equipment.gym_id → gyms.id
user_gym_equipment.equipment_id → equipment.id

-- Gym-specific equipment settings
user_gym_plates.user_gym_id → user_gym_equipment.id
user_gym_miniweights.user_gym_id → user_gym_equipment.id
user_gym_bars.user_gym_id → user_gym_equipment.id
user_gym_bars.bar_type_id → bar_types.id
```

## Admin & Audit Relationships

### Administrative
```sql
-- Audit logging
admin_audit_log.performed_by → auth.users.id (Supabase managed)
admin_audit_log.target_user_id → auth.users.id (Supabase managed)

-- Rate limiting
admin_check_rate_limit.user_id → auth.users.id (Supabase managed)

-- Coach logging
coach_logs.user_id → auth.users.id (Supabase managed)
```

### Exercise Media
```sql
-- Exercise images
exercise_images.exercise_id → exercises.id
exercise_images.user_id → auth.users.id (Supabase managed)
```

## Key Relationship Patterns

### 1. User Ownership Pattern
Most user-specific tables follow this pattern:
```sql
table.user_id → auth.users.id (Supabase managed)
```
Protected by RLS policies using `auth.uid() = user_id`.

### 2. Exercise Configuration Pattern
Exercise customization follows this hierarchy:
```sql
Exercise → Handle Selection → Grip Selection → Muscle Effects
```

### 3. Workout Hierarchy Pattern
```sql
Workout → Workout Exercises → Workout Sets
Template → Template Exercises
```

### 4. Translation Pattern
Most content tables have corresponding translation tables:
```sql
content_table.id → content_table_translations.content_id
```

### 5. Soft Reference Pattern
Some relationships use nullable foreign keys for flexibility:
- `exercises.owner_user_id` (NULL for system exercises)
- `workout_exercises.handle_id` (NULL for grip-only exercises)
- `personal_records.grip_key` (NULL for gripless exercises)

## Cascade Behaviors

### ON DELETE CASCADE
- Translation tables cascade when parent is deleted
- Workout components cascade when workout is deleted
- Template components cascade when template is deleted

### ON DELETE SET NULL
- Exercise references in workouts/templates when exercise is deleted
- Equipment references when equipment is soft-deleted

### ON DELETE RESTRICT
- Core reference tables (body_parts, equipment) cannot be deleted if referenced
- User deletion is handled by Supabase Auth policies