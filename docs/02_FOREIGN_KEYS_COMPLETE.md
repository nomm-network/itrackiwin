# Complete Foreign Key Relationships Export

**Export Date:** 2025-01-06  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  

## Summary

This database uses primarily logical foreign key relationships managed through application logic rather than enforced database constraints. Most relationships are referenced by UUID columns that point to related tables but are not enforced with actual foreign key constraints at the database level.

## Logical Foreign Key Patterns

Based on the database schema analysis, here are the comprehensive logical foreign key relationships organized by functional domain:

### Core User System
```
users.id (auth.users) → Referenced by most user-specific tables
├── user_roles.user_id
├── profiles.id  
├── user_settings.user_id
├── user_stats.user_id
├── user_achievements.user_id
├── user_features.user_id
├── user_fitness_profile.user_id
├── user_gamification.user_id
├── user_goals.user_id
├── user_gym_memberships.user_id
├── user_gym_visits.user_id
├── user_gym_profiles.user_id
├── user_injuries.user_id
├── user_lifting_prefs.user_id
├── user_muscle_priorities.user_id
├── user_prioritized_muscle_groups.user_id
├── user_program_state.user_id
├── user_pinned_subcategories.user_id
├── user_category_prefs.user_id
├── user_equipment_preferences.user_id
├── user_exercise_estimates.user_id
├── user_exercise_overrides.user_id
├── user_exercise_warmup_prefs.user_id
├── user_exercise_warmups.user_id
├── user_active_templates.user_id
├── user_favorite_templates.user_id
├── workouts.user_id
├── workout_templates.user_id
├── personal_records.user_id
├── pre_workout_checkins.user_id
├── readiness_checkins.user_id
├── pain_events.user_id
├── cycle_events.user_id
├── streaks.user_id
├── friendships.user_id
├── friendships.friend_id
├── challenge_participants.user_id
├── challenges.creator_id
├── mentor_profiles.user_id
├── mentor_clients.user_id
├── coach_logs.user_id
├── ambassador_profiles.user_id
├── admin_audit_log.target_user_id
├── admin_audit_log.performed_by
├── admin_check_rate_limit.user_id
├── auto_deload_triggers.user_id
├── exercise_images.user_id
├── exercises.owner_user_id
├── rest_timer_sessions.user_id
├── coach_client_links.coach_user_id
├── coach_client_links.client_user_id
└── carousel_images.created_by
```

### Exercise Definition System
```
exercises.id → Referenced by:
├── exercise_aliases.exercise_id
├── exercise_default_grips.exercise_id
├── exercise_equipment_profiles.exercise_id
├── exercise_equipment_variants.exercise_id
├── exercise_grip_effects.exercise_id
├── exercise_grips.exercise_id
├── exercise_handle_orientations.exercise_id
├── exercise_images.exercise_id
├── exercise_metric_defs.exercise_id
├── exercise_similars.exercise_id
├── exercise_similars.similar_exercise_id
├── exercises_translations.exercise_id
├── template_exercises.exercise_id
├── workout_exercises.exercise_id
├── user_exercise_estimates.exercise_id
├── user_exercise_overrides.exercise_id
├── user_exercise_warmup_prefs.exercise_id
├── user_exercise_warmups.exercise_id
├── personal_records.exercise_id
├── auto_deload_triggers.exercise_id
└── user_equipment_preferences.exercise_id
```

### Equipment & Classification System
```
equipment.id → Referenced by:
├── exercises.equipment_id
├── equipment_grip_defaults.equipment_id
├── equipment_handle_orientations.equipment_id
├── equipment_translations.equipment_id
├── exercise_equipment_variants.equipment_id
├── exercise_grip_effects.equipment_id
├── exercise_metric_defs.equipment_id
├── gym_equipment.equipment_id
├── gym_equipment_availability.equipment_id
├── gym_equipment_overrides.equipment_id
└── user_equipment_preferences.equipment_id

body_parts.id → Referenced by:
├── exercises.body_part_id
└── body_parts_translations.body_part_id

muscle_groups.id → Referenced by:
├── exercises.primary_muscle_id
├── exercise_grip_effects.muscle_id
├── user_muscle_priorities.muscle_group_id
├── user_prioritized_muscle_groups.muscle_group_id
└── muscle_groups_translations.muscle_group_id

movement_patterns.id → Referenced by:
├── exercises.movement_pattern_id
└── movement_patterns_translations.movement_pattern_id

movements.id → Referenced by:
├── exercises.movement_id
└── movements_translations.movement_id
```

### Workout & Training System
```
workouts.id → Referenced by:
├── workout_exercises.workout_id
├── workout_checkins.workout_id
├── workout_comments.workout_id
└── workout_exercise_groups.workout_id

workout_exercises.id → Referenced by:
├── workout_sets.workout_exercise_id
├── workout_exercise_feedback.workout_exercise_id
└── template_exercise_grips.workout_exercise_id

workout_sets.id → Referenced by:
├── workout_set_grips.workout_set_id
├── workout_set_metric_values.workout_set_id
└── personal_records.workout_set_id

workout_templates.id → Referenced by:
├── template_exercises.template_id
├── coach_assigned_templates.template_id
├── user_active_templates.template_id
├── user_favorite_templates.template_id
└── workouts.template_id
```

