# Full Database Structure Export

## All Tables with Columns and Properties

### achievements
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- title: text, NOT NULL
- description: text, NOT NULL  
- icon: text, NOT NULL
- category: text, NOT NULL
- points: int4, NOT NULL, DEFAULT: 0
- criteria: jsonb, NOT NULL
- is_active: bool, NOT NULL, DEFAULT: true
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### admin_audit_log
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- action_type: text, NOT NULL
- target_user_id: uuid, NULL
- performed_by: uuid, NULL
- details: jsonb, NULL, DEFAULT: '{}'::jsonb
- ip_address: inet, NULL
- user_agent: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### admin_check_rate_limit
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- check_count: int4, NULL, DEFAULT: 1
- window_start: timestamptz, NOT NULL, DEFAULT: now()
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### auto_deload_triggers
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
- trigger_type: text, NOT NULL
- threshold_value: numeric, NULL
- is_triggered: bool, NULL, DEFAULT: false
- triggered_at: timestamptz, NULL
- deload_percentage: numeric, NULL, DEFAULT: 10.0
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### bar_types
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- name: text, NOT NULL
- default_weight: numeric, NOT NULL
- unit: weight_unit, NOT NULL, DEFAULT: 'kg'::weight_unit

### body_parts
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### body_parts_translations
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- body_part_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### challenge_participants
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- challenge_id: uuid, NOT NULL
- user_id: uuid, NOT NULL
- current_value: numeric, NULL, DEFAULT: 0
- joined_at: timestamptz, NOT NULL, DEFAULT: now()

### challenges
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- title: text, NOT NULL
- description: text, NULL
- challenge_type: text, NOT NULL
- target_value: numeric, NOT NULL
- target_unit: text, NULL
- start_date: date, NOT NULL
- end_date: date, NOT NULL
- creator_id: uuid, NOT NULL
- participants_count: int4, NULL, DEFAULT: 0
- is_public: bool, NULL, DEFAULT: true
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### coach_logs
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- session_id: uuid, NULL
- function_name: text, NOT NULL
- step: text, NOT NULL
- inputs: jsonb, NOT NULL, DEFAULT: '{}'::jsonb
- outputs: jsonb, NOT NULL, DEFAULT: '{}'::jsonb
- success: bool, NOT NULL, DEFAULT: true
- error_message: text, NULL
- execution_time_ms: int4, NULL
- metadata: jsonb, NULL, DEFAULT: '{}'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### cycle_events
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- kind: text, NOT NULL
- event_date: date, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### data_quality_reports
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- report_type: text, NOT NULL, DEFAULT: 'scheduled'::text
- total_exercises: int4, NOT NULL, DEFAULT: 0
- exercises_with_primary_muscle: int4, NOT NULL, DEFAULT: 0
- exercises_with_movement_pattern: int4, NOT NULL, DEFAULT: 0
- exercises_with_equipment_constraints: int4, NOT NULL, DEFAULT: 0
- primary_muscle_coverage_pct: numeric, NOT NULL, DEFAULT: 0
- movement_pattern_coverage_pct: numeric, NOT NULL, DEFAULT: 0
- equipment_constraints_coverage_pct: numeric, NOT NULL, DEFAULT: 0
- issues_found: jsonb, NOT NULL, DEFAULT: '[]'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### equipment
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

### equipment_translations
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- equipment_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### exercise_default_grips
- exercise_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- order_index: int4, NOT NULL, DEFAULT: 1

### exercise_equipment_variants
- exercise_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- is_preferred: bool, NOT NULL, DEFAULT: false

### exercise_grip_effects
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- muscle_id: uuid, NOT NULL
- effect_pct: numeric, NOT NULL
- is_primary_override: bool, NOT NULL, DEFAULT: false
- equipment_id: uuid, NULL
- note: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### exercise_grips
- exercise_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- order_index: int4, NOT NULL, DEFAULT: 1
- is_default: bool, NOT NULL, DEFAULT: false
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### exercise_handle_grips
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- handle_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### exercise_handles
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- handle_id: uuid, NOT NULL
- is_default: bool, NOT NULL, DEFAULT: false
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### exercise_images
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- user_id: uuid, NOT NULL
- path: text, NOT NULL
- url: text, NOT NULL
- is_primary: bool, NOT NULL, DEFAULT: false
- order_index: int4, NOT NULL, DEFAULT: 1
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### exercise_metric_defs
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- metric_id: uuid, NOT NULL
- exercise_id: uuid, NULL
- equipment_id: uuid, NULL
- order_index: int4, NOT NULL, DEFAULT: 1
- is_required: bool, NOT NULL, DEFAULT: false
- default_value: jsonb, NULL

