# Database Table Exports

## Movements Data
```sql
-- movements table current data:
INSERT INTO movements (id, slug, created_at) VALUES
('a94d2085-54b7-4685-9db6-97e285ce2cec', 'hinge', '2025-08-28 17:14:46.259218+00'),
('c5dfd200-d40d-4404-9a9a-e8bb17fcb786', 'press', '2025-08-28 17:14:46.259218+00'),
('3f243599-e69d-4bf5-a5be-86c7b446af0c', 'pull', '2025-08-28 17:14:46.259218+00'),
('d96e1c42-8ee0-41ce-9cc7-c2e166b967ba', 'row', '2025-08-28 17:14:46.259218+00'),
('6dfc3ccb-6ae5-498d-b7d9-06dd15219dc6', 'squat', '2025-08-28 17:14:46.259218+00');
```

## Movement Patterns Data
```sql
-- movement_patterns table current data:
INSERT INTO movement_patterns (id, slug, created_at, updated_at) VALUES
('1b4698a8-b210-411e-add4-7ab4e485ed3c', 'carry', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('f15ed745-0f09-4137-8f89-3b4903065c3c', 'curl', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('af0391b3-89a0-4d0f-a8e1-3a188a1a305e', 'extension', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('4d7fd371-3b8f-4c43-8457-0f0d63622707', 'fly', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('61bc44cf-993f-429f-b58d-c1e82bbd3458', 'hinge', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('be0b9818-0b3d-43cc-9358-6102112705f5', 'lunge', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('55be7524-e044-4567-a62a-b1405c36e005', 'press', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('9daafbba-8e03-43fb-ab75-57d217c4cba6', 'pull-down', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('89cf5996-8e37-4663-b592-7c2dcb40f5dd', 'raise', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('56b929ec-2fa4-42ed-afef-509fe37db260', 'rotation', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('b1a715eb-9706-4928-912c-7a1a8eaf501a', 'row', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00'),
('5ab13534-d1c0-4cb1-a7e9-7c6bd6f59e76', 'squat', '2025-08-29 16:15:36.28508+00', '2025-08-29 16:15:36.28508+00');
```

## Equipment Data (Key Entries)
```sql
-- equipment table key entries:
INSERT INTO equipment (id, slug, equipment_type, kind, load_type, load_medium, created_at) VALUES
('a7ef71cc-222f-4066-999d-a2968eaae87f', 'barbell', 'free_weight', NULL, 'dual_load', 'other', '2025-08-29 17:05:26.087218+00'),
('1328932a-54fe-42fc-8846-6ead942c2b98', 'dumbbell', 'free_weight', 'dumbbell', 'single_load', 'plates', '2025-08-28 12:49:34.582837+00'),
('243fdc06-9c04-4bc1-8773-d9da7f981bc1', 'cable-machine', 'machine', 'cable', 'stack', 'stack', '2025-08-28 12:49:34.582837+00'),
('fb81ae58-bf4e-44e8-b45a-6026147bca8e', 'dip-bars', 'bodyweight', 'station', 'none', 'bodyweight', '2025-08-28 12:49:34.582837+00'),
('5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0', 'chest-press-machine', 'machine', 'press', 'stack', 'stack', '2025-08-28 12:49:34.582837+00');
-- [30+ total equipment entries available]
```

## Muscles Data
```sql
-- muscles table current data (37 total):
INSERT INTO muscles (id, slug, created_at) VALUES
('2d8b96ff-dc4c-489f-b462-57e35441d072', 'front_delts', '2025-08-28 10:08:39.976692+00'),
('e2abb8d4-d59e-4a58-95f4-b4b348e4702a', 'side_delts', '2025-08-28 10:08:39.976692+00'),
('c9f49277-043b-4a7b-995d-a85d2b0a5fb1', 'rear_delts', '2025-08-28 10:08:39.976692+00'),
('1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e', 'upper_chest', '2025-08-28 01:00:22.620227+00'),
('8ad15437-4fbc-47d5-b55c-cee4d9e0ca4b', 'mid_chest', '2025-08-28 01:00:22.620227+00'),
('a723db68-c808-4e43-8e09-762810d004c0', 'lower_chest', '2025-08-28 01:00:22.620227+00'),
('2c063914-9f11-49f5-963c-bd12533ff561', 'lats', '2025-08-28 09:42:21.583459+00'),
('c0a67545-44f5-435e-aa22-fbde8ef18404', 'traps', '2025-08-28 09:42:21.583459+00'),
('d6c70cf7-73d1-4545-8c77-b7879bd6cd66', 'rhomboids', '2025-08-28 09:42:21.583459+00'),
('d65f3e91-ba33-4ddc-9362-2156b836f776', 'biceps_long_head', '2025-08-28 10:08:39.976692+00'),
('c6367bde-36c2-432e-868d-d4991c79bb72', 'biceps_short_head', '2025-08-28 10:08:39.976692+00'),
('e5ced31a-829f-426e-884d-03a9792dbefc', 'triceps_lateral_head', '2025-08-28 10:08:39.976692+00'),
('502eb28e-1525-4cfa-ab66-a3602175e334', 'triceps_long_head', '2025-08-28 10:08:39.976692+00'),
('ee4845c6-773a-4faa-a1fc-4fd0334eba8c', 'triceps_medial_head', '2025-08-28 10:08:39.976692+00'),
('ceb0b070-d76b-485d-a514-fd7f730dff02', 'gluteus_maximus', '2025-08-28 10:21:40.219087+00'),
('057bccc3-80d4-4118-a2d6-0dde11de74ab', 'rectus_femoris', '2025-08-28 10:21:40.219087+00'),
('a4fe0705-b0b3-4989-a62c-224e65092e96', 'vastus_lateralis', '2025-08-28 10:21:40.219087+00'),
('1aa08451-08f6-479a-933b-f4d1acde4303', 'vastus_medialis', '2025-08-28 10:21:40.219087+00'),
('8bd4d1cf-c9c3-44d7-940a-20a24ca721ba', 'biceps_femoris', '2025-08-28 10:21:40.219087+00'),
('4e129cf6-a7ea-4440-8e1a-ab1b306a0ba3', 'erector_spinae', '2025-08-28 00:36:02.28394+00');
-- [17 more muscle entries...]
```

