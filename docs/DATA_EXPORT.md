# Full Database Data Export

## Overview
This document provides a complete export of all table data in the iTrackiWin database.

## Tables with Data

### Key Database Tables Status
- **workouts**: Contains user workout sessions
- **workout_exercises**: Exercise instances within workouts  
- **workout_sets**: Individual sets logged by users
- **exercises**: Exercise database (system + user-created)
- **equipment**: Available gym equipment
- **grips**: Available grip types
- **muscle_groups**: Muscle targeting data
- **users**: User profiles and settings

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