# Updated Database Schema - Grips & Handles System

## Core Tables

### grips
```sql
CREATE TABLE grips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  is_compatible_with UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### handles  
```sql
CREATE TABLE handles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### equipment
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  equipment_type TEXT NOT NULL DEFAULT 'machine',
  kind TEXT,
  load_type load_type DEFAULT 'none',
  load_medium load_medium DEFAULT 'other',
  weight_kg NUMERIC,
  default_bar_weight_kg NUMERIC,
  default_side_min_plate_kg NUMERIC,
  default_single_min_increment_kg NUMERIC,
  default_stack JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Relationship Tables

### equipment_grip_defaults (NEW)
```sql
CREATE TABLE equipment_grip_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  handle_id UUID REFERENCES handles(id), -- NULL for built-in grips
  grip_id UUID NOT NULL REFERENCES grips(id),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(equipment_id, handle_id, grip_id)
);
```

### equipment_handle_grips
```sql
CREATE TABLE equipment_handle_grips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  handle_id UUID NOT NULL REFERENCES handles(id),
  grip_id UUID NOT NULL REFERENCES grips(id),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(equipment_id, handle_id, grip_id)
);
```

## Exercise Integration Tables

### exercise_handles  
```sql
CREATE TABLE exercise_handles (
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  handle_id UUID NOT NULL REFERENCES handles(id),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(exercise_id, handle_id)
);
```

### exercise_grips
```sql
CREATE TABLE exercise_grips (
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  grip_id UUID NOT NULL REFERENCES grips(id),
  is_default BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(exercise_id, grip_id)
);
```

### exercise_handle_grips
```sql
CREATE TABLE exercise_handle_grips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  handle_id UUID NOT NULL REFERENCES handles(id),
  grip_id UUID NOT NULL REFERENCES grips(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(exercise_id, handle_id, grip_id)
);
```

## Translation Tables

### grips_translations
```sql
CREATE TABLE grips_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grip_id UUID NOT NULL REFERENCES grips(id),
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(grip_id, language_code)
);
```

### handle_translations  
```sql
CREATE TABLE handle_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle_id UUID NOT NULL REFERENCES handles(id),
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(handle_id, language_code)
);
```

### equipment_translations
```sql
CREATE TABLE equipment_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(equipment_id, language_code)
);
```

## Key Foreign Key Relationships

### Equipment System
- `equipment_grip_defaults.equipment_id` → `equipment.id`
- `equipment_grip_defaults.handle_id` → `handles.id` (nullable)
- `equipment_grip_defaults.grip_id` → `grips.id`
- `equipment_handle_grips.equipment_id` → `equipment.id`
- `equipment_handle_grips.handle_id` → `handles.id`
- `equipment_handle_grips.grip_id` → `grips.id`

### Exercise System  
- `exercise_handles.exercise_id` → `exercises.id`
- `exercise_handles.handle_id` → `handles.id`
- `exercise_grips.exercise_id` → `exercises.id`
- `exercise_grips.grip_id` → `grips.id`
- `exercise_handle_grips.exercise_id` → `exercises.id`
- `exercise_handle_grips.handle_id` → `handles.id`
- `exercise_handle_grips.grip_id` → `grips.id`

### Translation System
- `grips_translations.grip_id` → `grips.id`
- `handle_translations.handle_id` → `handles.id`
- `equipment_translations.equipment_id` → `equipment.id`

## Data Population Status

✅ **Completed**
- grips: 4 entries (neutral, overhand, underhand, mixed)
- handles: 13 entries (various cable/barbell handles)
- equipment: 45 entries (machines, free weights, support)
- equipment_grip_defaults: 16 entries (key defaults)
- equipment_handle_grips: 95 entries (full compatibility)
- All translation tables populated

❌ **Empty (Awaiting Exercise Creation)**
- exercises: 0 entries
- exercise_handles: 0 entries  
- exercise_grips: 0 entries
- exercise_handle_grips: 0 entries

## System Architecture

### Data Flow for New Exercises
1. Query `equipment_handle_grips` for available options
2. User selects handle/grip combination
3. Create exercise in `exercises` table
4. Save selections to `exercise_*` tables

### Data Flow for Existing Exercises  
1. Query `exercise_handles` and `exercise_grips` 
2. Display saved exercise-specific options
3. Allow modifications via `exercise_handle_grips`

This schema provides the foundation for grip-aware exercise programming with full equipment compatibility mapping.