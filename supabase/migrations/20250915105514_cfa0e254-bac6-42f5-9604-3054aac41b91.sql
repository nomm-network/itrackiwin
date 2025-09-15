-- Check what constraints currently exist on readiness_checkins
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.readiness_checkins'::regclass;

-- Drop ALL unique constraints on readiness_checkins to start fresh
ALTER TABLE readiness_checkins DROP CONSTRAINT IF EXISTS ux_readiness_daily;
ALTER TABLE readiness_checkins DROP CONSTRAINT IF EXISTS ux_readiness_per_workout;
ALTER TABLE readiness_checkins DROP CONSTRAINT IF EXISTS readiness_checkins_user_id_workout_id_key;

-- Create the correct constraint that allows multiple entries per day but unique per workout
ALTER TABLE readiness_checkins 
ADD CONSTRAINT ux_readiness_per_workout_only 
UNIQUE (user_id, workout_id) 
WHERE workout_id IS NOT NULL;

-- Allow multiple general readiness entries per day (when workout_id is null)
-- No constraint needed for this case since users can do multiple general readiness checks