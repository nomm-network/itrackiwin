# Core Database Functions

## Readiness & Scoring Functions

### `compute_readiness_for_user(p_user_id uuid)`
**Returns**: `numeric`
**Purpose**: Main entry point for calculating user readiness score

```sql
DECLARE
  latest_checkin_id uuid;
  readiness_score numeric;
BEGIN
  -- Get the most recent checkin for today or yesterday
  SELECT id INTO latest_checkin_id
  FROM public.readiness_checkins
  WHERE user_id = p_user_id
    AND checkin_at >= CURRENT_DATE - INTERVAL '1 day'
  ORDER BY checkin_at DESC
  LIMIT 1;

  IF latest_checkin_id IS NULL THEN
    -- No recent checkin, return default moderate score
    RETURN 65.0;
  END IF;

  -- Compute and return the score
  SELECT public.fn_compute_readiness_score_v1(latest_checkin_id, true)
  INTO readiness_score;

  RETURN COALESCE(readiness_score, 65.0);
END;
```

### `fn_compute_readiness_score_v1(p_checkin_id uuid, p_persist boolean)`
**Returns**: `numeric`
**Purpose**: Core readiness calculation algorithm

```sql
DECLARE
  r record;
  n_energy          numeric;
  n_sleep_quality   numeric;
  sleep_hours_score numeric;
  soreness_score    numeric;
  stress_score      numeric;
  mood_score        numeric;
  energizers_score  numeric;
  base              numeric;
  final_score       numeric;
BEGIN
  SELECT
    energy, 
    sleep_quality, 
    sleep_hours, 
    soreness,  -- mapped from muscle_soreness 
    stress,
    illness    AS sick,        -- mapped from feeling_sick
    alcohol    AS alcohol_24h, -- mapped from had_alcohol_24h
    energizers,
    mood
  INTO r
  FROM public.readiness_checkins
  WHERE id = p_checkin_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'checkin % not found', p_checkin_id;
  END IF;

  -- Normalize 0-10 scale inputs to 0-1
  n_energy        := LEAST(GREATEST(COALESCE(r.energy, 5) / 10.0, 0), 1);
  n_sleep_quality := LEAST(GREATEST(COALESCE(r.sleep_quality, 5) / 10.0, 0), 1);

  -- Sleep hours: favor 7-9h (center at 8h), linear penalty
  sleep_hours_score := 1 - (ABS(COALESCE(r.sleep_hours, 8) - 8) / 4.0);
  sleep_hours_score := LEAST(GREATEST(sleep_hours_score, 0), 1);

  -- Invert negative factors (higher soreness/stress = lower score)
  soreness_score := 1 - LEAST(GREATEST(COALESCE(r.soreness, 0) / 10.0, 0), 1);
  stress_score   := 1 - LEAST(GREATEST(COALESCE(r.stress, 0) / 10.0, 0), 1);
  
  -- Include mood as positive factor
  mood_score := LEAST(GREATEST(COALESCE(r.mood, 5) / 10.0, 0), 1);

  -- Energizers: small boost if taken
  energizers_score := CASE WHEN COALESCE(r.energizers, false) THEN 0.8 ELSE 0.2 END;

  -- Weighted base score (all weights sum to 1.00)
  base :=
      0.20 * n_energy           -- Energy level
    + 0.18 * n_sleep_quality    -- Sleep quality  
    + 0.15 * sleep_hours_score  -- Sleep duration
    + 0.15 * soreness_score     -- Muscle recovery
    + 0.12 * stress_score       -- Stress level (inverted)
    + 0.10 * mood_score         -- Mood/motivation
    + 0.10 * energizers_score;  -- Supplement boost

  -- Convert to 0-10 scale
  final_score := LEAST(GREATEST(base, 0), 1) * 10;

  -- Apply hard penalties
  IF COALESCE(r.sick, false) THEN
    final_score := final_score - 2.0;
  END IF;

  IF COALESCE(r.alcohol_24h, false) THEN
    final_score := final_score - 1.0;
  END IF;

  -- Final clamp to [0, 10]
  final_score := LEAST(GREATEST(final_score, 0), 10);

  -- Persist if requested
  IF p_persist THEN
    UPDATE public.readiness_checkins
      SET score = final_score, computed_at = now()
      WHERE id = p_checkin_id;
  END IF;

  RETURN final_score;
END;
```

## Workout Management Functions

### `start_workout(p_template_id uuid)`
**Returns**: `uuid`
**Purpose**: Initialize new workout from template with readiness adjustments

### `end_workout(p_workout_id uuid)`
**Returns**: `uuid`
**Purpose**: Complete workout session

### `log_workout_set(p_workout_exercise_id uuid, p_set_index integer, p_metrics jsonb, p_grip_ids uuid[])`
**Returns**: `uuid`
**Purpose**: Record individual set performance

## User & Authentication Functions

### `handle_new_user()`
**Returns**: `trigger`
**Purpose**: Auto-create user profile on signup

### `has_role(_user_id uuid, _role app_role)`
**Returns**: `boolean`
**Purpose**: Check user role permissions

### `is_admin(user_id uuid)`
**Returns**: `boolean`
**Purpose**: Quick admin status check

### `is_gym_admin(gym_id uuid)`
**Returns**: `boolean`
**Purpose**: Gym-specific admin permissions

### `is_pro_user(user_id uuid)`
**Returns**: `boolean`
**Purpose**: Check subscription status

## Exercise & Performance Functions

### `epley_1rm(weight numeric, reps integer)`
**Returns**: `numeric`
**Purpose**: Calculate estimated 1-rep maximum

### `get_last_sets_for_exercises(p_exercise_ids uuid[])`
**Returns**: `TABLE`
**Purpose**: Retrieve recent performance data for exercises

### `fn_suggest_warmup(p_exercise_id uuid, p_working_weight numeric, p_working_reps integer)`
**Returns**: `jsonb`
**Purpose**: Generate warmup progression

### `fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)`
**Returns**: `jsonb`
**Purpose**: Recommend set/rep schemes

### `fn_suggest_rest_seconds(p_workout_set_id uuid, p_effort_level text)`
**Returns**: `integer`
**Purpose**: Calculate optimal rest periods

## Utility Functions

### `slugify(txt text)`
**Returns**: `text`
**Purpose**: Convert text to URL-friendly slugs

### `short_hash_uuid(u uuid)`
**Returns**: `text`
**Purpose**: Generate short unique identifiers

### `compute_total_weight(p_entry_mode text, p_value numeric, p_bar_weight numeric, p_is_symmetrical boolean)`
**Returns**: `numeric`
**Purpose**: Calculate total weight including bar and plates

### `next_weight_step_kg(p_load_type load_type, p_side_min_plate_kg numeric, p_single_min_increment_kg numeric)`
**Returns**: `numeric`
**Purpose**: Determine next progression increment

## Text & Localization Functions

### `get_text(p_key text, p_language_code text)`
**Returns**: `text`
**Purpose**: Retrieve localized text content

### `get_life_categories_i18n(lang_code text)`
**Returns**: `TABLE`
**Purpose**: Get localized life categories

## Data Quality & Analysis Functions

### `fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)`
**Returns**: `jsonb`
**Purpose**: Identify training plateaus and provide recommendations