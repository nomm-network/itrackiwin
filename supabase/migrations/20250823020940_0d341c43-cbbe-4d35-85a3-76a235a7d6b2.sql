-- Fix security issues from the linter

-- Fix missing search_path in functions (SECURITY)
ALTER FUNCTION public.validate_muscle_group_ids(uuid[]) SET search_path TO 'public';

-- Enable RLS on workout_exercise_groups table that we may have missed
DO $$
BEGIN
  -- Check if workout_exercise_groups table exists and enable RLS
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'workout_exercise_groups' 
    AND table_schema = 'public'
  ) THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.workout_exercise_groups ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policy if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'workout_exercise_groups' 
      AND policyname = 'Users can manage their workout groups'
    ) THEN
      CREATE POLICY "Users can manage their workout groups"
        ON public.workout_exercise_groups
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.workouts w 
            WHERE w.id = workout_id AND w.user_id = auth.uid()
          )
        );
    END IF;
  END IF;

  -- Check if user_exercise_warmups table exists and ensure it has proper RLS
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_exercise_warmups' 
    AND table_schema = 'public'
  ) THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.user_exercise_warmups ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policy if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'user_exercise_warmups' 
      AND policyname = 'Users can manage their own warmups'
    ) THEN
      CREATE POLICY "Users can manage their own warmups"
        ON public.user_exercise_warmups
        FOR ALL USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- Fix Security Definer Views by creating regular views instead
-- The current view is fine as it's just a data view, not security-sensitive
-- But let's ensure it has proper RLS filtering built-in
DROP VIEW IF EXISTS public.v_exercises_for_coach;

CREATE VIEW public.v_exercises_for_coach 
WITH (security_invoker = true) AS
SELECT 
  e.id,
  e.name,
  e.slug,
  e.movement_pattern,
  e.exercise_skill_level,
  e.complexity_score,
  e.primary_muscle_id,
  e.secondary_muscle_group_ids,
  e.equipment_id,
  eq.slug as equipment_slug,
  mg.slug as primary_muscle_slug,
  bp.slug as body_part_slug,
  e.is_public,
  e.popularity_rank
FROM public.exercises e
LEFT JOIN public.equipment eq ON eq.id = e.equipment_id
LEFT JOIN public.muscle_groups mg ON mg.id = e.primary_muscle_id  
LEFT JOIN public.body_parts bp ON bp.id = e.body_part_id
WHERE e.is_public = true OR e.owner_user_id = auth.uid()
ORDER BY e.popularity_rank ASC NULLS LAST, e.name;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.v_exercises_for_coach TO authenticated;