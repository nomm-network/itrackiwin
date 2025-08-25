-- Add view and indexes for efficient readiness popup checks

-- 1) Speedy existence check (per user/workout) 
CREATE OR REPLACE VIEW public.v_pre_checkin_exists AS
SELECT w.id AS workout_id,
       w.user_id,
       (EXISTS (
         SELECT 1 FROM pre_workout_checkins c
         WHERE c.workout_id = w.id AND c.user_id = w.user_id
       )) AS has_checkin
FROM workouts w;

-- 2) Helpful indexes for O(1)-ish lookups
CREATE INDEX IF NOT EXISTS idx_pre_checkins_workout_user
  ON pre_workout_checkins (workout_id, user_id);
  
CREATE INDEX IF NOT EXISTS idx_workouts_user_active
  ON workouts (user_id, ended_at) WHERE ended_at IS NULL;