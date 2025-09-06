# Exercise System Schema

## Core Exercise Tables

### exercises
Primary table for all exercise definitions.

```sql
exercises (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                      text NOT NULL UNIQUE,
  owner_user_id             uuid NULL,  -- NULL for system exercises
  is_public                 boolean NOT NULL DEFAULT true,
  body_part_id              uuid REFERENCES body_parts(id),
  primary_muscle_id         uuid,  -- References muscles table
  equipment_id              uuid NOT NULL REFERENCES equipment(id),
  movement_pattern          movement_pattern_enum,
  load_type                 load_type_enum,
  is_unilateral             boolean DEFAULT false,
  allows_grips              boolean DEFAULT true,
  requires_handle           boolean DEFAULT false,
  is_bar_loaded             boolean NOT NULL DEFAULT false,
  default_bar_weight        numeric,
  default_bar_type_id       uuid REFERENCES bar_types(id),
  default_handle_ids        uuid[],
  default_grip_ids          uuid[] DEFAULT '{}',
  secondary_muscle_group_ids uuid[],
  exercise_skill_level      exercise_skill_level_enum DEFAULT 'medium',
  complexity_score          smallint DEFAULT 3,
  popularity_rank           integer,
  contraindications         jsonb DEFAULT '[]',
  capability_schema         jsonb DEFAULT '{}',
  image_url                 text,
  thumbnail_url             text,
  source_url                text,
  loading_hint              text,
  created_at                timestamptz NOT NULL DEFAULT now()
)
```

**Key Features:**
- Slug-based identification for stable references
- Nullable `owner_user_id` allows system exercises
- Rich metadata for exercise classification
- JSONB fields for flexible metadata

### exercises_translations
Multi-language support for exercise names and descriptions.

```sql
exercises_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id   uuid NOT NULL REFERENCES exercises(id),
  language_code text NOT NULL,
  name          text NOT NULL,
  description   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(exercise_id, language_code)
)
```

## Equipment System

### equipment
Exercise equipment definitions.

```sql
equipment (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                            text UNIQUE,
  equipment_type                  text NOT NULL DEFAULT 'machine',
  kind                            text,
  load_type                       load_type_enum DEFAULT 'none',
  load_medium                     load_medium_enum DEFAULT 'other',
  weight_kg                       numeric,
  default_bar_weight_kg           numeric,
  default_side_min_plate_kg       numeric,
  default_single_min_increment_kg numeric,
  default_stack                   jsonb DEFAULT '[]',
  notes                           text,
  created_at                      timestamptz NOT NULL DEFAULT now()
)
```

### equipment_translations
Equipment names and descriptions.

```sql
equipment_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id  uuid NOT NULL REFERENCES equipment(id),
  language_code text NOT NULL,
  name          text NOT NULL,
  description   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(equipment_id, language_code)
)
```

## Handle System

### handles
Cable handles, bars, and attachments.

```sql
handles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text,  -- NOT NULL in practice but nullable in schema
  created_at timestamptz NOT NULL DEFAULT now()
)
```

**Current Data:** 13 handles (straight-bar, ez-curl-bar, trap-bar, swiss-bar, lat-pulldown-bar, seated-row-bar, tricep-rope, single-handle, dual-d-handle, dip-handles, pull-up-bar, parallel-bars, suspension-straps)

### handle_translations
Handle names and descriptions.

```sql
handle_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle_id     uuid NOT NULL REFERENCES handles(id),
  language_code text NOT NULL,
  name          text NOT NULL,
  description   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
)
```

**Current Data:** Translations for all 13 handles in English and Romanian

## Grip System

### grips
Hand positions and grip styles.

```sql
grips (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                text,  -- NOT NULL in practice but nullable in schema
  category            text,  -- NOT NULL in practice but nullable in schema  
  is_compatible_with  jsonb DEFAULT '[]',  -- Changed to jsonb in actual schema
  created_at          timestamptz NOT NULL DEFAULT now()
)
```

**Current Data:** 7 grips total
- **Hand Position Category:** overhand, underhand, neutral, mixed
- **Width Category:** close, medium, wide

### grips_translations
Grip descriptions in multiple languages.

```sql
grips_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grip_id       uuid NOT NULL REFERENCES grips(id),
  language_code text NOT NULL,
  name          text NOT NULL,
  description   text,  -- Nullable in actual schema
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
)
```

