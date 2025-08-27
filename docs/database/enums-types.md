# Custom Types and Enums

## Core Exercise Enums

### movement_pattern
Exercise movement classifications for programming and analysis.

```sql
CREATE TYPE movement_pattern AS ENUM (
  'horizontal_push',     -- Bench press, push-ups
  'vertical_push',       -- Overhead press, handstand push-ups
  'horizontal_pull',     -- Rows, face pulls
  'vertical_pull',       -- Pull-ups, lat pulldowns
  'squat',              -- Back squat, front squat, goblet squat
  'hinge',              -- Deadlift, Romanian deadlift, hip thrust
  'lunge',              -- Forward lunge, reverse lunge, step-ups
  'carry',              -- Farmer's walk, suitcase carry
  'rotation',           -- Russian twist, wood chop
  'anti_extension',     -- Plank, dead bug
  'anti_flexion',       -- Superman, back extension
  'anti_lateral_flexion', -- Side plank, Pallof press
  'gait'                -- Walking, running patterns
);
```

### load_type
How weight/resistance is applied to the exercise.

```sql
CREATE TYPE load_type AS ENUM (
  'bar',         -- Barbell exercises
  'stack',       -- Cable machine stack
  'single_load', -- Dumbbells, kettlebells (one weight total)
  'dual_load',   -- Dumbbells used in pairs
  'none'         -- Bodyweight, no external load
);
```

### exercise_skill_level
Complexity and skill requirements for exercises.

```sql
CREATE TYPE exercise_skill_level AS ENUM (
  'beginner',  -- Simple movements, easy to learn
  'medium',    -- Moderate complexity, some coordination
  'advanced'   -- Complex movements, high skill requirements
);
```

### load_medium
The physical medium providing resistance.

```sql
CREATE TYPE load_medium AS ENUM (
  'plates',    -- Weight plates on barbell/machine
  'stack',     -- Cable machine weight stack
  'body',      -- Bodyweight exercises
  'other'      -- Other forms of resistance
);
```

## Workout System Enums

### set_type
Different types of sets in workout programming.

```sql
CREATE TYPE set_type AS ENUM (
  'warmup',    -- Warmup sets at lighter weights
  'normal',    -- Standard working sets
  'top_set',   -- Heaviest set of the day
  'backoff',   -- Reduced weight sets after top set
  'drop',      -- Drop sets (reduce weight mid-set)
  'amrap',     -- As Many Reps As Possible
  'cluster'    -- Cluster sets with intra-set rest
);
```

### effort
Subjective effort level for sets.

```sql
CREATE TYPE effort AS ENUM (
  'easy',      -- Very light effort, could do many more reps
  'moderate',  -- Moderate effort, some reps left in tank
  'hard',      -- Hard effort, 1-2 reps left
  'max'        -- Maximum effort, failure or near-failure
);
```

### warmup_quality
Assessment of warmup effectiveness.

```sql
CREATE TYPE warmup_quality AS ENUM (
  'poor',      -- Inadequate warmup, still felt stiff
  'adequate',  -- Basic warmup, felt ready
  'good',      -- Good warmup, felt well-prepared
  'excellent'  -- Excellent warmup, felt optimal
);
```

## User & Social Enums

### app_role
Application-level user roles for authorization.

```sql
CREATE TYPE app_role AS ENUM (
  'user',      -- Standard user
  'admin',     -- Application administrator
  'superadmin' -- Super administrator with full access
);
```

### experience_level
User training experience levels for program customization.

```sql
CREATE TYPE experience_level AS ENUM (
  'beginner',     -- 0-6 months training
  'intermediate', -- 6 months - 2 years
  'advanced'      -- 2+ years consistent training
);
```

### metric_value_type
Data types for custom user metrics.

```sql
CREATE TYPE metric_value_type AS ENUM (
  'number',   -- Numeric values (weight, measurements)
  'text',     -- Text values (notes, descriptions)
  'boolean',  -- Yes/no values (did/didn't do something)
  'enum'      -- Predefined choice from options
);
```

## Standard PostgreSQL Types Used

### weight_unit
```sql
CREATE TYPE weight_unit AS ENUM (
  'kg',  -- Kilograms
  'lb'   -- Pounds
);
```

