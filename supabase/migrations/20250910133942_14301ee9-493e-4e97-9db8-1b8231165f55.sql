-- Add CASCADE delete for readiness records when workouts are deleted
-- This ensures readiness records are automatically cleaned up when a workout is aborted/deleted

-- Add foreign key constraint with CASCADE delete if it doesn't exist
-- First check if the constraint already exists
DO $$
BEGIN
    -- Add foreign key constraint with CASCADE delete for workout_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_readiness_checkins_workout_id'
    ) THEN
        ALTER TABLE public.readiness_checkins 
        ADD CONSTRAINT fk_readiness_checkins_workout_id 
        FOREIGN KEY (workout_id) 
        REFERENCES public.workouts(id) 
        ON DELETE CASCADE;
    END IF;
END
$$;