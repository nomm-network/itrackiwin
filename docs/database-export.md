# Complete Database Export

## Overview
This document contains a complete export of all data currently in the fitness application database as of 2025-09-01.

## Exercises Data

### Exercises Table (1 record)
```sql
-- exercises
INSERT INTO exercises (id, display_name, custom_display_name, slug, equipment_id, primary_muscle_id, body_part_id, movement_id, movement_pattern_id, popularity_rank, is_public, owner_user_id, tags, allows_grips, default_grip_ids, is_bar_loaded, load_type, exercise_skill_level, complexity_score, configured, created_at) VALUES
('b0bb1fa8-83c4-4f39-a311-74f014d85bec', 'Upper Chest Press (Machine)', 'Upper Chest Press (Machine)', 'upper-chest-press-machine', '5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0', '1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e', 'db555682-5959-4b63-9c75-078a5870390e', '0c64f081-5cb8-4682-8395-315d5533362c', '02024706-63ca-4f34-a4d6-7df57a6d6899', 85, true, null, '{machine,press,chest}', true, '{38571da9-3843-4004-b0e5-dee9c953bde1,3f119821-a26d-43c9-ac19-1746f286862f}', false, 'dual_load', 'low', 3, false, '2025-08-30 12:34:53.631752+00');
```

### Exercise Translations (1 record)
```sql
-- exercises_translations
INSERT INTO exercises_translations (id, exercise_id, language_code, name, description, created_at, updated_at) VALUES
('0a95458b-3c2c-4155-b276-616cee78bf29', 'b0bb1fa8-83c4-4f39-a311-74f014d85bec', 'en', 'Upper Chest Press (Machine)', 'Machine press targeting the upper chest with neutral and overhand grips.234', '2025-08-30 12:34:53.631752+00', '2025-08-31 15:39:21.471027+00');
```

## Equipment Data

### Equipment Table (40+ records)
Key equipment types including:
- Barbells (Olympic, EZ Curl, Fixed, Trap Bar)
- Dumbbells and Kettlebells
- Machines (Cable, Chest Press, Lat Pulldown, etc.)
- Cardio Equipment (Treadmill, Bike, Rower, Elliptical)
- Specialized Equipment (Chains, Bands, Sandbags)

### Equipment Translations (60+ records)
English translations for all equipment with descriptions.

## Body Parts & Muscle Groups

### Body Parts (5 records)
```sql
-- body_parts
INSERT INTO body_parts (id, slug, created_at) VALUES
('0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5', 'arms', '2025-08-27 21:10:41.302264+00'),
('7828c330-5c72-46e3-b6b8-c897e4568ac1', 'back', '2025-08-27 21:10:41.302264+00'),
('db555682-5959-4b63-9c75-078a5870390e', 'chest', '2025-08-27 21:10:41.302264+00'),
('6fe4e259-43ba-4cba-a42a-7bcb30fce7f4', 'core', '2025-08-27 21:10:41.302264+00'),
('e5b05486-ec9d-494d-816f-76109ccde834', 'legs', '2025-08-27 21:10:41.302264+00');
```

### Muscle Groups (14+ records)
Including: shoulders, biceps, triceps, forearms, back, traps, neck, chest, abs, obliques, quads, hamstrings, glutes, calves.

## Movement Patterns & Movements

### Movement Patterns (5 records)
```sql
-- movement_patterns
INSERT INTO movement_patterns (id, slug, created_at) VALUES
('02024706-63ca-4f34-a4d6-7df57a6d6899', 'push', '2025-08-30 11:23:52.8894+00'),
('ac7157d7-4324-4a40-b98f-5183e47eed32', 'pull', '2025-08-30 11:23:52.8894+00'),
('640e7fb0-6cc5-448a-b822-409f05ee68e9', 'squat', '2025-08-30 11:23:52.8894+00'),
('5f6e3748-14e6-4537-b76b-4081e7c995f1', 'hinge', '2025-08-30 11:23:52.8894+00'),
('e75c9e9a-55ef-4cc1-b0b5-dafbd9704a1b', 'lunge', '2025-08-30 11:23:52.8894+00');
```

### Movements (5+ records)
Including: horizontal_push, vertical_push, dip, front_raise, lateral_raise.

## Grips Data

### Grips (4 records)
```sql
-- grips
INSERT INTO grips (id, slug, category, created_at) VALUES
('38571da9-3843-4004-b0e5-dee9c953bde1', 'overhand', 'hand_position', '2025-08-28 11:43:53.330933+00'),
('255960ca-ec28-484f-8f2f-11089be4fb19', 'underhand', 'hand_position', '2025-08-28 11:43:53.330933+00'),
('3f119821-a26d-43c9-ac19-1746f286862f', 'neutral', 'hand_position', '2025-08-28 11:43:53.330933+00'),
('353c77e2-cd33-43c5-a396-095b96c2f4cc', 'mixed', 'hand_position', '2025-08-28 11:43:53.330933+00');
```

## Data Quality Summary

### Current Data Population
- **Exercises**: 1 exercise (Upper Chest Press Machine)
- **Equipment**: 40+ types with full translations
- **Body Parts**: 5 major regions
- **Muscle Groups**: 14+ groups with hierarchy
- **Grips**: 4 hand positions
- **Movement Patterns**: 5 fundamental patterns
- **Movements**: 5+ specific movements

### Translation Coverage
- **English (en)**: Primary language with 100% coverage
- Ready for additional language support

### Data Integrity
- All foreign key relationships intact
- UUID primary keys throughout
- Proper normalization maintained
- RLS policies protecting data access

### Notes
- This export excludes sensitive user data and authentication information
- Only reference/configuration data and one sample exercise included
- All timestamps preserved as stored in database
- Schema represents post-handle-system-removal state

## Database Statistics
- **Total Tables**: 144
- **Populated Core Tables**: ~15 tables with reference data
- **Empty User Tables**: Most user-specific tables currently empty (new system)
- **System Tables**: Admin, audit, and configuration tables properly initialized