-- Seed enhanced AI exercises with proper enum values
INSERT INTO public.ai_exercises (name, slug, primary_muscle, secondary_muscles, required_equipment, movement_type, experience_min, difficulty, is_bodyweight) VALUES
('Push-ups', 'push-ups', 'chest', ARRAY['triceps', 'shoulders'], ARRAY['bodyweight'], 'compound', 'new', 1, true),
('Squats', 'squats', 'quads', ARRAY['glutes', 'hamstrings'], ARRAY['bodyweight'], 'compound', 'new', 1, true),
('Pull-ups', 'pull-ups', 'back', ARRAY['biceps'], ARRAY['pull-up-bar'], 'compound', 'intermediate', 3, true),
('Dumbbell Press', 'dumbbell-press', 'chest', ARRAY['triceps', 'shoulders'], ARRAY['dumbbells'], 'compound', 'new', 2, false),
('Dumbbell Rows', 'dumbbell-rows', 'back', ARRAY['biceps'], ARRAY['dumbbells'], 'compound', 'new', 2, false),
('Lunges', 'lunges', 'quads', ARRAY['glutes', 'hamstrings'], ARRAY['bodyweight'], 'compound', 'new', 2, true),
('Plank', 'plank', 'abs', ARRAY[], ARRAY['bodyweight'], 'isolation', 'new', 1, true),
('Deadlifts', 'deadlifts', 'hamstrings', ARRAY['back', 'glutes'], ARRAY['barbell'], 'compound', 'intermediate', 4, false),
('Bench Press', 'bench-press', 'chest', ARRAY['triceps', 'shoulders'], ARRAY['barbell', 'bench'], 'compound', 'intermediate', 3, false),
('Lat Pulldowns', 'lat-pulldowns', 'back', ARRAY['biceps'], ARRAY['cable-machine'], 'compound', 'new', 2, false),
('Overhead Press', 'overhead-press', 'shoulders', ARRAY['triceps'], ARRAY['barbell'], 'compound', 'intermediate', 3, false),
('Bicep Curls', 'bicep-curls', 'biceps', ARRAY[], ARRAY['dumbbells'], 'isolation', 'new', 1, false),
('Tricep Extensions', 'tricep-extensions', 'triceps', ARRAY[], ARRAY['dumbbells'], 'isolation', 'new', 1, false),
('Hip Thrusts', 'hip-thrusts', 'glutes', ARRAY['hamstrings'], ARRAY['bench'], 'compound', 'new', 2, false),
('Calf Raises', 'calf-raises', 'calves', ARRAY[], ARRAY['bodyweight'], 'isolation', 'new', 1, true),
('Romanian Deadlifts', 'romanian-deadlifts', 'hamstrings', ARRAY['glutes', 'back'], ARRAY['dumbbells'], 'compound', 'returning', 3, false),
('Shoulder Press', 'shoulder-press', 'shoulders', ARRAY['triceps'], ARRAY['dumbbells'], 'compound', 'new', 2, false),
('Bent Over Rows', 'bent-over-rows', 'back', ARRAY['biceps'], ARRAY['barbell'], 'compound', 'returning', 3, false),
('Incline Press', 'incline-press', 'chest', ARRAY['triceps', 'shoulders'], ARRAY['dumbbells'], 'compound', 'returning', 2, false),
('Leg Press', 'leg-press', 'quads', ARRAY['glutes'], ARRAY['machine'], 'compound', 'new', 2, false),
('Chest Flyes', 'chest-flyes', 'chest', ARRAY[], ARRAY['dumbbells'], 'isolation', 'returning', 2, false),
('Lat Raises', 'lat-raises', 'shoulders', ARRAY[], ARRAY['dumbbells'], 'isolation', 'new', 1, false),
('Hammer Curls', 'hammer-curls', 'biceps', ARRAY['forearms'], ARRAY['dumbbells'], 'isolation', 'new', 1, false),
('Tricep Dips', 'tricep-dips', 'triceps', ARRAY['chest'], ARRAY['bodyweight'], 'compound', 'returning', 2, true),
('Bulgarian Split Squats', 'bulgarian-split-squats', 'quads', ARRAY['glutes'], ARRAY['bodyweight'], 'compound', 'returning', 3, true),
('Mountain Climbers', 'mountain-climbers', 'abs', ARRAY['shoulders'], ARRAY['bodyweight'], 'compound', 'new', 2, true),
('Russian Twists', 'russian-twists', 'abs', ARRAY[], ARRAY['bodyweight'], 'isolation', 'new', 1, true),
('Burpees', 'burpees', 'chest', ARRAY['shoulders', 'quads'], ARRAY['bodyweight'], 'compound', 'returning', 3, true),
('Jumping Jacks', 'jumping-jacks', 'calves', ARRAY['shoulders'], ARRAY['bodyweight'], 'compound', 'new', 1, true),
('Wall Sits', 'wall-sits', 'quads', ARRAY['glutes'], ARRAY['bodyweight'], 'isolation', 'new', 2, true);

