-- Add Romanian translations for the three new exercises

INSERT INTO exercises_translations (
  exercise_id,
  language_code,
  name,
  description
) VALUES 
-- Romanian translations
(
  (SELECT id FROM exercises WHERE slug = 'leg-extension-machine'),
  'ro',
  'Extensie Picioare',
  'Exercițiu de izolare executat pe aparatul de extensie pentru picioare pentru a viza mușchii cvadricepși. Șezi pe aparat cu spatele sprijinit de pernă și întinde picioarele pentru a ridica greutatea.'
),
(
  (SELECT id FROM exercises WHERE slug = 'dumbbell-cuban-press'),
  'ro',
  'Presă Cubană cu Haltere',
  'Exercițiu avansat pentru umeri care combină rotația externă cu presa deasupra capului. Excelent pentru întărirea manșetei rotatorilor și stabilitatea umerilor.'
),
(
  (SELECT id FROM exercises WHERE slug = 'dumbbell-rear-delt-fly'),
  'ro',
  'Fluturări Deltoid Posterior cu Haltere',
  'Exercițiu de izolare care vizează deltoidul posterior și partea superioară a spatelui. Se execută prin încovoierea înainte și ridicarea halterelor lateral cu brațele întinse.'
)
ON CONFLICT (exercise_id, language_code) DO NOTHING;