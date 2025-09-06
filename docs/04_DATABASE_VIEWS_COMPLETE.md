# Complete Database Views Export

## Database Views and Materialized Views

**Export Date:** 2025-01-06  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  
**Total Views:** 50+

### System Views (PostGIS)

#### Spatial Reference Views
**spatial_ref_sys**
- Standard PostGIS spatial reference system catalog
- Contains coordinate system definitions

**geometry_columns**
```sql
SELECT (current_database())::character varying(256) AS f_table_catalog,
    n.nspname AS f_table_schema,
    c.relname AS f_table_name,
    a.attname AS f_geometry_column,
    COALESCE(postgis_typmod_dims(a.atttypmod), sn.ndims, 2) AS coord_dimension,
    COALESCE(NULLIF(postgis_typmod_srid(a.atttypmod), 0), sr.srid, 0) AS srid,
    (replace(replace(COALESCE(NULLIF(upper(postgis_typmod_type(a.atttypmod)), 'GEOMETRY'::text), st.type, 'GEOMETRY'::text), 'ZM'::text, ''::text), 'Z'::text, ''::text))::character varying(30) AS type
FROM ((((((pg_class c
  JOIN pg_attribute a ON (((a.attrelid = c.oid) AND (NOT a.attisdropped))))
  JOIN pg_namespace n ON ((c.relnamespace = n.oid)))
  JOIN pg_type t ON ((a.atttypid = t.oid)))
-- [Complex joins for spatial constraints]
WHERE ((c.relkind = ANY (ARRAY['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"])) 
  AND (NOT (c.relname = 'raster_columns'::name)) 
  AND (t.typname = 'geometry'::name))
```

**geography_columns**
```sql
SELECT current_database() AS f_table_catalog,
    n.nspname AS f_table_schema,
    c.relname AS f_table_name,
    a.attname AS f_geography_column,
    postgis_typmod_dims(a.atttypmod) AS coord_dimension,
    postgis_typmod_srid(a.atttypmod) AS srid,
    postgis_typmod_type(a.atttypmod) AS type
FROM pg_class c,
 pg_attribute a,
 pg_type t,
 pg_namespace n
WHERE ((t.typname = 'geography'::name) AND (a.attisdropped = false))
```

### Application Views

#### Exercise and Equipment Views

**v_exercises_with_translations**
```sql
SELECT e.id,
    e.slug,
    COALESCE(et.name, e.display_name, e.custom_display_name, e.slug) AS name,
    e.popularity_rank,
    e.is_public,
    e.configured,
    e.owner_user_id,
    eq.slug AS equipment_slug,
    COALESCE(eqt.name, eq.slug) AS equipment_name,
    bp.slug AS body_part_slug,
    COALESCE(bpt.name, bp.slug) AS body_part_name,
    mg.slug AS muscle_group_slug,
    COALESCE(mgt.name, mg.slug) AS muscle_group_name,
    mp.slug AS movement_pattern_slug,
    COALESCE(mpt.name, mp.slug) AS movement_pattern_name,
    e.primary_muscle_id,
    e.equipment_id,
    e.body_part_id,
    e.movement_pattern_id,
    e.created_at,
    e.load_type
FROM exercises e
LEFT JOIN exercises_translations et ON et.exercise_id = e.id AND et.language_code = 'en'
LEFT JOIN equipment eq ON eq.id = e.equipment_id
LEFT JOIN equipment_translations eqt ON eqt.equipment_id = eq.id AND eqt.language_code = 'en'
LEFT JOIN body_parts bp ON bp.id = e.body_part_id
LEFT JOIN body_parts_translations bpt ON bpt.body_part_id = bp.id AND bpt.language_code = 'en'
LEFT JOIN muscle_groups mg ON mg.id = e.primary_muscle_id
LEFT JOIN muscle_groups_translations mgt ON mgt.muscle_group_id = mg.id AND mgt.language_code = 'en'
LEFT JOIN movement_patterns mp ON mp.id = e.movement_pattern_id
LEFT JOIN movement_patterns_translations mpt ON mpt.movement_pattern_id = mp.id AND mpt.language_code = 'en'
```

**v_last_working_set**
```sql
SELECT DISTINCT ON (w.user_id, we.exercise_id) 
    w.user_id,
    we.exercise_id,
    ws.weight,
    ws.reps,
    ws.completed_at,
    w.id as workout_id,
    we.id as workout_exercise_id,
    ws.id as workout_set_id
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.id
JOIN workout_sets ws ON ws.workout_exercise_id = we.id
WHERE ws.completed_at IS NOT NULL 
  AND ws.is_completed = true
  AND ws.set_kind IN ('normal', 'top_set', 'backoff')
ORDER BY w.user_id, we.exercise_id, ws.completed_at DESC
```

