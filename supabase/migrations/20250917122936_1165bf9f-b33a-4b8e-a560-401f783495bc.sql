-- Fix the conflicting generate_ai_program functions by dropping the text version
-- and ensuring only the enum version exists
DROP FUNCTION IF EXISTS public.generate_ai_program(uuid, text, text, integer, text, text[], text[], integer);

-- Ensure the enum version handles text inputs properly by casting them
CREATE OR REPLACE FUNCTION public.generate_ai_program(
  p_user_id uuid, 
  p_goal text, 
  p_experience_level text, 
  p_training_days integer, 
  p_location_type text, 
  p_equipment text[], 
  p_priority_muscles text[], 
  p_session_duration integer DEFAULT 60
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_program_id UUID;
  v_week_id UUID;
  v_workout_id UUID;
  v_split TEXT[];
  v_week_num INTEGER;
  v_day INTEGER;
  v_workout_title TEXT;
  v_exercises RECORD;
  v_order_index INTEGER;
  v_base_sets INTEGER;
  v_reps_min INTEGER;
  v_reps_max INTEGER;
  v_goal_enum program_goal;
  v_exp_enum experience_level;
  v_location_enum location_type;
BEGIN
  -- Cast text inputs to proper enum types
  BEGIN
    v_goal_enum := p_goal::program_goal;
  EXCEPTION WHEN OTHERS THEN
    v_goal_enum := 'general_fitness'::program_goal;
  END;
  
  BEGIN
    v_exp_enum := p_experience_level::experience_level;
  EXCEPTION WHEN OTHERS THEN
    v_exp_enum := 'new'::experience_level;
  END;
  
  BEGIN
    v_location_enum := p_location_type::location_type;
  EXCEPTION WHEN OTHERS THEN
    v_location_enum := 'gym'::location_type;
  END;

  -- Determine training split based on days per week
  CASE p_training_days
    WHEN 2 THEN v_split := ARRAY['Full Body A', 'Full Body B'];
    WHEN 3 THEN 
      IF v_exp_enum = 'new' THEN
        v_split := ARRAY['Full Body A', 'Full Body B', 'Full Body C'];
      ELSE
        v_split := ARRAY['Upper Body', 'Lower Body', 'Full Body'];
      END IF;
    WHEN 4 THEN v_split := ARRAY['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'];
    WHEN 5 THEN v_split := ARRAY['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body'];
    WHEN 6 THEN v_split := ARRAY['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];
    ELSE v_split := ARRAY['Full Body A', 'Full Body B'];
  END CASE;

  -- Create program
  INSERT INTO public.ai_programs (user_id, title, goal, weeks, created_by, status)
  VALUES (
    p_user_id, 
    'Bro AI Custom Program - ' || UPPER(p_goal), 
    v_goal_enum, 
    8, 
    'bro_ai', 
    'active'
  ) RETURNING id INTO v_program_id;

  -- Create 8 weeks of programming
  FOR v_week_num IN 1..8 LOOP
    INSERT INTO public.ai_program_weeks (program_id, week_number)
    VALUES (v_program_id, v_week_num) RETURNING id INTO v_week_id;

    -- Create workouts for each day
    FOR v_day IN 1..p_training_days LOOP
      v_workout_title := v_split[((v_day - 1) % array_length(v_split, 1)) + 1];
      
      INSERT INTO public.ai_program_workouts (program_week_id, day_of_week, title, focus_tags)
      VALUES (
        v_week_id, 
        v_day, 
        v_workout_title,
        CASE 
          WHEN v_workout_title ILIKE '%upper%' THEN ARRAY['upper_body']
          WHEN v_workout_title ILIKE '%lower%' THEN ARRAY['lower_body']
          WHEN v_workout_title ILIKE '%push%' THEN ARRAY['push']
          WHEN v_workout_title ILIKE '%pull%' THEN ARRAY['pull']
          WHEN v_workout_title ILIKE '%legs%' THEN ARRAY['legs']
          ELSE ARRAY['full_body']
        END
      ) RETURNING id INTO v_workout_id;

      -- Add exercises based on workout type and available equipment
      v_order_index := 1;
      
      -- Get exercises for this workout type - fix the enum comparison
      FOR v_exercises IN (
        SELECT e.id, e.name, e.primary_muscle, e.movement_type, e.difficulty
        FROM public.ai_exercises e
        WHERE e.experience_min <= v_exp_enum
          AND (array_length(p_equipment, 1) IS NULL OR e.required_equipment && p_equipment)
          AND CASE 
            WHEN v_workout_title ILIKE '%upper%' THEN e.primary_muscle::text IN ('chest', 'back', 'shoulders', 'biceps', 'triceps')
            WHEN v_workout_title ILIKE '%lower%' THEN e.primary_muscle::text IN ('quads', 'hamstrings', 'glutes', 'calves')
            WHEN v_workout_title ILIKE '%push%' THEN e.primary_muscle::text IN ('chest', 'shoulders', 'triceps')
            WHEN v_workout_title ILIKE '%pull%' THEN e.primary_muscle::text IN ('back', 'biceps')
            WHEN v_workout_title ILIKE '%legs%' THEN e.primary_muscle::text IN ('quads', 'hamstrings', 'glutes', 'calves')
            ELSE true -- Full body includes all
          END
        ORDER BY 
          CASE WHEN e.movement_type::text = 'compound' THEN 1 ELSE 2 END,
          CASE WHEN e.primary_muscle::text = ANY(p_priority_muscles) THEN 1 ELSE 2 END,
          RANDOM()
        LIMIT CASE 
          WHEN p_session_duration <= 30 THEN 4
          WHEN p_session_duration <= 45 THEN 6
          WHEN p_session_duration <= 60 THEN 8
          ELSE 10
        END
      ) LOOP
        -- Set sets/reps based on goal and experience
        CASE p_goal
          WHEN 'strength' THEN 
            v_base_sets := 4; v_reps_min := 3; v_reps_max := 6;
          WHEN 'muscle_gain' THEN 
            v_base_sets := 3; v_reps_min := 6; v_reps_max := 12;
          WHEN 'fat_loss' THEN 
            v_base_sets := 3; v_reps_min := 10; v_reps_max := 15;
          ELSE -- recomp, general_fitness
            v_base_sets := 3; v_reps_min := 8; v_reps_max := 12;
        END CASE;

        -- Adjust for priority muscles
        IF v_exercises.primary_muscle::text = ANY(p_priority_muscles) THEN
          v_base_sets := v_base_sets + 1;
        END IF;

        INSERT INTO public.ai_program_workout_exercises (
          workout_id, exercise_id, order_index, sets, reps_min, reps_max,
          primary_muscle, movement_type, priority
        ) VALUES (
          v_workout_id, v_exercises.id, v_order_index, v_base_sets, v_reps_min, v_reps_max,
          v_exercises.primary_muscle, v_exercises.movement_type,
          CASE WHEN v_exercises.primary_muscle::text = ANY(p_priority_muscles) THEN 1 ELSE 2 END
        );

        v_order_index := v_order_index + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN v_program_id;
END;
$function$;