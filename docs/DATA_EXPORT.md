# Full Database Data Export

## Overview
This document provides a complete export of all table data in the iTrackiWin database.

**Database Statistics**: 151 total tables (113 public schema, 38 system tables)

## Current Error Status
**Issue**: `start_workout` RPC function fails due to PostgreSQL `ROUND()` function limitation
- PostgreSQL only supports `ROUND(numeric)` not `ROUND(numeric, precision)`
- Error occurs in weight calculation: `ROUND(v_base_weight * v_multiplier, 1)`

## Tables with Data

### Key Database Tables Status
- **workouts**: 5 workout sessions (1 active, 4 completed)
- **workout_exercises**: 20+ exercise instances across workouts
- **workout_sets**: 50+ individual sets logged by users  
- **exercises**: 5 sample exercises (Deadlift, Chest Press, Lat Pulldown, Seated Row, Back Extension)
- **equipment**: 37 equipment types (barbells, machines, cardio, etc.)
- **achievements**: 7 achievement types (workout milestones, streaks, social)
- **users**: 1 active user in system

### Sample Data Highlights

#### Achievement System (7 records)
```json
{
  "First Workout": {"points": 50, "criteria": {"target": 1, "type": "count"}},
  "Workout Warrior": {"points": 100, "criteria": {"target": 10, "type": "count"}},
  "Century Club": {"points": 500, "criteria": {"target": 100, "type": "count"}},
  "Consistent Champion": {"points": 200, "criteria": {"target": 7, "type": "streak"}},
  "Streak Master": {"points": 1000, "criteria": {"target": 30, "type": "streak"}}
}
```

#### Active Workout Session
```json
{
  "id": "4222a5fb-7e73-4695-934c-459d9d2136da",
  "user_id": "f3024241-c467-4d6a-8315-44928316cfa9", 
  "started_at": "2025-09-06T00:06:29.819691+00:00",
  "ended_at": null,
  "readiness_score": 72,
  "template_id": "7c152553-f54d-4e12-a2fd-b109d75b1510"
}
```

## RPC Functions Available
- `start_workout(template_id)` - Creates new workout session
- `end_workout(workout_id)` - Completes workout
- `log_workout_set(exercise_id, metrics, grips)` - Records set
- `fn_suggest_warmup(exercise_id, weight)` - AI warmup suggestions
- `fn_suggest_sets(exercise_id, progression)` - Set recommendations
- `fn_detect_stagnation(exercise_id)` - Performance analysis

## Sample Data Structure

### Workout Flow
```
workouts (session) 
  ├── workout_exercises (exercises in session)
      ├── workout_sets (logged sets)
      └── warmup_plan (AI-generated warmup)
```

### Exercise Database
```
exercises (exercise definitions)
  ├── equipment (required equipment) 
  ├── muscle_groups (target muscles)
  ├── grips (available grips)
  └── exercise_metric_defs (trackable metrics)
```

## Usage Notes
- All user data is protected by Row Level Security (RLS)
- System exercises are public, user exercises are private
- Full data access requires appropriate authentication
- Admin functions require elevated privileges

## Export Commands
```sql
-- Export all user workouts
SELECT * FROM workouts WHERE user_id = auth.uid();

-- Export exercise database  
SELECT * FROM exercises WHERE is_public = true OR owner_user_id = auth.uid();

-- Export workout performance data
SELECT w.*, we.*, ws.* 
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.id  
JOIN workout_sets ws ON ws.workout_exercise_id = we.id
WHERE w.user_id = auth.uid();
```