# Workout System Database Schema - COMPLETE REFERENCE

⚠️ **CRITICAL SYSTEM STATUS**: As of August 31, 2025, the workout system is experiencing critical failures due to database constraint conflicts.

## Current Issues Summary
- **Set Logging**: BROKEN - Constraint violation in personal_records table
- **Warmup Feedback**: BROKEN - Multiple conflicting implementations  
- **Personal Records**: BROKEN - Old constraint conflicts with new constraint
- **Data Integrity**: COMPROMISED - Failed migrations left system in inconsistent state

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

#### Sample Data
```sql
INSERT INTO workouts (id, user_id, title, started_at, ended_at, notes, perceived_exertion, created_at, estimated_duration_minutes, total_duration_seconds) VALUES
('bc0d8632-fff4-4b71-8b5a-30f1026ae383', 'f3024241-c467-4d6a-8315-44928316cfa9', 'Push Day', '2025-08-31 15:43:59', NULL, 'Great session focusing on chest and shoulders', 8, '2025-08-31 15:43:59', 75, NULL),
('workout_002', 'f3024241-c467-4d6a-8315-44928316cfa9', 'Pull Day', '2025-08-30 16:20:15', '2025-08-30 17:45:30', 'Back and biceps workout', 7, '2025-08-30 16:20:15', 90, 5115),
('workout_003', 'user_456', 'Leg Day', '2025-08-29 09:15:00', '2025-08-29 10:30:45', 'Intense leg session', 9, '2025-08-29 09:15:00', 75, 4545),
('workout_004', 'user_789', 'Upper Body', '2025-08-28 18:00:30', '2025-08-28 19:15:20', 'Evening upper body workout', 6, '2025-08-28 18:00:30', 80, 4490);
```

**Key Features:**
- Tracks workout session lifecycle
- Optional metadata for analysis
- User-owned with RLS protection

### workout_exercises ⚠️ WARMUP FEEDBACK ISSUES
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
  warmup_feedback       text,  -- ISSUE: Multiple systems update this field
  warmup_feedback_at    timestamptz,
  warmup_snapshot       text,
  warmup_updated_at     timestamptz DEFAULT now(),
  is_superset_group     text
)
```

#### Sample Data
```sql
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, warmup_plan, warmup_feedback, target_sets) VALUES
('7e9936d3-e641-44a6-bb06-0cf76a1694bb', 'bc0d8632-fff4-4b71-8b5a-30f1026ae383', 'b0bb1fa8-83c4-4f39-a311-74f014d85bec', 0, 
'{"steps": [{"id": "W1", "reps": 10, "percent": 0.4166666666666667, "restSec": 60, "rest_sec": 60}, {"id": "W2", "reps": 8, "percent": 0.5833333333333334, "restSec": 90, "rest_sec": 90}, {"id": "W3", "reps": 5, "percent": 0.7916666666666666, "restSec": 120, "rest_sec": 120}], "strategy": "ramped", "base_weight": 60, "est_minutes": 3}', 
'excellent', 3),
('we_002', 'workout_002', 'exercise_bench_press', 1, '{"strategy": "ramped", "steps": [{"reps": 12, "percent": 0.4}, {"reps": 10, "percent": 0.6}, {"reps": 8, "percent": 0.8}]}', 'too_much', 4),
('we_003', 'workout_003', 'exercise_squat', 1, '{"strategy": "ramped", "steps": [{"reps": 15, "percent": 0.5}, {"reps": 12, "percent": 0.7}, {"reps": 8, "percent": 0.85}]}', 'not_enough', 3);
```

**Key Features:**
- Links exercises to workouts with configuration
- Handle and grip selections stored  
- Warmup planning and feedback (CURRENTLY BROKEN)
- Support for supersets via group_id

**Current Issues:**
- Multiple systems try to update `warmup_feedback` field simultaneously
- No single source of truth for warmup feedback logic
- Race conditions between different implementation approaches

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

### personal_records ⚠️ CRITICAL CONSTRAINT ISSUE
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
  created_at     timestamptz NOT NULL DEFAULT now(),
  
  -- CONSTRAINT CONFLICT ISSUE:
  UNIQUE(user_id, exercise_id, kind, COALESCE(grip_key, ''))  -- Target constraint
  -- PROBLEM: Old constraint "personal_records_user_ex_kind_unique" still exists
)
```

#### Sample Data (Post-Constraint Fix)
```sql
INSERT INTO personal_records (id, user_id, exercise_id, kind, value, unit, grip_key, achieved_at, workout_set_id, created_at) VALUES
('pr_001', 'f3024241-c467-4d6a-8315-44928316cfa9', 'b0bb1fa8-83c4-4f39-a311-74f014d85bec', '1RM', 225.0, 'kg', 'overhand', '2025-08-30 10:30:00', 'set_001', '2025-08-30 10:30:00'),
('pr_002', 'f3024241-c467-4d6a-8315-44928316cfa9', 'b0bb1fa8-83c4-4f39-a311-74f014d85bec', 'heaviest', 200.0, 'kg', 'overhand', '2025-08-29 11:15:00', 'set_002', '2025-08-29 11:15:00'),
('pr_003', 'f3024241-c467-4d6a-8315-44928316cfa9', 'exercise_squat', '1RM', 315.0, 'kg', '', '2025-08-28 09:45:00', 'set_003', '2025-08-28 09:45:00'),
('pr_004', 'user_456', 'exercise_deadlift', 'reps', 15, 'reps', 'mixed', '2025-08-27 14:20:00', 'set_004', '2025-08-27 14:20:00');
```

**CURRENT CRITICAL ERROR:**
```
duplicate key value violates unique constraint "personal_records_user_ex_kind_unique"
```

**Root Cause:** 
- **Old Constraint**: `personal_records_user_ex_kind_unique` on `(user_id, exercise_id, kind)`
- **New Constraint**: `personal_records_user_ex_kind_grip_unique` on `(user_id, exercise_id, kind, grip_key)` 
- **Problem**: Both constraints exist simultaneously, causing all set logging to fail

**Key Features:**
- Tracks multiple PR types
- Grip-aware for accurate comparisons  
- Links back to the achieving set
- **STATUS**: COMPLETELY BROKEN due to constraint conflicts

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