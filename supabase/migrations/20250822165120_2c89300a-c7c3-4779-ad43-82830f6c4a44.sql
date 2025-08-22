-- Enable RLS on the materialized view
ALTER MATERIALIZED VIEW public.mv_user_exercise_1rm ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow users to see only their own 1RM data
CREATE POLICY "Users can view their own 1RM data" 
ON public.mv_user_exercise_1rm 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update the refresh function to set search_path for security
CREATE OR REPLACE FUNCTION public.refresh_1rm_materialized_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  mv_exists boolean;
BEGIN
  -- Only when a completed, countable strength set
  IF NEW.is_completed = true
     AND NEW.set_kind IN ('normal','top_set','backoff')
     AND NEW.weight IS NOT NULL
     AND NEW.reps   IS NOT NULL
     AND NEW.reps > 0 THEN

    -- Check MV existence safely
    SELECT EXISTS (
      SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'mv_user_exercise_1rm'
    ) INTO mv_exists;

    IF mv_exists THEN
      -- Safe concurrent refresh
      REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_user_exercise_1rm;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;