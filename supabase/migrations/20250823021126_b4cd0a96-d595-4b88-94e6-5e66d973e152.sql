-- Fix function search paths for security compliance

-- Set search_path for functions that are missing it
DO $$
DECLARE
  func_name text;
BEGIN
  -- List of functions that need search_path set
  FOR func_name IN 
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
      AND routine_type = 'FUNCTION'
      AND routine_name IN (
        'get_category_name',
        'get_subcategory_name', 
        'get_text',
        'get_life_categories_i18n',
        'get_life_subcategories_i18n'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION public.%I SET search_path = ''public''', func_name);
  END LOOP;
END $$;