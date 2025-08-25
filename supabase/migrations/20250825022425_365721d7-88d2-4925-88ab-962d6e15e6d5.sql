-- Create translations for all existing exercises (English and Romanian)
INSERT INTO public.exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'en',
  e.name,
  e.description
FROM public.exercises e
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises_translations et 
  WHERE et.exercise_id = e.id AND et.language_code = 'en'
);

-- Add Romanian translations
INSERT INTO public.exercises_translations (exercise_id, language_code, name, description)
SELECT 
  e.id,
  'ro',
  CASE e.name
    WHEN 'Back Squat' THEN 'Genuflexiuni cu Haltera'
    WHEN 'Barbell Bench Press' THEN 'Impins cu Haltera la Bancă'
    WHEN 'Barbell Curl' THEN 'Flexii cu Haltera'
    WHEN 'Barbell Row' THEN 'Tracțiuni cu Haltera'
    WHEN 'Barbell Shrug' THEN 'Ridicări de Umeri cu Haltera'
    WHEN 'Cable Crunch' THEN 'Abdomene la Cablu'
    WHEN 'Cable Fly' THEN 'Fluturi la Cablu'
    WHEN 'Cable Glute Kickback' THEN 'Extensii Fesieri la Cablu'
    WHEN 'Dumbbell Bench Press' THEN 'Impins cu Gantere la Bancă'
    WHEN 'Dumbbell Curl' THEN 'Flexii cu Gantere'
    WHEN 'Dumbbell Lateral Raise' THEN 'Ridicări Laterale cu Gantere'
    WHEN 'Dumbbell Shoulder Press' THEN 'Impins cu Gantere la Umeri'
    WHEN 'Hammer Curl' THEN 'Flexii Ciocan'
    WHEN 'Hanging Leg Raise' THEN 'Ridicări Picioare Spânzurat'
    WHEN 'Hip Thrust' THEN 'Impingeri la Șold'
    WHEN 'Incline Dumbbell Press' THEN 'Impins cu Gantere Înclinat'
    WHEN 'Lat Pulldown' THEN 'Trageri la Latissimus'
    WHEN 'Leg Press' THEN 'Presa de Picioare'
    WHEN 'Lying Triceps Extension' THEN 'Extensii Triceps Culcat'
    WHEN 'Overhead Press' THEN 'Impins Vertical'
    WHEN 'Plank' THEN 'Planșa'
    WHEN 'Pull-Up' THEN 'Tracțiuni'
    WHEN 'Reverse Pec Deck' THEN 'Fluturi Posteriori'
    WHEN 'Romanian Deadlift' THEN 'Deadlift Românesc'
    WHEN 'Seated Cable Row' THEN 'Tracțiuni la Cablu Șezând'
    WHEN 'Seated Calf Raise' THEN 'Ridicări Gambe Șezând'
    WHEN 'Seated Leg Curl' THEN 'Flexii Picioare Șezând'
    WHEN 'Standing Calf Raise' THEN 'Ridicări Gambe în Picioare'
    WHEN 'Triceps Pushdown' THEN 'Extensii Triceps la Cablu'
    WHEN 'Wrist Curl' THEN 'Flexii Încheieturi'
    ELSE e.name
  END,
  NULL -- description for Romanian
FROM public.exercises e
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercises_translations et 
  WHERE et.exercise_id = e.id AND et.language_code = 'ro'
);