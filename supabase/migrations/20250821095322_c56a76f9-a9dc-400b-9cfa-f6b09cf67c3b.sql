-- Fix security definer functions where appropriate
-- Remove SECURITY DEFINER from functions that don't need elevated privileges

-- Remove SECURITY DEFINER from translation functions
CREATE OR REPLACE FUNCTION public.get_category_name(p_category_id uuid, p_language_code text DEFAULT 'en'::text)
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT name FROM public.life_category_translations 
     WHERE category_id = p_category_id AND language_code = p_language_code),
    (SELECT name FROM public.life_category_translations 
     WHERE category_id = p_category_id AND language_code = 'en'),
    -- Fallback to category slug if no translation exists
    (SELECT slug FROM public.life_categories WHERE id = p_category_id)
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_subcategory_name(p_subcategory_id uuid, p_language_code text DEFAULT 'en'::text)
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT name FROM public.life_subcategory_translations 
     WHERE subcategory_id = p_subcategory_id AND language_code = p_language_code),
    (SELECT name FROM public.life_subcategory_translations 
     WHERE subcategory_id = p_subcategory_id AND language_code = 'en'),
    -- Fallback to subcategory slug if no translation exists
    (SELECT slug FROM public.life_subcategories WHERE id = p_subcategory_id)
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_text(p_key text, p_language_code text DEFAULT 'en'::text)
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT value FROM public.text_translations 
     WHERE key = p_key AND language_code = p_language_code),
    (SELECT value FROM public.text_translations 
     WHERE key = p_key AND language_code = 'en'),
    p_key
  );
$function$;

-- Remove SECURITY DEFINER from clone function
CREATE OR REPLACE FUNCTION public.clone_template_to_workout(template_id uuid, workout_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    te record;
BEGIN
    -- Copy exercises from template to workout without creating empty sets
    FOR te IN 
        SELECT exercise_id, order_index, notes
        FROM template_exercises 
        WHERE template_id = clone_template_to_workout.template_id
        ORDER BY order_index
    LOOP
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index, notes)
        VALUES (clone_template_to_workout.workout_id, te.exercise_id, te.order_index, te.notes);
    END LOOP;
END;
$function$;