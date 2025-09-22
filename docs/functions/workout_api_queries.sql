# Workout API Queries and Complex Joins

## 1. User Exercise Last Set Query

**Purpose**: Get the most recent set performed by user for a specific exercise

**Actual Query from Network Requests**:
```sql
GET /rest/v1/workout_sets?
select=weight,reps,set_index,completed_at,notes,rpe,workout_exercises!inner(exercise_id,grip_key,workouts!inner(user_id))
&workout_exercises.workouts.user_id=eq.f3024241-c467-4d6a-8315-44928316cfa9
&workout_exercises.exercise_id=eq.6da86374-b133-4bf1-a159-fd9bbb715316
&set_index=eq.1
&is_completed=eq.true
&completed_at=not.is.null
&weight=not.is.null
&reps=not.is.null
&order=completed_at.desc
&limit=1
```

**Equivalent SQL**:
```sql
SELECT 
  ws.weight,
  ws.reps, 
  ws.set_index,
  ws.completed_at,
  ws.notes,
  ws.rpe,
  we.exercise_id,
  we.grip_key,
  w.user_id
FROM workout_sets ws
INNER JOIN workout_exercises we ON we.id = ws.workout_exercise_id
INNER JOIN workouts w ON w.id = we.workout_id
WHERE w.user_id = 'f3024241-c467-4d6a-8315-44928316cfa9'
  AND we.exercise_id = '6da86374-b133-4bf1-a159-fd9bbb715316'
  AND ws.set_index = 1
  AND ws.is_completed = true
  AND ws.completed_at IS NOT NULL
  AND ws.weight IS NOT NULL
  AND ws.reps IS NOT NULL
ORDER BY ws.completed_at DESC
LIMIT 1;
```

## 2. Exercise Body Part and Muscle Groups Query

**Purpose**: Get exercise body part and secondary muscle group information

**Actual Query**:
```sql
GET /rest/v1/workout_exercises?
select=exercise_id,exercises!inner(body_part_id,secondary_muscle_group_ids)
&id=eq.ca4aef04-7bef-4224-8d6a-dca4407d8766
```

**Equivalent SQL**:
```sql
SELECT 
  we.exercise_id,
  e.body_part_id,
  e.secondary_muscle_group_ids
FROM workout_exercises we
INNER JOIN exercises e ON e.id = we.exercise_id
WHERE we.id = 'ca4aef04-7bef-4224-8d6a-dca4407d8766';
```

## 3. Exercise Load Type and Bar Information Query

**Purpose**: Get exercise load type and default bar type for weight calculations

**Actual Query**:
```sql
GET /rest/v1/exercises?
select=load_type,default_bar_type_id
&id=eq.6da86374-b133-4bf1-a159-fd9bbb715316
```

**Equivalent SQL**:
```sql
SELECT 
  load_type,
  default_bar_type_id
FROM exercises
WHERE id = '6da86374-b133-4bf1-a159-fd9bbb715316';
```

## 4. User Exercise History Query

**Purpose**: Get all completed sets for user and exercise (for progression tracking)

**Actual Query**:
```sql
GET /rest/v1/workout_sets?
select=workout_exercises!inner(exercise_id,workouts!inner(user_id))
&workout_exercises.workouts.user_id=eq.f3024241-c467-4d6a-8315-44928316cfa9
&is_completed=eq.true
&workout_exercises.exercise_id=in.(6da86374-b133-4bf1-a159-fd9bbb715316)
```

**Equivalent SQL**:
```sql
SELECT 
  ws.id,
  ws.weight,
  ws.reps,
  ws.completed_at,
  we.exercise_id,
  w.user_id
FROM workout_sets ws
INNER JOIN workout_exercises we ON we.id = ws.workout_exercise_id
INNER JOIN workouts w ON w.id = we.workout_id
WHERE w.user_id = 'f3024241-c467-4d6a-8315-44928316cfa9'
  AND ws.is_completed = true
  AND we.exercise_id = '6da86374-b133-4bf1-a159-fd9bbb715316';
```

## 5. User Exercise Estimates Query

**Purpose**: Get estimated weights for exercise (10RM, 1RM calculations)

**Actual Query**:
```sql
GET /rest/v1/user_exercise_estimates?
select=exercise_id
&user_id=eq.f3024241-c467-4d6a-8315-44928316cfa9
&type=eq.rm10
&exercise_id=in.(6da86374-b133-4bf1-a159-fd9bbb715316)
```