### distance_unit
```sql
CREATE TYPE distance_unit AS ENUM (
  'm',   -- Meters
  'km',  -- Kilometers
  'ft',  -- Feet
  'mi'   -- Miles
);
```

## JSONB Schema Examples

### capability_schema (exercises)
Defines what an exercise can measure or track.

```json
{
  "supports_weight": true,
  "supports_reps": true,
  "supports_distance": false,
  "supports_time": false,
  "supports_rpe": true,
  "weight_is_per_side": true,
  "allows_unilateral": false,
  "custom_metrics": ["grip_strength", "range_of_motion"]
}
```

### target_settings (template_exercises)
Default targets and configurations for template exercises.

```json
{
  "weight_progression": {
    "type": "linear",
    "increment_kg": 2.5,
    "success_criteria": "complete_all_sets"
  },
  "rep_ranges": {
    "warmup": [8, 12],
    "working": [6, 8],
    "backoff": [10, 12]
  },
  "rest_periods": {
    "warmup": 60,
    "working": 180,
    "backoff": 120
  }
}
```

### warmup_plan (workout_exercises)
Structured warmup planning with sets and progressions.

```json
{
  "strategy": "ramped",
  "top_weight": 100,
  "steps": [
    {
      "label": "W1",
      "percent": 0.40,
      "reps": 12,
      "rest_sec": 45
    },
    {
      "label": "W2", 
      "percent": 0.60,
      "reps": 10,
      "rest_sec": 60
    },
    {
      "label": "W3",
      "percent": 0.80,
      "reps": 8,
      "rest_sec": 60
    }
  ],
  "last_recalc_at": "2024-01-15T10:00:00Z",
  "source": "last_set"
}
```

### load_meta (workout_sets)
Detailed load composition for complex loading scenarios.

```json
{
  "plates_per_side": [
    {"weight": 20, "count": 1},
    {"weight": 10, "count": 1},
    {"weight": 2.5, "count": 2}
  ],
  "bar_weight": 20,
  "collar_weight": 2.5,
  "total_calculated": 85,
  "entry_method": "plate_calculator"
}
```

### contraindications (exercises)
Health and safety considerations for exercises.

```json
[
  {
    "condition": "lower_back_pain",
    "severity": "moderate",
    "recommendation": "avoid_heavy_loading"
  },
  {
    "condition": "shoulder_impingement", 
    "severity": "high",
    "recommendation": "exercise_contraindicated"
  }
]
```

### supplements (readiness_checkins)
Supplement intake tracking.

```json
{
  "pre_workout": ["caffeine", "citrulline"],
  "post_workout": ["whey_protein", "creatine"],
  "daily": ["vitamin_d", "magnesium"],
  "timing": {
    "pre_workout_mins": 30,
    "post_workout_mins": 15
  }
}
```

## Type Usage Guidelines

### 1. Enum Selection
- Use enums for fixed, well-defined sets of values
- Consider future extensibility when defining enum values
- Use descriptive names that won't become ambiguous

### 2. JSONB Usage
- Use for flexible, evolving data structures
- Include schema versioning for complex JSONB fields
- Validate JSONB structure in application code

### 3. Nullable vs Non-Nullable
- Most enums should be nullable to allow for unknown/unset states
- Use non-null with defaults for critical categorization fields
- Document the meaning of null values clearly

### 4. Extension Strategy
- Add new enum values with `ALTER TYPE ... ADD VALUE`
- Consider backward compatibility when adding values
- Use JSONB for frequently changing categorizations

## Migration Notes

When adding new enum values:

```sql
-- Safe addition (at end)
ALTER TYPE movement_pattern ADD VALUE 'new_pattern';

-- For ordering, create new type and migrate
CREATE TYPE movement_pattern_new AS ENUM (
  'horizontal_push',
  'new_pattern_here', 
  'vertical_push',
  -- ... rest of values
);

-- Then migrate tables and drop old type
```

When changing JSONB schemas:
- Always maintain backward compatibility
- Version your schemas: `{"schema_version": "1.2", ...}`
- Provide migration paths in application code