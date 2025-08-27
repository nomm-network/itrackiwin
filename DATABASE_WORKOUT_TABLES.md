# Workout-Related Tables Detailed Export

## Core Workout Flow Tables

### workouts
**Purpose**: Main workout sessions
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL  -- FK to auth.users
- template_id: uuid, NULL  -- FK to workout_templates (optional)
- name: text, NULL
- notes: text, NULL
- started_at: timestamptz, NOT NULL, DEFAULT: now()
- ended_at: timestamptz, NULL
- gym_id: uuid, NULL  -- FK to gyms
- estimated_calories_burned: int4, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

### workout_exercises
**Purpose**: Exercises within a workout session
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- workout_id: uuid, NOT NULL  -- FK to workouts
- exercise_id: uuid, NOT NULL  -- FK to exercises
- order_index: int4, NOT NULL, DEFAULT: 0
- notes: text, NULL
- warmup_plan: jsonb, NULL
- target_settings: jsonb, NULL
- display_name: text, NULL
- grip_key: text, NULL  -- For grip tracking
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

### workout_sets
**Purpose**: Individual sets performed
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- workout_exercise_id: uuid, NOT NULL  -- FK to workout_exercises
- set_index: int4, NOT NULL
- set_kind: set_type, NOT NULL, DEFAULT: 'normal'::set_type
- weight: numeric, NULL
- reps: int2, NULL
- weight_unit: text, NULL, DEFAULT: 'kg'::text
- notes: text, NULL
- is_completed: bool, NOT NULL, DEFAULT: false
- completed_at: timestamptz, NULL
- rpe: int2, NULL  -- Rate of Perceived Exertion
- rest_seconds: int4, NULL
- side: text, NULL  -- For unilateral exercises
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

## Template System Tables

### workout_templates
**Purpose**: Reusable workout blueprints
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL  -- FK to auth.users
- name: text, NOT NULL
- description: text, NULL
- notes: text, NULL
- is_public: bool, NOT NULL, DEFAULT: false
- tags: jsonb, NULL, DEFAULT: '[]'::jsonb
- estimated_duration_minutes: int4, NULL
- difficulty_level: int2, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

### template_exercises
**Purpose**: Exercises within templates
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_id: uuid, NOT NULL  -- FK to workout_templates
- exercise_id: uuid, NOT NULL  -- FK to exercises
- order_index: int4, NOT NULL, DEFAULT: 0
- default_sets: int2, NULL
- target_reps: int2, NULL
- target_weight: numeric, NULL
- weight_unit: text, NULL, DEFAULT: 'kg'::text
- notes: text, NULL
- target_settings: jsonb, NULL
- display_name: text, NULL
- grip_ids: _text, NULL  -- Array of grip IDs
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

### template_exercise_handles
**Purpose**: Chosen handles for template exercises
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_exercise_id: uuid, NOT NULL  -- FK to template_exercises
- handle_id: uuid, NOT NULL  -- FK to handles
- created_at: timestamptz, NOT NULL, DEFAULT: now()
```

### template_exercise_grips
**Purpose**: Chosen grips for template exercises
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_exercise_id: uuid, NOT NULL  -- FK to template_exercises
- grip_id: uuid, NOT NULL  -- FK to grips
- created_at: timestamptz, NOT NULL, DEFAULT: now()
```

## Exercise Definition Tables

### exercises
**Purpose**: Exercise definitions
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- owner_user_id: uuid, NOT NULL  -- FK to auth.users
- equipment_id: uuid, NOT NULL  -- FK to equipment
- is_public: bool, NOT NULL, DEFAULT: true
- image_url: text, NULL
- thumbnail_url: text, NULL
- source_url: text, NULL
- is_bar_loaded: bool, NOT NULL, DEFAULT: false
- default_bar_weight: numeric, NULL
- loading_hint: text, NULL
- complexity_score: int2, NULL, DEFAULT: 3
- contraindications: jsonb, NULL, DEFAULT: '[]'::jsonb
- body_part_id: uuid, NULL  -- FK to body_parts
- primary_muscle_id: uuid, NULL  -- FK to muscles
- secondary_muscle_group_ids: _uuid, NULL  -- Array of muscle IDs
- movement_pattern: movement_pattern, NULL
- exercise_skill_level: exercise_skill_level, NULL, DEFAULT: 'medium'
- popularity_rank: int4, NULL
- default_handle_ids: _uuid, NULL  -- Array of handle IDs
- default_grip_ids: _uuid, NULL, DEFAULT: '{}'::uuid[]
- capability_schema: jsonb, NULL, DEFAULT: '{}'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()
```

## Handles & Grips System

### handles
**Purpose**: Exercise attachments/handles (bars, ropes, etc.)
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- category: text, NOT NULL  -- 'bar','pulldown','row','cable','rope','single','d-handle','triangle','ez-bar','v-bar','other'
- created_at: timestamptz, NOT NULL, DEFAULT: now()
```

