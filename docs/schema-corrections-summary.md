# Updated Schema Summary - Handle & Grip System (2025-08-29)

## Schema Corrections Applied

### 1. Actual Column Properties
- `handles.slug` is nullable (not NOT NULL as previously documented)
- `grips.slug` is nullable (not NOT NULL as previously documented)  
- `grips.category` is nullable (not NOT NULL as previously documented)
- `grips.is_compatible_with` is jsonb type (not uuid[] as previously documented)
- `grips_translations.description` is nullable

### 2. Missing Tables Added
- **`equipment_handle_grips`** - Critical table for equipment compatibility
- Foreign key relationships for all handle/grip tables

### 3. Current Data State
- **handles:** 13 rows with EN/RO translations ✅
- **grips:** 7 rows with EN/RO translations ✅
- **equipment_handle_grips:** 100+ compatibility mappings ✅
- **exercise_handles:** 0 rows (no exercises) ❌
- **exercise_grips:** 0 rows (no exercises) ❌
- **exercise_handle_grips:** 0 rows (no exercises) ❌

### 4. Primary Key Clarifications
- `exercise_grips` uses composite primary key: `(exercise_id, grip_id)`
- All other relationship tables use uuid primary keys

### 5. Critical Discovery
**`equipment_handle_grips` is the key table for new exercise creation:**
- Maps which handles work with which equipment
- Maps which grips work with each handle+equipment combination
- Includes default selections (`is_default` boolean)
- Should be used as data source when `exerciseId` is undefined

## Data Flow for Handle/Grip Selection

### For New Exercises (exerciseId = undefined)
```sql
-- Get available handles for equipment
SELECT DISTINCT h.*, ht.name, ehg.is_default
FROM equipment_handle_grips ehg
JOIN handles h ON h.id = ehg.handle_id
JOIN handle_translations ht ON ht.handle_id = h.id
WHERE ehg.equipment_id = $equipmentId 
AND ht.language_code = 'en'
ORDER BY ehg.is_default DESC;

-- Get compatible grips for equipment + handle
SELECT DISTINCT g.*, gt.name, ehg.is_default
FROM equipment_handle_grips ehg
JOIN grips g ON g.id = ehg.grip_id
JOIN grips_translations gt ON gt.grip_id = g.id
WHERE ehg.equipment_id = $equipmentId 
AND ehg.handle_id = $handleId
AND gt.language_code = 'en'
ORDER BY ehg.is_default DESC;
```

### For Existing Exercises (exerciseId present)
```sql
-- Get configured handles for exercise
SELECT eh.*, h.*, ht.name
FROM exercise_handles eh
JOIN handles h ON h.id = eh.handle_id
JOIN handle_translations ht ON ht.handle_id = h.id
WHERE eh.exercise_id = $exerciseId
AND ht.language_code = 'en'
ORDER BY eh.is_default DESC;

-- Get configured grips for exercise
SELECT eg.*, g.*, gt.name
FROM exercise_grips eg
JOIN grips g ON g.id = eg.grip_id
JOIN grips_translations gt ON gt.grip_id = g.id
WHERE eg.exercise_id = $exerciseId
AND gt.language_code = 'en'
ORDER BY eg.is_default DESC, eg.order_index;
```

This schema update provides the complete current state and corrects all documentation inaccuracies.