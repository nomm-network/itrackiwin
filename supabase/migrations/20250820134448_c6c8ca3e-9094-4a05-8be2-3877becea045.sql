-- Create grips table for different grip types and setups
CREATE TABLE public.grips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'width', 'orientation', 'attachment', 'stance'
  description TEXT,
  is_compatible_with JSONB DEFAULT '[]'::jsonb, -- array of grip IDs that can be combined
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grips ENABLE ROW LEVEL SECURITY;

-- Create policies for grips
CREATE POLICY "grips_select_all" 
ON public.grips 
FOR SELECT 
USING (true);

CREATE POLICY "grips_admin_manage" 
ON public.grips 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create junction table for workout sets and grips
CREATE TABLE public.workout_set_grips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_set_id UUID NOT NULL REFERENCES public.workout_sets(id) ON DELETE CASCADE,
  grip_id UUID NOT NULL REFERENCES public.grips(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workout_set_id, grip_id)
);

-- Enable RLS for workout_set_grips
ALTER TABLE public.workout_set_grips ENABLE ROW LEVEL SECURITY;

-- Create policies for workout_set_grips (same access as workout_sets)
CREATE POLICY "workout_set_grips_per_user_select" 
ON public.workout_set_grips 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM workout_sets ws
  JOIN workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN workouts w ON w.id = we.workout_id
  WHERE ws.id = workout_set_grips.workout_set_id 
  AND w.user_id = auth.uid()
));

CREATE POLICY "workout_set_grips_per_user_mutate" 
ON public.workout_set_grips 
FOR ALL 
USING (EXISTS (
  SELECT 1 
  FROM workout_sets ws
  JOIN workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN workouts w ON w.id = we.workout_id
  WHERE ws.id = workout_set_grips.workout_set_id 
  AND w.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 
  FROM workout_sets ws
  JOIN workout_exercises we ON we.id = ws.workout_exercise_id
  JOIN workouts w ON w.id = we.workout_id
  WHERE ws.id = workout_set_grips.workout_set_id 
  AND w.user_id = auth.uid()
));

-- Update personal_records to include grip combination
ALTER TABLE public.personal_records 
ADD COLUMN grip_combination JSONB DEFAULT NULL;

-- Create index for better performance on grip combinations
CREATE INDEX idx_personal_records_grip_combination ON public.personal_records USING GIN(grip_combination);
CREATE INDEX idx_workout_set_grips_workout_set_id ON public.workout_set_grips(workout_set_id);

-- Insert default grip options
INSERT INTO public.grips (name, slug, category, description, is_compatible_with) VALUES
-- Width grips
('Close Grip', 'close', 'width', 'Hands positioned closer than shoulder width', '["supinated", "pronated", "neutral"]'),
('Medium Grip', 'medium', 'width', 'Hands positioned at shoulder width', '["supinated", "pronated", "neutral"]'),
('Wide Grip', 'wide', 'width', 'Hands positioned wider than shoulder width', '["supinated", "pronated", "neutral"]'),

-- Orientation grips
('Supinated', 'supinated', 'orientation', 'Palms facing towards you (underhand)', '["close", "medium", "wide"]'),
('Pronated', 'pronated', 'orientation', 'Palms facing away from you (overhand)', '["close", "medium", "wide"]'),
('Neutral', 'neutral', 'orientation', 'Palms facing each other', '["close", "medium", "wide"]'),
('Mixed Grip', 'mixed', 'orientation', 'One hand supinated, one pronated', '["medium", "wide"]'),

-- Attachment types
('Straight Bar', 'straight-bar', 'attachment', 'Standard straight barbell or cable bar', '[]'),
('EZ Bar', 'ez-bar', 'attachment', 'Curved barbell for wrist comfort', '[]'),
('Rope', 'rope', 'attachment', 'Cable rope attachment', '[]'),
('Single Handle', 'single-handle', 'attachment', 'Individual cable handles', '[]'),
('D-Handle', 'd-handle', 'attachment', 'D-shaped cable handles', '[]'),

