-- Fix the generate_ai_program function to handle auth properly
CREATE OR REPLACE FUNCTION public.generate_ai_program(
  p_goal text,
  p_experience_level text,
  p_training_days_per_week integer,
  p_location_type text,
  p_available_equipment text[],
  p_priority_muscle_groups text[],
  p_time_per_session_min integer
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_program_id uuid;
  v_week_id uuid;
  v_workout_id uuid;
  v_user_id uuid;
  v_goal_enum program_goal;
  v_exp_enum experience_level;
  v_location_enum location_type;
BEGIN
  -- Get user ID from auth context
  v_user_id := auth.uid();
  
  -- Log for debugging
  RAISE LOG 'generate_ai_program called with user_id: %, goal: %', v_user_id, p_goal;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required - user not found';
  END IF;

  -- Map goal to enum value
  v_goal_enum := CASE p_goal
    WHEN 'muscle_gain' THEN 'muscle_gain'::program_goal
    WHEN 'fat_loss' THEN 'fat_loss'::program_goal
    WHEN 'strength' THEN 'strength'::program_goal
    WHEN 'endurance' THEN 'endurance'::program_goal
    WHEN 'general_fitness' THEN 'general_fitness'::program_goal
    ELSE 'muscle_gain'::program_goal
  END;

  -- Map experience level to enum value
  v_exp_enum := CASE p_experience_level
    WHEN 'beginner' THEN 'beginner'::experience_level
    WHEN 'intermediate' THEN 'intermediate'::experience_level
    WHEN 'advanced' THEN 'advanced'::experience_level
    ELSE 'beginner'::experience_level
  END;

  -- Map location type to enum value
  v_location_enum := CASE p_location_type
    WHEN 'gym' THEN 'gym'::location_type
    WHEN 'home' THEN 'home'::location_type
    WHEN 'outdoor' THEN 'outdoor'::location_type
    ELSE 'gym'::location_type
  END;

  -- Insert the AI program with explicit title
  INSERT INTO public.ai_programs (
    user_id,
    title,
    goal,
    experience_level,
    training_days_per_week,
    location_type,
    available_equipment,
    priority_muscle_groups,
    time_per_session_min,
    weeks,
    program_data,
    status,
    created_by
  ) VALUES (
    v_user_id,
    'AI Generated Program',
    v_goal_enum,
    v_exp_enum,
    p_training_days_per_week,
    v_location_enum,
    p_available_equipment,
    p_priority_muscle_groups,
    p_time_per_session_min,
    4, -- Default 4 weeks
    jsonb_build_object(
      'created_at', now(),
      'goal', p_goal,
      'experience_level', p_experience_level,
      'summary', 'AI Generated Program'
    ),
    'active'::program_status,
    'ai'::program_creator
  ) RETURNING id INTO v_program_id;

  -- Log successful insert
  RAISE LOG 'Successfully created AI program with ID: %', v_program_id;

  -- Create a sample week
  INSERT INTO public.ai_program_weeks (
    program_id,
    week_number
  ) VALUES (
    v_program_id,
    1
  ) RETURNING id INTO v_week_id;

  -- Create sample workouts for the week
  FOR i IN 1..p_training_days_per_week LOOP
    INSERT INTO public.ai_program_workouts (
      program_week_id,
      day_of_week,
      title
    ) VALUES (
      v_week_id,
      i,
      'Day ' || i || ' Workout'
    ) RETURNING id INTO v_workout_id;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'program_id', v_program_id,
    'message', 'Program generated successfully',
    'weeks_created', 1,
    'workouts_created', p_training_days_per_week,
    'user_id', v_user_id
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log the full error for debugging
    RAISE LOG 'generate_ai_program error: % - %', SQLSTATE, SQLERRM;
    RAISE EXCEPTION 'generate_ai_program failed: %', SQLERRM;
END;
$$;