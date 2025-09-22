# Foreign Key Relationships

## Core User References
All user-related tables reference the main user identity:
- Most tables use `user_id UUID` referencing `auth.users(id)`
- Profile tables use `id UUID` as primary key referencing `auth.users(id)`

## Workout Structure Foreign Keys

### Workouts
- `workouts.user_id` → `auth.users.id`
- `workouts.template_id` → `workout_templates.id` (nullable)
- `workouts.gym_id` → `gyms.id` (nullable)

### Workout Exercises
- `workout_exercises.workout_id` → `workouts.id`
- `workout_exercises.exercise_id` → `exercises.id`
- `workout_exercises.grip_id` → `grips.id` (nullable)

### Workout Sets
- `workout_sets.workout_exercise_id` → `workout_exercises.id`

### Templates
- `workout_templates.user_id` → `auth.users.id`
- `template_exercises.template_id` → `workout_templates.id`
- `template_exercises.exercise_id` → `exercises.id`

## AI Program Structure Foreign Keys

### AI Programs
- `ai_programs.user_id` → `auth.users.id`

### AI Program Weeks
- `ai_program_weeks.program_id` → `ai_programs.id`

### AI Program Workouts
- `ai_program_workouts.program_week_id` → `ai_program_weeks.id`

### AI Program Workout Exercises
- `ai_program_workout_exercises.workout_id` → `ai_program_workouts.id`
- `ai_program_workout_exercises.exercise_id` → `ai_exercises.id` (nullable)

## Exercise Metadata Foreign Keys

### Exercise Equipment Profiles
- `exercise_equipment_profiles.exercise_id` → `exercises.id`
- `exercise_equipment_profiles.plate_profile_id` → `plate_profiles.id` (nullable)

### Exercise Default Grips
- `exercise_default_grips.exercise_id` → `exercises.id`
- `exercise_default_grips.grip_id` → `grips.id`

### Equipment Profiles
- `equipment_profiles.equipment_id` → `equipment.id`
- `equipment_profiles.profile_id` → Profile table based on `profile_type`

## Gym Management Foreign Keys

### User Gym Relationships
- `user_gyms.user_id` → `auth.users.id`
- `user_gyms.gym_id` → `gyms.id`

### Gym Equipment
- `user_gym_plates.user_gym_id` → `user_gyms.id`
- `user_gym_miniweights.user_gym_id` → `user_gyms.id`

### Gym Administration
- `gym_admins.gym_id` → `gyms.id`
- `gym_admins.user_id` → `auth.users.id`
- `gym_role_requests.gym_id` → `gyms.id`
- `gym_role_requests.user_id` → `auth.users.id`

## Social Features Foreign Keys

### Social Posts
- `social_posts.user_id` → `auth.users.id`
- `social_posts.workout_id` → `workouts.id` (nullable)

### Social Relationships
- `social_friendships.user_id` → `auth.users.id`
- `social_friendships.friend_id` → `auth.users.id`
- `social_post_likes.user_id` → `auth.users.id`
- `social_post_likes.post_id` → `social_posts.id`

### Challenges
- `challenges.creator_id` → `auth.users.id`
- `challenge_participants.user_id` → `auth.users.id`
- `challenge_participants.challenge_id` → `challenges.id`

## Coaching and Mentorship Foreign Keys

### Mentorship
- `mentorships.mentor_id` → `mentor_profiles.id`
- `mentorships.client_user_id` → `auth.users.id`

### Coach Templates
- `coach_assigned_templates.mentorship_id` → `mentorships.id`
- `coach_assigned_templates.template_id` → `workout_templates.id`

### Coach Client Links
- `coach_client_links.coach_user_id` → `auth.users.id`
- `coach_client_links.client_user_id` → `auth.users.id`
- `coach_client_links.gym_id` → `gyms.id` (nullable)

## Ambassador Program Foreign Keys

### Ambassador Profiles
- `ambassador_profiles.user_id` → `auth.users.id`

### Ambassador Deals
- `ambassador_gym_deals.ambassador_id` → `ambassador_profiles.id`
- `ambassador_gym_deals.gym_id` → `gyms.id`
- `ambassador_gym_deals.battle_id` → `battles.id`

### Battle System
- `battles.city_id` → `cities.id`
- `battle_participants.battle_id` → `battles.id`
- `battle_participants.ambassador_id` → `ambassador_profiles.id`
- `battle_invitations.battle_id` → `battles.id`
- `battle_invitations.ambassador_id` → `ambassador_profiles.id`

## Tracking Data Foreign Keys

### Readiness and Health
- `readiness_checkins.user_id` → `auth.users.id`
- `cycle_events.user_id` → `auth.users.id`

### Achievements
- `user_achievements.user_id` → `auth.users.id`
- `user_achievements.achievement_id` → `achievements.id`

### Progress Tracking
- `user_program_progress.user_id` → `auth.users.id`
- `user_program_progress.program_id` → `training_programs.id`

## Translation and Localization Foreign Keys

### Exercise Translations
- `exercise_translations.exercise_id` → `exercises.id`
- `exercise_aliases.exercise_id` → `exercises.id`

### Equipment Translations
- `equipment_translations.equipment_id` → `equipment.id`

### Body Part Translations
- `body_parts_translations.body_part_id` → `body_parts.id`

### Category Translations
- `life_category_translations.category_id` → `life_categories.id`

## Cascade Delete Behavior
- User deletion cascades to all user-owned data
- Workout deletion cascades to exercises and sets
- Template deletion cascades to template exercises
- Program deletion cascades to weeks, workouts, and exercises
- Gym deletion removes user associations but preserves historical data