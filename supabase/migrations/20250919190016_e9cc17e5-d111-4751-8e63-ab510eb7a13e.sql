-- Create RPC to list available coaches for a user & category with subscription status
CREATE OR REPLACE FUNCTION app.coaches_for_category(u uuid, cat_slug text)
RETURNS TABLE (
  coach_id uuid,
  display_name text,
  type coach_type,
  is_default boolean,
  selected boolean,
  has_access boolean,
  price_cents int,
  avatar_url text
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
WITH cat AS (
  SELECT id FROM life_categories WHERE slug = cat_slug LIMIT 1
),
sel AS (
  SELECT selected_coach_id
  FROM user_category_settings ucs
  JOIN cat ON cat.id = ucs.category_id
  WHERE ucs.user_id = u
  LIMIT 1
),
subs AS (
  SELECT coach_id
  FROM coach_subscriptions
  WHERE user_id = u AND status = 'active'
)
SELECT
  c.id AS coach_id,
  c.display_name,
  c.type,
  c.is_default,
  (c.id = sel.selected_coach_id) AS selected,
  (c.is_default OR c.id IN (SELECT coach_id FROM subs)) AS has_access,
  c.price_cents,
  c.avatar_url
FROM coaches c
JOIN cat ON c.category_id = cat.id
WHERE c.is_active = true
ORDER BY c.is_default DESC, c.display_name;
$$;

-- Grant access to authenticated users
REVOKE ALL ON FUNCTION app.coaches_for_category(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION app.coaches_for_category(uuid, text) TO authenticated;