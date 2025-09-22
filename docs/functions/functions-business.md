# Business Logic Functions

Database functions implementing core business rules, calculations, and workflows.

## 🏋️‍♀️ Workout Management

### `start_workout(template_id uuid)`
**Purpose**: Initialize new workout session from template with readiness adjustments  
**Returns**: `uuid` (workout_id)  
**Security**: SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id          uuid;
  v_workout_id       uuid;
  v_score            numeric;     -- readiness 0..100
  v_multiplier       numeric;     -- readiness multiplier (e.g. 1.02)
  rec                RECORD;      -- template exercise row
  v_base_weight      numeric;     -- picked from last 3 workouts 60 days
  v_target_weight    numeric;     -- final target for this workout
  v_attr             jsonb;       -- attribute_values_json builder
BEGIN
  -- Auth check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create workout shell
  INSERT INTO public.workouts (user_id, started_at, template_id)
  VALUES (v_user_id, now(), p_template_id)
  RETURNING id INTO v_workout_id;

  -- If no template: just return new workout id
  IF p_template_id IS NULL THEN
    RETURN v_workout_id;
  END IF;

  -- Template ownership validation
  IF NOT EXISTS (
    SELECT 1 FROM public.workout_templates t
    WHERE t.id = p_template_id AND t.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Template not found or access denied';
  END IF;

  -- Compute readiness score (0..100)
  SELECT public.compute_readiness_for_user(v_user_id) INTO v_score;

  -- Readiness multiplier (0.90 .. 1.08 etc.)
  SELECT public.readiness_multiplier(COALESCE(v_score, 65)) INTO v_multiplier;

  -- Copy template_exercises → workout_exercises
  FOR rec IN
    SELECT te.exercise_id, te.order_index, te.default_sets,
           te.target_reps, te.target_weight_kg, te.weight_unit
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST
  LOOP
    -- Pick base load from recent history
    SELECT public.pick_base_load(v_user_id, rec.exercise_id) INTO v_base_weight;

    -- Calculate target weight with readiness adjustment
    v_target_weight := COALESCE(
      rec.target_weight_kg,
      CASE
        WHEN v_base_weight IS NULL THEN NULL
        ELSE ROUND(v_base_weight * v_multiplier, 1)
      END
    );

    -- Build metadata for transparency
    v_attr := jsonb_build_object(
      'base_weight_kg', v_base_weight,
      'readiness_score', COALESCE(v_score, 65),
      'readiness_multiplier', COALESCE(v_multiplier, 1.0)
    );

    -- Add warmup steps if target weight exists
    IF v_target_weight IS NOT NULL THEN
      v_attr := jsonb_set(v_attr, '{warmup}',
        public.generate_warmup_steps(v_target_weight), true);
    END IF;

    -- Insert workout_exercise
    INSERT INTO public.workout_exercises (
      workout_id, exercise_id, order_index, target_sets,
      target_reps, target_weight_kg, weight_unit,
      attribute_values_json, readiness_adjusted_from
    ) VALUES (
      v_workout_id, rec.exercise_id, rec.order_index, rec.default_sets,
      rec.target_reps, v_target_weight, COALESCE(rec.weight_unit, 'kg'),
      v_attr, NULL
    );
  END LOOP;

  -- Store workout-level readiness snapshot
  UPDATE public.workouts
  SET readiness_score = COALESCE(v_score, 65)
  WHERE id = v_workout_id;

  RETURN v_workout_id;
END;
$$;
```

**Features**:
- Template validation and ownership check
- Automatic readiness score calculation
- Dynamic weight adjustment based on readiness
- Warmup generation for target weights
- Comprehensive metadata tracking
- Error handling for authentication and permissions

### `end_workout(workout_id uuid)`
**Purpose**: Finalize workout session  
**Returns**: `uuid` (workout_id)

```sql
CREATE OR REPLACE FUNCTION public.end_workout(p_workout_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.workouts SET ended_at = now()
  WHERE id = p_workout_id AND user_id = auth.uid()
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    RAISE EXCEPTION 'Workout not found or not owned by user';
  END IF;

  RETURN v_id;
END;
$$;
```

---

## 📊 Performance Analysis

### `epley_1rm(weight numeric, reps integer)`
**Purpose**: Calculate estimated 1-rep max using Epley formula  
**Returns**: `numeric`

```sql
CREATE OR REPLACE FUNCTION public.epley_1rm(weight numeric, reps integer)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF weight IS NULL OR reps IS NULL OR reps <= 0 THEN
    RETURN NULL;
  END IF;
  RETURN weight * (1 + reps::numeric / 30.0);
END;
$$;
```

**Formula**: `1RM = weight × (1 + reps ÷ 30)`  
**Usage**: Exercise performance tracking and progression planning

### `compute_total_weight(entry_mode, value, bar_weight, is_symmetrical)`
**Purpose**: Calculate total weight from different entry methods  
**Returns**: `numeric`

```sql
CREATE OR REPLACE FUNCTION public.compute_total_weight(
  p_entry_mode text, 
  p_value numeric, 
  p_bar_weight numeric, 
  p_is_symmetrical boolean DEFAULT true
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_entry_mode = 'total' THEN COALESCE(p_value,0)
    WHEN p_entry_mode = 'one_side' THEN 
      COALESCE(p_bar_weight,0) + 
      CASE WHEN COALESCE(p_is_symmetrical,true) THEN 2 ELSE 1 END * 
      COALESCE(p_value,0)
    ELSE null
  END;
$$;
```

**Entry Modes**:
- `total`: Direct total weight entry
- `one_side`: Calculate from plates per side + bar weight

---

## 🎯 Readiness System

### `compute_readiness_for_user(user_id uuid)`
**Purpose**: Calculate user readiness score from various factors  
**Returns**: `numeric` (0-100 scale)

**Implementation**: Aggregates multiple readiness indicators:
- Sleep quality metrics
- Stress levels
- Previous workout recovery
- Nutrition factors
- User subjective ratings

### `readiness_multiplier(readiness_score numeric)`
**Purpose**: Convert readiness score to workout intensity multiplier  
**Returns**: `numeric` (typically 0.85 - 1.15)

**Logic**:
- Low readiness (< 50): Reduce weights (0.85-0.95x)
- Normal readiness (50-80): Standard weights (0.95-1.05x)  
- High readiness (> 80): Increase weights (1.05-1.15x)

---

## ⚖️ Equipment & Weight Calculations

### `closest_machine_weight(desired numeric, stack numeric[], aux numeric[])`
**Purpose**: Find closest achievable weight on stack machine  
**Returns**: `numeric`

```sql
CREATE OR REPLACE FUNCTION public.closest_machine_weight(
  desired numeric, 
  stack numeric[], 
  aux numeric[]
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  candidate numeric;
  best numeric := NULL;
  diff numeric := NULL;
  a numeric;
BEGIN
  -- Check exact stack steps
  FOREACH candidate IN ARRAY stack LOOP
    IF diff IS NULL OR abs(candidate - desired) < diff THEN
      best := candidate; 
      diff := abs(candidate - desired);
    END IF;
    
    -- Check stack + one aux plate
    FOREACH a IN ARRAY aux LOOP
      IF diff IS NULL OR abs(candidate + a - desired) < diff THEN
        best := candidate + a; 
        diff := abs(candidate + a - desired);
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN COALESCE(best, 0);
END
$$;
```

### `bar_min_increment(gym_id uuid)`
**Purpose**: Calculate minimum weight increment for barbell at gym  
**Returns**: `numeric`

```sql
CREATE OR REPLACE FUNCTION public.bar_min_increment(_gym_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH all_fracs AS (
    SELECT weight FROM public.user_gym_plates WHERE user_gym_id = _gym_id
    UNION
    SELECT weight FROM public.user_gym_miniweights WHERE user_gym_id = _gym_id
  )
  SELECT COALESCE(MIN(weight), 1)::numeric * 2
  FROM all_fracs;
$$;
```

### `next_weight_step_kg(load_type, side_min_plate_kg, single_min_increment_kg)`
**Purpose**: Calculate next possible weight increment  
**Returns**: `numeric`

```sql
CREATE OR REPLACE FUNCTION public.next_weight_step_kg(
  p_load_type load_type, 
  p_side_min_plate_kg numeric, 
  p_single_min_increment_kg numeric
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_load_type = 'dual_load' THEN 2 * COALESCE(p_side_min_plate_kg, 1.25)
    WHEN p_load_type IN ('single_load','stack') THEN COALESCE(p_single_min_increment_kg, 2.5)
    ELSE 0
  END;
$$;
```

---

## 🏆 Achievement & Progress

### `fn_detect_stagnation(exercise_id uuid, lookback_sessions integer)`
**Purpose**: Analyze exercise performance for plateaus  
**Returns**: `jsonb` with analysis and recommendations

```sql
CREATE OR REPLACE FUNCTION public.fn_detect_stagnation(
  p_exercise_id uuid, 
  p_lookback_sessions integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_recent_weights NUMERIC[];
  v_recent_reps INTEGER[];
  v_trend_direction TEXT;
  v_stagnation_detected BOOLEAN := false;
  v_recommendations TEXT[];
  v_avg_weight NUMERIC;
  v_weight_variance NUMERIC;
BEGIN
  -- Get recent performance data
  SELECT 
    array_agg(ws.weight ORDER BY w.started_at DESC),
    array_agg(ws.reps ORDER BY w.started_at DESC)
  INTO v_recent_weights, v_recent_reps
  FROM public.workouts w
  JOIN public.workout_exercises we ON we.workout_id = w.id
  JOIN public.workout_sets ws ON ws.workout_exercise_id = we.id
  WHERE w.user_id = v_user_id
    AND we.exercise_id = p_exercise_id
    AND ws.set_kind IN ('normal', 'top_set', 'backoff')
    AND ws.is_completed = true
    AND w.ended_at IS NOT NULL
  ORDER BY w.started_at DESC
  LIMIT p_lookback_sessions;

  -- Check if we have enough data
  IF array_length(v_recent_weights, 1) < 3 THEN
    RETURN jsonb_build_object(
      'stagnation_detected', false,
      'reason', 'Insufficient data',
      'sessions_analyzed', COALESCE(array_length(v_recent_weights, 1), 0)
    );
  END IF;

  -- Calculate weight variance
  SELECT AVG(weight), VARIANCE(weight) 
  INTO v_avg_weight, v_weight_variance
  FROM unnest(v_recent_weights) AS weight;

  -- Detect stagnation: same weight for 3+ sessions with low variance
  IF v_weight_variance < 25 AND array_length(v_recent_weights, 1) >= 3 THEN
    v_stagnation_detected := true;
    v_trend_direction := 'plateau';
    
    v_recommendations := ARRAY[
      'Consider a deload week (reduce weight by 10-20%)',
      'Try a different rep range (if doing 8 reps, try 5 or 12)',
      'Add pause reps or tempo work',
      'Check form and full range of motion',
      'Ensure adequate recovery between sessions'
    ];
  END IF;

  -- Check for declining trend
  IF v_recent_weights[1] < v_recent_weights[array_length(v_recent_weights, 1)] THEN
    v_stagnation_detected := true;
    v_trend_direction := 'declining';
    
    v_recommendations := ARRAY[
      'Review nutrition and sleep quality',
      'Consider longer rest periods between sessions',
      'Check for overtraining in other exercises',
      'Evaluate stress levels and recovery',
      'Consider switching to an easier variation temporarily'
    ];
  END IF;

  RETURN jsonb_build_object(
    'stagnation_detected', v_stagnation_detected,
    'trend_direction', v_trend_direction,
    'sessions_analyzed', array_length(v_recent_weights, 1),
    'avg_weight', v_avg_weight,
    'weight_variance', v_weight_variance,
    'recent_weights', v_recent_weights,
    'recommendations', v_recommendations,
    'analysis_date', now()
  );
END;
$$;
```

---

## 🤖 AI Coach Functions

### `fn_suggest_sets(exercise_id uuid, progression_type text, target_reps integer)`
**Purpose**: AI-powered set recommendations  
**Returns**: `jsonb` with workout suggestions

```sql
-- Returns personalized set/rep/weight recommendations based on:
-- - Recent performance history
-- - 1RM estimates  
-- - Progression methodology
-- - User experience level
```

### `fn_suggest_warmup(exercise_id uuid, working_weight numeric, working_reps integer)`
**Purpose**: Generate warmup progression  
**Returns**: `jsonb` with warmup sets

```sql
-- Generates progressive warmup based on:
-- - Target working weight
-- - Exercise movement pattern
-- - User warmup preferences
-- - Equipment availability
```

### `fn_suggest_rest_seconds(workout_set_id uuid, effort_level text)`
**Purpose**: Recommend rest periods between sets  
**Returns**: `integer` (seconds)

```sql
-- Calculates optimal rest based on:
-- - Set type (warmup, working, AMRAP)
-- - Exercise intensity
-- - User effort level
-- - Superset considerations
```

---

## 📈 Business Intelligence

### `create_demo_template_for_current_user()`
**Purpose**: Generate sample workout template for new users  
**Returns**: `uuid` (template_id)

```sql
-- Creates "Push Day" demo template with:
-- - Barbell Bench Press (3x8)
-- - Overhead Press (3x10)  
-- - Triceps Pushdown (3x12)
-- Helps onboard new users with working example
```

---

## 🎮 Gamification Functions

### Auto-deload System
**Purpose**: Automatically reduce weights when performance declines  
**Tables**: `auto_deload_triggers`

**Logic**:
1. Monitor performance trends per exercise
2. Trigger deload when stagnation detected
3. Apply percentage reduction (default 10%)
4. Track deload events for analysis

### Achievement Progress
**Purpose**: Update user achievement progress automatically  
**Implementation**: Trigger-based system

**Features**:
- Real-time progress updates
- Complex criteria evaluation (JSONB)
- Point system integration
- Social sharing capabilities

---

## 🔧 Utility Business Functions

### `enforce_max_pins()`
**Purpose**: Limit user pinned subcategories to maximum of 3  
**Type**: Trigger Function

### `populate_grip_key_from_workout_exercise()`
**Purpose**: Auto-populate grip metadata in workout sets  
**Type**: Trigger Function

### `assign_next_set_index()`
**Purpose**: Auto-assign sequential set numbers  
**Type**: Trigger Function

### `trigger_initialize_warmup()`
**Purpose**: Auto-generate warmup when target weight is set  
**Type**: Trigger Function

---

## 📊 Function Performance

### Optimization Features
- `IMMUTABLE` functions cached by PostgreSQL
- `STABLE` functions consistent within transaction
- `SECURITY DEFINER` for controlled privilege escalation
- Proper indexing on function parameters

### Monitoring
- `coach_logs` table tracks AI function performance
- Execution time monitoring
- Error rate tracking
- Input/output analysis for improvement