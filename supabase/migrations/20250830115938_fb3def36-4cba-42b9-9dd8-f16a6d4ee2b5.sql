-- Step 1: Rename movement_translations to movements_translations for consistency
ALTER TABLE movement_translations RENAME TO movements_translations;

-- Step 2: Update foreign key column name for consistency  
ALTER TABLE movements_translations RENAME COLUMN movement_id TO movement_id;

-- Step 3: Add some sample translations for movements if the table is empty
-- First check and add English translations for existing movements
INSERT INTO movements_translations (movement_id, language_code, name, description)
SELECT 
  m.id,
  'en' as language_code,
  CASE 
    WHEN m.slug = 'chest-press' THEN 'Chest Press'
    WHEN m.slug = 'lat-pulldown' THEN 'Lat Pulldown'
    WHEN m.slug = 'shoulder-press' THEN 'Shoulder Press'
    WHEN m.slug = 'leg-press' THEN 'Leg Press'
    WHEN m.slug = 'bicep-curl' THEN 'Bicep Curl'
    WHEN m.slug = 'tricep-extension' THEN 'Tricep Extension'
    WHEN m.slug = 'squat' THEN 'Squat'
    WHEN m.slug = 'deadlift' THEN 'Deadlift'
    WHEN m.slug = 'bench-press' THEN 'Bench Press'
    WHEN m.slug = 'row' THEN 'Row'
    ELSE INITCAP(REPLACE(m.slug, '-', ' '))
  END as name,
  CASE 
    WHEN m.slug = 'chest-press' THEN 'A pushing movement targeting the chest muscles'
    WHEN m.slug = 'lat-pulldown' THEN 'A pulling movement targeting the latissimus dorsi'
    WHEN m.slug = 'shoulder-press' THEN 'An overhead pressing movement for shoulders'
    WHEN m.slug = 'leg-press' THEN 'A leg pushing movement targeting quads and glutes'
    WHEN m.slug = 'bicep-curl' THEN 'An arm flexion movement targeting biceps'
    WHEN m.slug = 'tricep-extension' THEN 'An arm extension movement targeting triceps'
    WHEN m.slug = 'squat' THEN 'A compound leg movement involving knee and hip flexion'
    WHEN m.slug = 'deadlift' THEN 'A hip hinge movement lifting weight from the ground'
    WHEN m.slug = 'bench-press' THEN 'A horizontal pressing movement targeting chest'
    WHEN m.slug = 'row' THEN 'A horizontal pulling movement targeting back muscles'
    ELSE 'A movement exercise'
  END as description
FROM movements m
WHERE NOT EXISTS (
  SELECT 1 FROM movements_translations mt 
  WHERE mt.movement_id = m.id AND mt.language_code = 'en'
);

-- Add Romanian translations for movements
INSERT INTO movements_translations (movement_id, language_code, name, description)
SELECT 
  m.id,
  'ro' as language_code,
  CASE 
    WHEN m.slug = 'chest-press' THEN 'Împingeri Piept'
    WHEN m.slug = 'lat-pulldown' THEN 'Trageri Lat'
    WHEN m.slug = 'shoulder-press' THEN 'Împingeri Umeri'
    WHEN m.slug = 'leg-press' THEN 'Împingeri Picioare'
    WHEN m.slug = 'bicep-curl' THEN 'Flexii Biceps'
    WHEN m.slug = 'tricep-extension' THEN 'Extensii Triceps'
    WHEN m.slug = 'squat' THEN 'Genuflexiuni'
    WHEN m.slug = 'deadlift' THEN 'Ridicări de la Sol'
    WHEN m.slug = 'bench-press' THEN 'Împingeri la Bancă'
    WHEN m.slug = 'row' THEN 'Vâsliri'
    ELSE INITCAP(REPLACE(m.slug, '-', ' '))
  END as name,
  CASE 
    WHEN m.slug = 'chest-press' THEN 'O mișcare de împingere ce vizează mușchii pieptului'
    WHEN m.slug = 'lat-pulldown' THEN 'O mișcare de tragere ce vizează latissimus dorsi'
    WHEN m.slug = 'shoulder-press' THEN 'O mișcare de împingere deasupra capului pentru umeri'
    WHEN m.slug = 'leg-press' THEN 'O mișcare de împingere cu picioarele ce vizează cvadricepsul și fesele'
    WHEN m.slug = 'bicep-curl' THEN 'O mișcare de flexie a brațului ce vizează bicepsul'
    WHEN m.slug = 'tricep-extension' THEN 'O mișcare de extensie a brațului ce vizează tricepsul'
    WHEN m.slug = 'squat' THEN 'O mișcare compusă a picioarelor cu flexia genunchilor și șoldurilor'
    WHEN m.slug = 'deadlift' THEN 'O mișcare de balansare a șoldurilor ridicând greutatea de la sol'
    WHEN m.slug = 'bench-press' THEN 'O mișcare de împingere orizontală ce vizează pieptul'
    WHEN m.slug = 'row' THEN 'O mișcare de tragere orizontală ce vizează mușchii spatelui'
    ELSE 'Un exercițiu de mișcare'
  END as description
