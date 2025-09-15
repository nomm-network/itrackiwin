-- Remove the daily unique constraint and create a new one that allows multiple readiness entries per day per user
-- but keeps entries unique per workout if workout_id is provided

-- First, let's see what the current constraint looks like
-- Drop the existing daily constraint
ALTER TABLE readiness_checkins DROP CONSTRAINT IF EXISTS ux_readiness_daily;

-- Create a new constraint that allows multiple entries per day but prevents duplicates per workout
-- This will allow multiple readiness check-ins per day but ensure uniqueness per workout
ALTER TABLE readiness_checkins 
ADD CONSTRAINT ux_readiness_per_workout 
UNIQUE (user_id, workout_id) 
DEFERRABLE INITIALLY DEFERRED;

-- Add an index for performance on the common query pattern (user + date)
CREATE INDEX IF NOT EXISTS idx_readiness_checkins_user_date 
ON readiness_checkins (user_id, checkin_date);

-- Update the RPC function to handle the new constraint logic
-- The function should now upsert based on user_id + workout_id when workout_id is provided
-- or just insert when workout_id is null (general readiness check)