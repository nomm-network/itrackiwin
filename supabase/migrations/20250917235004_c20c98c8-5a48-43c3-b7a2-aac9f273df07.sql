-- Test the function with proper debugging
DO $$
DECLARE
  result jsonb;
BEGIN
  -- Call the function with test data
  SELECT public.generate_ai_program(
    'muscle_gain',
    'intermediate', 
    3,
    'gym',
    ARRAY['dumbbell', 'bodyweight'],
    ARRAY['shoulders', 'biceps'],
    75
  ) INTO result;
  
  RAISE NOTICE 'Function result: %', result;
END $$;