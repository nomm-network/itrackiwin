# Complete Foreign Key Relationships

## User System Foreign Keys

### Core User Tables
- `user_roles.user_id` → `users.id`
- `user_preferences.user_id` → `users.id`
- `user_profile_fitness.user_id` → `users.id`
- `user_pinned_subcategories.user_id` → `users.id`
- `user_achievements.user_id` → `users.id`
- `user_exercise_estimates.user_id` → `users.id`
- `user_exercise_analytics.user_id` → `users.id`
- `friendships.user_id` → `users.id`
- `friendships.friend_id` → `users.id`

### Profile and Preferences
- `user_profile_fitness.experience_level_id` → `experience_levels.id`
- `user_pinned_subcategories.subcategory_id` → `life_subcategories.id`

## Exercise System Foreign Keys

### Exercise Core
- `exercises.equipment_id` → `equipment.id`
- `exercises.primary_muscle_id` → `muscle_groups.id`
- `exercises.body_part_id` → `body_parts.id`
- `exercises.movement_pattern_id` → `movement_patterns.id`
- `exercises.movement_id` → `movements.id`
- `exercises.default_bar_type_id` → `bar_types.id`
- `exercises.owner_user_id` → `users.id`

### Exercise Relationships
- `exercise_aliases.exercise_id` → `exercises.id`
- `exercise_equipment_variants.exercise_id` → `exercises.id`
- `exercise_equipment_variants.equipment_id` → `equipment.id`
- `exercise_grips.exercise_id` → `exercises.id`
- `exercise_grips.grip_id` → `grips.id`
- `exercise_grip_effects.exercise_id` → `exercises.id`
- `exercise_grip_effects.grip_id` → `grips.id`
- `exercise_grip_effects.muscle_id` → `muscle_groups.id`
- `exercise_grip_effects.equipment_id` → `equipment.id`
- `exercise_handle_orientations.exercise_id` → `exercises.id`
- `exercise_handle_orientations.handle_id` → `handles.id`
- `exercise_images.exercise_id` → `exercises.id`
- `exercise_images.user_id` → `users.id`
- `exercise_metric_defs.exercise_id` → `exercises.id`
- `exercise_metric_defs.metric_id` → `metric_defs.id`
- `exercise_metric_defs.equipment_id` → `equipment.id`
- `exercise_similars.exercise_id` → `exercises.id`
- `exercise_similars.similar_exercise_id` → `exercises.id`

### Exercise Equipment Profiles
- `exercise_equipment_profiles.exercise_id` → `exercises.id`
- `exercise_default_grips.exercise_id` → `exercises.id`
- `exercise_default_grips.grip_id` → `grips.id`

## Workout System Foreign Keys

### Workout Core
- `workouts.user_id` → `users.id`
- `workouts.template_id` → `workout_templates.id`
- `workout_exercises.workout_id` → `workouts.id`
- `workout_exercises.exercise_id` → `exercises.id`
- `workout_exercises.grip_id` → `grips.id`
- `workout_sets.workout_exercise_id` → `workout_exercises.id`
- `workout_sets.grip_id` → `grips.id`

### Workout Templates
- `workout_templates.user_id` → `users.id`
- `template_exercises.template_id` → `workout_templates.id`
- `template_exercises.exercise_id` → `exercises.id`

### Workout Metrics and Grips
- `workout_set_metric_values.workout_set_id` → `workout_sets.id`
- `workout_set_metric_values.metric_def_id` → `metric_defs.id`
- `workout_set_grips.workout_set_id` → `workout_sets.id`
- `workout_set_grips.grip_id` → `grips.id`

### Workout Checkins
- `workout_checkins.workout_id` → `workouts.id`
- `workout_checkins.user_id` → `users.id`
- `readiness_checkins.user_id` → `users.id`
- `readiness_checkins.workout_id` → `workouts.id`
- `pre_workout_checkins.user_id` → `users.id`
- `pre_workout_checkins.workout_id` → `workouts.id`

### Workout Groups
- `workout_exercise_groups.workout_id` → `workouts.id`
- `workout_exercise_group_items.group_id` → `workout_exercise_groups.id`
- `workout_exercise_group_items.workout_exercise_id` → `workout_exercises.id`

## Gym Management Foreign Keys

### Gym Core
- `gym_admins.gym_id` → `gyms.id`
- `gym_admins.user_id` → `users.id`
- `gym_memberships.gym_id` → `gyms.id`
- `gym_memberships.user_id` → `users.id`
- `gym_equipment.gym_id` → `gyms.id`
- `gym_equipment.equipment_id` → `equipment.id`
- `gym_monthly_revenue.gym_id` → `gyms.id`

### Gym Relationships
- `gym_role_requests.gym_id` → `gyms.id`
- `gym_role_requests.user_id` → `users.id`
- `gym_role_requests.decided_by` → `users.id`
- `gyms.city_id` → `cities.id`

### User Gym Data
- `user_gym_equipment.user_id` → `users.id`
- `user_gym_equipment.gym_id` → `gyms.id`
- `user_gym_equipment.equipment_id` → `equipment.id`
- `user_gym_plates.user_gym_id` → `user_gym_equipment.id`
- `user_gym_miniweights.user_gym_id` → `user_gym_equipment.id`

## Coach & Mentorship Foreign Keys

### Mentor Profiles
- `mentor_profiles.user_id` → `users.id`
- `mentors.user_id` → `users.id`
- `mentors.gym_id` → `gyms.id`

### Mentorships
- `mentorships.mentor_id` → `mentor_profiles.id`
- `mentorships.client_user_id` → `users.id`
- `mentorships.gym_id` → `gyms.id`

