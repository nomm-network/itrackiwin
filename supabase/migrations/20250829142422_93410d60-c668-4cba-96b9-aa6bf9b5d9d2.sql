-- Create comprehensive English and Romanian translations for all equipment items
WITH equipment_translations_data AS (
  SELECT unnest(ARRAY[
    'ab-crunch-machine', 'Ab Crunch Machine', 'Machine for targeted abdominal crunches', 'Mașina de Crunch Abdominal', 'Mașină pentru crunch-uri abdominale țintite',
    'abductor-machine', 'Abductor Machine', 'Machine for hip abduction exercises', 'Mașina de Abducție', 'Mașină pentru exerciții de abducție șoldului',
    'adductor-machine', 'Adductor Machine', 'Machine for hip adduction exercises', 'Mașina de Aducție', 'Mașină pentru exerciții de aducție șoldului',
    'cable-machine', 'Cable Machine', 'Adjustable cable pulley system', 'Mașina cu Cablu', 'Sistem de scripete cu cablu reglabil',
    'calf-raise-machine', 'Calf Raise Machine', 'Machine for calf muscle training', 'Mașina pentru Gambe', 'Mașină pentru antrenarea mușchilor gambei',
    'chains', 'Chains', 'Heavy chains for variable resistance training', 'Lanțuri', 'Lanțuri grele pentru antrenament cu rezistență variabilă',
    'chest-press-machine', 'Chest Press Machine', 'Machine for chest pressing movements', 'Mașina de Presa Piept', 'Mașină pentru mișcări de presă la piept',
    'decline-bench', 'Decline Bench', 'Declined bench for decline pressing', 'Bancă Declinată', 'Bancă declinată pentru presă în declin',
    'dip-bars', 'Dip Bars', 'Parallel bars for dip exercises', 'Bare pentru Dips', 'Bare paralele pentru exerciții de dips',
    'dumbbell', 'Dumbbell', 'Adjustable or fixed weight dumbbell', 'Ganteră', 'Ganteră cu greutate reglabilă sau fixă',
    'elliptical', 'Elliptical', 'Elliptical trainer for cardio workouts', 'Eliptică', 'Antrenor eliptic pentru antrenament cardio',
    'ez-curl-bar', 'EZ Curl Bar', 'Angled barbell for bicep and tricep exercises', 'Bară EZ', 'Bară unghiulară pentru exerciții biceps și triceps',
    'fixed-barbell', 'Fixed Barbell', 'Pre-loaded fixed weight barbell', 'Bară Fixă', 'Bară cu greutate fixă pre-încărcată',
    'flat-bench', 'Flat Bench', 'Horizontal bench for pressing exercises', 'Bancă Plană', 'Bancă orizontală pentru exerciții de presă',
    'flywheel-trainer', 'Flywheel Trainer', 'Inertial flywheel training device', 'Antrenor cu Volant', 'Dispozitiv de antrenament cu volant inerțial',
    'glute-kickback-machine', 'Glute Kickback Machine', 'Machine for glute kickback exercises', 'Mașina pentru Fesieri', 'Mașină pentru exerciții de kickback pentru fesieri',
    'hack-squat-machine', 'Hack Squat Machine', 'Angled squat machine', 'Mașina Hack Squat', 'Mașină de squat unghiulară',
    'hip-thrust-machine', 'Hip Thrust Machine', 'Machine for hip thrust exercises', 'Mașina Hip Thrust', 'Mașină pentru exerciții de hip thrust',
    'hyperextension-bench', 'Hyperextension Bench', 'Bench for back hyperextension exercises', 'Bancă de Hiperextensie', 'Bancă pentru exerciții de hiperextensie a spatelui',
    'incline-bench', 'Incline Bench', 'Angled bench for incline pressing', 'Bancă Înclinată', 'Bancă unghiulară pentru presă în înclinare',
    'kettlebell', 'Kettlebell', 'Cast iron weight with handle for dynamic exercises', 'Kettlebell', 'Greutate din fontă cu mâner pentru exerciții dinamice',
    'lat-pulldown-machine', 'Lat Pulldown Machine', 'Machine for lat pulldown exercises', 'Mașina Lat Pulldown', 'Mașină pentru exerciții de lat pulldown',
    'leg-curl-machine', 'Leg Curl Machine', 'Machine for hamstring curl exercises', 'Mașina Leg Curl', 'Mașină pentru exerciții de curl la ischiogambieri',
    'leg-extension-machine', 'Leg Extension Machine', 'Machine for quadriceps extension exercises', 'Mașina Leg Extension', 'Mașină pentru exerciții de extensie la quadriceps',
    'leg-press-machine', 'Leg Press Machine', 'Machine for leg pressing exercises', 'Mașina Leg Press', 'Mașină pentru exerciții de presă la picioare',
    'olympic-barbell', 'Olympic Barbell', 'Standard 45lb/20kg Olympic barbell', 'Bară Olimpică', 'Bară olimpică standard de 45lb/20kg',
    'parallel-bars', 'Parallel Bars', 'Parallel bars for gymnastics exercises', 'Bare Paralele', 'Bare paralele pentru exerciții de gimnastică',
    'pec-deck-machine', 'Pec Deck Machine', 'Machine for chest fly exercises', 'Mașina Pec Deck', 'Mașină pentru exerciții de fluture la piept',
    'power-cage', 'Power Cage', 'Multi-station power cage with safety bars', 'Cușcă de Forță', 'Cușcă de forță multi-stație cu bare de siguranță',
    'pull-up-bar', 'Pull-up Bar', 'Overhead bar for pull-ups and chin-ups', 'Bară de Tracțiuni', 'Bară suspendată pentru tracțiuni și chin-ups',
    'push-up-bars', 'Push-up Bars', 'Handles for elevated push-up exercises', 'Bare pentru Flotări', 'Mânere pentru exerciții de flotări ridicate',
    'resistance-band', 'Resistance Band', 'Elastic band for resistance training', 'Bandă de Rezistență', 'Bandă elastică pentru antrenament de rezistență',
    'roman-chair', 'Roman Chair', 'Bench for core and back exercises', 'Scaunul Roman', 'Bancă pentru exerciții de core și spate',
    'rower', 'Rower', 'Rowing machine for cardio and strength', 'Aparat de Vâslit', 'Mașină de vâslit pentru cardio și forță',
    'sandbag', 'Sandbag', 'Weighted sandbag for functional training', 'Sac de Nisip', 'Sac cu nisip pentru antrenament funcțional',
    'seated-row-machine', 'Seated Row Machine', 'Cable machine for seated rowing', 'Mașina Seated Row', 'Mașină cu cablu pentru vâslit așezat',
    'shoulder-press-machine', 'Shoulder Press Machine', 'Machine for shoulder pressing exercises', 'Mașina de Presă Umeri', 'Mașină pentru exerciții de presă la umeri',
    'smith-machine', 'Smith Machine', 'Guided barbell machine with safety catches', 'Mașina Smith', 'Mașină cu bară ghidată cu sisteme de siguranță',
    'squat-rack', 'Squat Rack', 'Rack for squatting exercises', 'Rack pentru Squat', 'Rack pentru exerciții de squat',
    'stair-climber', 'Stair Climber', 'Machine simulating stair climbing', 'Simulator de Scări', 'Mașină care simulează urcatul scărilor',
    'stationary-bike', 'Stationary Bike', 'Exercise bike for cardio training', 'Bicicletă Staționară', 'Bicicletă de exerciții pentru antrenament cardio',
    'torso-rotation-machine', 'Torso Rotation Machine', 'Machine for core rotation exercises', 'Mașina de Rotație Trunchi', 'Mașină pentru exerciții de rotație a trunchiului',
    'trap-bar', 'Trap Bar', 'Hexagonal bar for deadlifts and shrugs', 'Bară Trap', 'Bară hexagonală pentru deadlift-uri și ridicări de umeri',
    'treadmill', 'Treadmill', 'Running machine for cardio exercise', 'Banda de Alergare', 'Mașină de alergare pentru exerciții cardio',
    'weight-plate', 'Weight Plate', 'Additional weight plates for barbells', 'Discuri de Greutate', 'Discuri de greutate suplimentare pentru bare'
  ]) AS vals
),
translations_parsed AS (
  SELECT 
    vals[1] as slug,
    vals[2] as name_en, 
    vals[3] as description_en,
    vals[4] as name_ro,
    vals[5] as description_ro
  FROM (
    SELECT ARRAY[vals[i:i+4]] as vals
    FROM equipment_translations_data, generate_series(1, array_length(vals, 1), 5) i
  ) sub
)
-- Insert English translations
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT e.id, 'en', tp.name_en, tp.description_en
FROM equipment e
JOIN translations_parsed tp ON e.slug = tp.slug
UNION ALL
-- Insert Romanian translations  
SELECT e.id, 'ro', tp.name_ro, tp.description_ro
FROM equipment e
JOIN translations_parsed tp ON e.slug = tp.slug
ON CONFLICT (equipment_id, language_code) DO UPDATE SET
name = EXCLUDED.name,
description = EXCLUDED.description;