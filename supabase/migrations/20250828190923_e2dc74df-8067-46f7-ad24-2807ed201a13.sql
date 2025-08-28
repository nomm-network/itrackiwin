-- Fix the exercises_autoname_tg function to use the correct table name
CREATE OR REPLACE FUNCTION public.exercises_autoname_tg()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  name_text TEXT;
  primary_muscle_name TEXT;
BEGIN
  -- Get primary muscle name if available
  IF NEW.primary_muscle_id IS NOT NULL THEN
    SELECT t.name INTO primary_muscle_name
    FROM public.muscle_groups mg
    LEFT JOIN public.muscle_groups_translations t ON t.muscle_group_id = mg.id AND t.language_code = COALESCE(NEW.name_locale, 'en')
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
END $function$;