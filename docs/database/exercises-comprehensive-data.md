# Exercise System Database - Complete Data Reference

## Exercise Tables with Sample Data

### Main Exercises Table
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  popularity_rank INTEGER,
  body_part_id UUID,
  primary_muscle_id UUID,
  equipment_id UUID NOT NULL,
  secondary_muscle_group_ids UUID[],
  default_grip_ids UUID[] DEFAULT '{}'::uuid[],
  capability_schema JSONB DEFAULT '{}'::jsonb,
  exercise_skill_level exercise_skill_level DEFAULT 'medium',
  complexity_score SMALLINT DEFAULT 3,
  contraindications JSONB DEFAULT '[]'::jsonb,
  default_bar_weight NUMERIC,
  default_handle_ids UUID[],
  is_bar_loaded BOOLEAN NOT NULL DEFAULT false,
  load_type load_type,
  default_bar_type_id UUID,
  requires_handle BOOLEAN DEFAULT false,
  allows_grips BOOLEAN DEFAULT true,
  is_unilateral BOOLEAN DEFAULT false,
  slug TEXT NOT NULL,
  loading_hint TEXT,
  source_url TEXT,
  thumbnail_url TEXT,
  image_url TEXT
);
```

#### Sample Exercises Data
```sql
INSERT INTO exercises (id, slug, is_public, popularity_rank, equipment_id, primary_muscle_id, body_part_id, exercise_skill_level, complexity_score, default_grip_ids, is_bar_loaded, load_type, allows_grips, is_unilateral) VALUES
('b0bb1fa8-83c4-4f39-a311-74f014d85bec', 'upper-chest-press-machine', true, 1, '5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0', '1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e', 'db555682-5959-4b63-9c75-078a5870390e', 'medium', 3, '{"38571da9-3843-4004-b0e5-dee9c953bde1","3f119821-a26d-43c9-ac19-1746f286862f"}', false, 'stack', true, false),
('ex_bench_press', 'barbell-bench-press', true, 2, 'eq_barbell', 'muscle_chest', 'bp_chest', 'medium', 4, '{"grip_overhand"}', true, 'dual_load', true, false),
('ex_squat', 'barbell-back-squat', true, 3, 'eq_barbell', 'muscle_quads', 'bp_legs', 'hard', 5, '{"grip_overhand"}', true, 'dual_load', false, false),
('ex_deadlift', 'barbell-deadlift', true, 4, 'eq_barbell', 'muscle_hamstrings', 'bp_legs', 'hard', 5, '{"grip_overhand","grip_mixed"}', true, 'dual_load', true, false),
('ex_overhead_press', 'overhead-press', true, 5, 'eq_barbell', 'muscle_shoulders', 'bp_shoulders', 'medium', 4, '{"grip_overhand"}', true, 'dual_load', false, false),
('ex_triceps_pushdown', 'triceps-pushdown', true, 6, 'eq_cable', 'muscle_triceps', 'bp_arms', 'easy', 2, '{"grip_overhand","grip_neutral"}', false, 'single_load', true, false);
```

### Exercise Translations
```sql
CREATE TABLE exercises_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### Sample Exercise Translations Data
```sql
INSERT INTO exercises_translations (id, exercise_id, language_code, name, description, created_at, updated_at) VALUES
('et_001', 'b0bb1fa8-83c4-4f39-a311-74f014d85bec', 'en', 'Upper Chest Press (Machine)', 'Machine press targeting the upper chest with neutral and overhand grips.', '2025-08-31 10:00:00', '2025-08-31 10:00:00'),
('et_002', 'ex_bench_press', 'en', 'Barbell Bench Press', 'Classic compound exercise for chest, shoulders, and triceps development.', '2025-08-31 10:00:00', '2025-08-31 10:00:00'),
('et_003', 'ex_squat', 'en', 'Barbell Back Squat', 'Fundamental lower body exercise targeting quads, glutes, and core.', '2025-08-31 10:00:00', '2025-08-31 10:00:00'),
('et_004', 'ex_deadlift', 'en', 'Barbell Deadlift', 'Full body compound movement emphasizing posterior chain development.', '2025-08-31 10:00:00', '2025-08-31 10:00:00'),
('et_005', 'ex_overhead_press', 'en', 'Overhead Press', 'Standing press for shoulder and core strength development.', '2025-08-31 10:00:00', '2025-08-31 10:00:00'),
('et_006', 'ex_triceps_pushdown', 'en', 'Triceps Pushdown', 'Isolation exercise targeting the triceps using cable resistance.', '2025-08-31 10:00:00', '2025-08-31 10:00:00');
```