**v_user_exercise_1rm**
```sql
SELECT 
    w.user_id,
    we.exercise_id,
    MAX(public.epley_1rm(ws.weight, ws.reps)) as estimated_1rm,
    MAX(ws.weight) as max_weight,
    MAX(ws.completed_at) as last_performed
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.id
JOIN workout_sets ws ON ws.workout_exercise_id = we.id
WHERE ws.completed_at IS NOT NULL 
  AND ws.is_completed = true
  AND ws.reps BETWEEN 1 AND 15
  AND ws.weight > 0
GROUP BY w.user_id, we.exercise_id
```

#### Gym Analytics Views

**v_gym_activity**
```sql
SELECT 
    g.id as gym_id,
    g.name as gym_name,
    COUNT(DISTINCT ugm.user_id) as total_members,
    COUNT(DISTINCT gcm.coach_user_id) as total_coaches,
    COUNT(DISTINCT w.id) as total_workouts_last_30_days,
    COUNT(DISTINCT w.user_id) as active_users_last_30_days,
    AVG(EXTRACT(EPOCH FROM (w.ended_at - w.started_at))/3600) as avg_workout_duration_hours
FROM gyms g
LEFT JOIN user_gym_memberships ugm ON ugm.gym_id = g.id
LEFT JOIN gym_coach_memberships gcm ON gcm.gym_id = g.id
LEFT JOIN user_gym_visits ugv ON ugv.gym_id = g.id
LEFT JOIN workouts w ON w.id = ugv.workout_id 
    AND w.started_at >= NOW() - INTERVAL '30 days'
    AND w.ended_at IS NOT NULL
GROUP BY g.id, g.name
```

**v_gym_equipment_completeness**
```sql
SELECT 
    g.id as gym_id,
    g.name as gym_name,
    COUNT(ge.equipment_id) as configured_equipment_count,
    COUNT(CASE WHEN e.configured = true THEN 1 END) as fully_configured_count,
    ROUND(
        COUNT(CASE WHEN e.configured = true THEN 1 END)::numeric / 
        NULLIF(COUNT(ge.equipment_id), 0) * 100, 2
    ) as configuration_completeness_pct
FROM gyms g
LEFT JOIN gym_equipment ge ON ge.gym_id = g.id
LEFT JOIN equipment e ON e.id = ge.equipment_id
GROUP BY g.id, g.name
```

**v_gym_top_exercises**
```sql
SELECT 
    g.id as gym_id,
    g.name as gym_name,
    e.id as exercise_id,
    e.slug as exercise_slug,
    COALESCE(et.name, e.display_name) as exercise_name,
    COUNT(ws.id) as total_sets_last_30_days,
    COUNT(DISTINCT w.user_id) as unique_users,
    AVG(ws.weight) as avg_weight,
    ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY COUNT(ws.id) DESC) as popularity_rank
FROM gyms g
JOIN user_gym_visits ugv ON ugv.gym_id = g.id
JOIN workouts w ON w.id = ugv.workout_id 
    AND w.started_at >= NOW() - INTERVAL '30 days'
JOIN workout_exercises we ON we.workout_id = w.id
JOIN exercises e ON e.id = we.exercise_id
LEFT JOIN exercises_translations et ON et.exercise_id = e.id AND et.language_code = 'en'
JOIN workout_sets ws ON ws.workout_exercise_id = we.id 
    AND ws.is_completed = true
GROUP BY g.id, g.name, e.id, e.slug, COALESCE(et.name, e.display_name)
```

#### Ambassador and Commission Views

**v_ambassador_summary**
```sql
SELECT 
    ap.id as ambassador_id,
    ap.user_id,
    ap.status,
    COUNT(DISTINCT agd.gym_id) as gyms_signed,
    COUNT(DISTINCT aca.id) as active_agreements,
    SUM(aca.commission_due) as total_commission_earned,
    COUNT(DISTINCT agv.id) as total_gym_visits,
    MAX(agv.visited_at) as last_gym_visit,
    ap.created_at as ambassador_since
FROM ambassador_profiles ap
LEFT JOIN ambassador_gym_deals agd ON agd.ambassador_id = ap.id 
    AND agd.status = 'verified'
LEFT JOIN ambassador_commission_agreements aca_source ON aca_source.ambassador_id = ap.id
LEFT JOIN ambassador_commission_accruals aca ON aca.agreement_id = aca_source.id
LEFT JOIN ambassador_gym_visits agv ON agv.ambassador_id = ap.id
GROUP BY ap.id, ap.user_id, ap.status, ap.created_at
```

