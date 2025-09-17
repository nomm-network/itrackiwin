-- Fix the ai_programs table to include the missing columns that the edge function expects
ALTER TABLE public.ai_programs 
ADD COLUMN IF NOT EXISTS experience_level experience_level,
ADD COLUMN IF NOT EXISTS training_days_per_week integer,
ADD COLUMN IF NOT EXISTS location_type location_type,
ADD COLUMN IF NOT EXISTS available_equipment text[],
ADD COLUMN IF NOT EXISTS priority_muscle_groups text[],
ADD COLUMN IF NOT EXISTS time_per_session_min integer,
ADD COLUMN IF NOT EXISTS program_data jsonb DEFAULT '{}'::jsonb;