-- Create user exercise preferences table with template/program context
CREATE TABLE public.user_exercise_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  program_id uuid REFERENCES public.training_programs(id) ON DELETE CASCADE,
  preferred_rep_min integer,
  preferred_rep_max integer,
  preferred_weight_kg numeric,
  last_updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_exercise_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can manage their own exercise preferences"
ON public.user_exercise_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create unique constraints with partial indexes for all combinations
CREATE UNIQUE INDEX idx_user_ex_pref_both 
ON public.user_exercise_preferences(user_id, exercise_id, template_id, program_id)
WHERE template_id IS NOT NULL AND program_id IS NOT NULL;

CREATE UNIQUE INDEX idx_user_ex_pref_template 
ON public.user_exercise_preferences(user_id, exercise_id, template_id)
WHERE template_id IS NOT NULL AND program_id IS NULL;

CREATE UNIQUE INDEX idx_user_ex_pref_program 
ON public.user_exercise_preferences(user_id, exercise_id, program_id)
WHERE template_id IS NULL AND program_id IS NOT NULL;

CREATE UNIQUE INDEX idx_user_ex_pref_global 
ON public.user_exercise_preferences(user_id, exercise_id)
WHERE template_id IS NULL AND program_id IS NULL;

-- Update apply_initial_targets to use preferences
CREATE OR REPLACE FUNCTION public.apply_initial_targets(p_workout_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_template_id uuid;
  v_program_id uuid;
  rec RECORD;
  v_pref_rep_min integer;
  v_pref_rep_max integer;
  v_pref_weight_kg numeric;
BEGIN
  -- Get workout context
  SELECT user_id, template_id, program_id
  INTO v_user_id, v_template_id, v_program_id
  FROM public.workouts
  WHERE id = p_workout_id;

  -- Process each exercise in the workout
  FOR rec IN
    SELECT we.id, we.exercise_id, we.target_reps_min, we.target_reps_max, we.target_weight_kg
    FROM public.workout_exercises we
    WHERE we.workout_id = p_workout_id
    ORDER BY we.order_index
  LOOP
    v_pref_rep_min := NULL;
    v_pref_rep_max := NULL;
    v_pref_weight_kg := NULL;

    -- Try to get preferences with fallback hierarchy:
    -- 1. Exact match (template + program)
    -- 2. Template-specific
    -- 3. Program-specific  
    -- 4. Global (no template/program)
    SELECT preferred_rep_min, preferred_rep_max, preferred_weight_kg
    INTO v_pref_rep_min, v_pref_rep_max, v_pref_weight_kg
    FROM public.user_exercise_preferences
    WHERE user_id = v_user_id
      AND exercise_id = rec.exercise_id
      AND (
        -- Exact match
        (template_id = v_template_id AND program_id = v_program_id)
        OR
        -- Template-specific match
        (v_template_id IS NOT NULL AND template_id = v_template_id AND program_id IS NULL)
        OR
        -- Program-specific match
        (v_program_id IS NOT NULL AND program_id = v_program_id AND template_id IS NULL)
        OR
        -- Global preference
        (template_id IS NULL AND program_id IS NULL)
      )
    ORDER BY 
      -- Prioritize exact match, then template, then program, then global
      CASE 
        WHEN template_id = v_template_id AND program_id = v_program_id THEN 1
        WHEN template_id = v_template_id AND program_id IS NULL THEN 2
        WHEN program_id = v_program_id AND template_id IS NULL THEN 3
        ELSE 4
      END
    LIMIT 1;

    -- Update workout_exercises with preferences if found
    IF v_pref_rep_min IS NOT NULL OR v_pref_rep_max IS NOT NULL OR v_pref_weight_kg IS NOT NULL THEN
      UPDATE public.workout_exercises
      SET 
        target_reps_min = COALESCE(v_pref_rep_min, target_reps_min),
        target_reps_max = COALESCE(v_pref_rep_max, target_reps_max),
        target_weight_kg = COALESCE(v_pref_weight_kg, target_weight_kg)
      WHERE id = rec.id;
    END IF;
  END LOOP;
END;
$$;