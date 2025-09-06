# Database Optimization Tasks

## Task 1: Core Database Indexes & Constraints (SQL Group)
**Priority: HIGH - Foundation for all workout operations**

### Sets & Metrics Optimization
```sql
-- Unique constraint: 1 set per position in workout exercise
ALTER TABLE public.workout_sets
ADD CONSTRAINT uq_workout_sets_ex_idx
UNIQUE (workout_exercise_id, set_index);

-- Fast fetch "all sets for exercise, in order"
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_order
ON public.workout_sets (workout_exercise_id, set_index DESC);

-- Metric lookups per set
CREATE INDEX IF NOT EXISTS idx_ws_metrics_set_metric
ON public.workout_set_metric_values (workout_set_id, metric_def_id);

-- Backfills like "all metric values for a set"
CREATE INDEX IF NOT EXISTS idx_ws_metrics_set
ON public.workout_set_metric_values (workout_set_id);
```

### Template/Exercise Ordering
```sql
-- Immediate workout exercise list rendering
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_order
ON public.workout_exercises (workout_id, order_index);
```

### Grips Optimization
```sql
-- Default grips lookup
CREATE INDEX IF NOT EXISTS idx_exercise_default_grips_ex_order
ON public.exercise_default_grips (exercise_id, order_index);

-- Set-specific grips
CREATE INDEX IF NOT EXISTS idx_workout_set_grips_set
ON public.workout_set_grips (workout_set_id);

CREATE INDEX IF NOT EXISTS idx_workout_set_grips_grip
ON public.workout_set_grips (grip_id);
```

### Personal Records & History
```sql
-- PR lookups for AI suggestions
CREATE INDEX IF NOT EXISTS idx_pr_user_ex_time
ON public.personal_records (user_id, exercise_id, achieved_at DESC);
```

### Exercise Search
```sql
-- Enable fuzzy search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fuzzy search on exercise names
CREATE INDEX IF NOT EXISTS idx_exercises_name_trgm
ON public.exercises USING gin (name gin_trgm_ops);

-- Common filter indexes
CREATE INDEX IF NOT EXISTS idx_exercises_equipment
ON public.exercises (equipment_id);

CREATE INDEX IF NOT EXISTS idx_exercises_body_part
ON public.exercises (body_part_id);
```

---

## Task 2: Performance Materialized Views
**Priority: HIGH - Makes UI feel instant**

### Last Set Snapshot View
```sql
CREATE MATERIALIZED VIEW public.mv_last_set_per_user_exercise AS
SELECT ws.user_id,
       we.exercise_id,
       ws.weight, ws.reps, ws.completed_at,
       row_number() OVER (PARTITION BY ws.user_id, we.exercise_id ORDER BY ws.completed_at DESC) AS rn
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
JOIN public.workouts w ON w.id = we.workout_id
WHERE ws.is_completed = true;

CREATE UNIQUE INDEX ON public.mv_last_set_per_user_exercise (user_id, exercise_id, rn);
```

### Personal Records View
```sql
CREATE MATERIALIZED VIEW public.mv_pr_weight_per_user_exercise AS
SELECT w.user_id,
       we.exercise_id,
       max(ws.weight) AS best_weight
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
JOIN public.workouts w ON w.id = we.workout_id
WHERE ws.is_completed = true AND ws.weight IS NOT NULL
GROUP BY 1,2;

CREATE UNIQUE INDEX ON public.mv_pr_weight_per_user_exercise (user_id, exercise_id);
```

---

## Task 3: Edge Function for MV Refresh
**Priority: HIGH - Keeps materialized views current**

Create edge function to refresh materialized views after set logging:
- Refreshes only for current user+exercise 
- Keeps cost low and UI instant
- Triggers after successful set completion

---

## Task 4: RLS Policies Audit & Optimization
**Priority: MEDIUM - Security & Performance**

- Create reusable `is_owner(uuid_owner)` SQL functions
- Deduplicate policies across user-owned tables:
  - workouts, workout_exercises, workout_sets
  - templates, personal_records, user_settings
- Make policy checks cheaper and more maintainable

---

## Task 5: FlutterFlow-Optimized RPC Functions
**Priority: MEDIUM - API Surface**

### Core RPCs
```sql
-- Single-call workout opening
rpc.workout_open(workout_id) 
→ ordered exercises + last set snapshot + template targets

-- Atomic set logging
rpc.set_log(payload) 
→ upserts set + grips + metric values + refreshes MVs

-- Optimized exercise search
rpc.exercise_search(q, equipment_id, body_part_id, limit, offset)
→ leverages trigram & filter indexes
```

---

## Task 6: React Query Optimization
**Priority: MEDIUM - Frontend Performance**

- Implement batch invalidation for `['workout', id]` and `['exercise', id, 'last']` keys
- Optimize cache invalidation after set logging
- Reduce unnecessary refetches

---

## Task 7: Edge Caching Strategy
**Priority: LOW - Nice to have**

- Cache public metadata (exercises, grips, translations)
- 10-30m TTL for rarely changing data
- Reduce database load for static content

---

## Task 8: Telemetry & Monitoring
**Priority: LOW - Long-term maintenance**

- Enable `pg_stat_statements` for query performance tracking
- Log 99p query times and function latency
- Create "slowest 10" dashboard
- Target < 50ms for hot endpoints at p95

---

## Implementation Status:

✅ **Task 1: Core Database Indexes & Constraints** - COMPLETED
- Added unique constraints for workout sets
- Created performance indexes for hot paths
- Enabled fuzzy search with pg_trgm extension

✅ **Task 2: Performance Materialized Views** - COMPLETED  
- Created mv_last_set_per_user_exercise for instant last set lookups
- Created mv_pr_weight_per_user_exercise for instant PR lookups
- Added security helper functions with proper access control

✅ **Task 3: Edge Function for MV Refresh** - COMPLETED
- Created refresh-exercise-views edge function
- Handles async materialized view refreshing after set logging

✅ **Task 5: FlutterFlow-Optimized RPC Functions** - COMPLETED
- workout_open(workout_id) - Single call workout data with exercises, sets, last sets, PRs
- set_log(payload) - Atomic set logging with grips + metrics + MV refresh
- exercise_search() - Optimized search leveraging trigram indexes

✅ **Task 6: React Query Optimization** - COMPLETED
- Created useOptimizedWorkout.ts with hooks for all new functions
- Implemented batch invalidation and optimistic updates
- Added proper caching strategies with appropriate stale times

🔄 **Remaining Tasks:**
4. RLS Policies Audit & Optimization - MEDIUM Priority
7. Edge Caching Strategy - LOW Priority  
8. Telemetry & Monitoring - LOW Priority

---

## Performance Improvements Achieved:

🚀 **Database Level:**
- Unique constraints prevent data integrity issues
- Optimized indexes for all hot query paths
- Fuzzy search capability for exercise discovery
- Materialized views provide instant access to last sets and PRs

🚀 **API Level:**
- Single-call workout opening reduces round trips
- Atomic set logging with built-in data consistency
- Optimized search with similarity scoring

🚀 **Frontend Level:**  
- React Query hooks with intelligent caching
- Batch invalidation reduces unnecessary API calls
- Proper stale time configuration for different data types

## Next Steps:
The high-impact optimizations are complete. The remaining tasks can be implemented as needed based on usage patterns and performance monitoring.