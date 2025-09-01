# Workout System Troubleshooting & Database Structure

## Critical Issues Resolved

### Schema Normalization (January 1, 2025)
**Problem**: Multiple column naming inconsistencies causing "column does not exist" errors:
- `target_weight` vs `target_weight_kg` 
- `rest_time` vs `rest_seconds`
- Trigger functions referencing dropped columns

**Solution Applied**:
1. **Database Migration**: Normalized `template_exercises` and `workout_exercises` tables
2. **Legacy Column Migration**: Migrated data from old columns to new normalized columns
3. **Column Cleanup**: Dropped legacy columns to prevent future conflicts
4. **Trigger Function Fix**: Updated `trg_te_sync_weights` to work with normalized schema
5. **Interface Updates**: Updated TypeScript interfaces to use `target_weight_kg`
6. **Code References**: Fixed all remaining code references to old column names

### Multiple Start Workout Functions
**Problem**: Multiple conflicting workout start implementations causing confusion.

**Current Active Functions**:
- `start_workout(p_template_id uuid)` - **PRIMARY** - Used by frontend
- `fn_start_workout_advanced(p_template_id, p_readiness_data)` - Advanced version with readiness
- Frontend: `useStartWorkout` in `/features/workouts/api/workouts.api.ts`

**Deactivated/Removed**:
- Old `useStartWorkout` from fitness.api.ts (marked as REMOVED)
- Various conflicting template start functions

## Current Database Schema

### Core Workout Tables (Normalized)

#### `workout_templates`
```sql
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `template_exercises` (NORMALIZED)
```sql
CREATE TABLE template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  order_index INTEGER,
  default_sets SMALLINT,
  target_reps SMALLINT,
  target_weight_kg NUMERIC,        -- NORMALIZED
  weight_unit weight_unit DEFAULT 'kg',
  rest_seconds INTEGER,            -- NORMALIZED  
  notes TEXT,
  default_grip_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `workout_exercises` (NORMALIZED)
```sql
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  order_index INTEGER,
  target_sets SMALLINT,
  target_reps SMALLINT,
  target_weight_kg NUMERIC,       -- NORMALIZED
  weight_unit weight_unit DEFAULT 'kg',
  rest_seconds INTEGER,           -- NORMALIZED
  notes TEXT,
  grip_ids UUID[]
);
```

#### `workouts`
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  title TEXT,
  notes TEXT,
  perceived_exertion INTEGER
);
```

#### `workout_sets`
```sql
CREATE TABLE workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID NOT NULL,
  set_index INTEGER NOT NULL,
  set_kind set_type DEFAULT 'normal',
  reps INTEGER,
  weight NUMERIC,
  weight_unit TEXT DEFAULT 'kg',
  duration_seconds INTEGER,
  distance NUMERIC,
  rpe INTEGER,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  had_pain BOOLEAN DEFAULT false
);
```

### Key Foreign Key Relationships

```sql
-- Template system
template_exercises.template_id -> workout_templates.id
template_exercises.exercise_id -> exercises.id

-- Workout system  
workout_exercises.workout_id -> workouts.id
workout_exercises.exercise_id -> exercises.id
workout_sets.workout_exercise_id -> workout_exercises.id

-- User ownership
workouts.user_id -> auth.users.id
workout_templates.user_id -> auth.users.id
```

### Critical Enums

```sql
CREATE TYPE weight_unit AS ENUM ('kg', 'lb');
CREATE TYPE set_type AS ENUM ('normal', 'warmup', 'drop', 'top_set', 'backoff', 'amrap');
```

## Working Workflow

### Start Workout Flow
1. **Frontend**: `useStartWorkout()` from `/features/workouts/api/workouts.api.ts`
2. **Database**: Calls `start_workout(p_template_id)`
3. **Process**:
   - Creates workout record
   - If template provided: copies normalized fields from `template_exercises` to `workout_exercises`
   - Returns workout ID

### Add Exercise to Template Flow
1. **Frontend**: `handleAddExercise()` in TemplateEdit.page.tsx
2. **Database**: Insert into `template_exercises` with normalized column names
3. **Trigger**: `trg_te_sync_weights` ensures weight_unit defaults properly

## Common Error Patterns & Solutions

### "column does not exist" errors
**Cause**: Code referencing old column names
**Fix**: 
- Update code to use normalized names (`target_weight_kg`, `rest_seconds`)
- Check TypeScript interfaces
- Verify trigger functions

### "record has no field" errors  
**Cause**: Trigger functions accessing dropped columns
**Fix**: Update trigger function logic

### Multiple start workout functions
**Cause**: Conflicting implementations
**Fix**: Use single source of truth (`useStartWorkout` from workouts API)

## TypeScript Interfaces (Current)

```typescript
export interface TemplateExercise {
  id: UUID;
  template_id: UUID;
  exercise_id: UUID;
  order_index: number;
  default_sets: number;
  target_reps?: number | null;
  target_weight_kg?: number | null;  // NORMALIZED
  weight_unit: string;
  notes?: string | null;
  grip_ids?: string[] | null;
  display_name?: string | null;
}
```

## Debugging Commands

### Check for old column references:
```bash
grep -r "target_weight[^_]" src/
grep -r "rest_time" src/
```

### Verify database schema:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('template_exercises', 'workout_exercises')
ORDER BY table_name, ordinal_position;
```

### Check active triggers:
```sql
SELECT t.tgname, c.relname, pg_get_triggerdef(t.oid)
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('template_exercises', 'workout_exercises') 
AND t.tgisinternal = false;
```

## Last Updated
January 1, 2025 - Schema normalization complete, all errors resolved.