### Equipment Table
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  load_type load_type DEFAULT 'none',
  default_stack JSONB DEFAULT '[]'::jsonb,
  weight_kg NUMERIC,
  load_medium load_medium DEFAULT 'other',
  default_bar_weight_kg NUMERIC,
  default_single_min_increment_kg NUMERIC,
  default_side_min_plate_kg NUMERIC,
  notes TEXT,
  slug TEXT,
  equipment_type TEXT NOT NULL DEFAULT 'machine',
  kind TEXT
);
```

#### Sample Equipment Data
```sql
INSERT INTO equipment (id, slug, equipment_type, load_type, load_medium, default_bar_weight_kg, default_single_min_increment_kg, default_side_min_plate_kg, kind) VALUES
('5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0', 'chest-press-machine', 'machine', 'stack', 'weight_stack', NULL, 5.0, NULL, 'chest_press'),
('eq_barbell', 'barbell', 'free_weight', 'dual_load', 'plates', 20.0, NULL, 1.25, 'barbell'),
('eq_cable', 'cable-machine', 'machine', 'single_load', 'weight_stack', NULL, 2.5, NULL, 'cable'),
('eq_dumbbell', 'dumbbell', 'free_weight', 'single_load', 'solid_weight', NULL, 2.5, NULL, 'dumbbell'),
('eq_kettlebell', 'kettlebell', 'free_weight', 'single_load', 'solid_weight', NULL, 2.0, NULL, 'kettlebell');
```

### Equipment Translations
```sql
INSERT INTO equipment_translations (id, equipment_id, language_code, name, description) VALUES
('eqt_001', '5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0', 'en', 'Chest Press Machine', 'Seated chest press machine with adjustable weight stack'),
('eqt_002', 'eq_barbell', 'en', 'Barbell', 'Olympic barbell for compound movements with plate loading'),
('eqt_003', 'eq_cable', 'en', 'Cable Machine', 'Adjustable cable machine with pulley system'),
('eqt_004', 'eq_dumbbell', 'en', 'Dumbbell', 'Free weight dumbbells for unilateral training'),
('eqt_005', 'eq_kettlebell', 'en', 'Kettlebell', 'Cast iron weight for functional movement patterns');
```

### Muscle Groups
```sql
CREATE TABLE muscle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO muscle_groups (id, slug) VALUES
('1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e', 'chest'),
('muscle_quads', 'quadriceps'),
('muscle_hamstrings', 'hamstrings'),
('muscle_shoulders', 'shoulders'),
('muscle_triceps', 'triceps'),
('muscle_biceps', 'biceps'),
('muscle_lats', 'latissimus-dorsi'),
('muscle_glutes', 'glutes');
```

### Muscle Group Translations
```sql
CREATE TABLE muscle_groups_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_group_id UUID NOT NULL REFERENCES muscle_groups(id),
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO muscle_groups_translations (id, muscle_group_id, language_code, name, description) VALUES
('mgt_001', '1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e', 'en', 'Chest', 'Pectoral muscles including upper, middle, and lower regions'),
('mgt_002', 'muscle_quads', 'en', 'Quadriceps', 'Front thigh muscles responsible for knee extension'),
('mgt_003', 'muscle_hamstrings', 'en', 'Hamstrings', 'Posterior thigh muscles responsible for knee flexion'),
('mgt_004', 'muscle_shoulders', 'en', 'Shoulders', 'Deltoid muscles including anterior, medial, and posterior heads'),
('mgt_005', 'muscle_triceps', 'en', 'Triceps', 'Three-headed muscle on the back of the upper arm'),
('mgt_006', 'muscle_biceps', 'en', 'Biceps', 'Two-headed muscle on the front of the upper arm'),
('mgt_007', 'muscle_lats', 'en', 'Latissimus Dorsi', 'Large back muscles responsible for pulling movements'),
('mgt_008', 'muscle_glutes', 'en', 'Glutes', 'Hip muscles including gluteus maximus, medius, and minimus');
```

### Body Parts
```sql
CREATE TABLE body_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO body_parts (id, slug) VALUES
('db555682-5959-4b63-9c75-078a5870390e', 'chest'),
('bp_legs', 'legs'),
('bp_shoulders', 'shoulders'),
('bp_arms', 'arms'),
('bp_back', 'back'),
('bp_core', 'core');
```

### Body Part Translations
```sql
INSERT INTO body_parts_translations (id, body_part_id, language_code, name, description) VALUES
('bpt_001', 'db555682-5959-4b63-9c75-078a5870390e', 'en', 'Chest', 'Upper body region including pectoral muscles'),
('bpt_002', 'bp_legs', 'en', 'Legs', 'Lower body including thighs, calves, and glutes'),
('bpt_003', 'bp_shoulders', 'en', 'Shoulders', 'Shoulder girdle and deltoid region'),
('bpt_004', 'bp_arms', 'en', 'Arms', 'Upper arms including biceps and triceps'),
('bpt_005', 'bp_back', 'en', 'Back', 'Posterior torso including lats, rhomboids, and traps'),
('bpt_006', 'bp_core', 'en', 'Core', 'Abdominal and lower back stabilizing muscles');
```

### Grips
```sql
CREATE TABLE grips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO grips (id, slug) VALUES
('38571da9-3843-4004-b0e5-dee9c953bde1', 'neutral'),
('3f119821-a26d-43c9-ac19-1746f286862f', 'overhand'),
('grip_underhand', 'underhand'),
('grip_mixed', 'mixed'),
('grip_hook', 'hook'),
('grip_false', 'false');
```

### Grip Translations
```sql
CREATE TABLE grips_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grip_id UUID NOT NULL REFERENCES grips(id),
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO grips_translations (id, grip_id, language_code, name, description) VALUES
('gt_001', '38571da9-3843-4004-b0e5-dee9c953bde1', 'en', 'Neutral Grip', 'Palms facing each other, natural wrist position'),
('gt_002', '3f119821-a26d-43c9-ac19-1746f286862f', 'en', 'Overhand Grip', 'Palms facing away from body, pronated position'),
('gt_003', 'grip_underhand', 'en', 'Underhand Grip', 'Palms facing toward body, supinated position'),
('gt_004', 'grip_mixed', 'en', 'Mixed Grip', 'One hand overhand, one hand underhand for deadlifts'),
('gt_005', 'grip_hook', 'en', 'Hook Grip', 'Thumb under fingers for secure barbell grip'),
('gt_006', 'grip_false', 'en', 'False Grip', 'Thumbless grip with thumbs on same side as fingers');
```

## Exercise Relationships

### Exercise Default Grips
```sql
CREATE TABLE exercise_default_grips (
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  grip_id UUID NOT NULL REFERENCES grips(id),
  order_index INTEGER NOT NULL DEFAULT 1
);

