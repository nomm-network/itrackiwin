-- Drop ALL unique constraints on readiness_checkins to start fresh
ALTER TABLE readiness_checkins DROP CONSTRAINT IF EXISTS ux_readiness_daily;
ALTER TABLE readiness_checkins DROP CONSTRAINT IF EXISTS ux_readiness_per_workout;
ALTER TABLE readiness_checkins DROP CONSTRAINT IF EXISTS readiness_checkins_user_id_workout_id_key;

-- Create a partial unique index that only applies when workout_id is not null
-- This allows multiple entries per day but ensures uniqueness per workout
CREATE UNIQUE INDEX IF NOT EXISTS idx_readiness_user_workout_unique 
ON readiness_checkins (user_id, workout_id) 
WHERE workout_id IS NOT NULL;