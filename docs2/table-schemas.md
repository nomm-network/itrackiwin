# Complete Database Table Schemas

## achievements
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **title**: `text` NOT NULL
- **description**: `text` NOT NULL
- **icon**: `text` NOT NULL
- **category**: `text` NOT NULL
- **points**: `integer` NOT NULL DEFAULT 0
- **criteria**: `jsonb` NOT NULL
- **is_active**: `boolean` NOT NULL DEFAULT true
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## admin_audit_log
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **action_type**: `text` NOT NULL
- **target_user_id**: `uuid` NULL
- **performed_by**: `uuid` NULL
- **details**: `jsonb` NULL DEFAULT '{}'::jsonb
- **ip_address**: `inet` NULL
- **user_agent**: `text` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## admin_check_rate_limit
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **user_id**: `uuid` NOT NULL
- **check_count**: `integer` NULL DEFAULT 1
- **window_start**: `timestamp with time zone` NOT NULL DEFAULT now()
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## admin_notifications
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **title**: `text` NOT NULL
- **message**: `text` NOT NULL
- **notification_type**: `text` NOT NULL DEFAULT 'info'::text
- **is_read**: `boolean` NOT NULL DEFAULT false
- **priority**: `integer` NOT NULL DEFAULT 1
- **expires_at**: `timestamp with time zone` NULL
- **metadata**: `jsonb` NULL DEFAULT '{}'::jsonb
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## ambassador_commission_accruals
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **agreement_id**: `uuid` NOT NULL
- **year**: `integer` NOT NULL
- **month**: `integer` NOT NULL
- **gross_revenue**: `numeric` NOT NULL DEFAULT 0
- **commission_due**: `numeric` NOT NULL DEFAULT 0
- **computed_at**: `timestamp with time zone` NULL DEFAULT now()

## ambassador_commission_agreements
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **ambassador_id**: `uuid` NOT NULL
- **gym_id**: `uuid` NOT NULL
- **battle_id**: `uuid` NOT NULL
- **tier**: `text` NOT NULL
- **percent**: `numeric` NOT NULL
- **starts_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **ends_at**: `timestamp with time zone` NULL
- **created_at**: `timestamp with time zone` NULL DEFAULT now()

## ambassador_gym_deals
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **ambassador_id**: `uuid` NOT NULL
- **gym_id**: `uuid` NOT NULL
- **battle_id**: `uuid` NOT NULL
- **status**: `text` NOT NULL DEFAULT 'pending_verification'::text
- **signed_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **verified_at**: `timestamp with time zone` NULL
- **verified_by**: `uuid` NULL
- **contract_url**: `text` NULL

## ambassador_gym_visits
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **ambassador_id**: `uuid` NOT NULL
- **gym_id**: `uuid` NOT NULL
- **visited_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **photo_url**: `text` NULL
- **notes**: `text` NULL

## ambassador_profiles
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **user_id**: `uuid` NOT NULL
- **status**: `text` NOT NULL DEFAULT 'eligible'::text
- **bio**: `text` NULL
- **created_at**: `timestamp with time zone` NULL DEFAULT now()

## app_flags
- **key**: `text` NOT NULL PRIMARY KEY
- **enabled**: `boolean` NULL DEFAULT false
- **created_at**: `timestamp with time zone` NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NULL DEFAULT now()

## attribute_schemas
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **scope**: `attr_scope` NOT NULL
- **scope_ref_id**: `uuid` NULL
- **title**: `text` NOT NULL
- **schema_json**: `jsonb` NOT NULL
- **version**: `integer` NOT NULL DEFAULT 1
- **is_active**: `boolean` NOT NULL DEFAULT true
- **visibility**: `text` NULL DEFAULT 'general'::text
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## auto_deload_triggers
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **user_id**: `uuid` NOT NULL
- **exercise_id**: `uuid` NOT NULL
- **trigger_type**: `text` NOT NULL
- **threshold_value**: `numeric` NULL
- **deload_percentage**: `numeric` NULL DEFAULT 10.0
- **is_triggered**: `boolean` NULL DEFAULT false
- **triggered_at**: `timestamp with time zone` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## bar_types
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **name**: `text` NOT NULL
- **default_weight**: `numeric` NOT NULL
- **unit**: `weight_unit` NOT NULL DEFAULT 'kg'::weight_unit

