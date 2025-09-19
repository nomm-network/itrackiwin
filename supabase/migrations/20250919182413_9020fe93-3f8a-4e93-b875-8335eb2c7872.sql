-- Drop the conflicting categories table and fix the schema to use existing life_categories

-- Drop tables that reference categories first
DROP TABLE IF EXISTS user_category_settings CASCADE;
DROP TABLE IF EXISTS coach_subscriptions CASCADE; 
DROP TABLE IF EXISTS coaches CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Recreate coaches table using existing life_categories
CREATE TABLE IF NOT EXISTS coaches (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references life_categories(id) on delete cascade,
  type coach_type not null default 'ai'::coach_type,
  name text not null,          -- internal key
  display_name text not null,  -- UI label  
  avatar_url text,
  price_cents int default 0,
  is_default boolean default false,
  is_active boolean default true,
  unique (category_id, name)
);

-- Coach subscriptions (unchanged)
CREATE TABLE IF NOT EXISTS coach_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references coaches(id) on delete cascade,
  status subscription_status not null default 'active'::subscription_status,
  starts_at timestamptz default now(),
  ends_at timestamptz
);

-- User category settings using existing life_categories
CREATE TABLE IF NOT EXISTS user_category_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references life_categories(id) on delete cascade,
  selected_coach_id uuid references coaches(id) on delete set null,
  is_enabled boolean not null default true,
  priority_rank int default 100,    -- lower = earlier in nav
  nav_pinned boolean default true,
  unique (user_id, category_id)
);

-- RLS policies  
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_category_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS coach_read ON coaches;
CREATE POLICY coach_read ON coaches FOR SELECT USING (true);

DROP POLICY IF EXISTS subs_rw ON coach_subscriptions;
CREATE POLICY subs_rw ON coach_subscriptions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS ucs_rw ON user_category_settings;
CREATE POLICY ucs_rw ON user_category_settings
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Seed default AI coaches using existing life_categories
INSERT INTO coaches (category_id, type, name, display_name, is_default, is_active)
SELECT id, 'ai'::coach_type, 'bro_default', 'Bro — Health Coach', true, true 
FROM life_categories WHERE slug='health'
UNION ALL
SELECT id, 'ai'::coach_type, 'wealth_default', 'Wealth Coach', true, true 
FROM life_categories WHERE slug='wealth'
UNION ALL
SELECT id, 'ai'::coach_type, 'mind_default', 'Mind Coach', true, true 
FROM life_categories WHERE slug='mind'
UNION ALL
SELECT id, 'ai'::coach_type, 'purpose_default', 'Purpose Coach', true, true 
FROM life_categories WHERE slug='purpose'
UNION ALL
SELECT id, 'ai'::coach_type, 'rel_default', 'Relationships Coach', true, true 
FROM life_categories WHERE slug='relationships'
UNION ALL
SELECT id, 'ai'::coach_type, 'lifestyle_default', 'Lifestyle Coach', true, true 
FROM life_categories WHERE slug='lifestyle'
ON CONFLICT DO NOTHING;

-- Update helper function to use existing life_categories structure
CREATE OR REPLACE FUNCTION app.user_bottom_nav(u uuid)
RETURNS TABLE (
  slot int,
  item_type text,
  label text,
  slug text,
  icon text
)
LANGUAGE sql STABLE AS $$
WITH dyn AS (
  SELECT
    row_number() OVER (
      ORDER BY ucs.priority_rank ASC, lc.display_order ASC, lc.slug ASC
    ) AS rn,
    'category'::text AS item_type,
    lc.slug AS label,  -- Use slug as label for now
    lc.slug AS slug,
    COALESCE(lc.icon, '📊') AS icon
  FROM user_category_settings ucs
  JOIN life_categories lc ON lc.id = ucs.category_id
  LEFT JOIN coach_subscriptions cs
    ON cs.user_id = ucs.user_id
   AND cs.coach_id = COALESCE(ucs.selected_coach_id,
                               (SELECT id FROM coaches WHERE category_id = lc.id AND is_default LIMIT 1))
   AND cs.status = 'active'::subscription_status
  WHERE ucs.user_id = u
    AND ucs.is_enabled IS true
    AND ucs.nav_pinned IS true
    -- require either no specific coach selected OR an active sub for the selected coach
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