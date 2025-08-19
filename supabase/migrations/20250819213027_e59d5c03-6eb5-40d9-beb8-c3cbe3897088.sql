-- Fix security warnings - update functions to set search_path
CREATE OR REPLACE FUNCTION public.get_category_name(p_category_id uuid, p_language_code text DEFAULT 'en')
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT name FROM public.life_category_translations 
     WHERE category_id = p_category_id AND language_code = p_language_code),
    (SELECT name FROM public.life_category_translations 
     WHERE category_id = p_category_id AND language_code = 'en'),
    (SELECT name FROM public.life_categories WHERE id = p_category_id)
  );
$$;

-- Fix security warnings - update functions to set search_path
CREATE OR REPLACE FUNCTION public.get_subcategory_name(p_subcategory_id uuid, p_language_code text DEFAULT 'en')
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT name FROM public.life_subcategory_translations 
     WHERE subcategory_id = p_subcategory_id AND language_code = p_language_code),
    (SELECT name FROM public.life_subcategory_translations 
     WHERE subcategory_id = p_subcategory_id AND language_code = 'en'),
    (SELECT name FROM public.life_subcategories WHERE id = p_subcategory_id)
  );
$$;

-- Fix security warnings - update functions to set search_path
CREATE OR REPLACE FUNCTION public.get_text(p_key text, p_language_code text DEFAULT 'en')
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT value FROM public.text_translations 
     WHERE key = p_key AND language_code = p_language_code),
    (SELECT value FROM public.text_translations 
     WHERE key = p_key AND language_code = 'en'),
    p_key
  );
$$;