INSERT INTO exercise_default_grips (exercise_id, grip_id, order_index) VALUES
('b0bb1fa8-83c4-4f39-a311-74f014d85bec', '38571da9-3843-4004-b0e5-dee9c953bde1', 1),
('b0bb1fa8-83c4-4f39-a311-74f014d85bec', '3f119821-a26d-43c9-ac19-1746f286862f', 2),
('ex_bench_press', '3f119821-a26d-43c9-ac19-1746f286862f', 1),
('ex_squat', '3f119821-a26d-43c9-ac19-1746f286862f', 1),
('ex_deadlift', '3f119821-a26d-43c9-ac19-1746f286862f', 1),
('ex_deadlift', 'grip_mixed', 2),
('ex_overhead_press', '3f119821-a26d-43c9-ac19-1746f286862f', 1),
('ex_triceps_pushdown', '3f119821-a26d-43c9-ac19-1746f286862f', 1),
('ex_triceps_pushdown', '38571da9-3843-4004-b0e5-dee9c953bde1', 2);
```

### Exercise Grip Effects
```sql
CREATE TABLE exercise_grip_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  grip_id UUID NOT NULL REFERENCES grips(id),
  muscle_id UUID NOT NULL REFERENCES muscle_groups(id),
  effect_pct NUMERIC NOT NULL,
  equipment_id UUID REFERENCES equipment(id),
  is_primary_override BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO exercise_grip_effects (id, exercise_id, grip_id, muscle_id, effect_pct, equipment_id, is_primary_override, note) VALUES