**Follow-up Query**:
```sql
GET /rest/v1/user_exercise_estimates?
select=estimated_weight
&user_id=eq.f3024241-c467-4d6a-8315-44928316cfa9
&exercise_id=eq.6da86374-b133-4bf1-a159-fd9bbb715316
&order=created_at.desc
&limit=1
```

**Equivalent SQL**:
```sql
-- Check if estimates exist
SELECT exercise_id 
FROM user_exercise_estimates
WHERE user_id = 'f3024241-c467-4d6a-8315-44928316cfa9'
  AND type = 'rm10'
  AND exercise_id = '6da86374-b133-4bf1-a159-fd9bbb715316';

-- Get latest estimate
SELECT estimated_weight
FROM user_exercise_estimates
WHERE user_id = 'f3024241-c467-4d6a-8315-44928316cfa9'
  AND exercise_id = '6da86374-b133-4bf1-a159-fd9bbb715316'
ORDER BY created_at DESC
LIMIT 1;
```

## 6. Workout Exercise Grip and Warmup Query

**Purpose**: Get grip selection and warmup plan for exercise

**Actual Queries**:
```sql
GET /rest/v1/workout_exercises?
select=grip_id
&id=eq.ca4aef04-7bef-4224-8d6a-dca4407d8766

GET /rest/v1/workout_exercises?
select=warmup_feedback,warmup_plan
&id=eq.ca4aef04-7bef-4224-8d6a-dca4407d8766
```

**Equivalent SQL**:
```sql
SELECT 
  grip_id,
  warmup_feedback,
  warmup_plan
FROM workout_exercises
WHERE id = 'ca4aef04-7bef-4224-8d6a-dca4407d8766';
```

## 7. Last Set for Current Workout Exercise Query

**Purpose**: Get the most recent set for the current workout exercise (for auto-progression)

**Actual Query**:
```sql
GET /rest/v1/workout_sets?
select=weight,set_index
&workout_exercise_id=eq.ca4aef04-7bef-4224-8d6a-dca4407d8766
&is_completed=eq.true
&set_kind=neq.warmup
&weight=gte.1
&order=set_index.desc
&limit=1
```

**Equivalent SQL**:
```sql
SELECT 
  weight,
  set_index
FROM workout_sets
WHERE workout_exercise_id = 'ca4aef04-7bef-4224-8d6a-dca4407d8766'
  AND is_completed = true
  AND set_kind != 'warmup'
  AND weight >= 1
ORDER BY set_index DESC
LIMIT 1;
```

## 8. Equipment Configuration Queries

**Purpose**: Load user's available equipment for weight suggestions

**Actual Queries**:
```sql
-- User's plates
GET /rest/v1/user_gym_plates?
select=*
&user_gym_id=eq.746f46cb-b54d-43db-8a4a-5b15d300a802

-- User's dumbbells  
GET /rest/v1/user_gym_dumbbells?
select=*
&user_gym_id=eq.746f46cb-b54d-43db-8a4a-5b15d300a802

-- User's micro weights
GET /rest/v1/user_gym_miniweights?
select=*
&user_gym_id=eq.746f46cb-b54d-43db-8a4a-5b15d300a802
```

**Response Structure**:
```json
// Plates
[
  {
    "id": "uuid",
    "user_gym_id": "uuid", 
    "weight": 25.0,
    "unit": "kg",
    "quantity": 2,
    "native_unit": "kg",
    "label": null,
    "color": null
  }
]

// Dumbbells
[]

// Mini weights  
[
  {
    "id": "uuid",
    "user_gym_id": "uuid",
    "weight": 1.0,
    "unit": "kg", 
    "quantity": 1,
    "native_unit": "kg"
  }
]
```

## Performance Insights

**Issues Identified**:
1. **Multiple Separate Queries**: Instead of using the optimized `get_workout_detail_optimized` RPC
2. **N+1 Query Pattern**: Separate queries for each piece of exercise data
3. **Redundant Calls**: Multiple calls to same endpoints (user_gyms, app_flags)
4. **Missing Batch Operations**: Could batch equipment queries

**Recommended Optimizations**:
1. Use `get_workout_detail_optimized` RPC for initial workout load
2. Batch equipment queries into single call
3. Cache user gym and app flags data
4. Use materialized views for user exercise history