### exercise_similars
- exercise_id: uuid, NOT NULL
- similar_exercise_id: uuid, NOT NULL
- similarity_score: numeric, NULL, DEFAULT: 0.8
- reason: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### exercises
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- owner_user_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- is_public: bool, NOT NULL, DEFAULT: true
- image_url: text, NULL
- thumbnail_url: text, NULL
- source_url: text, NULL
- is_bar_loaded: bool, NOT NULL, DEFAULT: false
- default_bar_weight: numeric, NULL
- loading_hint: text, NULL
- complexity_score: int2, NULL, DEFAULT: 3
- contraindications: jsonb, NULL, DEFAULT: '[]'::jsonb
- body_part_id: uuid, NULL
- primary_muscle_id: uuid, NULL
- secondary_muscle_group_ids: _uuid, NULL
- movement_pattern: movement_pattern, NULL
- exercise_skill_level: exercise_skill_level, NULL, DEFAULT: 'medium'::exercise_skill_level
- popularity_rank: int4, NULL
- default_handle_ids: _uuid, NULL
- default_grip_ids: _uuid, NULL, DEFAULT: '{}'::uuid[]
- capability_schema: jsonb, NULL, DEFAULT: '{}'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### exercises_translations
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- exercise_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### experience_level_configs
- experience_level: experience_level, NOT NULL
- start_intensity_low: numeric, NOT NULL
- start_intensity_high: numeric, NOT NULL
- warmup_set_count_min: int2, NOT NULL
- warmup_set_count_max: int2, NOT NULL
- main_rest_seconds_min: int2, NOT NULL
- main_rest_seconds_max: int2, NOT NULL
- weekly_progress_pct: numeric, NOT NULL
- allow_high_complexity: bool, NOT NULL, DEFAULT: false
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### friendships
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- requester_id: uuid, NOT NULL
- addressee_id: uuid, NOT NULL
- status: text, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### geography_columns
- f_table_catalog: name, NULL
- f_table_schema: name, NULL
- f_table_name: name, NULL
- f_geography_column: name, NULL
- coord_dimension: int4, NULL
- srid: int4, NULL
- type: text, NULL

### geometry_columns
- f_table_catalog: varchar, NULL
- f_table_schema: name, NULL
- f_table_name: name, NULL
- f_geometry_column: name, NULL
- coord_dimension: int4, NULL
- srid: int4, NULL
- type: varchar, NULL

### grips
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- category: text, NOT NULL
- is_compatible_with: jsonb, NULL, DEFAULT: '[]'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### grips_translations
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- grip_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### gym_admins
- gym_id: uuid, NOT NULL
- user_id: uuid, NOT NULL
- role: text, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### gym_aliases
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- alias: text, NOT NULL

### gym_equipment
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- loading_mode: text, NOT NULL
- bar_weight_kg: numeric, NULL
- min_plate_kg: numeric, NULL
- is_symmetrical: bool, NOT NULL, DEFAULT: true
- has_micro_plates: bool, NOT NULL, DEFAULT: false
- micro_plate_min_kg: numeric, NULL
- stack_increment_kg: numeric, NULL
- stack_has_magnet: bool, NOT NULL, DEFAULT: false
- stack_micro_kg: numeric, NULL
- fixed_increment_kg: numeric, NULL
- notes: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### gym_equipment_availability
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- quantity: int4, NOT NULL, DEFAULT: 1
- is_functional: bool, NOT NULL, DEFAULT: true
- brand: text, NULL
- model: text, NULL
- notes: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### gym_equipment_overrides
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- equipment_id: uuid, NOT NULL
- bar_weight_kg: numeric, NULL
- side_min_plate_kg: numeric, NULL
- single_min_increment_kg: numeric, NULL
- created_at: timestamptz, NULL, DEFAULT: now()
- updated_at: timestamptz, NULL, DEFAULT: now()

### gym_plate_inventory
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- gym_id: uuid, NOT NULL
- plate_kg: numeric, NOT NULL
- count: int4, NOT NULL
- created_at: timestamptz, NULL, DEFAULT: now()