### handle_translations
**Purpose**: Handle names in different languages
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- handle_id: uuid, NOT NULL  -- FK to handles
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

### exercise_handles
**Purpose**: Maps which handles are compatible with which exercises
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL  -- FK to exercises
- handle_id: uuid, NOT NULL  -- FK to handles
- is_default: bool, NOT NULL, DEFAULT: false
- created_at: timestamptz, NOT NULL, DEFAULT: now()
```

### grips
**Purpose**: Grip styles (overhand, underhand, neutral, etc.)
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- category: text, NOT NULL
- is_compatible_with: jsonb, NULL, DEFAULT: '[]'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()
```

### grips_translations
**Purpose**: Grip names in different languages
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- grip_id: uuid, NOT NULL  -- FK to grips
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

### exercise_handle_grips
**Purpose**: Recommended grips for specific exercise+handle combinations
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL  -- FK to exercises
- handle_id: uuid, NOT NULL  -- FK to handles
- grip_id: uuid, NOT NULL  -- FK to grips
- created_at: timestamptz, NOT NULL, DEFAULT: now()
```

## Equipment Tables

### equipment
**Purpose**: Gym equipment definitions
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- equipment_type: text, NOT NULL, DEFAULT: 'machine'::text
- default_stack: jsonb, NULL, DEFAULT: '[]'::jsonb
- weight_kg: numeric, NULL
- kind: text, NULL
- load_type: load_type, NULL, DEFAULT: 'none'::load_type
- load_medium: load_medium, NULL, DEFAULT: 'other'::load_medium
- default_bar_weight_kg: numeric, NULL
- default_single_min_increment_kg: numeric, NULL
- default_side_min_plate_kg: numeric, NULL
- notes: text, NULL
```

### equipment_translations
**Purpose**: Equipment names in different languages
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- equipment_id: uuid, NOT NULL  -- FK to equipment
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

## Progress Tracking Tables

### personal_records
**Purpose**: User's personal bests
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL  -- FK to auth.users
- exercise_id: uuid, NOT NULL  -- FK to exercises
- kind: text, NOT NULL  -- 'heaviest', 'reps', '1RM'
- value: numeric, NOT NULL
- unit: text, NOT NULL
- achieved_at: timestamptz, NOT NULL, DEFAULT: now()
- workout_set_id: uuid, NULL  -- FK to workout_sets
- grip_key: text, NULL  -- For grip-specific PRs
- created_at: timestamptz, NOT NULL, DEFAULT: now()
```

### user_exercise_stats
**Purpose**: Aggregated exercise statistics
```sql
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL  -- FK to auth.users
- exercise_id: uuid, NOT NULL  -- FK to exercises
- total_sessions: int4, NOT NULL, DEFAULT: 0
- total_sets: int4, NOT NULL, DEFAULT: 0
- total_reps: int4, NOT NULL, DEFAULT: 0
- total_volume_kg: numeric, NOT NULL, DEFAULT: 0
- best_weight: numeric, NULL
- best_1rm: numeric, NULL
- first_session: timestamptz, NULL
- last_session: timestamptz, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()
```

## Key Enums Used

### set_type
- 'normal'
- 'warmup' 
- 'drop'
- 'amrap'
- 'top_set'
- 'backoff'

### movement_pattern
- 'squat'
- 'hinge'
- 'lunge'
- 'push'
- 'pull'
- 'carry'
- 'gait'
- 'corrective'

### exercise_skill_level
- 'beginner'
- 'medium'
- 'advanced'

### load_type
- 'none'
- 'dual_load' 
- 'single_load'
- 'stack'

### load_medium
- 'plates'
- 'dumbbells'
- 'stack'
- 'bodyweight'
- 'resistance_band'
- 'other'

## Data Flow Summary

1. **Templates** → define reusable workout blueprints
2. **Workouts** → created from templates or built manually
3. **Workout Exercises** → exercises added to a workout session
4. **Workout Sets** → individual sets performed for each exercise
5. **Handles/Grips** → specify exactly how exercises are performed
6. **Personal Records** → automatically tracked from completed sets
7. **Exercise Stats** → aggregated performance data

This system supports:
- Complete workout tracking with sets, reps, weights
- Handle and grip specification for precise exercise variation
- Template-based workout creation
- Personal record tracking
- Multi-language support
- Complex equipment and loading configurations