-- Create AI program generation function
CREATE OR REPLACE FUNCTION public.generate_ai_program(
  p_user_id UUID,
  p_goal program_goal,
  p_experience_level experience_level,
  p_training_days INTEGER,
  p_location_type location_type,
  p_equipment TEXT[],
  p_priority_muscles TEXT[],
  p_session_duration INTEGER DEFAULT 60
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
BEGIN
  -- Determine training split based on days per week
  CASE p_training_days
    WHEN 2 THEN v_split := ARRAY['Full Body A', 'Full Body B'];
    WHEN 3 THEN 
      IF p_experience_level = 'new' THEN
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
    'Bro AI Custom Program - ' || UPPER(p_goal::TEXT), 
    p_goal, 
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
      
      -- Get exercises for this workout type
      FOR v_exercises IN (
        SELECT e.id, e.name, e.primary_muscle, e.movement_type, e.difficulty
        FROM public.ai_exercises e
        WHERE e.experience_min <= p_experience_level::experience_level
          AND (array_length(p_equipment, 1) IS NULL OR e.required_equipment && p_equipment)
          AND CASE 
            WHEN v_workout_title ILIKE '%upper%' THEN e.primary_muscle IN ('chest', 'back', 'shoulders', 'biceps', 'triceps')
            WHEN v_workout_title ILIKE '%lower%' THEN e.primary_muscle IN ('quads', 'hamstrings', 'glutes', 'calves')
            WHEN v_workout_title ILIKE '%push%' THEN e.primary_muscle IN ('chest', 'shoulders', 'triceps')
            WHEN v_workout_title ILIKE '%pull%' THEN e.primary_muscle IN ('back', 'biceps')
            WHEN v_workout_title ILIKE '%legs%' THEN e.primary_muscle IN ('quads', 'hamstrings', 'glutes', 'calves')
            ELSE true -- Full body includes all
          END
        ORDER BY 
          CASE WHEN e.movement_type = 'compound' THEN 1 ELSE 2 END,
          CASE WHEN e.primary_muscle = ANY(p_priority_muscles) THEN 1 ELSE 2 END,
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
        IF v_exercises.primary_muscle = ANY(p_priority_muscles) THEN
          v_base_sets := v_base_sets + 1;
        END IF;

        INSERT INTO public.ai_program_workout_exercises (
          workout_id, exercise_id, order_index, sets, reps_min, reps_max,
          primary_muscle, movement_type, priority
        ) VALUES (
          v_workout_id, v_exercises.id, v_order_index, v_base_sets, v_reps_min, v_reps_max,
          v_exercises.primary_muscle, v_exercises.movement_type,
          CASE WHEN v_exercises.primary_muscle = ANY(p_priority_muscles) THEN 1 ELSE 2 END
        );

        v_order_index := v_order_index + 1;
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN v_program_id;
END;
$$;