## battle_invitations
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **battle_id**: `uuid` NOT NULL
- **ambassador_id**: `uuid` NOT NULL
- **status**: `text` NOT NULL DEFAULT 'pending'::text
- **invited_at**: `timestamp with time zone` NULL DEFAULT now()
- **responded_at**: `timestamp with time zone` NULL

## battle_participants
- **battle_id**: `uuid` NOT NULL
- **ambassador_id**: `uuid` NOT NULL
- **joined_at**: `timestamp with time zone` NULL DEFAULT now()

## battles
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **name**: `text` NOT NULL
- **city_id**: `uuid` NOT NULL
- **status**: `text` NOT NULL DEFAULT 'draft'::text
- **starts_at**: `timestamp with time zone` NOT NULL
- **ends_at**: `timestamp with time zone` NOT NULL
- **max_participants**: `integer` NOT NULL DEFAULT 10
- **target_win_deals**: `integer` NOT NULL DEFAULT 2
- **created_at**: `timestamp with time zone` NULL DEFAULT now()

## body_parts
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **slug**: `text` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## body_parts_translations
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **body_part_id**: `uuid` NOT NULL
- **language_code**: `text` NOT NULL
- **name**: `text` NOT NULL
- **description**: `text` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## carousel_images
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **title**: `text` NOT NULL
- **alt_text**: `text` NOT NULL
- **file_path**: `text` NOT NULL
- **file_url**: `text` NOT NULL
- **order_index**: `integer` NOT NULL DEFAULT 1
- **is_active**: `boolean` NOT NULL DEFAULT true
- **created_by**: `uuid` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## challenge_participants
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **challenge_id**: `uuid` NOT NULL
- **user_id**: `uuid` NOT NULL
- **joined_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **current_value**: `numeric` NULL DEFAULT 0

## challenges
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **title**: `text` NOT NULL
- **description**: `text` NULL
- **challenge_type**: `text` NOT NULL
- **creator_id**: `uuid` NOT NULL
- **target_value**: `numeric` NOT NULL
- **target_unit**: `text` NULL
- **start_date**: `date` NOT NULL
- **end_date**: `date` NOT NULL
- **is_public**: `boolean` NULL DEFAULT true
- **participants_count**: `integer` NULL DEFAULT 0
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## cities
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **city**: `text` NOT NULL
- **country**: `text` NOT NULL
- **region**: `text` NULL
- **slug**: `text` NULL
- **created_at**: `timestamp with time zone` NULL DEFAULT now()

## coach_assigned_templates
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **mentorship_id**: `uuid` NOT NULL
- **template_id**: `uuid` NOT NULL
- **is_linked**: `boolean` NOT NULL DEFAULT true
- **assigned_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## coach_client_links
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **coach_user_id**: `uuid` NOT NULL
- **client_user_id**: `uuid` NOT NULL
- **status**: `text` NOT NULL DEFAULT 'pending'::text
- **requested_by**: `uuid` NOT NULL
- **decided_by**: `uuid` NULL
- **decided_at**: `timestamp with time zone` NULL
- **gym_id**: `uuid` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## coach_logs
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **user_id**: `uuid` NOT NULL
- **function_name**: `text` NOT NULL
- **step**: `text` NOT NULL
- **inputs**: `jsonb` NOT NULL DEFAULT '{}'::jsonb
- **outputs**: `jsonb` NOT NULL DEFAULT '{}'::jsonb
- **success**: `boolean` NOT NULL DEFAULT true
- **error_message**: `text` NULL
- **execution_time_ms**: `integer` NULL
- **session_id**: `uuid` NULL
- **metadata**: `jsonb` NULL DEFAULT '{}'::jsonb
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## coach_subscriptions
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **user_id**: `uuid` NOT NULL
- **coach_id**: `uuid` NOT NULL
- **status**: `subscription_status` NOT NULL DEFAULT 'active'::subscription_status
- **starts_at**: `timestamp with time zone` NULL DEFAULT now()
- **ends_at**: `timestamp with time zone` NULL

