-- Romanian translations for subcategories
INSERT INTO public.life_subcategory_translations (subcategory_id, language_code, name, description)
SELECT 
    id,
    'ro',
    CASE 
        WHEN name = 'Career purpose or calling' THEN 'Scop profesional sau chemarea'
        WHEN name = 'Family relationships' THEN 'Relații familiale'
        WHEN name = 'Fitness & exercise' THEN 'Fitness și exerciții'
        WHEN name = 'Fun, travel & leisure' THEN 'Distracție, călătorii și timp liber'
        WHEN name = 'Income & career growth' THEN 'Venituri și creșterea carierei'
        WHEN name = 'Stress management' THEN 'Gestionarea stresului'
        WHEN name = 'Environment & home organization' THEN 'Mediul și organizarea casei'
        WHEN name = 'Mindfulness & meditation' THEN 'Mindfulness și meditație'
        WHEN name = 'Nutrition & hydration' THEN 'Nutriție și hidratare'
        WHEN name = 'Romantic life' THEN 'Viața romantică'
        WHEN name = 'Saving & investing' THEN 'Economii și investiții'
        WHEN name = 'Skill development' THEN 'Dezvoltarea abilităților'
        WHEN name = 'Budgeting & debt management' THEN 'Bugetare și gestionarea datoriilor'
        WHEN name = 'Friendships' THEN 'Prietenii'
        WHEN name = 'Hobbies & creativity' THEN 'Hobby-uri și creativitate'
        WHEN name = 'Minimalism & sustainability' THEN 'Minimalism și sustenabilitate'
        WHEN name = 'Self-awareness' THEN 'Autocunoaștere'
        WHEN name = 'Sleep quality' THEN 'Calitatea somnului'
        WHEN name = 'Community & social skills' THEN 'Comunitate și abilități sociale'
        WHEN name = 'Continuous learning' THEN 'Învățare continuă'
        WHEN name = 'Emotional regulation' THEN 'Reglarea emoțională'
        WHEN name = 'Financial education' THEN 'Educație financiară'
        WHEN name = 'Medical check-ups & prevention' THEN 'Controale medicale și prevenție'
        WHEN name = 'Volunteering & giving back' THEN 'Voluntariat și restituire'
        WHEN name = 'Energy levels' THEN 'Niveluri de energie'
        WHEN name = 'Legacy projects' THEN 'Proiecte de moștenire'
        WHEN name = 'Long-term wealth building' THEN 'Construirea avuției pe termen lung'
        WHEN name = 'Networking & collaboration' THEN 'Networking și colaborare'
        WHEN name = 'Setting & achieving goals' THEN 'Stabilirea și atingerea obiectivelor'
        WHEN name = 'Therapy & mental health practices' THEN 'Terapie și practici de sănătate mentală'
        ELSE name
    END,
    'Subcategorie de zonă de viață'
FROM public.life_subcategories
ON CONFLICT (subcategory_id, language_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;