FROM movements m
WHERE NOT EXISTS (
  SELECT 1 FROM movements_translations mt 
  WHERE mt.movement_id = m.id AND mt.language_code = 'ro'
);

-- Step 4: Add sample translations for movement patterns if missing
-- English translations for movement patterns
INSERT INTO movement_patterns_translations (movement_pattern_id, language_code, name, description)
SELECT 
  mp.id,
  'en' as language_code,
  CASE 
    WHEN mp.slug = 'push' THEN 'Push'
    WHEN mp.slug = 'pull' THEN 'Pull'
    WHEN mp.slug = 'squat' THEN 'Squat Pattern'
    WHEN mp.slug = 'hinge' THEN 'Hip Hinge'
    WHEN mp.slug = 'lunge' THEN 'Lunge'
    WHEN mp.slug = 'carry' THEN 'Carry'
    WHEN mp.slug = 'rotation' THEN 'Rotation'
    WHEN mp.slug = 'isolation' THEN 'Isolation'
    ELSE INITCAP(REPLACE(mp.slug, '-', ' '))
  END as name,
  CASE 
    WHEN mp.slug = 'push' THEN 'Movements that involve pushing weight away from the body'
    WHEN mp.slug = 'pull' THEN 'Movements that involve pulling weight toward the body'
    WHEN mp.slug = 'squat' THEN 'Knee-dominant movements with hip and knee flexion'
    WHEN mp.slug = 'hinge' THEN 'Hip-dominant movements with hip flexion and extension'
    WHEN mp.slug = 'lunge' THEN 'Single-leg or split-stance movements'
    WHEN mp.slug = 'carry' THEN 'Movements involving carrying or supporting load while moving'
    WHEN mp.slug = 'rotation' THEN 'Movements involving rotation or anti-rotation of the torso'
    WHEN mp.slug = 'isolation' THEN 'Single-joint movements targeting specific muscles'
    ELSE 'A fundamental movement pattern'
  END as description
FROM movement_patterns mp
WHERE NOT EXISTS (
  SELECT 1 FROM movement_patterns_translations mpt 
  WHERE mpt.movement_pattern_id = mp.id AND mpt.language_code = 'en'
);

-- Romanian translations for movement patterns
INSERT INTO movement_patterns_translations (movement_pattern_id, language_code, name, description)
SELECT 
  mp.id,
  'ro' as language_code,
  CASE 
    WHEN mp.slug = 'push' THEN 'Împingere'
    WHEN mp.slug = 'pull' THEN 'Tragere'
    WHEN mp.slug = 'squat' THEN 'Model Genuflexiune'
    WHEN mp.slug = 'hinge' THEN 'Balansare Șold'
    WHEN mp.slug = 'lunge' THEN 'Afund'
    WHEN mp.slug = 'carry' THEN 'Transport'
    WHEN mp.slug = 'rotation' THEN 'Rotație'
    WHEN mp.slug = 'isolation' THEN 'Izolare'
    ELSE INITCAP(REPLACE(mp.slug, '-', ' '))
  END as name,
  CASE 
    WHEN mp.slug = 'push' THEN 'Mișcări care implică împingerea greutății departe de corp'
    WHEN mp.slug = 'pull' THEN 'Mișcări care implică tragerea greutății către corp'
    WHEN mp.slug = 'squat' THEN 'Mișcări dominante pe genunchi cu flexia șoldurilor și genunchilor'
    WHEN mp.slug = 'hinge' THEN 'Mișcări dominante pe șold cu flexia și extensia șoldurilor'
    WHEN mp.slug = 'lunge' THEN 'Mișcări pe un picior sau în poziție divizată'
    WHEN mp.slug = 'carry' THEN 'Mișcări care implică transportul sau susținerea unei sarcini în timpul deplasării'
    WHEN mp.slug = 'rotation' THEN 'Mișcări care implică rotația sau anti-rotația trunchiului'
    WHEN mp.slug = 'isolation' THEN 'Mișcări cu o singură articulație ce vizează mușchi specifici'
    ELSE 'Un model fundamental de mișcare'
  END as description
FROM movement_patterns mp
WHERE NOT EXISTS (
  SELECT 1 FROM movement_patterns_translations mpt 
  WHERE mpt.movement_pattern_id = mp.id AND mpt.language_code = 'ro'
);