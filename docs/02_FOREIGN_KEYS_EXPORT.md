# Complete Foreign Keys Export

## Database Foreign Key Constraints

**Export Date:** 2025-01-06  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  

### Summary

Currently, this database uses a **soft foreign key** approach with minimal enforced constraints. Most relationships are managed through application logic rather than database-level foreign key constraints.

### Identified Foreign Key Patterns

Based on the database schema analysis, here are the logical foreign key relationships:

#### User-Related Relationships
- `users.id` (auth.users) → Referenced by most user-specific tables
- All user_* tables reference the user through `user_id` column

#### Exercise System Relationships
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
  - `user_exercise_estimates.exercise_id`

#### Equipment Relationships
- `equipment.id` → Referenced by:
  - `exercises.equipment_id`
  - `equipment_grip_defaults.equipment_id`
  - `equipment_handle_orientations.equipment_id`
  - `equipment_translations.equipment_id`
  - `exercise_equipment_variants.equipment_id`
  - `exercise_grip_effects.equipment_id`
  - `gym_equipment.equipment_id`

#### Workout System Relationships
- `workouts.id` → Referenced by:
  - `workout_exercises.workout_id`
  - `workout_checkins.workout_id`

- `workout_exercises.id` → Referenced by:
  - `workout_sets.workout_exercise_id`
  - `workout_exercise_feedback.workout_exercise_id`

- `workout_sets.id` → Referenced by:
  - `workout_set_grips.workout_set_id`
  - `workout_set_metric_values.workout_set_id`

#### Template System Relationships
- `workout_templates.id` → Referenced by:
  - `template_exercises.template_id`
  - `coach_assigned_templates.template_id`
  - `user_active_templates.template_id`
  - `user_favorite_templates.template_id`

#### Gym Management Relationships
- `gyms.id` → Referenced by:
  - `gym_admins.gym_id`
  - `gym_aliases.gym_id`
  - `gym_equipment.gym_id`
  - `gym_equipment_availability.gym_id`
  - `gym_equipment_overrides.gym_id`
  - `gym_plate_inventory.gym_id`
  - `user_gym_memberships.gym_id`
  - `user_gym_visits.gym_id`

#### Mentorship System Relationships
- `mentor_profiles.id` → Referenced by:
  - `mentorships.mentor_id`
  - `coach_assigned_templates.mentorship_id`

- `mentorships.id` → Referenced by:
  - `coach_assigned_templates.mentorship_id`

#### Ambassador/Commission System Relationships
- `ambassador_profiles.id` → Referenced by:
  - `ambassador_commission_agreements.ambassador_id`
  - `ambassador_gym_deals.ambassador_id`
  - `ambassador_gym_visits.ambassador_id`
  - `battle_participants.ambassador_id`
  - `battle_invitations.ambassador_id`

- `battles.id` → Referenced by:
  - `battle_participants.battle_id`
  - `battle_invitations.battle_id`
  - `ambassador_commission_agreements.battle_id`

#### Translation System Relationships
- `languages.code` → Referenced by:
  - `body_parts_translations.language_code`
  - `equipment_translations.language_code`
  - `exercises_translations.language_code`
  - `grips_translations.language_code`
  - `life_category_translations.language_code`
  - `muscle_groups_translations.language_code`
  - `movements_translations.language_code`

### Data Integrity Notes

1. **Soft References**: Most relationships use UUID references without explicit database constraints
2. **User Isolation**: Tables are isolated by user_id with RLS policies
3. **Application-Level Integrity**: Foreign key validation happens in application code
4. **Flexible Schema**: Allows for easier migrations and schema evolution
5. **Performance Trade-offs**: Less database-level validation but better query performance

### Recommendations for Production

1. **Add Critical Constraints**: Consider adding foreign key constraints for core relationships
2. **Indexing**: Ensure proper indexes on reference columns
3. **Validation Functions**: Use database functions for complex validation rules
4. **Audit Trail**: Maintain detailed logs for reference changes
5. **Data Cleanup**: Regular cleanup of orphaned records

### Schema Evolution Strategy

- **Phase 1**: Document all logical relationships (current)
- **Phase 2**: Add non-critical foreign key constraints
- **Phase 3**: Implement cascade rules for data cleanup
- **Phase 4**: Add complex validation rules as needed

This approach provides flexibility for development while maintaining data integrity through application logic and RLS policies.