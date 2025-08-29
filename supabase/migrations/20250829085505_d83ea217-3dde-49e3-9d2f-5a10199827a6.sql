-- Add unit handling fields to support dual storage and user preferences

-- Add default unit preference to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS default_unit text NOT NULL DEFAULT 'kg' CHECK (default_unit IN ('kg', 'lb'));

-- Add session unit to workouts (frozen at workout start)
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS session_unit text NOT NULL DEFAULT 'kg' CHECK (session_unit IN ('kg', 'lb'));

-- Add dual weight storage to workout_sets
ALTER TABLE public.workout_sets 
ADD COLUMN IF NOT EXISTS weight_kg numeric,
ADD COLUMN IF NOT EXISTS input_weight numeric,
ADD COLUMN IF NOT EXISTS input_unit text CHECK (input_unit IN ('kg', 'lb'));

-- Add canonical target weight to workout_exercises  
ALTER TABLE public.workout_exercises
ADD COLUMN IF NOT EXISTS target_weight_kg numeric;

-- Add canonical target weight to template_exercises
ALTER TABLE public.template_exercises
ADD COLUMN IF NOT EXISTS target_weight_kg numeric;

-- Add default unit to gyms (optional helper)
CREATE TABLE IF NOT EXISTS public.user_gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  default_unit text NOT NULL DEFAULT 'kg' CHECK (default_unit IN ('kg', 'lb')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_gyms
ALTER TABLE public.user_gyms ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_gyms
CREATE POLICY "Users can manage their own gyms"
ON public.user_gyms
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Migration function to populate weight_kg from existing weight data
CREATE OR REPLACE FUNCTION migrate_existing_weights()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update existing workout_sets where weight exists but weight_kg is null
  UPDATE public.workout_sets 
  SET 
    weight_kg = CASE 
      WHEN weight_unit = 'lb' THEN weight / 2.2046226218
      ELSE weight 
    END,
    input_weight = weight,
    input_unit = COALESCE(weight_unit, 'kg')
  WHERE weight IS NOT NULL AND weight_kg IS NULL;
  
  -- Update existing workout_exercises target weights
  UPDATE public.workout_exercises
  SET target_weight_kg = CASE
    WHEN target_weight IS NOT NULL THEN target_weight -- Assume existing targets are in kg
    ELSE NULL
  END
  WHERE target_weight_kg IS NULL;
  
  -- Update existing template_exercises target weights  
  UPDATE public.template_exercises
  SET target_weight_kg = CASE
    WHEN target_weight IS NOT NULL THEN target_weight -- Assume existing targets are in kg
    ELSE NULL
  END
  WHERE target_weight_kg IS NULL;
  
  RAISE NOTICE 'Weight migration completed';
END;
$$;

-- Run the migration
SELECT migrate_existing_weights();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_existing_weights();