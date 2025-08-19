-- Create translation tables for fitness entities

-- 1. Body Parts Translations
CREATE TABLE public.body_parts_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  body_part_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(body_part_id, language_code)
);

-- 2. Equipment Translations  
CREATE TABLE public.equipment_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(equipment_id, language_code)
);

-- 3. Muscle Groups Translations
CREATE TABLE public.muscle_groups_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  muscle_group_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(muscle_group_id, language_code)
);

-- 4. Muscles Translations
CREATE TABLE public.muscles_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  muscle_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(muscle_id, language_code)
);

-- 5. Exercises Translations
CREATE TABLE public.exercises_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(exercise_id, language_code)
);

-- 6. Workout Templates Translations
CREATE TABLE public.workout_templates_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(template_id, language_code)
);

-- Enable RLS
ALTER TABLE public.body_parts_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscles_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin manage, public read
CREATE POLICY "body_parts_translations_admin_manage" ON public.body_parts_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "body_parts_translations_select_all" ON public.body_parts_translations FOR SELECT USING (true);

CREATE POLICY "equipment_translations_admin_manage" ON public.equipment_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "equipment_translations_select_all" ON public.equipment_translations FOR SELECT USING (true);

CREATE POLICY "muscle_groups_translations_admin_manage" ON public.muscle_groups_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "muscle_groups_translations_select_all" ON public.muscle_groups_translations FOR SELECT USING (true);

CREATE POLICY "muscles_translations_admin_manage" ON public.muscles_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "muscles_translations_select_all" ON public.muscles_translations FOR SELECT USING (true);

CREATE POLICY "exercises_translations_admin_manage" ON public.exercises_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "exercises_translations_select_all" ON public.exercises_translations FOR SELECT USING (true);

CREATE POLICY "workout_templates_translations_admin_manage" ON public.workout_templates_translations FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "workout_templates_translations_select_all" ON public.workout_templates_translations FOR SELECT USING (true);

-- Update triggers for timestamps
CREATE TRIGGER update_body_parts_translations_updated_at BEFORE UPDATE ON public.body_parts_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipment_translations_updated_at BEFORE UPDATE ON public.equipment_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_muscle_groups_translations_updated_at BEFORE UPDATE ON public.muscle_groups_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_muscles_translations_updated_at BEFORE UPDATE ON public.muscles_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exercises_translations_updated_at BEFORE UPDATE ON public.exercises_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workout_templates_translations_updated_at BEFORE UPDATE ON public.workout_templates_translations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data to English translations
INSERT INTO public.body_parts_translations (body_part_id, language_code, name)
SELECT id, 'en', name FROM public.body_parts WHERE name IS NOT NULL;

INSERT INTO public.equipment_translations (equipment_id, language_code, name)
SELECT id, 'en', name FROM public.equipment WHERE name IS NOT NULL;

INSERT INTO public.muscle_groups_translations (muscle_group_id, language_code, name)
SELECT id, 'en', name FROM public.muscle_groups WHERE name IS NOT NULL;

INSERT INTO public.muscles_translations (muscle_id, language_code, name)
SELECT id, 'en', name FROM public.muscles WHERE name IS NOT NULL;

INSERT INTO public.exercises_translations (exercise_id, language_code, name, description)
SELECT id, 'en', name, description FROM public.exercises WHERE name IS NOT NULL;

INSERT INTO public.workout_templates_translations (template_id, language_code, name)
SELECT id, 'en', name FROM public.workout_templates WHERE name IS NOT NULL;

-- Create views with translations
CREATE VIEW public.v_body_parts_with_translations AS
SELECT 
  bp.id,
  bp.slug,
  bp.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.body_parts bp
LEFT JOIN public.body_parts_translations t ON bp.id = t.body_part_id
GROUP BY bp.id, bp.slug, bp.created_at;

CREATE VIEW public.v_equipment_with_translations AS
SELECT 
  e.id,
  e.slug,
  e.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.equipment e
LEFT JOIN public.equipment_translations t ON e.id = t.equipment_id
GROUP BY e.id, e.slug, e.created_at;

CREATE VIEW public.v_muscle_groups_with_translations AS
SELECT 
  mg.id,
  mg.slug,
  mg.body_part_id,
  mg.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.muscle_groups mg
LEFT JOIN public.muscle_groups_translations t ON mg.id = t.muscle_group_id
GROUP BY mg.id, mg.slug, mg.body_part_id, mg.created_at;

CREATE VIEW public.v_muscles_with_translations AS
SELECT 
  m.id,
  m.slug,
  m.muscle_group_id,
  m.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.muscles m
LEFT JOIN public.muscles_translations t ON m.id = t.muscle_id
GROUP BY m.id, m.slug, m.muscle_group_id, m.created_at;

CREATE VIEW public.v_exercises_with_translations AS
SELECT 
  e.id,
  e.slug,
  e.body_part_id,
  e.owner_user_id,
  e.is_public,
  e.popularity_rank,
  e.equipment_id,
  e.secondary_muscle_ids,
  e.primary_muscle_id,
  e.image_url,
  e.thumbnail_url,
  e.body_part,
  e.source_url,
  e.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.exercises e
LEFT JOIN public.exercises_translations t ON e.id = t.exercise_id
GROUP BY e.id, e.slug, e.body_part_id, e.owner_user_id, e.is_public, e.popularity_rank, e.equipment_id, e.secondary_muscle_ids, e.primary_muscle_id, e.image_url, e.thumbnail_url, e.body_part, e.source_url, e.created_at;

CREATE VIEW public.v_workout_templates_with_translations AS
SELECT 
  wt.id,
  wt.user_id,
  wt.notes,
  wt.created_at,
  COALESCE(
    jsonb_object_agg(
      t.language_code, 
      jsonb_build_object('name', t.name, 'description', t.description)
    ) FILTER (WHERE t.language_code IS NOT NULL),
    '{}'::jsonb
  ) AS translations
FROM public.workout_templates wt
LEFT JOIN public.workout_templates_translations t ON wt.id = t.template_id
GROUP BY wt.id, wt.user_id, wt.notes, wt.created_at;