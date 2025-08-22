-- 1. Experience levels catalog
CREATE TABLE public.experience_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  sort_order smallint NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Experience level translations
CREATE TABLE public.experience_level_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_level_id uuid NOT NULL REFERENCES public.experience_levels(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (experience_level_id, language_code)
);

-- 3. Experience level parameters for coaching logic
CREATE TABLE public.experience_level_params (
  experience_level_id uuid PRIMARY KEY REFERENCES public.experience_levels(id) ON DELETE CASCADE,
  start_intensity_low numeric NOT NULL,
  start_intensity_high numeric NOT NULL,
  warmup_set_count_min smallint NOT NULL,
  warmup_set_count_max smallint NOT NULL,
  main_rest_seconds_min smallint NOT NULL,
  main_rest_seconds_max smallint NOT NULL,
  weekly_progress_pct numeric NOT NULL,
  allow_high_complexity boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Add experience_level_id to user_profile_fitness
ALTER TABLE public.user_profile_fitness 
ADD COLUMN experience_level_id uuid NULL REFERENCES public.experience_levels(id);

-- 5. Enable RLS
ALTER TABLE public.experience_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_level_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_level_params ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies - catalogs readable by everyone
CREATE POLICY "Experience levels are viewable by everyone" 
ON public.experience_levels FOR SELECT USING (true);

CREATE POLICY "Experience level translations are viewable by everyone" 
ON public.experience_level_translations FOR SELECT USING (true);

CREATE POLICY "Experience level params are viewable by everyone" 
ON public.experience_level_params FOR SELECT USING (true);

-- Admin policies
CREATE POLICY "Admins can manage experience levels" 
ON public.experience_levels FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage experience level translations" 
ON public.experience_level_translations FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage experience level params" 
ON public.experience_level_params FOR ALL USING (is_admin(auth.uid()));

-- 7. Seed experience levels
INSERT INTO public.experience_levels (slug, sort_order) VALUES
('new', 10),
('returning', 20),
('regular', 30),
('advanced', 40);

-- 8. Seed English translations
INSERT INTO public.experience_level_translations (experience_level_id, language_code, name, description)
SELECT id, 'en', 
  CASE slug
    WHEN 'new' THEN 'New to fitness'
    WHEN 'returning' THEN 'Returning after break'
    WHEN 'regular' THEN 'Regular exerciser'
    WHEN 'advanced' THEN 'Very experienced'
  END,
  CASE slug
    WHEN 'new' THEN 'Just starting your fitness journey'
    WHEN 'returning' THEN 'Getting back into fitness after some time off'
    WHEN 'regular' THEN 'Consistently active with good form'
    WHEN 'advanced' THEN 'Highly experienced with advanced techniques'
  END
FROM public.experience_levels;

-- 9. Seed Romanian translations
INSERT INTO public.experience_level_translations (experience_level_id, language_code, name, description)
SELECT id, 'ro', 
  CASE slug
    WHEN 'new' THEN 'Nou în fitness'
    WHEN 'returning' THEN 'Revin după pauză'
    WHEN 'regular' THEN 'Exerciții regulate'
    WHEN 'advanced' THEN 'Foarte experimentat'
  END,
  CASE slug
    WHEN 'new' THEN 'Abia începi călătoria fitness'
    WHEN 'returning' THEN 'Te întorci la fitness după o pauză'
    WHEN 'regular' THEN 'Activ în mod constant cu tehnică bună'
    WHEN 'advanced' THEN 'Foarte experimentat cu tehnici avansate'
  END
FROM public.experience_levels;

-- 10. Seed parameters for coaching logic
INSERT INTO public.experience_level_params
(experience_level_id, start_intensity_low, start_intensity_high, warmup_set_count_min, warmup_set_count_max, main_rest_seconds_min, main_rest_seconds_max, weekly_progress_pct, allow_high_complexity)
SELECT el.id,
  CASE el.slug
    WHEN 'new' THEN 0.60 WHEN 'returning' THEN 0.65 WHEN 'regular' THEN 0.70 ELSE 0.75 END,
  CASE el.slug
    WHEN 'new' THEN 0.70 WHEN 'returning' THEN 0.75 WHEN 'regular' THEN 0.80 ELSE 0.85 END,
  CASE el.slug
    WHEN 'new' THEN 3 WHEN 'returning' THEN 2 WHEN 'regular' THEN 2 ELSE 1 END,
  CASE el.slug
    WHEN 'new' THEN 3 WHEN 'returning' THEN 3 WHEN 'regular' THEN 2 ELSE 2 END,
  CASE el.slug
    WHEN 'new' THEN 90 WHEN 'returning' THEN 90 WHEN 'regular' THEN 120 ELSE 120 END,
  CASE el.slug
    WHEN 'new' THEN 120 WHEN 'returning' THEN 150 WHEN 'regular' THEN 180 ELSE 240 END,
  CASE el.slug
    WHEN 'new' THEN 0.03 WHEN 'returning' THEN 0.03 WHEN 'regular' THEN 0.025 ELSE 0.015 END,
  CASE el.slug
    WHEN 'advanced' THEN true ELSE false END
FROM public.experience_levels el;

-- 11. Create helper RPC function
CREATE OR REPLACE FUNCTION public.get_user_coach_params(_user_id uuid)
RETURNS TABLE (
  experience_slug text,
  start_intensity_low numeric,
  start_intensity_high numeric,
  warmup_set_count_min smallint,
  warmup_set_count_max smallint,
  main_rest_seconds_min smallint,
  main_rest_seconds_max smallint,
  weekly_progress_pct numeric,
  allow_high_complexity boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT el.slug,
         p.start_intensity_low, p.start_intensity_high,
         p.warmup_set_count_min, p.warmup_set_count_max,
         p.main_rest_seconds_min, p.main_rest_seconds_max,
         p.weekly_progress_pct, p.allow_high_complexity
  FROM user_profile_fitness up
  JOIN experience_levels el ON el.id = up.experience_level_id
  JOIN experience_level_params p ON p.experience_level_id = el.id
  WHERE up.user_id = _user_id;
$$;

-- 12. Add updated_at trigger for translations
CREATE TRIGGER update_experience_level_translations_updated_at
  BEFORE UPDATE ON public.experience_level_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();