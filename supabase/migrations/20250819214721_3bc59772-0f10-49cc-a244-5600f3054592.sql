-- Populate subcategory translations for all existing subcategories
INSERT INTO public.life_subcategory_translations (subcategory_id, language_code, name, description)
SELECT 
    id,
    'en',
    name,
    'Life area subcategory'
FROM public.life_subcategories
ON CONFLICT (subcategory_id, language_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Spanish translations for subcategories
INSERT INTO public.life_subcategory_translations (subcategory_id, language_code, name, description)
SELECT 
    id,
    'es',
    CASE 
        WHEN name = 'Career purpose or calling' THEN 'Propósito profesional o vocación'
        WHEN name = 'Family relationships' THEN 'Relaciones familiares'
        WHEN name = 'Fitness & exercise' THEN 'Ejercicio y fitness'
        WHEN name = 'Fun, travel & leisure' THEN 'Diversión, viajes y ocio'
        WHEN name = 'Income & career growth' THEN 'Ingresos y crecimiento profesional'
        WHEN name = 'Stress management' THEN 'Manejo del estrés'
        WHEN name = 'Environment & home organization' THEN 'Ambiente y organización del hogar'
        WHEN name = 'Mindfulness & meditation' THEN 'Atención plena y meditación'
        WHEN name = 'Nutrition & hydration' THEN 'Nutrición e hidratación'
        WHEN name = 'Romantic life' THEN 'Vida romántica'
        WHEN name = 'Saving & investing' THEN 'Ahorro e inversión'
        WHEN name = 'Skill development' THEN 'Desarrollo de habilidades'
        WHEN name = 'Budgeting & debt management' THEN 'Presupuesto y manejo de deudas'
        WHEN name = 'Friendships' THEN 'Amistades'
        WHEN name = 'Hobbies & creativity' THEN 'Pasatiempos y creatividad'
        WHEN name = 'Minimalism & sustainability' THEN 'Minimalismo y sostenibilidad'
        WHEN name = 'Self-awareness' THEN 'Autoconciencia'
        WHEN name = 'Sleep quality' THEN 'Calidad del sueño'
        WHEN name = 'Community & social skills' THEN 'Comunidad y habilidades sociales'
        WHEN name = 'Continuous learning' THEN 'Aprendizaje continuo'
        WHEN name = 'Emotional regulation' THEN 'Regulación emocional'
        WHEN name = 'Financial education' THEN 'Educación financiera'
        WHEN name = 'Medical check-ups & prevention' THEN 'Chequeos médicos y prevención'
        WHEN name = 'Volunteering & giving back' THEN 'Voluntariado y retribución'
        WHEN name = 'Energy levels' THEN 'Niveles de energía'
        WHEN name = 'Legacy projects' THEN 'Proyectos de legado'
        WHEN name = 'Long-term wealth building' THEN 'Construcción de riqueza a largo plazo'
        WHEN name = 'Networking & collaboration' THEN 'Networking y colaboración'
        WHEN name = 'Setting & achieving goals' THEN 'Establecer y lograr objetivos'
        WHEN name = 'Therapy & mental health practices' THEN 'Terapia y prácticas de salud mental'
        ELSE name
    END,
    'Subcategoría de área de vida'
FROM public.life_subcategories
ON CONFLICT (subcategory_id, language_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;