**Current Data:** Translations for all 7 grips in English and Romanian

## Exercise Relationship Tables

### exercise_handles
Default handles for exercises.

```sql
exercise_handles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  handle_id   uuid NOT NULL REFERENCES handles(id),
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
)
```

**Current Data:** 0 rows (no exercises created yet)

### exercise_grips
Available grips for exercises with primary key.

```sql
exercise_grips (
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  grip_id     uuid NOT NULL REFERENCES grips(id),
  is_default  boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now(),
  
  PRIMARY KEY(exercise_id, grip_id)
)
```

**Current Data:** 0 rows (no exercises created yet)

### exercise_handle_grips
Valid handle and grip combinations.

```sql
exercise_handle_grips (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  handle_id   uuid NOT NULL REFERENCES handles(id),
  grip_id     uuid NOT NULL REFERENCES grips(id),
  created_at  timestamptz NOT NULL DEFAULT now()
)
```

**Current Data:** 0 rows (no exercises created yet)

## Equipment Compatibility Tables

### equipment_handle_grips
Equipment-handle-grip compatibility mappings. **This is the key table for new exercise creation.**

```sql
equipment_handle_grips (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  handle_id    uuid NOT NULL REFERENCES handles(id),
  grip_id      uuid NOT NULL REFERENCES grips(id),
  is_default   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
)
```

**Current Data:** 100+ rows defining which handles/grips work with which equipment
- Maps equipment to compatible handle/grip combinations
- Includes default selections for each equipment type
- **Critical for new exercise creation workflow**

### exercise_grip_effects
Muscle activation changes by grip.

```sql
exercise_grip_effects (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id          uuid NOT NULL REFERENCES exercises(id),
  grip_id              uuid NOT NULL REFERENCES grips(id),
  muscle_id            uuid NOT NULL,  -- References muscles table
  equipment_id         uuid REFERENCES equipment(id),
  effect_pct           numeric NOT NULL,
  is_primary_override  boolean NOT NULL DEFAULT false,
  note                 text,
  created_at           timestamptz NOT NULL DEFAULT now()
)
```

## Body Parts & Muscles

### body_parts
Major body regions for exercise classification.

```sql
body_parts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text,
  created_at timestamptz NOT NULL DEFAULT now()
)
```

### body_parts_translations
Body part names in multiple languages.

```sql
body_parts_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_part_id  uuid NOT NULL REFERENCES body_parts(id),
  language_code text NOT NULL,
  name          text NOT NULL,
  description   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
)
```

## Exercise Relationships

### exercise_similars
Alternative and similar exercises.

```sql
exercise_similars (
  exercise_id         uuid NOT NULL REFERENCES exercises(id),
  similar_exercise_id uuid NOT NULL REFERENCES exercises(id),
  similarity_score    numeric DEFAULT 0.8,
  reason              text,
  created_at          timestamptz NOT NULL DEFAULT now()
)
```

### exercise_equipment_variants
Equipment variations for exercises.

```sql
exercise_equipment_variants (
  exercise_id  uuid NOT NULL REFERENCES exercises(id),
  equipment_id uuid NOT NULL REFERENCES equipment(id),
  is_preferred boolean NOT NULL DEFAULT false
)
```

## Supporting Tables

### bar_types
Standard barbell specifications.

```sql
bar_types (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  default_weight numeric NOT NULL,
  unit           weight_unit_enum NOT NULL DEFAULT 'kg'
)
```

### exercise_images
User-uploaded exercise images.

```sql
exercise_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  user_id     uuid NOT NULL,
  path        text NOT NULL,
  url         text NOT NULL,
  is_primary  boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now()
)
```

## Custom Types

### movement_pattern_enum
```sql
CREATE TYPE movement_pattern AS ENUM (
  'horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull',
  'squat', 'hinge', 'lunge', 'carry', 'rotation', 'anti_extension',
  'anti_flexion', 'anti_lateral_flexion', 'gait'
);
```

### load_type_enum
```sql
CREATE TYPE load_type AS ENUM (
  'bar', 'stack', 'single_load', 'dual_load', 'none'
);
```

### exercise_skill_level_enum
```sql
CREATE TYPE exercise_skill_level AS ENUM (
  'beginner', 'medium', 'advanced'
);
```