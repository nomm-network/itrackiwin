-- Create exercise_grips many-to-many table
CREATE TABLE IF NOT EXISTS public.exercise_grips (
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  grip_id UUID NOT NULL REFERENCES public.grips(id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (exercise_id, grip_id)
);

-- Add RLS policies
ALTER TABLE public.exercise_grips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_grips_admin_manage" ON public.exercise_grips
  FOR ALL 
  TO authenticated 
  USING (is_admin(auth.uid()));

CREATE POLICY "exercise_grips_select_all" ON public.exercise_grips
  FOR SELECT 
  TO public
  USING (true);

-- Clear and repopulate grips with standardized data
TRUNCATE TABLE public.grips RESTART IDENTITY CASCADE;

INSERT INTO public.grips (id, slug, category) VALUES
  (gen_random_uuid(), 'overhand', 'orientation'),
  (gen_random_uuid(), 'underhand', 'orientation'),
  (gen_random_uuid(), 'neutral', 'orientation'),
  (gen_random_uuid(), 'mixed', 'orientation'),
  (gen_random_uuid(), 'wide', 'width'),
  (gen_random_uuid(), 'close', 'width'),
  (gen_random_uuid(), 'standard', 'width'),
  (gen_random_uuid(), 'hook', 'technique'),
  (gen_random_uuid(), 'false', 'technique');

-- Add English translations for grips
INSERT INTO public.grips_translations (grip_id, language_code, name, description)
SELECT 
  g.id,
  'en',
  CASE g.slug
    WHEN 'overhand' THEN 'Overhand'
    WHEN 'underhand' THEN 'Underhand'
    WHEN 'neutral' THEN 'Neutral'
    WHEN 'mixed' THEN 'Mixed'
    WHEN 'wide' THEN 'Wide'
    WHEN 'close' THEN 'Close'
    WHEN 'standard' THEN 'Standard'
    WHEN 'hook' THEN 'Hook'
    WHEN 'false' THEN 'False'
  END,
  CASE g.slug
    WHEN 'overhand' THEN 'Palms facing down (pronated grip)'
    WHEN 'underhand' THEN 'Palms facing up (supinated grip)'
    WHEN 'neutral' THEN 'Palms facing each other'
    WHEN 'mixed' THEN 'One palm up, one palm down'
    WHEN 'wide' THEN 'Hands placed wider than shoulders'
    WHEN 'close' THEN 'Hands placed close together'
    WHEN 'standard' THEN 'Shoulder-width grip'
    WHEN 'hook' THEN 'Hook grip with thumb under fingers'
    WHEN 'false' THEN 'False grip for muscle-ups'
  END
FROM public.grips g;

-- Add some default exercise-grip relationships for common exercises
INSERT INTO public.exercise_grips (exercise_id, grip_id, is_default, order_index)
SELECT 
  e.id,
  g.id,
  CASE 
    WHEN g.slug = 'overhand' THEN true
    ELSE false
  END,
  ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY g.slug)
FROM public.exercises e
CROSS JOIN public.grips g
WHERE e.slug IN ('lat-pulldown', 'pull-up', 'chin-up', 'barbell-row', 'cable-row')
  AND g.slug IN ('overhand', 'underhand', 'neutral', 'wide', 'close');

-- Add deadlift grips
INSERT INTO public.exercise_grips (exercise_id, grip_id, is_default, order_index)
SELECT 
  e.id,
  g.id,
  CASE 
    WHEN g.slug = 'overhand' THEN true
    ELSE false
  END,
  ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY g.slug)
FROM public.exercises e
CROSS JOIN public.grips g
WHERE e.slug ILIKE '%deadlift%'
  AND g.slug IN ('overhand', 'mixed', 'hook');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_grips_exercise_id ON public.exercise_grips(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_grips_grip_id ON public.exercise_grips(grip_id);