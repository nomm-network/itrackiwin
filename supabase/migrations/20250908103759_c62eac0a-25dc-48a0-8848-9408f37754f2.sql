-- Create v_health_subs view for Health hub + subcategories in UI order
CREATE OR REPLACE VIEW public.v_health_subs AS
SELECT
  p.id   AS hub_id,
  p.slug AS hub_slug,                         -- 'health'
  COALESCE(pt.name, p.name, 'Health') AS hub_label,
  s.id   AS sub_id,
  s.slug AS sub_slug,                         -- e.g. 'fitness-exercise'
  COALESCE(st.name,
           INITCAP(REPLACE(s.slug, '-', ' '))) AS sub_label, -- 'Fitness Exercise' fallback
  s.display_order
FROM life_categories p
JOIN life_subcategories s ON s.category_id = p.id
LEFT JOIN life_category_translations pt ON pt.category_id = p.id AND pt.language_code = 'en'
LEFT JOIN life_subcategory_translations st ON st.subcategory_id = s.id AND st.language_code = 'en'
WHERE p.slug = 'health'
ORDER BY s.display_order NULLS LAST, s.created_at;