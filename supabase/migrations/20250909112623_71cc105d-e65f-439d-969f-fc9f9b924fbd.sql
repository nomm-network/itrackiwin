-- Add English and Romanian translations for the 16 exercises
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT e.id, 'en', translations.en_name, translations.en_description
FROM exercises e
CROSS JOIN (VALUES
  -- QUADRICEPS EXERCISES
  ('barbell-back-squat', 'Barbell Back Squat', 'A compound exercise targeting the quadriceps, glutes, and core using a barbell placed on the upper back.'),
  ('leg-press', 'Leg Press', 'A machine-based exercise that targets the quadriceps, glutes, and hamstrings with controlled movement.'),
  ('bulgarian-split-squat', 'Bulgarian Split Squat', 'A unilateral exercise targeting the quadriceps and glutes with one foot elevated behind.'),
  ('front-squat', 'Front Squat', 'A squat variation with the barbell held in front across the shoulders, emphasizing quadriceps development.'),
  
  -- CHEST EXERCISES
  ('barbell-bench-press', 'Barbell Bench Press', 'The classic compound exercise for chest, shoulders, and triceps using a barbell on a bench.'),
  ('dumbbell-bench-press', 'Dumbbell Bench Press', 'A chest exercise using dumbbells that allows for greater range of motion and unilateral training.'),
  ('incline-barbell-press', 'Incline Barbell Press', 'An inclined bench press variation that targets the upper chest and front deltoids.'),
  ('dips', 'Dips', 'A bodyweight exercise targeting the chest, triceps, and front deltoids using parallel bars or rings.'),
  
  -- SHOULDERS EXERCISES
  ('overhead-press', 'Overhead Press', 'A fundamental compound movement pressing a barbell overhead to develop shoulder and core strength.'),
  ('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'A shoulder exercise using dumbbells for independent arm movement and stability.'),
  ('lateral-raises', 'Lateral Raises', 'An isolation exercise targeting the medial deltoids by raising dumbbells to the sides.'),
  ('face-pulls', 'Face Pulls', 'A pulling exercise targeting the rear deltoids and upper back muscles for shoulder health.'),
  
  -- TRICEPS EXERCISES
  ('triceps-pushdown', 'Triceps Pushdown', 'An isolation exercise targeting the triceps using a cable machine with downward motion.'),
  ('close-grip-bench-press', 'Close Grip Bench Press', 'A bench press variation with hands closer together to emphasize triceps development.'),
  ('skull-crushers', 'Skull Crushers', 'A triceps isolation exercise performed lying down, lowering weight toward the forehead.'),
  ('overhead-tricep-extension', 'Overhead Tricep Extension', 'A triceps exercise performed overhead to target the long head of the triceps muscle.')
) AS translations(slug, en_name, en_description)
WHERE e.slug = translations.slug
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Add Romanian translations
INSERT INTO exercises_translations (exercise_id, language_code, name, description)
SELECT e.id, 'ro', translations.ro_name, translations.ro_description
FROM exercises e
CROSS JOIN (VALUES
  -- QUADRICEPS EXERCISES
  ('barbell-back-squat', 'Genuflexiuni cu Haltera pe Spate', 'Un exercițiu compus care vizează cvadricepsul, fesele și abdomenul folosind o halteră plasată pe partea superioară a spatelui.'),
  ('leg-press', 'Presa Picior', 'Un exercițiu bazat pe mașină care vizează cvadricepsul, fesele și bicepsul femural cu mișcare controlată.'),
  ('bulgarian-split-squat', 'Genuflexiuni Bulgărești', 'Un exercițiu unilateral care vizează cvadricepsul și fesele cu un picior ridicat în spate.'),
  ('front-squat', 'Genuflexiuni Frontale', 'O variantă de genuflexiuni cu haltera ținută în față peste umeri, punând accent pe dezvoltarea cvadricepsului.'),
  
  -- CHEST EXERCISES
  ('barbell-bench-press', 'Împins cu Haltera Culcat', 'Exercițiul clasic compus pentru piept, umeri și triceps folosind o halteră pe bancă.'),
  ('dumbbell-bench-press', 'Împins cu Gantere Culcat', 'Un exercițiu pentru piept folosind gantere care permite o amplitudine mai mare și antrenament unilateral.'),
  ('incline-barbell-press', 'Împins cu Haltera Inclinat', 'O variantă de împins pe bancă înclinată care vizează partea superioară a pieptului și deltoidele anterioare.'),
  ('dips', 'Flotări la Paralele', 'Un exercițiu cu greutatea corporală care vizează pieptul, tricepsul și deltoidele anterioare folosind bare paralele.'),
  
  -- SHOULDERS EXERCISES
  ('overhead-press', 'Împins Deasupra Capului', 'O mișcare compusă fundamentală care împinge haltera deasupra capului pentru a dezvolta forța umerilor și abdomenului.'),
  ('dumbbell-shoulder-press', 'Împins Umeri cu Gantere', 'Un exercițiu pentru umeri folosind gantere pentru mișcare independentă a brațelor și stabilitate.'),
  ('lateral-raises', 'Ridicări Laterale', 'Un exercițiu de izolare care vizează deltoidele mediale prin ridicarea ganterelor lateral.'),
  ('face-pulls', 'Trageri la Față', 'Un exercițiu de tragere care vizează deltoidele posterioare și mușchii spatelui superior pentru sănătatea umerilor.'),
  
  -- TRICEPS EXERCISES
  ('triceps-pushdown', 'Extensii Triceps la Cablu', 'Un exercițiu de izolare care vizează tricepsul folosind o mașină cu cablu cu mișcare descendentă.'),
  ('close-grip-bench-press', 'Împins Priză Strânsă', 'O variantă de împins pe bancă cu mâinile mai aproape pentru a pune accent pe dezvoltarea tricepsului.'),
  ('skull-crushers', 'Spărgătoare de Cranii', 'Un exercițiu de izolare pentru triceps executat culcat, coborând greutatea spre frunte.'),
  ('overhead-tricep-extension', 'Extensii Triceps Deasupra Capului', 'Un exercițiu pentru triceps executat deasupra capului pentru a viza capul lung al mușchiului triceps.')
) AS translations(slug, ro_name, ro_description)
WHERE e.slug = translations.slug
ON CONFLICT (exercise_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Verify translations were added
SELECT 
  e.slug,
  en.name as english_name,
  ro.name as romanian_name
FROM exercises e
LEFT JOIN exercises_translations en ON en.exercise_id = e.id AND en.language_code = 'en'
LEFT JOIN exercises_translations ro ON ro.exercise_id = e.id AND ro.language_code = 'ro'
WHERE e.slug IN (
  'barbell-back-squat', 'leg-press', 'bulgarian-split-squat', 'front-squat',
  'barbell-bench-press', 'dumbbell-bench-press', 'incline-barbell-press', 'dips',
  'overhead-press', 'dumbbell-shoulder-press', 'lateral-raises', 'face-pulls',
  'triceps-pushdown', 'close-grip-bench-press', 'skull-crushers', 'overhead-tricep-extension'
)
ORDER BY e.slug;