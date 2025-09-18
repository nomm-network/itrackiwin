-- Drop old AI tables that are no longer needed
DROP TABLE IF EXISTS public.ai_program_workout_exercises CASCADE;
DROP TABLE IF EXISTS public.ai_program_workouts CASCADE;
DROP TABLE IF EXISTS public.ai_program_weeks CASCADE;
DROP TABLE IF EXISTS public.ai_programs CASCADE;

-- Add ai_generated flag to training_programs
ALTER TABLE public.training_programs
ADD COLUMN ai_generated boolean NOT NULL DEFAULT false;

-- Create exercise_candidates table for unmapped exercises
CREATE TABLE public.exercise_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposed_name text NOT NULL,
  equipment_id uuid REFERENCES public.equipment(id),
  primary_muscle text,
  secondary_muscles text[],
  created_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on exercise_candidates
ALTER TABLE public.exercise_candidates ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercise_candidates
CREATE POLICY "Users can insert their own exercise candidates" 
ON public.exercise_candidates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view exercise candidates" 
ON public.exercise_candidates 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage exercise candidates" 
ON public.exercise_candidates 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Adjust template_exercises to allow nullable exercise_id and add candidate reference
ALTER TABLE public.template_exercises
ALTER COLUMN exercise_id DROP NOT NULL;

ALTER TABLE public.template_exercises
ADD COLUMN candidate_id uuid REFERENCES public.exercise_candidates(id);

-- Update the generate_ai_program function to use training_programs instead
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
SET search_path TO 'public'
AS $function$
DECLARE
  v_program_id uuid;
  v_template_id uuid;
  v_user_id uuid;
BEGIN
  -- Get user ID from auth context
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required - user not found';
  END IF;

  -- Create training program with AI flag
  INSERT INTO public.training_programs (
    user_id,
    name,
    description,
    is_active,
    ai_generated
  ) VALUES (
    v_user_id,
    'AI Generated Program - ' || initcap(p_goal),
    format('AI generated %s program for %s level, %s days per week', 
           p_goal, p_experience_level, p_training_days_per_week),
    true,
    true
  ) RETURNING id INTO v_program_id;

  -- Create a sample template for the program
  INSERT INTO public.workout_templates (
    user_id,
    name,
    notes
  ) VALUES (
    v_user_id,
    'AI Template - Day 1',
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
$function$;