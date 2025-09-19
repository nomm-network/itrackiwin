-- Create app schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app;

-- Drop old version if needed
DROP FUNCTION IF EXISTS app.user_bottom_nav(u uuid);

-- Recreate using life_categories as the source of categories
CREATE OR REPLACE FUNCTION app.user_bottom_nav(u uuid)
RETURNS TABLE (
  slot int,
  item_type text,
  label text,
  slug text,
  icon text
)
LANGUAGE sql
STABLE
AS $$
WITH dyn AS (
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY ucs.priority_rank NULLS LAST, lc.display_order NULLS LAST, lc.name ASC
    ) AS rn,
    'category'::text AS item_type,
    lc.name AS label,
    lc.slug AS slug,
    COALESCE(lc.icon, 'category') AS icon
  FROM user_category_settings ucs
  JOIN life_categories lc ON lc.id = ucs.category_id
  LEFT JOIN coach_subscriptions cs
    ON cs.user_id = ucs.user_id
   AND cs.coach_id = COALESCE(
         ucs.selected_coach_id,
         (SELECT id FROM coaches WHERE category_id = lc.id AND is_default = true LIMIT 1)
       )
   AND cs.status = 'active'
  WHERE ucs.user_id = u
    AND ucs.is_enabled IS TRUE
    AND ucs.nav_pinned IS TRUE
    -- show the category only if no specific coach is required OR user has access to the selected coach
    AND (ucs.selected_coach_id IS NULL OR cs.id IS NOT NULL)
)
SELECT * FROM (VALUES
  (1, 'fixed', 'Dashboard', 'dashboard', 'home'),
  (2, 'fixed', 'Atlas',     'atlas',     'globe')
) fixed(slot,item_type,label,slug,icon)
UNION ALL
SELECT 2 + rn AS slot, item_type, label, slug, icon
FROM dyn
ORDER BY slot
LIMIT 5;
$$;

-- Grant access to authenticated users
REVOKE ALL ON FUNCTION app.user_bottom_nav(uuid) FROM public;
GRANT EXECUTE ON FUNCTION app.user_bottom_nav(uuid) TO authenticated;