### Gym Management System
```
gyms.id → Referenced by:
├── gym_admins.gym_id
├── gym_aliases.gym_id
├── gym_coach_memberships.gym_id
├── gym_equipment.gym_id
├── gym_equipment_availability.gym_id
├── gym_equipment_overrides.gym_id
├── gym_monthly_revenue.gym_id
├── gym_observers.gym_id
├── gym_plate_inventory.gym_id
├── user_gym_memberships.gym_id
├── user_gym_visits.gym_id
├── user_gym_profiles.gym_id
├── user_gym_bars.gym_id
├── user_gym_dumbbells.gym_id
├── user_gym_machines.gym_id
├── user_gym_miniweights.gym_id
├── user_gym_plates.gym_id
├── ambassador_gym_deals.gym_id
├── ambassador_gym_visits.gym_id
├── coach_client_links.gym_id
└── join_codes.gym_id

cities.id → Referenced by:
├── gyms.city_id
└── battles.city_id
```

### Coaching & Mentorship System
```
mentor_profiles.id → Referenced by:
├── mentorships.mentor_id
├── mentor_category_assignments.mentor_profile_id
├── mentor_clients.mentor_id
└── coach_assigned_templates.mentorship_id

mentorships.id → Referenced by:
└── coach_assigned_templates.mentorship_id

mentor_categories.id → Referenced by:
├── mentor_category_assignments.mentor_category_id
└── mentor_profiles.primary_category_id
```

### Ambassador & Commission System
```
ambassador_profiles.id → Referenced by:
├── ambassador_commission_agreements.ambassador_id
├── ambassador_gym_deals.ambassador_id
├── ambassador_gym_visits.ambassador_id
├── battle_participants.ambassador_id
└── battle_invitations.ambassador_id

battles.id → Referenced by:
├── battle_participants.battle_id
├── battle_invitations.battle_id
├── ambassador_commission_agreements.battle_id
└── ambassador_gym_deals.battle_id

ambassador_commission_agreements.id → Referenced by:
└── ambassador_commission_accruals.agreement_id
```

### Grips & Handles System
```
grips.id → Referenced by:
├── exercise_default_grips.grip_id
├── exercise_grips.grip_id
├── exercise_grip_effects.grip_id
├── equipment_grip_defaults.grip_id
├── grips_translations.grip_id
├── template_exercise_grips.grip_id
├── workout_set_grips.grip_id
└── handle_orientation_compatibility.grip_id

handles.id → Referenced by:
├── equipment_grip_defaults.handle_id
├── equipment_handle_orientations.handle_id
├── exercise_handle_orientations.handle_id
├── handle_equipment_rules.handle_id
└── handle_orientation_compatibility.handle_id
```

### Translation & Localization System
```
languages.code → Referenced by:
├── body_parts_translations.language_code
├── equipment_translations.language_code
├── exercises_translations.language_code
├── grips_translations.language_code
├── life_category_translations.language_code
├── life_subcategory_translations.language_code
├── muscle_groups_translations.language_code
├── movement_patterns_translations.language_code
├── movements_translations.language_code
├── muscles_translations.language_code
├── exercise_aliases.language_code
└── text_translations.language_code
```

### Metric & Measurement System
```
metric_defs.id → Referenced by:
├── exercise_metric_defs.metric_id
└── workout_set_metric_values.metric_def_id
```

### Gamification & Social System
```
achievements.id → Referenced by:
└── user_achievements.achievement_id

challenges.id → Referenced by:
└── challenge_participants.challenge_id

life_categories.id → Referenced by:
├── life_subcategories.category_id
├── life_category_translations.category_id
└── user_category_prefs.category_id

life_subcategories.id → Referenced by:
├── life_subcategory_translations.subcategory_id
└── user_pinned_subcategories.subcategory_id
```

### Training Program System
```
training_programs.id → Referenced by:
├── training_program_blocks.program_id
├── user_program_state.program_id
└── progressive_overload_plans.program_id

training_program_blocks.id → Referenced by:
└── user_program_state.current_block_id
```

### Configuration & System Tables
```
bar_types.id → Referenced by:
├── exercises.default_bar_type_id
└── user_gym_bars.bar_type_id

attribute_schemas.id → Referenced by:
└── (Referenced via scope_ref_id for various entities)

progression_policies.id → Referenced by:
└── progressive_overload_plans.policy_id

warmup_policies.id → Referenced by:
└── user_exercise_warmup_prefs.policy_id
```

## Data Integrity Notes

1. **Soft References**: Most relationships use UUID references without explicit database constraints
2. **Application-Level Integrity**: Foreign key validation primarily happens in application code
3. **RLS Policies**: Row Level Security provides user isolation and access control
4. **Flexible Schema**: Allows for easier migrations and schema evolution
5. **Performance Trade-offs**: Less database-level validation but better query performance in some cases

## Recommendations for Production

1. **Consider Critical Constraints**: Add foreign key constraints for core relationships where data integrity is paramount
2. **Indexing**: Ensure proper indexes exist on all reference columns for query performance  
3. **Validation Functions**: Use database functions for complex validation rules
4. **Audit Trail**: Maintain detailed logs for reference changes
5. **Data Cleanup**: Implement regular cleanup of orphaned records
6. **Monitoring**: Set up monitoring for referential integrity violations

## Schema Evolution Strategy

- **Phase 1**: Document all logical relationships (current)
- **Phase 2**: Add non-critical foreign key constraints gradually
- **Phase 3**: Implement cascade rules for data cleanup
- **Phase 4**: Add complex validation rules as database functions

This approach provides flexibility for development while maintaining data integrity through application logic and comprehensive RLS policies.