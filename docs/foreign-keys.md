# Foreign Key Relationships

Complete documentation of all foreign key relationships in the database.

## 📋 Overview
This document lists all foreign key constraints that maintain referential integrity across the database. Foreign keys ensure that relationships between tables are properly maintained and prevent orphaned records.

## 🔗 Foreign Key Reference

### User System Relationships

#### `users` table dependencies:
- No foreign keys (base auth table reference)

#### Tables referencing `users`:
- `user_roles.user_id` → `users.id`
- `user_preferences.user_id` → `users.id`  
- `user_achievements.user_id` → `users.id`
- `user_exercise_preferences.user_id` → `users.id`
- `user_gym_memberships.user_id` → `users.id`
- `user_workout_templates.user_id` → `users.id`
- `friendships.requester_id` → `users.id`
- `friendships.addressee_id` → `users.id`

### Exercise System Relationships

#### `exercises` table:
- `exercises.equipment_id` → `equipment.id`
- `exercises.primary_muscle_id` → `muscle_groups.id`
- `exercises.body_part_id` → `body_parts.id`
- `exercises.movement_id` → `movements.id`
- `exercises.movement_pattern_id` → `movement_patterns.id`
- `exercises.owner_user_id` → `users.id`
- `exercises.default_bar_type_id` → `bar_types.id`

#### Tables referencing `exercises`:
- `exercise_aliases.exercise_id` → `exercises.id`
- `exercise_images.exercise_id` → `exercises.id`
- `exercise_similars.exercise_id` → `exercises.id`
- `exercise_similars.similar_exercise_id` → `exercises.id`
- `exercise_equipment_variants.exercise_id` → `exercises.id`
- `exercise_grips.exercise_id` → `exercises.id`
- `exercise_metric_defs.exercise_id` → `exercises.id`
- `workout_exercises.exercise_id` → `exercises.id`
- `template_exercises.exercise_id` → `exercises.id`
- `user_exercise_preferences.exercise_id` → `exercises.id`
- `exercise_equipment_profiles.exercise_id` → `exercises.id`

#### `equipment` table:
- No incoming foreign keys (referenced by exercises)

#### Tables referencing `equipment`:
- `exercises.equipment_id` → `equipment.id`
- `exercise_equipment_variants.equipment_id` → `equipment.id`
- `gym_equipment.equipment_id` → `equipment.id`
- `equipment_translations.equipment_id` → `equipment.id`
- `equipment_grip_defaults.equipment_id` → `equipment.id`

### Workout System Relationships

#### `workouts` table:
- `workouts.user_id` → `users.id`
- `workouts.gym_id` → `gyms.id`
- `workouts.template_id` → `workout_templates.id`

#### `workout_exercises` table:
- `workout_exercises.workout_id` → `workouts.id`
- `workout_exercises.exercise_id` → `exercises.id`
- `workout_exercises.superset_group_id` → `workout_superset_groups.id`
- `workout_exercises.grip_id` → `grips.id`

#### `workout_sets` table:
- `workout_sets.workout_exercise_id` → `workout_exercises.id`
- `workout_sets.rest_timer_id` → `rest_timers.id`

#### `workout_templates` table:
- `workout_templates.user_id` → `users.id`
- `workout_templates.created_by` → `users.id`

#### `template_exercises` table:
- `template_exercises.template_id` → `workout_templates.id`
- `template_exercises.exercise_id` → `exercises.id`

### Gym System Relationships

#### `gyms` table:
- `gyms.created_by` → `users.id`
- `gyms.city_id` → `cities.id`

#### `gym_equipment` table:
- `gym_equipment.gym_id` → `gyms.id`
- `gym_equipment.equipment_id` → `equipment.id`
- `gym_equipment.added_by` → `users.id`

#### `gym_admins` table:
- `gym_admins.gym_id` → `gyms.id`
- `gym_admins.user_id` → `users.id`
- `gym_admins.assigned_by` → `users.id`

#### `gym_memberships` table:
- `gym_memberships.user_id` → `users.id`
- `gym_memberships.gym_id` → `gyms.id`

### Coach & Mentorship Relationships

#### `mentors` table:
- `mentors.user_id` → `users.id`
- `mentors.gym_id` → `gyms.id`

#### `mentorships` table:
- `mentorships.mentor_id` → `mentors.id`
- `mentorships.client_user_id` → `users.id`

#### `mentor_categories` table:
- `mentor_categories.mentor_id` → `mentors.id`
- `mentor_categories.category_id` → `life_categories.id`

### Achievement System Relationships

#### `achievements` table:
- No foreign keys (system definitions)

#### `user_achievements` table:
- `user_achievements.user_id` → `users.id`
- `user_achievements.achievement_id` → `achievements.id`

### Challenge System Relationships

#### `challenges` table:
- `challenges.creator_id` → `users.id`

#### `challenge_participants` table:
- `challenge_participants.challenge_id` → `challenges.id`
- `challenge_participants.user_id` → `users.id`

### Ambassador System Relationships

#### `ambassador_profiles` table:
- `ambassador_profiles.user_id` → `users.id`

#### `ambassador_commission_agreements` table:
- `ambassador_commission_agreements.ambassador_id` → `ambassador_profiles.id`
- `ambassador_commission_agreements.gym_id` → `gyms.id`
- `ambassador_commission_agreements.battle_id` → `battles.id`