### Coach Assignments
- `coach_assigned_templates.mentorship_id` → `mentorships.id`
- `coach_assigned_templates.template_id` → `workout_templates.id`
- `coach_client_links.coach_user_id` → `users.id`
- `coach_client_links.client_user_id` → `users.id`
- `coach_client_links.gym_id` → `gyms.id`
- `coach_client_links.requested_by` → `users.id`
- `coach_client_links.decided_by` → `users.id`

### Coach Logs
- `coach_logs.user_id` → `users.id`

## Achievement & Gamification Foreign Keys

### Achievements
- `user_achievements.user_id` → `users.id`
- `user_achievements.achievement_id` → `achievements.id`

### Challenges
- `challenges.creator_id` → `users.id`
- `challenge_participants.challenge_id` → `challenges.id`
- `challenge_participants.user_id` → `users.id`

### Leaderboards
- `leaderboard_entries.leaderboard_id` → `leaderboards.id`
- `leaderboard_entries.user_id` → `users.id`

### Social Features
- `social_posts.user_id` → `users.id`
- `social_posts.workout_id` → `workouts.id`
- `social_likes.user_id` → `users.id`
- `social_likes.post_id` → `social_posts.id`
- `social_friendships.user_id` → `users.id`
- `social_friendships.friend_id` → `users.id`

## Ambassador & Business Foreign Keys

### Ambassador System
- `ambassador_profiles.user_id` → `users.id`
- `ambassador_commission_agreements.ambassador_id` → `ambassador_profiles.id`
- `ambassador_commission_agreements.gym_id` → `gyms.id`
- `ambassador_commission_agreements.battle_id` → `battles.id`
- `ambassador_commission_accruals.agreement_id` → `ambassador_commission_agreements.id`
- `ambassador_gym_deals.ambassador_id` → `ambassador_profiles.id`
- `ambassador_gym_deals.gym_id` → `gyms.id`
- `ambassador_gym_deals.battle_id` → `battles.id`
- `ambassador_gym_deals.verified_by` → `users.id`
- `ambassador_gym_visits.ambassador_id` → `ambassador_profiles.id`
- `ambassador_gym_visits.gym_id` → `gyms.id`

### Battle System
- `battles.city_id` → `cities.id`
- `battle_participants.battle_id` → `battles.id`
- `battle_participants.ambassador_id` → `ambassador_profiles.id`
- `battle_invitations.battle_id` → `battles.id`
- `battle_invitations.ambassador_id` → `ambassador_profiles.id`

## Equipment & Resources Foreign Keys

### Equipment
- `equipment_translations.equipment_id` → `equipment.id`
- `equipment_grip_defaults.equipment_id` → `equipment.id`
- `equipment_grip_defaults.grip_id` → `grips.id`
- `equipment_grip_defaults.handle_id` → `handles.id`
- `equipment_handle_orientations.equipment_id` → `equipment.id`
- `equipment_handle_orientations.handle_id` → `handles.id`

### Muscle System
- `muscle_group_translations.muscle_group_id` → `muscle_groups.id`
- `muscles.muscle_group_id` → `muscle_groups.id`
- `muscle_translations.muscle_id` → `muscles.id`

### Body Parts
- `body_parts_translations.body_part_id` → `body_parts.id`

### Grips and Handles
- `grip_translations.grip_id` → `grips.id`
- `handle_translations.handle_id` → `handles.id`

## Life Categories Foreign Keys

### Categories
- `life_category_translations.category_id` → `life_categories.id`
- `life_subcategories.category_id` → `life_categories.id`
- `life_subcategory_translations.subcategory_id` → `life_subcategories.id`

## Metric System Foreign Keys

### Metrics
- `workout_set_metric_values.metric_def_id` → `metric_defs.id`
- `exercise_metric_defs.metric_id` → `metric_defs.id`

## Cycle & Health Foreign Keys

### Health Tracking
- `cycle_events.user_id` → `users.id`

## System & Configuration Foreign Keys

### Audit and Admin
- `admin_audit_log.performed_by` → `users.id`
- `admin_audit_log.target_user_id` → `users.id`
- `admin_check_rate_limit.user_id` → `users.id`

### Auto Deload
- `auto_deload_triggers.user_id` → `users.id`
- `auto_deload_triggers.exercise_id` → `exercises.id`

### Content Management
- `carousel_images.created_by` → `users.id`

### Attribute System
- `attribute_schemas.scope_ref_id` → (various tables based on scope)

## Cascade Behaviors

### CASCADE DELETE
- User deletion cascades to all user-owned data
- Workout deletion cascades to exercises and sets
- Template deletion cascades to template exercises

### RESTRICT DELETE
- Exercise deletion restricted if referenced in workouts
- Equipment deletion restricted if used in exercises
- Gym deletion restricted if has active memberships

### SET NULL
- Exercise equipment reference on equipment deletion
- User role assignments on role deletion

## Key Relationship Patterns

### User-Centric Design
Most tables relate back to users either directly or through ownership chains:
```
users → workouts → workout_exercises → workout_sets
users → workout_templates → template_exercises
users → achievements, preferences, profiles, etc.
```

### Hierarchical Relationships
- Categories → Subcategories → User Selections
- Equipment → Exercise Variants → Workout Usage
- Muscle Groups → Individual Muscles → Exercise Targeting

### Many-to-Many Relationships
Implemented via junction tables:
- `exercise_grips` (exercises ↔ grips)
- `workout_set_grips` (sets ↔ grips)
- `exercise_equipment_variants` (exercises ↔ equipment)
- `battle_participants` (battles ↔ ambassadors)

### Soft Delete Support
Some relationships support soft deletion patterns where records are marked inactive rather than deleted, preserving referential integrity for historical data.