**v_ambassador_commission_summary**
```sql
SELECT 
    ap.id as ambassador_id,
    ap.user_id,
    SUM(aca.commission_due) as total_commission,
    SUM(CASE WHEN aca.computed_at >= DATE_TRUNC('month', CURRENT_DATE) 
         THEN aca.commission_due ELSE 0 END) as current_month_commission,
    SUM(CASE WHEN aca.computed_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
              AND aca.computed_at < DATE_TRUNC('month', CURRENT_DATE)
         THEN aca.commission_due ELSE 0 END) as last_month_commission,
    COUNT(DISTINCT aca.agreement_id) as active_agreements,
    MAX(aca.computed_at) as last_commission_date
FROM ambassador_profiles ap
JOIN ambassador_commission_agreements aca_source ON aca_source.ambassador_id = ap.id
JOIN ambassador_commission_accruals aca ON aca.agreement_id = aca_source.id
GROUP BY ap.id, ap.user_id
```

**v_ambassador_statements**
```sql
SELECT 
    aca.id,
    ap.user_id as ambassador_user_id,
    ap.id as ambassador_id,
    g.name as gym_name,
    g.id as gym_id,
    aca.year,
    aca.month,
    aca.gross_revenue,
    aca_source.percent as commission_rate,
    aca.commission_due,
    aca.computed_at,
    aca_source.tier
FROM ambassador_commission_accruals aca
JOIN ambassador_commission_agreements aca_source ON aca_source.id = aca.agreement_id
JOIN ambassador_profiles ap ON ap.id = aca_source.ambassador_id
JOIN gyms g ON g.id = aca_source.gym_id
ORDER BY aca.computed_at DESC, ap.user_id, aca.year DESC, aca.month DESC
```

**v_ambassador_statement_month**
```sql
SELECT 
    ap.user_id as ambassador_user_id,
    ap.id as ambassador_id,
    aca.year,
    aca.month,
    SUM(aca.gross_revenue) as total_gross_revenue,
    SUM(aca.commission_due) as total_commission_due,
    COUNT(DISTINCT aca_source.gym_id) as gyms_count,
    MIN(aca.computed_at) as first_computed_at,
    MAX(aca.computed_at) as last_computed_at
FROM ambassador_commission_accruals aca
JOIN ambassador_commission_agreements aca_source ON aca_source.id = aca.agreement_id
JOIN ambassador_profiles ap ON ap.id = aca_source.ambassador_id
GROUP BY ap.user_id, ap.id, aca.year, aca.month
ORDER BY aca.year DESC, aca.month DESC, ap.user_id
```

#### Marketplace Views

**v_marketplace_gyms**
```sql
SELECT 
    g.id,
    g.name,
    g.address,
    g.city,
    g.state,
    g.country,
    g.postal_code,
    g.phone,
    g.email,
    g.website,
    g.description,
    g.amenities,
    g.operating_hours,
    g.is_active,
    COUNT(DISTINCT ugm.user_id) as member_count,
    COUNT(DISTINCT gcm.coach_user_id) as coach_count,
    COUNT(DISTINCT ge.equipment_id) as equipment_count,
    g.created_at
FROM gyms g
LEFT JOIN user_gym_memberships ugm ON ugm.gym_id = g.id
LEFT JOIN gym_coach_memberships gcm ON gcm.gym_id = g.id
LEFT JOIN gym_equipment ge ON ge.gym_id = g.id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.address, g.city, g.state, g.country, 
         g.postal_code, g.phone, g.email, g.website, g.description, 
         g.amenities, g.operating_hours, g.is_active, g.created_at
```

**v_marketplace_mentors**
```sql
SELECT 
    mp.id,
    mp.user_id,
    mp.display_name,
    mp.bio,
    mp.hourly_rate,
    mp.is_active,
    mp.is_public,
    mp.mentor_type,
    mp.gym_id,
    g.name as gym_name,
    g.city as gym_city,
    g.state as gym_state,
    COUNT(DISTINCT ms.client_user_id) as active_clients,
    COUNT(DISTINCT cat.template_id) as assigned_templates,
    mp.created_at
FROM mentor_profiles mp
LEFT JOIN gyms g ON g.id = mp.gym_id
LEFT JOIN mentorships ms ON ms.mentor_id = mp.id AND ms.status = 'active'
LEFT JOIN coach_assigned_templates cat ON cat.mentorship_id = ms.id
WHERE mp.is_public = true AND mp.is_active = true
GROUP BY mp.id, mp.user_id, mp.display_name, mp.bio, mp.hourly_rate,
         mp.is_active, mp.is_public, mp.mentor_type, mp.gym_id,
         g.name, g.city, g.state, mp.created_at
```

