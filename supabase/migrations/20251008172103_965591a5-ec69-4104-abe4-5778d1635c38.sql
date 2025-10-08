-- Update Atlas icon in bottom nav function
CREATE OR REPLACE FUNCTION public.user_bottom_nav(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      'icon', '🤖',
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
$function$;