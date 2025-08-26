-- Fix missing views referenced in new API layer

-- Create v_current_workout view for active workout lookup
CREATE VIEW v_current_workout AS
SELECT 
  user_id,
  id,
  title,
  started_at
FROM workouts
WHERE ended_at IS NULL;

-- Create v_exercise_last_set view for last set data
CREATE VIEW v_exercise_last_set AS
SELECT DISTINCT ON (user_id, exercise_id)
  user_id,
  exercise_id,
  weight,
  reps,
  rpe,
  notes,
  completed_at
FROM workout_sets ws
JOIN workout_exercises we ON ws.workout_exercise_id = we.id
JOIN workouts w ON we.workout_id = w.id
WHERE ws.is_completed = true
ORDER BY user_id, exercise_id, ws.completed_at DESC;

-- Fix the API queries to use existing materialized views instead
-- The API should use mv_last_set_per_user_exercise and other existing views