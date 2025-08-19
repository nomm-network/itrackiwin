-- Populate category translations for all existing categories
INSERT INTO public.life_category_translations (category_id, language_code, name, description)
SELECT 
    id,
    'en',
    name,
    CASE 
        WHEN name = 'Health' THEN 'Physical and mental wellbeing'
        WHEN name = 'Wealth' THEN 'Financial prosperity and security'
        WHEN name = 'Relationships' THEN 'Personal and social connections'
        WHEN name = 'Mind & Emotions' THEN 'Mental health and emotional intelligence'
        WHEN name = 'Purpose & Growth' THEN 'Personal development and life purpose'
        WHEN name = 'Lifestyle' THEN 'Life balance and sustainable habits'
        ELSE 'Life category'
    END
FROM public.life_categories
ON CONFLICT (category_id, language_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Spanish translations
INSERT INTO public.life_category_translations (category_id, language_code, name, description)
SELECT 
    id,
    'es',
    CASE 
        WHEN name = 'Health' THEN 'Salud'
        WHEN name = 'Wealth' THEN 'Riqueza'
        WHEN name = 'Relationships' THEN 'Relaciones'
        WHEN name = 'Mind & Emotions' THEN 'Mente y Emociones'
        WHEN name = 'Purpose & Growth' THEN 'Propósito y Crecimiento'
        WHEN name = 'Lifestyle' THEN 'Estilo de Vida'
        ELSE name
    END,
    CASE 
        WHEN name = 'Health' THEN 'Bienestar físico y mental'
        WHEN name = 'Wealth' THEN 'Prosperidad financiera y seguridad'
        WHEN name = 'Relationships' THEN 'Conexiones personales y sociales'
        WHEN name = 'Mind & Emotions' THEN 'Salud mental e inteligencia emocional'
        WHEN name = 'Purpose & Growth' THEN 'Desarrollo personal y propósito de vida'
        WHEN name = 'Lifestyle' THEN 'Equilibrio de vida y hábitos sostenibles'
        ELSE 'Categoría de vida'
    END
FROM public.life_categories
ON CONFLICT (category_id, language_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Romanian translations
INSERT INTO public.life_category_translations (category_id, language_code, name, description)
SELECT 
    id,
    'ro',
    CASE 
        WHEN name = 'Health' THEN 'Sănătate'
        WHEN name = 'Wealth' THEN 'Avuție'
        WHEN name = 'Relationships' THEN 'Relații'
        WHEN name = 'Mind & Emotions' THEN 'Minte și Emoții'
        WHEN name = 'Purpose & Growth' THEN 'Scop și Creștere'
        WHEN name = 'Lifestyle' THEN 'Stil de Viață'
        ELSE name
    END,
    CASE 
        WHEN name = 'Health' THEN 'Bunăstare fizică și mentală'
        WHEN name = 'Wealth' THEN 'Prosperitate financiară și securitate'
        WHEN name = 'Relationships' THEN 'Conexiuni personale și sociale'
        WHEN name = 'Mind & Emotions' THEN 'Sănătate mentală și inteligență emotională'
        WHEN name = 'Purpose & Growth' THEN 'Dezvoltare personală și scopul vieții'
        WHEN name = 'Lifestyle' THEN 'Echilibrul vieții și obiceiuri durabile'
        ELSE 'Categorie de viață'
    END
FROM public.life_categories
ON CONFLICT (category_id, language_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;