## coaches
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **name**: `text` NOT NULL
- **display_name**: `text` NOT NULL
- **type**: `coach_type` NOT NULL DEFAULT 'ai'::coach_type
- **category_id**: `uuid` NULL
- **price_cents**: `integer` NULL DEFAULT 0
- **is_active**: `boolean` NULL DEFAULT true
- **is_default**: `boolean` NULL DEFAULT false
- **avatar_url**: `text` NULL

## cycle_events
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **user_id**: `uuid` NOT NULL
- **event_date**: `date` NOT NULL
- **kind**: `text` NOT NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## data_quality_reports
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **report_type**: `text` NOT NULL DEFAULT 'scheduled'::text
- **total_exercises**: `integer` NOT NULL DEFAULT 0
- **exercises_with_primary_muscle**: `integer` NOT NULL DEFAULT 0
- **exercises_with_movement_pattern**: `integer` NOT NULL DEFAULT 0
- **exercises_with_equipment_constraints**: `integer` NOT NULL DEFAULT 0
- **primary_muscle_coverage_pct**: `numeric` NOT NULL DEFAULT 0
- **movement_pattern_coverage_pct**: `numeric` NOT NULL DEFAULT 0
- **equipment_constraints_coverage_pct**: `numeric` NOT NULL DEFAULT 0
- **issues_found**: `jsonb` NOT NULL DEFAULT '[]'::jsonb
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## dumbbell_sets
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **name**: `text` NOT NULL
- **min_kg**: `numeric` NOT NULL
- **max_kg**: `numeric` NOT NULL
- **step_kg**: `numeric` NOT NULL
- **default_unit**: `weight_unit` NOT NULL DEFAULT 'kg'::weight_unit
- **notes**: `text` NULL
- **is_active**: `boolean` NOT NULL DEFAULT true
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## equipment
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **slug**: `text` NULL
- **equipment_type**: `text` NOT NULL DEFAULT 'machine'::text
- **kind**: `text` NULL
- **weight_kg**: `numeric` NULL
- **load_type**: `load_type` NULL DEFAULT 'none'::load_type
- **load_medium**: `load_medium` NULL DEFAULT 'other'::load_medium
- **default_bar_weight_kg**: `numeric` NULL
- **default_side_min_plate_kg**: `numeric` NULL
- **default_single_min_increment_kg**: `numeric` NULL
- **default_stack_weights**: `numeric[]` NULL DEFAULT '{}'::numeric[]
- **default_stack_unit**: `weight_unit` NULL DEFAULT 'kg'::weight_unit
- **default_stack**: `jsonb` NULL DEFAULT '[]'::jsonb
- **configured**: `boolean` NOT NULL DEFAULT false
- **notes**: `text` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## equipment_defaults
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **slug**: `text` NOT NULL
- **display_name**: `text` NOT NULL
- **loading_mode**: `text` NOT NULL
- **base_implement_kg**: `numeric` NULL DEFAULT 0
- **plate_denoms_kg**: `numeric[]` NULL DEFAULT '{25,20,15,10,5,2.5,1.25,0.5}'::numeric[]
- **stack_min_kg**: `numeric` NULL DEFAULT 5
- **stack_max_kg**: `numeric` NULL DEFAULT 120
- **stack_increment_kg**: `numeric` NULL DEFAULT 5
- **fixed_increment_kg**: `numeric` NULL DEFAULT 2.5
- **notes**: `text` NULL
- **created_at**: `timestamp with time zone` NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NULL DEFAULT now()