-- Stance (for lower body exercises)
('Conventional', 'conventional', 'stance', 'Standard stance width', '[]'),
('Sumo', 'sumo', 'stance', 'Wide stance with toes pointed out', '[]'),
('Narrow Stance', 'narrow-stance', 'stance', 'Feet closer than hip width', '[]');

-- Function to update personal records with grip combinations
CREATE OR REPLACE FUNCTION public.upsert_prs_with_grips_after_set()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_exercise_id uuid;
  v_user_id uuid;
  v_epley numeric(8,2);
  v_grip_combination jsonb;
BEGIN
  -- Get exercise and user info
  SELECT we.exercise_id, w.user_id
    INTO v_exercise_id, v_user_id
  FROM public.workout_exercises we
  JOIN public.workouts w ON w.id = we.workout_id
  WHERE we.id = NEW.workout_exercise_id;

  IF v_exercise_id IS NULL OR v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get grip combination for this set
  SELECT COALESCE(
    jsonb_agg(g.slug ORDER BY g.slug), 
    '[]'::jsonb
  ) INTO v_grip_combination
  FROM public.workout_set_grips wsg
  JOIN public.grips g ON g.id = wsg.grip_id
  WHERE wsg.workout_set_id = NEW.id;

  -- Update PRs with grip combination consideration
  IF NEW.weight IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_combination)
    VALUES (v_user_id, v_exercise_id, 'heaviest', NEW.weight, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id, v_grip_combination)
    ON CONFLICT (user_id, exercise_id, kind, COALESCE(grip_combination, '[]'::jsonb))
    DO UPDATE SET 
      value = EXCLUDED.value, 
      unit = EXCLUDED.unit, 
      achieved_at = EXCLUDED.achieved_at, 
      workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  IF NEW.reps IS NOT NULL THEN
    INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_combination)
    VALUES (v_user_id, v_exercise_id, 'reps', NEW.reps, 'reps', COALESCE(NEW.completed_at, now()), NEW.id, v_grip_combination)
    ON CONFLICT (user_id, exercise_id, kind, COALESCE(grip_combination, '[]'::jsonb))
    DO UPDATE SET 
      value = EXCLUDED.value, 
      achieved_at = EXCLUDED.achieved_at, 
      workout_set_id = EXCLUDED.workout_set_id
    WHERE EXCLUDED.value > public.personal_records.value;
  END IF;

  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL AND NEW.reps > 0 THEN
    v_epley := public.epley_1rm(NEW.weight, NEW.reps);
    IF v_epley IS NOT NULL THEN
      INSERT INTO public.personal_records(user_id, exercise_id, kind, value, unit, achieved_at, workout_set_id, grip_combination)
      VALUES (v_user_id, v_exercise_id, '1RM', v_epley, NEW.weight_unit, COALESCE(NEW.completed_at, now()), NEW.id, v_grip_combination)
      ON CONFLICT (user_id, exercise_id, kind, COALESCE(grip_combination, '[]'::jsonb))
      DO UPDATE SET 
        value = EXCLUDED.value, 
        unit = EXCLUDED.unit, 
        achieved_at = EXCLUDED.achieved_at, 
        workout_set_id = EXCLUDED.workout_set_id
      WHERE EXCLUDED.value > public.personal_records.value;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS upsert_prs_trigger ON public.workout_sets;
CREATE TRIGGER upsert_prs_with_grips_trigger
  AFTER INSERT OR UPDATE ON public.workout_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_prs_with_grips_after_set();

-- Add unique constraint to personal_records including grip_combination
ALTER TABLE public.personal_records 
DROP CONSTRAINT IF EXISTS personal_records_user_id_exercise_id_kind_key;

-- Create unique constraint that includes grip combination
CREATE UNIQUE INDEX personal_records_unique_with_grips 
ON public.personal_records (user_id, exercise_id, kind, COALESCE(grip_combination, '[]'::jsonb));