#### `ambassador_commission_accruals` table:
- `ambassador_commission_accruals.agreement_id` → `ambassador_commission_agreements.id`

#### `ambassador_gym_deals` table:
- `ambassador_gym_deals.battle_id` → `battles.id`
- `ambassador_gym_deals.gym_id` → `gyms.id`
- `ambassador_gym_deals.ambassador_id` → `ambassador_profiles.id`
- `ambassador_gym_deals.verified_by` → `users.id`

#### `ambassador_gym_visits` table:
- `ambassador_gym_visits.ambassador_id` → `ambassador_profiles.id`
- `ambassador_gym_visits.gym_id` → `gyms.id`

### Battle System Relationships

#### `battles` table:
- `battles.city_id` → `cities.id`

#### `battle_participants` table:
- `battle_participants.battle_id` → `battles.id`
- `battle_participants.ambassador_id` → `ambassador_profiles.id`

#### `battle_invitations` table:
- `battle_invitations.battle_id` → `battles.id`
- `battle_invitations.ambassador_id` → `ambassador_profiles.id`

### Muscle & Body System Relationships

#### `muscle_groups` table:
- `muscle_groups.parent_id` → `muscle_groups.id` (self-reference)

#### `muscles` table:
- `muscles.muscle_group_id` → `muscle_groups.id`

#### Tables with translation relationships:
- `exercises_translations.exercise_id` → `exercises.id`
- `equipment_translations.equipment_id` → `equipment.id`
- `muscle_groups_translations.muscle_group_id` → `muscle_groups.id`
- `muscles_translations.muscle_id` → `muscles.id`
- `movements_translations.movement_id` → `movements.id`
- `movement_patterns_translations.movement_pattern_id` → `movement_patterns.id`
- `body_parts_translations.body_part_id` → `body_parts.id`

### Grip System Relationships

#### `grips` table:
- No foreign keys (base definitions)

#### Tables referencing `grips`:
- `exercise_grips.grip_id` → `grips.id`
- `equipment_grip_defaults.grip_id` → `grips.id`
- `workout_sets.grip_id` → `grips.id`
- `grips_translations.grip_id` → `grips.id`

### Metric System Relationships

#### `metric_defs` table:
- No foreign keys (base definitions)

#### Tables referencing `metric_defs`:
- `exercise_metric_defs.metric_id` → `metric_defs.id`
- `workout_set_metric_values.metric_def_id` → `metric_defs.id`

### Life Categories Relationships

#### `life_categories` table:
- No foreign keys (base categories)

#### `life_subcategories` table:
- `life_subcategories.category_id` → `life_categories.id`

#### Tables referencing life categories:
- `life_category_translations.category_id` → `life_categories.id`
- `life_subcategory_translations.subcategory_id` → `life_subcategories.id`
- `user_pinned_subcategories.subcategory_id` → `life_subcategories.id`

### Admin & Audit Relationships

#### `admin_audit_log` table:
- `admin_audit_log.target_user_id` → `users.id`
- `admin_audit_log.performed_by` → `users.id`

#### `admin_check_rate_limit` table:
- `admin_check_rate_limit.user_id` → `users.id`

### Geography Relationships

#### `cities` table:
- No foreign keys (geographic data)

#### Tables referencing `cities`:
- `gyms.city_id` → `cities.id`
- `battles.city_id` → `cities.id`

## 🔄 Cascade Behaviors

### CASCADE DELETE
When a parent record is deleted, child records are automatically deleted:
- `users` deletion cascades to most user-related tables
- `workouts` deletion cascades to `workout_exercises` and `workout_sets`
- `exercises` deletion cascades to related exercise data

### RESTRICT DELETE
Some relationships prevent deletion if child records exist:
- `equipment` cannot be deleted if referenced by exercises
- `gyms` cannot be deleted if they have memberships or equipment

### SET NULL
Some relationships set foreign key to NULL when parent is deleted:
- `mentors.gym_id` set to NULL if gym is deleted
- Optional relationships typically use SET NULL

## 🛡️ Referential Integrity

All foreign key constraints ensure:
1. **Data Consistency** - No orphaned records
2. **Relationship Integrity** - Valid connections between entities
3. **Cascade Management** - Proper cleanup when parent records are removed
4. **Performance** - Indexes on foreign key columns for efficient joins

## 📊 Key Relationship Patterns

### User-Centric Design
Most tables either directly or indirectly relate to users, enabling:
- Personal data isolation
- User-specific filtering
- Privacy controls
- Data ownership

### Hierarchical Relationships
Several tables have self-referencing foreign keys:
- `muscle_groups.parent_id` → `muscle_groups.id`
- `life_categories` → `life_subcategories`

### Many-to-Many Relationships
Implemented through junction tables:
- `exercise_equipment_variants` (exercises ↔ equipment)
- `exercise_grips` (exercises ↔ grips)
- `gym_equipment` (gyms ↔ equipment)
- `battle_participants` (battles ↔ ambassadors)

### Soft Delete Support
Some tables support soft deletes while maintaining referential integrity:
- `users.deleted_at` allows logical deletion
- Foreign keys remain valid for historical data