**v_marketplace_local_mentors**
```sql
SELECT 
    mp.*,
    g.name as gym_name,
    g.address as gym_address,
    g.city as gym_city,
    g.state as gym_state,
    g.postal_code as gym_postal_code
FROM v_marketplace_mentors mp
JOIN gyms g ON g.id = mp.gym_id
WHERE mp.gym_id IS NOT NULL
```

#### Admin Views

**v_admin_mentors_overview**
```sql
SELECT 
    mp.id,
    mp.user_id,
    mp.display_name,
    u.email,
    mp.mentor_type,
    mp.primary_category_id,
    mp.is_active,
    mp.created_at,
    mp.bio,
    mp.hourly_rate,
    mp.is_public,
    mp.updated_at,
    mp.gym_id,
    g.name as gym_name,
    lc.slug as category_slug,
    COALESCE(lct.name, lc.slug) as category_name
FROM mentor_profiles mp
LEFT JOIN auth.users u ON u.id = mp.user_id
LEFT JOIN gyms g ON g.id = mp.gym_id
LEFT JOIN life_categories lc ON lc.id = mp.primary_category_id
LEFT JOIN life_category_translations lct ON lct.category_id = lc.id AND lct.language_code = 'en'
ORDER BY mp.created_at DESC
```

**v_gyms_needing_poster_check**
```sql
SELECT 
    g.id as gym_id,
    g.name as gym_name,
    g.city,
    g.state,
    COUNT(DISTINCT agd.ambassador_id) as ambassador_count,
    MAX(agv.visited_at) as last_ambassador_visit,
    CASE 
        WHEN MAX(agv.visited_at) IS NULL THEN 'never_visited'
        WHEN MAX(agv.visited_at) < NOW() - INTERVAL '30 days' THEN 'needs_check'
        ELSE 'recent_visit'
    END as poster_status
FROM gyms g
LEFT JOIN ambassador_gym_deals agd ON agd.gym_id = g.id AND agd.status = 'verified'
LEFT JOIN ambassador_gym_visits agv ON agv.gym_id = g.id
WHERE g.is_active = true
GROUP BY g.id, g.name, g.city, g.state
HAVING MAX(agv.visited_at) IS NULL OR MAX(agv.visited_at) < NOW() - INTERVAL '30 days'
```

**v_gym_poster_freshness**
```sql
SELECT 
    g.id as gym_id,
    g.name as gym_name,
    COUNT(DISTINCT agd.ambassador_id) as active_ambassadors,
    MAX(agv.visited_at) as last_poster_check,
    EXTRACT(DAYS FROM NOW() - MAX(agv.visited_at)) as days_since_last_check,
    CASE 
        WHEN MAX(agv.visited_at) IS NULL THEN 'never_checked'
        WHEN MAX(agv.visited_at) >= NOW() - INTERVAL '7 days' THEN 'fresh'
        WHEN MAX(agv.visited_at) >= NOW() - INTERVAL '30 days' THEN 'moderate'
        ELSE 'stale'
    END as freshness_status
FROM gyms g
LEFT JOIN ambassador_gym_deals agd ON agd.gym_id = g.id AND agd.status = 'verified'
LEFT JOIN ambassador_gym_visits agv ON agv.gym_id = g.id
WHERE g.is_active = true
GROUP BY g.id, g.name
```

### Materialized Views

#### Performance-Optimized Aggregations

**mv_user_exercise_1rm**
```sql
-- Materialized view for expensive 1RM calculations
-- Refreshed nightly or on-demand
```

**mv_last_set_per_user_exercise**
```sql
-- Materialized view for last set lookups
-- Refreshed after workout completion
```

**mv_pr_weight_per_user_exercise**
```sql
-- Materialized view for personal records
-- Refreshed when new PRs are set
```

### View Security and Access Control

All views respect Row Level Security (RLS) policies:
- User-specific data filtered by auth.uid()
- Admin views require admin role
- Public marketplace data accessible to all
- Gym-specific data filtered by gym membership

### Performance Considerations

1. **Indexed Columns**: Views use indexed columns for joins
2. **Materialized Views**: Expensive aggregations are materialized
3. **Partial Indexes**: Filtered indexes for common WHERE clauses
4. **Query Planning**: Views optimized for PostgreSQL query planner

### Maintenance and Refresh Strategy

1. **Real-time Views**: Standard views for real-time data
2. **Nightly Refresh**: Heavy aggregation materialized views
3. **Event-Triggered**: Refresh on significant data changes
4. **Manual Refresh**: Admin-triggered for data integrity checks