-- Improve CASCADE delete behavior for readiness checkins when workouts are deleted
-- Currently the foreign key just sets workout_id to NULL, but we want to delete the entire record

-- First, check if there's any existing foreign key constraint we need to replace
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_readiness_checkins_workout_id'
    ) THEN
        ALTER TABLE public.readiness_checkins 
        DROP CONSTRAINT fk_readiness_checkins_workout_id;
    END IF;
    
    -- Also check for the old constraint name
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'readiness_checkins_workout_id_fkey'
    ) THEN
        ALTER TABLE public.readiness_checkins 
        DROP CONSTRAINT readiness_checkins_workout_id_fkey;
    END IF;
END
$$;

-- Add the proper CASCADE delete constraint
-- This will completely delete readiness records when the associated workout is deleted
ALTER TABLE public.readiness_checkins 
ADD CONSTRAINT fk_readiness_checkins_workout_cascade 
FOREIGN KEY (workout_id) 
REFERENCES public.workouts(id) 
ON DELETE CASCADE;