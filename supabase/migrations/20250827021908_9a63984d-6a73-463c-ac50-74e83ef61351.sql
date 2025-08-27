-- Update existing equipment with load semantics and seed new ones
UPDATE equipment 
SET 
  load_type = 'dual_load',
  load_medium = 'bar', 
  default_bar_weight_kg = weight_kg,
  default_side_min_plate_kg = 1.25
WHERE kind = 'bar';

-- Add common barbell equipment with proper load semantics
INSERT INTO equipment (id, slug, kind, weight_kg, equipment_type, load_type, load_medium, default_bar_weight_kg, default_side_min_plate_kg)
VALUES
  (gen_random_uuid(), 'olympic_barbell_20', 'bar', 20.00, 'barbell', 'dual_load', 'bar', 20.00, 1.25),
  (gen_random_uuid(), 'olympic_barbell_15', 'bar', 15.00, 'barbell', 'dual_load', 'bar', 15.00, 1.25),
  (gen_random_uuid(), 'ez_curl_bar', 'bar', 10.00, 'barbell', 'dual_load', 'bar', 10.00, 1.25),
  (gen_random_uuid(), 'trap_bar', 'bar', 25.00, 'barbell', 'dual_load', 'bar', 25.00, 1.25),
  (gen_random_uuid(), 'safety_squat_bar', 'bar', 22.00, 'barbell', 'dual_load', 'bar', 22.00, 1.25)
ON CONFLICT (slug) DO UPDATE SET
  load_type = EXCLUDED.load_type,
  load_medium = EXCLUDED.load_medium,
  default_bar_weight_kg = EXCLUDED.default_bar_weight_kg,
  default_side_min_plate_kg = EXCLUDED.default_side_min_plate_kg;

-- Add equipment translations for the new bars
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT e.id, 'en', 
  CASE e.slug
    WHEN 'olympic_barbell_20' THEN 'Olympic Barbell 20kg'
    WHEN 'olympic_barbell_15' THEN 'Women''s Olympic Barbell 15kg'
    WHEN 'ez_curl_bar' THEN 'EZ Curl Bar 10kg'
    WHEN 'trap_bar' THEN 'Trap/Hex Bar 25kg'
    WHEN 'safety_squat_bar' THEN 'Safety Squat Bar 22kg'
  END,
  CASE e.slug
    WHEN 'olympic_barbell_20' THEN 'Standard 20kg Olympic barbell for most compound lifts'
    WHEN 'olympic_barbell_15' THEN 'Lighter 15kg Olympic barbell, often preferred by women'
    WHEN 'ez_curl_bar' THEN 'Curved bar designed for bicep curls and tricep extensions'
    WHEN 'trap_bar' THEN 'Hexagonal bar for deadlifts and farmer walks'
    WHEN 'safety_squat_bar' THEN 'Specialized squat bar with built-in handles'
  END
FROM equipment e
WHERE e.slug IN ('olympic_barbell_20', 'olympic_barbell_15', 'ez_curl_bar', 'trap_bar', 'safety_squat_bar')
ON CONFLICT (equipment_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Add some example plate-loaded and stack machines
INSERT INTO equipment (id, slug, equipment_type, load_type, load_medium, default_side_min_plate_kg, default_single_min_increment_kg)
VALUES
  (gen_random_uuid(), 'plate_loaded_chest_press', 'machine', 'dual_load', 'plates', 1.25, NULL),
  (gen_random_uuid(), 'plate_loaded_row', 'machine', 'dual_load', 'plates', 1.25, NULL),
  (gen_random_uuid(), 'lat_pulldown_stack', 'machine', 'stack', 'stack', NULL, 2.5),
  (gen_random_uuid(), 'cable_crossover_stack', 'machine', 'stack', 'stack', NULL, 2.5),
  (gen_random_uuid(), 'leg_press_single', 'machine', 'single_load', 'plates', NULL, 2.5)
ON CONFLICT (slug) DO UPDATE SET
  load_type = EXCLUDED.load_type,
  load_medium = EXCLUDED.load_medium,
  default_side_min_plate_kg = EXCLUDED.default_side_min_plate_kg,
  default_single_min_increment_kg = EXCLUDED.default_single_min_increment_kg;

-- Add translations for new machines
INSERT INTO equipment_translations (equipment_id, language_code, name, description)
SELECT e.id, 'en', 
  CASE e.slug
    WHEN 'plate_loaded_chest_press' THEN 'Plate-Loaded Chest Press'
    WHEN 'plate_loaded_row' THEN 'Plate-Loaded Row'
    WHEN 'lat_pulldown_stack' THEN 'Lat Pulldown (Stack)'
    WHEN 'cable_crossover_stack' THEN 'Cable Crossover (Stack)'
    WHEN 'leg_press_single' THEN 'Leg Press (Single Load)'
  END,
  CASE e.slug
    WHEN 'plate_loaded_chest_press' THEN 'Chest press machine loaded with plates on both sides'
    WHEN 'plate_loaded_row' THEN 'Rowing machine loaded with plates on both sides'
    WHEN 'lat_pulldown_stack' THEN 'Lat pulldown with weight stack and pin selection'
    WHEN 'cable_crossover_stack' THEN 'Cable machine with weight stack'
    WHEN 'leg_press_single' THEN 'Leg press with single loading point'
  END
FROM equipment e
WHERE e.slug IN ('plate_loaded_chest_press', 'plate_loaded_row', 'lat_pulldown_stack', 'cable_crossover_stack', 'leg_press_single')
ON CONFLICT (equipment_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;