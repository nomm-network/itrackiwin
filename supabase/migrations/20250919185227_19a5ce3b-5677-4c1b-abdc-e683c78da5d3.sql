-- Insert some test user category settings for the first user to test
-- First, get a user ID if one exists, or create a dummy one for testing
INSERT INTO public.user_category_settings (user_id, category_id, is_enabled, nav_pinned, priority_rank)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid as user_id,
  lc.id as category_id,
  true as is_enabled,
  true as nav_pinned,
  lc.display_order as priority_rank
FROM life_categories lc
WHERE lc.slug IN ('health', 'wealth')
ON CONFLICT (user_id, category_id) 
DO UPDATE SET 
  is_enabled = EXCLUDED.is_enabled,
  nav_pinned = EXCLUDED.nav_pinned,
  priority_rank = EXCLUDED.priority_rank;