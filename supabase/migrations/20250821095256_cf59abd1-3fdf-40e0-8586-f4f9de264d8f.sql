-- Fix security definer functions where appropriate
-- Some functions legitimately need SECURITY DEFINER for RLS enforcement
-- Others can be changed to SECURITY INVOKER for better security

-- Functions that should remain SECURITY DEFINER (needed for RLS):
-- 1. get_user_last_set_for_exercise - needs to access auth.uid()
-- 2. get_user_pr_for_exercise - needs to access auth.uid() 
-- 3. has_role - checks user roles across tables
-- 4. is_admin - checks admin status
-- 5. bootstrap_admin_if_empty - needs elevated access for initial setup
-- 6. enforce_max_pins - trigger function needs elevated access

-- Functions that can be changed to SECURITY INVOKER:
-- 1. get_category_name - just returns translations, no security concerns
-- 2. get_subcategory_name - just returns translations, no security concerns  
-- 3. get_text - just returns translations, no security concerns

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
    (SELECT name FROM public.life_categories WHERE id = p_category_id)
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
    (SELECT name FROM public.life_subcategories WHERE id = p_subcategory_id)
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

-- Also remove SECURITY DEFINER from the clone function if it doesn't need elevated access
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