## equipment_grip_defaults
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **equipment_id**: `uuid` NOT NULL
- **grip_id**: `uuid` NOT NULL
- **handle_id**: `uuid` NULL
- **is_default**: `boolean` NOT NULL DEFAULT false
- **created_at**: `timestamp with time zone` NULL DEFAULT now()

## equipment_handle_orientations
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **equipment_id**: `uuid` NOT NULL
- **handle_id**: `uuid` NOT NULL
- **orientation**: `orientation` NOT NULL
- **is_default**: `boolean` NOT NULL DEFAULT false
- **created_at**: `timestamp with time zone` NULL DEFAULT now()

## equipment_profiles
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **equipment_id**: `uuid` NOT NULL
- **profile_type**: `text` NOT NULL
- **profile_id**: `uuid` NOT NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## equipment_translations
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **equipment_id**: `uuid` NOT NULL
- **language_code**: `text` NOT NULL
- **name**: `text` NOT NULL
- **description**: `text` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## exercise_aliases
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **exercise_id**: `uuid` NOT NULL
- **alias**: `text` NOT NULL
- **language_code**: `text` NULL DEFAULT 'en'::text
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## exercise_candidates
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **proposed_name**: `text` NOT NULL
- **primary_muscle**: `text` NULL
- **secondary_muscles**: `text[]` NULL
- **equipment_id**: `uuid` NULL
- **status**: `text` NOT NULL DEFAULT 'pending'::text
- **created_by**: `uuid` NULL
- **created_at**: `timestamp with time zone` NULL DEFAULT now()

## exercise_default_grips
- **exercise_id**: `uuid` NOT NULL
- **grip_id**: `uuid` NOT NULL
- **order_index**: `integer` NOT NULL DEFAULT 1

## exercise_equipment_profiles
- **exercise_id**: `uuid` NOT NULL
- **equipment_slug**: `text` NOT NULL
- **default_bar_weight_kg**: `numeric` NULL DEFAULT 20.0
- **default_entry_mode**: `text` NULL DEFAULT 'per_side'::text
- **plate_profile_id**: `uuid` NULL
- **is_active**: `boolean` NULL DEFAULT true
- **created_at**: `timestamp with time zone` NULL DEFAULT now()
- **updated_at**: `timestamp with time zone` NULL DEFAULT now()

## exercise_equipment_variants
- **exercise_id**: `uuid` NOT NULL
- **equipment_id**: `uuid` NOT NULL
- **is_preferred**: `boolean` NOT NULL DEFAULT false

## exercise_grip_effects
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **exercise_id**: `uuid` NOT NULL
- **grip_id**: `uuid` NOT NULL
- **muscle_id**: `uuid` NOT NULL
- **effect_pct**: `numeric` NOT NULL
- **is_primary_override**: `boolean` NOT NULL DEFAULT false
- **equipment_id**: `uuid` NULL
- **note**: `text` NULL
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## exercise_grips
- **exercise_id**: `uuid` NOT NULL
- **grip_id**: `uuid` NOT NULL
- **is_default**: `boolean` NOT NULL DEFAULT false
- **order_index**: `integer` NOT NULL DEFAULT 1
- **created_at**: `timestamp with time zone` NOT NULL DEFAULT now()

## exercise_handle_orientations
- **id**: `uuid` NOT NULL DEFAULT gen_random_uuid()
- **exercise_id**: `uuid` NOT NULL
- **handle_id**: `uuid` NOT NULL
- **orientation**: `orientation` NOT NULL
- **is_default**: `boolean` NOT NULL DEFAULT false
- **created_at**: `timestamp with time zone` NULL DEFAULT now()

[Continuing with remaining tables...]