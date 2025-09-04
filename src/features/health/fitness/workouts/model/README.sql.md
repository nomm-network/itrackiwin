# Workout Database Schema

## Tables Used
- `workouts` - Workout sessions
- `workout_sets` - Individual sets within workouts
- `pre_workout_checkins` - Readiness assessments

## Foreign Keys
- `workouts.user_id` → `auth.users.id`
- `workout_sets.workout_id` → `workouts.id`
- `workout_sets.exercise_id` → `exercises.id`

## RPCs Used
- Various workout-related stored procedures for analytics and metrics