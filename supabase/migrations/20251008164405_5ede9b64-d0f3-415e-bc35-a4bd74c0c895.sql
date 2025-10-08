
-- Create function to get user's bottom navigation items
CREATE OR REPLACE FUNCTION public.user_bottom_nav(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  category_items jsonb := '[]'::jsonb;
BEGIN
  -- Get top 3 pinned categories ordered by display_order
  SELECT jsonb_agg(
    jsonb_build_object(
      'slug', lc.slug,
      'name', lc.name,
      'icon', lc.icon,
      'color', lc.color,
      'target', 'category_dashboard'
    )
    ORDER BY ucp.display_order
  )
  INTO category_items
  FROM user_category_prefs ucp
  JOIN life_categories lc ON lc.id = ucp.category_id
  LEFT JOIN coach_subscriptions cs ON cs.coach_id = ucp.selected_coach_id AND cs.user_id = p_user_id
  WHERE ucp.user_id = p_user_id
    AND ucp.nav_pinned = true
    AND ucp.is_enabled = true
    AND (
      ucp.selected_coach_id IS NULL 
      OR cs.status = 'active'
    )
  LIMIT 3;

  -- Build final array: Atlas + categories + Planets
  result := jsonb_build_array(
    jsonb_build_object(
      'slug', 'atlas',
      'name', 'Atlas',
      'icon', '🗺️',
      'target', 'atlas'
    )
  );
  
  IF category_items IS NOT NULL THEN
    result := result || category_items;
  END IF;
  
  result := result || jsonb_build_array(
    jsonb_build_object(
      'slug', 'planets',
      'name', 'Planets',
      'icon', '🌍',
      'target', 'planets'
    )
  );
  
  RETURN result;
END;
$$;

-- Create function to get user's category priorities
CREATE OR REPLACE FUNCTION public.user_priorities(p_user_id uuid)
RETURNS TABLE(
  category_id uuid,
  slug text,
  name text,
  icon text,
  color text,
  display_order integer,
  is_enabled boolean,
  nav_pinned boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lc.id,
    lc.slug,
    lc.name,
    lc.icon,
    lc.color,
    ucp.display_order,
    ucp.is_enabled,
    ucp.nav_pinned
  FROM user_category_prefs ucp
  JOIN life_categories lc ON lc.id = ucp.category_id
  WHERE ucp.user_id = p_user_id
    AND ucp.is_enabled = true
  ORDER BY ucp.display_order, lc.display_order;
END;
$$;

-- Create function to get next best category suggestion
CREATE OR REPLACE FUNCTION public.next_best_category(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'slug', lc.slug,
    'name', lc.name,
    'icon', lc.icon,
    'color', lc.color
  )
  INTO result
  FROM user_category_prefs ucp
  JOIN life_categories lc ON lc.id = ucp.category_id
  WHERE ucp.user_id = p_user_id
    AND ucp.is_enabled = true
  ORDER BY ucp.display_order, lc.display_order
  LIMIT 1 OFFSET 1;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Create function to get coaches for a category
CREATE OR REPLACE FUNCTION public.coaches_for_category(p_user_id uuid, p_category_slug text)
RETURNS TABLE(
  coach_id uuid,
  name text,
  display_name text,
  coach_type coach_type,
  is_selected boolean,
  has_access boolean,
  is_default boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category_id uuid;
  v_selected_coach_id uuid;
BEGIN
  -- Get category ID
  SELECT id INTO v_category_id
  FROM life_categories
  WHERE slug = p_category_slug;
  
  -- Get user's selected coach for this category
  SELECT selected_coach_id INTO v_selected_coach_id
  FROM user_category_prefs
  WHERE user_id = p_user_id AND category_id = v_category_id;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.display_name,
    c.type,
    (c.id = v_selected_coach_id) as is_selected,
    (c.is_default = true OR EXISTS(
      SELECT 1 FROM coach_subscriptions cs
      WHERE cs.user_id = p_user_id 
        AND cs.coach_id = c.id 
        AND cs.status = 'active'
    )) as has_access,
    c.is_default
  FROM coaches c
  WHERE c.category_id = v_category_id
    AND c.is_active = true
  ORDER BY c.is_default DESC, c.name;
END;
$$;