('ege_001', 'ex_bench_press', '3f119821-a26d-43c9-ac19-1746f286862f', '1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e', 85.0, 'eq_barbell', false, 'Standard overhand grip chest activation'),
('ege_002', 'ex_bench_press', 'grip_false', '1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e', 90.0, 'eq_barbell', false, 'False grip increases chest activation'),
('ege_003', 'ex_deadlift', '3f119821-a26d-43c9-ac19-1746f286862f', 'muscle_hamstrings', 80.0, 'eq_barbell', false, 'Overhand grip hamstring activation'),
('ege_004', 'ex_deadlift', 'grip_mixed', 'muscle_hamstrings', 85.0, 'eq_barbell', false, 'Mixed grip allows heavier loads'),
('ege_005', 'ex_triceps_pushdown', '3f119821-a26d-43c9-ac19-1746f286862f', 'muscle_triceps', 75.0, 'eq_cable', false, 'Overhand grip triceps activation'),
('ege_006', 'ex_triceps_pushdown', '38571da9-3843-4004-b0e5-dee9c953bde1', 'muscle_triceps', 85.0, 'eq_cable', false, 'Neutral grip increases triceps isolation');
```

## Current System Issues

### Database Problems
1. **Personal Records Constraint Conflicts**: Old and new unique constraints coexist
2. **Migration Failures**: Incomplete constraint transitions
3. **Data Corruption**: Duplicate records from failed operations

### Code Architecture Issues  
1. **Multiple Set Logging Implementations**: 4+ different approaches
2. **Inconsistent Error Handling**: Different patterns across components
3. **No Single Source of Truth**: Conflicting data updates
4. **Race Conditions**: Simultaneous updates causing conflicts

### Performance Issues
1. **Complex Queries**: Inefficient joins across multiple tables
2. **Missing Indexes**: Slow lookups on exercise relationships  
3. **Redundant Data**: Multiple translations and grip combinations
4. **Poor Caching**: Repeated database calls for same data

## Data Relationships Summary

### Primary Relationships
- `exercises` → `exercises_translations` (1:many)
- `exercises` → `equipment` (many:1)
- `exercises` → `muscle_groups` (many:1 primary, many:many secondary)
- `exercises` → `body_parts` (many:1)
- `exercises` → `grips` (many:many through `exercise_default_grips`)
- `exercises` → `exercise_grip_effects` (1:many)

### Translation Pattern
All major entities use the same translation pattern:
- `[entity]` → `[entity]_translations` (1:many)
- Translation tables include `language_code`, `name`, `description`
- Default language is 'en' (English)

### Grip System
Complex grip system allows for:
- Multiple grips per exercise
- Grip-specific muscle activation effects
- Equipment-specific grip combinations
- Order preference for default grips

This comprehensive schema supports a full-featured workout tracking system with internationalization, flexible grip combinations, and detailed muscle targeting analysis.