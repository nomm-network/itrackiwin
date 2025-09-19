-- Add a test mentor coach for Health category to test the subscription gating
INSERT INTO coaches (category_id, type, name, display_name, price_cents, is_default, is_active)
SELECT 
  id as category_id, 
  'human' as type, 
  'premium_health_mentor' as name, 
  'Dr. Sarah - Premium Health Mentor' as display_name, 
  2999 as price_cents, -- $29.99/month
  false as is_default, 
  true as is_active
FROM life_categories 
WHERE slug = 'health'
ON CONFLICT (category_id, name) DO NOTHING;

-- Add another test mentor coach for Wealth category
INSERT INTO coaches (category_id, type, name, display_name, price_cents, is_default, is_active)
SELECT 
  id as category_id, 
  'human' as type, 
  'wealth_expert' as name, 
  'Mike - Wealth Building Expert' as display_name, 
  3999 as price_cents, -- $39.99/month
  false as is_default, 
  true as is_active
FROM life_categories 
WHERE slug = 'wealth'
ON CONFLICT (category_id, name) DO NOTHING;