### gyms
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- name: text, NOT NULL
- provider: text, NOT NULL
- provider_place_id: text, NULL
- address: text, NULL
- city: text, NULL
- country: text, NULL
- phone: text, NULL
- website: text, NULL
- tz: text, NULL
- location: geography, NOT NULL
- verified: bool, NULL, DEFAULT: false
- equipment_profile: jsonb, NULL, DEFAULT: '{}'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### handles
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- category: text, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### handle_translations
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- handle_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### idempotency_keys
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- key: text, NOT NULL
- operation_type: text, NOT NULL
- request_hash: text, NOT NULL
- response_data: jsonb, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- expires_at: timestamptz, NOT NULL, DEFAULT: (now() + '24:00:00'::interval)

### languages
- code: text, NOT NULL
- name: text, NOT NULL
- native_name: text, NOT NULL
- flag_emoji: text, NULL
- is_active: bool, NOT NULL, DEFAULT: true
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### life_categories
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NOT NULL
- display_order: int4, NOT NULL, DEFAULT: 0
- icon: text, NULL
- color: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### life_category_translations
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- category_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### life_subcategories
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- category_id: uuid, NOT NULL
- slug: text, NULL
- display_order: int4, NOT NULL, DEFAULT: 0
- default_pinned: bool, NULL, DEFAULT: false
- route_name: text, NULL, DEFAULT: 'SubcategoryPage'::text
- accent_color: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### life_subcategory_translations
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- subcategory_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### muscles
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- slug: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### muscles_translations
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- muscle_id: uuid, NOT NULL
- language_code: text, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### personal_records
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
- kind: text, NOT NULL
- value: numeric, NOT NULL
- unit: text, NOT NULL
- achieved_at: timestamptz, NOT NULL, DEFAULT: now()
- workout_set_id: uuid, NULL
- grip_key: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### readiness_checkins
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- workout_id: uuid, NULL
- energy: int2, NULL
- sleep_quality: int2, NULL
- sleep_hours: numeric, NULL
- soreness: int2, NULL
- stress: int2, NULL
- illness: bool, NULL
- alcohol: bool, NULL
- supplements: jsonb, NULL
- notes: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### spatial_ref_sys
- srid: int4, NOT NULL
- auth_name: varchar, NULL
- auth_srid: int4, NULL
- srtext: varchar, NULL
- proj4text: varchar, NULL

### template_exercise_grips
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_exercise_id: uuid, NOT NULL
- grip_id: uuid, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### template_exercise_handles
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_exercise_id: uuid, NOT NULL
- handle_id: uuid, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### template_exercises
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- template_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
- order_index: int4, NOT NULL, DEFAULT: 0
- default_sets: int2, NULL
- target_reps: int2, NULL
- target_weight: numeric, NULL
- weight_unit: text, NULL, DEFAULT: 'kg'::text
- notes: text, NULL
- target_settings: jsonb, NULL
- display_name: text, NULL
- grip_ids: _text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### text_translations
- key: text, NOT NULL
- language_code: text, NOT NULL
- value: text, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_achievements
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- achievement_id: uuid, NOT NULL
- earned_at: timestamptz, NOT NULL, DEFAULT: now()
- progress_value: numeric, NULL
- metadata: jsonb, NULL

### user_challenge_settings
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- notifications_enabled: bool, NOT NULL, DEFAULT: true
- auto_join_public: bool, NOT NULL, DEFAULT: false
- preferred_categories: jsonb, NULL, DEFAULT: '[]'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_exercise_stats
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
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

### user_gym_bars
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_gym_id: uuid, NOT NULL
- bar_type_id: uuid, NOT NULL
- weight: numeric, NULL
- unit: weight_unit, NOT NULL, DEFAULT: 'kg'::weight_unit
- is_default: bool, NOT NULL, DEFAULT: false
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### user_gym_miniweights
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_gym_id: uuid, NOT NULL
- weight: numeric, NOT NULL
- unit: weight_unit, NOT NULL, DEFAULT: 'kg'::weight_unit
- count: int4, NOT NULL, DEFAULT: 1
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### user_gym_plates
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_gym_id: uuid, NOT NULL
- weight: numeric, NOT NULL
- unit: weight_unit, NOT NULL, DEFAULT: 'kg'::weight_unit
- count: int4, NOT NULL, DEFAULT: 1
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### user_gyms
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- gym_id: uuid, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_language_preferences
- user_id: uuid, NOT NULL
- language_code: text, NOT NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_life_metrics
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- metric_def_id: uuid, NOT NULL
- value: jsonb, NOT NULL
- recorded_date: date, NOT NULL, DEFAULT: CURRENT_DATE
- notes: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()

