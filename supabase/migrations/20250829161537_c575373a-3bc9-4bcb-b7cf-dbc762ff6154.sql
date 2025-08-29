-- Create movement_patterns table
CREATE TABLE public.movement_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movement_patterns_translations table
CREATE TABLE public.movement_patterns_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movement_pattern_id UUID NOT NULL REFERENCES public.movement_patterns(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(movement_pattern_id, language_code)
);

-- Enable RLS
ALTER TABLE public.movement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_patterns_translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "movement_patterns_select_all" ON public.movement_patterns FOR SELECT USING (true);
CREATE POLICY "movement_patterns_admin_manage" ON public.movement_patterns FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "movement_patterns_translations_select_all" ON public.movement_patterns_translations FOR SELECT USING (true);
CREATE POLICY "movement_patterns_translations_admin_manage" ON public.movement_patterns_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_movement_patterns_updated_at
  BEFORE UPDATE ON public.movement_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_movement_patterns_translations_updated_at
  BEFORE UPDATE ON public.movement_patterns_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert basic movement patterns
INSERT INTO public.movement_patterns (slug) VALUES 
  ('press'),
  ('row'),
  ('pull-down'),
  ('fly'),
  ('curl'),
  ('extension'),
  ('raise'),
  ('squat'),
  ('hinge'),
  ('lunge'),
  ('carry'),
  ('rotation');

-- Insert English translations
INSERT INTO public.movement_patterns_translations (movement_pattern_id, language_code, name, description) 
SELECT 
  mp.id,
  'en',
  CASE mp.slug
    WHEN 'press' THEN 'Press'
    WHEN 'row' THEN 'Row'
    WHEN 'pull-down' THEN 'Pull-down'
    WHEN 'fly' THEN 'Fly'
    WHEN 'curl' THEN 'Curl'
    WHEN 'extension' THEN 'Extension'
    WHEN 'raise' THEN 'Raise'
    WHEN 'squat' THEN 'Squat'
    WHEN 'hinge' THEN 'Hinge'
    WHEN 'lunge' THEN 'Lunge'
    WHEN 'carry' THEN 'Carry'
    WHEN 'rotation' THEN 'Rotation'
  END,
  CASE mp.slug
    WHEN 'press' THEN 'Pushing movements away from body'
    WHEN 'row' THEN 'Pulling movements toward body horizontally'
    WHEN 'pull-down' THEN 'Pulling movements downward'
    WHEN 'fly' THEN 'Arm movements in arc pattern'
    WHEN 'curl' THEN 'Flexion movements'
    WHEN 'extension' THEN 'Extension movements'
    WHEN 'raise' THEN 'Lifting movements'
    WHEN 'squat' THEN 'Knee-dominant movements'
    WHEN 'hinge' THEN 'Hip-dominant movements'
    WHEN 'lunge' THEN 'Single-leg movements'
    WHEN 'carry' THEN 'Loaded carry movements'
    WHEN 'rotation' THEN 'Rotational and anti-rotational movements'
  END
FROM public.movement_patterns mp;