## Body Parts Data
```sql
-- body_parts table current data:
INSERT INTO body_parts (id, slug, created_at) VALUES
('0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5', 'arms', '2025-08-27 21:10:41.302264+00'),
('7828c330-5c72-46e3-b6b8-c897e4568ac1', 'back', '2025-08-27 21:10:41.302264+00'),
('db555682-5959-4b63-9c75-078a5870390e', 'chest', '2025-08-27 21:10:41.302264+00'),
('6fe4e259-43ba-4cba-a42a-7bcb30fce7f4', 'core', '2025-08-27 21:10:41.302264+00'),
('e5b05486-ec9d-494d-816f-76109ccde834', 'legs', '2025-08-27 21:10:41.302264+00');
```

## Current Exercises Data
```sql
-- exercises table current state (only 2 exercises):
INSERT INTO exercises (id, slug, display_name, equipment_id, primary_muscle_id, movement_id, created_at) VALUES
('c9db5979-487b-4cd3-b6f6-06e7ac0f3d75', 'deadlift', 'Deadlift', '33a8bf6b-5832-442e-964d-3f32070ea029', '4e129cf6-a7ea-4440-8e1a-ab1b306a0ba3', 'a94d2085-54b7-4685-9db6-97e285ce2cec', '2025-08-30 10:03:27.423058+00'),
('b64c6db8-624a-4383-b0a5-c5c0813b021c', 'squat', 'Squat', '33a8bf6b-5832-442e-964d-3f32070ea029', '057bccc3-80d4-4118-a2d6-0dde11de74ab', '6dfc3ccb-6ae5-498d-b7d9-06dd15219dc6', '2025-08-30 10:03:27.423058+00');
```

## Summary of Current Database State

### ✅ Well-Populated Tables:
- **movements**: 5 entries (hinge, press, pull, row, squat)
- **movement_patterns**: 12 entries (carry, curl, extension, fly, hinge, lunge, press, pull-down, raise, rotation, row, squat)
- **equipment**: 30+ entries (comprehensive equipment list)
- **muscles**: 37 entries (detailed muscle coverage)
- **body_parts**: 5 entries (arms, back, chest, core, legs)
- **handles**: 45 entries (various handle types)
- **grips**: 13 entries (grip variations)
- **equipment_handle_grips**: 1,166 compatibility mappings

### ⚠️ Empty/Sparse Tables:
- **exercises**: Only 2 entries (deadlift, squat)
- **exercises_translations**: Probably only 2 entries
- **exercise_handles**: EMPTY
- **exercise_grips**: EMPTY  
- **exercise_handle_grips**: EMPTY

### 🔍 The Issue:
Our exercise insertion script only created 2/5 exercises due to slug mismatches in the WHERE clauses. The script looked for muscle slugs like `erector-spinae` but our database has `erector_spinae` (underscores instead of hyphens).

### 🎯 Key Equipment IDs for Reference:
- Barbell: `a7ef71cc-222f-4066-999d-a2968eaae87f`
- Dumbbell: `1328932a-54fe-42fc-8846-6ead942c2b98`  
- Cable Machine: `243fdc06-9c04-4bc1-8773-d9da7f981bc1`
- Olympic Barbell: `33a8bf6b-5832-442e-964d-3f32070ea029` (used in current exercises)

### 🎯 Key Muscle IDs for Reference:
- Erector Spinae: `4e129cf6-a7ea-4440-8e1a-ab1b306a0ba3`
- Rectus Femoris: `057bccc3-80d4-4118-a2d6-0dde11de74ab`
- Front Delts: `2d8b96ff-dc4c-489f-b462-57e35441d072`
- Upper Chest: `1efcef43-c0b6-4cf0-9f7c-2621e3a4e71e`
- Triceps Lateral Head: `e5ced31a-829f-426e-884d-03a9792dbefc`