### user_pinned_subcategories
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- subcategory_id: uuid, NOT NULL
- pinned_at: timestamptz, NOT NULL, DEFAULT: now()

### user_preference_nutrition
- user_id: uuid, NOT NULL
- target_calories: int4, NULL
- target_protein_g: int4, NULL
- target_carbs_g: int4, NULL
- target_fat_g: int4, NULL
- dietary_restrictions: jsonb, NULL, DEFAULT: '[]'::jsonb
- meal_timing_preference: text, NULL, DEFAULT: 'flexible'::text
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_preferences
- user_id: uuid, NOT NULL
- theme: text, NULL, DEFAULT: 'system'::text
- language: text, NULL, DEFAULT: 'en'::text
- timezone: text, NULL
- notifications_enabled: bool, NULL, DEFAULT: true
- privacy_level: text, NULL, DEFAULT: 'public'::text
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_profile_fitness
- user_id: uuid, NOT NULL
- experience_level_id: uuid, NULL
- primary_goals: jsonb, NULL, DEFAULT: '[]'::jsonb
- training_frequency: int2, NULL
- available_equipment: jsonb, NULL, DEFAULT: '[]'::jsonb
- injury_history: jsonb, NULL, DEFAULT: '[]'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_profile_general
- user_id: uuid, NOT NULL
- display_name: text, NULL
- bio: text, NULL
- avatar_url: text, NULL
- date_of_birth: date, NULL
- gender: text, NULL
- location: text, NULL
- website: text, NULL
- social_links: jsonb, NULL, DEFAULT: '{}'::jsonb
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_profile_physical
- user_id: uuid, NOT NULL
- height_cm: int2, NULL
- weight_kg: numeric, NULL
- body_fat_percentage: numeric, NULL
- activity_level: text, NULL
- dominant_hand: text, NULL, DEFAULT: 'right'::text
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_roles
- user_id: uuid, NOT NULL
- role: app_role, NOT NULL
- granted_at: timestamptz, NOT NULL, DEFAULT: now()
- granted_by: uuid, NULL

### user_weekly_goals
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- week_start: date, NOT NULL
- goal_type: text, NOT NULL
- target_value: numeric, NOT NULL
- current_value: numeric, NOT NULL, DEFAULT: 0
- target_unit: text, NULL
- is_completed: bool, NOT NULL, DEFAULT: false
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### user_workout_streaks
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- current_streak: int4, NOT NULL, DEFAULT: 0
- longest_streak: int4, NOT NULL, DEFAULT: 0
- last_workout_date: date, NULL
- streak_start_date: date, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### workout_exercises
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- workout_id: uuid, NOT NULL
- exercise_id: uuid, NOT NULL
- order_index: int4, NOT NULL, DEFAULT: 0
- notes: text, NULL
- warmup_plan: jsonb, NULL
- target_settings: jsonb, NULL
- display_name: text, NULL
- grip_key: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### workout_sets
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- workout_exercise_id: uuid, NOT NULL
- set_index: int4, NOT NULL
- set_kind: set_type, NOT NULL, DEFAULT: 'normal'::set_type
- weight: numeric, NULL
- reps: int2, NULL
- weight_unit: text, NULL, DEFAULT: 'kg'::text
- notes: text, NULL
- is_completed: bool, NOT NULL, DEFAULT: false
- completed_at: timestamptz, NULL
- rpe: int2, NULL
- rest_seconds: int4, NULL
- side: text, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### workout_templates
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- name: text, NOT NULL
- description: text, NULL
- notes: text, NULL
- is_public: bool, NOT NULL, DEFAULT: false
- tags: jsonb, NULL, DEFAULT: '[]'::jsonb
- estimated_duration_minutes: int4, NULL
- difficulty_level: int2, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()

### workouts
- id: uuid, NOT NULL, DEFAULT: gen_random_uuid()
- user_id: uuid, NOT NULL
- template_id: uuid, NULL
- name: text, NULL
- notes: text, NULL
- started_at: timestamptz, NOT NULL, DEFAULT: now()
- ended_at: timestamptz, NULL
- gym_id: uuid, NULL
- estimated_calories_burned: int4, NULL
- created_at: timestamptz, NOT NULL, DEFAULT: now()
- updated_at: timestamptz, NOT NULL, DEFAULT: now()