# Foreign Key Relationships

Since the foreign key query returned empty results, this indicates that the database may not have explicit foreign key constraints defined in the standard information_schema, or the constraints are managed differently by Supabase.

However, based on the table schemas and column names, here are the implied foreign key relationships:

## Implied Foreign Key Relationships

### achievements
- No foreign keys

### admin_audit_log
- `target_user_id` → `auth.users.id`
- `performed_by` → `auth.users.id`

### admin_check_rate_limit
- `user_id` → `auth.users.id`

### ambassador_commission_accruals
- `agreement_id` → `ambassador_commission_agreements.id`

### ambassador_commission_agreements
- `ambassador_id` → `ambassador_profiles.id`
- `gym_id` → `gyms.id`
- `battle_id` → `battles.id`

### ambassador_gym_deals
- `ambassador_id` → `ambassador_profiles.id`
- `gym_id` → `gyms.id`
- `battle_id` → `battles.id`
- `verified_by` → `auth.users.id`

### ambassador_gym_visits
- `ambassador_id` → `ambassador_profiles.id`
- `gym_id` → `gyms.id`

### ambassador_profiles
- `user_id` → `auth.users.id`

### attribute_schemas
- `scope_ref_id` → Various tables based on scope

### auto_deload_triggers
- `user_id` → `auth.users.id`
- `exercise_id` → `exercises.id`

### battle_invitations
- `battle_id` → `battles.id`
- `ambassador_id` → `ambassador_profiles.id`

### battle_participants
- `battle_id` → `battles.id`
- `ambassador_id` → `ambassador_profiles.id`

### battles
- `city_id` → `cities.id`

### body_parts_translations
- `body_part_id` → `body_parts.id`

### carousel_images
- `created_by` → `auth.users.id`

### challenge_participants
- `challenge_id` → `challenges.id`
- `user_id` → `auth.users.id`

### challenges
- `creator_id` → `auth.users.id`

### coach_assigned_templates
- `mentorship_id` → `mentorships.id`
- `template_id` → `workout_templates.id`

### coach_client_links
- `coach_user_id` → `auth.users.id`
- `client_user_id` → `auth.users.id`
- `requested_by` → `auth.users.id`
- `decided_by` → `auth.users.id`
- `gym_id` → `gyms.id`

### coach_logs
- `user_id` → `auth.users.id`

### coach_subscriptions
- `user_id` → `auth.users.id`
- `coach_id` → `coaches.id`

### coaches
- `category_id` → `life_categories.id`

### cycle_events
- `user_id` → `auth.users.id`

### equipment_grip_defaults
- `equipment_id` → `equipment.id`
- `grip_id` → `grips.id`
- `handle_id` → `handles.id`

### equipment_handle_orientations
- `equipment_id` → `equipment.id`
- `handle_id` → `handles.id`

### equipment_profiles
- `equipment_id` → `equipment.id`

### equipment_translations
- `equipment_id` → `equipment.id`

### exercise_aliases
- `exercise_id` → `exercises.id`

### exercise_candidates
- `equipment_id` → `equipment.id`
- `created_by` → `auth.users.id`

### exercise_default_grips
- `exercise_id` → `exercises.id`
- `grip_id` → `grips.id`

### exercise_equipment_profiles
- `exercise_id` → `exercises.id`
- `plate_profile_id` → `plate_profiles.id`

### exercise_equipment_variants
- `exercise_id` → `exercises.id`
- `equipment_id` → `equipment.id`

### exercise_grip_effects
- `exercise_id` → `exercises.id`
- `grip_id` → `grips.id`
- `muscle_id` → `muscles.id`
- `equipment_id` → `equipment.id`

### exercise_grips
- `exercise_id` → `exercises.id`
- `grip_id` → `grips.id`

### exercise_handle_orientations
- `exercise_id` → `exercises.id`
- `handle_id` → `handles.id`

### exercises
- `body_part_id` → `body_parts.id`
- `equipment_id` → `equipment.id`
- `primary_muscle_id` → `muscles.id`
- `movement_pattern_id` → `movement_patterns.id`
- `movement_id` → `movements.id`
- `default_bar_type_id` → `bar_types.id`
- `owner_user_id` → `auth.users.id`

### exercises_translations
- `exercise_id` → `exercises.id`

## Note
The actual foreign key constraints may be implemented through Supabase's Row Level Security (RLS) policies rather than traditional PostgreSQL foreign key constraints, which is why they don't appear in the standard information_schema tables.