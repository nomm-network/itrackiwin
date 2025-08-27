# Workout System Schema

## Core Workout Tables

### workouts
User workout sessions with timing and metadata.

```sql
workouts (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL,  -- References auth.users
  title                       text,
  notes                       text,
  started_at                  timestamptz NOT NULL DEFAULT now(),
  ended_at                    timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  estimated_duration_minutes  integer,
  total_duration_seconds      integer,
  perceived_exertion          integer  -- 1-10 scale
)
```

**Key Features:**
- Tracks workout session lifecycle
- Optional metadata for analysis
- User-owned with RLS protection

### workout_exercises
Exercises performed within a workout.

```sql
workout_exercises (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id            uuid NOT NULL REFERENCES workouts(id),
  exercise_id           uuid NOT NULL REFERENCES exercises(id),
  order_index           integer NOT NULL,
  group_id              uuid,  -- For supersets/circuits
  display_name          text,
  notes                 text,
  target_sets           integer DEFAULT 3,
  handle_id             uuid REFERENCES handles(id),
  grip_ids              uuid[],
  grip_key              text,  -- Computed from grip_ids
  bar_type_id           uuid REFERENCES bar_types(id),
  selected_bar_id       uuid,
  load_type             load_type_enum,
  load_entry_mode       text,
  per_side_weight       numeric,
  weight_input_mode     text DEFAULT 'per_side',
  target_origin         text,
  warmup_plan           jsonb,
  warmup_quality        warmup_quality_enum,
  warmup_feedback       text,
  warmup_feedback_at    timestamptz,
  warmup_snapshot       text,
  warmup_updated_at     timestamptz DEFAULT now(),
  is_superset_group     text
)
```

**Key Features:**
- Links exercises to workouts with configuration
- Handle and grip selections stored
- Warmup planning and feedback
- Support for supersets via group_id

### workout_sets
Individual sets performed within workout exercises.

```sql
workout_sets (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id  uuid NOT NULL REFERENCES workout_exercises(id),
  set_index            integer DEFAULT 1,
  set_kind             set_type_enum DEFAULT 'normal',
  side                 text,
  weight               numeric,
  weight_unit          text DEFAULT 'kg',
  reps                 integer,
  target_weight        numeric,
  target_reps          integer,
  distance             numeric,
  duration_seconds     integer,
  rpe                  numeric,  -- Rate of Perceived Exertion
  effort               effort_enum,
  effort_rating        smallint,
  heart_rate           smallint,
  had_pain             boolean DEFAULT false,
  rest_seconds         integer,
  notes                text,
  settings             jsonb DEFAULT '{}',
  is_completed         boolean DEFAULT true,
  completed_at         timestamptz DEFAULT now(),
  
  -- Load calculation fields
  load_entry_mode      text,
  bar_id               uuid,
  bar_type_id          uuid REFERENCES bar_types(id),
  weight_per_side      numeric,
  load_one_side_kg     numeric,
  total_weight_kg      numeric,
  load_meta            jsonb NOT NULL DEFAULT '{}'
)
```

**Key Features:**
- Flexible set types (normal, warmup, drop, AMRAP, etc.)
- Multiple weight entry modes
- RPE and effort tracking
- Load calculation support

## Template System

### workout_templates
Reusable workout plans created by users.

```sql
workout_templates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,  -- References auth.users
  name       text,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
)
```

### template_exercises
Exercises within workout templates with default settings.

```sql
template_exercises (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id            uuid NOT NULL REFERENCES workout_templates(id),
  exercise_id            uuid NOT NULL REFERENCES exercises(id),
  order_index            integer NOT NULL,
  display_name           text,
  default_sets           integer NOT NULL DEFAULT 3,
  target_weight          numeric,
  target_reps            integer,
  target_rep_min         integer,
  target_rep_max         integer,
  weight_unit            text NOT NULL DEFAULT 'kg',
  handle_id              uuid REFERENCES handles(id),
  grip_ids               uuid[],
  notes                  text,
  target_settings        jsonb DEFAULT '{}',
  progression_policy_id  uuid,
  warmup_policy_id       uuid,
  default_warmup_plan    jsonb,
  set_scheme             text,
  rep_range_min          smallint,
  rep_range_max          smallint,
  top_set_percent_1rm    numeric,
  backoff_sets           smallint,
  backoff_percent        numeric
)
```

**Key Features:**
- Template-based workout creation
- Default handle and grip settings
- Advanced set schemes and progression
- Warmup planning

## Performance Tracking

### personal_records
User PRs with grip context for accurate tracking.

```sql
personal_records (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL,  -- References auth.users
  exercise_id    uuid NOT NULL REFERENCES exercises(id),
  kind           text NOT NULL,  -- 'heaviest', 'reps', '1RM'
  value          numeric NOT NULL,
  unit           text NOT NULL,
  grip_key       text,  -- NULL for gripless exercises
  achieved_at    timestamptz NOT NULL,
  workout_set_id uuid REFERENCES workout_sets(id),
  
  UNIQUE(user_id, exercise_id, kind, grip_key)
)
```

**Key Features:**
- Tracks multiple PR types
- Grip-aware for accurate comparisons
- Links back to the achieving set

### readiness_checkins
Daily readiness and recovery tracking.

```sql
readiness_checkins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,  -- References auth.users
  workout_id    uuid REFERENCES workouts(id),
  energy        smallint,      -- 1-5 scale
  sleep_quality smallint,      -- 1-5 scale
  sleep_hours   numeric,
  soreness      smallint,      -- 1-5 scale
  stress        smallint,      -- 1-5 scale
  illness       boolean,
  alcohol       boolean,
  supplements   jsonb,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
)
```

## Supporting Tables

### auto_deload_triggers
Automatic deload detection based on performance patterns.

```sql
auto_deload_triggers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,  -- References auth.users
  exercise_id       uuid NOT NULL REFERENCES exercises(id),
  trigger_type      text NOT NULL,  -- 'stagnation', 'regression', etc.
  threshold_value   numeric,
  deload_percentage numeric DEFAULT 10.0,
  is_triggered      boolean DEFAULT false,
  triggered_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
)
```

### workout_exercise_groups
Grouping for supersets and circuits.

```sql
workout_exercise_groups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id),
  group_type text NOT NULL,  -- 'superset', 'circuit', 'solo'
  name       text,
  order_index integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
)
```

## Custom Types

### set_type_enum
```sql
CREATE TYPE set_type AS ENUM (
  'warmup', 'normal', 'top_set', 'backoff', 'drop', 'amrap', 'cluster'
);
```

### effort_enum
```sql
CREATE TYPE effort AS ENUM (
  'easy', 'moderate', 'hard', 'max'
);
```

### warmup_quality_enum
```sql
CREATE TYPE warmup_quality AS ENUM (
  'poor', 'adequate', 'good', 'excellent'
);
```

## Key Relationships

1. **Workout Flow**: `workouts` → `workout_exercises` → `workout_sets`
2. **Template Flow**: `workout_templates` → `template_exercises`
3. **Exercise Configuration**: Handle and grip selections at workout_exercise level
4. **Performance Tracking**: Sets link to PRs via triggers
5. **Grouping**: Supersets via `group_id` in workout_exercises

## RLS Patterns

All workout-related tables use user-based RLS:
- `auth.uid() = user_id` for user ownership
- Templates and workouts are private to their creators
- PRs and readiness data are user-specific