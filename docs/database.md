# Database Schema

## Overview

The application uses Supabase (PostgreSQL) with Row Level Security (RLS) for data persistence and real-time capabilities.

## Core Tables

### Authentication & Users

```sql
-- Managed by Supabase Auth
auth.users
├── id (uuid, primary key)
├── email (text)
├── created_at (timestamptz)
└── ...

-- Extended user profile
public.users
├── id (uuid, references auth.users, primary key)
├── is_pro (boolean, default false)
├── default_unit (text, default 'kg')
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Exercise Library

```sql
-- Base exercise definitions
public.exercises
├── id (uuid, primary key)
├── slug (text, unique)
├── display_name (text)
├── category (text)
├── muscle_groups (text[])
├── equipment_type (text)
├── difficulty_level (int)
├── instructions (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Exercise variations and equipment
public.exercise_equipment
├── id (uuid, primary key)
├── exercise_id (uuid, references exercises)
├── equipment_id (uuid, references equipment)
├── load_type (text)
├── is_primary (boolean)
└── created_at (timestamptz)
```

### Equipment Management

```sql
-- Equipment definitions
public.equipment
├── id (uuid, primary key)
├── name (text)
├── kind (text) -- 'bar', 'dumbbell', 'machine', etc.
├── weight_kg (decimal)
├── load_type (text)
├── manufacturer (text)
├── model (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Equipment translations
public.equipment_translations
├── id (uuid, primary key)
├── equipment_id (uuid, references equipment)
├── language_code (text)
├── name (text)
├── description (text)
└── created_at (timestamptz)
```

### Workout System

```sql
-- Workout sessions
public.workouts
├── id (uuid, primary key)
├── user_id (uuid, references auth.users)
├── name (text)
├── template_id (uuid, references workout_templates)
├── status (text) -- 'planned', 'active', 'completed', 'cancelled'
├── started_at (timestamptz)
├── completed_at (timestamptz)
├── duration_minutes (int)
├── volume_kg (decimal)
├── total_sets (int)
├── notes (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Exercises within a workout
public.workout_exercises
├── id (uuid, primary key)
├── workout_id (uuid, references workouts)
├── exercise_id (uuid, references exercises)
├── equipment_id (uuid, references equipment)
├── position (int)
├── target_sets (int)
├── target_reps (int)
├── target_weight_kg (decimal)
├── rest_seconds (int)
├── notes (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Individual sets within workout exercises
public.workout_sets
├── id (uuid, primary key)
├── workout_exercise_id (uuid, references workout_exercises)
├── set_index (int)
├── weight_kg (decimal)
├── reps (int)
├── effort_level (int) -- 1-10 RPE scale
├── is_completed (boolean, default false)
├── is_warmup (boolean, default false)
├── rest_duration_s (int)
├── notes (text)
├── logged_at (timestamptz)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Training Programs

```sql
-- Program templates
public.training_programs
├── id (uuid, primary key)
├── name (text)
├── description (text)
├── duration_weeks (int)
├── sessions_per_week (int)
├── difficulty_level (int)
├── goal_type (text)
├── created_by (uuid, references auth.users)
├── is_public (boolean, default false)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Program blocks (phases)
public.program_blocks
├── id (uuid, primary key)
├── program_id (uuid, references training_programs)
├── name (text)
├── week_start (int)
├── week_end (int)
├── focus (text)
├── intensity_percentage (decimal)
├── volume_multiplier (decimal)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Workout templates
public.workout_templates
├── id (uuid, primary key)
├── program_id (uuid, references training_programs)
├── block_id (uuid, references program_blocks)
├── name (text)
├── description (text)
├── duration_minutes (int)
├── difficulty (int)
├── created_by (uuid, references auth.users)
├── is_public (boolean, default false)
├── created_at (timestamptz)
└── updated_at (timestamptz)

-- Template exercises
public.template_exercises
├── id (uuid, primary key)
├── template_id (uuid, references workout_templates)
├── exercise_id (uuid, references exercises)
├── position (int)
├── target_sets (int)
├── target_reps (int)
├── target_weight_kg (decimal)
├── rest_seconds (int)
├── notes (text)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

### Readiness Assessment

```sql
-- Pre-workout readiness check-ins
public.readiness_assessments
├── id (uuid, primary key)
├── user_id (uuid, references auth.users)
├── workout_id (uuid, references workouts)
├── energy_level (int) -- 1-10 scale
├── sleep_quality (int) -- 1-10 scale
├── sleep_hours (decimal)
├── soreness_level (int) -- 1-10 scale
├── stress_level (int) -- 1-10 scale
├── illness (boolean, default false)
├── alcohol_consumption (boolean, default false)
├── supplements (text[])
├── overall_score (decimal)
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

## Views and Functions

### Smart Target Calculation

```sql
-- RPC function for intelligent target setting
CREATE OR REPLACE FUNCTION get_smart_targets(
  p_exercise_id uuid,
  p_user_id uuid,
  p_readiness_score decimal DEFAULT NULL
)
RETURNS TABLE (
  target_weight_kg decimal,
  target_reps int,
  confidence_score decimal,
  base_source text
);
```

### Workout Statistics

```sql
-- View for workout performance metrics
CREATE VIEW v_workout_stats AS
SELECT 
  w.id,
  w.user_id,
  w.name,
  w.completed_at,
  COUNT(DISTINCT we.id) as exercise_count,
  COUNT(ws.id) as total_sets,
  SUM(ws.weight_kg * ws.reps) as total_volume,
  AVG(ws.effort_level) as avg_effort,
  w.duration_minutes
FROM workouts w
LEFT JOIN workout_exercises we ON we.workout_id = w.id
LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id
WHERE w.status = 'completed'
GROUP BY w.id;
```

### Exercise Effectiveness

```sql
-- View for equipment-specific exercise data
CREATE VIEW v_equipment_effective AS
SELECT 
  e.id as equipment_id,
  ex.id as exercise_id,
  ex.display_name,
  ee.load_type,
  AVG(ws.weight_kg) as avg_weight,
  COUNT(ws.id) as usage_count
FROM equipment e
JOIN exercise_equipment ee ON ee.equipment_id = e.id
JOIN exercises ex ON ex.id = ee.exercise_id
LEFT JOIN workout_exercises we ON we.exercise_id = ex.id
LEFT JOIN workout_sets ws ON ws.workout_exercise_id = we.id
GROUP BY e.id, ex.id, ee.load_type;
```

## Row Level Security (RLS)

### User Data Isolation

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for all user-specific tables
```

### Public Data Access

```sql
-- Public templates and exercises
CREATE POLICY "Public templates viewable" ON workout_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Exercises viewable by all" ON exercises
  FOR SELECT USING (true);
```

## Indexes

### Performance Optimization

```sql
-- Workout queries
CREATE INDEX idx_workouts_user_status ON workouts(user_id, status);
CREATE INDEX idx_workouts_completed_at ON workouts(completed_at) WHERE status = 'completed';

-- Set queries
CREATE INDEX idx_workout_sets_exercise_completed ON workout_sets(workout_exercise_id, is_completed);
CREATE INDEX idx_workout_sets_logged_at ON workout_sets(logged_at);

-- Exercise searches
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
CREATE INDEX idx_exercises_display_name ON exercises(display_name);
```

## Triggers

### Automatic Timestamps

```sql
-- Update timestamps on modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Workout Statistics

```sql
-- Automatically calculate workout statistics
CREATE OR REPLACE FUNCTION calculate_workout_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update workout volume and set count
  UPDATE workouts SET
    total_sets = (
      SELECT COUNT(*) 
      FROM workout_sets ws
      JOIN workout_exercises we ON we.id = ws.workout_exercise_id
      WHERE we.workout_id = NEW.workout_id
    ),
    volume_kg = (
      SELECT COALESCE(SUM(ws.weight_kg * ws.reps), 0)
      FROM workout_sets ws
      JOIN workout_exercises we ON we.id = ws.workout_exercise_id
      WHERE we.workout_id = NEW.workout_id
    )
  WHERE id = NEW.workout_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_workout_stats
  AFTER INSERT OR UPDATE OR DELETE ON workout_sets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_workout_stats();
```

## Data Migration Patterns

### Adding New Features

```sql
-- Example: Adding RPE tracking
ALTER TABLE workout_sets 
ADD COLUMN effort_level int CHECK (effort_level >= 1 AND effort_level <= 10);

-- Backfill with default values
UPDATE workout_sets 
SET effort_level = 7 
WHERE effort_level IS NULL AND is_completed = true;
```

### Schema Versioning

```sql
-- Track schema version
CREATE TABLE schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz DEFAULT now()
);
```

## Backup and Recovery

### Regular Backups

- Automated daily backups via Supabase
- Point-in-time recovery available
- Export capabilities for user data

### Data Retention

```sql
-- Archive old workout data
CREATE TABLE archived_workouts (LIKE workouts INCLUDING ALL);

-- Move workouts older than 2 years
INSERT INTO archived_workouts 
SELECT * FROM workouts 
WHERE completed_at < now() - interval '2 years';
```

## Performance Monitoring

### Query Optimization

```sql
-- Identify slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Connection Pooling

- PgBouncer configuration for connection management
- Connection limits based on usage patterns
- Monitoring for connection exhaustion

## Security Considerations

### Data Encryption

- Encrypted at rest via Supabase
- SSL/TLS for data in transit
- Sensitive data tokenization where applicable

### Access Control

- Fine-grained RLS policies
- API key rotation
- Service role isolation
- Audit logging for sensitive operations