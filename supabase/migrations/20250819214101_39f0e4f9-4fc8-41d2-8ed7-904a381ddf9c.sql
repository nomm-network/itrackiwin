-- Insert initial translations for categories (assuming "Health" category exists)
DO $$
DECLARE
    health_id uuid;
BEGIN
    -- Get the health category ID
    SELECT id INTO health_id FROM public.life_categories WHERE slug = 'health' OR name ILIKE '%health%' LIMIT 1;
    
    IF health_id IS NOT NULL THEN
        -- Insert translations for Health category
        INSERT INTO public.life_category_translations (category_id, language_code, name, description)
        VALUES 
            (health_id, 'en', 'Health', 'Physical and mental wellbeing'),
            (health_id, 'es', 'Salud', 'Bienestar físico y mental'),
            (health_id, 'ro', 'Sănătate', 'Bunăstare fizică și mentală')
        ON CONFLICT (category_id, language_code) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description;
    END IF;
END $$;

-- Insert some common UI text translations
INSERT INTO public.text_translations (key, language_code, value, context) VALUES
    ('common.loading', 'en', 'Loading...', 'General loading message'),
    ('common.loading', 'es', 'Cargando...', 'General loading message'),
    ('common.loading', 'ro', 'Se încarcă...', 'General loading message'),
    
    ('admin.dashboard', 'en', 'Dashboard', 'Admin dashboard'),
    ('admin.dashboard', 'es', 'Panel', 'Admin dashboard'),
    ('admin.dashboard', 'ro', 'Panou', 'Admin dashboard'),
    
    ('admin.categories', 'en', 'Categories', 'Categories section'),
    ('admin.categories', 'es', 'Categorías', 'Categories section'),
    ('admin.categories', 'ro', 'Categorii', 'Categories section'),
    
    ('admin.subcategories', 'en', 'Subcategories', 'Subcategories section'),
    ('admin.subcategories', 'es', 'Subcategorías', 'Subcategories section'),
    ('admin.subcategories', 'ro', 'Subcategorii', 'Subcategories section')
ON CONFLICT (key, language_code) DO UPDATE SET
    value = EXCLUDED.value,
    context = EXCLUDED.context;