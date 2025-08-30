# Database Schema Documentation

## Core Exercise System Tables

### exercises
Main exercise definitions table.

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  owner_user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Exercise Properties
  display_name TEXT,
  custom_display_name TEXT,
  name_locale TEXT DEFAULT 'en',
  tags TEXT[] DEFAULT '{}',
  
  -- Physical Properties
  body_part_id UUID REFERENCES body_parts(id),
  primary_muscle_id UUID REFERENCES muscles(id),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  secondary_muscle_group_ids UUID[],
  
  -- Movement & Skill
  movement_id UUID REFERENCES movements(id),
  movement_pattern_id UUID REFERENCES movement_patterns(id),
  equipment_ref_id UUID REFERENCES equipment(id),
  exercise_skill_level exercise_skill_level DEFAULT 'medium',
  complexity_score SMALLINT DEFAULT 3,
  
  -- Equipment & Loading
  load_type load_type,
  is_bar_loaded BOOLEAN NOT NULL DEFAULT false,
  default_bar_weight NUMERIC,
  default_bar_type_id UUID REFERENCES bar_types(id),
  
  -- Handle & Grip System
  requires_handle BOOLEAN DEFAULT false,
  allows_grips BOOLEAN DEFAULT true,
  default_handle_ids UUID[],
  default_grip_ids UUID[] DEFAULT '{}',
  
  -- Metadata
  popularity_rank INTEGER,
  capability_schema JSONB DEFAULT '{}',
  contraindications JSONB DEFAULT '[]',
  attribute_values_json JSONB NOT NULL DEFAULT '{}',
  name_version INTEGER DEFAULT 1,
  display_name_tsv TSVECTOR,
  
  -- Media
  image_url TEXT,
  thumbnail_url TEXT,
  source_url TEXT,
  loading_hint TEXT,
  
  -- Unilateral exercises
  is_unilateral BOOLEAN DEFAULT false
);
```

### exercises_translations
Localized names and descriptions for exercises.

```sql
CREATE TABLE exercises_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(exercise_id, language_code)
);
```

## Movement System Tables

### movements
Core movement patterns/actions.

```sql
CREATE TABLE movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### movement_translations
Localized names for movements.

```sql
CREATE TABLE movement_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(movement_id, language_code)
);
```

### movement_patterns
High-level movement categorization.

```sql
CREATE TABLE movement_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Equipment System Tables

### equipment
Exercise equipment definitions.

```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
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

### equipment_translations
Localized names for equipment.

```sql
CREATE TABLE equipment_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(equipment_id, language_code)
);
```

## Muscle System Tables

### muscles
Individual muscle definitions.

```sql
CREATE TABLE muscles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### muscles_translations
Localized names for muscles.

```sql
CREATE TABLE muscles_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_id UUID NOT NULL REFERENCES muscles(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(muscle_id, language_code)
);
```

### body_parts
Major body regions.

```sql
CREATE TABLE body_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### body_parts_translations
Localized names for body parts.

```sql
CREATE TABLE body_parts_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_part_id UUID NOT NULL REFERENCES body_parts(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(body_part_id, language_code)
);
```

## Handle & Grip System Tables

### handles
Handle/attachment definitions.

```sql
CREATE TABLE handles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### handle_translations
Localized names for handles.

```sql
CREATE TABLE handle_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle_id UUID NOT NULL REFERENCES handles(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(handle_id, language_code)
);
```

### grips
Grip style/position definitions.

```sql
CREATE TABLE grips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  category TEXT,
  is_compatible_with UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### grips_translations
Localized names for grips.

```sql
CREATE TABLE grips_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grip_id UUID NOT NULL REFERENCES grips(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL DEFAULT 'en',
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(grip_id, language_code)
);
```

## Relationship Tables

### equipment_handle_grips
Maps equipment to compatible handle/grip combinations.

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

### exercise_handles
Maps exercises to their valid handles.

```sql
CREATE TABLE exercise_handles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  handle_id UUID NOT NULL REFERENCES handles(id),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(exercise_id, handle_id)
);
```

### exercise_grips
Maps exercises to their valid grips.

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
Maps exercises to specific handle/grip combinations.

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

## Custom Data Types

### Enums
```sql
CREATE TYPE movement_pattern_enum AS ENUM (
  'push', 'pull', 'squat', 'hinge', 'lunge', 'carry', 'gait', 'rotation'
);

CREATE TYPE load_type_enum AS ENUM (
  'dual_load', 'single_load', 'stack', 'none'
);

CREATE TYPE exercise_skill_level_enum AS ENUM (
  'beginner', 'intermediate', 'advanced'
);

CREATE TYPE load_medium AS ENUM (
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'other'
);

CREATE TYPE weight_unit AS ENUM ('kg', 'lbs');

CREATE TYPE handle_orientation AS ENUM (
  'horizontal', 'vertical', 'angled_up', 'angled_down'
);
```