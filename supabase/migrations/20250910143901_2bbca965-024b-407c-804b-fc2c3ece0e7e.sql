-- Drop recovery_score and notes columns from readiness_checkins table
ALTER TABLE public.readiness_checkins 
DROP COLUMN IF EXISTS recovery_score;

ALTER TABLE public.readiness_checkins 
DROP COLUMN IF EXISTS notes;