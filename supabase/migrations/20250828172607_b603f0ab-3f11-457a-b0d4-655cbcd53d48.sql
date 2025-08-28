-- 1) Add naming columns to exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS custom_display_name TEXT,
ADD COLUMN IF NOT EXISTS name_locale TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS name_version INTEGER DEFAULT 1;

-- Add search vector for fast name searching
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS display_name_tsv TSVECTOR
GENERATED ALWAYS AS (to_tsvector('simple', coalesce(display_name,''))) STORED;

CREATE INDEX IF NOT EXISTS idx_exercises_display_name_tsv ON public.exercises USING gin (display_name_tsv);

-- 2) Create naming templates table
CREATE TABLE public.naming_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT CHECK (scope IN ('global','movement','equipment')) NOT NULL,
  scope_ref_id UUID NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  template TEXT NOT NULL,
  sep TEXT NOT NULL DEFAULT ' – ',
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_naming_templates_scope_ref ON public.naming_templates (scope, scope_ref_id, locale) WHERE is_active;

-- Enable RLS on naming templates
ALTER TABLE public.naming_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read naming templates" 
ON public.naming_templates FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage naming templates" 
ON public.naming_templates FOR ALL 
USING (is_admin(auth.uid()));

-- 3) Helper function to pick the best template
CREATE OR REPLACE FUNCTION public._pick_template(p_movement_id UUID, p_equipment_id UUID, p_locale TEXT)
RETURNS TEXT
LANGUAGE sql STABLE 
SET search_path TO 'public'
AS $$
  WITH candidates AS (
    SELECT template, 1 AS priority FROM public.naming_templates
      WHERE is_active AND locale = p_locale AND scope = 'movement' AND scope_ref_id = p_movement_id
    UNION ALL
    SELECT template, 2 FROM public.naming_templates
      WHERE is_active AND locale = p_locale AND scope = 'equipment' AND scope_ref_id = p_equipment_id
    UNION ALL
    SELECT template, 3 FROM public.naming_templates
      WHERE is_active AND locale = p_locale AND scope = 'global'
    UNION ALL
    SELECT template, 4 FROM public.naming_templates
      WHERE is_active AND locale = 'en' AND scope = 'global'
  )
  SELECT template FROM candidates ORDER BY priority LIMIT 1;
$$;

-- 4) Helper function to convert snake_case to PascalCase
CREATE OR REPLACE FUNCTION public._pascalize(key TEXT) 
RETURNS TEXT
LANGUAGE sql IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT initcap(replace(key, '_', ''))::text;
$$;

-- 5) Main exercise name generator function
CREATE OR REPLACE FUNCTION public.generate_exercise_name(
  p_movement_id UUID,
  p_equipment_id UUID,
  p_primary_muscle TEXT,
  p_attr JSONB,
  p_handle_key TEXT,
  p_grip_type_key TEXT,
  p_locale TEXT DEFAULT 'en'
) RETURNS TEXT
LANGUAGE plpgsql STABLE
SET search_path TO 'public'
AS $$
DECLARE
  tmpl TEXT := COALESCE(
    public._pick_template(p_movement_id, p_equipment_id, p_locale),
    '{PrimaryMuscle} – {Equipment} {Movement}'
  );
  res TEXT := tmpl;
  movement_name TEXT := (SELECT name FROM public.movements WHERE id = p_movement_id);
  equipment_name TEXT := (SELECT name FROM public.equipments WHERE id = p_equipment_id);
  k TEXT; 
  v TEXT; 
BEGIN
  -- Replace core placeholders
  res := replace(res, '{PrimaryMuscle}', COALESCE(p_primary_muscle,''));
  res := replace(res, '{Movement}', COALESCE(movement_name,''));
  res := replace(res, '{Equipment}', COALESCE(equipment_name,''));
  res := replace(res, '{Handle}', COALESCE(p_handle_key,''));
  res := replace(res, '{Grip}', COALESCE(p_grip_type_key,''));

  -- Replace attribute placeholders from JSON
  FOR k, v IN
    SELECT key, value::text
    FROM jsonb_each(p_attr)
  LOOP
    -- Convert snake_case to PascalCase and replace
    res := replace(res, '{' || public._pascalize(k) || '}', COALESCE(NULLIF(v,'"null"'), ''));
  END LOOP;

  -- Remove optional segments like {Something?} if they're still there (empty)
  res := regexp_replace(res, '\{[^}]+\?\}', '', 'g');

  -- Cleanup: shrink duplicate separators and trim
  res := regexp_replace(res, '(\s*–\s*){2,}', ' – ', 'g');
  res := trim(both ' ' from res);
  res := regexp_replace(res, '(^–\s*|\s*–$)', '', 'g');

  RETURN res;
END $$;

-- 6) Trigger function to auto-generate names
CREATE OR REPLACE FUNCTION public.exercises_autoname_tg()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  name_text TEXT;
  primary_muscle_name TEXT;
BEGIN
  -- Get primary muscle name if available
  IF NEW.primary_muscle_id IS NOT NULL THEN
    SELECT t.name INTO primary_muscle_name
    FROM public.muscle_groups mg
    LEFT JOIN public.muscle_group_translations t ON t.muscle_group_id = mg.id AND t.language_code = COALESCE(NEW.name_locale, 'en')
    WHERE mg.id = NEW.primary_muscle_id;
  END IF;

  -- If custom name provided, always use it
  IF NEW.custom_display_name IS NOT NULL AND LENGTH(TRIM(NEW.custom_display_name)) > 0 THEN
    NEW.display_name := NEW.custom_display_name;
  ELSE
    -- Generate automatic name
    name_text := public.generate_exercise_name(
      NEW.movement_id,
      NEW.equipment_ref_id,
      COALESCE(primary_muscle_name, ''),
      COALESCE(NEW.attribute_values_json, '{}'::jsonb),
      NULL, -- handle_key (you can add this column if needed)
      NULL, -- grip_type_key (you can add this column if needed)
      COALESCE(NEW.name_locale, 'en')
    );
    NEW.display_name := name_text;
  END IF;
  
  RETURN NEW;
END $$;

-- 7) Create the trigger
DROP TRIGGER IF EXISTS trg_exercises_autoname ON public.exercises;
CREATE TRIGGER trg_exercises_autoname
BEFORE INSERT OR UPDATE OF movement_id, equipment_ref_id, attribute_values_json, custom_display_name, name_locale
ON public.exercises
FOR EACH ROW EXECUTE FUNCTION public.exercises_autoname_tg();

-- 8) Insert default global template
INSERT INTO public.naming_templates (scope, locale, template, version)
VALUES
('global', 'en', '{PrimaryMuscle} – {Angle?}{AngleDegrees?} {Equipment} {Movement} {Handle?} {Grip?}', 1)
ON CONFLICT DO NOTHING;