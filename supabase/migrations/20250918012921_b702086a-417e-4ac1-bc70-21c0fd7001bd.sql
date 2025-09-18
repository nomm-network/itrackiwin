-- Fix the generate_ai_program function to create unique template names
CREATE OR REPLACE FUNCTION public.generate_ai_program(
  p_goal text,
  p_experience_level text,
  p_training_days_per_week integer,
  p_location_type text,
  p_available_equipment text[],
  p_priority_muscle_groups text[],
  p_time_per_session_min integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_program_id uuid;
  v_template_id uuid;
  v_user_id uuid;
  v_template_name text;
  v_program_name text;
BEGIN
  -- Get user ID from auth context
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required - user not found';
  END IF;

  -- Create unique names with timestamp
  v_program_name := 'AI Program - ' || initcap(p_goal) || ' (' || to_char(now(), 'YYYY-MM-DD HH24:MI') || ')';
  v_template_name := 'AI Template - Day 1 (' || to_char(now(), 'YYYY-MM-DD HH24:MI:SS') || ')';

  -- Create training program with AI flag
  INSERT INTO public.training_programs (
    user_id,
    name,
    description,
    goal,
    is_active,
    ai_generated
  ) VALUES (
    v_user_id,
    v_program_name,
    format('AI generated %s program for %s level, %s days per week', 
           p_goal, p_experience_level, p_training_days_per_week),
    p_goal,
    true,
    true
  ) RETURNING id INTO v_program_id;

  -- Create a sample template for the program with unique name
  INSERT INTO public.workout_templates (
    user_id,
    name,
    notes
  ) VALUES (
    v_user_id,
    v_template_name,
    format('Generated for %s training, %s experience level', p_goal, p_experience_level)
  ) RETURNING id INTO v_template_id;

  -- Link template to program
  INSERT INTO public.training_program_blocks (
    program_id,
    workout_template_id,
    order_index
  ) VALUES (
    v_program_id,
    v_template_id,
    1
  );

  RETURN jsonb_build_object(
    'success', true,
    'program_id', v_program_id,
    'template_id', v_template_id,
    'message', 'AI program generated successfully using training_programs',
    'ai_generated', true
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'generate_ai_program error: % - %', SQLSTATE, SQLERRM;
    RAISE EXCEPTION 'generate_ai_program failed: %', SQLERRM;
END;
$$;